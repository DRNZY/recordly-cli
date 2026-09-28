// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { CursorPoint } from '../../types/index.js';
import { lerp, smoothStep } from '../camera/easing.js';

export class CursorPathInterpolator {
  private points: CursorPoint[];

  constructor(points: CursorPoint[]) {
    // Sort by timestamp
    this.points = [...points].sort((a, b) => a.timeMs - b.timeMs);
  }

  /**
   * Samples smooth cursor position at exact timestamp in milliseconds.
   */
  public sampleAt(timeMs: number): { x: number; y: number; clickIntensity: number; isVisible: boolean } {
    if (this.points.length === 0) {
      return { x: 0.5, y: 0.5, clickIntensity: 0, isVisible: false };
    }

    let x = this.points[0].x;
    let y = this.points[0].y;

    if (timeMs <= this.points[0].timeMs) {
      x = this.points[0].x;
      y = this.points[0].y;
    } else if (timeMs >= this.points[this.points.length - 1].timeMs) {
      const last = this.points[this.points.length - 1];
      x = last.x;
      y = last.y;
    } else {
      // Binary search for surrounding points
      let low = 0;
      let high = this.points.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (this.points[mid].timeMs <= timeMs && this.points[mid + 1]?.timeMs > timeMs) {
          low = mid;
          break;
        }
        if (this.points[mid].timeMs > timeMs) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }

      const p0 = this.points[low];
      const p1 = this.points[Math.min(this.points.length - 1, low + 1)];

      const span = p1.timeMs - p0.timeMs;
      const progress = span > 0 ? (timeMs - p0.timeMs) / span : 0;
      const smoothedT = smoothStep(progress);

      x = lerp(p0.x, p1.x, smoothedT);
      y = lerp(p0.y, p1.y, smoothedT);
    }

    // Calculate click ripple intensity across nearby click points
    let clickIntensity = 0;
    for (const p of this.points) {
      if (p.click && timeMs >= p.timeMs && timeMs <= p.timeMs + 350) {
        const elapsed = timeMs - p.timeMs;
        clickIntensity = Math.max(clickIntensity, 1 - (elapsed / 350));
      }
    }

    return {
      x,
      y,
      clickIntensity,
      isVisible: true,
    };
  }
}
