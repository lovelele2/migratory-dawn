export type CameraSourceType =
  | "直播"
  | "实时相机图像"
  | "今日延时"
  | "精选真实日出";

export type MediaMode = "live" | "day" | "image" | "fallback";

export type CameraLocation = {
  city?: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

export type CameraCandidate = {
  webcamId: number;
  title: string;
  status: string;
  lastUpdatedOn: string;
  localTimeLabel: string;
  location: CameraLocation;
  sourceType: CameraSourceType;
  mediaMode: MediaMode;
  previewLabel: string;
  score: number;
  sunriseDeltaMinutes: number;
  freshnessLabel: string;
  attribution: string;
  player?: {
    live?: string;
    day?: string;
    month?: string;
    year?: string;
    lifetime?: string;
  };
  images?: {
    current?: {
      preview?: string;
      thumbnail?: string;
      icon?: string;
    };
    daylight?: {
      preview?: string;
      thumbnail?: string;
      icon?: string;
    };
  };
};

export type SunriseSnapshot = {
  mediaMode: MediaMode;
  source: {
    label: CameraSourceType;
    place: string;
    localTime: string;
    status: string;
    attribution: string;
  };
  birdStatus: string;
  currentCamera: CameraCandidate;
  queue: CameraCandidate[];
  note: string;
};
