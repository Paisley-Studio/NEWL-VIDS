"""Pre-render static decorative layers (dot texture, window shadow) for the light frame.
Painting these in Chromium on every frame roughly halved render speed; as images they are free.
Usage: python -I scripts/production/build_frame_assets.py"""
import pathlib
from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "public" / "frame"
OUT.mkdir(parents=True, exist_ok=True)
W, H = 1920, 1080

# dotted texture, fading from 60% at the top to ~5% at 60% height (matches the former CSS mask)
dots = Image.new("RGBA", (W, H), (0, 0, 0, 0))
d = ImageDraw.Draw(dots)
for y in range(0, H, 30):
    fade = max(0.05, 0.6 - (0.55 * min(1, y / (H * 0.6))))
    a = int(255 * 0.09 * fade / 0.6 * 1.0)
    for x in range(0, W, 30):
        d.ellipse((x - 1.3, y - 1.3, x + 1.3, y + 1.3), fill=(21, 80, 42, max(a, 2)))
dots.save(OUT / "dots.png", optimize=True)

print("frame assets written")
