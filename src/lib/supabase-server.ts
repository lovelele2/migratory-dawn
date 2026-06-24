import type { DemoCameraReview, DemoLetter, DemoProfile } from "./demo-state";

type SupabaseSessionUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
};

type SupabaseSession = {
  access_token: string;
  refresh_token?: string;
  user: SupabaseSessionUser;
};

export type SupabaseProfileRecord = DemoProfile;

type SupabaseConfig = {
  baseUrl: string;
  anonKey: string;
  serviceRoleKey: string;
};

function clean(value: string | undefined | null) {
  return value?.trim() || "";
}

export function getSupabaseConfig(): SupabaseConfig | null {
  const baseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const anonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) || clean(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const serviceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!baseUrl || !anonKey) {
    return null;
  }

  return { baseUrl, anonKey, serviceRoleKey };
}

function buildHeaders(config: SupabaseConfig, accessToken?: string, useServiceRole = false) {
  const headers: Record<string, string> = {
    apikey: useServiceRole && config.serviceRoleKey ? config.serviceRoleKey : config.anonKey,
    "Content-Type": "application/json",
  };

  const bearer = accessToken || (useServiceRole && config.serviceRoleKey ? config.serviceRoleKey : config.anonKey);
  if (bearer) {
    headers.Authorization = `Bearer ${bearer}`;
  }

  return headers;
}

async function readJsonResponse<T>(response: Response) {
  const text = await response.text();
  if (!text) {
    return null as T | null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null as T | null;
  }
}

export async function requestOtp(email: string) {
  const config = getSupabaseConfig();
  if (!config) {
    return { ok: false, reason: "missing_env" as const };
  }

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/auth/v1/otp`, {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify({ email, create_user: true }),
    cache: "no-store",
  });

  const data = await readJsonResponse<Record<string, unknown>>(response);
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export async function verifyOtp(email: string, token: string) {
  const config = getSupabaseConfig();
  if (!config) {
    return { ok: false, reason: "missing_env" as const };
  }

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/auth/v1/verify`, {
    method: "POST",
    headers: buildHeaders(config),
    body: JSON.stringify({ email, token, type: "email" }),
    cache: "no-store",
  });

  const data = (await readJsonResponse<SupabaseSession>(response)) ?? null;
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
}

export async function loadSupabaseUser(accessToken: string) {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    headers: buildHeaders(config, accessToken),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await readJsonResponse<SupabaseSessionUser>(response)) ?? null;
}

async function restRequest<T>(
  path: string,
  init: RequestInit = {},
  accessToken?: string,
  useServiceRole = false,
) {
  const config = getSupabaseConfig();
  if (!config) {
    return { ok: false, reason: "missing_env" as const, data: null as T | null };
  }

  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/rest/v1${path}`, {
    ...init,
    headers: {
      ...buildHeaders(config, accessToken, useServiceRole),
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  return {
    ok: response.ok,
    status: response.status,
    data: (await readJsonResponse<T>(response)) ?? null,
  };
}

export async function selectTable<T>(table: string, query: string, accessToken?: string, useServiceRole = false) {
  return restRequest<T[]>(`/${table}?${query}`, { method: "GET" }, accessToken, useServiceRole);
}

export async function insertRow<T>(table: string, body: Record<string, unknown>, accessToken?: string, useServiceRole = false) {
  return restRequest<T>(`/${table}`, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  }, accessToken, useServiceRole);
}

export async function updateRow<T>(
  table: string,
  query: string,
  body: Record<string, unknown>,
  accessToken?: string,
  useServiceRole = false,
) {
  return restRequest<T>(`/${table}?${query}`, {
    method: "PATCH",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  }, accessToken, useServiceRole);
}

export async function upsertRow<T>(
  table: string,
  body: Record<string, unknown>,
  conflictTarget: string,
  accessToken?: string,
  useServiceRole = false,
) {
  return restRequest<T>(`/${table}?on_conflict=${encodeURIComponent(conflictTarget)}`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(body),
  }, accessToken, useServiceRole);
}

export function normalizeProfile(profile: Record<string, unknown> | null | undefined): DemoProfile | null {
  if (!profile) {
    return null;
  }

  const id = typeof profile.id === "string" ? profile.id : "";
  const email = typeof profile.email === "string" ? profile.email : "";
  if (!id || !email) {
    return null;
  }

  return {
    id,
    email,
    nickname: typeof profile.nickname === "string" ? profile.nickname : email.split("@")[0] || "Bird",
    birdCode: typeof profile.bird_code === "string" ? profile.bird_code : "MD-0000",
    isDemo: Boolean(profile.is_demo),
    isAdmin: Boolean(profile.is_admin),
    homeCity: typeof profile.home_city === "string" ? profile.home_city : "东京",
    homeCountry: typeof profile.home_country === "string" ? profile.home_country : "日本",
    homeLatitude: typeof profile.home_latitude === "number" ? profile.home_latitude : 35.6762,
    homeLongitude: typeof profile.home_longitude === "number" ? profile.home_longitude : 139.6503,
    createdAt: typeof profile.created_at === "string" ? profile.created_at : new Date().toISOString(),
  };
}

export function normalizeLetter(letter: Record<string, unknown>): DemoLetter | null {
  const id = typeof letter.id === "string" ? letter.id : "";
  const senderId = typeof letter.sender_id === "string" ? letter.sender_id : "";
  if (!id || !senderId) {
    return null;
  }

  return {
    id,
    senderId,
    recipientId: typeof letter.recipient_id === "string" ? letter.recipient_id : null,
    deliveryMode: letter.delivery_mode === "random" ? "random" : "direct",
    content: typeof letter.content === "string" ? letter.content : "",
    originCity: typeof letter.origin_city === "string" ? letter.origin_city : "",
    originLatitude: typeof letter.origin_latitude === "number" ? letter.origin_latitude : 0,
    originLongitude: typeof letter.origin_longitude === "number" ? letter.origin_longitude : 0,
    destinationCity: typeof letter.destination_city === "string" ? letter.destination_city : "",
    destinationLatitude: typeof letter.destination_latitude === "number" ? letter.destination_latitude : 0,
    destinationLongitude: typeof letter.destination_longitude === "number" ? letter.destination_longitude : 0,
    pickupAt: typeof letter.pickup_at === "string" ? letter.pickup_at : new Date().toISOString(),
    deliverAt: typeof letter.deliver_at === "string" ? letter.deliver_at : new Date().toISOString(),
    readAt: typeof letter.read_at === "string" ? letter.read_at : null,
    parentLetterId: typeof letter.parent_letter_id === "string" ? letter.parent_letter_id : null,
    createdAt: typeof letter.created_at === "string" ? letter.created_at : new Date().toISOString(),
  };
}

export function normalizeCameraReview(review: Record<string, unknown>): DemoCameraReview | null {
  const webcamId = typeof review.webcam_id === "number" ? review.webcam_id : null;
  if (webcamId === null) {
    return null;
  }

  return {
    webcamId,
    title: typeof review.title === "string" ? review.title : "",
    location: typeof review.location === "string" ? review.location : "",
    label:
      review.label === "直播" || review.label === "今日延时" || review.label === "实时相机图像"
        ? review.label
        : "实时相机图像",
    score: typeof review.score === "number" ? review.score : 0,
    freshness: typeof review.freshness === "string" ? review.freshness : "",
    decision: review.decision === "保留" || review.decision === "备用" || review.decision === "拒绝" ? review.decision : "备用",
    note: typeof review.note === "string" ? review.note : "",
    preview: typeof review.preview === "string" ? review.preview : "",
    latitude: typeof review.latitude === "number" ? review.latitude : 0,
    longitude: typeof review.longitude === "number" ? review.longitude : 0,
  };
}

export type { SupabaseSession, SupabaseSessionUser };
