# Bio 原创实验：Block 与 Room

2026-10-09，用户指出 UI-lab 本地原创实验的质量不及 bio-showcase 最终成果。当前原创完成度参考改为这里的两页；Gallery 和 Studio 保留为旧机制实验与局部检查台，不再以此前测试通过代表同等美术完成度。

这是用户本地 `C:\Users\Lenovo\Desktop\all-bio-showcase\demo-4-claude` 的源码副本，源提交 `52141ce11b3dc66e65dfe8c85a296b1e2d3c9486`（`Give block close-up headers more breathing room`）。两边不链接、不自动同步。逐文件原始/迁入 SHA-256 和适配说明见 [source-manifest.json](../experiments/bio/source-manifest.json)。后续修改以 UI-lab 副本为准，同时记录与导入快照的差异。

## 运行与操作

在 UI-lab 根目录执行 `npm ci`、`npm start`，无需 Vite 或 bio 原目录：

| 页面 | 内容与操作 |
| --- | --- |
| [Block](http://127.0.0.1:5184/experiments/bio/block.html) | 肝细胞碳流、正常/患儿、进食/禁食感染、补糖；圆圈进入反应特写，特写结束后重播或看下一处；“看结构”进入 Room |
| [Room](http://127.0.0.1:5184/experiments/bio/room.html) | FBP1 四聚体，拖动旋转；底物、水解、AMP、突变、重置；“共同瓶颈”返回 Block |

两页支持 `→` / 空格 / PageDown 下一句，`←` / PageUp 上一句，Home 回第一步，T 展开/收起讲义。Block 特写中 Esc 退出。顶部重画、声音、减少动画是相同的简笔语言；声音和动作偏好仍使用源项目的 `fbp1-sound` / `fbp1-still` 本地键。两页都没有注册原大厅，顶部大厅按钮隐藏；Room 无特写时 Esc 没有页面跳转。UI-lab 其它入口从 README 访问。

原构图为 1280×800，保持比例适配窗口。窄屏会缩小全页并提示横屏，不是已经实现的移动端重排，不能据无横向溢出声称文字和点击区已适合手机。

## 复制边界与适配

- `experiments/bio/src/` 保留 `engine`、`engine3d`、两页场景、内容与结构 JSON 的实际静态依赖闭包。Block 的 `bakeFBP1` 调用 Room 的 `StructureView`，不能只复制两张 HTML。
- `scenes/kit.js` 的静态导入带入 `content/rooms.js`；这只是共享模块依赖，不代表已迁入大厅和所有展室。
- `public/` 只带运行所需的小赖字体子集和 OFL 全文；`references/` 带完整源字体与三份 PDB；`scripts/` 带字体/结构生成脚本；`tests/` 带闭包内的 20 份原测试。
- 不复制原 `.git`、`node_modules`、`dist`、输出目录、报告 PDF/DOCX、大厅入口和其它场景。两页未加载 `hanzi.json`，未带入无用笔画数据或其生成脚本。
- HTML、CSS 改为副本内的相对 URL；入口去掉 JS 的 CSS import（HTML 已加载），JSON 改为原生 `with { type: "json" }`，移除 Vite 专属的 `import.meta.env.DEV` 调试挂载。需要支持 JSON import attributes 的现代浏览器。
- 自查修复 `Control.update`：步骤/键盘改变模型时同步 `aria-pressed`；增加独立 `isPressed`，让减少动画按钮的语义与 `reduced` 对应，而保留原 `isOn` 的绘图状态。新增 1 项本地回归。总计复制 86 个源文件，7 个有记录的适配/修正，其余 79 个按字节保存。
- UI-lab 静态服务器增加 WOFF2 MIME；其它原作、工具和场景代码不因导入修改。服务无热更新，修改后主动刷新；修改服务器后重启。
- `.gitattributes` 为副本关闭文本行尾转换，保证干净 checkout 的字节仍符合清单；保留 PDB 固定列空格和许可原文，PDB 作为数据不输出常规文本 diff。

`npm test` 同时执行现有 Node 测试与迁入 Vitest 测试。`npm run test:bio` 只跑两页相关测试；`npm run check:bio` 检查导入快照哈希与模块/页面资源闭包。`npm run bio:structure` 从三个本地 PDB 重建结构 JSON；`npm run bio:font` 从随附完整字体生成子集。改动文案后重建字体；生成器仍扫描保留的 `content/rooms.js`，不会改变场景范围。这些命令不访问原项目目录。

## 源码机制 → 功能设计 → 验证关系

| 实际机制 | 在两页中怎样服务目标功能 | 检查什么 |
| --- | --- | --- |
| `engine/recorder.js` → `InkSprite` 只从第 0 稿记录时间图，缓存其它画稿 | 分子、细胞器与纸件以绘图调用顺序出现；运行时选择缓存稿 | 开场与重画实际过程、逆向擦除；`engine-core` 回归。不能把所有结构渲染都称为时间图播放 |
| `build-structure.mjs` → PDB 解析、BIOMT、Kabsch 对齐 → `fbp1-structure.json` | 三个晶体输入统一坐标；保留 Cα、B-factor 与位点原子；相同结构用于整体、局部与 Block 酶小图 | 本地重建、`pdb` / `linalg` / `structure` / `measure` 测试；数据不是手绘原创资产 |
| `conformerFrames` → `Flicker` → `StructureView.buildRuns/draw` | 固定种子的相关残基偏移改变整条带状链的内部几何，B-factor 调整幅度；各链独立停留，深度桶共画轮廓/颜料/结构线 | 静稿结构、正常速度的链变化、拖动后稳定；`structure-motion` / `picking` 回归。偏移是美术示意，不是实测动力学轨迹 |
| `PACE` 区分蛋白、配体、圈线；`hoverRate` 不加速蛋白 | 主体较慢地换稿，指示圈更敏捷；连续四元数旋转、聚焦弹簧与离散稿分开 | 静置/指向/拖动对比、减少动作；不要把 UI-lab 的约 8 Hz 扩成统一规范 |
| `BeatTrack` + 内容 `state/rxnTo/spots/measure` → `StructureRoom.showBeat` → `Ligands` / `reactionPose` | 每句叙述给模型目标，再驱动镜头、结合、反应阶段和测量提示；讲义与短句共用步骤 | 上一句/下一句、快速切换底物/AMP/突变/重置，目标状态不等待文字动画；`beats` / `reaction` / `stage-logic` 回归 |
| `FlowSim.update` 的合并/堵塞/释放/回流事件 → Block 路线与分子绘制 | 三碳合并为六碳，缺陷时瓶颈积累，容量有上限；补糖另从血液输入 | 正常/患儿、进食/禁食和补糖实操；`block-flow` / `block-model` 回归。分子数量和速度不代表真实通量 |
| `Timeline` + `focusTransform.apply/invert` + 场景镜头 springs | 反应特写按句推进，到相位端点等待；下一处和返回沿当前镜头目标衔接 | 点击进入、方向键前后、Esc 中断、特写结束选项；`block-closeup` 检查时间/逆变换边界 |
| `Caption` / `HandLabel` 的 `pending` 和 `InkTransition`；讲义展开抑制短句 | 旧说明先擦、新说明再显示，讲义展开时为正文让位 | 快速反向、展开/收起与键盘焦点；`label-swap` / `fontlayout` 测试。字体模式不是笔顺 |
| `App.start/warm` → `warmPlan/afterWarm` → `FrameGovernor` | 加载页先烘焙、演练重点视图，再重置临时状态；按帧耗时降 DPR/绘制层次 | 首次进入正确回到第一步、无预演残留、重画可用；`boot` / `perf` 回归。性能分档不等于美术合格 |

真正学到的是：复杂主体可以由领域数据建立结构，媒体纹理与内部画稿共同承担完成度；交互可以围绕“观察、解释、比较”组织，不依赖角色或 Gallery。新对象应重新设计自己的结构、节奏、语义与输入，不能把蛋白的 B-factor 或反应模型当成通用 SaaS 动画。

## 已知边界

这两页整体质量作为当前原创参考，但不是全规范合格证书。两入口调用 `useFontLabels('"小赖"')`；`HandLabel.drawFont` 用逐字矩形裁切，DOM 讲义用逐字符 opacity/color 过渡。引擎有路径书写能力，却没有为两页启用中文笔画数据；`writing.test.js` 的假中线只验证布局，不能证明真实中文写字。结构首次进入沿残基序列逐段绘出，也不是原作者绘图生成器恢复。

独立引擎没有导入 UI-lab 的 Ballpoint vendor 或原图集，但字体、PDB 和教学内容仍需各自追溯；“原创实验”指本地项目设计/代码范围，不将外部数据归为原创。声音事件与静音可检查，舒适度需要真人试听；未做物理触屏验证。窄屏、减少动作与其它已知偏差见 [当前验证](VALIDATION.md)。
