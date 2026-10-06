"""Compress full upstream repertoires (no glyph subsetting).

Requires fonttools[woff]. Renames converted fonts to neutral UI Lab family
names; retains embedded copyright/license records and accompanying OFL files.
Run fetch-type-fonts.mjs first. Source TTFs are temporary build inputs.
"""
from pathlib import Path
import hashlib
import json
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent / 'fonts'
manifest_path = root / 'sources.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
for index, source in enumerate(manifest['sources'], 1):
    path = root / source['file']
    font = TTFont(path)
    family = f'UI Lab Sample {index}'
    postscript = f'UILabSample{index}-Regular'
    names = {1: family, 2: 'Regular', 3: postscript, 4: family + ' Regular', 6: postscript, 16: family, 17: 'Regular'}
    for record in font['name'].names:
        if record.nameID in names:
            record.string = names[record.nameID].encode(record.getEncoding())
    font.flavor = 'woff2'
    output = root / f"{source['id']}.woff2"
    font.save(output)
    font.close()
    source['webFile'] = output.name
    source['webFamily'] = family
    source['webBytes'] = output.stat().st_size
    source['webSha256'] = hashlib.sha256(output.read_bytes()).hexdigest()
    print(output.name, source['webBytes'], flush=True)
    path.unlink()  # exact downloaded input within this script's fixed fonts directory
manifest['modification'] = 'Full repertoire WOFF2 conversion, neutral internal family names; glyph outlines unchanged. Original TTF hashes retained.'
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
