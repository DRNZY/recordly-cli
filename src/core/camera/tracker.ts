// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { CursorPoint, ZoomRegion } from '../../types/index.js';

export interface TrackerOptions {
  maxZoom?: number;
  minZoomDurationMs?: number;
  clickHoldDurationMs?: number;
}

/**
 * Analyzes cursor trace logs (clicks, pauses, clusters) and automatically
 * generates smooth zoom regions around points of user interest.
 */
export function generateAutoZoomRegions(
  cursorPoints: CursorPoint[],
  totalDurationMs: number,
  options: TrackerOptions = {}
): ZoomRegion[] {
  const maxZoom = options.maxZoom ?? 1.5;
  const minDuration = options.minZoomDurationMs ?? 2000;
  const clickHold = options.clickHoldDurationMs ?? 2500;

  if (!cursorPoints || cursorPoints.length === 0) {
    return [];
  }

  // Find click events
  const clicks = cursorPoints.filter(p => p.click);
  const regions: ZoomRegion[] = [];

  for (const click of clicks) {
    const startTime = Math.max(0, click.timeMs - 400);
    const endTime = Math.min(totalDurationMs, click.timeMs + clickHold);

    // Normalize coordinates if given in pixels (>1)
    let fx = click.x;
    let fy = click.y;
    if (fx > 1.0) fx = Math.min(1.0, fx / 1920);
    if (fy > 1.0) fy = Math.min(1.0, fy / 1080);

    // Check if overlapping with previous region
    const prev = regions[regions.length - 1];
    if (prev && startTime < prev.endTimeMs + 500) {
      // Extend previous region and average focus coordinates
      prev.endTimeMs = Math.max(prev.endTimeMs, endTime);
      prev.focusX = (prev.focusX + fx) / 2;
      prev.focusY = (prev.focusY + fy) / 2;
    } else {
      regions.push({
        startTimeMs: startTime,
        endTimeMs: endTime,
        focusX: fx,
        focusY: fy,
        scale: maxZoom,
        easing: 'easeInOut',
      });
    }
  }

  return regions.filter(r => r.endTimeMs - r.startTimeMs >= minDuration);
}
