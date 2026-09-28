# recordly-cli

A headless CLI and rendering engine for Screen Studio-style auto-zoomed videos, smooth cursor paths, and wallpaper padding on Linux, macOS, and Windows.

Decoupled from Electron and desktop GUI dependencies, `recordly-cli` takes screen recordings and cursor coordinate logs (or generates synthetic action scripts) to produce 60fps MP4 and GIF videos from the terminal.

## Features

* Camera and Zoom Engine: Computes 2D viewport camera transforms, centering and zooming smoothly (1.0x to 2.5x) on click events and user activity points using cubic ease curves.
* Cursor Path Smoothing: Interpolates discrete timestamped mouse coordinates into smooth curves with animated click shockwaves.
* Studio Compositor: Adds luxury gradient wallpapers, rounded window borders, macOS traffic light chrome, and multi-layer diffused drop shadows.
* Streaming FFmpeg Pipeline: Streams hardware-accelerated H.264 MP4 and palette-optimized GIF frames directly via stdin without writing temporary frame images to disk.

## Installation

```bash
git clone https://github.com/DRNZY/recordly-cli.git
cd recordly-cli
npm install
npm run build
npm link
```

## CLI Usage

### 1. Render Screen Recording with Auto-Zoom

```bash
# Render video with auto-detected zoom cuts from cursor clicks
recordly render input.mp4 --cursor coordinates.json --output demo.mp4 --gif

# Customize background and aspect ratio
recordly render input.mp4 -b aurora --aspect 16:9 -z 1.8 -o output.mp4
```

### 2. Generate Synthetic Demo

```bash
# Generates a demo video and GIF with synthetic cursor and zoom motion
recordly demo --output sample-demo.mp4 --gif
```

### 3. System Health Check

```bash
recordly doctor
```

## Background Presets

* `dark`: Deep radial obsidian gradient.
* `studio`: Minimalist Apple Studio gradient.
* `aurora`: Vibrant indigo and cyan gradient.
* `sunset`: Warm amber and violet gradient.
* `titanium`: Dark brushed metallic gradient.
* `slate`: High contrast blue-slate gradient.

## License and Attribution

Licensed under the GNU Affero General Public License version 3 (AGPLv3).

This project adapts and rebuilds algorithms from:
* Recordly (AGPLv3) by webadderall.
* OpenScreen (MIT) by Siddharth Vaddem.

See the [LICENSE](LICENSE) and [NOTICE](NOTICE) files for complete details.
