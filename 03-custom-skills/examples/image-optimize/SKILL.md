---
name: image-optimize
description: Optimize PNG and JPEG images locally using pngquant and mozjpeg/jpegtran — TinyPNG-level compression without API keys.
version: 1.0.0
---

# Image Optimizer

Compress PNG and JPEG images locally. Achieves 60–80% size reduction with no visible quality loss.

## Requirements

```bash
brew install pngquant mozjpeg
```

Verify:
```bash
pngquant --version          # 3.0.3+
/opt/homebrew/opt/mozjpeg/bin/jpegtran -version
```

## PNG Optimization (pngquant — lossy, best ratio)

```bash
# Single file, overwrite in place
pngquant --quality=75-90 --speed=1 --force --output image.png image.png

# All PNGs in a directory
for f in /path/to/dir/*.png; do
  before=$(stat -f%z "$f")
  pngquant --quality=75-90 --speed=1 --force --output "$f" "$f"
  after=$(stat -f%z "$f")
  pct=$(( (before - after) * 100 / before ))
  echo "$f: $(( before/1024 ))KB → $(( after/1024 ))KB (-${pct}%)"
done
```

### PNG Quality presets
| Use case | `--quality` |
|----------|-------------|
| Blog covers, hero images | `75-90` |
| Product/portfolio (high quality) | `85-95` |
| Thumbnails, icons | `65-80` |

## JPEG Optimization (jpegtran — lossless recompression)

```bash
JPEGTRAN=/opt/homebrew/opt/mozjpeg/bin/jpegtran

# Single file
$JPEGTRAN -copy none -optimize -progressive -outfile output.jpg input.jpg

# All JPEGs in a directory, overwrite in place
for f in /path/to/dir/*.jpg /path/to/dir/*.jpeg; do
  [ -f "$f" ] || continue
  before=$(stat -f%z "$f")
  $JPEGTRAN -copy none -optimize -progressive -outfile "$f.tmp" "$f" && mv "$f.tmp" "$f"
  after=$(stat -f%z "$f")
  pct=$(( (before - after) * 100 / before ))
  echo "$f: $(( before/1024 ))KB → $(( after/1024 ))KB (-${pct}%)"
done
```

## Combined Script (PNG + JPEG in one directory)

```bash
#!/bin/bash
# Usage: optimize-images.sh /path/to/dir
DIR="${1:-.}"
JPEGTRAN=/opt/homebrew/opt/mozjpeg/bin/jpegtran
total_before=0; total_after=0

for f in "$DIR"/*.png "$DIR"/*.PNG; do
  [ -f "$f" ] || continue
  before=$(stat -f%z "$f")
  pngquant --quality=75-90 --speed=1 --force --output "$f" "$f"
  after=$(stat -f%z "$f")
  total_before=$((total_before + before))
  total_after=$((total_after + after))
  echo "PNG $f: $(( before/1024 ))KB → $(( after/1024 ))KB (-$(( (before-after)*100/before ))%)"
done

for f in "$DIR"/*.jpg "$DIR"/*.jpeg "$DIR"/*.JPG "$DIR"/*.JPEG; do
  [ -f "$f" ] || continue
  before=$(stat -f%z "$f")
  $JPEGTRAN -copy none -optimize -progressive -outfile "$f.tmp" "$f" && mv "$f.tmp" "$f"
  after=$(stat -f%z "$f")
  total_before=$((total_before + before))
  total_after=$((total_after + after))
  echo "JPEG $f: $(( before/1024 ))KB → $(( after/1024 ))KB (-$(( (before-after)*100/before ))%)"
done

if [ $total_before -gt 0 ]; then
  echo ""
  echo "Total: $(( total_before/1024 ))KB → $(( total_after/1024 ))KB (-$(( (total_before-total_after)*100/total_before ))%)"
fi
```

## Typical Results

| Format | Average reduction |
|--------|------------------|
| PNG (pngquant lossy) | 60–75% |
| JPEG (jpegtran lossless) | 5–20% |
| JPEG (cjpeg lossy) | 30–60% |

## Notes

- **pngquant** is lossy but visually lossless at quality 75+. Output passes visual inspection.
- **jpegtran** from mozjpeg is lossless — zero quality loss, strips metadata, progressive encoding.
- For web: always target < 200KB for hero/cover images, < 50KB for thumbnails.
- pngquant outputs same filename when `--output` equals input — use `--force` flag.
- On macOS, `stat -f%z` gives file size in bytes (Linux uses `stat -c%s`).
