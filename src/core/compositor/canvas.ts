// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { createCanvas, Image, Canvas, SKRSContext2D } from '@napi-rs/canvas';
import { RenderOptions, AppliedTransform } from '../../types/index.js';
import { renderBackground } from './backgrounds.js';
import { drawRoundedRect, drawWindowShadow, drawWindowChrome, FrameGeometry } from './frame.js';
import { drawCursor } from '../cursor/renderer.js';

export interface ComposeFrameParams {
  canvas: Canvas;
  ctx: SKRSContext2D;
  videoImage?: Image | Canvas | null;
  transform: AppliedTransform;
  cursorState?: { x: number; y: number; clickIntensity: number; isVisible: boolean };
  options: RenderOptions;
}

export function createRenderCanvas(width: number = 1920, height: number = 1080): { canvas: Canvas; ctx: SKRSContext2D } {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  return { canvas, ctx };
}

export function composeFrame({
  canvas,
  ctx,
  videoImage,
  transform,
  cursorState,
  options,
}: ComposeFrameParams): void {
  const width = canvas.width;
  const height = canvas.height;
  const padding = options.padding ?? 80;
  const borderRadius = options.borderRadius ?? 20;

  // Base mask coordinates (the window bounds before camera zoom)
  const baseMask: FrameGeometry = {
    x: padding,
    y: padding,
    width: width - padding * 2,
    height: height - padding * 2,
    borderRadius,
  };

  // 1. Draw Background
  renderBackground(ctx, width, height, options.background || 'dark');

  // 2. Camera Viewport Transformation
  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.scale, transform.scale);

  // 3. Draw Window Drop Shadow
  if (options.shadow !== false) {
    drawWindowShadow(ctx, baseMask, options.shadowBlur ?? 35, options.shadowColor ?? 'rgba(0,0,0,0.5)');
  }

  // 4. Clip to Rounded Rect Window
  ctx.save();
  drawRoundedRect(ctx, baseMask.x, baseMask.y, baseMask.width, baseMask.height, baseMask.borderRadius);
  ctx.clip();

  // Draw source video frame
  if (videoImage) {
    ctx.drawImage(videoImage, baseMask.x, baseMask.y, baseMask.width, baseMask.height);
  } else {
    // Fallback dark placeholder with titanium gradient
    ctx.fillStyle = '#111827';
    ctx.fillRect(baseMask.x, baseMask.y, baseMask.width, baseMask.height);
  }

  ctx.restore(); // Exit clip

  // 5. Draw Window Border Chrome
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, baseMask.x, baseMask.y, baseMask.width, baseMask.height, baseMask.borderRadius);
  ctx.stroke();

  // Draw traffic lights
  drawWindowChrome(ctx, baseMask.x + 24, baseMask.y + 24);
  ctx.restore();

  // 6. Draw Cursor
  if (cursorState && cursorState.isVisible && options.showCursor !== false) {
    // Map normalized cursor coords to window space
    let cx = cursorState.x;
    let cy = cursorState.y;
    if (cx <= 1.0) cx = baseMask.x + cx * baseMask.width;
    if (cy <= 1.0) cy = baseMask.y + cy * baseMask.height;

    drawCursor(ctx, cx, cy, cursorState.clickIntensity, {
      scale: options.cursorScale ?? 1.0,
      showClickRipple: options.showClickRipples !== false,
    });
  }

  ctx.restore(); // Exit camera transform
}
