import {
  ChineseInk,
  drawChinese,
  penSample,
  unsupportedChinese,
} from "../primitives/chinese-handwriting.js";
import { chineseGlyphs, chinesePhrases } from "../primitives/chinese-glyphs.js";
import { SceneFoley } from "../primitives/foley.js";

const page = document.body.dataset.page;
const faces = {
  wenkai: ["霞鹜文楷", "LabWenkai", "LXGW WENKAI LITE"],
  xiaolai: ["小赖", "LabXiaolai", "XIAOLAI"],
  yozai: ["悠哉", "LabYozai", "YOZAI"],
};
const icons = {
  home: "M5 20 5 8 24 6 26 23 8 25 5 20 M10 12 15 10 21 12 M10 17 21 16",
  type: "M5 7 25 6 M15 7 14 25 M9 25 21 24",
  ink: "M7 23 10 16 23 4 27 8 14 22 7 23 M11 16 15 20 M6 27 24 26",
  notes: "M6 4 23 5 25 26 7 26 6 4 M11 11 20 11 M11 17 21 17 M11 22 17 22",
  write: "M8 24 11 16 23 5 27 9 15 22 8 24 M11 16 15 20",
  erase: "M5 18 18 6 27 15 16 26 11 26 5 18 M10 14 21 21 M15 26 27 26",
  replay: "M8 11 C14 1 28 8 25 19 C23 28 9 28 6 20 M8 4 8 11 16 11",
  pause: "M11 6 11 25 M21 6 21 25",
  save: "M7 5 23 5 26 9 25 26 6 25 7 5 M12 5 12 13 21 13 21 5 M11 25 11 18 21 18 21 25",
};
const svg = (name) =>
  `<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icons[name]}"/></svg>`;
const faceSelect = `<label>字体<select id="face">${Object.entries(faces)
  .map(([key, [name]]) => `<option value="${key}">${name}</option>`)
  .join("")}</select></label>`;
const pigmentButtons = `<div class="colors" role="group" aria-label="笔迹颜色">${[
  ["棕", "#725239"],
  ["蓝", "#4c5190"],
  ["红", "#aa493b"],
]
  .map(
    ([label, color], i) =>
      `<button type="button" aria-label="${label}色" aria-pressed="${i === 0}" data-color="${color}" style="--swatch:${color}"><i></i></button>`,
  )
  .join("")}</div>`;
const options = `<div class="checks"><label><input type="checkbox" id="sound">笔触声</label><label><input type="checkbox" id="still">减少动作</label></div>`;
const sourceDetails = `<details><summary>字体与笔迹来源</summary><p>字体为完整字库的本地网页版本：<a href="https://github.com/lxgw/LxgwWenKai-Lite">文楷</a><a href="https://github.com/lxgw/kose-font">小赖</a><a href="https://github.com/lxgw/yozai-font">悠哉</a>。授权与转换记录见 <a href="/fonts/sources.json">来源清单</a>。</p><p>动画的 ${Object.keys(chineseGlyphs).length} 字笔迹取自 <a href="https://github.com/chanind/hanzi-writer-data">Hanzi Writer Data</a> 的有序笔画中线，经缩放、平滑和固定手感处理；<a href="/fonts/ARPHICPL.TXT">Arphic PL 授权</a>。它与以上三款字体的轮廓分开测试。</p></details>`;
const titles = { type: "中文字样", ink: "书写与擦除", notes: "今日便笺" };
document.querySelector("#app").innerHTML =
  `<div class="sheet"><header class="topline"><a class="home" href="/scenes/studio.html" aria-label="返回绘制小样">${svg("home")}UI LAB</a><nav aria-label="中文测试页">${[
    ["type", "字样"],
    ["ink", "笔迹"],
    ["notes", "便笺"],
  ]
    .map(
      ([key, label]) =>
        `<a href="./chinese-${key}.html" ${key === page ? 'aria-current="page"' : ""}>${svg(key)}${label}</a>`,
    )
    .join(
      "",
    )}</nav></header><main><div class="page-heading"><h1>${titles[page]}</h1><span class="folio">0${["type", "ink", "notes"].indexOf(page) + 1} / 03</span></div><div id="content"></div></main><footer class="foot">${sourceDetails}<span id="font-status" role="status">字体载入中</span></footer></div>`;
const $ = (selector) => document.querySelector(selector);
const content = $("#content");
const media = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = media.matches,
  color = "#725239",
  style = "fine",
  last = null,
  raf = 0,
  dirty = true;
const audio = new SceneFoley({ enabled: false });
const drawings = [];
const cleanups = [];
function listen(target, event, callback) {
  target.addEventListener(event, callback);
  cleanups.push(() => target.removeEventListener(event, callback));
}
function addDrawing(
  id,
  text,
  size,
  material,
  pigment,
  ink = new ChineseInk(text),
) {
  const canvas = document.getElementById(id);
  const drawing = { id, canvas, ink, size, material, pigment, needsDraw: true };
  drawings.push(drawing);
  return drawing;
}
function draw(item) {
  const rect = item.canvas.getBoundingClientRect();
  const ratio = Math.min(devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * ratio)),
    height = Math.max(1, Math.round(rect.height * ratio));
  if (item.canvas.width !== width || item.canvas.height !== height) {
    item.canvas.width = width;
    item.canvas.height = height;
  }
  const ctx = item.canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, rect.width, rect.height);
  const size = Math.min(
    item.size,
    ((rect.width - 18) / Math.max(1, item.ink.layout.width)) * 100,
  );
  drawChinese(ctx, item.ink.layout, {
    size,
    x: (rect.width - (item.ink.layout.width * size) / 100) / 2,
    y: (rect.height - size) / 2,
    cursor: item.ink.cursor,
    style: item.material || style,
    color: item.pigment || color,
  });
  item.canvas.dataset.text = item.ink.layout.text;
  item.canvas.dataset.progress = item.ink.progress.toFixed(4);
  item.needsDraw = false;
  item.drawnCursor = item.ink.cursor;
  item.drawnLayout = item.ink.layout;
}
let bench;
if (page === "type") {
  content.innerHTML = `<div class="toolbar"><label>字号<input type="range" id="size" min="24" max="60" value="40"><output id="size-value">40</output></label>${pigmentButtons}</div><div class="text-edit"><label for="sample-text">对照文字</label><input type="text" id="sample-text" maxlength="60" value="今日待办"><button id="reset-text">还原</button></div><div class="comparison">${Object.entries(
    faces,
  )
    .map(
      ([key, [name, face, latin]], i) =>
        `<section class="compare-row"><div class="font-meta"><h2>${name}</h2><p>0${i + 1} / ${latin}</p></div><div class="font-sample" style="font-family:'${face}',serif"><p class="sample-title">今日待办</p><p class="sample-body">周三下午，整理上周的会议记录。<br>补上两张草图，再把文件寄给小林。</p><div class="sample-ui"><span>✓ 已完成</span><span>保存草稿</span><span>移入归档</span></div><p class="numbers">10 月 04 日　14:30　/　共 12 项</p></div></section>`,
    )
    .join("")}</div>`;
  listen($("#sample-text"), "input", () => {
    document
      .querySelectorAll(".sample-title")
      .forEach((el) => (el.textContent = $("#sample-text").value));
  });
  listen($("#reset-text"), "click", () => {
    $("#sample-text").value = "今日待办";
    document
      .querySelectorAll(".sample-title")
      .forEach((el) => (el.textContent = "今日待办"));
  });
  listen($("#size"), "input", () => {
    document.documentElement.style.setProperty(
      "--sample-size",
      `${$("#size").value}px`,
    );
    $("#size-value").value = $("#size").value;
  });
} else if (page === "ink") {
  content.innerHTML = `<div class="toolbar"><label>文字<select id="phrase">${chinesePhrases.map((t) => `<option>${t}</option>`).join("")}</select></label><label>笔触<select id="material"><option value="fine">细笔</option><option value="pencil">铅笔</option><option value="color">色铅</option></select></label><label>速度<select id="speed"><option value="0.35">慢速</option><option value="1" selected>正常</option><option value="1.8">快速</option></select></label>${pigmentButtons}</div><section class="ink-stage" aria-label="中文笔迹播放"><canvas id="hero" aria-hidden="true"></canvas><p class="status" id="stroke-status" aria-live="off"></p><div class="ink-actions"><button id="write">${svg("write")}写入</button><button id="erase">${svg("erase")}擦除</button><button id="replay">${svg("replay")}重写</button><button id="pause" aria-pressed="false">${svg("pause")}暂停</button></div><label class="scrubber">进度<input id="progress" type="range" min="0" max="1000" value="0"><output id="progress-value">0%</output></label></section><div class="materials">${[
    ["fine", "细笔"],
    ["pencil", "铅笔"],
    ["color", "色铅"],
  ]
    .map(
      ([key, label]) =>
        `<div class="material"><span>${label}</span><canvas id="${key}-sample" aria-hidden="true"></canvas></div>`,
    )
    .join(
      "",
    )}</div><form id="phrase-form" class="ink-entry"><label for="custom-phrase">组合文字</label><input id="custom-phrase" type="text" maxlength="8" value="保存草稿"><button type="submit">写入组合</button><span class="status error" id="phrase-error" role="status"></span></form>${options}`;
  bench = new ChineseInk("今日待办");
  addDrawing("hero", bench.layout.text, 84, null, null, bench);
  for (const material of ["fine", "pencil", "color"])
    addDrawing(
      `${material}-sample`,
      bench.layout.text,
      39,
      material,
      null,
      bench,
    );
  const change = (text) => {
    bench.replace(text, reduced);
    $("#phrase-error").textContent = "";
    dirty = true;
  };
  listen($("#phrase"), "change", () => change($("#phrase").value));
  listen($("#material"), "change", () => {
    style = $("#material").value;
    dirty = true;
  });
  listen(
    $("#speed"),
    "change",
    () => (bench.speed = 780 * Number($("#speed").value)),
  );
  listen($("#write"), "click", () => bench.setVisible(true, reduced));
  listen($("#erase"), "click", () => bench.setVisible(false, reduced));
  listen($("#replay"), "click", () => bench.replay(reduced));
  listen($("#pause"), "click", () => {
    bench.paused = !bench.paused;
    $("#pause").setAttribute("aria-pressed", String(bench.paused));
  });
  listen($("#progress"), "input", () => {
    bench.seek(Number($("#progress").value) / 1000);
    dirty = true;
  });
  listen($("#phrase-form"), "submit", (event) => {
    event.preventDefault();
    const text = $("#custom-phrase").value.trim();
    const missing = unsupportedChinese(text);
    if (!text || missing.length) {
      $("#phrase-error").textContent = text
        ? `尚无笔迹：${missing.join("、")}`
        : "请输入文字";
      return;
    }
    change(text);
  });
} else {
  const today = new Date();
  const dateText = `${String(today.getMonth() + 1).padStart(2, "0")} / ${String(today.getDate()).padStart(2, "0")}`;
  const weekday = new Intl.DateTimeFormat("zh-CN", { weekday: "short" }).format(
    today,
  );
  content.innerHTML = `<div class="toolbar">${faceSelect}${pigmentButtons}${options}</div><div class="note-layout"><aside class="note-margin"><div class="note-date">${dateText}</div><p>${weekday}</p><hr><p class="note-count-label">本页清单</p><p id="task-count" role="status">0 / 3 已完成</p></aside><article class="note-paper"><h2 class="note-title"><span class="visually-hidden">今日待办</span><canvas id="note-title" aria-hidden="true"></canvas></h2><div id="tasks">${["整理会议记录", "补上两张草图", "把文件寄给小林"].map((text, i) => `<label class="task"><input type="checkbox" data-task="${i}"><span>${text}</span></label>`).join("")}</div><label class="visually-hidden" for="note-body">便笺内容</label><textarea class="note-body" id="note-body" spellcheck="false">会议记录放在蓝色文件夹里。\n草图需要标上尺寸，周一上午再核对一次。</textarea><div class="note-bottom"><button id="save" class="save-button" aria-label="保存便笺">${svg("save")}<canvas id="save-label" aria-hidden="true"></canvas><canvas id="save-hint" class="hint" aria-hidden="true"></canvas></button><div class="note-state"><canvas id="save-state" aria-hidden="true"></canvas><span class="status" id="save-status" role="status">尚未保存</span></div></div></article></div>`;
  const titleInk = addDrawing("note-title", "今日待办", 43, "fine").ink;
  const labelInk = addDrawing("save-label", "保存", 26, "fine", "#4c5190").ink;
  labelInk.finish();
  const hint = addDrawing("save-hint", "草稿", 23, "fine", "#725239").ink;
  hint.setVisible(false, true);
  const state = addDrawing("save-state", "草稿", 26, "fine", "#587644").ink;
  const tasks = [...document.querySelectorAll("[data-task]")];
  const count = () =>
    ($("#task-count").textContent =
      `${tasks.filter((t) => t.checked).length} / 3 已完成`);
  const markEdited = () => {
    $("#save-status").textContent = "尚未保存";
    state.replace("草稿", reduced);
    dirty = true;
  };
  let hovered = false,
    focused = false;
  const sync = () => hint.setVisible(hovered || focused, reduced);
  listen($("#save"), "pointerenter", () => {
    hovered = true;
    sync();
  });
  listen($("#save"), "pointerleave", () => {
    hovered = false;
    sync();
  });
  listen($("#save"), "focus", () => {
    focused = true;
    sync();
  });
  listen($("#save"), "blur", () => {
    focused = false;
    sync();
  });
  listen($("#note-body"), "input", markEdited);
  tasks.forEach((t) =>
    listen(t, "change", () => {
      count();
      markEdited();
    }),
  );
  listen($("#save"), "click", () => {
    try {
      localStorage.setItem(
        "ui-lab-chinese-note",
        JSON.stringify({
          text: $("#note-body").value,
          tasks: tasks.map((t) => t.checked),
        }),
      );
      $("#save-status").textContent = "已保存到本机";
      state.replace("已存", reduced);
    } catch {
      $("#save-status").textContent = "未能保存，请复制内容";
      state.replace("草稿", reduced);
    }
    dirty = true;
  });
  try {
    const saved = JSON.parse(localStorage.getItem("ui-lab-chinese-note"));
    if (saved && typeof saved.text === "string" && Array.isArray(saved.tasks)) {
      $("#note-body").value = saved.text;
      tasks.forEach((t, i) => (t.checked = saved.tasks[i] === true));
      count();
      $("#save-status").textContent = "已保存到本机";
      state.replace("已存", true);
    }
  } catch {
    /* Storage unavailable/corrupt: leave the editable default note. */
  }
  listen($("#face"), "change", () =>
    document.documentElement.style.setProperty(
      "--face",
      `'${faces[$("#face").value][1]}',serif`,
    ),
  );
}

document.querySelectorAll("[data-color]").forEach((button) =>
  listen(button, "click", () => {
    color = button.dataset.color;
    document.documentElement.style.setProperty("--pigment", color);
    document
      .querySelectorAll("[data-color]")
      .forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    dirty = true;
  }),
);
if ($("#still")) {
  $("#still").checked = reduced;
  listen($("#still"), "change", () => {
    reduced = $("#still").checked;
    if (reduced) drawings.forEach((d) => d.ink.finish());
    dirty = true;
  });
  listen($("#sound"), "change", () => audio.setEnabled($("#sound").checked));
}
listen(media, "change", () => {
  reduced = media.matches;
  if ($("#still")) $("#still").checked = reduced;
  if (reduced) drawings.forEach((d) => d.ink.finish());
  dirty = true;
});
listen(document, "pointerdown", () => audio.unlock());
listen(document, "keydown", () => audio.unlock());
const observer = new ResizeObserver(() => (dirty = true));
observer.observe($(".sheet"));
function frame(now) {
  const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.05);
  last = now;
  let penDown = false,
    erasing = false;
  const changed = new Map();
  for (const ink of new Set(drawings.map((d) => d.ink))) {
    const before = ink.cursor,
      oldLayout = ink.layout,
      wasErasing = ink.erasing;
    const moved = ink.update(dt, reduced);
    changed.set(ink, moved || oldLayout !== ink.layout);
    const midpoint =
      oldLayout === ink.layout ? (before + ink.cursor) / 2 : before;
    if (moved && penSample(oldLayout, midpoint)) {
      penDown = true;
      erasing = wasErasing;
    }
  }
  audio.handwriting(penDown && !reduced, erasing, dt);
  for (const item of drawings)
    if (
      dirty ||
      item.needsDraw ||
      changed.get(item.ink) ||
      item.drawnCursor !== item.ink.cursor ||
      item.drawnLayout !== item.ink.layout
    )
      draw(item);
  if (bench) {
    $("#progress").value = String(Math.round(bench.progress * 1000));
    $("#progress-value").value = `${Math.round(bench.progress * 100)}%`;
    const pen = penSample(bench.layout, bench.cursor);
    $("#stroke-status").textContent =
      `${bench.layout.text} · ${bench.paused ? "已暂停" : bench.progress === 0 ? "已擦除" : bench.progress === 1 ? "已写完" : pen ? `${pen.character} · 第 ${pen.index + 1} 笔` : "提笔"}`;
    $("#pause").setAttribute("aria-pressed", String(bench.paused));
  }
  dirty = false;
  raf = requestAnimationFrame(frame);
}
listen(document, "visibilitychange", () => {
  cancelAnimationFrame(raf);
  last = null;
  if (document.hidden) audio.setEnabled(false);
  else {
    audio.setEnabled(Boolean($("#sound")?.checked));
    dirty = true;
    if (drawings.length) raf = requestAnimationFrame(frame);
  }
});
listen(window, "pagehide", (event) => {
  cancelAnimationFrame(raf);
  last = null;
  audio.setEnabled(false);
  if (!event.persisted) {
    audio.dispose();
    observer.disconnect();
    cleanups.forEach((fn) => fn());
  }
});
listen(window, "pageshow", (event) => {
  if (!event.persisted) return;
  cancelAnimationFrame(raf);
  last = null;
  dirty = true;
  audio.setEnabled(Boolean($("#sound")?.checked));
  if (drawings.length && !document.hidden) raf = requestAnimationFrame(frame);
});
if (drawings.length) raf = requestAnimationFrame(frame);

Promise.all(
  Object.values(faces).map(([, face]) => document.fonts.load(`20px ${face}`)),
)
  .then(() => {
    $("#font-status").textContent = "3 款字体已载入";
  })
  .catch(() => {
    $("#font-status").textContent = "部分字体未载入，请刷新重试";
  });

// Read-only development observation; actual actions use the semantic controls.
window.chineseTypeDebug = () => ({
  page,
  reduced,
  audio: {
    enabled: audio.enabled,
    sources: audio.sources.size,
    events: audio.events,
  },
  drawings: drawings.map((d) => ({
    id: d.id,
    text: d.ink.layout.text,
    progress: d.ink.progress,
    cursor: d.ink.cursor,
    pending: d.ink.pending?.text,
    paused: d.ink.paused,
    moving: d.ink.moving,
  })),
  width: document.documentElement.scrollWidth,
});
