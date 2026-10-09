# 来源与二次构建边界

参考作品：[Ballpoint Gambit](https://ballpoint-gambit.vercel.app/)。公开客户端观察日期为 2026-10-03。这个仓库保存学习样本，不应把“浏览器能下载”写成“原作者已经开源或许可复用”。

## 内容来源

| 内容                                                           | 来源                                                                              | 当前使用                                               |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `src/vendor/reference-motion.js`                               | 从原站公开客户端依赖闭包提取的原作者代码，文件头保留原 URL/日期                   | Reference 与原创 GuideMotion 使用；不是本地原创 solver |
| `assets/` 中图集、纸、文字与十二 rig                           | 原站已交付的公开资源                                                              | Reference/组件页；原创 Gallery 绘图不加载原图集        |
| `research/asset-inventory.json/motion-extraction.json`         | 客户端资源观察与依赖分析                                                          | 来源映射，不是生成器源码                               |
| `research/character-motion-audit.json/reference-pigments.json` | 对上述源代码/素材的本地测量                                                       | 动作/色彩研究，不扩大原内容使用权限                    |
| `src/` 中非 vendor 模块                                        | 本地编写的自由移动、Canvas 图集适配、状态与交互                                   | 仍依赖原作格式/资源，不能作为独立原创作品概括          |
| `primitives/`                                                  | 本地编写的画线、蜡笔、笔迹、时间图录制、motion/event、paper、residue 与合成音工具 | 可以研究和二次实现；没有恢复原作者 bake generator      |
| `scenes/guide.js/visitor-art.js/art.js/courtyard*` 等画稿      | 本地编写的 Canvas paths、纹理与场景                                               | 自绘美术，但 guide-motion 仍借用原作 runtime/反应      |
| `scenes/visitor-locomotion.js/redraw.js` 等模型                | 本地编写的连续步态、位移/接触相位、替换和空间协调                                 | 从参考机制学习的定制实现，不是原站完整游戏移植         |
| `primitives/foley.js`                                          | 本地程序化合成的材料声音                                                          | 不是原站录音；是否舒服仍需实际试听                     |
| `primitives/generated-chinese-medians.js` / `fonts/ARPHICPL.TXT` | `hanzi-writer-data@2.0.1` 的有序笔画中线，源自 Make Me a Hanzi；脚本筛字、四舍五入并打包 | 生成文件含修改说明；依 Arphic PL 保留许可，不能归为原创笔画 |
| `fonts/{wenkai,xiaolai,yozai}.woff2`                           | 霞鹜文楷 Lite、小赖、悠哉的固定版本，全字库转换与内部重命名                       | 各自随 SIL OFL 1.1 全文和校验清单；与动态笔画无字形对应 |
| 文档与截图                                                     | 本地研究、人工审核归纳和验证                                                      | 明确区分观察事实、创作推断与当前测试范围               |
| `experiments/bio/src/` 与 20 份测试 | 用户本地 `demo-4-claude`，源提交 `52141ce11b3dc66e65dfe8c85a296b1e2d3c9486` | Block/Room 依赖闭包；独立于原 vendor/图集，复制不等于声明全仓库许可 |
| `experiments/bio/public/fonts/`、`references/xiaolai.woff2` | 源项目小赖子集/完整字体；生成脚本注明完整字体来自 UI-lab | 随附 `public/licenses/xiaolai-OFL.txt`；保留原字体版权与 OFL |
| `experiments/bio/references/pdb/{7C9Q,7CWE,7CVH}.pdb`、结构 JSON | 源项目保存的公开 PDB 晶体数据；随附生成脚本做对齐/抽取 | 外部结构数据与本地加工分开；可从本地输入重建，不称为原创测量或动力学 |
| Bio 教学内容 | 源项目 `content/block-room.js`、`fbp1-room.js`，并因共享 kit 保留 `rooms.js` | 此次复制保持原解释和局限；不包含报告 PDF/DOCX，也没有重新医学审定 |

## 已获得与未获得

2026-10-06 多画稿研究另读了用户本地 `bio-showcase-handdrawn` 的形体重画与分层动画源码。UI-lab 的 `drawing-variants.js` 为本地新写的工具和参数；当时没有导入该项目的生物插画、生成图、文献或场景资源。

2026-10-09 按用户明确要求，另将 `C:\Users\Lenovo\Desktop\all-bio-showcase\demo-4-claude` 的 Block/Room 源码、依赖与资源复制到本仓库。不能再笼统声称“没有导入 Bio 资源”。[导入清单](../experiments/bio/source-manifest.json) 保留来源提交、原始/导入 SHA-256、适配与排除范围；原项目未修改，副本独立维护。本地复制授权不被扩写为第三方代码/数据/教学文件的公开发布许可。

两页虽然保留 `writing.js` 的中线注入接口，但未加载 Hanzi 数据，未复制其数据文件；对应测试只有人工构造的假中线。不要把未使用的有序笔画能力写成两页的实际中文笔顺。

已经能阅读客户端求解器、动作、rig、压力表与烘焙图集，也能研究其结构并自行画新对象。没有获得原作者完整 `art/.../bake-*.mjs` 绘图生成器、未公开仓库、完整项目源码或明确素材再发布授权；没有恢复完整棋局机制。

当前没有附加一份声称覆盖整个仓库的 MIT 等许可证。仓库默认以私有远程保存，私有状态也不自动授予原内容商用/再发布权。原作归属保留，版本历史也包含这些研究样本。

## 学习、迁移与公开发布

可以先带走设计方法：精细造型、颜料/留白关系、连接处动作、层混合、可中断笔迹、时间图、简笔选项和事件同步。用目标项目自己的对象、文案、功能、画稿与实现验证这些关系。

若要迁移具体文件，列出依赖闭包与来源。尤其 `GuideMotion` 看起来位于原创场景下，却导入原作 `Puppet/pawnAnimator`；移走图片仍不代表 runtime 已独立。处理方式是取得所需许可，或依据机制写独立的实现和自有资源，并重新验证自然动作。不能把 vendor 改名后当作原创。

公开/商业发布范围应明确区分自绘代码与原作内容，先解决相应权限。若新仓库要排除原作，仅在 HEAD 删除文件还不够，历史仍有原内容；应使用审查过的导出或独立历史，不将当前完整研究历史直接公开。

这里记录真实边界，不推断原作者未声明的许可。新的许可证或授权一旦取得，应写明来源、适用内容和日期，再更新此页。
