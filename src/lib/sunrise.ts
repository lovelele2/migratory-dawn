import type { CameraCandidate, SunriseSnapshot } from "./camera-types";
import { selectFeaturedCamera } from "./camera-selection";
import { getWindySunriseSnapshot } from "./windy";

const fallbackCandidates: CameraCandidate[] = [
  {
    webcamId: 910102,
    title: "奥克兰日出山脊",
    status: "active",
    lastUpdatedOn: "2026-06-23T09:58:00Z",
    localTimeLabel: "UTC 06:13",
    location: {
      city: "奥克兰",
      country: "新西兰",
      latitude: -36.8485,
      longitude: 174.7633,
    },
    sourceType: "精选真实日出",
    mediaMode: "fallback",
    previewLabel: "演示日出影像",
    score: 96,
    sunriseDeltaMinutes: 8,
    freshnessLabel: "2 分钟前更新",
    attribution: "精选真实日出回退",
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

  const { currentCamera, queue } = selectFeaturedCamera(fallbackCandidates);

  return {
    mediaMode: currentCamera.mediaMode,
    source: {
      label: currentCamera.sourceType,
      place: formatPlace(currentCamera),
      localTime: currentCamera.localTimeLabel,
      status: "本地精选日出视频已准备好。",
      attribution: currentCamera.attribution,
    },
    birdStatus: "候鸟暂时带来了一段真实日出影像。",
    currentCamera,
    queue,
    note: "此快照在 Windy 服务端接入完成前使用真实回退视频。",
  };
}
