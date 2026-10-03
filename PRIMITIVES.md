# Creator's toolbox

## 当前场景使用的绘制工具

上一轮插画与页面结构没有达到要求。两个重做场景采用 scenes/art.js 的专门绘制；下面旧工具盘点仍供 Notebook 与历史版本阅读。

- `living-ink.js`：`Pencil.shape/oval/line/dot` 使用对象自己的纸底、方向性短蜡笔、多层覆盖和压力轮廓；`InkSprite` 初始化烘焙三版，动态选择8Hz轮廓，静态环境只缓存一版。
- `stroke-recording.js`：初次烘焙时同步生成真实 Canvas 笔画时间图。形状先分34%时间给轮廓，再涂色；`InkSprite.draw({progress})` 只更新最多512像素宽的阈值图，重画不重新计算蜡笔纹理。
- `handwriting.js`：`handwrittenPaths(text, seed)` 返回原创小写笔迹与真实弧长；`handwriting(ctx, text, x, y, { progress })` 按书写轨迹分配墨迹，可以写、擦、接着写。字库不宣称支持任意汉字。
- `foley.js`：`SceneFoley.play(material, { pan, strength })` 生成接触/摩擦，`setEnabled(false)` 停止当前音源；不对 hover 发 UI 鸣叫。`foleySamples` 可离线检查波形。

这些工具服务具体对象和空间，不决定场景应该是列表、网格或普通页面。两场景说明见 SCENE_PLAN.md，详细笔迹/轮廓/声音记录分别见 HANDWRITING_NOTES.md、MICRO_LIFE_NOTES.md、AUDIO_REWORK_NOTES.md。

新场景的绘画在 `scenes/guide.js`、`courtyard.js`、`art.js`，没有使用参考图集。`GuideMotion` 当前明确依赖原站 Puppet 和 pawn 反应轨道；连续庭院步态为新增。原站动画不是通用预设库，使用时应同时理解角色几何、锚点、pose合成与事件，详见 CHARACTER_ANIMATION_SOURCE.md。下面 demos/art.js 等盘点属于旧原创阶段。

## 能力与边界

| 模块                         | 可以带走什么                                                                            | 当前边界                                                    |
| ---------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `primitives/ink.js`          | InkTransition、clamp01；写/擦可中断 progress                                            | 渲染路径或图像由你提供；默认时长是可调起点                  |
| `primitives/lettering.js`    | penText、textStrokes；字母按真实路径弧长出现；prose 做静态可读文字                      | 自画的 Latin 大写/数字/少量标点；不是任意中文笔顺生成器     |
| `primitives/sketch.js`       | seeded roughPoints、stroke/partial、curvePoints、oval、hatch、sheet、tape、paperTexture | Canvas 2D；薄纸/胶带是当前原创美术选择，可替换              |
| `primitives/paper-motion.js` | 平滑指针感知、仿射 matrix、正/逆命中、CSS transform                                     | 仿射纸面；不是折纸/透视相机物理模拟                         |
| `primitives/motion.js`       | Spring（stiffness/damping/mass）与 Action（sample/semantic events）                     | 无标准物理材质 preset；scene 决定目标、约束、事件和中断语义 |
| `primitives/residue.js`      | 稀疏 dust/leaf/ring；每点 birth 的 TravelTrail；寿命/数量限制                           | 小型 Canvas 余韵；没有全场通用 particle simulator           |
| `primitives/audio.js`        | PaperAudio，轻纸声/擦除/叶片/短接触/铃；pitch/pan/strength、连续书写、mute/dispose      | 本地 Web Audio 合成；要先由用户手势 unlock                  |

InkTransition 与 PaperMotion 是已验证的本地适配，现在放入 primitives。`src/ink.js`、`src/paper-motion.js` 保留兼容入口；`src/ink.js` 的 DrawingSequence 和 strokeCoverage 仍属于 specimen 的开场/图集格式。`SketchAudio` 是 PaperAudio 的兼容名字。

## 自己的笔迹，不用原始图集

```js
import { InkTransition } from "./primitives/ink.js";
import { penText } from "./primitives/lettering.js";
import { stroke } from "./primitives/sketch.js";

const title = new InkTransition({ writeSeconds: 0.8, eraseSeconds: 0.25 });
button.onpointerenter = () => title.setVisible(true);
button.onpointerleave = () => title.setVisible(false);
// 同样为 focus-visible / blur 接入。每帧：
title.update(dt);
penText(ctx, "KEEP THIS IDEA", 30, 45, { progress: title.progress, size: 18 });
stroke(
  ctx,
  [
    [30, 74],
    [102, 77],
    [190, 73],
  ],
  { progress: title.progress },
);
```

lettering 保留每个字母的多个 pen-down path，再按整段弧长分配 progress。反向擦除仍沿这些笔画，不是横向裁剪文字。可直接扩充 glyphs 为自己的笔迹。个人输入文本用真实 input/textarea 或 `prose` 保持可读；不要假装字体的淡入是准确笔顺。

## 画面和输入属于同一张纸

```js
import { PaperMotion } from "./primitives/paper-motion.js";
const paper = new PaperMotion({ tau: 0.4, amplitudeX: 0.025, rotate: 0.001 });
paper.point(pointerX, pointerY, width, height);
paper.update(dt, { width, height, unit: 80, reduced });
paperElement.style.transform = paper.cssTransform;
const local = paper.fromScreen(pointerX, pointerY);
// local 在纸的坐标系里，再除去你的绘制 scale。
```

DOM button/input 和画布共用变换容器，语义状态与画面同步。自己绘制 hit area 时也应使用 inverse；只变换 Canvas 会让点击错位。`demos/runtime.js` 的 Study 展示这层 plumbing，不建议把它当强制 Scene framework。

## 一个动作同时携带接触、余韵与声音

```js
import { Action, Spring } from "./primitives/motion.js";
import { Residue } from "./primitives/residue.js";
import { PaperAudio } from "./primitives/audio.js";
const residue = new Residue({ limit: 60 });
const audio = new PaperAudio();
button.onpointerdown = () => audio.unlock();
const corner = new Spring(0, { stiffness: 75, damping: 14, mass: 0.8 });
const action = new Action({
  duration: 0.9,
  events: [
    { at: 0.12, name: "paper-lift" },
    { at: 0.63, name: "paper-settle" },
  ],
  sample: (t) => yourPaperPose(t),
  onEvent: (event) => {
    audio.play(event.name, { strength: 0.6 });
    if (event.name === "paper-settle")
      residue.emit("dust", x, y, { strength: 0.4 });
  },
});
button.onclick = () => action.start();
// 每帧：action.update(dt); corner.update(dt, reduced);
//         residue.update(dt); 用 action.pose 绘图，最后 residue.draw(ctx)。
```

事件跨时间区间发一次；大帧越过两个接触点也不丢事件。Action 只提供时间语义，是否从当前 pose 混合、重复输入加力或排队由场景决定。不要对所有对象使用上述示例参数。motion.js 中六种对象的举例在 `demos/material-motion.js`，它们没有被升级为基础材质库。

## 静音、隐藏与清理

- PaperAudio.writing(active, erasing) 切换持续纸笔声；静音后立即让 active=false。
- 页面隐藏停 RAF 并停止纸笔声；回来清理前一帧时间，避免巨大 delta。
- 替换场景或卸载宿主时解除监听器、停 RAF，调用 audio.dispose()。
- 图形稳定后可以缓存，不要把每帧随机变化当手绘风格；seed 在一次 stroke 内固定。
- 新角色使用提取求解器与反应轨道，保留原始归属；绘画资源独立。当前本地研究不等于获得原作者绘图生成器或开源组件。

## 仍保留的 reference adapters

`src/atlas.js`、`src/character.js`、`src/illustrated-control.js`、`src/feedback.js` 的 sprite adapter：适合研究原图集、rig/anchor、角色表演、timemap。它们需要原站的资源 key/ppu/格式，不等同于原创角色/中文书法生成器。仍通过旧 `/` 和 `/components.html` 展示，vendor 原始模块未改写。
