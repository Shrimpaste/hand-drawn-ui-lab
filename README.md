# Ballpoint Motion Study

对 [Ballpoint Gambit](https://ballpoint-gambit.vercel.app/) 的本地 UI / 动画拆解实验。保留原站公开客户端里的角色、笔触、纸张、手写字与动作时间线，替换为不带棋类规则的自由交互。

## 运行

需要 Node.js。运行时没有第三方依赖。

```powershell
npm start
```

打开 http://127.0.0.1:5184 。端口可以通过 `PORT` 环境变量更改。当前工作区已启动这个地址。

独立组件实验台：http://127.0.0.1:5184/components.html 。展示墨迹绘制 / 擦除、可操作的插画按钮与角色反馈，不依赖棋盘。

## 交互

- 悬停：打招呼、目光跟随。
- 纸面随鼠标轻微晃动，输入命中随纸面一起变换。
- 首次加载：边框 → 格线 / 排线 → 坐标与小生命 → 周边涂鸦 / 状态字；点画笔插画可以重播。
- 选项按钮：插画承载功能，悬停或键盘聚焦时写出提示，移开后按笔顺反向擦除。
- 点击角色，再点击任意空格：移动、预备、跳跃、落地、帽子等部件的后续摇晃。
- 拖放：直接移动到空格；放到棋盘外或被占用的格子会回到原位。
- 庆祝 / 打个盹 / 小把戏：选中时操作单个角色；没有选中时操作全体。
- 撤销 / 重画：恢复位置或重置场景。
- 声音：默认开启，首次点击或按键后解锁；可以关闭，开关保存在本地。包含悬停、选择、脚步、落地与轻微纸笔声，是本地合成音效。
- 轻柔：减小动作幅度；初始值尊重系统减少动态效果设置。
- 键盘：方向键移动光标，Enter / 空格选中或移动，Esc 取消；C 庆祝，Z 睡觉，G 把戏，U 撤销，N 重画，M 声音。

## 已拆出的组件

| 文件 | 用途 |
| --- | --- |
| `src/character.js` | 可独立使用的 `Character`、动作适配、连续位移、角色绘制 |
| `src/atlas.js` | 图集裁剪、部件矩阵绘制、手写字的透明度 / 颜色压力曲线 |
| `src/ink.js` | 可中断的写入 / 擦除包络、开场分段时间线 |
| `src/paper-motion.js` | 鼠标跟随缓动与可逆纸面变换 |
| `src/illustrated-control.js` | 可复用的插画按钮、原图集提示文字、键盘聚焦与禁用状态 |
| `src/feedback.js` | 原动画事件到多帧尘点 / 特效，以及本地合成音效 |
| `src/components.js` | 不依赖游戏的三种组件使用示例 |
| `src/vendor/reference-motion.js` | 从公开部署脚本提取的原作者骨架、弹簧、动作时间线与六类动画器 |
| `src/model.js` | 自由格子移动与撤销，独立于棋类规则 |
| `src/main.js` | 实验场输入、动画循环、场景与控制按钮 |
| `research/analysis.md` | 原站证据、渲染结构与本地适配说明 |
| `research/design-language.md` | 用于其他项目的美术与交互设计规则、资产格式与接入方式 |
| `scripts/extract-motion.mjs` | 用 AST 和真实模块绑定做依赖闭包提取，避免误抓同名局部变量 |

十二个角色均使用原图集部件和动作参数。没有内嵌原站游戏、AI、规则、存储或联网对弈；页面启动后所有图片与 JSON 都从本地读取。

### 单独使用角色

```js
import { Character, drawCharacter } from './src/character.js';
import { Atlas, readJSON } from './src/atlas.js';

const atlas = await Atlas.load('/assets/chars', 'cast');
const rig = await readJSON('/assets/chars/w-pawn.json');
const sprout = new Character(rig, { seed: 127, x: 0, y: 0 });
sprout.play('victory');

// 在你的 requestAnimationFrame 中：ctx 已按你的世界坐标缩放。
sprout.update(dt);
sprout.lookAt(pointerX, pointerY);
drawCharacter(ctx, atlas, sprout, { groundScale: 0.829 });
```

角色 API 包含 `hover`、`select`、`deselect`、`move`、`victory`、`napping`、`gag`、`refuse` 等。移动 clip 的 `off` 是起点相对终点的偏移；详细适配见 `src/main.js` 的 `movePiece()`。

### 单独使用插画按钮

```js
import { IllustratedControl } from './src/illustrated-control.js';

// world / lettering 是已经加载的 Atlas；button 是普通 <button>。
const control = new IllustratedControl(button, {
  atlas: world,
  icon: 'btn-undo.rest.0.b0',
  hoverIcon: 'btn-undo.hover.0',
  lettering,
  textKey: 'undo.warm.a',
  label: '撤销', // 语义文本供屏幕阅读器使用。
});
button.onclick = () => yourHistory.undo();
// 每帧：
control.update(dt);
// 销毁时：control.dispose();
```

组件样式见 `src/components.css` 的 `.illustrated-control / .control-art / .ink-tooltip`。图标可由 `icon(state, active)` 按状态选择，也可传 `drawIcon(ctx, options)` 绘制自己的组合插画。提示文字来自已烘焙的笔迹资源；新文案需提供自己的图集 / 时间图，当前没有通用手写中文字体生成器。

## 验证

```powershell
npm test
```

19 个测试覆盖十二种角色动作、连续位移、移动 / 撤销，以及中断墨迹恢复、纸面输入逆变换、笔顺开场与尘点事件生命周期。实测开场四阶段记录见 `research/detail-opening-validation.json`。

## 来源与范围

原始美术和提取的动画代码属于 Ballpoint Gambit 作者；本项目是本地研究用的适配，不是从零绘制的复刻。提取时间：2026-10-03（Asia/Hong_Kong）。源部署脚本：`/assets/index-BF7G8tOs.js`。未发现公开源映射，也没有取得原作者的绘图生成器源码。未确认这些原始素材的再发布授权。

本地采用 Canvas 2D 和静态层缓存；原站采用 Three.js / WebGL2。现已适配真实时间图逐笔绘制和反向擦除，保留开场主要时序。完整透视相机、周边角色导演系统和原音频引擎仍采用简化实现。移动与肢体表演来自原动画，音效是本地合成。危险 / 流汗与击杀动作没有接入当前交互。
