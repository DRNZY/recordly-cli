// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, it, expect } from 'vitest';
import { CursorPathInterpolator } from '../src/core/cursor/smoother.js';

describe('Cursor Interpolation', () => {
  it('interpolates positions between keyframe points smoothly', () => {
    const points = [
      { timeMs: 0, x: 100, y: 100 },
      { timeMs: 1000, x: 200, y: 300, click: true },
    ];
    const interp = new CursorPathInterpolator(points);

    const mid = interp.sampleAt(500);
    expect(mid.x).toBeGreaterThan(100);
    expect(mid.x).toBeLessThan(200);
    expect(mid.y).toBeGreaterThan(100);
    expect(mid.y).toBeLessThan(300);
    expect(mid.isVisible).toBe(true);
  });

  it('calculates click shockwave intensity', () => {
    const points = [
      { timeMs: 1000, x: 500, y: 500, click: true },
      { timeMs: 2000, x: 600, y: 600 },
    ];
    const interp = new CursorPathInterpolator(points);

    const atClick = interp.sampleAt(1000);
    expect(atClick.clickIntensity).toBe(1.0);

    const afterClick = interp.sampleAt(1150);
    expect(afterClick.clickIntensity).toBeGreaterThan(0);
    expect(afterClick.clickIntensity).toBeLessThan(1.0);

    const later = interp.sampleAt(1500);
    expect(later.clickIntensity).toBe(0);
  });
});
