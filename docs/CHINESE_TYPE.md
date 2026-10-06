# 中文字体与笔迹测试

四个独立入口保留了仓库的纸面、颜料与简笔控件语言。正文只使用任务、状态和测试操作文案。

| 页面 | 用途 | 操作 |
| --- | --- | --- |
| [字样](../demos/chinese-type.html) | 文楷、小赖、悠哉在同一内容下对照 | 改标题文字、字号和颜色，比较正文及操作文字 |
| [双字体](../demos/chinese-pair.html) | 专门比较小赖与悠哉和路径字的协调性 | 并排切换待办清单/会议记录、调正文大小和颜色、同步勾选、保存、写擦标签 |
| [笔迹](../demos/chinese-ink.html) | 数据笔画的写入、反向擦除和替换 | 预设或自组短语、进度、暂停、速度、材料、静音与减少动作 |
| [便笺](../demos/chinese-notes.html) | 在具体小型页面里比较静态字体与动态短标签 | 换字体、勾选、编辑、本机保存、键盘聚焦按钮 |

便笺写入此浏览器的 `ui-lab-chinese-note`，没有服务端同步。
双字体页的清单勾选和当前示例写入 `ui-lab-pair-demo`，两面共享同一状态以便直接比较字形。

## 源码机制 → 新页面 → 验证

仓库 `/components.html` 原动作中，`src/components.js` 改 `InkTransition.target`，RAF 调用 `ink.update`，`Atlas.draw` 再按原时间图显示颜料。它说明同一笔迹可以靠一个可逆进度写入和擦除。新页面保留了「当前可见墨量」这一状态模型，不导入该原图集。

用户提供的 `C:\Users\Lenovo\Desktop\all-bio-showcase\demo-4-claude` 有一套更合适的中文机制：`scripts/build-hanzi.mjs` 从 `hanzi-writer-data` 提取有序 `medians`；`src/engine/writing.js` 转换 1024 单位的 y-up 中线、平滑并按弧长显示；`src/engine/ink.js` 和 `label.js` 使擦除从当前进度反向，换字先擦旧字再写新字。UI-lab 改用同一数据来源和机制，在自己的页面尺度与绘制材料上重新实现。此前 24 字的逐字手工坐标已删除。

`npm run hanzi` 从固定的 `hanzi-writer-data@2.0.1` 生成 [字表](../primitives/generated-chinese-medians.js)：扫描四个测试页与少量日常测试用语，提取笔画中线并四舍五入。目前为 299 字；需要新字时把实际文案加入页面或生成脚本的样文，再重新运行。生成文件头有修改说明，完整 [Arphic Public License](../fonts/ARPHICPL.TXT) 随仓库保留。它是数据字表，不是三款网页字体的字形拆笔。

`chinesePaths` 逐字保留数据笔序，每笔以相同路径计算弧长和提笔间隔。`ChineseInk` 只改变游标方向，打断后保留当前端点；替换时等旧字擦空才换最新目标。`drawChinese` 仅绘制每笔当前前缀，笔压和纸隙对完整路径稳定取样，因此交叉笔画不会由整字遮罩提前露出。便笺的保存状态即时落地，动画随后表明变化；DOM 正文仍可选择和编辑。

浏览器实测：正常速度显示有序落笔；慢速擦除时最后一个「字」逐笔减去，94% 处仍保持前面五字完整。输入「你好今天写字」能写出六字，三种笔触共享相同笔序。测试还覆盖十次来回打断、替换、重写、减少动作、缺字报错。双字体页两面同时展示相同清单和记录，勾选/保存同步，保存路径标签从「草稿」擦旧写「已存」。桌面、390px 窄屏、键盘、静音及减少动作检查范围见 [验证记录](VALIDATION.md)。

## 接口与边界

```js
import { ChineseInk, drawChinese } from "/primitives/chinese-handwriting.js";

const ink = new ChineseInk("保存");
ink.setVisible(false);   // 由当前墨量逆向擦除
ink.setVisible(true);    // 从当前游标续写
ink.replace("已存");     // 擦旧字，写最新目标
ink.replay();            // 擦当前字，再写
ink.seek(0.5);           // 暂停并定位
ink.update(dt, reduced);
drawChinese(ctx, ink.layout, { x: 20, y: 20, size: 32, cursor: ink.cursor });
```

`unsupportedChinese(text)` 返回当前字表之外的字符；页面提示缺字并保留原笔迹。字表只覆盖生成的 299 字，不能宣称任意中文都可动画书写。普通网页文字直接使用完整字体；需要逐笔动画的短标签使用这份动态中线。三种静态字体来源和 OFL 全文见 [fonts](../fonts/README.md)。

小赖较圆润、笔重较强，悠哉的手写斜度更明显；用户认为两者与当前画风更和谐，因此增加并排实页测试。便笺仍可切换三款比较，暂未把任何一款设为全仓库默认。将来融入具体页面时应先确定正文层级，再按页面实际字词扩大数据集并看文字与动画是否和谐。
