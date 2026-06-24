import type { CameraCandidate, SunriseSnapshot } from "./camera-types";
import { getWindySunriseSnapshot } from "./windy";

const fallbackCandidates: CameraCandidate[] = [
  {
    webcamId: 910102,
    title: "奥克兰日出山脊",
    status: "active",
    lastUpdatedOn: "2026-06-23T09:58:00Z",
    localTimeLabel: "06:13 当地时间",
    location: {
      city: "奥克兰",
      country: "新西兰",
      latitude: -36.8485,
      longitude: 174.7633,
    },
    sourceType: "精选真实日出",
    previewLabel: "精选日出视频",
    score: 96,
    sunriseDeltaMinutes: 8,
    freshnessLabel: "2 分钟前更新",
    attribution: "精选真实日出回退",
  },
  {
    webcamId: 910103,
    title: "霍巴特港湾黎明",
    status: "active",
    lastUpdatedOn: "2026-06-23T09:55:00Z",
    localTimeLabel: "07:55 当地时间",
    location: {
      city: "霍巴特",
      country: "澳大利亚",
      latitude: -42.8821,
      longitude: 147.3272,
    },
    sourceType: "今日延时",
    previewLabel: "今日延时播放",
    score: 84,
    sunriseDeltaMinutes: 14,
    freshnessLabel: "5 分钟前更新",
    attribution: "Windy 回退选片",
    player: {
      day: "https://example.invalid/hobart/day.mp4",
    },
  },
  {
    webcamId: 910104,
    title: "基督城码头图像",
    status: "active",
    lastUpdatedOn: "2026-06-23T09:52:00Z",
    localTimeLabel: "08:52 当地时间",
    location: {
      city: "基督城",
      country: "新西兰",
      latitude: -43.5321,
      longitude: 172.6362,
    },
    sourceType: "实时相机图像",
    previewLabel: "最新相机图像",
    score: 72,
    sunriseDeltaMinutes: 21,
    freshnessLabel: "8 分钟前更新",
    attribution: "Windy 回退选片",
    images: {
      current: {
        preview: "https://example.invalid/christchurch/current.jpg",
      },
    },
  },
];

function formatPlace(candidate: CameraCandidate) {
  const city = candidate.location.city ?? "未知城市";
  const country = candidate.location.country ?? "未知国家";
  return `${country} · ${city}`;
}

export function getFallbackCandidates() {
  return fallbackCandidates;
}

export async function getCurrentSunriseSnapshot(): Promise<SunriseSnapshot> {
  const windySnapshot = await getWindySunriseSnapshot();
  if (windySnapshot) {
    return windySnapshot;
  }

  const [currentCamera, ...queue] = fallbackCandidates;

  return {
    source: {
      label: currentCamera.sourceType,
      place: formatPlace(currentCamera),
      localTime: currentCamera.localTimeLabel,
      status: "在 Windy 数据接入前使用演示回退。",
      attribution: currentCamera.attribution,
    },
    birdStatus:
      "鸟正在日出边缘盘旋，等待取件。",
    currentCamera,
    queue,
    note:
      "此快照在 Windy 服务端接入完成前使用真实回退媒体。",
  };
}
