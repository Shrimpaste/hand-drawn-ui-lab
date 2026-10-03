# UI-lab repo map

## 当前入口：2026-10-03 场景重做

旧原创 Gallery/Motion 的布局方向已判定失败，详见 FAILURE_ANALYSIS.md。旧原创源码可通过 baseline/original-studies 查看；当前 lab.html 与 demos/gallery.html → scenes/gallery.js，demos/motion.html → scenes/theatre.js。旧 demos/gallery.js / motion.js / home.js 已删除，Notebook 仍为历史实验。

| 当前模块                             | 职责                                                                                         |
| ------------------------------------ | -------------------------------------------------------------------------------------------- |
| scenes/guide.js / guide-rig.js       | 新角色绘画、真实部件矩阵适配、新锚点与部件状态 |
| scenes/guide-motion.js               | 实际 reference Puppet / pawn 反应与闲置；连续 locomotion 为新增；来源保留 |
| scenes/courtyard.js                  | 有厚度的地面与花坛、屋顶展位、长凳、灯、池塘、浇水壶 |
| scenes/art.js                        | 三幅叙事画、材料道具与家具；角色入口转导出 guide |
| scenes/gallery-model.js / gallery.js | 行走、到达、坐下、观察/擦除返回、画内事件、空间构图                                          |
| scenes/theatre-model.js / theatre.js | 材质动作、事件接触、邻物回应、持续灯光、声像与残留；复用 demos/material-motion.js 的轨迹数学 |
| scenes/host.js / scene.css           | Canvas/语义按钮/纸面逆变换/前后台生命周期，焦点也由笔线表达                                  |
| primitives/living-ink.js             | 对象纸底、多层蜡笔、压力轮廓、三版8Hz绘图与2–4×缓存                                          |
| primitives/stroke-recording.js      | 烘焙绘画时生成真实 Canvas 笔迹时间图；开场阈值推进，不重建纹理 |
| primitives/handwriting.js            | 专门设计的小写笔顺、曲线、自然字距/倾斜、路径长度 reveal/erase                               |
| primitives/foley.js                  | 接触与摩擦采样、非谐波铃、有限音源、静音和重复差异                                           |

下方原参考审阅与旧原创层盘点保留为历史。新场景没有 reference 图集请求，但新角色现在明确导入原站动作求解器；十二角色的深入审计见 CHARACTER_ANIMATION_SOURCE.md，取样见 research/character-motion-audit.json。

审阅基线：`19cf5a1` / `baseline/ballpoint-lab`（2026-10-03）。该提交运行通过 19 个测试。原有文件路径保留，后续目录表达创作关系而非强行搬家。

## 参考入口的数据流（历史基线）

```text
reference specimen                         original creations
index.html → src/main.js                    lab.html → demos/*
components.html → src/components.js                   ↓
       ↓                                         primitives/*
free BoardModel → Character                           ↓
       ↓                                       own Canvas artwork
reference Animator → Puppet → parts → Atlas      semantic actions / audio
       ↓                  ↓
semantic cues       stroke-time textures
       ↓                  ↓
SketchFeedback / SketchAudio → Canvas + sound
```

## 已有实现的逐模块判定

| 路径                                         | 实际职责 / 依赖                                                                       | 来源和耦合                                                                  | 创作处理                                              |
| -------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------- |
| `src/main.js`                                | 加载图集；12 个演员；pointer/keyboard；自由走格；开场、纸面、工具、RAF；静态缓存      | 本地适配，显著绑定棋盘坐标、棋子名称、原站资源 key、56° 地面                | 保留为完整 specimen；仅针对反馈改进，不当作通用 Scene |
| `src/model.js`                               | 8×8 square hit、占用、撤销                                                            | 本地，但格子模型明确耦合棋盘                                                | 不抽成业务通用 primitive                              |
| `src/character.js`                           | `Character` 包装 Puppet、按 rig.type 选六类 animator；continuousTravel；drawCharacter | 包装为本地；动作、角色类别和图集格式均依赖 reference                        | 可以独立演示原角色，不能称为原创角色引擎              |
| `src/vendor/reference-motion.js`             | 684 绑定依赖闭包，六类 / 十二种角色动作及底层骨架                                     | 作者公开客户端提取，约 18k 格式化行                                         | 原貌留存；原始美术/代码归属不变                       |
| `src/atlas.js`                               | JSON/PNG 加载、trim/pivot/ppu、R 通道笔顺、文字 ramp、有限 reveal cache               | 本地 renderer，资源格式参考原站                                             | 是烘焙资产 adapter；新自绘场景无需加载原站图集        |
| `src/ink.js`                                 | 可中断 InkTransition + shader threshold + DrawingSequence                             | 包络可复用；threshold 属 reference 格式；4.8s/3.6s opening 是 specimen 时序 | 抽包络，保留格式和开场适配，不能把开场参数当普适规范  |
| `src/paper-motion.js`                        | 平滑 pointer awareness、矩阵、逆变换                                                  | 本地仿射近似；默认值受 reference 启发                                       | 可复用，幅度、tau、旋转应由场景设定                   |
| `src/illustrated-control.js`                 | DOM button 语义、两块 Canvas、tooltip 包络、hover/focus-visible                       | 生命周期和输入关系通用；文字 key 与 draw 强耦合 Atlas                       | 保留原资源适配，原创文字需路径绘制器                  |
| `src/feedback.js`                            | SketchAudio；原事件 sound/impact/particle → fx rig，三帧 puff                         | 音频本地；粒子种类、ppu、三帧状态名依赖 reference                           | 原 sprite adapter 保留；原创余韵单独用笔点/排线/弧线  |
| `src/components.js`                          | 原太阳与星星组件；十二角色真实行走、睡眠、紧张、removed 与蚂蚁搬离协调，无棋盘 | game-independent，但仍 reference-derived | 作为源码行为实验，不计入原创绘画 |
| `src/style.css`, `src/components.css`        | scene/DOM 对齐、工具提示、窄屏、焦点/状态文案                                         | 本地页面层                                                                  | 不抽成所谓手绘 UI framework                           |
| `index.html`, `components.html`              | 语义按钮、canvas 键盘入口、aria 状态、来源                                            | reference 入口                                                              | 保持旧 URL；新入口独立连接它们                        |
| `scripts/serve.mjs`                          | loopback 静态服务器，无生产部署职责                                                   | 本地工具                                                                    | 保留；Git 初始化后阻止 dot-file/.git 访问             |
| `scripts/extract-motion.mjs`                 | Acorn + eslint-scope 的真实模块绑定闭包                                               | 本地研究工具，依赖已下载公开源脚本                                          | 不纳入运行时；输入源脚本不进 Git                      |
| `tests/*.test.mjs`                           | 所有12角色动作/资源有限值；continuous travel；占用撤销；逆变换；笔顺；dust寿命        | 实际契约回归测试                                                            | 保留；原创场景增加状态与事件边界测试                  |
| `assets/**`                                  | 33 JSON +32 PNG；角色、纸、文字、世界、board                                          | 全是 reference-derived；不存在原站绘图生成器                                | 仅研究样本，不混入原创 artwork                        |
| `research/**`                                | 来源、资源清单、提取映射、开场/交互证据、桌面/窄屏截图与性能快照                      | 有观察与推断，性能限该设备/窗口                                             | 原记录留存；新阶段记录独立命名                        |
| `task_plan.md`, `findings.md`, `progress.md` | 工作进度与发现                                                                        | 本地记录                                                                    | 延续历史，不覆盖旧观察                                |

## 原始动画模块内部边界

对整个提取模块进行了声明/导出盘点，并沿适配入口追踪关键执行路径。大量角色专用动作保留为参考，不逐一改写。

- `yu` seeded random；`H_` body switching；前部 pose/matrix/frame helpers：组合部件实例与 bounds。
- `iv`（约668行）：prop spring，来自身体 lean/acceleration，substep、延迟历史、角度范围、resync/settle。
- `Jv`（约1287行）：Clip，sample/eventsIn 与 then/and/delayed/looped/reversed 等组合。
- `by`/`xy`（约1781/1835行）：handle/timeline，命名层、替换/fade ghost、排队、事件跨时间段分发、姿态量化。
- `Ty`（约2172行）：呼吸、眨眼、目光与耳朵，idle mask 让动作占据注意力。
- `Iy`（约2451行，导出 `Puppet`）：pose + idle + timeline + spring；rig body anchors；instances；地面坐标；事件位置；bounds/hit。
- `UA`/`CM`/`gP`/`UF`/`gL`/`iz`：pawn/knight/bishop/rook/queen/king，两侧各有不同动作；rest 以 side/seed 派发。这是角色创作内容，不能当成六种普适材质 preset。

## 值得带到原创作品的关系

1. 同一动作负责姿态、位移与语义事件；余韵随主动作而生。
2. 身体/主体先做决定，附件从加速度和延迟得到后续运动。
3. continuous travel 与稀疏 pose/boil 是不同通道；低帧的风格不应牺牲命中或位移连续性。
4. 过程可见与状态正确分开：InkTransition 控制显示量，真实按钮/模型决定操作是否完成。
5. 纸面 transform 同时应用于画面和输入逆变换。
6. 安静的背景可缓存；可中断动作应从当前画面继续，不能每次退回 rest。

## 原创阶段的实物层

| 层             | 文件                                                        | 数据流 / 判断                                                                                |
| -------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| entry          | `lab.html` → `demos/home.js`                                | 三个原创作品的入口；自绘纸片与物件                                                           |
| gallery        | `demos/gallery.html` → `gallery.js` → `art.js`              | spring 聚焦/归位、InkTransition 题名、弱化其他作品；无棋盘/Atlas                             |
| notebook       | `demos/notebook.html` → `notebook.js` → `notebook-model.js` | 真实输入、localStorage、事项历史；自绘勾/划/擦/拖；域模型留在 demo                           |
| motion         | `demos/motion.html` → `motion.js` → `material-motion.js`    | 六种不同场景 pose、Action beats、二次运动、音频/地面余韵；不抽成固定材质库                   |
| artwork        | `demos/art.js`                                              | 自画植物、蛾、窗、纸、铃、石、灯、小生命；作者路径可直接研究修改                             |
| host           | `demos/runtime.js`、`studies.css`                           | canvas/DOM 共用纸变换，真实按钮/焦点，resize、隐藏暂停、音频解锁；宿主示例，不强制 framework |
| tools          | `primitives/ink.js`、`paper-motion.js`                      | 本地已验证通用能力从 src 移入；原 src 导出兼容 API                                           |
| tools          | `primitives/sketch.js`、`lettering.js`                      | seeded 笔画、排线、柔和曲线、纸/胶带；自画字母真实路径写/擦，无原图集                        |
| tools          | `primitives/motion.js`                                      | scene-tuned Spring、每次 crossing 发一次事件的 Action                                        |
| tools          | `primitives/residue.js`、`audio.js`                         | 有界短余韵、每点 birth 轨迹、轻柔语义 Foley；sound adapter 兼容原 API                        |
| tests/evidence | `tests/creative-tools.test.mjs`、`research/original-*`      | 6个原创契约测试 + 三作品实际交互、重复/窄屏记录；总25测试                                    |

本阶段原样保留 `src/vendor/reference-motion.js` 与全部 reference assets。微反馈改进只在本地 adapter：轨迹每点衰减、角色下方地面短痕、柔和的语义音频；没有更改原作者骨架/animator 参数。
