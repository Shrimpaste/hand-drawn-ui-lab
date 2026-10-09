# Bio 原创实验副本

这是 UI-lab 内的独立 Block/Room 源码副本，不包含 bio 原项目大厅。源提交和逐文件差异在 [source-manifest.json](source-manifest.json)。完整说明见 [docs/BIO_EXPERIMENTS.md](../../docs/BIO_EXPERIMENTS.md)，来源与许可见 [PROVENANCE](../../docs/PROVENANCE.md)。

在 UI-lab 根目录运行 `npm ci`、`npm start`，打开 `/experiments/bio/block.html` 或 `/experiments/bio/room.html`。无需源项目目录、Vite 或构建产物；浏览器须支持 JSON import attributes。页面互相导航，UI-lab 其它页面从根 README 进入。

根命令：`npm run test:bio`、`npm run check:bio`、`npm run bio:structure`、`npm run bio:font`。改文案后重新生成字体子集；原静态文件需要刷新，服务器代码修改需要重启。

保留独立引擎和领域结构，避免强行套用旧 Gallery。两页的字体标签裁切、DOM 正文逐字过渡并非真实中文笔顺；窄屏采用整体缩放与横屏提示。当前验证和自查结论统一在 [VALIDATION](../../docs/VALIDATION.md)。
