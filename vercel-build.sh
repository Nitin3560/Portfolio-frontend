#!/bin/sh
set -eu
python3 build.py
mkdir -p public/music
cp index.html Nitin_Resume.pdf apple-touch-icon.png favicon-32.png favicon.ico favicon.svg og-image.png wallpaper.png public/
cp music/nsr-night-drive.wav music/nsr-harbor-lights.wav music/nsr-neon-rain.wav public/music/
