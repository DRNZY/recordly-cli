// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { BackgroundPreset } from '../../types/index.js';

export function renderBackground(
  ctx: any,
  width: number,
  height: number,
  bg: BackgroundPreset | string = 'dark'
): void {
  ctx.save();

  if (bg.startsWith('#') || bg.startsWith('rgb')) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
    return;
  }

  switch (bg) {
    case 'studio': {
      // Clean Apple Studio gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#18181B');
      grad.addColorStop(0.5, '#09090B');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'aurora': {
      // Modern vibrant violet/cyan gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#4338CA');
      grad.addColorStop(0.5, '#6366F1');
      grad.addColorStop(1, '#06B6D4');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'sunset': {
      // Warm dusk gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#7C2D12');
      grad.addColorStop(0.5, '#BE123C');
      grad.addColorStop(1, '#4C1D95');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'titanium': {
      // Sleek metallic dark gradient
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#27272A');
      grad.addColorStop(1, '#09090B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'slate': {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#1E293B');
      grad.addColorStop(1, '#0F172A');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
    case 'dark':
    default: {
      // High contrast deep obsidian
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, 50,
        width / 2, height / 2, Math.max(width, height) / 1.2
      );
      grad.addColorStop(0, '#1E1E24');
      grad.addColorStop(1, '#0B0B0E');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      break;
    }
  }

  ctx.restore();
}
