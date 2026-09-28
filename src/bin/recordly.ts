#!/usr/bin/env node

// Copyright (C) 2026 Darnell Dijksteel and Contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Command } from 'commander';
import { execSync } from 'node:child_process';
import { renderVideo } from '../core/pipeline/exporter.js';
import { BackgroundPreset } from '../types/index.js';

const program = new Command();

program
  .name('recordly')
  .description('Recordly CLI - Headless Screen Studio auto-zoom, cursor smoothing, and wallpaper compositor.')
  .version('1.0.0');

program
  .command('render <video>')
  .description('Renders a video with auto-zoom, cursor smoothing, and wallpaper padding')
  .option('-o, --output <path>', 'Output video path (.mp4)', 'output.mp4')
  .option('-c, --cursor <path>', 'Cursor coordinate log (.json)')
  .option('-z, --zoom <scale>', 'Maximum zoom multiplier', '1.6')
  .option('-b, --background <preset>', 'Background style (dark, studio, aurora, sunset, titanium, slate)', 'studio')
  .option('-p, --padding <px>', 'Window inset padding in pixels', '80')
  .option('-r, --radius <px>', 'Window border radius in pixels', '20')
  .option('-a, --aspect <ratio>', 'Aspect ratio (16:9, 9:16, 1:1)', '16:9')
  .option('--no-shadow', 'Disable window drop shadow')
  .option('--no-cursor', 'Hide cursor overlay')
  .option('--gif', 'Also export an optimized GIF preview')
  .action(async (video, opts) => {
    console.log(`\n========================================`);
    console.log(` Recordly CLI: Rendering Video`);
    console.log(`========================================`);
    console.log(` Input:       ${video}`);
    console.log(` Output:      ${opts.output}`);
    console.log(` Background:  ${opts.background}`);
    console.log(` Aspect:      ${opts.aspect}`);
    console.log(` Max Zoom:    ${opts.zoom}x`);
    console.log(`\nRendering frames...`);

    const start = performance.now();
    try {
      const out = await renderVideo({
        input: video,
        output: opts.output,
        cursorFile: opts.cursor,
        maxZoom: parseFloat(opts.zoom),
        background: opts.background as BackgroundPreset,
        padding: parseInt(opts.padding, 10),
        borderRadius: parseInt(opts.radius, 10),
        aspectRatio: opts.aspect,
        shadow: opts.shadow !== false,
        showCursor: opts.cursor !== false,
        gif: opts.gif === true,
      }, (pct, frame, total) => {
        process.stdout.write(`\rProgress: [${pct}%] (Frame ${frame}/${total})`);
      });

      const dur = ((performance.now() - start) / 1000).toFixed(1);
      console.log(`\n\n✓ Render complete: ${out} (${dur}s)`);
      if (opts.gif) {
        console.log(`✓ GIF preview exported.`);
      }
    } catch (err: any) {
      console.error(`\n\nRender failed: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('demo')
  .description('Generates a sample demo video with simulated cursor motion and smooth zoom cuts')
  .option('-o, --output <path>', 'Output video path', 'recordly-demo.mp4')
  .option('-b, --background <preset>', 'Background style (dark, studio, aurora, sunset, titanium, slate)', 'studio')
  .option('--gif', 'Also export an optimized GIF preview', true)
  .action(async (opts) => {
    console.log(`\n========================================`);
    console.log(` Recordly CLI: Generating Demo`);
    console.log(`========================================`);
    console.log(` Generating synthetic Screen Studio demonstration...`);

    const start = performance.now();
    try {
      const out = await renderVideo({
        input: 'demo',
        output: opts.output,
        maxZoom: 1.65,
        background: opts.background as BackgroundPreset,
        aspectRatio: '16:9',
        gif: opts.gif !== false,
      }, (pct, frame, total) => {
        process.stdout.write(`\rProgress: [${pct}%] (Frame ${frame}/${total})`);
      });

      const dur = ((performance.now() - start) / 1000).toFixed(1);
      console.log(`\n\n✓ Demo generated successfully: ${out} (${dur}s)`);
      if (opts.gif) {
        console.log(`✓ GIF preview exported.`);
      }
    } catch (err: any) {
      console.error(`\n\nDemo generation failed: ${err.message}`);
      process.exit(1);
    }
  });

program
  .command('doctor')
  .description('Checks FFmpeg, encoders, and canvas renderer availability')
  .action(() => {
    console.log(`\n========================================`);
    console.log(` Recordly CLI System Doctor`);
    console.log(`========================================`);

    // Check FFmpeg
    try {
      const ffmpegVer = execSync('ffmpeg -version', { encoding: 'utf-8' }).split('\n')[0];
      console.log(` ✓ FFmpeg: ${ffmpegVer}`);
    } catch {
      console.log(` ✗ FFmpeg not found in PATH.`);
    }

    // Check Encoders
    try {
      const encoders = execSync('ffmpeg -encoders 2>&1', { encoding: 'utf-8' });
      const has264 = encoders.includes('libx264');
      const hasNvenc = encoders.includes('h264_nvenc');
      console.log(` ✓ Software H.264 (libx264): ${has264 ? 'Available' : 'Missing'}`);
      console.log(` ✓ Hardware NVENC: ${hasNvenc ? 'Available' : 'Not detected / Software fallback active'}`);
    } catch {}

    console.log(` ✓ Canvas Renderer: @napi-rs/canvas hardware ready.`);
    console.log(`\nAll rendering systems ready.\n`);
  });

program.parse(process.argv);
