# 实现与迁移

先读 [风格指南](STYLE_GUIDE.md)，再选工具。本仓库不是强制框架；可以只取某种笔触、笔迹、状态动画或事件结构。新项目从功能与自绘画稿出发，角色和庭院的模型留在示例中。

当前原创完成度优先看 [Bio Block/Room](BIO_EXPERIMENTS.md)，代码位于 `experiments/bio/`。其 `App/Scene/InkSprite` 与下面 UI-lab 的 `SceneHost/InkSprite` 是两套接口，不可按同名直接互换。Bio 保留领域结构/碳流模型和独立渲染闭包；需要重用时沿实际依赖抽取，不为统一接口降低画面质量。两页入口、生成命令和可中断状态关系在 Bio 说明中。

## 1. 选择渲染边界

| 场景                    | 合适的组合                               | 需要保留的行为                         |
| ----------------------- | ---------------------------------------- | -------------------------------------- |
| SaaS 表单、表格、编辑器 | DOM 语义内容 + SVG/Canvas 笔迹和局部装饰 | 输入、选择、复制、滚动、焦点与辅助技术 |
| 少量路径按钮/图表标记   | SVG 路径或 Canvas，状态由组件模型持有    | 路径笔顺、逆向擦除、状态不依赖动画完成 |
| 密集插画与部件动画      | Canvas/图集 + DOM 语义控件               | 统一坐标、DPR、缓存、真实命中与键盘    |
| 本仓库原作样本          | 原图集 + 原 Puppet + 本地 Canvas adapter | 来源、时间图、rig、离散画稿与相对角度  |

避免把大量业务正文烘焙为不可选择的 Canvas，也不要只在标准 DOM 上套粗糙框就宣称得到该风格。主视觉和状态反馈应进入同一纸笔语言，业务内容仍可靠可用。

## 2. 自绘对象：先结构，再笔触，再烘焙

当前主绘图入口是 [living-ink.js](../primitives/living-ink.js)：

- `Pencil.shape(knots, color, opts)`：闭合曲线、轮廓、蜡笔与局部重叠；`opts.angular` 可保留硬折线。
- `Pencil.oval(x, y, rx, ry, color, opts)` / `line(points, opts)` / `dot(...)`：组合绘图；别把所有主体只画成椭圆。
- `pigmentEdge(color)`：同颜料轮廓混入少量暖棕。
- `wax(ctx, contour, color, opts)`：固定种子、方向性短线、纸隙与阴面；实体有自己的纸底。
- `InkSprite(w, h, draw, {pivot, seed, variants})`：初始化烘焙画稿与时间图；`draw(ctx, x, y, {time, progress, frame, scale, angle, reduced})` 播放。

以下演示 API，简单便笺不是美术质量模板。导入以站点根目录为基准；`ctx`、坐标、时间、DOM button 和 reduced 等由宿主提供，例子不包含整页循环与卸载：

```js
import { InkSprite, palette } from "/primitives/living-ink.js";

const note = new InkSprite(
  150,
  110,
  (p) => {
    p.shape(
      [
        [-64, -42],
        [60, -40],
        [65, 38],
        [-60, 42],
      ],
      palette.cream,
      { angular: true, angle: -0.7, density: 1.1, base: 0.22 },
    );
    p.line(
      [
        [-49, -16],
        [0, -14],
        [42, -17],
      ],
      { color: palette.red },
    );
    p.line(
      [
        [-48, 5],
        [-10, 8],
        [29, 5],
      ],
      { color: palette.ink },
    );
  },
  { seed: 207, variants: 3 },
);

// 在你自己的逐帧绘图中调用；不要每帧重新 new InkSprite。
note.draw(ctx, x, y, { time: elapsed, progress: drawProgress, reduced });
```

当前小部件烘焙为 4×、大背景为 2× raster；时间图最高约 512 边长，绘制过程分 96 档缓存。它是性能/分辨率取舍，不能声称任意大小无限精细。不要把调 alpha 当成 `progress`；后者沿实际笔画时间显现。

需要完整重画时给 `InkSprite` 配置 `redraw`：数组每行是 `[局部 y, 横向比例变化, 横向偏移, 纵向偏移]`，高度递增，关节/接触位置用零值。例如自有纸片可以用 `[[-40,.008,.3,-.2],[0,0,0,0],[40,-.006,-.2,.2]]`，同时将业务文字放在不变形的独立层。形体和结构共用这个场；蜡笔种子不变。更具体的翻角/开合画法在 draw 回调里读 `p.variant`，重新安排控制点，而不是每帧随机生成。

`redraw` 是可选项；默认画稿仍只变化笔线。三稿只在构造时生成。笔顺时间图和 cost 必须来自第 0 稿；否则各稿不同路径长度会污染首次绘制时序。减少动作模式优先使用第 0 稿，即使传了 `frame`。不要在 RAF 中创建 sprite。Studio 的 `drawingFrame` 只用于同姿态对照，Gallery 仍读取原 solver 的 `i.hand`。

`CanvasStrokeRecorder` 在 [stroke-recording.js](../primitives/stroke-recording.js) 记录 Canvas 绘制顺序与 cost；`Pencil.consume/segment` 给轮廓、填色、细节分配顺序。自绘代码需保持绘画调用有序，不能先画完整对象再假装用遮罩描笔。大图先看局部时间图是否忠实，再决定缓存尺寸。

## 3. 笔迹和可中断的写擦

[handwriting.js](../primitives/handwriting.js) 的 `handwrittenPaths(text, seed)` 返回 `paths/width/total`；`handwriting(ctx, text, x, y, opts)` 按弧长预算绘制。路径是自绘小写字母、数字和部分标点，大写转小写，未知字符退成问号。它不是中文书法引擎。

中文测试使用 [chinese-handwriting.js](../primitives/chinese-handwriting.js) 的 `ChineseInk/chinesePaths/drawChinese/unsupportedChinese`；有序笔画中线由固定版本 `hanzi-writer-data` 生成，来源、接口和字表范围见 [中文测试](CHINESE_TYPE.md)。它与下面的自绘拉丁 API 独立。

```js
import { InkTransition } from "/primitives/ink.js";
import { handwriting, handwrittenPaths } from "/primitives/handwriting.js";

const ink = new InkTransition({ writeSeconds: 0.3, eraseSeconds: 0.18 });
const seed = 31;
const labelWidth = handwrittenPaths("save", seed).width * 20;
let hovered = false,
  focused = false;
const sync = () => ink.setVisible(hovered || focused, reduced);
button.addEventListener("pointerenter", () => {
  hovered = true;
  sync();
});
button.addEventListener("pointerleave", () => {
  hovered = false;
  sync();
});
button.addEventListener("focus", () => {
  focused = true;
  sync();
});
button.addEventListener("blur", () => {
  focused = false;
  sync();
});

// 每帧；hover/focus 任一个成立都保持说明。
ink.update(dt);
handwriting(ctx, "save", x, y, { size: 20, seed, progress: ink.progress });
```

`setVisible` 保存当前 progress 后改变 target，快速反向不会突然整词出现。减动作使用短过渡。文字种子在一次生命周期内固定，不能随 hover 更新；用 `width * size` 及笔画上下界给说明留白。

`src/ink.js` 同时导出此 `InkTransition`，另有参考时间图的 `strokeCoverage` 与参考开场 `DrawingSequence`。后者的 3.6/4.8 秒和原站节奏相关，不是 SaaS 全局加载规范。Gallery 开场由 `SceneHost.drawProgress` 和 sprite 的绘图时间管理。

对象替换看 [visitor-redraw.js](../scenes/visitor-redraw.js) 与 [gallery.js](../scenes/gallery.js)：旧图墨量退至零，再绘新图；连续选择保存可见身份与进度。新业务需设计自己的替换协调器，不应导入角色切换作为通用产品状态管理。

## 4. 动作模型：保留当前状态，事件跨帧触发

[motion.js](../primitives/motion.js) 的 `Spring` 使用有界子步；`value/target/velocity` 属于模型。`kick` 加动量，`snap` 明确结束；不要每帧或反向时重建 spring。

`Action({duration, sample, events, onEvent})` 只提供时间与语义事件：

```js
import { Action } from "/primitives/motion.js";

const action = new Action({
  duration: 0.45,
  sample: (seconds) => paperPose(seconds),
  events: [{ at: 0.31, name: "paper-settle" }],
  onEvent: (event) => {
    if (event.name === "paper-settle") {
      audio.play("paper", { strength: 0.35 });
      residue.emit("dust", x, y, { strength: 0.2 });
    }
  },
});
action.start();
// 每帧 action.update(dt)，用 action.pose 绘制。
```

这里 `paperPose`、位置和材料力度由你的对象定义。`Action.start()` 会重新开始时间，它**不会自动实现连续打断**。宿主需先保存完整当前 pose/velocity，再构造新的目标曲线，或使用层混合。从 input 另开音效 timer 会在动作取消后产生错误声音；事件从同一动作模型产生。

参考求解器更完整：[GuideMotion](../scenes/guide-motion.js) 实际使用原作 `Puppet`、idle、ghost、hover/emotion/sleep 层；[rig](../scenes/guide-rig.js) 定义父子关系与 springs；[render pose](../scenes/guide-render-pose.js) 适配画稿相对角度。阅读它们以理解结构，迁移时注意原作来源。

当前步态位于 [visitor-locomotion.js](../scenes/visitor-locomotion.js)：`visitorStride` 定姿态，`visitorTravelRate` 定位移分配，`visitorContacts` 定接触，相位由 Gallery 模型共享。兔子双脚同落且主要空中推进，猫头鹰低抬升交替落脚，蘑菇短步和帽子滞后。新对象应重写这些关系；不要换画稿仍用同一运动。

## 5. 最终渲染连续性与空间

要保存的是屏幕上完整可见 pose，不只是地面 x/y。抬升、scale、bodyPose、附件与离散状态都会影响最终位置。

长凳修复可作具体范例：[bench-path.js](../scenes/bench-path.js) 对不可达目标返回空路线；模型拒绝进入坐定状态；[gallery-model.js](../scenes/gallery-model.js) 的 mount/dismount 从当前 `drawingPose` 接续，保留 hop 与 squash。中途转向不能让“空中角色”瞬间落回地面。减动作模式也须使用实际过渡时长。

空间布局看 [courtyard-layout.js](../scenes/courtyard-layout.js)、[courtyard.js](../scenes/courtyard.js)、[courtyard-details.js](../scenes/courtyard-details.js)。投影、墙面/座面基向量、ground footprint、depth、绘图和 hit region 共用数据。普通 DOM SaaS 不必引入这套庭院坐标，仍要检查物体落点、遮挡与实际操作区。

## 6. 简笔选项与语义控件

[illustrated-control.js](../primitives/illustrated-control.js) 提供：

- `drawControlMark(ctx, type, {x,y,time,reduced,hover,on,active,scale,progress})`：简笔符号。
- `drawIllustratedControl(ctx, button, type, {time,reduced,on,active,label,labelY,scale})`：符号与写擦标签。

第二个函数需要宿主 button 的 `x/y/el/ink`，可选 `response`；不是可直接丢进任何项目的独立 React 组件。当前适配器是 [SceneHost](../scenes/host.js)，原参考的共享导航使用 [sketch-link.js](../src/sketch-link.js)。新项目按自身组件生命周期包装，保留一致的符号、状态和键盘行为。

视觉简单、语义完整：button/link/input 的真实 DOM 提供名称、焦点、pressed/disabled 和事件；Canvas 是美术层。不要把状态藏进只有鼠标才能看到的 hover。

## 7. 纸面变换和命中

`PaperMotion` 在 [paper-motion.js](../primitives/paper-motion.js)：

```js
import { PaperMotion } from "/primitives/paper-motion.js";

const paper = new PaperMotion({ tau: 0.4, amplitudeX: 0.025, rotate: 0.001 });
paper.point(pointerX, pointerY, width, height);
paper.update(dt, { width, height, unit: 80, reduced });
surface.style.transform = paper.cssTransform;
const local = paper.fromScreen(pointerX, pointerY);
```

先减去宿主屏幕偏移，再做 inverse，最后除绘图 scale。DOM 语义控件与画布放在同一个变换容器。每次 viewport 改变重新计算布局与 hit area；指针与键盘焦点都要验证。该例的参数只是幅度示例。

## 8. 残留、声音、生命周期

- [Residue](../primitives/residue.js)：每个粒子自己的出生时间和寿命，数量有上限；`TravelTrail` 按经过位置留痕，不整条同时退场。
- [SceneFoley](../primitives/foley.js)：`unlock()` 在真实用户手势；`play(name,{pan,strength})` 播放材料声；`handwriting(active,erasing,dt)` 跟随笔迹；`setEnabled(false)` 停已有声源；`dispose()` 关上下文。
- `step/paper/leaf/stone/wood/bell/switch/write/erase` 是现有声音名，不是所有交互都需要发声。试听与具体动作一起调整，不能只看 count 增加。
- 页面隐藏停 RAF 与写擦，恢复重设前帧时间；卸载解除监听器、停 RAF、清理音频和缓存。当前 SceneHost 是整页示例，不是已完成卸载 API 的 SPA 容器，迁移时必须补宿主清理。
- 减少动作固定 boil、纸晃、idle 与夸张位移；动作生命周期、完成/返回/重试仍推进。

## 9. 迁移前最后检查

列出要迁移的每个文件、来源、依赖与新对象负责的参数。自绘艺术层不调用原图集，也不代表运行时已独立于原作：当前 GuideMotion 仍直接导入 vendor。商业/公开项目按 [来源文档](PROVENANCE.md) 处理；原作者绘图生成器未取得，不能写成恢复的组件库。

完成后按 [验证流程](VALIDATION.md) 看局部艺术、真实动作、打断、笔迹与控件，再写当前说明。避免通过大量抽象或测试来绕过这一步。

## 10. 迁移实例：文件管理 SaaS

这是设计方案，不是仓库已实现的新 demo。保持 DOM 文件列表、输入与业务模型；自绘文件夹/纸页作为主艺术层，路径 marks 表达操作。

| 功能状态      | 美术与交互                                                       | 实现要点                                               |
| ------------- | ---------------------------------------------------------------- | ------------------------------------------------------ |
| 未选中 / 聚焦 | 文件夹有侧厚、纸板纹理、同颜料结构线；聚焦只抬纸角，写出短操作名 | 真实 button/link 和稳定 hit area；不让整个列表持续 bob |
| 收藏          | 简笔星由空心到逐笔填入，移出说明擦掉，填星状态保留               | 业务 selected 先更新；失败时从当前墨量回到旧状态       |
| 上传中        | 纸页边缘的线沿实际上传进度画出，数值与取消键常驻                 | 不用独立假 loading timer，未知进度给诚实的等待状态     |
| 上传完成      | 最后一段线闭合，短勾确认，纸页放稳，吊牌稍后回摆                 | 同一 completion 事件驱动确认/接触；真实成功后才发生    |
| 重命名        | 正常可编辑文本；确认后标签擦旧写新，正文仍可复制                 | 用户内容用可读字体，只有取得字形的短标签做真实笔顺     |
| 归档 / 撤销   | 纸页移向文件夹，途中取消从当前 pose 返回                         | 保存位置/速度/折角；业务可撤销，不等待表演完成         |
| 出错          | 保留文件位置，画短红棕圈或叉并显示可读错误与重试                 | 不只改颜色，不强制对象颤抖，不播通用告警鸣叫           |

先做一个文件对象与收藏/归档两段完整交互，通过局部画稿、连续操作和打断审核，再扩展列表。不能复制 Gallery 的场景结构、角色轨道或开场时长。
