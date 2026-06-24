import type { CameraCandidate } from "./camera-types";

type FeaturedSelection = {
  currentCamera: CameraCandidate;
  queue: CameraCandidate[];
};

const FEATURE_ROTATION_WINDOW_MS = 5 * 60 * 1000;
const FEATURE_SHORTLIST_SIZE = 4;

function pickModeRank(camera: CameraCandidate) {
  if (camera.mediaMode === "live") {
    return 0;
  }

  if (camera.mediaMode === "day") {
    return 1;
  }

  if (camera.mediaMode === "image") {
    return 2;
  }

  return 3;
}

function withinSunriseWindow(camera: CameraCandidate) {
  return camera.sunriseDeltaMinutes >= -30 && camera.sunriseDeltaMinutes <= 60;
}

function getShortlistPool(cameras: CameraCandidate[]) {
  const windowed = cameras.filter(withinSunriseWindow);
  const ranked = windowed.length > 0 ? windowed : cameras;

  return [...ranked].sort((left, right) => {
    const scoreDelta = right.score - left.score;
    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return pickModeRank(left) - pickModeRank(right);
  });
}

export function selectFeaturedCamera(cameras: CameraCandidate[], reference = new Date()): FeaturedSelection {
  if (cameras.length === 0) {
    throw new Error("selectFeaturedCamera requires at least one camera");
  }

  const ranked = getShortlistPool(cameras);
  const shortlist = ranked.slice(0, Math.min(FEATURE_SHORTLIST_SIZE, ranked.length));
  const bucket = Math.floor(reference.getTime() / FEATURE_ROTATION_WINDOW_MS);
  const index = shortlist.length === 1 ? 0 : Math.abs(bucket) % shortlist.length;
  const currentCamera = shortlist[index];
  const queue = ranked.filter((camera) => camera.webcamId !== currentCamera.webcamId);

  return { currentCamera, queue };
}
