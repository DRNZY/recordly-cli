// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

export interface CursorPoint {
  timeMs: number;
  x: number; // 0.0 to 1.0 (normalized) or pixel coordinates
  y: number; // 0.0 to 1.0 (normalized) or pixel coordinates
  click?: boolean;
  clickType?: 'left' | 'right' | 'middle';
}

export interface ZoomRegion {
  startTimeMs: number;
  endTimeMs: number;
  focusX: number; // 0.0 to 1.0 (normalized)
  focusY: number; // 0.0 to 1.0 (normalized)
  scale: number; // e.g. 1.5, 2.0
  easing?: 'easeInOut' | 'easeOutExpo' | 'spring' | 'linear';
}

export type BackgroundPreset = 'dark' | 'studio' | 'aurora' | 'sunset' | 'titanium' | 'slate';

export interface RenderOptions {
  input: string;
  output: string;
  cursorFile?: string;
  cursorData?: CursorPoint[];
  zoomRegions?: ZoomRegion[];
  autoZoom?: boolean;
  maxZoom?: number;
  background?: BackgroundPreset | string;
  padding?: number;
  borderRadius?: number;
  shadow?: boolean;
  shadowBlur?: number;
  shadowColor?: string;
  fps?: number;
  width?: number;
  height?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1';
  gif?: boolean;
  gifOutput?: string;
  showCursor?: boolean;
  cursorScale?: number;
  showClickRipples?: boolean;
}

export interface AppliedTransform {
  scale: number;
  x: number;
  y: number;
}

export interface CameraState {
  scale: number;
  x: number;
  y: number;
  focusX: number;
  focusY: number;
}

export interface VideoMetadata {
  width: number;
  height: number;
  durationMs: number;
  fps: number;
  hasAudio: boolean;
}
