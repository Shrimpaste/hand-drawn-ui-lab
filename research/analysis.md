# 原站拆解与本地实现

来源：[Ballpoint Gambit](https://ballpoint-gambit.vercel.app/)，2026-10-03。此文档记录已观察到的事实；没有把作者的游戏逻辑复刻进实验场。

## 事实：不是给普通 DOM 套手绘皮肤

页面主要只有一个带键盘说明的 `<canvas>`。客户端启动代码明确检查 `webgl2`；运行时 `window.__THREE__` 为 `186`。绘制器把同一张纸上的内容分到 `flat` / `world` / `piece` / `text` 四个 instance batch。

原站一个运行时快照包含 143 个 flat、85 个 world、444 个 piece、19 个 text 实例；绘制耗时约 2.3 ms。这只是一次快照，不等于完整帧预算，也不是普遍性能保证。

## 事实：美术是有结构的部件图集

- `cast.atlas.json`：角色部件在图集中的位置、裁切、pivot、像素密度和绘制时间贴图。
- `w-pawn.json` 等：身体轮廓、不同身体姿态的 anchors、眼睛 / 眉毛 / 嘴巴状态、表情和部件顺序。
- `paper/manifest.json`：四块纸张纹理与折痕，图集坐标和纸张底色。
- `world.atlas.json`：太阳、月亮、星绳、鲸鱼、昆虫、植物等周边涂鸦。
- `text/a8/*.png` 与 `text/ramps.json`：文字的单通道透明度图与压力到 RGB 的查表。它不是普通字体。

JSON 的 generator 字段指向 `art/.../bake-*.mjs`；据此可判断至少部分绘图在构建时生成，再烘焙为图集。公开客户端没有包含这些生成器的完整源码，无法声称已拿到原作者的程序化笔触生成库。

## 事实：动作按身体与附件分层

`Puppet` 混合基础姿态、idle delta、timeline delta，再由部件弹簧计算二次运动。身体有 idle / squash / stretch / hurt 等姿态，其 anchors 会一起改变，眼睛和帽子不会像贴在矩形图片上的装饰。

例：蘑菇的 `cap` 弹簧 `k:44, damp:4.6, gain:1, from:'lean'`；`tuft` 为 `k:60, damp:3.4, gain:1.6`。本地保留这些参数。

原站默认姿态采样 12 Hz，轮廓 boil 8 Hz（两个或三个不同手绘版本循环）；RAF 和弹簧按每帧更新。既保留手画逐帧的轻微变化，又让附件动作持续响应。

动作 clip 同时携带时间线和事件：预备 → 起跳 / 滑行 → 到达 → 落地压缩 → 恢复；事件用于 dust、sparkle、impact 和声音。hover / select / napping 等 clip 可以循环，并通过图层清除与 fade 混合。

## 拆分边界

使用 Debugger 的 `getScriptSource` 读取浏览器已正常加载的公开脚本。命令行请求首页遇到了 Vercel checkpoint，因此没有尝试绕过。JSON 从浏览器已观察到的同源资源读取，PNG 使用 pageAssets 导出。资源清单保存在 `asset-inventory.json`。

用 Acorn 解析顶层声明，eslint-scope 解析真正的模块绑定，提取 `Puppet` 和六类 animator 的依赖闭包。不是按文本关键词截取，也没有把同名局部变量当成依赖。得到 684 个绑定、约 498 KB 的原始依赖代码，排除 Three.js 与游戏启动过程。映射记录在 `motion-extraction.json`。

## 本地适配

```text
本地 pointer / keyboard
        ↓
自由移动模型（无游戏规则）
        ↓
Character → 原始 animator / timeline / idle / springs
        ↓
parts → frame + matrix + translation + alpha
        ↓
Canvas 2D atlas renderer
```

纸张、棋盘、固定涂鸦和坐标文字缓存到离屏画布。动态帧只绘制角色、手绘标记、轨迹与简化的周边动作。DPR 上限为 2；页面隐藏时暂停 RAF；触摸使用 pointer capture。

连续位移适配把 `x/y/lift` 每帧采样，身体表情与肢体姿态保持 12 Hz。用户可随意跨多格移动时，这能避免位置跳步；帽子、耳朵、叶子等弹簧保持连续更新。

原始 RGBA 部件直接渲染；文字透明度取 R 通道，颜色按对应 warm / cool / neutral ramp 还原。后续细节适配已启用 R 通道时间图，使用与原 shader 相同的笔迹阈值在 Canvas 2D 展示分辨率下缓存绘制 / 擦除结果。

## 初次验证结果

- 桌面实测选中、自由走格、原始角色动作与撤销成功。
- 十二个角色 × 八个动作 × 普通 / 轻柔模式均输出存在的图集帧与有限变换矩阵。
- 15 个自动化测试通过。
- 390×844 窄屏无横向溢出；点击、移动、键盘选中 / 移动与轻柔切换通过。当前浏览器未提供触摸注入接口，因此没有声称完成真实触摸设备测试。
- 1280×720、DPR 1.5 的早期运行快照：RAF 约 240 fps，平均绘制约 0.98 ms，p95 约 1.3 ms。最终浏览器验证与截图记录在 `validation.json`。

设备帧率、浏览器刷新率、窗口大小会影响这些数值。这里的 draw time 包含本地角色更新和 Canvas 提交，不能直接当作 GPU 渲染完成时间。

## 细节适配与组件复用

- 开场：board 0.3–3.5s，坐标 1.4s 起，角色 1.9s 起分批进入，周边 2.2s 起，状态 3.4s 起。主要输入在 3.6s 之后开放。
- 纸面：保留 0.35s 鼠标缓动，以仿射近似原相机移动；输入使用逆变换。
- 插画按钮：实际 atlas 图标、0.3s 手写提示、0.18s 反向擦除，支持鼠标和键盘。
- 反馈：识别 dust/sound/impact 等原时间线语义事件，dust 扩为多帧 puff；使用事件的真实位置。声音为本地合成。
- 不带游戏的独立组件页：`components.html`；复用与设计规律见 `design-language.md`。
- 19 个测试覆盖新增的中断墨迹、变换命中与粒子生命周期。在 1280×800 当前设备快照中，最密集开场阶段 p95 更新与提交约 4ms；具体四阶段记录见 `detail-opening-validation.json`。
