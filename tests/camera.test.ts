// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { describe, it, expect } from 'vitest';
import { easeInOutCubic, easeOutExpo, lerp, clamp } from '../src/core/camera/easing.js';
import { computeZoomTransform } from '../src/core/camera/transform.js';
import { generateAutoZoomRegions } from '../src/core/camera/tracker.js';

describe('Camera Easing and Geometry', () => {
  it('clamps values within bounds', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('interpolates linearly', () => {
    expect(lerp(10, 20, 0.5)).toBe(15);
    expect(lerp(0, 100, 0)).toBe(0);
    expect(lerp(0, 100, 1)).toBe(100);
  });

  it('computes smooth cubic ease curves', () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
  });

  it('computes 2D camera zoom transforms correctly', () => {
    const stageSize = { width: 1920, height: 1080 };
    const baseMask = { x: 80, y: 80, width: 1760, height: 920 };

    // At progress 0, transform scale should be 1.0 and offset 0,0
    const t0 = computeZoomTransform({
      stageSize,
      baseMask,
      zoomScale: 2.0,
      zoomProgress: 0,
      focusX: 0.5,
      focusY: 0.5,
    });
    expect(t0.scale).toBe(1.0);
    expect(t0.x).toBe(0);
    expect(t0.y).toBe(0);

    // At progress 1.0, scale should be 2.0
    const t1 = computeZoomTransform({
      stageSize,
      baseMask,
      zoomScale: 2.0,
      zoomProgress: 1.0,
      focusX: 0.5,
      focusY: 0.5,
    });
    expect(t1.scale).toBe(2.0);
  });

  it('generates auto zoom regions from click clusters', () => {
    const points = [
      { timeMs: 500, x: 0.2, y: 0.3, click: true },
      { timeMs: 4000, x: 0.8, y: 0.7, click: true },
    ];
    const regions = generateAutoZoomRegions(points, 8000, { maxZoom: 1.8 });
    expect(regions.length).toBeGreaterThan(0);
    expect(regions[0].scale).toBe(1.8);
    expect(regions[0].focusX).toBeCloseTo(0.2);
  });
});
