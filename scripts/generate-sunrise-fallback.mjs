import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import sharp from "sharp";

const width = 1280;
const height = 720;
const frameCount = 48;
const outputPath = path.resolve("public/sunrise-fallback.mp4");

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function frameSvg(frameIndex) {
  const progress = frameIndex / (frameCount - 1);
  const sunriseProgress = Math.min(1, progress * 1.15);
  const skyTop = progress < 0.5 ? "#110a09" : "#5b3520";
  const skyMid = progress < 0.45 ? "#4a2b1d" : "#a15f28";
  const skyBottom = progress < 0.55 ? "#e28a3b" : "#ffd07b";
  const sunY = 470 - sunriseProgress * 180 + Math.sin(progress * Math.PI * 3) * 4;
  const sunX = 640 + Math.sin(progress * Math.PI * 2) * 24;
  const cloudShift = progress * 160;
  const glowOpacity = 0.18 + sunriseProgress * 0.32;
  const seaGlow = 0.1 + sunriseProgress * 0.2;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skyTop}" />
        <stop offset="52%" stop-color="${skyMid}" />
        <stop offset="100%" stop-color="${skyBottom}" />
      </linearGradient>
      <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="rgba(255,248,223,0.98)" />
        <stop offset="28%" stop-color="rgba(255,214,131,0.48)" />
        <stop offset="60%" stop-color="rgba(255,180,92,0.16)" />
        <stop offset="100%" stop-color="rgba(255,180,92,0)" />
      </radialGradient>
      <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#sky)" />
    <ellipse cx="640" cy="420" rx="440" ry="210" fill="rgba(255,184,100,${glowOpacity})" filter="url(#blur)" />
    <ellipse cx="${sunX}" cy="${sunY}" rx="120" ry="120" fill="url(#sunGlow)" opacity="${0.72 + sunriseProgress * 0.24}" />
    <circle cx="${sunX}" cy="${sunY}" r="58" fill="rgba(255,244,210,${0.8 + sunriseProgress * 0.18})" />
    <path d="M0 540C150 500 280 506 360 530C452 558 560 562 640 540C736 514 842 504 960 524C1080 546 1170 548 1280 520V720H0Z" fill="rgba(18,13,11,0.96)" />
    <path d="M0 570C140 548 264 548 364 576C470 606 580 604 676 578C772 552 878 542 988 562C1090 580 1186 582 1280 556V720H0Z" fill="rgba(8,8,8,0.95)" />
    <rect x="0" y="468" width="1280" height="78" fill="rgba(255,255,255,${seaGlow})" />
    <g fill="rgba(255,255,255,0.08)">
      <rect x="${clamp(120 + cloudShift * 0.35, -200, 1180)}" y="116" width="200" height="18" rx="9" />
      <rect x="${clamp(260 + cloudShift * 0.58, -160, 1200)}" y="90" width="130" height="14" rx="7" />
      <rect x="${clamp(760 + cloudShift * 0.68, -140, 1220)}" y="140" width="180" height="16" rx="8" />
      <rect x="${clamp(920 + cloudShift * 0.42, -140, 1240)}" y="200" width="140" height="12" rx="6" />
    </g>
    <g fill="rgba(255,255,255,0.16)">
      <rect x="${clamp(180 + cloudShift * 0.22, -200, 1180)}" y="220" width="220" height="14" rx="7" />
      <rect x="${clamp(820 + cloudShift * 0.38, -180, 1200)}" y="238" width="170" height="14" rx="7" />
    </g>
    <text x="72" y="90" fill="rgba(255,255,255,0.88)" font-size="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" letter-spacing="4">精选真实日出视频</text>
    <text x="72" y="130" fill="rgba(255,255,255,0.52)" font-size="20" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" letter-spacing="2">本地回退 · 自动循环</text>
  </svg>`;
}

const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "md-sunrise-"));
const framesDir = path.join(tempDir, "frames");
await fs.mkdir(framesDir, { recursive: true });

for (let index = 0; index < frameCount; index += 1) {
  const svg = Buffer.from(frameSvg(index));
  const framePath = path.join(framesDir, `frame-${String(index).padStart(3, "0")}.png`);
  await sharp(svg).png().toFile(framePath);
}

const ffmpegPath = (await import("ffmpeg-static")).default;
if (!ffmpegPath) {
  throw new Error("ffmpeg-static did not provide a binary path");
}

await new Promise((resolve, reject) => {
  const ffmpeg = spawn(ffmpegPath, [
    "-y",
    "-framerate",
    "12",
    "-i",
    path.join(framesDir, "frame-%03d.png"),
    "-c:v",
    "libx264",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    outputPath,
  ]);

  let stderr = "";
  ffmpeg.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  ffmpeg.on("error", reject);
  ffmpeg.on("close", (code) => {
    if (code === 0) {
      resolve();
      return;
    }

    reject(new Error(`ffmpeg exited with code ${code}\n${stderr}`));
  });
});

console.log(`Wrote ${outputPath}`);
