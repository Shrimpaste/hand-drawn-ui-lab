import { Atlas, readJSON } from './atlas.js';
import { Character, drawCharacter } from './character.js';
import { InkTransition } from './ink.js';
import { PaperMotion } from './paper-motion.js';
import { IllustratedControl } from './illustrated-control.js';
import { SketchAudio, SketchFeedback } from './feedback.js';

const $ = id => document.getElementById(id), paper = new PaperMotion();
const audio = new SketchAudio(), ink = new InkTransition({ writeSeconds: 1.7, eraseSeconds: .55 });
let reduced = matchMedia('(prefers-reduced-motion: reduce)').matches, last = 0, raf = 0, count = 0;
let world, text, cast, character, feedback, controls;
$('gallery-reduced').checked = reduced;
$('gallery-reduced').onchange = event => { reduced = event.target.checked; };
window.addEventListener('pointermove', e => paper.point(e.clientX, e.clientY, innerWidth, innerHeight));
document.documentElement.addEventListener('pointerleave', () => paper.leave());
window.addEventListener('pointerdown', () => audio.unlock(), { capture: true });
window.addEventListener('keydown', () => audio.unlock(), { capture: true });
$('toggle-ink').onclick = () => ink.setVisible(!ink.target, reduced);

function setupSurface(canvas) {
  const width = canvas.clientWidth, height = canvas.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
  if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) { canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr); }
  const c = canvas.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, width, height);
  return { c, width, height, dpr };
}
function paintInk() {
  const { c, width } = setupSurface($('ink-sample'));
  c.translate(width / 2, 80); c.scale(64, 64);
  // The sun's disc is baked into the sky strip; its face is a separate actor.
  c.save(); c.beginPath(); c.rect(-1.05, -1.1, 2.1, 1.8); c.clip();
  world.draw(c, 'static-sky', { x:-.7062, y:1.2937*.829, matrix:[1,0,0,.829], progress:ink.progress, revealPixels:768 });
  c.restore();
  world.draw(c, 'sun.awake.0.b0', { x:0, y:.15*.829, matrix:[1,0,0,.829], progress:ink.progress, revealPixels:256 });
  const key = 'your-move.warm.a', entry = text.get(key), scale = 1.25;
  const cx = (entry.trim.x - entry.pivot[0] + entry.w / 2) / entry.scale * scale;
  text.draw(c, key, { x:-cx, y:-1.55, text:true, scale, progress:ink.progress });
}
function paintCharacter() {
  const { c, width } = setupSurface($('character-sample'));
  c.translate(width / 2, 177); c.scale(152, 152);
  drawCharacter(c, cast, character, { groundScale:.829 }); feedback.draw(c);
}
function frame(now) {
  const dt = Math.min(.05, last ? (now - last) / 1000 : 1 / 60); last = now;
  paper.update(dt, { width:innerWidth, height:innerHeight, unit:70, reduced });
  $('gallery-sheet').style.transform = paper.cssTransform;
  ink.update(dt); character.update(dt); feedback.update(dt);
  for (const control of controls) control.update(dt);
  audio.writing(ink.progress > 0 && ink.progress < 1 || controls.some(c => c.writing));
  paintInk(); paintCharacter(); raf = requestAnimationFrame(frame);
}
async function init() {
  const [ramps, manifest, rig, fx] = await Promise.all([readJSON('/assets/text/ramps.json'), readJSON('/assets/text/manifest.json'), readJSON('/assets/chars/w-pawn.json'), readJSON('/assets/chars/fx.json')]);
  [world, text, cast] = await Promise.all([Atlas.load('/assets/world','world'), Atlas.load('/assets/text','atlas',{ a8:true, ramps:ramps.ramps, manifest }), Atlas.load('/assets/chars','cast')]);
  character = new Character(rig, { seed:127 }); feedback = new SketchFeedback({ atlas:cast, rig:fx, groundScale:.829, audio });
  character.puppet.onEvent(event => feedback.cue(event,{ seed:127, reduced }));
  controls = [
    new IllustratedControl($('sample-star'), { atlas:cast, icon:'fx/star.gold.0', hoverIcon:'fx/star.tumble.0', lettering:text, textKey:'pick-one.warm.a', label:'收集一颗星', reduced:()=>reduced, onHover:()=>audio.play('hover') }),
    new IllustratedControl($('sample-undo'), { atlas:world, icon:'btn-undo.rest.0.b0', hoverIcon:'btn-undo.hover.0', lettering:text, textKey:'undo.warm.a', label:'撤销一颗星', reduced:()=>reduced, onHover:()=>audio.play('hover') }),
    new IllustratedControl($('sample-sound'), { atlas:world, icon:on=>on?'btn-sound.on.0.b0':'btn-sound.off.0', lettering:text, textKey:'sound.warm.a', label:'声音开关', state:()=>audio.enabled, reduced:()=>reduced, onHover:()=>audio.play('hover') }),
  ];
  const status = () => { $('sample-status').textContent = count ? `纸上收集了 ${count} 颗小星星。` : '悬停星星或用 Tab 聚焦。点击它来收集一颗星。'; $('sample-undo').disabled = count === 0; };
  $('sample-star').onclick = () => { count++; status(); audio.play('happy'); };
  $('sample-undo').onclick = () => { count = Math.max(0,count-1); status(); audio.play('select'); };
  $('sample-sound').onclick = () => { audio.enabled = !audio.enabled; $('sample-sound').setAttribute('aria-pressed',String(audio.enabled)); audio.unlock(); };
  const action = () => character.play('victory',{reduced});
  $('character-sample').onpointerenter = () => { character.play('hover',{reduced},{layer:'hover'}); audio.play('hover'); };
  $('character-sample').onpointerleave = () => { character.puppet.clear('hover',.12); character.lookAt(null); };
  $('character-sample').onpointermove = e => { const rect = e.currentTarget.getBoundingClientRect(); character.lookAt((e.clientX-rect.left-rect.width/2)/152,(rect.height-e.clientY+rect.top)/152); };
  $('character-sample').onclick = action;
  $('character-sample').onkeydown = e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); action(); } };
  for (const button of document.querySelectorAll('button')) button.disabled=false;
  status(); $('gallery-loading').remove(); ink.setVisible(true,reduced); raf=requestAnimationFrame(frame);
  window.componentLab = { get state() { return { stars:count, ink:ink.progress, controls:controls.map(c=>({id:c.button.id,progress:c.ink.progress})), reduced }; } };
}
document.addEventListener('visibilitychange',()=>{ if(document.hidden) { cancelAnimationFrame(raf); audio.writing(false); } else if(character) { last=0; raf=requestAnimationFrame(frame); } });
init().catch(error=>{ $('gallery-loading').textContent=`画笔卡住了：${error.message}`; console.error(error); });
