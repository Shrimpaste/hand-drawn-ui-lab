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
| [Paper Gallery Scene](http://127.0.0.1:5184/demos/gallery.html)                          | 点击地面或方向键让围巾参观者走动；点作品，走近、停下、观察；再点画面唤醒园丁/寄信/吹动小船；返回或 Esc 擦掉说明、回到展厅；长凳可以坐 |
| [Living Material Scene](http://127.0.0.1:5184/demos/motion.html)                         | 触碰阁楼工作台的纸船、叶、悬铃、石头、灯、小动物；石头带动台面和邻物，灯光引起注视，落脚带动纸角                                      |
| [局部绘制与试听](http://127.0.0.1:5184/scenes/studio.html)                               | 桌面对照固定/活轮廓；看放大的角色、蜡笔覆盖、笔迹重写；逐项试听材料声音                                                               |
| [原参考还原](http://127.0.0.1:5184/) / [参考组件](http://127.0.0.1:5184/components.html) | 保留原图集、笔顺与角色动作适配，自由交互，无完整棋类规则                                                                              |

所有操作都有语义按钮，可用 Tab / Enter。Gallery 也支持 1–3 选作品，Material 支持 1–6 触发物件。声音需首次真实手势解锁；sound on/off 与 alive/still 直接在纸上。still 减少轮廓变化与位移，保留真实状态。旧 Notebook 仅作为历史实验保留，不计入本轮成果。

## 代码怎么读

```text
scenes/art.js                  单独设计的角色部件、三幅场景画、材质道具与家具
scenes/gallery*.js             行走 → 停留 → 观察 → 擦除返回
scenes/theatre*.js             动作事件 → 声音 / 邻物回应 / 余韵
scenes/host.js                 纸面变换、可访问按钮、输入、生命周期
primitives/living-ink.js       多层蜡笔、压力轮廓、三版绘图缓存
primitives/handwriting.js      手工小写笔画、自然字距、逐笔写/擦
primitives/foley.js            摩擦、鞋底、石/木接触、非谐波铃音
src/ + assets/                 独立保留的 Ballpoint 参考适配
```

两个新场景不加载原站图集或 vendor 动作。显眼文字使用原创路径，不使用字体伪装成笔迹。字库当前支持拉丁小写、数字、所需标点，中文仍需单独设计笔顺。

## 设计与验证记录

- [SCENE_PLAN.md](SCENE_PLAN.md)：空间草图、角色、探索路径和物体关系。
- [HANDWRITING_NOTES.md](HANDWRITING_NOTES.md)：笔迹设计、写入/擦除和字库边界。
- [MICRO_LIFE_NOTES.md](MICRO_LIFE_NOTES.md)：稳定填色、低频轮廓、连续目光/身体/附件。
- [AUDIO_REWORK_NOTES.md](AUDIO_REWORK_NOTES.md)：删除旧 UI 音色，按材料和接触重做。
- [ORIGINAL_DEMOS.md](ORIGINAL_DEMOS.md)：两场景实际操作、视觉审查和验证限度。
- [REPO_MAP.md](REPO_MAP.md) / [PRIMITIVES.md](PRIMITIVES.md)：来源和接口。

```powershell
npm test
```

32 项测试覆盖原样本与新场景的行走/到达、反复触发、邻物回应、轮廓幅度、笔迹与有限音频采样。功能测试不能代替视觉或实际试听。浏览器验证保存在 `research/scene-validation.json`，截图同目录；[7.2秒声音试听](research/scene-foley.wav) 由 `node scripts/render-foley.mjs` 生成。

## 本地 Git

main 分支，无远端。

- `baseline/ballpoint-lab` / `19cf5a1`：原参考还原。
- `baseline/original-studies` / `9c519c5`：上一轮失败的原创方向，可用于对照。
- `baseline/playable-scenes`：本轮场景重做检查点。

## 来源

Ballpoint 原美术与提取动画属于 [Ballpoint Gambit](https://ballpoint-gambit.vercel.app/) 作者；公开客户端来自 2026-10-03（Asia/Hong_Kong）。保存的参考素材供本地研究，未取得原绘图生成器。新 scenes 的路径、角色、场景画、物件与 Foley 为本轮独立创作；不是原作绘图源码或其开源组件。
