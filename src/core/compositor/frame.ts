// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface FrameGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
}

export function drawRoundedRect(
  ctx: any,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

/**
 * Draws multi-layer diffused drop shadow around the window frame.
 */
export function drawWindowShadow(
  ctx: any,
  geom: FrameGeometry,
  blur: number = 40,
  color: string = 'rgba(0, 0, 0, 0.45)'
): void {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 16;

  ctx.fillStyle = 'rgba(0, 0, 0, 1)';
  drawRoundedRect(ctx, geom.x, geom.y, geom.width, geom.height, geom.borderRadius);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws macOS traffic light window chrome dots.
 */
export function drawWindowChrome(
  ctx: any,
  x: number,
  y: number
): void {
  ctx.save();
  const radius = 6;
  const gap = 8;

  // Red (Close)
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#FF5F56';
  ctx.fill();

  // Yellow (Minimize)
  ctx.beginPath();
  ctx.arc(x + radius * 2 + gap, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#FFBD2E';
  ctx.fill();

  // Green (Maximize)
  ctx.beginPath();
  ctx.arc(x + (radius * 2 + gap) * 2, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#27C93F';
  ctx.fill();

  ctx.restore();
}
