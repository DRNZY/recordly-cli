// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as fs from 'node:fs';
import * as path from 'node:path';
import { RenderOptions, CursorPoint, ZoomRegion, AppliedTransform } from '../../types/index.js';
import { computeZoomTransform } from '../camera/transform.js';
import { easeInOutCubic, easeOutExpo, lerp, clamp } from '../camera/easing.js';
import { generateAutoZoomRegions } from '../camera/tracker.js';
import { CursorPathInterpolator } from '../cursor/smoother.js';
import { createRenderCanvas, composeFrame } from '../compositor/canvas.js';
import { probeVideo, createVideoEncoderProcess, exportToGif } from './ffmpeg.js';

export async function renderVideo(options: RenderOptions, onProgress?: (percent: number, frame: number, total: number) => void): Promise<string> {
  const isDemo = options.input === 'demo' || !fs.existsSync(options.input);

  let durationMs = 5000;
  let fps = options.fps ?? 60;
  let width = options.width ?? (options.aspectRatio === '9:16' ? 1080 : options.aspectRatio === '1:1' ? 1080 : 1920);
  let height = options.height ?? (options.aspectRatio === '9:16' ? 1920 : options.aspectRatio === '1:1' ? 1080 : 1080);

  if (!isDemo) {
    const meta = probeVideo(options.input);
    durationMs = meta.durationMs || 5000;
  }

  // Load or generate cursor points
  let cursorPoints: CursorPoint[] = options.cursorData || [];
  if (options.cursorFile && fs.existsSync(options.cursorFile)) {
    try {
      cursorPoints = JSON.parse(fs.readFileSync(options.cursorFile, 'utf-8'));
    } catch {}
  }

  if (cursorPoints.length === 0 && isDemo) {
    // Generate synthetic demo cursor trajectory with clicks
    cursorPoints = [
      { timeMs: 0, x: 0.1, y: 0.1 },
      { timeMs: 800, x: 0.25, y: 0.3, click: true },
      { timeMs: 1600, x: 0.5, y: 0.45 },
      { timeMs: 2400, x: 0.65, y: 0.6, click: true },
      { timeMs: 3400, x: 0.8, y: 0.35, click: true },
      { timeMs: 4500, x: 0.5, y: 0.5 },
      { timeMs: 5000, x: 0.5, y: 0.5 },
    ];
  }

  // Setup zoom regions
  let zoomRegions: ZoomRegion[] = options.zoomRegions || [];
  if (zoomRegions.length === 0 && (options.autoZoom !== false)) {
    zoomRegions = generateAutoZoomRegions(cursorPoints, durationMs, { maxZoom: options.maxZoom ?? 1.6 });
  }

  const cursorInterpolator = new CursorPathInterpolator(cursorPoints);
  const totalFrames = Math.max(1, Math.round((durationMs / 1000) * fps));
  const { canvas, ctx } = createRenderCanvas(width, height);

  const outputPath = path.resolve(options.output);
  const parentDir = path.dirname(outputPath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }

  const encoderProc = createVideoEncoderProcess(
    outputPath,
    width,
    height,
    fps,
    !isDemo && probeVideo(options.input).hasAudio ? options.input : undefined
  );

  const baseMask = {
    x: options.padding ?? 80,
    y: options.padding ?? 80,
    width: width - (options.padding ?? 80) * 2,
    height: height - (options.padding ?? 80) * 2,
  };

  let currentScale = 1.0;
  let currentCamX = 0;
  let currentCamY = 0;

  for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
    const timeMs = (frameIdx / fps) * 1000;

    // Check active zoom region
    const activeRegion = zoomRegions.find(r => timeMs >= r.startTimeMs && timeMs <= r.endTimeMs);

    let targetTransform: AppliedTransform = { scale: 1.0, x: 0, y: 0 };

    if (activeRegion) {
      const regionSpan = activeRegion.endTimeMs - activeRegion.startTimeMs;
      const elapsed = timeMs - activeRegion.startTimeMs;
      const remaining = activeRegion.endTimeMs - timeMs;

      // Transition durations
      const zoomInDur = Math.min(600, regionSpan * 0.25);
      const zoomOutDur = Math.min(600, regionSpan * 0.25);

      let zoomProgress = 1.0;
      if (elapsed < zoomInDur) {
        zoomProgress = easeInOutCubic(elapsed / zoomInDur);
      } else if (remaining < zoomOutDur) {
        zoomProgress = easeInOutCubic(remaining / zoomOutDur);
      }

      targetTransform = computeZoomTransform({
        stageSize: { width, height },
        baseMask,
        zoomScale: activeRegion.scale,
        zoomProgress,
        focusX: activeRegion.focusX,
        focusY: activeRegion.focusY,
      });
    }

    // Smooth lerp camera transitions
    currentScale = lerp(currentScale, targetTransform.scale, 0.25);
    currentCamX = lerp(currentCamX, targetTransform.x, 0.25);
    currentCamY = lerp(currentCamY, targetTransform.y, 0.25);

    const transform: AppliedTransform = {
      scale: currentScale,
      x: currentCamX,
      y: currentCamY,
    };

    // Sample cursor at timeMs
    const cursorState = cursorInterpolator.sampleAt(timeMs);

    // Compose frame
    composeFrame({
      canvas,
      ctx,
      transform,
      cursorState,
      options,
    });

    // Write PNG buffer to ffmpeg stream
    const buffer = canvas.toBuffer('image/png');
    const canContinue = encoderProc.stdin.write(buffer);
    if (!canContinue) {
      await new Promise(resolve => encoderProc.stdin.once('drain', resolve));
    }

    if (onProgress && frameIdx % 15 === 0) {
      const pct = Math.round((frameIdx / totalFrames) * 100);
      onProgress(pct, frameIdx, totalFrames);
    }
  }

  encoderProc.stdin.end();

  // Wait for FFmpeg process to finish
  await new Promise<void>((resolve, reject) => {
    encoderProc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
    encoderProc.on('error', err => reject(err));
  });

  // Export GIF if requested
  if (options.gif) {
    const gifPath = options.gifOutput || outputPath.replace(/\.mp4$/i, '.gif');
    await exportToGif(outputPath, gifPath, Math.min(800, width), Math.min(24, fps));
  }

  if (onProgress) {
    onProgress(100, totalFrames, totalFrames);
  }

  return outputPath;
}
