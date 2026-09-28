// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

export function clamp(val: number, min: number = 0, max: number = 1): number {
  return Math.min(max, Math.max(min, val));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutCubic(t: number): number {
  t = clamp(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutExpo(t: number): number {
  t = clamp(t);
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function smoothStep(t: number): number {
  t = clamp(t);
  return t * t * (3 - 2 * t);
}

export function spring(t: number, damping: number = 12, mass: number = 1, stiffness: number = 100): number {
  t = clamp(t);
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const envelope = Math.exp(-zeta * omega * t);
  return 1 - envelope * Math.cos(omega * Math.sqrt(1 - zeta * zeta) * t);
}
