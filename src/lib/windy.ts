import * as SunCalc from "suncalc";
import type { CameraCandidate, CameraLocation, CameraSourceType, MediaMode, SunriseSnapshot } from "./camera-types";

const WINDY_ENDPOINT = "https://api.windy.com/webcams/api/v3/webcams";
const REQUEST_TIMEOUT_MS = 8000;
const MAX_RESULTS = 6;
const CURATED_WINDY_WHITELIST = new Set<number>([1227972392]);

type RawCamera = Record<string, unknown> & {
  webcamId?: number;
  title?: string;
  status?: string;
  lastUpdatedOn?: string;
  viewCount?: number;
  location?: Record<string, unknown>;
  images?: Record<string, unknown>;
  player?: Record<string, unknown>;
};

type ParsedResponse = {
  cameras: RawCamera[];
  raw: unknown;
};

function getApiKey() {
  return process.env.WINDY_API_KEY?.trim() || "";
}

function createTimeoutSignal() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  return { controller, timeout };
}

function getArrayCandidate(value: unknown): RawCamera[] {
  if (Array.isArray(value)) {
    return value as RawCamera[];
  }

  if (!value || typeof value !== "object") {
    return [];
  }

  const objectValue = value as Record<string, unknown>;
  const paths = [
    objectValue.webcams,
    objectValue.result,
    objectValue.items,
    objectValue.results,
    objectValue.data && typeof objectValue.data === "object"
      ? (objectValue.data as Record<string, unknown>).result
      : undefined,
    objectValue.data && typeof objectValue.data === "object"
      ? (objectValue.data as Record<string, unknown>).webcams
      : undefined,
  ];

  for (const candidate of paths) {
    if (Array.isArray(candidate)) {
      return candidate as RawCamera[];
    }
    if (candidate && typeof candidate === "object") {
      const nested = getArrayCandidate(candidate);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
}

async function fetchWindyPayload(params: Record<string, string | number | undefined>) {
  const apiKey = getApiKey();
  if (!apiKey) {
    return null;
  }

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const url = `${WINDY_ENDPOINT}?${searchParams.toString()}`;
  const { controller, timeout } = createTimeoutSignal();

  try {
    const response = await fetch(url, {
      headers: {
        "x-windy-api-key": apiKey,
      },
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const raw = (await response.json()) as unknown;
    return {
      cameras: getArrayCandidate(raw),
      raw,
    } satisfies ParsedResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function mergeCameraRecord(target: RawCamera, source: RawCamera) {
  const merged: RawCamera = { ...target, ...source };
  const targetLocation = target.location && typeof target.location === "object" ? target.location : {};
  const sourceLocation = source.location && typeof source.location === "object" ? source.location : {};
  merged.location = { ...targetLocation, ...sourceLocation };

  const targetImages = target.images && typeof target.images === "object" ? target.images : {};
  const sourceImages = source.images && typeof source.images === "object" ? source.images : {};
  merged.images = {
    ...targetImages,
    ...sourceImages,
    current: {
      ...(targetImages.current && typeof targetImages.current === "object" ? targetImages.current : {}),
      ...(sourceImages.current && typeof sourceImages.current === "object" ? sourceImages.current : {}),
    },
    daylight: {
      ...(targetImages.daylight && typeof targetImages.daylight === "object" ? targetImages.daylight : {}),
      ...(sourceImages.daylight && typeof sourceImages.daylight === "object" ? sourceImages.daylight : {}),
    },
  };

  const targetPlayer = target.player && typeof target.player === "object" ? target.player : {};
  const sourcePlayer = source.player && typeof source.player === "object" ? source.player : {};
  merged.player = { ...targetPlayer, ...sourcePlayer };
  return merged;
}

function mergeByWebcamId(cameras: RawCamera[][]) {
  const merged = new Map<number, RawCamera>();

  for (const batch of cameras) {
    for (const camera of batch) {
      if (typeof camera.webcamId !== "number") {
        continue;
      }

      const existing = merged.get(camera.webcamId);
      merged.set(camera.webcamId, existing ? mergeCameraRecord(existing, camera) : { ...camera });
    }
  }

  return [...merged.values()];
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function getLocation(raw: RawCamera): CameraLocation | null {
  const location = raw.location && typeof raw.location === "object" ? raw.location : null;
  if (!location) {
    return null;
  }

  const latitude = toNumber(location.latitude);
  const longitude = toNumber(location.longitude);
  if (latitude === undefined || longitude === undefined) {
    return null;
  }

  return {
    city: typeof location.city === "string" ? location.city : undefined,
    region: typeof location.region === "string" ? location.region : undefined,
    country: typeof location.country === "string" ? location.country : undefined,
    latitude,
    longitude,
  };
}

function getSourceType(raw: RawCamera): CameraSourceType | null {
  const player = raw.player && typeof raw.player === "object" ? raw.player : null;
  const images = raw.images && typeof raw.images === "object" ? raw.images : null;

  if (player && typeof player.live === "string" && player.live.trim()) {
    return "直播";
  }

  if (player && typeof player.day === "string" && player.day.trim()) {
    return "今日延时";
  }

  const hasImage =
    Boolean(images?.current && typeof images.current === "object") ||
    Boolean(images?.daylight && typeof images.daylight === "object");

  if (hasImage) {
    return "实时相机图像";
  }

  return null;
}

function getMediaMode(raw: RawCamera): MediaMode | null {
  const player = raw.player && typeof raw.player === "object" ? raw.player : null;
  const images = raw.images && typeof raw.images === "object" ? raw.images : null;

  if (player && typeof player.live === "string" && player.live.trim()) {
    return "live";
  }

  if (player && typeof player.day === "string" && player.day.trim()) {
    return "day";
  }

  const hasImage =
    Boolean(images?.current && typeof images.current === "object") ||
    Boolean(images?.daylight && typeof images.daylight === "object");

  if (hasImage) {
    return "image";
  }

  return null;
}

function isDirectionHint(title: string) {
  const lower = title.toLowerCase();
  return lower.includes("east") || lower.includes("southeast") || lower.includes("south east");
}

function normalizeLongitude(longitude: number) {
  const normalized = ((longitude + 180) % 360 + 360) % 360 - 180;
  return normalized;
}

function getEstimatedMorningLongitude(reference = new Date()) {
  const utcHours = reference.getUTCHours() + reference.getUTCMinutes() / 60 + reference.getUTCSeconds() / 3600;
  return normalizeLongitude((6 - utcHours) * 15);
}

function getLongitudeDistance(left: number, right: number) {
  const delta = Math.abs(normalizeLongitude(left - right));
  return Math.min(delta, 360 - delta);
}

function getFreshnessMinutes(lastUpdatedOn: string | undefined) {
  if (!lastUpdatedOn) {
    return Number.POSITIVE_INFINITY;
  }

  const date = new Date(lastUpdatedOn);
  if (Number.isNaN(date.getTime())) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
}

function formatMediaFreshness(mediaMode: MediaMode, minutes: number) {
  if (!Number.isFinite(minutes)) {
    return "更新时间未知";
  }

  if (mediaMode === "live") {
    if (minutes <= 0) {
      return "直播源刚刷新";
    }

    return `直播源 ${minutes} 分钟前刷新`;
  }

  if (mediaMode === "day") {
    if (minutes <= 0) {
      return "今日延时刚刷新";
    }

    return `今日延时 ${minutes} 分钟前刷新`;
  }

  if (mediaMode === "image") {
    if (minutes <= 0) {
      return "图片刚更新";
    }

    return `图片更新时间 ${minutes} 分钟前`;
  }

  return "演示影像可用";
}

function getPreviewLabel(mediaMode: MediaMode) {
  if (mediaMode === "live") {
    return "LIVE";
  }

  if (mediaMode === "day") {
    return "今日延时影像";
  }

  if (mediaMode === "image") {
    return "最新图片";
  }

  return "演示日出影像";
}

function scoreCamera(raw: RawCamera, location: CameraLocation) {
  const now = new Date();
  const title = typeof raw.title === "string" ? raw.title : "";
  const sourceType = getSourceType(raw);
  const mediaMode = getMediaMode(raw);
  if (!sourceType || !mediaMode) {
    return null;
  }

  const times = SunCalc.getTimes(now, location.latitude, location.longitude);
  const sunrise = times.sunrise;
  const sunriseDeltaMinutes =
    !sunrise || Number.isNaN(sunrise.getTime())
      ? Number.POSITIVE_INFINITY
      : Math.round((now.getTime() - sunrise.getTime()) / 60000);
  const currentPosition = SunCalc.getPosition(now, location.latitude, location.longitude);
  const tenMinutesLater = new Date(now.getTime() + 10 * 60000);
  const laterPosition = SunCalc.getPosition(tenMinutesLater, location.latitude, location.longitude);
  const rising = laterPosition.altitude > currentPosition.altitude;
  const terminatorLongitude = getEstimatedMorningLongitude(now);
  const zoneDistance = getLongitudeDistance(location.longitude, terminatorLongitude);

  const freshnessMinutes = getFreshnessMinutes(typeof raw.lastUpdatedOn === "string" ? raw.lastUpdatedOn : undefined);
  const withinSunriseWindow = sunriseDeltaMinutes >= -30 && sunriseDeltaMinutes <= 60;
  let score = 0;

  if (zoneDistance <= 30) {
    score += 20;
  } else if (zoneDistance <= 60) {
    score += 12;
  } else if (zoneDistance <= 90) {
    score += 6;
  } else if (zoneDistance > 120 && !CURATED_WINDY_WHITELIST.has(raw.webcamId ?? -1)) {
    return null;
  }

  if (CURATED_WINDY_WHITELIST.has(raw.webcamId ?? -1)) {
    score += 30;
  }

  if (Math.abs(sunriseDeltaMinutes) <= 30) {
    score += 40;
  }

  if (rising) {
    score += 20;
  }

  if (mediaMode === "live") {
    score += 25;
  } else if (mediaMode === "day") {
    score += 10;
  } else if (mediaMode === "image") {
    score += 5;
  }

  if (freshnessMinutes <= 5) {
    score += 10;
  } else if (freshnessMinutes <= 30) {
    score += 5;
  }

  if (isDirectionHint(title)) {
    score += 5;
  }

  return {
    sourceType,
    mediaMode,
    sunriseDeltaMinutes,
    freshnessMinutes,
    withinSunriseWindow,
    score,
  };
}

function formatDisplayTime(lastUpdatedOn: string | undefined) {
  if (!lastUpdatedOn) {
    return "更新时间未知";
  }

  const date = new Date(lastUpdatedOn);
  if (Number.isNaN(date.getTime())) {
    return "更新时间未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  }).format(date);
}

function normalizeCamera(raw: RawCamera): CameraCandidate | null {
  if (typeof raw.webcamId !== "number" || !raw.title || !raw.status || !raw.lastUpdatedOn) {
    return null;
  }

  const location = getLocation(raw);
  if (!location) {
    return null;
  }

  const scored = scoreCamera(raw, location);
  if (!scored) {
    return null;
  }

  return {
    webcamId: raw.webcamId,
    title: raw.title,
    status: raw.status,
    lastUpdatedOn: raw.lastUpdatedOn,
    localTimeLabel: `UTC ${formatDisplayTime(raw.lastUpdatedOn)}`,
    location,
    sourceType: scored.sourceType,
    mediaMode: scored.mediaMode,
    previewLabel: getPreviewLabel(scored.mediaMode),
    score: scored.score,
    sunriseDeltaMinutes: scored.sunriseDeltaMinutes,
    freshnessLabel: formatMediaFreshness(scored.mediaMode, scored.freshnessMinutes),
    attribution: "Windy Webcams",
    player: raw.player as CameraCandidate["player"],
    images: raw.images as CameraCandidate["images"],
  };
}

async function fetchWindyCandidates() {
  const [base, location, images, player] = await Promise.all([
    fetchWindyPayload({ limit: MAX_RESULTS }),
    fetchWindyPayload({ limit: MAX_RESULTS, include: "location" }),
    fetchWindyPayload({ limit: MAX_RESULTS, include: "images" }),
    fetchWindyPayload({ limit: MAX_RESULTS, include: "player" }),
  ]);

  const batches = [base, location, images, player]
    .filter((batch): batch is ParsedResponse => Boolean(batch))
    .map((batch) => batch.cameras);

  if (batches.length === 0) {
    console.warn("[windy] no batches returned from API");
    return [];
  }

  const merged = mergeByWebcamId(batches);
  const normalized = merged
    .map((raw) => normalizeCamera(raw))
    .filter((camera): camera is CameraCandidate => Boolean(camera))
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_RESULTS);

  const sunriseWindowCandidates = normalized.filter((camera) => camera.sunriseDeltaMinutes >= -30 && camera.sunriseDeltaMinutes <= 60);
  const finalCandidates = sunriseWindowCandidates.length > 0 ? sunriseWindowCandidates : normalized;

  console.log(
    "[windy] batches",
    batches.map((batch) => batch.length).join(","),
    "merged",
    merged.length,
    "normalized",
    normalized.length,
    "window",
    sunriseWindowCandidates.length,
  );

  return finalCandidates;
}

function buildSnapshotFromCamera(camera: CameraCandidate, queue: CameraCandidate[]): SunriseSnapshot {
  const city = camera.location.city ?? "未知城市";
  const country = camera.location.country ?? "未知国家";
  const sourceStatus =
    camera.mediaMode === "live"
      ? "Windy 直播已接入。"
      : camera.mediaMode === "day"
        ? "Windy 今日延时已接入。"
        : camera.mediaMode === "image"
          ? "Windy 最新图片已接入。"
          : "本地精选日出影像已接入。";

  const birdStatus =
    camera.mediaMode === "live"
      ? "候鸟抵达了正在升起的太阳。"
      : camera.mediaMode === "fallback"
        ? "候鸟暂时带来了一段真实日出影像。"
        : "候鸟带来了这里最新的晨光。";

  return {
    mediaMode: camera.mediaMode,
    source: {
      label: camera.sourceType,
      place: `${country} · ${city}`,
      localTime: camera.localTimeLabel,
      status: sourceStatus,
      attribution: camera.attribution,
    },
    birdStatus,
    currentCamera: camera,
    queue,
    note: "该快照来自 Windy Webcams 的服务端请求。",
  };
}

export async function getWindySunriseSnapshot(): Promise<SunriseSnapshot | null> {
  const cameras = await fetchWindyCandidates();
  if (cameras.length === 0) {
    console.warn("[windy] no usable sunrise cameras after normalization");
    return null;
  }

  const [currentCamera, ...queue] = cameras;
  return buildSnapshotFromCamera(currentCamera, queue);
}
