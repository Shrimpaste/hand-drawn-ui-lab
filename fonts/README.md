# Chinese type samples

These three local WOFF2 fonts retain their upstream glyph outlines and full
repertoires. They are converted and internally renamed to **UI Lab Sample 1–3**;
they are not fonts drawn by UI-lab. Each remains under SIL OFL 1.1. Keep its
accompanying `*-OFL.txt` notice when redistributing it.

| File | Source | Upstream version | Internal name |
| --- | --- | --- | --- |
| `wenkai.woff2` | [LXGW WenKai Lite](https://github.com/lxgw/LxgwWenKai-Lite) | v1.522 | UI Lab Sample 1 |
| `xiaolai.woff2` | [Xiaolai](https://github.com/lxgw/kose-font) | v3.126 | UI Lab Sample 2 |
| `yozai.woff2` | [Yozai](https://github.com/lxgw/yozai-font) | v0.868 | UI Lab Sample 3 |

[sources.json](sources.json) records exact download URLs, original TTF checksums,
web-font checksums, versions, modifications and sizes. There is no runtime CDN.

Rebuild explicitly (Python needs `fonttools[woff]`):

```sh
node scripts/fetch-type-fonts.mjs
python scripts/pack-type-fonts.py
```

The first command downloads the pinned original TTFs and notices. The second
converts all glyphs, changes font name records 1/2/3/4/6/16/17 while retaining
copyright/license records, writes WOFF2 and deletes only the downloaded TTF build
inputs. It updates the manifest. The compressed set is about 24.4 MB: suitable
for this local comparison bench, not a production font-loading budget.

Chinese animation uses ordered medians from `hanzi-writer-data@2.0.1`, derived
from Make Me a Hanzi. The generated adaptation is under the separate
[Arphic Public License](ARPHICPL.TXT), with its modification notice in
`primitives/generated-chinese-medians.js`. Rebuild it with `npm run hanzi`.
Those pen paths do not reveal the outlines of these three fonts.
