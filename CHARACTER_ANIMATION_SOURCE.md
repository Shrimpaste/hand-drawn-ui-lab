# 从真实角色源码到可复用运动

这轮依据本地保存的公开客户端源码与十二份 rig，不以截图猜测运动。原作者源码继续在 `src/vendor/reference-motion.js` 保留来源。原创绘画在 `scenes/guide.js`，新锚点在 `scenes/guide-rig.js`；新角色直接使用原作者的 Puppet 求解器和 pawn 表情/反应轨道，连续庭院行走是本地新增轨道。没有把参考角色贴图冒充原创素材。

## 为什么上一版动作割裂

旧版把身体 bob、头部 tilt、摆脚、围巾各写一段正弦；脚步相位在停止时直接归零，视线用方向符号跳变，装饰只跟随时间。动作之间没有保留当前姿态，附件不知道身体刚刚加速或落地。画得更细也不能解决这些问题。

## 实际管线

`时间推进 → idle mask → 呼吸/眨眼/凝视 → 分层动作混合 → 加速度与倾斜历史 → 附件弹簧 → 身体姿态 → 锚点/父子矩阵 → 贴图变体`

- `Puppet.build`：参考源第 2506 行。基础 pose 先合并 idle，再合并 timeline，最后合并独立附件响应；参考组件实际走这条管线。
- pose 字段有不同合成规则：x/y/lift/lean 加法，sx/sy/alpha 乘法，draw/turn 等带权覆盖，mood/bodyPose 等离散状态。不能把所有字段都当同一种 tween。
- `Timeline.cancelHandle`：被打断的轨道保留当时 sample 成 ghost，在 fade 时间内退出。新动作淡入，旧动作淡出；原地姿态不会突然归零。
- rig solver：先选择 bodyPose 的 nominal 和 anchors，再合成身体矩阵。手脚、脸和道具各有 attach/anchor；parent 子件继承父件的局部转动和位移。ground 脚与 body 手臂的规则不同。
- pose 取样与线条变体分离。默认 boil 8 Hz，三稿序列 `[0,1,2,1]`，每角色有相位；帧循环、凝视和弹簧连续更新。旧参考适配把局部姿态按 12 Hz 取样，并单独保留连续 travel/lift。新绘画使用连续 pose + 8 Hz 笔稿，避免把平滑运动也抖成低帧率。

## 不是一个通用 spring 预设

附件 solver（参考源第 668 行 `iv`）有两种驱动：`from: lean` 使用倾斜历史，`from: none` 只接受主动 kick。历史采样延迟 `wave × .05s`。外力包含 x 与 lean 的二阶变化，Puppet 将其限制到 accMax60。积分按最多 1/120s 子步，角度被各 part 的 rotRange 限制；到边界时去掉向外速度。

`k` 决定回弹，`damp` 决定衰减，`gain` 决定身体变化影响程度。帽子/头/鬃毛/尾巴使用不同参数。impact 会按动作事件强度 jolt 附件；这属于接触事件，不能把所有声音和震动放在点击瞬间。

## 六类 × 两侧的具体差异

| 动画族 | 白方与黑方的运动设计 | 已读源码定位 |
|---|---|---|
| Pawn | 蘑菇根据距离构造 1–5 个 hop：蓄力、抛物线 lift、空中 stretch、落地 squash、恢复。左右臂延迟 .025s；帽子跟随 lift 曲线的延迟采样，并在每次落地叠加衰减转动。黑方星帽角色有自己的起落与道具响应。 | `Rk` 3018、`Bk` 3198、`Wk` 3409、`CA` 4594 |
| Knight | 小马不是圆团跳跃的换皮。head 有独立旋转，耳朵 parent=head，forelock 再跟头；六段鬃毛 wave 逐段增加 .55，尾巴更软。弓箭马 cap parent=head，pom parent=cap，还带 quiver/arrow。落地有头部和鬃毛的分段衰减响应。 | `yj` 6413、`xj` 6522、`rM` 7671；十二份 rig 内的 spring/parent |
| Bishop | 白方飞行角色 travel 包含翼拍、触角与尾部落地恢复，动作会关闭 idle look 避免争夺凝视。黑方灯塔的 roof 带 flag 子件；beam/lamp 有专属可见状态与响应。两者的起落时长和重量不同。 | `XM` 8945、`FN` 10013、`fP` 10976 |
| Rook | 树苗塔与水晶石怪用沉稳的压缩、恢复和细小倾斜；树苗 spring k26/damp2.4/gain1.7，水晶 k58/damp5.5/gain.55。紧张时树苗、晶体、闪光和面部变化，不能用一个整体抖动代替。 | `nF` 11532、`vF` 12255、`qP` 11371、`UF` 13269 |
| Queen | 蜂后把 path、wing、face 分成并行轨道；星星也分 path 和 face。星星七段 crest wave 每段 .4，尾部两片也有相位差；蜂后翼、触角、皇冠各有 spring。运动时没有落地 impact 的片段不应生硬添加敲击声。 | `_I` 13518、`vI` 13614、`XI` 14664、`ZI` 14788 |
| King | 猫头鹰 walk 根据距离构造 2–6 个步子，travel 兼有逐步推进和整体曲线，左右脚轮替接触，皇冠与叶子延后。鲸鱼 travel 使用更圆滑的非线性推进，脚/尾鳍/水面宽度和位移共同响应，接触后眨眼、放松。 | `uR` 16379、`WR` 17464；crown k48/damp5，fluke k26/damp3 |

完整实测参数、每个动作 17 个取样、事件时刻和声明行号保存在 `research/character-motion-audit.json`。`scripts/audit-characters.mjs` 可重跑，不改参考源码。样本用于理解曲线与事件，不等同视觉验收。

## Idle 有意保留不规则

`Ty`（参考源第 2172 行）用不同随机序列分别管理 blink/look/ears，而不是每帧随机。呼吸采用近似保体积 `sx=1/sy`。默认 blink gap3.3s、jitter15%、double概率10%，闭眼分 .06s 的几步。凝视目标由指针或 1.4–3.8s 的随机 wander 提供，临界阻尼 smooth=.11，并限制 maxX/maxY/maxLen。耳朵偶发 kick，也可以相差 .05s。

各角色 rest 会修改 idle 参数：小马周期2.9s/振幅.014，黑方马5.4s/.022；树苗塔3.9s/.02，黑方石怪5.6s/.009；猫头鹰4.4s/.014，鲸鱼5.2s/.022。参数是角色性格的一部分。

## 蚂蚁不是一段 removed clip

公开整站源第 51896 行 `UT` 与 `GT` 是另外的场景协调器，未在原来的 Puppet 依赖闭包中。状态包括 fetch / wait / load / carry / tuck / home；载物件有单独的队列、phase、pos、lift 和 bias。

源码事实：fetchSpeed1.25、carrySpeed1.1、loadSeconds.6、tuckSeconds.8、stride.5；行走贴图按 walked/stride 的四帧切换，脚印按距离生成。`carryToken` 把物件位置直接跟载物队伍对齐，lift 取座位 anchor，再叠加幅度.012的步伐抬升。这样不会出现两条独立 tween 脱节。

组件实验台现在用真实 removed clip、原蚂蚁图集与简化的取物/抬起/搬离协调展示这一点，搬离后重置实验；没有移植棋局队列、捕获判定和双方巢穴调度。原创庭院使用独立绘制的小蚂蚁作自然状态示例。

## 本轮转化

- 新 guide 不再用各部分互不相关的正弦。`GuideMotion` 管理实际 Puppet 与 locomotion/hover/emotion/sleep 轨道，保留打断后的淡出。
- 庭院行走的速度渐进、步伐按路程推进；gait 进入/退出都有过渡。帽子/围巾读取实际 pose 倾斜、加速度和历史延迟，脸与肢体从同一锚点模型得到矩阵。
- 阁楼的物体互动 lift/squash 也进入 Puppet pose，不再在身体外拼接两套变形。
- 静置14s打盹，靠近/触碰/走动唤醒；可单独演示紧张与蚂蚁搬运。参考组件静置18s，十二个原角色均可切换。
- 庭院、角色和道具逐笔加载：烘焙时记录实际 Canvas 笔画时间，路径长度分预算，轮廓先行、wax笔触随后，局部细节按实际调用顺序进入。播放只推进小时间图，避免重复生成纹理引起卡顿。不是整图淡入或矩形擦拭。

这仍是学习原作者机制的本地作品。绘画生成器未被恢复；完整游戏的危险预测与捕获系统没有加入。
