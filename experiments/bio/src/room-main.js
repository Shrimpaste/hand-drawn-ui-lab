import { App } from "./engine/app.js";
import { useFontLabels } from "./engine/label.js";
import { bootScreen, makeProgress } from "./engine/boot.js";
import { StructureRoom } from "./scenes/structure/room.js";
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
await document.fonts.load('20px "小赖"', "FBP1 糖异生的关口活性位点").catch(() => {});
report("font", 1, "调配蜡笔颜色");

const app = new App(document.getElementById("app"));
app.register("fbp1", (a) => new StructureRoom(a, data));
await app.start("fbp1", {
  onPrepare: (f) => report("bake", f, "描出原子与蜡笔纹理"),
  onWarm: (f, label) => report("warm", f, label),
});
await boot.finish();
