#!/usr/bin/env python3
"""Stamp "@SAVIORFITLOGGER" on the app's pictures.

Usage:  python3 tools/stamp_photos.py name.webp [...]       (files inside images/exercise-photos/, stamped in place)
        python3 tools/stamp_photos.py --all                  (every exercise photo)
        python3 tools/stamp_photos.py --extras               (images/muscles, images/stretch, images/equipment-guide.jpg)
        python3 tools/stamp_photos.py path/from/repo/root.webp (any other picture, path relative to the repo root)
The text size scales with the picture width (13px on a 360px photo).

NOT idempotent: run it once per photo. New photos from Gemini go through this once before they are committed.
Needs: pip install pillow fonttools brotli
The text goes in whichever corner / edge has the least drawing under it.
"""
import io, os, sys
from PIL import Image, ImageDraw, ImageFont
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTOS = os.path.join(ROOT, 'images', 'exercise-photos')
TEXT = '@SAVIORFITLOGGER'
SIZE = 13          # px on a 360px-wide photo (scaled for wider pictures)
SPACING = 1.2
GOLD = (190, 126, 8)

_ttf = None
def font_for(size):
    global _ttf
    if _ttf is None:
        f = TTFont(os.path.join(ROOT, 'fonts', 'jetbrains-mono-latin-700-normal.woff2')); f.flavor = None
        buf = io.BytesIO(); f.save(buf); _ttf = buf.getvalue()
    return ImageFont.truetype(io.BytesIO(_ttf), size)

def text_width(font, s, sp):
    return sum(font.getlength(c) + sp for c in s) - sp

def stamp(path):
    im = Image.open(path).convert('RGB'); W, H = im.size
    k = W / 360.0; size = max(10, round(SIZE * k)); SP = SPACING * k
    font = font_for(size)
    tw = int(text_width(font, TEXT, SP)); th = size + int(4 * k); pad = int(7 * k)
    spots = {  # name -> (x, y)
        'br': (W - tw - pad, H - th - pad), 'bl': (pad, H - th - pad), 'bc': ((W - tw) // 2, H - th - pad),
        'tr': (W - tw - pad, pad), 'tl': (pad, pad),
    }
    if 'equipment-guide' in path: spots = {'br': spots['br']}   # busy photo with labels on top: always bottom-right
    best, bestInk = None, None
    for name, (x, y) in spots.items():
        box = im.crop((x - int(4*k), y - int(3*k), x + tw + int(4*k), y + th + int(3*k))).convert('L')
        ink = sum(1 for v in box.getdata() if v < 225)
        ink += int(k * k) * {'br': 0, 'bl': 15, 'bc': 25, 'tr': 40, 'tl': 55}[name]   # mild preference order
        if bestInk is None or ink < bestInk: best, bestInk = (x, y), ink
    x, y = best
    layer = Image.new('RGBA', im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(layer)
    cx = x
    for c in TEXT:   # white halo first, then the gold letters
        d.text((cx, y), c, font=font, fill=GOLD + (235,), stroke_width=max(2, round(2 * k)), stroke_fill=(255, 255, 255, 235))
        cx += font.getlength(c) + SP
    cx = x
    for c in TEXT:
        d.text((cx, y), c, font=font, fill=GOLD + (255,))
        cx += font.getlength(c) + SP
    out = Image.alpha_composite(im.convert('RGBA'), layer).convert('RGB')
    if path.lower().endswith('.webp'): out.save(path, 'WEBP', quality=92, method=6)
    else: out.save(path, 'JPEG', quality=92)

if __name__ == '__main__':
    args = sys.argv[1:]
    img = os.path.join(ROOT, 'images')
    if args == ['--all']:
        files = [os.path.join(PHOTOS, f) for f in sorted(os.listdir(PHOTOS)) if f.endswith('.webp')]
    elif args == ['--extras']:
        files = [os.path.join(img, d, f) for d in ('muscles', 'stretch') for f in sorted(os.listdir(os.path.join(img, d))) if f.endswith('.webp')]
        files.append(os.path.join(img, 'equipment-guide.jpg'))
    else:
        files = [os.path.join(ROOT, a) if os.sep in a else os.path.join(PHOTOS, a) for a in args]
    for f in files: stamp(f)
    print('stamped', len(files))
