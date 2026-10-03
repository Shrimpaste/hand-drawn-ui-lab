# UI-lab — hand-drawn web art / interaction art

一个用纸、笔迹、运动、反馈和声音创作网页的本地实验室。Ballpoint Gambit 保留为研究样本；三个原创作品用自己绘制的路径检验这些关系能否离开棋盘继续成立。

## 运行与试玩

需要 Node.js；浏览器运行时没有第三方依赖。

```powershell
npm start
```

打开 [原创实验入口](http://127.0.0.1:5184/lab.html)。`PORT` 可以更改端口。

| 作品       | 入口                                                          | 操作                                                                    |
| ---------- | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 纸上展览   | [Paper Gallery](http://127.0.0.1:5184/demos/gallery.html)     | 悬停写题名，点击拿近；再点击、返回箭头或 Esc 擦说明并归位               |
| 活页笔记   | [Living Notebook](http://127.0.0.1:5184/demos/notebook.html)  | 新增、改写、打勾/划线、橡皮删除、撤销、拖三点或箭头换序；浏览器本地保存 |
| 材质小剧场 | [Material Motion](http://127.0.0.1:5184/demos/motion.html)    | 触碰纸/叶/铃/石/灯/小生命，看不同材质回答；灯可以开关                   |
| 参考还原   | [Ballpoint specimen](http://127.0.0.1:5184/)                  | 原角色与笔迹的自由交互，无棋类规则                                      |
| 参考组件   | [Reference components](http://127.0.0.1:5184/components.html) | 原图集墨迹、插画按钮、独立角色                                          |

原创作品的按钮支持 Tab / Enter；输入框使用正常文字输入。声音默认开，首次点击/按键后解锁，可静音；轻柔动作尊重系统减少动态效果设置。笔记上限八项，undo 历史保留在当前页面会话，内容在 localStorage 保存。

## 三层结构

```text
reference/       来源关系与旧版说明；原样本仍使用 src/ + assets/ + research/
primitives/      可组合的笔迹、纸、线条、惯性、动作事件、余韵、音频
demos/           自画作品与场景定制代码；不加载原图集 / vendor 动作
lab.html         原创实验入口
tests/           行为契约与回归
```

保留旧路径让 reference 还原可追溯，不为了目录形式搬动原始资源。作品的构图、域模型和材质表演留在各自 demo；工具不要求统一布局或同一种 spring。

## 从哪里开始学习

- [REPO_MAP.md](REPO_MAP.md)：模块职责、来源、耦合和两条运行路径。
- [WEB_ART_NOTES.md](WEB_ART_NOTES.md)：从察觉到安静的叙事、注意力、材质、余韵、声音与连续操作。
- [PRIMITIVES.md](PRIMITIVES.md)：工具边界与小例子。
- [ORIGINAL_DEMOS.md](ORIGINAL_DEMOS.md)：三个作品的目的、操作、自评和验证。
- [reference/README-study.md](reference/README-study.md)：原还原阶段的完整使用说明与组件接入。
- [research/analysis.md](research/analysis.md)：原站证据；[design-language.md](research/design-language.md)：原图集的适配格式。

原创 Latin 题名使用自己画的字母路径，书写/擦除按路径弧长进行。任意用户文字采用可读字体和真实输入框；没有通用中文手写笔顺生成器。

## 验证与代码基线

```powershell
npm test
git log --oneline --decorate
```

25 个测试覆盖原12角色动作、连续位移、自由移动/撤销、笔顺与命中，以及原创的惯性、语义事件、不同材质轨迹、逐点衰退、粒子结束、笔记状态/保存。浏览器验证记录在 `research/original-validation.json`，含重复十次操作、真实拖放、键盘、桌面/窄屏、轻柔模式、资源和音频状态。未进行真实触摸设备验证。

本地 Git 使用 `main`；没有配置远端。

- `baseline/ballpoint-lab` / `19cf5a1`：原创阶段前的参考还原，19测试通过。
- `baseline/original-studies`：本阶段完成后的创作实验基线。
- 忽略 node_modules、日志、环境配置、缓存与原始部署 bundle；运行所需图集、源代码、测试、研究证据均已纳入版本。

基线可通过 tag 查看或在另一个 Git worktree 中运行，避免覆盖当前创作。

## 来源

Ballpoint 原始美术与提取动画代码属于 [Ballpoint Gambit](https://ballpoint-gambit.vercel.app/) 作者，来自2026-10-03（Asia/Hong_Kong）公开部署客户端 `/assets/index-BF7G8tOs.js`。未取得原作者绘图生成器或确认原素材再发布授权。旧样本是本地研究适配。

`demos/` 的插画、字母路径和动作研究为这次独立创作，不使用原棋盘、角色、图集或 vendor 动作。新的合成音效与通用工具是本地实现。原站 shader/time-map 格式只留在 specimen adapter；这里不是完整原站源码或它的开源组件库。
