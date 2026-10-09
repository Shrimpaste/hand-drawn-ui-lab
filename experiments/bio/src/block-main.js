import { App } from "./engine/app.js";
import { useFontLabels } from "./engine/label.js";
import { bootScreen, makeProgress } from "./engine/boot.js";
import { BlockRoom } from "./scenes/block/room.js";
import data from "./generated/fbp1-structure.json" with { type: "json" };

const boot = bootScreen();
const progress = makeProgress([
  { id: "font", weight: 1 },
  { id: "bake", weight: 3 },
  { id: "warm", weight: 6 },
]);
const report = (stage, frac, text) => boot.set(progress.at(stage, frac), text);

report("font", 0, "正在备纸、研墨");
// 小赖 (SIL OFL) draws every label; wait for it so text is measured with the real glyphs.
useFontLabels('"小赖"');
await document.fonts.load('20px "小赖"', "共同的瓶颈糖异生卡在乳酸甘油").catch(() => {});
report("font", 1, "调配蜡笔颜色");

const app = new App(document.getElementById("app"));
app.register("block", (a) => new BlockRoom(a, data));
await app.start("block", {
  onPrepare: (f) => report("bake", f, "描出分子、细胞器与 FBP1 晶体结构"),
  onWarm: (f, label) => report("warm", f, label),
});
await boot.finish();
