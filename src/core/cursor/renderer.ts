// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface DrawCursorOptions {
  scale?: number;
  showClickRipple?: boolean;
}

/**
 * Draws an Apple-style cursor arrow and click ripple on an HTML/Node Canvas 2D context.
 */
export function drawCursor(
  ctx: any,
  x: number,
  y: number,
  clickIntensity: number = 0,
  options: DrawCursorOptions = {}
): void {
  const scale = options.scale ?? 1.0;

  ctx.save();
  ctx.translate(x, y);

  // Click shockwave animation
  if (clickIntensity > 0 && options.showClickRipple !== false) {
    const rippleRadius = (1 - clickIntensity) * 28 * scale;
    const alpha = clickIntensity * 0.7;

    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, rippleRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.4})`;
    ctx.fill();
    ctx.lineWidth = 2 * scale;
    ctx.strokeStyle = `rgba(147, 197, 253, ${alpha})`;
    ctx.stroke();
    ctx.restore();
  }

  // Cursor shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
  ctx.shadowBlur = 6 * scale;
  ctx.shadowOffsetX = 1 * scale;
  ctx.shadowOffsetY = 3 * scale;

  ctx.scale(scale, scale);

  // Draw cursor pointer path
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 16);
  ctx.lineTo(4.5, 12);
  ctx.lineTo(8.5, 20);
  ctx.lineTo(11, 19);
  ctx.lineTo(7, 11);
  ctx.lineTo(13, 11);
  ctx.closePath();

  ctx.fillStyle = '#FFFFFF';
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#1E293B';
  ctx.stroke();

  ctx.restore();
}
