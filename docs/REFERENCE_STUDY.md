# Reference：源码、笔迹、色彩与动作

来源是 [Ballpoint Gambit](https://ballpoint-gambit.vercel.app/)，本地观察/提取日期为 2026-10-03，后续研究到 2026-10-04。以下区分可查的源码/资源事实、本地适配与创作推断。公开客户端未包含原作者完整绘图生成器。

## 1. 绘制与资源事实

原站启动检查 WebGL2，观察到 Three.js 运行时。内容分为 flat/world/piece/text instance batches。JSON 的 generator 指向 `art/.../bake-*.mjs`；据此推断至少部分程序化美术在构建时生成，再烘焙成图集。不能由“drawn with JavaScript”推断所有蜡笔都在浏览器每帧重新绘制。

| 本地资源                                                                | 结构与研究用途                                                 |
| ----------------------------------------------------------------------- | -------------------------------------------------------------- |
| [角色图集](../assets/chars/cast.atlas.json) 与 `w-pawn.json` 等十二 rig | 裁切、pivot、ppu、时间图、bodyPose、anchors、部件顺序与 spring |
| [纸 manifest](../assets/paper/manifest.json)                            | 纸纹、折痕、底色与坐标                                         |
| [世界图集](../assets/world/world.atlas.json)                            | 太阳、月亮、星绳、昆虫、植物等装饰                             |
| [文字压力表](../assets/text/ramps.json) 与 `text/a8`                    | 文字 R 通道透明度和压力到 RGB 的查表；不是普通字体             |
| [资源观察清单](../research/asset-inventory.json)                        | 当时浏览器看到的客户端资源，不保证未来部署名称不变             |

原始脚本通过浏览器已正常加载的 `Debugger.getScriptSource` 读取；提取用 Acorn 和 eslint-scope 追踪真实模块绑定。`Puppet` 与六类 animator 的依赖闭包包含 684 个绑定，约 498 KB 原始代码，排除 Three.js 与游戏启动。映射保存在 [motion-extraction.json](../research/motion-extraction.json)，本地样本是 [reference-motion.js](../src/vendor/reference-motion.js)。

`scripts/extract-motion.mjs` 需要未入 Git 的原客户端 pretty 文件，不能在干净 clone 无输入重跑。常规修改不应重写 vendor。

本地 Reference 用 Canvas 2D 原图集 adapter，并缓存背景。RGBA 图直接还原；文字取 R 通道并用 warm/cool/neutral ramp 上色；时间图取 R 通道并使用相同阈值规则。旧姿态保留 12 Hz 采样，但 travel/lift 与 springs 连续。它不是原 WebGL 渲染器的完整移植，也没有棋局规则。

## 2. Puppet 的真实管线

```text
时间推进与动作层 → idle mask → 呼吸/眨眼/凝视
                → 分层 delta 混合 → 倾斜/加速度历史与附件 spring
                → 身体画稿/anchors → 父子矩阵 → 部件画稿/boil
```

实际入口是 `Iy`（导出 `Puppet`）的 `build/update/instances`，附件 solver 为 `iv`，idle 为 `Ty`。源码声明位置和各动作的取样见 [character-motion-audit.json](../research/character-motion-audit.json)；可运行 `node scripts/audit-characters.mjs` 重新生成。

关键实现关系：

- x/y/lift/lean 用加法，sx/sy/alpha 用乘法，draw/turn 带权覆盖，mood/bodyPose 为离散选择；合成规则因字段而异。
- `Timeline.cancelHandle` 把被打断的当前 sample 保存为 ghost，在 fade 内退出。新动作进入时旧姿态不会突然归零。
- 先选身体画稿与 anchors，再解局部/父子矩阵；ground feet 与 body arms 不用同一 attachment 规则。眼睛、帽子和耳朵跟随锚点，不能按外部绝对坐标贴图。
- 附件 `from: lean` 使用倾斜历史，`from: none` 只接受主动 kick；历史延迟 `wave × .05s`。外力含 x 和 lean 的二阶变化，并受 accMax 限制。
- Spring 最多按 1/120s 子步积分；各 part 有 rotRange，越界去掉向外速度。不同 k/damp/gain 说明不同连接、重量与跟随。
- 三稿 boil 约 8 Hz，序列 `0,1,2,1`，每角色有相位；位置、目光和 springs 仍连续。这与低帧率移动是两回事。

这些机制也适合无角色对象：纸片与吊牌、折页与纸角、钟体与钟舌、灯杆与灯罩。应借鉴连接/打断/事件关系，重新设计新对象轨道，不照抄一套常数。

### 完整画稿的补充研究（2026-10-06）

实际追踪 `S_`、`Puppet.instances`：先选部件 `states[state].frames`，再用 `hand` 选择该状态的多张图，返回独立的 `state / hand / m / t`。手臂角度按当前选稿的名义角补偿。因此画稿替换、动作状态、连续矩阵是三件事；扩大 contour boil 不会产生新的羽毛、填色或姿态。

用户提供的本地 `bio-showcase-handdrawn` 中，`src/art.js` 的 `redraw / shape`、`src/atmosphere.js` 的膜/囊泡绘制把整体曲线、内部折叠、半径和局部线一起做成三稿，再缓存。连续位置、跳跃与部件姿态另算。这是本轮源码比较的补充证据；没有复制其生物素材、外部文献或场景资源。

本地转化：`drawing-variants.js` 使用人工配置的高度带，关节/落点设零，远端结构留小幅曲线变化；`Pencil` 在烘焙时把同一场应用于轮廓、填色裁切与内部线。蘑菇菌褶、猫头鹰翼端、鱼尾和蜂翼另外调整绘画调用。运行时仅选预绘画稿，原来的连续 solver、物种步态与角度补偿保持独立。当前没有补齐原作所有动作状态对应的完整独立姿态图集。

验证关系：Studio 的三稿条使用同一冻结 Puppet，单独指定 `drawingFrame`，排除身体运动造成的假差异；浏览器从边缘向内至少 2 个场景像素抽样，确认腹部和翼内也有像素变化。Gallery 再验证正常尺寸、打盹/唤醒、擦写替换与物件交互。像素差异只证明重画发生，不能代替正常速度下的美术审查。

## 3. 十二个 character 不只是十二张图片

下表的符号在当前 vendor 中可搜索。每个动画族有双方不同 rig、idle 和专属轨道。

| 动画族 | 从源码能学到的差异                                                                                                                     | 关键符号      |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Pawn   | 蘑菇按距离构造 1–5 次 hop；蓄力、空中 stretch、落地 squash、恢复；左右臂小延迟，帽子跟随 lift 并叠落地衰减转动。另一侧有自己的道具响应 | `Rk/Bk/Wk/CA` |
| Knight | 小马头独立转，耳朵跟头，forelock 再跟头；六段鬃毛逐段延迟，尾巴更软；弓箭马还有 cap/pom/quiver/arrow 连接                              | `yj/xj/rM`    |
| Bishop | 飞行角色翼拍、触角、尾部各自恢复，travel 可关闭 idle look；灯塔 roof/flag、beam/lamp 有专属显隐与响应                                  | `XM/FN/fP`    |
| Rook   | 树苗与水晶重量不同，压缩/恢复不同；紧张是树苗、晶体、闪光与脸的组合，不能整图抖动代替                                                  | `nF/vF/qP/UF` |
| Queen  | 蜂后 path/wing/face 是并行轨道；星星分 path/face，七段 crest 有相位差；没有接触事件的飞行动作不硬塞落地敲击                            | `_I/vI/XI/ZI` |
| King   | 猫头鹰按距离构造 2–6 步、左右脚交替，皇冠/叶子滞后；鲸鱼非线性推进，脚/尾鳍/水面一起响应，接触后眨眼放松                               | `uR/WR`       |

以具体弹簧为例：树苗 k26/damp2.4/gain1.7，水晶 k58/damp5.5/gain.55；猫头鹰皇冠 k48/damp5，鲸鱼尾鳍 k26/damp3。它们是各对象结构的证据，不是通用推荐预设。

Idle 也按对象调：呼吸近似 `sx=1/sy` 保体积；blink/look/ears 各有稳定随机序列，不每帧 random。默认 blink gap3.3s、jitter15%、double10%，凝视平滑且限幅；不同角色呼吸、wandering、ear kick 的周期与强度不一样。

## 4. 蚂蚁是场景协调，不是 removed clip 的别名

原整站的 `UT/GT` 搬运协调器在 Puppet 闭包之外，有 fetch/wait/load/carry/tuck/home 阶段、物件队列、phase、pos、lift/bias。物件位置与队伍座位 anchor 对齐，再叠很小的步伐 lift；不是蚂蚁走一段、棋子独立 tween 一段。

原取样记录 fetchSpeed1.25、carrySpeed1.1、loadSeconds.6、tuckSeconds.8、stride.5；按 walked/stride 切换步稿并留脚印。当前 `/components.html` 用原 removed clip、原蚂蚁图集与简化取物/搬离协调演示；没有移植棋局队列、捕获判定与巢穴调度。Gallery 小蚂蚁独立自绘，展示协调关系而非完整原机制。

对 SaaS 的启发是多对象共享阶段与落点，例如附件进入文件夹、纸片归档或批量删除；不是每个产品都应有蚂蚁。

## 5. 颜色数据与推断

纸色是 RGB `241,235,222`，即 `#f1ebde`。文字表存压力/alpha 对应颜料 RGB，并非统一浅色。

| alpha   | warm 颜料 | cool 颜料 | neutral 颜料 |
| ------- | --------- | --------- | ------------ |
| 64/255  | 185,29,0  | 0,29,153  | 98,51,0      |
| 128/255 | 175,24,0  | 0,18,139  | 83,42,0      |
| 192/255 | 154,15,0  | 6,0,105   | 59,28,0      |
| 255/255 | 117,9,0   | 21,0,74   | 48,22,0      |

192 档 cool 与纸合成约 `64,58,134`，warm 约 `175,69,55`。这是文字压力表，不能直接宣称是完整插画调色板。

另从四个角色 `body.idle.0` RGBA 部件取有色像素：alpha≥.16，RGB 极差≥20，32级 RGB 桶，按 alpha 加权聚类。

| 部件   | 主要颜色簇                              | 有色像素平均 alpha |
| ------ | --------------------------------------- | ------------------ |
| w-pawn | 230,198,150 / 234,209,170 / 235,177,110 | .989               |
| w-king | 237,214,172 / 230,199,152 / 211,178,140 | .992               |
| b-pawn | 76,81,144 / 143,139,182 / 116,115,166   | .992               |
| b-king | 46,57,131 / 56,68,137 / 73,79,145       | .994               |

原始结果和纸色合成值在 [reference-pigments.json](../research/reference-pigments.json)。这是局部测量。由此推断柔和来自纸色、笔压、局部留白与内部层次，而非整物体透明。

本地 [pigments.js](../primitives/pigments.js) 区分主色、阴面、木纹、叶片、水与各对象材质；蜡笔短线 alpha 当前约 .44–.88，保留固定的间隙与交叉薄涂。轮廓混入暖棕，不用黑框。新项目保留关系，重新选择自己的语义和材质颜色。

## 6. 原创适配的已知教训

- 旧 guide 各件独立 sin、停止归零，画得更细也无法解决割裂。现在共享真实求解器/rig，连续运动与低频笔稿分离，位移/接触/脚部共享物种相位。
- Source pawn rest 会按 seed 隐藏 `tuft/plaster`。自绘新部件若误用同名会消失；当前 sprout/capPatch 独立命名并挂在 cap 上。新 rig 必须检查继承 preset 的副作用。
- 原作 arm rotation 是 `(requestedDeg - selectedDrawingDeg) * rotSign`；共享画稿在 Canvas Y 翻转后补偿为 `-(selectedDrawingDeg - neutralDrawingDeg) * rotSign`。旧补偿同向造成睡眠切稿时120°–155°单帧跳变。修 adapter，不靠关呼吸掩盖。
- 当前 Gallery 14s 闲置睡眠、靠近/走动唤醒，紧张/搬运是示例状态，不含真实危险预测。反应层继承原作，部件画稿独立创作。
- 自绘开场在初始化录实际 Canvas 笔迹时间，播放推进时间图；原图集时间图与自绘 recorder 是两条不同来源的实现。

出处追溯与迁移边界见 [PROVENANCE](PROVENANCE.md)。测试和浏览器事实见 [VALIDATION](VALIDATION.md)，不把来源研究的取样成功当成完整美术验收。

## 7. Bio 最终成果源码迁入（2026-10-09）

此前比较的 `bio-showcase-handdrawn` 与这次用户指定的 `demo-4-claude` 是不同的源码范围。此次真实复制后者 Block/Room 的依赖闭包到 `experiments/bio/`，不再只作外部比较。逐项“源码机制 → 功能设计 → 验证”的关系见 [Bio 研究](BIO_EXPERIMENTS.md)。

核心管线是 `PDB → 对齐结构/位点 → conformerFrames → Flicker → StructureView.buildRuns → 深度分桶绘制`；叙述输入沿 `BeatTrack → 状态/反应标记 → 镜头/配体/说明`，Block 的 `FlowSim` 则用路线与瓶颈事件驱动分子。没有导入原 Puppet；不能把领域结构和事件模型写成换了蛋白画稿的同一角色 spring。相关构象是固定种子的美术示意，连续旋转/聚焦和离散稿各自求解。
