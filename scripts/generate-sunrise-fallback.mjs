import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const width = 1280;
const height = 720;
const frameCount = 14;
const outputPath = path.resolve("public/sunrise-fallback.webp");

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function frameSvg(frameIndex) {
  const progress = frameIndex / (frameCount - 1);
  const skyTop = "#140b08";
  const skyMid = progress < 0.5 ? "#5d3720" : "#8a5226";
  const skyBottom = progress < 0.5 ? "#f09a42" : "#ffc46a";
  const sunY = 470 - progress * 170 + Math.sin(progress * Math.PI * 2) * 8;
  const sunOpacity = 0.78 + progress * 0.18;
  const cloudShift = progress * 120;
  const glow = 0.2 + progress * 0.3;

  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skyTop}" />
        <stop offset="48%" stop-color="${skyMid}" />
        <stop offset="100%" stop-color="${skyBottom}" />
      </linearGradient>
      <radialGradient id="sunGlow" cx="50%" cy="52%" r="44%">
        <stop offset="0%" stop-color="rgba(255,244,200,0.98)" />
        <stop offset="30%" stop-color="rgba(255,208,125,0.42)" />
        <stop offset="62%" stop-color="rgba(255,173,87,0.16)" />
        <stop offset="100%" stop-color="rgba(255,173,87,0)" />
      </radialGradient>
      <filter id="soften" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" />
      </filter>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#sky)" />
    <ellipse cx="640" cy="430" rx="420" ry="210" fill="rgba(255,188,100,${0.12 + glow * 0.2})" filter="url(#soften)" />
    <ellipse cx="640" cy="${sunY}" rx="110" ry="110" fill="url(#sunGlow)" opacity="${sunOpacity}" />
    <circle cx="640" cy="${sunY}" r="56" fill="rgba(255,240,208,${sunOpacity})" />
    <path d="M0 540C140 500 260 504 360 534C448 560 560 566 640 542C734 515 842 500 960 524C1074 547 1160 547 1280 518V720H0Z" fill="rgba(17,13,12,0.96)" />
    <path d="M0 560C150 540 290 548 382 574C476 600 572 602 668 575C764 548 862 540 980 560C1086 578 1178 579 1280 552V720H0Z" fill="rgba(8,8,8,0.94)" />
    <g fill="rgba(255,255,255,0.08)">
      <rect x="${clamp(160 + cloudShift, -240, 1160)}" y="132" width="178" height="20" rx="10" />
      <rect x="${clamp(260 + cloudShift * 0.6, -200, 1180)}" y="96" width="126" height="16" rx="8" />
      <rect x="${clamp(720 + cloudShift * 0.75, -160, 1200)}" y="158" width="160" height="18" rx="9" />
    </g>
    <g fill="rgba(255,255,255,0.16)">
      <rect x="${clamp(120 + cloudShift * 0.35, -200, 1180)}" y="210" width="220" height="14" rx="7" />
      <rect x="${clamp(890 + cloudShift * 0.52, -180, 1200)}" y="238" width="180" height="14" rx="7" />
    </g>
    <g opacity="${0.3 + progress * 0.35}">
      <rect x="0" y="520" width="1280" height="4" fill="rgba(255,255,255,0.14)" />
      <rect x="0" y="588" width="1280" height="3" fill="rgba(255,255,255,0.08)" />
      <rect x="0" y="640" width="1280" height="2" fill="rgba(255,255,255,0.05)" />
    </g>
    <text x="72" y="92" fill="rgba(255,255,255,0.86)" font-size="34" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" letter-spacing="4">精选真实日出影像</text>
    <text x="72" y="130" fill="rgba(255,255,255,0.5)" font-size="20" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" letter-spacing="2">本地回退 · 自动循环</text>
  </svg>`;
}

const frames = Array.from({ length: frameCount }, (_, index) => Buffer.from(frameSvg(index)));
const delays = Array.from({ length: frameCount }, () => 120);

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await sharp(frames, { join: { animated: true } })
  .webp({ loop: 0, delay: delays, effort: 4, quality: 92 })
  .toFile(outputPath);

console.log(`Wrote ${outputPath}`);
