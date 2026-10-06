// Extract the ordered pen medians used by the Chinese test pages. The source
// data is hanzi-writer-data 2.0.1, derived from Make Me a Hanzi (Arphic PL).
// This generated adaptation retains only rounded medians; see the license and
// modification notice in fonts/ARPHICPL.TXT and docs/PROVENANCE.md.
import {
  readFileSync,
  writeFileSync,
  copyFileSync,
  mkdirSync,
  existsSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = join(root, "node_modules", "hanzi-writer-data");
const output = join(root, "primitives", "generated-chinese-medians.js");
const inputs = [
  "demos/chinese-type.js",
  "demos/chinese-type.html",
  "demos/chinese-ink.html",
  "demos/chinese-notes.html",
];
// Extra everyday copy lets the free-text bench exercise more than page labels.
const samples =
  "你好谢谢请问今天明天昨天星期年月日时分秒欢迎开始结束新建删除编辑搜索设置帮助返回取消确定提交继续暂停完成失败成功消息通知用户名称地址城市天气温度工作学习生活朋友家人故事照片音乐视频测试中文书写擦除动画手写字体颜料纸张铅笔钢笔记录会议计划清单任务项目文档文件目录草稿保存归档打开关闭收起展开发送接收蓝色红色绿色黑色白色大小速度慢快行列页面按钮状态标题内容输入选择样式颜色线条笔画弧长方向提示日期时间数字第一第二第三上下午早晚周末已经尚未需要重新可以还有其他这里那里我们你们他们一个两个三个多少什么为什么怎么";
const chars = new Set(
  [...samples.matchAll(/[\u3400-\u9fff\uf900-\ufaff]/gu)].map((m) => m[0]),
);
for (const file of inputs) {
  for (const match of readFileSync(join(root, file), "utf8").matchAll(
    /[\u3400-\u9fff\uf900-\ufaff]/gu,
  ))
    chars.add(match[0]);
}
if (!existsSync(dataDir))
  throw new Error("Install hanzi-writer-data before building medians");

const medians = {};
const missing = [];
for (const char of [...chars].sort()) {
  const file = join(dataDir, `${char}.json`);
  if (!existsSync(file)) {
    missing.push(char);
    continue;
  }
  const data = JSON.parse(readFileSync(file, "utf8"));
  medians[char] = data.medians.map((stroke) => stroke.flat().map(Math.round));
}
const notice = `/* Modified Hanzi Writer stroke data (Arphic Public License).\n * Generated for UI-lab on 2026-10-06: selected ${Object.keys(medians).length} characters,\n * extracted stroke medians, rounded their coordinates, and packed them as arrays.\n * Source: hanzi-writer-data 2.0.1 / Make Me a Hanzi. License: fonts/ARPHICPL.TXT.\n */\n`;
writeFileSync(
  output,
  `${notice}export const chineseMedians = ${JSON.stringify(medians)};\n`,
);
mkdirSync(join(root, "fonts"), { recursive: true });
copyFileSync(
  join(dataDir, "ARPHICPL.TXT"),
  join(root, "fonts", "ARPHICPL.TXT"),
);
console.log(
  `Chinese medians: ${Object.keys(medians).length} characters; missing: ${missing.join("") || "none"}`,
);
