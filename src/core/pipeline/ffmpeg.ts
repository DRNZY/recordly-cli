// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { spawn, execSync } from 'node:child_process';
import { VideoMetadata } from '../../types/index.js';

/**
 * Probes input video file metadata using ffmpeg.
 */
export function probeVideo(filePath: string): VideoMetadata {
  try {
    const cmd = `ffmpeg -i "${filePath}" 2>&1`;
    const output = execSync(cmd, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    return parseFfmpegOutput(output);
  } catch (err: any) {
    const output = err.stdout || err.stderr || '';
    return parseFfmpegOutput(output);
  }
}

function parseFfmpegOutput(output: string): VideoMetadata {
  let width = 1920;
  let height = 1080;
  let durationMs = 5000;
  let fps = 30;
  let hasAudio = output.includes('Audio:');

  // Parse dimensions e.g. "1920x1080"
  const dimMatch = output.match(/(\d{3,5})x(\d{3,5})/);
  if (dimMatch) {
    width = parseInt(dimMatch[1], 10);
    height = parseInt(dimMatch[2], 10);
  }

  // Parse FPS e.g. "60 fps" or "30 fps"
  const fpsMatch = output.match(/(\d+(?:\.\d+)?)\s*fps/);
  if (fpsMatch) {
    fps = Math.round(parseFloat(fpsMatch[1]));
  }

  // Parse duration e.g. "Duration: 00:00:05.40"
  const durMatch = output.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d+)/);
  if (durMatch) {
    const hours = parseInt(durMatch[1], 10);
    const mins = parseInt(durMatch[2], 10);
    const secs = parseFloat(durMatch[3]);
    durationMs = Math.round((hours * 3600 + mins * 60 + secs) * 1000);
  }

  return { width, height, durationMs, fps, hasAudio };
}

/**
 * Spawns an FFmpeg video encoder process accepting raw JPEG/PNG/PPM frames on stdin.
 */
export function createVideoEncoderProcess(
  outputPath: string,
  width: number,
  height: number,
  fps: number = 60,
  audioSource?: string
) {
  const args = [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', String(fps),
    '-i', '-',
  ];

  if (audioSource) {
    args.push('-i', audioSource, '-c:a', 'aac', '-b:a', '192k');
  }

  args.push(
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    outputPath
  );

  return spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'pipe'] });
}

/**
 * Generates an optimized 2-pass GIF from a rendered video file.
 */
export function exportToGif(inputVideoPath: string, outputGifPath: string, width: number = 800, fps: number = 24): Promise<void> {
  return new Promise((resolve, reject) => {
    const filter = `fps=${fps},scale=${width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer`;
    const proc = spawn('ffmpeg', [
      '-y',
      '-i', inputVideoPath,
      '-vf', filter,
      outputGifPath,
    ], { stdio: ['ignore', 'pipe', 'pipe'] });

    proc.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg GIF export failed with exit code ${code}`));
    });

    proc.on('error', err => reject(err));
  });
}
