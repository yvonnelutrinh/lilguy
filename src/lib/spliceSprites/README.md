# LilGuy Sprite Slicer

This script slices up all of our sprite sheets for the LilGuy dashboard and renames the frames based on animation states. It works for every sprite type we’ve got—egg, hatchling, angel, devil, and the regular forms in all their color variants.

---

## How it works

We’ve got two types of sprite sheet layouts:

### Egg sprites:
- Image size: 3000x1000
- Each frame: 500x500
- Grid: 6 columns × 2 rows
- Animations:
  - Row 0: `move` (6 frames)
  - Row 1: `hatch` (6 frames)

### Angel / Devil / Regular sprites:
- Image size: 3000x3000
- Each frame: 500x500
- Grid: 6 columns × 6 rows
- Animations:
  - Row 0: `idle` (5 frames)
  - Row 1: `walk` (4 frames)
  - Row 2: `happy` (5 frames)
  - Row 3: `angry` (4 frames)
  - Row 4: `sad` (6 frames)
  - Row 5: `sleepy` (6 frames)

The script slices each sprite sheet using ImageMagick, figures out which layout it’s using (based on filename), then names the output files like this:

```
angel_black_idle_0.png
egg_green_hatch_3.png
lilguy_blue_walk_2.png
```

All sliced frames go into a `sliced/` folder next to the script.

---

## How to use it

1. Put all the sprite sheets (PNG format) into a folder with the script.
2. Make the script executable:

   ```bash
   chmod +x slice_lilguy_sprites.sh
   ```

3. Run it:

   ```bash
   ./slice_lilguy_sprites.sh
   ```

You’ll get all the sliced and renamed frames in a `sliced/` folder.

---

## Requirements

- [ImageMagick](https://imagemagick.org) needs to be installed.  
  You can install it with:
  - macOS: `brew install imagemagick`
  - Ubuntu: `sudo apt install imagemagick`
  - Windows (WSL or Git Bash): Install from the official site

---

Let us know if you add more animation rows or change the layout of the sheets so we can keep the script updated.