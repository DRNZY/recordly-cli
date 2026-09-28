// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { AppliedTransform } from '../../types/index.js';
import { clamp } from './easing.js';

export interface ZoomTransformParams {
  stageSize: { width: number; height: number };
  baseMask: { x: number; y: number; width: number; height: number };
  zoomScale: number;
  zoomProgress?: number;
  focusX: number; // 0.0 to 1.0 (normalized within video frame)
  focusY: number; // 0.0 to 1.0 (normalized within video frame)
}

/**
 * Computes exact 2D transformation matrix coordinates to center and zoom on focus coordinates.
 */
export function computeZoomTransform({
  stageSize,
  baseMask,
  zoomScale,
  zoomProgress = 1,
  focusX,
  focusY,
}: ZoomTransformParams): AppliedTransform {
  if (
    stageSize.width <= 0 ||
    stageSize.height <= 0 ||
    baseMask.width <= 0 ||
    baseMask.height <= 0
  ) {
    return { scale: 1, x: 0, y: 0 };
  }

  const progress = clamp(zoomProgress, 0, 1);
  const focusPxX = baseMask.x + clamp(focusX, 0, 1) * baseMask.width;
  const focusPxY = baseMask.y + clamp(focusY, 0, 1) * baseMask.height;
  const stageCenterX = stageSize.width / 2;
  const stageCenterY = stageSize.height / 2;

  const currentScale = 1 + (zoomScale - 1) * progress;
  const finalX = stageCenterX - focusPxX * zoomScale;
  const finalY = stageCenterY - focusPxY * zoomScale;

  const rawX = finalX * progress;
  const rawY = finalY * progress;

  return {
    scale: currentScale,
    x: Object.is(rawX, -0) ? 0 : rawX,
    y: Object.is(rawY, -0) ? 0 : rawY,
  };
}
