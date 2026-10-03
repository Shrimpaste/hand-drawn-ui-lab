你现在接手的是 UI-lab 的下一阶段。

当前阶段已经完成了对 Ballpoint Gambit 的较高质量本地还原，并已经具备：
- 手绘纸张与线稿视觉语言
- Canvas 绘制与动画运行时
- Character / Puppet / Animator 等角色动画结构
- InkTransition 一类手写 / 擦除交互
- PaperMotion
- IllustratedControl
- SketchFeedback / particle feedback
- SketchAudio
- 原站研究截图、局部行为记录、validation 结果等

下一阶段请不要继续把项目理解成“复刻 Ballpoint Gambit”。

目标是：

1. 保留 Ballpoint Gambit 作为 reference specimen；
2. 梳理并提炼其中真正值得复用的 Web Art / interaction art 能力；
3. 将 UI-lab 整理成一个可以用于后续创作的 web 美术实验 repo；
4. 基于这些能力设计并实现若干“原站不存在”的原创 demo；
5. 用原创 demo 检验我们是否真正理解了这套视觉叙事、运动节奏和交互反馈，而不只是复制了原站。

--------------------------------------------------
一、核心判断
--------------------------------------------------

这一阶段不要过度追求参数级复刻。

不要把：
- 某次落地用了多少 ms
- 某个 dust 延迟多少帧
- 某个帽子 secondary motion 的固定时长
- 某个 spring 参数

固化成所谓“普适标准”。

这些参数依赖具体对象、材质、场景、情绪与叙事角色。

真正值得拆解的是：

- 为什么一个交互看起来有预备、有发生、有余韵；
- 为什么对象的运动让人感觉有重量、材质和性格；
- 为什么视觉反馈、粒子、声音、手写过程能够自然地支持主动作；
- 为什么画面不会同时有太多元素抢注意力；
- 为什么 hover / click / loading / transition 可以像一段微型动画叙事；
- 为什么 hand-drawn UI 即使脱离棋盘和角色，也依然成立。

请优先提炼这些“关系”和“创作方法”。

--------------------------------------------------
二、先做代码与文档梳理
--------------------------------------------------

先完整审阅当前 repo。

不要只看 README 或少数入口文件。

请先建立：
- 目录结构
- 核心代码路径
- 动画系统
- 绘制系统
- 交互系统
- 音频系统
- feedback / particle
- reference research
- demo / test / validation
之间的对应关系。

重点检查但不限于：

src/main.js
src/character.js
src/vendor/reference-motion.js
以及与：
- Animator
- Puppet
- Character
- InkTransition
- PaperMotion
- IllustratedControl
- SketchFeedback
- SketchAudio
有关的实现。

先输出一份 repo map，说明：
- 哪些是 reference-derived
- 哪些已经具有通用性
- 哪些仍然和 chess / 原站耦合
- 哪些适合抽成创作 primitive
- 哪些应该保留原貌作为研究样本

不要为了“代码干净”过早重构 reference code。

原站还原部分需要继续保持可追溯性。

--------------------------------------------------
三、重构 repo 的定位
--------------------------------------------------

把 UI-lab 逐渐整理成三层：

1. reference
   用于保存 Ballpoint Gambit 的研究与还原样本

2. primitives / tools
   用于保存可复用的绘制、动画、交互、反馈与音频能力

3. original demos
   用于验证这些能力是否可以脱离原作继续创作

建议但不强制采用类似：

/reference
  /ballpoint-board
  /option-writing
  /character-motion
  /ambient-details

/primitives
  /ink
  /paper
  /sketch
  /motion
  /feedback
  /audio
  /scene

/demos
  /gallery
  /little-town
  /living-notebook
  /motion-studies

实际目录请根据现有 codebase 做合理设计，不要为了匹配此示例强行迁移。

--------------------------------------------------
四、提炼 primitives，但不要把它做成死板 framework
--------------------------------------------------

目标是建立“创作者工具箱”，不是建立一套参数僵死的 UI framework。

值得抽象的可能包括：

Ink / drawing:
- write
- erase
- underline
- circle
- cross-out
- sketch mark
- hand-drawn path reveal

Paper:
- paper texture
- paper motion
- fold / lift / pin / tape 等可能的纸张表达

Sketch:
- rough line
- hatch fill
- hand-drawn frame
- hand-drawn icon
- seeded visual imperfection

Motion:
- anticipation
- travel
- settle
- follow
- secondary motion
- spring / inertia
- idle motion

Feedback:
- dust
- sparkle
- trail
- impact
- scribble
- small residue / decay

Audio:
- paper
- writing
- erase
- soft impact
- tiny UI feedback
- ambient detail

Scene:
- focus / attention hierarchy
- pointer awareness
- layered motion
- environmental reaction

这些 primitive 应该：
- 参数可调
- 可以组合
- 不默认绑定 chess
- 不把某个原站参数当成唯一正确答案

--------------------------------------------------
五、重点研究：视觉叙事如何自然
--------------------------------------------------

请写一份创作型文档，不要写成纯 API 文档。

建议文件名：

WEB_ART_NOTES.md

它应该讨论：

1. Interaction as narrative
用户输入后，界面如何：
察觉 → 预备 → 动作 → 反馈 → 余韵 → 安静

2. Attention hierarchy
哪些元素应该主导，哪些只做 secondary feedback

3. Material-aware motion
纸、布、木头、金属、叶子、角色、图标应有不同运动性格

4. Residual feedback
主体动作结束后，粒子、声音、附件、笔迹如何继续短暂存在

5. Visible process
手写、擦除、圈选、折纸、盖章等“过程可见”的状态变化

6. Ambient life
静止页面怎样保持轻微生命感，又不干扰用户

7. Audio-visual coherence
声音如何支持动作，不喧宾夺主

8. Repetition tolerance
同一个交互连续执行多次是否仍然舒服

9. Hand-drawn imperfection
怎样保留手绘感，同时避免真正的抖动、噪声和视觉疲劳

10. Scene-specific tuning
为什么参数应该随对象与场景变化

请尽量从当前 reference implementation 和实际观察出发，不写抽象空话。

--------------------------------------------------
六、做原创 demo
--------------------------------------------------

这一阶段必须做原创内容。

目标不是做大产品，而是验证风格和交互语言是否已经脱离原作。

优先实现以下 3~4 个 demo：

A. Hand-drawn Gallery
目的：
测试 hand-drawn UI、页面 transition、write / erase、hover、focus。

建议元素：
- 手绘作品卡 / 纸张
- 胶带 / 图钉
- hover 时轻微 lift 或 tilt
- 标题手写出现
- 点击后作品成为视觉主角
- 关闭时文字擦除或纸张归位
- 避免标准 modal / card / navbar 的感觉

B. Little Town
目的：
测试 scene composition、ambient motion、角色动画、环境反馈、声音。

建议：
- 一条小街即可
- 房子、树、路牌、邮筒、窗户
- 少量角色
- hover / click 时产生环境反应
- 窗灯、树叶、牌子、角色都要有自己的运动性格
- 不需要复杂 gameplay

C. Living Notebook
目的：
验证这套风格能否成为真正可用的 interface。

建议：
- TODO
- note
- sketch
- arrow
- sticky note
- checkbox
- delete
- rearrange

交互应该尽量采用：
- 打勾
- 划掉
- 擦除
- 重写
- 贴上
- 撕下
- 拖动纸片
而不是传统 UI transition。

D. Motion Studies
目的：
测试“不同对象有不同运动语法”。

至少放：
- paper
- leaf
- bell
- stone
- lamp
- little creature

要求：
同一种 input 不应该触发完全相同的 spring preset。
动作要体现材质、重量与性格差异。

--------------------------------------------------
七、原创 demo 的评价标准
--------------------------------------------------

不要只做 screenshot QA。

每个 demo 完成后，请从以下问题进行自评并记录：

- 用户操作前，界面是否给出了自然的响应预期？
- 主动作是否有清晰的视觉重心？
- secondary feedback 是否辅助主动作？
- 是否有元素同时抢戏？
- 对象的运动是否符合它的材质、重量、性格？
- 是否存在适当的 anticipation？
- 是否存在适当的 settle / residual feedback？
- 声音是否强化动作？
- 连续操作十次后是否仍然舒服？
- 静止状态是否足够好看？
- 去掉卡通角色后，这套视觉与交互语言是否依然成立？
- 是否出现“普通网页 + 手绘皮肤”的退化？

如果某个 demo 看起来只是：
标准 DOM layout + rough border + hand-written font
则视为失败，需要重新设计。

--------------------------------------------------
八、特别关注原站还原中仍然较弱的部分
--------------------------------------------------

当前 Local Lab 对整体视觉和运动已经较好，但部分 micro-feedback 仍弱于原站。

尤其关注：
- movement trail
- takeoff / landing dust
- impact feedback
- residual particle decay
- audio feedback
- writing / erasing 的过程感
- 主动作与 secondary motion 的时间关系

这里的目标不是做参数级 fidelity audit。

请通过原站观察这些反馈在视觉叙事中承担什么角色，并用更好的方式补强当前 Lab。

如果需要，可以继续通过 browser / CDP 对原站进行观察。

--------------------------------------------------
九、音频
--------------------------------------------------

音频请作为视觉叙事的一部分，而不是最后贴上去的装饰。

重点研究：
- hover
- writing
- erasing
- movement
- impact
- paper
- ambient

音效应：
- 短
- 轻
- 柔和
- 不刺耳
- 不机械重复

可以考虑少量 pitch / gain variation。

音频事件最好绑定到 semantic animation event，而不是独立 timer。

例如：

takeoff
landing
write-start
erase
paper-lift
pin
settle

--------------------------------------------------
十、交付物
--------------------------------------------------

本阶段至少交付：

1. REPO_MAP.md
   当前 UI-lab 的代码与系统结构梳理

2. WEB_ART_NOTES.md
   关于视觉叙事、动画、交互、反馈、声音的创作总结

3. PRIMITIVES.md
   当前可以复用的能力与使用方式

4. ORIGINAL_DEMOS.md
   说明每个原创 demo 想验证什么，以及结果如何

5. 至少 3 个可实际运行、可交互的原创 demo

6. 对现有 Lab 的必要 micro-feedback 改进
   尤其关注 dust / trail / residual feedback / audio

7. README 更新
   将 repo 定位从单一复刻实验调整为：
   hand-drawn web art / interaction art lab

--------------------------------------------------
十一、工作方式
--------------------------------------------------

本阶段优先：

observe
→ understand
→ extract
→ create
→ visually review
→ refine

不要一开始就大规模抽象。

先通过原创 demo 暴露真正需要抽象的能力，再回头整理 primitive。

允许一些 demo 暂时存在定制代码。

如果为了“复用”而牺牲视觉质量、运动自然度或创作自由度，则优先保留场景定制。

这个 repo 最终应该像：
一个动画师 / 插画师 / interaction designer 的数字工具箱和实验室

而不是：
一个普通前端组件库。

--------------------------------------------------
最终目标
--------------------------------------------------

完成这一阶段后，希望能回答：

“如果完全不参考 Ballpoint Gambit 的具体棋盘、棋子和角色设计，我们是否已经能独立创作出一个同样具有：
手绘感、动画生命力、自然反馈、可交互性和视觉叙事感
的新网页作品？”

如果答案是肯定的，这一阶段才算真正成功。