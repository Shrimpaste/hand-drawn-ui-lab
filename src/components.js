import { Atlas, readJSON } from "./atlas.js";
import { Character, drawCharacter, continuousTravel } from "./character.js";
import { InkTransition } from "./ink.js";
import { PaperMotion } from "./paper-motion.js";
import { IllustratedControl } from "./illustrated-control.js";
import { SketchAudio, SketchFeedback } from "./feedback.js";

const $ = (id) => document.getElementById(id),
  paper = new PaperMotion();
const audio = new SketchAudio(),
  ink = new InkTransition({ writeSeconds: 1.7, eraseSeconds: 0.55 });
let reduced = matchMedia("(prefers-reduced-motion: reduce)").matches,
  last = 0,
  raf = 0,
  count = 0;
let world, text, cast, character, feedback, controls;
let characterState = "awake",
  idleSeconds = 0,
  stateSeconds = 0,
  carry = null,
  revision = 0;
const activity = () => {
  idleSeconds = 0;
  if (characterState === "asleep") {
    character.puppet.clear("sleep", 0.25);
    characterState = "awake";
    character.sleeping = false;
  }
};
function resetCharacter() {
  activity();
  carry = null;
  stateSeconds = 0;
  characterState = "awake";
  character.puppet.cancelAll(0.2);
  character.puppet.timeline.quantizeFps = 12;
  character.animator.rest(character.puppet, character.side, character.seed);
  character.puppet.x = 0;
  character.puppet.y = 0;
  character.moving = false;
}
function sleepCharacter() {
  resetCharacter();
  characterState = "asleep";
  character.sleeping = true;
  character.play("sleepy", { reduced }, { layer: "sleep", fade: 0.35 });
}
function updateStudy(dt) {
  idleSeconds += dt;
  stateSeconds += dt;
  if (characterState === "awake" && idleSeconds > 18) sleepCharacter();
  if (characterState === "nervous" && stateSeconds > 4) {
    character.puppet.clear("emotion", 0.3);
    characterState = "awake";
  }
  if (carry) {
    carry.t += dt;
    if (carry.t >= 2.1) {
      carry.walked += dt * 1.1;
      carry.x = Math.min(2.1, carry.walked);
    }
    if (carry.t > 4.9) resetCharacter();
  }
  $("character-state").textContent = carry
    ? "蚂蚁：" +
      (carry.t < 1.5
        ? "取物"
        : carry.t < 2.1
          ? "准备抬起"
          : carry.t < 4.1
            ? "同步搬运"
            : "搬离后恢复实验")
    : characterState === "asleep"
      ? "角色睡着了；轻触或移动鼠标靠近可唤醒。"
      : characterState === "nervous"
        ? "真实 nervous 轨道；身体、表情和道具各自响应。"
        : "静置 18 秒会打盹；切换十二个角色比较动作。";
}
$("gallery-reduced").checked = reduced;
$("gallery-reduced").onchange = (event) => {
  reduced = event.target.checked;
};
window.addEventListener("pointermove", (e) =>
  paper.point(e.clientX, e.clientY, innerWidth, innerHeight),
);
document.documentElement.addEventListener("pointerleave", () => paper.leave());
window.addEventListener("pointerdown", () => audio.unlock(), { capture: true });
window.addEventListener("keydown", () => audio.unlock(), { capture: true });
$("toggle-ink").onclick = () => ink.setVisible(!ink.target, reduced);

function setupSurface(canvas) {
  const width = canvas.clientWidth,
    height = canvas.clientHeight,
    dpr = Math.min(devicePixelRatio || 1, 2);
  if (
    canvas.width !== Math.round(width * dpr) ||
    canvas.height !== Math.round(height * dpr)
  ) {
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  }
  const c = canvas.getContext("2d");
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, width, height);
  return { c, width, height, dpr };
}
function paintInk() {
  const { c, width } = setupSurface($("ink-sample"));
  c.translate(width / 2, 80);
  c.scale(64, 64);
  // The sun's disc is baked into the sky strip; its face is a separate actor.
  c.save();
  c.beginPath();
  c.rect(-1.05, -1.1, 2.1, 1.8);
  c.clip();
  world.draw(c, "static-sky", {
    x: -0.7062,
    y: 1.2937 * 0.829,
    matrix: [1, 0, 0, 0.829],
    progress: ink.progress,
    revealPixels: 768,
  });
  c.restore();
  world.draw(c, "sun.awake.0.b0", {
    x: 0,
    y: 0.15 * 0.829,
    matrix: [1, 0, 0, 0.829],
    progress: ink.progress,
    revealPixels: 256,
  });
  const key = "your-move.warm.a",
    entry = text.get(key),
    scale = 1.25;
  const cx =
    ((entry.trim.x - entry.pivot[0] + entry.w / 2) / entry.scale) * scale;
  text.draw(c, key, {
    x: -cx,
    y: -1.55,
    text: true,
    scale,
    progress: ink.progress,
  });
}
function paintCharacter() {
  const { c, width, height } = setupSurface($("character-sample"));
  const unit = characterUnit(width, height);
  c.translate(width / 2, height - 25);
  c.scale(unit, unit);
  if (carry) {
    const carrying = carry.t >= 2.1,
      x = carrying ? carry.x : -1.8 + Math.min(1.8, carry.t * 1.25);
    const walked = carrying ? carry.walked : Math.min(1.8, carry.t * 1.25);
    const side = character.side === "b" ? "d" : "";
    const frame = Math.floor(((walked / 0.5) % 1) * 4) % 4;
    const key = `ants.${carrying ? "carry" : "fetch"}.${side}${carry.t >= 1.5 && !carrying ? 4 : frame}.b0`;
    world.draw(c, key, { x, y: -0.03, matrix: [1, 0, 0, 0.829] });
    c.save();
    if (carrying)
      c.translate(
        x,
        -(0.26 + Math.abs(Math.sin((walked / 0.5) * Math.PI * 2)) * 0.012),
      );
    drawCharacter(c, cast, character, { groundScale: 0.829 });
    c.restore();
  } else drawCharacter(c, cast, character, { groundScale: 0.829 });
  feedback.draw(c);
}
function characterUnit(width, height) {
  const bounds = character.puppet.rig.world;
  return Math.min(
    152,
    (height - 36) / (bounds.height + 0.4),
    width / (bounds.width + 1.7),
  );
}
function frame(now) {
  const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
  last = now;
  paper.update(dt, {
    width: innerWidth,
    height: innerHeight,
    unit: 70,
    reduced,
  });
  $("gallery-sheet").style.transform = paper.cssTransform;
  ink.update(dt);
  updateStudy(dt);
  character.update(dt);
  feedback.update(dt);
  for (const control of controls) control.update(dt);
  audio.writing(
    (ink.progress > 0 && ink.progress < 1) || controls.some((c) => c.writing),
  );
  paintInk();
  paintCharacter();
  raf = requestAnimationFrame(frame);
}
async function init() {
  const [ramps, manifest, rig, fx] = await Promise.all([
    readJSON("/assets/text/ramps.json"),
    readJSON("/assets/text/manifest.json"),
    readJSON("/assets/chars/w-pawn.json"),
    readJSON("/assets/chars/fx.json"),
  ]);
  [world, text, cast] = await Promise.all([
    Atlas.load("/assets/world", "world"),
    Atlas.load("/assets/text", "atlas", {
      a8: true,
      ramps: ramps.ramps,
      manifest,
    }),
    Atlas.load("/assets/chars", "cast"),
  ]);
  character = new Character(rig, { seed: 127 });
  feedback = new SketchFeedback({
    atlas: cast,
    rig: fx,
    groundScale: 0.829,
    audio,
  });
  character.puppet.onEvent((event) =>
    feedback.cue(event, { seed: 127, reduced }),
  );
  controls = [
    new IllustratedControl($("sample-star"), {
      atlas: cast,
      icon: "fx/star.gold.0",
      hoverIcon: "fx/star.tumble.0",
      lettering: text,
      textKey: "pick-one.warm.a",
      label: "收集一颗星",
      reduced: () => reduced,
      onHover: () => audio.play("hover"),
    }),
    new IllustratedControl($("sample-undo"), {
      atlas: world,
      icon: "btn-undo.rest.0.b0",
      hoverIcon: "btn-undo.hover.0",
      lettering: text,
      textKey: "undo.warm.a",
      label: "撤销一颗星",
      reduced: () => reduced,
      onHover: () => audio.play("hover"),
    }),
    new IllustratedControl($("sample-sound"), {
      atlas: world,
      icon: (on) => (on ? "btn-sound.on.0.b0" : "btn-sound.off.0"),
      lettering: text,
      textKey: "sound.warm.a",
      label: "声音开关",
      state: () => audio.enabled,
      reduced: () => reduced,
      onHover: () => audio.play("hover"),
    }),
  ];
  const status = () => {
    $("sample-status").textContent = count
      ? `纸上收集了 ${count} 颗小星星。`
      : "悬停星星或用 Tab 聚焦。点击它来收集一颗星。";
    $("sample-undo").disabled = count === 0;
  };
  $("sample-star").onclick = () => {
    count++;
    status();
    audio.play("happy");
  };
  $("sample-undo").onclick = () => {
    count = Math.max(0, count - 1);
    status();
    audio.play("select");
  };
  $("sample-sound").onclick = () => {
    audio.enabled = !audio.enabled;
    $("sample-sound").setAttribute("aria-pressed", String(audio.enabled));
    audio.unlock();
  };
  const action = () => {
    if (carry) return;
    activity();
    character.play("victory", { reduced });
  };
  $("character-sample").onpointerenter = () => {
    if (carry) return;
    activity();
    character.play("hover", { reduced }, { layer: "hover", fade: 0.2 });
    audio.play("hover");
  };
  $("character-sample").onpointerleave = () => {
    character.puppet.clear("hover", 0.12);
    character.lookAt(null);
  };
  $("character-sample").onpointermove = (e) => {
    if (carry) return;
    activity();
    const rect = e.currentTarget.getBoundingClientRect(),
      unit = characterUnit(rect.width, rect.height);
    character.lookAt(
      (e.clientX - rect.left - rect.width / 2) / unit,
      (rect.height - 25 - e.clientY + rect.top) / unit,
    );
  };
  $("character-sample").onclick = action;
  $("character-sample").onkeydown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      action();
    }
  };
  $("character-kind").onchange = async (e) => {
    const token = ++revision,
      nextRig = await readJSON("/assets/chars/" + e.target.value + ".json");
    if (token !== revision) return;
    character = new Character(nextRig, { seed: 127 });
    feedback.clear();
    resetCharacter();
    character.puppet.onEvent((event) =>
      feedback.cue(event, { seed: 127, reduced }),
    );
    $("character-sample").setAttribute(
      "aria-label",
      nextRig.creature + "：悬停打招呼，点击或 Enter 庆祝",
    );
  };
  $("character-sleep").onclick = () =>
    characterState === "asleep" ? activity() : sleepCharacter();
  $("character-move").onclick = () => {
    if (carry || character.moving) return;
    activity();
    character.puppet.clear("emotion", 0.2);
    characterState = "walking";
    const start = character.puppet.x,
      destination = start > 0.3 ? -0.65 : 0.65;
    const off = [start - destination, 0];
    character.puppet.x = destination;
    character.puppet.timeline.quantizeFps = 0;
    character.moving = true;
    const clip = continuousTravel(
      character.animator.move({
        side: character.side,
        seed: character.seed,
        reduced,
        off,
        dist: Math.abs(off[0]),
        facing: Math.sign(-off[0]),
      }),
    );
    character.puppet.play(clip, {
      layer: "travel",
      fade: 0,
      onEnd: () => {
        character.moving = false;
        character.puppet.timeline.quantizeFps = 12;
        characterState = "awake";
        idleSeconds = 0;
      },
    });
  };
  $("character-worry").onclick = () => {
    resetCharacter();
    characterState = "nervous";
    character.play("nervous", { reduced }, { layer: "emotion", fade: 0.22 });
  };
  $("character-carry").onclick = () => {
    resetCharacter();
    characterState = "removed";
    character.play(
      "removed",
      { reduced, from: [-1, 0], by: "p", strength: 0.6 },
      { layer: "removal", fade: 0.08 },
    );
    carry = { t: 0, x: 0, walked: 0 };
  };
  $("character-reset").onclick = resetCharacter;
  for (const button of document.querySelectorAll("button"))
    button.disabled = false;
  status();
  $("gallery-loading").remove();
  ink.setVisible(true, reduced);
  raf = requestAnimationFrame(frame);
  window.componentLab = {
    get state() {
      return {
        stars: count,
        ink: ink.progress,
        character: character.id,
        characterState,
        idleSeconds,
        carry: carry && { ...carry },
        pose: character.puppet.out,
        ground: character.puppet.ground(),
        moving: character.moving,
        springs: character.puppet.springs.s,
        controls: controls.map((c) => ({
          id: c.button.id,
          progress: c.ink.progress,
        })),
        reduced,
      };
    },
  };
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(raf);
    audio.writing(false);
  } else if (character) {
    last = 0;
    raf = requestAnimationFrame(frame);
  }
});
init().catch((error) => {
  $("gallery-loading").textContent = `画笔卡住了：${error.message}`;
  console.error(error);
});
