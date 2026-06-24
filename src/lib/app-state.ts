import { nextSunriseAt, computeLetterStatus, defaultDemoFlags, type DemoCameraReview, type DemoFlags, type DemoLetter, type DemoProfile } from "./demo-state";
import { getDemoState } from "./demo-server-store";
import {
  getSupabaseConfig,
  insertRow,
  loadSupabaseUser,
  normalizeCameraReview,
  normalizeLetter,
  normalizeProfile,
  selectTable,
  updateRow,
  upsertRow,
} from "./supabase-server";

export type AppState = {
  profiles: DemoProfile[];
  letters: DemoLetter[];
  cameraReviews: DemoCameraReview[];
  flags: DemoFlags;
  sessionProfileId: string | null;
};

function fallbackState(): AppState {
  const state = getDemoState();
  return {
    profiles: state.profiles,
    letters: state.letters,
    cameraReviews: state.cameraReviews,
    flags: state.flags,
    sessionProfileId: state.sessionProfileId,
  };
}

function isSupabaseReady() {
  return Boolean(getSupabaseConfig());
}

function normalizeFlags(flags: Partial<DemoFlags> | null | undefined) {
  const fallback = defaultDemoFlags;
  return {
    forceFallback: flags?.forceFallback ?? fallback.forceFallback,
    immediateDelivery: flags?.immediateDelivery ?? fallback.immediateDelivery,
    showOnlyApproved: flags?.showOnlyApproved ?? fallback.showOnlyApproved,
  };
}

async function loadAuthenticatedState(accessToken: string): Promise<AppState | null> {
  const user = await loadSupabaseUser(accessToken);
  if (!user) {
    return null;
  }

  const profileResponse = await selectTable<Record<string, unknown>>(
    "profiles",
    `select=id,email,nickname,bird_code,home_city,home_country,home_latitude,home_longitude,is_demo,is_admin,created_at&id=eq.${user.id}&limit=1`,
    accessToken,
  );
  const profile = normalizeProfile(profileResponse.data?.[0] ?? null) ?? {
    id: user.id,
    email: user.email ?? "",
    nickname: typeof user.user_metadata?.nickname === "string" ? user.user_metadata.nickname : (user.email?.split("@")[0] ?? "Bird"),
    birdCode: `MD-${user.id.slice(0, 4).toUpperCase()}`,
    isDemo: Boolean(user.email && user.email.toLowerCase() === "demo@example.com"),
    isAdmin: Boolean(user.email && user.email.toLowerCase() === "demo@example.com"),
    homeCity: "东京",
    homeCountry: "日本",
    homeLatitude: 35.6762,
    homeLongitude: 139.6503,
    createdAt: new Date().toISOString(),
  };

  const lettersResponse = await selectTable<Record<string, unknown>>(
    "letters",
    `select=id,sender_id,recipient_id,delivery_mode,content,origin_city,origin_latitude,origin_longitude,destination_city,destination_latitude,destination_longitude,pickup_at,deliver_at,read_at,parent_letter_id,created_at&or=(sender_id.eq.${user.id},recipient_id.eq.${user.id})&order=created_at.desc`,
    accessToken,
  );
  const letters = (lettersResponse.data ?? []).map((record) => normalizeLetter(record)).filter(Boolean) as DemoLetter[];

  const currentUserIsAdmin = Boolean(profile.isAdmin || profile.isDemo);
  const cameraReviewsResponse = currentUserIsAdmin
    ? await selectTable<Record<string, unknown>>(
        "camera_reviews",
        "select=webcam_id,title,location,label,score,freshness,decision,note,preview,latitude,longitude,updated_at&order=updated_at.desc",
        accessToken,
      )
    : { data: [] as Record<string, unknown>[] };
  const cameraReviews = (cameraReviewsResponse.data ?? []).map((record) => normalizeCameraReview(record)).filter(Boolean) as DemoCameraReview[];

  return {
    profiles: [profile],
    letters,
    cameraReviews,
    flags: normalizeFlags(null),
    sessionProfileId: profile.id,
  };
}

export async function loadAppState(accessToken?: string): Promise<AppState> {
  if (!isSupabaseReady() || !accessToken) {
    return fallbackState();
  }

  const state = await loadAuthenticatedState(accessToken);
  if (state) {
    return state;
  }

  return fallbackState();
}

async function saveAuthenticatedProfile(accessToken: string, profile: DemoProfile) {
  await upsertRow<Record<string, unknown>>(
    "profiles",
    {
      id: profile.id,
      email: profile.email,
      nickname: profile.nickname,
      bird_code: profile.birdCode,
      home_city: profile.homeCity,
      home_country: profile.homeCountry,
      home_latitude: profile.homeLatitude,
      home_longitude: profile.homeLongitude,
      is_demo: Boolean(profile.isDemo),
      is_admin: Boolean(profile.isAdmin),
      created_at: profile.createdAt,
    },
    "id",
    accessToken,
  );
}

export async function verifyOrCreateProfile(accessToken: string, user: { id: string; email?: string | null }, nickname: string) {
  const profileResponse = await selectTable<Record<string, unknown>>(
    "profiles",
    `select=id,email,nickname,bird_code,home_city,home_country,home_latitude,home_longitude,is_demo,is_admin,created_at&id=eq.${user.id}&limit=1`,
    accessToken,
  );
  const existing = normalizeProfile(profileResponse.data?.[0] ?? null);
  if (existing) {
    return existing;
  }

  const email = user.email ?? "";
  const profile: DemoProfile = {
    id: user.id,
    email,
    nickname: nickname.trim() || email.split("@")[0] || "Bird",
    birdCode: email.toLowerCase() === "demo@example.com" ? "MD-DEMO" : `MD-${user.id.slice(0, 6).toUpperCase()}`,
    isDemo: email.toLowerCase() === "demo@example.com",
    isAdmin: email.toLowerCase() === "demo@example.com",
    homeCity: "东京",
    homeCountry: "日本",
    homeLatitude: 35.6762,
    homeLongitude: 139.6503,
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseReady()) {
    await saveAuthenticatedProfile(accessToken, profile);
  }

  return profile;
}

export async function handleAppAction(
  action: unknown,
  accessToken?: string,
): Promise<AppState> {
  const localState = getDemoState();
  if (!isSupabaseReady() || !accessToken) {
    return localState;
  }

  if (!action || typeof action !== "object" || !("action" in action)) {
    return loadAppState(accessToken);
  }

  const typedAction = action as
    | { action: "signOut" }
    | { action: "updateFlags"; payload: Partial<DemoFlags> }
    | { action: "updateCameraDecision"; payload: { webcamId: number; decision: DemoCameraReview["decision"] } }
    | { action: "resetDemo" }
    | {
        action: "sendLetter";
        payload: {
          recipientBirdCode: string;
          content: string;
          deliveryMode: "direct" | "random";
          originCity: string;
        };
      }
    | { action: "markRead"; payload: { letterId: string } };

  const currentState = await loadAuthenticatedState(accessToken);
  if (!currentState) {
    return localState;
  }

  const currentProfile = currentState.profiles[0];
  const now = new Date();

  if (typedAction.action === "updateFlags" || typedAction.action === "resetDemo") {
    return currentState;
  }

  if (typedAction.action === "updateCameraDecision") {
    if (!currentProfile.isAdmin && !currentProfile.isDemo) {
      return currentState;
    }

    try {
      await updateRow(
        "camera_reviews",
        `webcam_id=eq.${typedAction.payload.webcamId}`,
        {
          decision: typedAction.payload.decision,
          updated_at: now.toISOString(),
        },
        accessToken,
      );
    } catch {
      return currentState;
    }
    return loadAppState(accessToken);
  }

  if (typedAction.action === "markRead") {
    try {
      await updateRow(
        "letters",
        `id=eq.${typedAction.payload.letterId}&recipient_id=eq.${currentProfile.id}`,
        { read_at: now.toISOString() },
        accessToken,
      );
    } catch {
      return currentState;
    }
    return loadAppState(accessToken);
  }

  if (typedAction.action === "sendLetter") {
    const origin = currentProfile;
    const pickupAt = currentState.flags.immediateDelivery
      ? now
      : nextSunriseAt(origin.homeLatitude, origin.homeLongitude, now);

    let destinationProfile: DemoProfile | null = null;
    if (typedAction.payload.deliveryMode === "direct") {
      const recipientResponse = await selectTable<Record<string, unknown>>(
        "profiles",
        `select=id,email,nickname,bird_code,home_city,home_country,home_latitude,home_longitude,is_demo,is_admin,created_at&bird_code=eq.${typedAction.payload.recipientBirdCode.trim()}&limit=1`,
        accessToken,
      );
      destinationProfile = normalizeProfile(recipientResponse.data?.[0] ?? null);
    } else {
      const recipientsResponse = await selectTable<Record<string, unknown>>(
        "profiles",
        "select=id,email,nickname,bird_code,home_city,home_country,home_latitude,home_longitude,is_demo,is_admin,created_at&order=created_at.asc",
        accessToken,
      );
      const recipients = (recipientsResponse.data ?? [])
        .map((record) => normalizeProfile(record))
        .filter((profile): profile is DemoProfile => profile !== null)
        .filter((profile) => profile.id !== currentProfile.id);
      destinationProfile = recipients[0] ?? null;
    }

    if (!destinationProfile) {
      throw new Error("recipient_not_found");
    }

    const deliverAt = currentState.flags.immediateDelivery
      ? new Date(now.getTime() + 2 * 60 * 1000)
      : nextSunriseAt(destinationProfile.homeLatitude, destinationProfile.homeLongitude, new Date(pickupAt.getTime() + 60 * 60 * 1000));

    try {
      await insertRow(
        "letters",
        {
          sender_id: currentProfile.id,
          recipient_id: destinationProfile.id,
          delivery_mode: typedAction.payload.deliveryMode,
          content: typedAction.payload.content.trim(),
          origin_city: origin.homeCity,
          origin_latitude: origin.homeLatitude,
          origin_longitude: origin.homeLongitude,
          destination_city: destinationProfile.homeCity,
          destination_latitude: destinationProfile.homeLatitude,
          destination_longitude: destinationProfile.homeLongitude,
          pickup_at: pickupAt.toISOString(),
          deliver_at: deliverAt.toISOString(),
          read_at: null,
          parent_letter_id: null,
        },
        accessToken,
      );
    } catch {
      return currentState;
    }

    return loadAppState(accessToken);
  }

  return currentState;
}

export function getComputedStatus(letter: DemoLetter, now = new Date()) {
  return computeLetterStatus(letter, now);
}
