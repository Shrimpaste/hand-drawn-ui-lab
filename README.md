# UI-lab — 可游玩的纸上场景

研究 Ballpoint Gambit 的对象绘制、笔迹、轮廓生命感与交互，再用原创画面实现两个可以停留和探索的小世界。原站还原保留在 `/`，新入口直接进入画廊。

上一轮原创 demo 被判定为方向性失败：它们是淡色页面布局，缺少精细对象、真正的笔迹、场景关系和材料声音。失败版本保存在 `baseline/original-studies`，分析见 [FAILURE_ANALYSIS.md](FAILURE_ANALYSIS.md)。

## 运行

```powershell
npm start
```

打开 [纸上画廊](http://127.0.0.1:5184/lab.html)。浏览器运行时无第三方依赖。服务器只监听本机 5184，可用 PORT 更改。

| 场景                                                                                     | 操作                                                                                                                                  |
| ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| [Courtyard Gallery](http://127.0.0.1:5184/demos/gallery.html)                          | 点击地面或方向键行走；点作品先走近再观察；触碰画面唤醒园丁/寄信/吹动小船；返回或 Esc 擦字；长凳可坐，doze/nervous/ants 演示角色状态 |
| [Living Material Scene](http://127.0.0.1:5184/demos/motion.html)                         | 触碰阁楼工作台的纸船、叶、悬铃、石头、灯、小动物；石头带动台面和邻物，灯光引起注视，落脚带动纸角                                      |
| [局部绘制与试听](http://127.0.0.1:5184/scenes/studio.html)                               | 桌面对照固定/活轮廓；看放大的角色、蜡笔覆盖、笔迹重写；逐项试听材料声音                                                               |
| [原参考还原](http://127.0.0.1:5184/) / [参考组件](http://127.0.0.1:5184/components.html) | 十二角色可分别行走、打盹、紧张、removed→蚂蚁搬离；保留原图集、笔顺与角色动作，无完整棋类规则 |

所有操作都有语义按钮，可用 Tab / Enter。Gallery 也支持 1–3 选作品，Material 支持 1–6 触发物件。声音需首次真实手势解锁；sound on/off 与 alive/still 直接在纸上。still 减少轮廓变化与位移，保留真实状态。旧 Notebook 仅作为历史实验保留，不计入本轮成果。

## 代码怎么读

```text
scenes/guide.js / guide-rig.js  新角色插画与部件锚点
scenes/guide-motion.js         原站 Puppet + 反应轨道，新增连续步态
scenes/courtyard.js            透视地面、屋顶展位、庭院家具与植物
scenes/art.js                  三幅场景画、材质道具与家具
scenes/gallery*.js             行走 → 停留 → 观察 → 擦除返回
scenes/theatre*.js             动作事件 → 声音 / 邻物回应 / 余韵
scenes/host.js                 纸面变换、可访问按钮、输入、生命周期
primitives/living-ink.js       多层蜡笔、压力轮廓、三版绘图缓存
primitives/stroke-recording.js 烘焙时记录真实笔画时间，开场只推进时间图
primitives/handwriting.js      手工小写笔画、自然字距、逐笔写/擦
primitives/foley.js            摩擦、鞋底、石/木接触、非谐波铃音
src/ + assets/                 独立保留的 Ballpoint 参考适配
```

新场景不加载原站图集；新角色明确复用保留来源的 `src/vendor/reference-motion.js` 求解器与 pawn 反应轨道。插画、锚点、连续步态和场景协调由本地编写。显眼文字使用原创路径；字库支持拉丁小写、数字、所需标点，中文仍需单独设计笔顺。

场景初次加载及 draw again 会逐笔画出。静置14秒打盹，靠近或操作唤醒；Z/T/A 可演示睡眠/紧张/蚂蚁搬运。参考组件的自动睡眠为18秒。

## 设计与验证记录

- [SCENE_PLAN.md](SCENE_PLAN.md)：空间草图、角色、探索路径和物体关系。
- [HANDWRITING_NOTES.md](HANDWRITING_NOTES.md)：笔迹设计、写入/擦除和字库边界。
- [MICRO_LIFE_NOTES.md](MICRO_LIFE_NOTES.md)：稳定填色、低频轮廓、连续目光/身体/附件。
- [CHARACTER_ANIMATION_SOURCE.md](CHARACTER_ANIMATION_SOURCE.md)：十二角色实际源码分析、分层混合、父子附件、不同运动参数及蚂蚁协调；附可重跑的取样审计。
- [AUDIO_REWORK_NOTES.md](AUDIO_REWORK_NOTES.md)：删除旧 UI 音色，按材料和接触重做。
- [ORIGINAL_DEMOS.md](ORIGINAL_DEMOS.md)：两场景实际操作、视觉审查和验证限度。
- [REPO_MAP.md](REPO_MAP.md) / [PRIMITIVES.md](PRIMITIVES.md)：来源和接口。

```powershell
npm test
```

37 项测试覆盖十二角色的动作/图集、角色打断与恢复、行走/到达、反复触发、邻物回应、轮廓、笔画时间图与有限音频采样。功能测试不能代替视觉或实际试听。当前验证见 `research/refined-validation.json`，当前截图为同目录的 refined-*；上轮记录保留在 `scene-validation.json`。[7.2秒声音试听](research/scene-foley.wav) 为上轮独立 Foley 小样，本轮未声称音效与原作相同。

## 本地 Git

main 分支，无远端。

- `baseline/ballpoint-lab` / `19cf5a1`：原参考还原。
- `baseline/original-studies` / `9c519c5`：上一轮失败的原创方向，可用于对照。
- `baseline/playable-scenes` / `732a1c4`：上一轮场景重做检查点。
- `baseline/spatial-characters`：本轮源码学习、角色和庭院修订检查点。

## 来源

Ballpoint 原美术与提取动画属于 [Ballpoint Gambit](https://ballpoint-gambit.vercel.app/) 作者；公开客户端来自 2026-10-03（Asia/Hong_Kong）。保存的参考素材供本地研究，未取得原绘图生成器。新 scenes 的路径、角色、场景画、物件与 Foley 为本轮独立创作；不是原作绘图源码或其开源组件。
