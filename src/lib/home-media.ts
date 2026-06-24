import type { CameraCandidate, MediaMode } from "./camera-types";

export type HomeMediaSource = {
  mode: MediaMode;
  kind: "iframe" | "video";
  url: string;
  label: string;
  status: string;
  helper: string;
  secondaryUrl?: string;
};

export function getMediaModeLabel(mode: MediaMode) {
  if (mode === "live") {
    return "LIVE";
  }

  if (mode === "day") {
    return "今日延时影像";
  }

  if (mode === "image") {
    return "最新图片";
  }

  return "演示日出影像";
}

export function getMediaTone(mode: MediaMode) {
  if (mode === "live") {
    return "live";
  }

  if (mode === "day") {
    return "time-lapse";
  }

  if (mode === "image") {
    return "still";
  }

  return "curated";
}

export function getSunriseDeltaLabel(deltaMinutes: number) {
  if (!Number.isFinite(deltaMinutes)) {
    return "日出时间未知";
  }

  const absoluteMinutes = Math.abs(deltaMinutes);
  if (deltaMinutes < 0) {
    return `距离日出还有 ${absoluteMinutes} 分钟`;
  }

  return `日出后 ${absoluteMinutes} 分钟`;
}

export function getMediaFreshnessLabel(mode: MediaMode, freshnessLabel: string) {
  if (mode === "fallback") {
    return "本地精选影像";
  }

  return freshnessLabel;
}

export function getMediaStatus(mode: MediaMode) {
  if (mode === "live") {
    return "候鸟抵达了正在升起的太阳。";
  }

  if (mode === "fallback") {
    return "候鸟暂时带来了一段真实日出影像。";
  }

  return "候鸟带来了这里最新的晨光。";
}

export function getSourceStatus(mode: MediaMode) {
  if (mode === "live") {
    return "正在嵌入 Windy 直播。";
  }

  if (mode === "day") {
    return "正在嵌入 Windy 今日延时。";
  }

  if (mode === "image") {
    return "正在显示最新图片。";
  }

  return "正在播放本地精选日出影像。";
}

export function getMediaSources(camera: CameraCandidate): HomeMediaSource[] {
  const sources: HomeMediaSource[] = [];

  if (camera.player?.live?.trim()) {
    sources.push({
      mode: "live",
      kind: "iframe",
      url: camera.player.live,
      label: "LIVE",
      status: getSourceStatus("live"),
      helper: getMediaModeLabel("live"),
      secondaryUrl: camera.player.live,
    });
  }

  sources.push({
    mode: "fallback",
    kind: "video",
    url: "/sunrise-fallback.mp4",
    label: "演示日出影像",
    status: getSourceStatus("fallback"),
    helper: getMediaModeLabel("fallback"),
  });

  return sources;
}
