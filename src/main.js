import { Atlas, readJSON, loadImage } from './atlas.js';
import { BoardModel, squareAt, squarePosition } from './model.js';
import { Character, continuousTravel, drawCharacter } from './character.js';
import { DrawingSequence } from './ink.js';
import { PaperMotion } from './paper-motion.js';
import { IllustratedControl } from './illustrated-control.js';
import { SketchLink } from './sketch-link.js';
import { SketchAudio, SketchFeedback } from './feedback.js';
import { TravelTrail } from '../primitives/residue.js';

const canvas = document.querySelector('#scene');
const ctx = canvas.getContext('2d');
const $ = id => document.getElementById(id);
for (const button of document.querySelectorAll('.toolbar button')) button.disabled = true;
const groundScale = Math.sin(56 * Math.PI / 180);
const kinds = ['rook', 'knight', 'bishop', 'queen', 'king', 'pawn'];
const names = {
  'w-pawn': ['toadstool sprout', 'cap spring'], 'b-pawn': ['little star bell', 'hanging bell'],
  'w-knight': ['sunrise pony', 'mane & tail'], 'b-knight': ['moonlit unicorn', 'ears & mane'],
  'w-bishop': ['leaf little one', 'leaf cap'], 'b-bishop': ['sleepy wizard', 'hat & cloak'],
  'w-rook': ['castle stump', 'growing leaves'], 'b-rook': ['blue little fort', 'bouncing & waving'],
  'w-queen': ['royal honeybee', 'wings & antennae'], 'b-queen': ['moonlit peacock', 'feather crown'],
  'w-king': ['the owl king', 'crown & leaves'], 'b-king': ['the tiny whale', 'waves & tail'],
};
let cast, board, markers, world, lettering, paper, layout, worldIndex;
let model, selected = null, hovered = null, hoverSquare = null, press = null, drag = null;
let keyboardSquare = 19, keyboardActive = false, pointer = null;
let time = 0, previous = 0, frameSamples = [], drawSamples = [], lastMeter = 0;
let view = { width: 0, height: 0, unit: 1, x: 0, y: 0, dpr: 1 };
let background, inkBackground, trails = [], soundEnabled = localStorage.getItem('ballpoint-sound') !== 'off';
let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let paused = false, raf = 0;
const paperMotion = new PaperMotion(), opening = new DrawingSequence({ reduced });
const audio = new SketchAudio({ enabled: soundEnabled });
let feedback, controls = [], wasInteractive = false;

function options(piece, extra = {}) {
  return { side: piece.side, seed: piece.seed, reduced, strength: 1, from: [-1, 0], facing: 1, off: [0, 0], dist: 1, ...extra };
}
function say(text) { $('announcement').textContent = text; }
function tone(kind = 'tick') {
  audio.play(kind, { pan: selected ? selected.puppet.ground()[0] / 5 : 0, pitch: selected ? selected.seed % 7 - 3 : 0 });
}
function detail(piece, action = 'idle') {
  if (!piece) {
    $('cast-name').textContent = 'select a character';
    $('cast-detail').textContent = '';
    $('part-count').textContent = '—'; $('cast-number').textContent = '12';
  } else {
    $('cast-name').textContent = names[piece.id][0]; $('cast-detail').textContent = names[piece.id][1];
    $('part-count').textContent = String(Object.keys(piece.puppet.rig.parts).length);
    $('cast-number').textContent = piece.side === 'w' ? 'SUNRISE' : 'DUSK';
  }
  const labels = { idle: 'idle', hover: 'greeting', select: 'selected', move: 'moving', victory: 'celebrating', napping: 'sleeping', gag: 'playing', refuse: 'occupied' };
  $('motion-name').textContent = labels[action] || action;
}
function clearHover() {
  if (hovered) hovered.puppet.clear('hover', .12);
  hovered = null;
}
function deselect() {
  if (selected) {
    selected.puppet.clear('select', .15);
    if (!selected.moving && !selected.sleeping) selected.puppet.play(selected.animator.deselect(options(selected)), { layer: 'reaction', fade: .08 });
  }
  selected = null; clearHover(); detail(null); say('已取消选中');
}
function select(piece) {
  if (piece.moving) return;
  if (selected && selected !== piece) deselect();
  clearHover();
  selected = piece;
  if (piece.sleeping) { piece.puppet.clear('sleep', .16); piece.sleeping = false; }
  piece.puppet.clear('reaction', .1);
  piece.puppet.play(piece.animator.select(options(piece)), { layer: 'select', fade: .12 });
  detail(piece, 'select'); say(`选中${names[piece.id][1]}。点击空格或拖动来移动。`); tone();
}
function onCue(piece, event) {
  feedback?.cue(event, { seed: piece.seed, reduced });
}
function makeCast() {
  selected = hovered = null; feedback?.clear(); trails = []; press = drag = null;
  opening.restart(reduced); wasInteractive = false;
  const pieces = [];
  for (const [side, row] of [['w', 1], ['b', 6]]) {
    for (let i = 0; i < kinds.length; i++) {
      const kind = kinds[i], id = `${side}-${kind}`, rig = layout.rigs[id];
      const seed = 127 + i * 113 + (side === 'b' ? 1000 : 0), square = i + 1 + row * 8;
      const [x, y] = squarePosition(square);
      const piece = new Character(rig, { seed, x, y }), puppet = piece.puppet;
      piece.square = square;
      puppet.onEvent(event => onCue(piece, event));
      piece.revealStart = reduced ? 0 : 1.9 + (side === 'b' ? .28 : 0) + i * .065;
      if (!reduced) puppet.play(piece.animator.entrance(piece.revealStart + .55, options(piece)), { layer: 'entrance' });
      pieces.push(piece);
    }
  }
  model = new BoardModel(pieces); $('undo').disabled = true; detail(null); say('十二个角色已重新画好。');
}
function replayDrawing() {
  if (model.pieces.some(p => p.moving)) return;
  deselect(); feedback.clear(); trails = []; opening.restart(reduced); wasInteractive = false;
  for (const piece of model.pieces) {
    piece.puppet.cancelAll(0); piece.sleeping = false;
    // Keep existing positions, and replay the ink before their small entrance.
    if (!reduced) piece.puppet.play(piece.animator.entrance(piece.revealStart + .55, options(piece)), { layer: 'entrance' });
  }
  say('重新播放纸上的绘画过程。');
}
function movePiece(piece, target, undo = false) {
  if (piece.moving || target == null || target === piece.square) return false;
  const occupant = model.at(target);
  if (occupant) {
    piece.puppet.play(piece.animator.refuse(options(piece)), { layer: 'reaction' });
    detail(piece, 'refuse'); say('这格已经有一个小生命，请选择空格。'); return false;
  }
  const change = undo ? { id: piece.id, from: piece.square, to: target } : model.move(piece.id, target);
  if (!change) return false;
  piece.square = target;
  const from = squarePosition(change.from), to = squarePosition(target);
  const off = [from[0] - to[0], from[1] - to[1]];
  piece.puppet.clear('select', 0); piece.puppet.clear('hover', 0); piece.puppet.clear('reaction', 0); piece.puppet.clear('sleep', 0);
  piece.sleeping = false; piece.moving = true;
  const originalClip = piece.animator.move(options(piece, { off, dist: Math.hypot(...off), facing: Math.sign(-off[0]), from, to }));
  // Keep hand-drawn body poses at 12 Hz while sampling travel every frame.
  // A large free move would otherwise advance in visibly stepped positions.
  const clip = continuousTravel(originalClip);
  piece.puppet.timeline.quantizeFps = 0;
  // Reference clips store travel as an offset relative to the destination.
  piece.puppet.relocate(...to);
  piece.puppet.play(clip, { layer: 'move', fade: 0, onEnd: () => {
    piece.moving = false; piece.puppet.timeline.quantizeFps = 12;
    if (selected === piece) { piece.puppet.play(piece.animator.select(options(piece)), { layer: 'select', fade: .14 }); detail(piece, 'select'); }
  } });
  piece.puppet.refresh();
  trails.push({ from, to, birth: time, side: piece.side, pieceId: piece.id, line: new TravelTrail(from, to, { spacing: .34, life: 1.15 }), arrived: null });
  detail(piece, 'move'); say(`${names[piece.id][0]} 移动到了 ${String.fromCharCode(97 + target % 8)}${Math.floor(target / 8) + 1}`);
  $('undo').disabled = model.history.length === 0;
  return true;
}
function act(action) {
  const targets = (selected ? [selected] : model.pieces).filter(p => !p.moving);
  if (!targets.length) { say('等小生命落地再做这个动作。'); return; }
  const waking = action === 'napping' && targets.every(p => p.sleeping);
  for (const piece of targets) {
    if (piece.moving) continue;
    piece.puppet.clear('hover', .1); piece.puppet.clear('select', .12);
    if (action === 'napping' && piece.sleeping) {
      piece.puppet.clear('sleep', .15); piece.sleeping = false; piece.puppet.jolt(.45);
      if (selected === piece) piece.puppet.play(piece.animator.select(options(piece)), { layer: 'select', fade: .12 });
    } else {
      piece.puppet.clear('sleep', .1); piece.sleeping = action === 'napping';
      piece.puppet.play(piece.animator[action](options(piece)), { layer: piece.sleeping ? 'sleep' : 'reaction', fade: .12 });
    }
  }
  detail(selected || targets[0], waking ? selected ? 'select' : 'idle' : action); tone(action === 'napping' ? 'sleep' : 'happy');
  say(`${selected ? '选中角色' : '所有角色'}：${{victory:'庆祝',napping:'睡觉或唤醒',gag:'小把戏'}[action]}`);
}
function undoMove() {
  // A pending travel owns its destination; wait until it lands before undoing.
  if (model.pieces.some(p => p.moving)) { say('等小生命落地后就可以撤销。'); return; }
  const last = model.history.at(-1);
  if (!last) return;
  const piece = model.pieces.find(p => p.id === last.id);
  const change = model.undo();
  // movePiece needs the pre-undo square to build its reverse travel offset.
  piece.square = change.from;
  select(piece); movePiece(piece, change.to, true);
}

function resize() {
  const width = innerWidth, height = innerHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  const mobile = width < 800;
  const reserved = width < 480 ? 245 : mobile ? 190 : 138;
  const unit = Math.min((height - reserved) / (mobile ? 9.9 : 12), width / (mobile ? 10.1 : 21.8), 82);
  view = { width, height, unit: Math.max(18, unit), x: width / 2, y: mobile ? 92 + (height - reserved) * .47 : height * .49 + 4, dpr };
  canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
  makeBackground();
}
function makeBackground() {
  if (!paper) return;
  background = document.createElement('canvas'); background.width = canvas.width; background.height = canvas.height;
  const b = background.getContext('2d');
  b.fillStyle = '#f1ebde'; b.fillRect(0, 0, background.width, background.height);
  const paperUnit = Math.max(view.unit, view.width / 22, view.height / (20 * groundScale)) * 1.05;
  b.setTransform(view.dpr * paperUnit, 0, 0, view.dpr * paperUnit, view.dpr * view.width / 2, view.dpr * view.height / 2);
  for (let i = 0; i < paper.manifest.sheet.tiles.length; i++) {
    const tile = paper.manifest.sheet.tiles[i], [x0, y0, x1, y1] = tile.rect;
    b.drawImage(paper.tiles[i], x0, -y1 * groundScale, x1 - x0, (y1 - y0) * groundScale);
  }
  inkBackground = document.createElement('canvas'); inkBackground.width = canvas.width; inkBackground.height = canvas.height;
  const ink = inkBackground.getContext('2d');
  ink.setTransform(view.dpr * view.unit, 0, 0, view.dpr * view.unit, view.dpr * view.x, view.dpr * view.y);
  drawBoardInk(ink, true);
}
function drawBoardInk(b, complete = false) {
  const progress = (start, duration) => complete ? 1 : opening.progress(start, duration);
  board.draw(b, 'board', { matrix: [1, 0, 0, groundScale], progress: progress(.3, 3.2), revealPixels: view.unit * 8.3 * view.dpr });
  if (view.width >= 800) {
    for (const [name, item] of Object.entries(worldIndex.statics)) {
      if (['static-ne', 'static-hills'].includes(name)) continue;
      const distance = Math.hypot(...item.at);
      world.draw(b, name, { x: item.at[0], y: item.at[1] * groundScale, matrix: [1, 0, 0, groundScale], progress: progress(2.2 + Math.max(0, Math.min(1.2, (distance - 6) * .3)), 1), revealPixels: 300 });
    }
  }
  for (let i = 0; i < 8; i++) {
    const color = i < 4 ? 'warm' : 'cool';
    lettering.draw(b, `file-${String.fromCharCode(97 + i)}.${color}.a`, { x: i - 3.5, y: -4.43 * groundScale, text: true, scale: 1.7, progress: progress(1.4 + i * .045, .5) });
    lettering.draw(b, `rank-${i + 1}.${i < 4 ? 'warm' : 'cool'}.a`, { x: -4.5, y: (i - 3.5) * groundScale, text: true, scale: 1.65, progress: progress(1.4 + i * .045, .5) });
  }
  for (const [x, y] of [[-4.48, -4.1], [4.48, -4.1], [-4.48, 4.15], [4.48, 4.15]]) {
    markers.draw(b, 'pebble-shut-0', { x, y: y * groundScale, matrix: [1, 0, 0, groundScale], progress: progress(2.2, .8) });
  }
}
function toWorld(clientX, clientY) {
  const point = paperMotion.fromScreen(clientX, clientY);
  return { x: (point.x - view.x) / view.unit, y: (view.y - point.y) / view.unit / groundScale };
}
function pick(clientX, clientY) {
  const w = toWorld(clientX, clientY);
  // The standing silhouette extends above its square. Bounds are taken from
  // the actual animated rig, rather than guessed DOM rectangles.
  const candidates = [...model.pieces].sort((a, b) => a.puppet.ground()[1] - b.puppet.ground()[1]);
  for (const piece of candidates) {
    const [x, y] = piece.puppet.ground(), bounds = piece.puppet.bounds();
    const ux = w.x - x, uy = (w.y - y) * groundScale;
    if (ux >= bounds[0] - .07 && ux <= bounds[2] + .07 && uy >= bounds[1] - .04 && uy <= bounds[3] + .07) return piece;
  }
  return model.at(squareAt(w.x, w.y));
}
function updatePointer(event) {
  pointer = toWorld(event.clientX, event.clientY); hoverSquare = squareAt(pointer.x, pointer.y); keyboardActive = false;
  const piece = pick(event.clientX, event.clientY);
  if (press && !press.piece.moving && Math.hypot(event.clientX - press.x, event.clientY - press.y) > 7) {
    drag = { piece: press.piece, x: pointer.x, y: pointer.y };
    press.piece.puppet.clear('select', 0); press.piece.puppet.clear('hover', 0);
    press.piece.puppet.pose = { ...press.piece.puppet.pose, lift: reduced ? .08 : .24, lean: .06 };
  }
  if (drag) { drag.x = pointer.x; drag.y = pointer.y; canvas.style.cursor = 'grabbing'; return; }
  canvas.style.cursor = piece ? 'grab' : selected && hoverSquare != null ? 'pointer' : 'default';
  if (piece !== hovered) {
    clearHover(); hovered = piece;
    if (piece && piece !== selected && !piece.moving && !piece.sleeping) {
      piece.puppet.play(piece.animator.hover(options(piece)), { layer: 'hover', fade: .12 });
      audio.play('hover', { pan: piece.puppet.ground()[0] / 5, pitch: piece.seed % 7 - 3 });
      if (!selected) detail(piece, 'hover');
    } else if (!selected) detail(piece);
  }
}
canvas.addEventListener('pointermove', event => { if (model && opening.interactive) updatePointer(event); });
window.addEventListener('pointermove', event => paperMotion.point(event.clientX, event.clientY, view.width || innerWidth, view.height || innerHeight));
document.documentElement.addEventListener('pointerleave', () => paperMotion.leave());
window.addEventListener('pointerdown', () => audio.unlock(), { capture: true });
window.addEventListener('keydown', () => audio.unlock(), { capture: true });
canvas.addEventListener('pointerdown', event => {
  if (!model || !opening.interactive || event.button !== 0) return;
  canvas.focus({ preventScroll: true }); pointer = toWorld(event.clientX, event.clientY);
  const piece = pick(event.clientX, event.clientY);
  if (piece && !piece.moving) { select(piece); press = { piece, x: event.clientX, y: event.clientY, pointerId: event.pointerId }; canvas.setPointerCapture(event.pointerId); }
  else if (selected && !piece) movePiece(selected, squareAt(pointer.x, pointer.y));
});
function finishDrag(event, cancelled = false) {
  if (drag) {
    const piece = drag.piece;
    piece.puppet.pose = { ...piece.puppet.pose, lift: 0, lean: 0 }; piece.puppet.refresh();
    const point = toWorld(event.clientX, event.clientY);
    const target = cancelled ? null : squareAt(point.x, point.y);
    drag = null;
    if (!movePiece(piece, target)) select(piece);
  }
  if (press) { try { canvas.releasePointerCapture(press.pointerId); } catch {} }
  press = null; canvas.style.cursor = 'default';
}
canvas.addEventListener('pointerup', event => finishDrag(event));
canvas.addEventListener('pointercancel', event => finishDrag(event, true));
canvas.addEventListener('pointerleave', () => { if (!drag) { pointer = null; hoverSquare = null; clearHover(); } });

function marker(key, x, y, alpha = 1) { markers.draw(ctx, key, { x, y: y * groundScale, alpha, matrix: [1, 0, 0, groundScale] }); }
function drawWorld() {
  if (view.width < 800) return;
  const hand = Math.floor(time * 8) % 2;
  const frames = [
    ['sun.awake.0', -4.75, 6.3, .03 * Math.sin(time * .7)],
    ['moon.asleep.0', 4.75, 6.3, .025 * Math.sin(time * .6 + 1)],
    ['rain-cloud.asleep.0', -6.7, 1.3, 0],
    ['tree-owl.blink.0', -7.35, -2.3, 0],
    ['whale-island.sleep.0', 7.3, -.75, .006 * Math.sin(time)],
    ['sunflower.sway.0', 7.3, -4, .025 * Math.sin(time * .8)],
    ['snail.crawl.0', 5.25 + .2 * Math.sin(time * .05), -4.45, 0],
    ['monarch.drift.0', -7.2 + .35 * Math.sin(time), 4.8 + .2 * Math.cos(time), .09 * Math.sin(time)],
  ];
  for (const [base, x, y, rot] of frames) {
    const key = world.get(`${base}.b${hand}`) ? `${base}.b${hand}` : base;
    const angle = reduced ? 0 : rot, c = Math.cos(angle), s = Math.sin(angle);
    world.draw(ctx, key, { x, y: y * groundScale, matrix: [c, -s, s * groundScale, c * groundScale], progress: opening.progress(2.2, .8) });
  }
  for (let i = 0; i < 15; i++) {
    const x = -3.4 + i * .486, y = 6.87 - .18 * Math.sin(i / 14 * Math.PI);
    const rot = reduced ? 0 : .055 * Math.sin(time * .65 + i * .37), c = Math.cos(rot), s = Math.sin(rot);
    world.draw(ctx, `rope.hang.${i % 5}.b${hand}`, { x, y: y * groundScale, matrix: [c, -s, s * groundScale, c * groundScale], progress: opening.progress(2.2 + i * .025, .7) });
  }
}
function drawPieces() {
  const pieces = [...model.pieces].sort((a, b) => b.puppet.ground()[1] - a.puppet.ground()[1]);
  if (drag) { pieces.splice(pieces.indexOf(drag.piece), 1); pieces.push(drag.piece); }
  for (const piece of pieces) {
    let [x, y] = piece.puppet.ground();
    if (drag?.piece === piece) { x = drag.x; y = drag.y; }
    drawCharacter(ctx, cast, piece, { x, y, groundScale, progress: opening.progress(piece.revealStart, .75) });
  }
}
function drawStatus() {
  const moving = model.pieces.some(p => p.moving), sleeping = selected?.sleeping;
  const key = sleeping ? 'thinking.cool.a' : moving ? 'thinking.cool.a' : 'your-move.warm.a';
  const entry = lettering.get(key), scale = view.width < 800 ? 1 : 1.1;
  const center = (entry.anchors.mid[0] - entry.pivot[0]) / entry.scale * scale;
  lettering.draw(ctx, key, { x: -center, y: -5.5 * groundScale, text: true, scale, progress: opening.progress(3.4, .8) });
}
function frame(now) {
  if (paused) return;
  const rawDt = previous ? (now - previous) / 1000 : 1 / 60;
  const dt = Math.min(.05, Math.max(0, rawDt)); previous = now; time += dt;
  const start = performance.now();
  opening.update(dt);
  if (opening.interactive !== wasInteractive) {
    wasInteractive = opening.interactive;
    for (const button of document.querySelectorAll('.toolbar button')) button.disabled = false;
    $('undo').disabled = model.history.length === 0;
  } else if (!opening.interactive) {
    for (const button of document.querySelectorAll('.toolbar button')) button.disabled = !['sound', 'reduced', 'replay'].includes(button.id);
  }
  const matrix = paperMotion.update(dt, { ...view, reduced });
  $('paper-ui').style.transform = paperMotion.cssTransform;
  for (const control of controls) control.update(dt);
  audio.writing(controls.some(control => control.writing) || !opening.done && !reduced, controls.some(control => control.writing && !control.ink.target));
  for (const piece of model.pieces) {
    if (pointer && !piece.sleeping) piece.puppet.lookAt(pointer.x, pointer.y);
    else piece.puppet.lookAt(null);
    piece.puppet.update(dt);
  }
  feedback.update(dt);
  for (const trail of trails) {
    const [x0, y0] = trail.from, [x1, y1] = trail.to, dx = x1 - x0, dy = y1 - y0;
    const actor = model.pieces.find(p => p.id === trail.pieceId), [gx, gy] = actor.puppet.ground();
    const travel = actor.moving ? Math.max(0, Math.min(1, ((gx - x0) * dx + (gy - y0) * dy) / (dx * dx + dy * dy))) : 1;
    trail.line.update(dt, travel);
    if (trail.line.reached >= .96 && trail.arrived == null) trail.arrived = time;
  }
  trails = trails.filter(e => !e.line.done || e.arrived != null && time - e.arrived < .85);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
  ctx.fillStyle = '#f1ebde'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4] * view.dpr, matrix[5] * view.dpr);
  ctx.drawImage(background, 0, 0);
  if (opening.done) ctx.drawImage(inkBackground, 0, 0);
  ctx.scale(view.dpr * view.unit, view.dpr * view.unit); ctx.translate(view.x / view.unit, view.y / view.unit);
  if (!opening.done) drawBoardInk(ctx);
  drawWorld();
  const hand = Math.floor(time * 8) % 3;
  if (hoverSquare != null && !model.at(hoverSquare)) { const [x, y] = squarePosition(hoverSquare); marker(`${selected ? 'target' : 'hover'}-${hand}`, x, y, .6); }
  if (keyboardActive) { const [x, y] = squarePosition(keyboardSquare); marker(`hover-${hand}`, x, y); }
  if (selected) { const [x, y] = squarePosition(selected.square); marker(`sel-${selected.side === 'w' ? 'warm' : 'cool'}-${hand}`, x, y); }
  for (const trail of trails) {
    const [x0, y0] = trail.from, [x1, y1] = trail.to;
    const dx = x1 - x0, dy = y1 - y0;
    for (const dot of trail.line.visible) marker(`trail-dot-${trail.side === 'w' ? 'warm' : 'cool'}-${hand}`, x0 + dx * dot.t, y0 + dy * dot.t, dot.alpha * .8);
    if (trail.arrived != null) marker(`dest-${trail.side === 'w' ? 'warm' : 'cool'}-${hand}`, x1, y1, Math.max(0, 1 - (time - trail.arrived) / .85) * .75);
  }
  feedback.drawGround(ctx); drawPieces(); feedback.draw(ctx, { ground: false }); drawStatus();
  drawSamples.push(performance.now() - start); frameSamples.push(rawDt * 1000);
  if (frameSamples.length > 180) { frameSamples.shift(); drawSamples.shift(); }
  if (time - lastMeter > .6) { lastMeter = time; $('fps').textContent = `${Math.round(1000 / (frameSamples.reduce((a, b) => a + b, 0) / frameSamples.length))} fps`; }
  raf = requestAnimationFrame(frame);
}

$('celebrate').onclick = () => act('victory'); $('nap').onclick = () => act('napping'); $('gag').onclick = () => act('gag');
$('undo').onclick = undoMove; $('reset').onclick = () => { makeCast(); tone(); };
$('replay').onclick = replayDrawing;
$('sound').setAttribute('aria-pressed', String(soundEnabled));
$('sound').onclick = () => { soundEnabled = !soundEnabled; audio.enabled = soundEnabled; localStorage.setItem('ballpoint-sound', soundEnabled ? 'on' : 'off'); $('sound').setAttribute('aria-pressed', String(soundEnabled)); $('sound').setAttribute('aria-label', `声音${soundEnabled ? '开' : '关'}`); audio.unlock(); tone(); };
$('reduced').setAttribute('aria-pressed', String(reduced));
$('reduced').onclick = () => { reduced = !reduced; opening.setReduced(reduced); $('reduced').setAttribute('aria-pressed', String(reduced)); for (const p of model.pieces) { p.puppet.cancelAll(.1); p.puppet.springs.settle(); p.sleeping = false; } if (selected) select(selected); say(`轻柔模式${reduced ? '开启' : '关闭'}`); };
window.addEventListener('keydown', event => {
  if (!model || !opening.interactive || event.target.closest('button,a,input')) return;
  const directions = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 8, ArrowDown: -8 };
  if (event.key in directions) {
    event.preventDefault(); keyboardActive = true;
    if (event.key === 'ArrowLeft' && keyboardSquare % 8 === 0 || event.key === 'ArrowRight' && keyboardSquare % 8 === 7) return;
    keyboardSquare = Math.max(0, Math.min(63, keyboardSquare + directions[event.key]));
    const [x, y] = squarePosition(keyboardSquare); pointer = { x, y }; return;
  }
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault(); const piece = model.at(keyboardSquare);
    if (piece) select(piece); else if (selected) movePiece(selected, keyboardSquare);
  }
  const action = { Escape: deselect, c: () => act('victory'), z: () => act('napping'), g: () => act('gag'), u: undoMove, n: makeCast, m: () => $('sound').click() }[event.key === 'Escape' ? event.key : event.key.toLowerCase()];
  if (action) { event.preventDefault(); action(); }
});
window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  paused = document.hidden;
  if (paused) { cancelAnimationFrame(raf); audio.writing(false); }
  else { previous = 0; raf = requestAnimationFrame(frame); }
});

async function init() {
  const ramps = await readJSON('/assets/text/ramps.json'), textManifest = await readJSON('/assets/text/manifest.json');
  [cast, board, markers, world, lettering, layout, worldIndex] = await Promise.all([
    Atlas.load('/assets/chars', 'cast'), Atlas.load('/assets/board', 'board'), Atlas.load('/assets/board', 'boardfx'),
    Atlas.load('/assets/world', 'world'), Atlas.load('/assets/text', 'atlas', { a8: true, ramps: ramps.ramps, manifest: textManifest }),
    readJSON('/assets/world/layout.json'), readJSON('/assets/world/world.index.json'),
  ]);
  const manifest = await readJSON('/assets/paper/manifest.json');
  paper = { manifest, tiles: await Promise.all(manifest.sheet.tiles.map(t => loadImage(`/assets/paper/${t.file}`))) };
  const rigs = await Promise.all(['w', 'b'].flatMap(side => kinds.map(kind => readJSON(`/assets/chars/${side}-${kind}.json`))));
  layout.rigs = Object.fromEntries(rigs.map(rig => [rig.id, rig])); layout.fx = await readJSON('/assets/chars/fx.json');
  feedback = new SketchFeedback({ atlas: cast, rig: layout.fx, groundScale, audio });
  const specs = [
    ['celebrate', cast, 'fx/star.gold.0', 'fx/star.tumble.0', 'gg.warm.a', '庆祝 · C'],
    ['nap', cast, 'fx/zzz.z2.0', 'fx/zzz.z3.0', 'world-zzz.neutral.a', '打个盹或唤醒 · Z'],
    ['gag', cast, 'fx/orbit.on.0', 'fx/sparkle.on.0', 'world-dab-psst.neutral.a', '小把戏 · G'],
    ['undo', world, 'btn-undo.rest.0.b0', 'btn-undo.hover.0', 'undo.warm.a', '撤销 · U'],
    ['reset', cast, 'w-pawn/body.idle.0', 'w-pawn/body.squash.0', 'new-game.warm.a', '重画场景 · N'],
    ['replay', world, 'pen-red.awake.0.b0', 'pen-red.swap.1.b0', 'again.warm.a', '重播绘制'],
    ['sound', world, (on, hover) => hover ? 'btn-sound.hover.0' : on ? 'btn-sound.on.0.b0' : 'btn-sound.off.0', null, 'sound.warm.a', '声音开关 · M'],
    ['reduced', world, 'btn-level.outline.0.b0', 'btn-level.hover.0', 'level-sleepy.warm.a', '轻柔模式'],
  ];
  const resetMascot = new Character(layout.rigs['w-pawn'], { seed: 11 });
  controls = specs.map(([id, atlas, icon, hoverIcon, textKey, label]) => new IllustratedControl($(id), {
    atlas, icon, hoverIcon, lettering, textKey, label, reduced: () => reduced,
    drawIcon: id === 'reset' ? (c, { active, disabled, dt }) => {
      resetMascot.lookAt(active ? 1 : null, 1); resetMascot.update(dt);
      c.save(); c.globalAlpha = disabled ? .35 : 1; c.translate(0, 19); c.scale(57, 57);
      drawCharacter(c, cast, resetMascot, { groundScale }); c.restore();
    } : undefined,
    state: () => id === 'sound' ? soundEnabled : reduced, onHover: () => audio.play('hover'),
  }));
  controls.push(...[
    ['nav-gallery','gallery','gallery'],['nav-characters','components','character lab'],
    ['nav-bio','bio','bio lab'],
  ].map(([id,type,label])=>new SketchLink($(id),{type,label,reduced:()=>reduced})));
  makeCast(); resize(); $('loading').remove();
  for (const button of document.querySelectorAll('.toolbar button')) button.disabled = false;
  $('undo').disabled = true;
  window.motionLab = {
    get state() { return { selected: selected?.id || null, moving: model.pieces.filter(p => p.moving).map(p => p.id), sleeping: model.pieces.filter(p => p.sleeping).map(p => p.id), positions: Object.fromEntries(model.pieces.map(p => [p.id, p.square])), history: model.history.length, reduced, soundEnabled,
      opening: { elapsed: opening.elapsed, interactive: opening.interactive, done: opening.done }, paper: { matrix: [...paperMotion.matrix] }, audioState: audio.context?.state || 'locked', feedback: { ...feedback.counts, particles: feedback.particles.length }, controls: controls.map(c => ({ id: c.button.id, progress: c.ink.progress, target: c.ink.target })) }; },
    get metrics() { const sorted = [...drawSamples].sort((a, b) => a - b); return { frames: frameSamples.length, fps: 1000 / (frameSamples.reduce((a, b) => a + b, 0) / frameSamples.length), meanDrawMs: drawSamples.reduce((a, b) => a + b, 0) / drawSamples.length, p95DrawMs: sorted[Math.floor(sorted.length * .95)], backingStore: [canvas.width, canvas.height] }; },
    get view() { return { ...view, groundScale }; },
  };
  raf = requestAnimationFrame(frame);
}
init().catch(error => { $('loading').textContent = `画笔卡住了：${error.message}。请刷新页面。`; console.error(error); });
