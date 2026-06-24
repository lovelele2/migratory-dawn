import * as SunCalc from "suncalc";

export type DemoProfile = {
  id: string;
  email: string;
  nickname: string;
  birdCode: string;
  isDemo?: boolean;
  isAdmin?: boolean;
  homeCity: string;
  homeCountry: string;
  homeLatitude: number;
  homeLongitude: number;
  createdAt: string;
};

export type DemoLetterDeliveryMode = "direct" | "random";
export type DemoLetterStatus = "waiting_for_sunrise" | "in_flight" | "arrived" | "read";

export type DemoLetter = {
  id: string;
  senderId: string;
  recipientId: string | null;
  deliveryMode: DemoLetterDeliveryMode;
  content: string;
  originCity: string;
  originLatitude: number;
  originLongitude: number;
  destinationCity: string;
  destinationLatitude: number;
  destinationLongitude: number;
  pickupAt: string;
  deliverAt: string;
  readAt: string | null;
  parentLetterId: string | null;
  createdAt: string;
};

export type DemoCameraReview = {
  webcamId: number;
  title: string;
  location: string;
  label: "直播" | "今日延时" | "实时相机图像";
  score: number;
  freshness: string;
  decision: "保留" | "备用" | "拒绝";
  note: string;
  preview: string;
  latitude: number;
  longitude: number;
};

export type DemoFlags = {
  forceFallback: boolean;
  immediateDelivery: boolean;
  showOnlyApproved: boolean;
};

export type OriginCity = {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
};

export const originCities: OriginCity[] = [
  { city: "东京", country: "日本", latitude: 35.6762, longitude: 139.6503 },
  { city: "奥克兰", country: "新西兰", latitude: -36.8485, longitude: 174.7633 },
  { city: "首尔", country: "韩国", latitude: 37.5665, longitude: 126.978 },
  { city: "开普敦", country: "南非", latitude: -33.9249, longitude: 18.4241 },
  { city: "里斯本", country: "葡萄牙", latitude: 38.7223, longitude: -9.1393 },
];

export const seedProfiles: DemoProfile[] = [
  {
    id: "profile-1",
    email: "mika@example.com",
    nickname: "Mika",
    birdCode: "MD-4281",
    homeCity: "东京",
    homeCountry: "日本",
    homeLatitude: 35.6762,
    homeLongitude: 139.6503,
    createdAt: "2026-06-23T00:00:00Z",
  },
  {
    id: "profile-2",
    email: "sora@example.com",
    nickname: "Sora",
    birdCode: "MD-3184",
    homeCity: "奥克兰",
    homeCountry: "新西兰",
    homeLatitude: -36.8485,
    homeLongitude: 174.7633,
    createdAt: "2026-06-23T00:05:00Z",
  },
  {
    id: "profile-3",
    email: "lena@example.com",
    nickname: "Lena",
    birdCode: "MD-7740",
    homeCity: "里斯本",
    homeCountry: "葡萄牙",
    homeLatitude: 38.7223,
    homeLongitude: -9.1393,
    createdAt: "2026-06-23T00:10:00Z",
  },
  {
    id: "profile-demo",
    email: "demo@example.com",
    nickname: "Demo",
    birdCode: "MD-DEMO",
    isDemo: true,
    isAdmin: true,
    homeCity: "里斯本",
    homeCountry: "葡萄牙",
    homeLatitude: 38.7223,
    homeLongitude: -9.1393,
    createdAt: "2026-06-23T00:12:00Z",
  },
];

export const seedLetters: DemoLetter[] = [
  {
    id: "letter-1",
    senderId: "profile-1",
    recipientId: "profile-2",
    deliveryMode: "direct",
    content: "晨光到了海面，我们也该出发了。",
    originCity: "东京",
    originLatitude: 35.6762,
    originLongitude: 139.6503,
    destinationCity: "奥克兰",
    destinationLatitude: -36.8485,
    destinationLongitude: 174.7633,
    pickupAt: "2026-06-23T21:30:00Z",
    deliverAt: "2026-06-24T01:10:00Z",
    readAt: null,
    parentLetterId: null,
    createdAt: "2026-06-23T12:00:00Z",
  },
  {
    id: "letter-2",
    senderId: "profile-2",
    recipientId: "profile-1",
    deliveryMode: "random",
    content: "如果今天的天光安静，请替我把这句问候带过去。",
    originCity: "奥克兰",
    originLatitude: -36.8485,
    originLongitude: 174.7633,
    destinationCity: "东京",
    destinationLatitude: 35.6762,
    destinationLongitude: 139.6503,
    pickupAt: "2026-06-23T19:30:00Z",
    deliverAt: "2026-06-23T23:20:00Z",
    readAt: "2026-06-23T23:40:00Z",
    parentLetterId: null,
    createdAt: "2026-06-23T10:05:00Z",
  },
];

export const seedCameraReviews: DemoCameraReview[] = [
  {
    webcamId: 910201,
    title: "霍巴特港湾黎明",
    location: "澳大利亚 · 霍巴特",
    label: "直播",
    score: 91,
    freshness: "2 分钟前",
    decision: "保留",
    note: "直播播放器可用，晨线清晰。",
    preview: "https://example.invalid/hobart.jpg",
    latitude: -42.8821,
    longitude: 147.3272,
  },
  {
    webcamId: 910202,
    title: "基督城码头日出",
    location: "新西兰 · 基督城",
    label: "今日延时",
    score: 77,
    freshness: "6 分钟前",
    decision: "备用",
    note: "播放稳定，适合直播失败时回退。",
    preview: "https://example.invalid/christchurch.jpg",
    latitude: -43.5321,
    longitude: 172.6362,
  },
  {
    webcamId: 910203,
    title: "瓦尔帕莱索海岸图像",
    location: "智利 · 瓦尔帕莱索",
    label: "实时相机图像",
    score: 63,
    freshness: "11 分钟前",
    decision: "拒绝",
    note: "曝光偏软，作为主页主图不够稳。",
    preview: "https://example.invalid/valparaiso.jpg",
    latitude: -33.0472,
    longitude: -71.6127,
  },
];

export const defaultDemoFlags: DemoFlags = {
  forceFallback: false,
  immediateDelivery: false,
  showOnlyApproved: false,
};

export const demoStorageKeys = {
  profiles: "migratory-dawn.profiles",
  letters: "migratory-dawn.letters",
  cameraReviews: "migratory-dawn.camera-reviews",
  flags: "migratory-dawn.flags",
  session: "migratory-dawn.session",
} as const;

export function nextSunriseAt(latitude: number, longitude: number, reference = new Date()): Date {
  const sunriseToday = SunCalc.getTimes(reference, latitude, longitude).sunrise;
  if (sunriseToday && sunriseToday.getTime() > reference.getTime()) {
    return sunriseToday;
  }

  const tomorrow = new Date(reference.getTime() + 24 * 60 * 60 * 1000);
  return SunCalc.getTimes(tomorrow, latitude, longitude).sunrise ?? new Date(tomorrow.getTime() + 6 * 60 * 60 * 1000);
}

export function formatClock(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function computeLetterStatus(letter: DemoLetter, now = new Date()) {
  if (letter.readAt) {
    return "read" as const;
  }

  const pickupAt = new Date(letter.pickupAt);
  const deliverAt = new Date(letter.deliverAt);
  if (now < pickupAt) {
    return "waiting_for_sunrise" as const;
  }

  if (now < deliverAt) {
    return "in_flight" as const;
  }

  return "arrived" as const;
}

export function statusLabel(status: DemoLetterStatus) {
  const labels: Record<DemoLetterStatus, string> = {
    waiting_for_sunrise: "等待日出取件",
    in_flight: "飞行中",
    arrived: "已送达",
    read: "已读",
  };

  return labels[status];
}

export function formatRelativeMinutes(from: Date, to: Date) {
  const diff = Math.round((to.getTime() - from.getTime()) / 60000);
  if (diff <= 0) {
    return "刚刚";
  }

  return `${diff} 分钟后`;
}
