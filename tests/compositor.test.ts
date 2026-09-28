// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, it, expect } from 'vitest';
import { createRenderCanvas, composeFrame } from '../src/core/compositor/canvas.js';

describe('Canvas Frame Compositor', () => {
  it('creates canvas and composes frame without errors', () => {
    const { canvas, ctx } = createRenderCanvas(1280, 720);
    expect(canvas.width).toBe(1280);
    expect(canvas.height).toBe(720);

    expect(() => {
      composeFrame({
        canvas,
        ctx,
        transform: { scale: 1.2, x: -50, y: -30 },
        cursorState: { x: 0.5, y: 0.5, clickIntensity: 0.8, isVisible: true },
        options: {
          input: 'test',
          output: 'out.mp4',
          background: 'studio',
          padding: 40,
          borderRadius: 16,
        },
      });
    }).not.toThrow();

    const buffer = canvas.toBuffer('image/png');
    expect(buffer.length).toBeGreaterThan(1000);
  });
});
