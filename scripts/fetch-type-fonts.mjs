// Explicit maintenance command, never run by the site. Upstream files are unmodified.
import fs from "node:fs/promises";
import { createHash } from "node:crypto";
const root = new URL("../fonts/", import.meta.url);
const sources = [
  {
    id: "wenkai",
    name: "霞鹜文楷 轻便版",
    repo: "lxgw/LxgwWenKai-Lite",
    tag: "v1.522",
    file: "LXGWWenKaiLite-Regular.ttf",
  },
  {
    id: "xiaolai",
    name: "小赖",
    repo: "lxgw/kose-font",
    tag: "v3.126",
    file: "Xiaolai-Regular.ttf",
  },
  {
    id: "yozai",
    name: "悠哉",
    repo: "lxgw/yozai-font",
    tag: "v0.868",
    file: "Yozai-Regular.ttf",
  },
];
await fs.mkdir(root, { recursive: true });
for (const source of sources) {
  source.url = `https://github.com/${source.repo}/releases/download/${source.tag}/${source.file}`;
  source.licenseUrl = `https://raw.githubusercontent.com/${source.repo}/${source.tag}/OFL.txt`;
  for (const [url, filename] of [
    [source.url, source.file],
    [source.licenseUrl, `${source.id}-OFL.txt`],
  ]) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status}: ${url}`);
    const data = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(new URL(filename, root), data);
    if (filename === source.file) {
      source.sha256 = createHash("sha256").update(data).digest("hex");
      source.bytes = data.length;
    }
  }
  console.log(`${source.name}: ${source.bytes} bytes`);
}
await fs.writeFile(
  new URL("sources.json", root),
  JSON.stringify(
    {
      retrieved: "2026-10-04",
      modification: "none",
      license:
        "SIL Open Font License 1.1; individual notices accompany each file",
      sources,
    },
    null,
    2,
  ) + "\n",
);
