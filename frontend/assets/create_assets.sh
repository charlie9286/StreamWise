#!/bin/bash
cd "$(dirname "$0")"

# Create minimal valid PNG files using base64 encoded 1x1 pixel images
# These are minimal valid PNGs that can be replaced later

# 1x1 blue pixel PNG (base64)
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > icon.png
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > splash.png
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > adaptive-icon.png
echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > favicon.png

# Resize using sips if available
if command -v sips &> /dev/null; then
    sips -z 1024 1024 icon.png --out icon.png.tmp && mv icon.png.tmp icon.png 2>/dev/null || true
    sips -z 1242 2436 splash.png --out splash.png.tmp && mv splash.png.tmp splash.png 2>/dev/null || true
    sips -z 1024 1024 adaptive-icon.png --out adaptive-icon.png.tmp && mv adaptive-icon.png.tmp adaptive-icon.png 2>/dev/null || true
    sips -z 48 48 favicon.png --out favicon.png.tmp && mv favicon.png.tmp favicon.png 2>/dev/null || true
fi

echo "Created placeholder assets"
