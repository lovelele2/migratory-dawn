import {
  defaultDemoFlags,
  nextSunriseAt,
  originCities,
  seedCameraReviews,
  seedLetters,
  seedProfiles,
  type DemoCameraReview,
  type DemoFlags,
  type DemoLetter,
  type DemoLetterDeliveryMode,
  type DemoProfile,
  type OriginCity,
} from "./demo-state";

export type DemoState = {
  profiles: DemoProfile[];
  letters: DemoLetter[];
  cameraReviews: DemoCameraReview[];
  flags: DemoFlags;
  sessionProfileId: string | null;
};

export type DemoAction =
  | { action: "hydrate" }
  | { action: "signIn"; payload: { email: string; nickname: string } }
  | { action: "signOut" }
  | { action: "updateFlags"; payload: Partial<DemoFlags> }
  | { action: "updateCameraDecision"; payload: { webcamId: number; decision: DemoCameraReview["decision"] } }
  | { action: "resetDemo" }
  | {
      action: "sendLetter";
      payload: {
        recipientBirdCode: string;
        content: string;
        deliveryMode: DemoLetterDeliveryMode;
        originCity: string;
      };
    }
  | { action: "markRead"; payload: { letterId: string } };

function createInitialState(): DemoState {
  return {
    profiles: seedProfiles,
    letters: seedLetters,
    cameraReviews: seedCameraReviews,
    flags: defaultDemoFlags,
    sessionProfileId: seedProfiles[0]?.id ?? null,
  };
}

function cloneState(state: DemoState): DemoState {
  return JSON.parse(JSON.stringify(state)) as DemoState;
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function findOrigin(cityName: string): OriginCity {
  return originCities.find((city) => city.city === cityName) ?? originCities[0];
}

let demoState: DemoState = createInitialState();

export function getDemoState() {
  return cloneState(demoState);
}

export function applyDemoAction(action: DemoAction) {
  if (action.action === "hydrate") {
    return getDemoState();
  }

  if (action.action === "resetDemo") {
    demoState = createInitialState();
    return getDemoState();
  }

  if (action.action === "signOut") {
    demoState = { ...demoState, sessionProfileId: null };
    return getDemoState();
  }

  if (action.action === "signIn") {
    const safeEmail = action.payload.email.trim().toLowerCase();
    const existing = demoState.profiles.find((profile) => profile.email.toLowerCase() === safeEmail);
    if (existing) {
      demoState = { ...demoState, sessionProfileId: existing.id };
      return getDemoState();
    }

    const defaultOrigin = originCities[0];
    const profile: DemoProfile = {
      id: makeId("profile"),
      email: safeEmail,
      nickname: action.payload.nickname.trim() || safeEmail.split("@")[0] || "Bird",
      birdCode: safeEmail === "demo@example.com" ? "MD-DEMO" : `MD-${Math.floor(1000 + Math.random() * 9000)}`,
      isDemo: safeEmail === "demo@example.com",
      homeCity: defaultOrigin.city,
      homeCountry: defaultOrigin.country,
      homeLatitude: defaultOrigin.latitude,
      homeLongitude: defaultOrigin.longitude,
      createdAt: new Date().toISOString(),
    };

    demoState = {
      ...demoState,
      profiles: [profile, ...demoState.profiles],
      sessionProfileId: profile.id,
    };
    return getDemoState();
  }

  if (action.action === "updateFlags") {
    demoState = { ...demoState, flags: { ...demoState.flags, ...action.payload } };
    return getDemoState();
  }

  if (action.action === "updateCameraDecision") {
    demoState = {
      ...demoState,
      cameraReviews: demoState.cameraReviews.map((camera) =>
        camera.webcamId === action.payload.webcamId ? { ...camera, decision: action.payload.decision } : camera,
      ),
    };
    return getDemoState();
  }

  if (action.action === "markRead") {
    const at = new Date().toISOString();
    demoState = {
      ...demoState,
      letters: demoState.letters.map((letter) =>
        letter.id === action.payload.letterId ? { ...letter, readAt: letter.readAt ?? at } : letter,
      ),
    };
    return getDemoState();
  }

  if (action.action === "sendLetter") {
    const sender = demoState.profiles.find((profile) => profile.id === demoState.sessionProfileId) ?? demoState.profiles[0];
    const origin = findOrigin(action.payload.originCity);
    const recipientPool =
      action.payload.deliveryMode === "direct"
        ? demoState.profiles.filter((profile) => profile.birdCode === action.payload.recipientBirdCode.trim())
        : demoState.profiles.filter((profile) => profile.id !== sender?.id);
    const recipient =
      recipientPool[0] ??
      demoState.profiles.find((profile) => profile.id !== sender?.id) ??
      demoState.profiles[1] ??
      demoState.profiles[0];

    const destination = recipient
      ? {
          city: recipient.homeCity,
          latitude: recipient.homeLatitude,
          longitude: recipient.homeLongitude,
        }
      : { city: "未知", latitude: origin.latitude, longitude: origin.longitude };

    const now = new Date();
    const pickupAt = demoState.flags.immediateDelivery ? now : nextSunriseAt(origin.latitude, origin.longitude, now);
    const deliverAt = demoState.flags.immediateDelivery
      ? new Date(now.getTime() + 2 * 60 * 1000)
      : nextSunriseAt(destination.latitude, destination.longitude, new Date(pickupAt.getTime() + 60 * 60 * 1000));
    const letter: DemoLetter = {
      id: makeId("letter"),
      senderId: sender?.id ?? demoState.profiles[0].id,
      recipientId: recipient?.id ?? null,
      deliveryMode: action.payload.deliveryMode,
      content: action.payload.content.trim(),
      originCity: origin.city,
      originLatitude: origin.latitude,
      originLongitude: origin.longitude,
      destinationCity: destination.city,
      destinationLatitude: destination.latitude,
      destinationLongitude: destination.longitude,
      pickupAt: pickupAt.toISOString(),
      deliverAt: deliverAt.toISOString(),
      readAt: null,
      parentLetterId: null,
      createdAt: now.toISOString(),
    };

    demoState = { ...demoState, letters: [letter, ...demoState.letters] };
    return getDemoState();
  }

  return getDemoState();
}
