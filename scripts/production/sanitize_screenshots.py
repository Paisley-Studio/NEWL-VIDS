"""Build the published screenshot set from the original captures.

- Reads scripts/production/screenshots.json (inventory + logical order).
- Pixelates and blurs every `redact` box (credentials, phone numbers, e-mails, IDs).
- Cleans the 3px browser artefact line at the top of some captures.
- Pads each capture onto a common canvas (edge-extended, top-left anchored) so the
  coordinates used in the lesson scripts stay identical to the original pixels.
- Writes public/screenshots/<id>.png and public/screenshots/index.json.

Originals in Images/ (as supplied in Images.zip) are never modified.

Usage:  python -I scripts/production/sanitize_screenshots.py
"""
import json
import pathlib
import sys

from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[2]
INVENTORY = ROOT / "scripts" / "production" / "screenshots.json"
ORIGINALS = ROOT / "Images"  # the supplied captures, exactly as delivered in Images.zip (git-ignored)
OUT = ROOT / "public" / "screenshots"


def redact(img: Image.Image, box):
    x1, y1, x2, y2 = box
    region = img.crop((x1, y1, x2, y2))
    w, h = region.size
    small = region.resize((max(1, w // 14), max(1, h // 14)), Image.BILINEAR)
    region = small.resize((w, h), Image.NEAREST).filter(ImageFilter.GaussianBlur(7))
    img.paste(region, (x1, y1))


def shift(img: Image.Image, dx: int, dy: int) -> Image.Image:
    """Translate the capture by (dx, dy), edge-extending the uncovered strip."""
    w, h = img.size
    out = Image.new("RGB", (w, h))
    out.paste(img, (dx, dy))
    if dx > 0:
        out.paste(out.crop((dx, 0, dx + 1, h)).resize((dx, h)), (0, 0))
    if dy > 0:
        out.paste(out.crop((0, dy, w, dy + 1)).resize((w, dy)), (0, 0))
    if dx < 0:
        out.paste(out.crop((w + dx - 1, 0, w + dx, h)).resize((-dx, h)), (w + dx, 0))
    if dy < 0:
        out.paste(out.crop((0, h + dy - 1, w, h + dy)).resize((w, -dy)), (0, h + dy))
    return out


def pad(img: Image.Image, width: int, height: int) -> Image.Image:
    w, h = img.size
    canvas = Image.new("RGB", (max(w, width), max(h, height)))
    canvas.paste(img, (0, 0))
    if w < width:  # extend last column
        col = img.crop((w - 1, 0, w, h)).resize((width - w, h))
        canvas.paste(col, (w, 0))
    if h < height:  # extend last row (including the extended corner)
        row = canvas.crop((0, h - 1, canvas.width, h)).resize((canvas.width, height - h))
        canvas.paste(row, (0, h))
    return canvas.crop((0, 0, width, height))


def main() -> int:
    data = json.loads(INVENTORY.read_text(encoding="utf-8"))
    cw, ch = data["canvas"]["width"], data["canvas"]["height"]
    OUT.mkdir(parents=True, exist_ok=True)
    index = []
    missing = []
    for s in data["screens"]:
        src = ORIGINALS / s["source"]
        if not src.exists():
            missing.append(str(src))
            continue
        img = Image.open(src).convert("RGB")
        # remove dark 1-3px browser artefact line at the very top
        w, h = img.size
        clean = img.crop((0, 4, w, 5)).resize((w, 4))
        img.paste(clean, (0, 0))
        for box in s.get("redact", []):
            redact(img, box)
        if s.get("shift"):
            img = shift(img, *s["shift"])
        out = pad(img, cw, ch)
        out.save(OUT / f"{s['id']}.png", optimize=True)
        index.append({"id": s["id"], "file": f"screenshots/{s['id']}.png", "title": s["title"],
                      "originalSize": [w, h], "redacted": len(s.get("redact", []))})
        print(f"  {s['id']:<42} {w}x{h}  redactions={len(s.get('redact', []))}")
    (OUT / "index.json").write_text(json.dumps(index, indent=2), encoding="utf-8")
    if missing:
        # Originals are not committed (they contain credentials). In CI the
        # already-sanitised copies in public/screenshots are used instead.
        print("Originals not found (using committed sanitised copies):", *missing, sep="\n  ")
        return 0 if all((OUT / f"{s['id']}.png").exists() for s in data["screens"]) else 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
