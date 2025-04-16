#!/bin/bash

# LilGuy Sprite Sheet Slicer
# Supports Egg and Character (Normal, Angel, Devil) formats

# Frame size for all sheets
TILE_WIDTH=500
TILE_HEIGHT=500

# Create output directory
mkdir -p sliced

echo "Scanning sprite sheets..."

# Loop over all PNGs
for sheet in *.png; do
  [ "$sheet" == "sliced" ] && continue

  base="${sheet%.*}"
  echo "Processing $sheet..."

  # Slice sheet into tiles
  magick "$sheet" -crop ${TILE_WIDTH}x${TILE_HEIGHT} +repage "sliced/${base}_%02d.png"

  # Check sheet type
  if [[ "$base" == *"egg"* ]]; then
    # Egg sheet layout: 6 columns × 2 rows
    animations=("move:0:6" "hatch:1:6")
    frames_per_row=6
  else
    # Angel, Devil, Normal sheets
    animations=("idle:0:5" "walk:1:4" "happy:2:5" "angry:3:4" "sad:4:6" "sleepy:5:6")
    frames_per_row=6
  fi

  # Rename sliced files with meaningful names
  for entry in "${animations[@]}"; do
    IFS=":" read -r label row count <<< "$entry"
    for ((i=0; i<count; i++)); do
      frame=$((row * frames_per_row + i))
      printf -v old "sliced/${base}_%02d.png" "$frame"
      new="sliced/${base}_${label}_${i}.png"
      mv "$old" "$new"
    done
  done
done

echo "Done! Sliced images saved in ./sliced"