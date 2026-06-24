"use client";

import { useEffect, useMemo, useState } from "react";
import {
  computeLetterStatus,
  formatClock,
  formatDateTime,
  formatRelativeMinutes,
  type DemoCameraReview,
  type DemoFlags,
  type DemoLetter,
  type DemoLetterDeliveryMode,
  type DemoProfile,
} from "@/lib/demo-state";
import { applyDemoAction, type DemoAction, type DemoState } from "@/lib/demo-server-store";

type ComposeDraft = {
  recipientBirdCode: string;
  deliveryMode: DemoLetterDeliveryMode;
  originCity: string;
  content: string;
};

type StoredState = {
  profiles: DemoProfile[];
  letters: DemoLetter[];
  cameraReviews: DemoCameraReview[];
  flags: DemoFlags;
  sessionProfileId: string | null;
};

type DemoResponse = StoredState;

const initialState: StoredState = {
  profiles: [],
  letters: [],
  cameraReviews: [],
  flags: {
    forceFallback: false,
    immediateDelivery: false,
    showOnlyApproved: false,
  },
  sessionProfileId: null,
};

const CLIENT_STATE_KEY = "migratory-dawn.client-demo-state";

function readClientState() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CLIENT_STATE_KEY);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw) as StoredState;
  } catch {
    return null;
  }
}

function writeClientState(state: StoredState) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CLIENT_STATE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or private browsing failures.
  }
}

function toStoredState(state: DemoState): StoredState {
  return {
    profiles: state.profiles,
    letters: state.letters,
    cameraReviews: state.cameraReviews,
    flags: state.flags,
    sessionProfileId: state.sessionProfileId,
  };
}

function initialDraft(profile?: DemoProfile | null): ComposeDraft {
  return {
    recipientBirdCode: "",
    deliveryMode: "direct",
    originCity: profile?.homeCity ?? "东京",
    content: "",
  };
}

async function fetchDemoState() {
  const response = await fetch("/api/demo-state", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load demo state: ${response.status}`);
  }
  return (await response.json()) as DemoResponse;
}

async function postDemoAction(action: unknown) {
  const response = await fetch("/api/demo-state", {
    cache: "no-store",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(action),
  });

  if (!response.ok) {
    throw new Error(`Failed to update demo state: ${response.status}`);
  }

  return (await response.json()) as DemoResponse;
}

async function postAuthAction(path: "/api/auth/request-otp" | "/api/auth/verify-otp" | "/api/auth/logout", body?: unknown) {
  const response = await fetch(path, {
    cache: "no-store",
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  return {
    ok: response.ok,
    status: response.status,
    data: (await response.json().catch(() => ({}))) as Record<string, unknown>,
  };
}

export function useDemoStore() {
  const [ready, setReady] = useState(false);
  const [profiles, setProfiles] = useState<DemoProfile[]>(initialState.profiles);
  const [letters, setLetters] = useState<DemoLetter[]>(initialState.letters);
  const [cameraReviews, setCameraReviews] = useState<DemoCameraReview[]>(initialState.cameraReviews);
  const [flags, setFlags] = useState<DemoFlags>(initialState.flags);
  const [sessionProfileId, setSessionProfileId] = useState<string | null>(initialState.sessionProfileId);
  const [draft, setDraft] = useState<ComposeDraft>(initialDraft(null));

  const syncState = (state: DemoResponse) => {
    setProfiles(state.profiles);
    setLetters(state.letters);
    setCameraReviews(state.cameraReviews);
    setFlags(state.flags);
    setSessionProfileId(state.sessionProfileId);
    setDraft(initialDraft(state.profiles.find((profile) => profile.id === state.sessionProfileId) ?? null));
    setReady(true);
    writeClientState(state);
  };

  const reload = async () => {
    const state = await fetchDemoState();
    syncState(state);
    return state;
  };

  useEffect(() => {
    let active = true;

    const localState = readClientState();
    if (localState) {
      window.setTimeout(() => {
        if (active) {
          syncState(localState);
        }
      }, 0);
      return () => {
        active = false;
      };
    }

    fetchDemoState()
      .then((state) => {
        if (!active) {
          return;
        }
        syncState(state);
      })
      .catch(() => {
        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const currentProfile = useMemo(
    () => profiles.find((profile) => profile.id === sessionProfileId) ?? null,
    [profiles, sessionProfileId],
  );

  const lettersWithStatus = useMemo(
    () =>
      letters
        .map((letter) => ({
          letter,
          status: computeLetterStatus(letter),
        }))
        .sort((left, right) => new Date(right.letter.createdAt).getTime() - new Date(left.letter.createdAt).getTime()),
    [letters],
  );

  const receivedLetters = useMemo(
    () =>
      lettersWithStatus.filter(
        ({ letter }) => letter.recipientId && letter.recipientId === currentProfile?.id,
      ),
    [currentProfile?.id, lettersWithStatus],
  );

  const sentLetters = useMemo(
    () => lettersWithStatus.filter(({ letter }) => letter.senderId === currentProfile?.id),
    [currentProfile?.id, lettersWithStatus],
  );

  const approvedCameraReviews = useMemo(
    () => cameraReviews.filter((camera) => camera.decision !== "拒绝"),
    [cameraReviews],
  );

  const patchState = async (action: DemoAction) => {
    const nextState = toStoredState(applyDemoAction(action));
    syncState(nextState);
    void postDemoAction(action).catch(() => {});
    return nextState;
  };

  return {
    ready,
    currentProfile,
    profiles,
    letters,
    lettersWithStatus,
    receivedLetters,
    sentLetters,
    cameraReviews,
    approvedCameraReviews,
    flags,
    draft,
    setDraft,
    signIn(email: string, nickname: string) {
      return patchState({ action: "signIn", payload: { email, nickname } }).then((next) => {
        const profile = next.profiles.find((item) => item.id === next.sessionProfileId) ?? null;
        setDraft(initialDraft(profile));
        return profile;
      });
    },
    requestOtp(email: string) {
      return postAuthAction("/api/auth/request-otp", { email });
    },
    verifyOtp(email: string, token: string, nickname: string) {
      return postAuthAction("/api/auth/verify-otp", { email, token, nickname }).then(async (result) => {
        if (!result.ok) {
          return result;
        }
        await reload();
        return result;
      });
    },
    logout() {
      return postAuthAction("/api/auth/logout").then(async () => {
        await reload();
      });
    },
    reload,
    signOut() {
      return postAuthAction("/api/auth/logout")
        .then(() => patchState({ action: "signOut" }))
        .then(() => {
          setDraft(initialDraft(null));
        });
    },
    updateFlags(patch: Partial<DemoFlags>) {
      return patchState({ action: "updateFlags", payload: patch });
    },
    updateCameraDecision(webcamId: number, decision: DemoCameraReview["decision"]) {
      return patchState({ action: "updateCameraDecision", payload: { webcamId, decision } });
    },
    resetDemo() {
      return patchState({ action: "resetDemo" }).then((next) => {
        const profile = next.profiles.find((item) => item.id === next.sessionProfileId) ?? null;
        setDraft(initialDraft(profile));
      });
    },
    sendLetter(payload: {
      recipientBirdCode: string;
      content: string;
      deliveryMode: DemoLetterDeliveryMode;
      originCity: string;
    }) {
      const beforeFirstLetterId = letters[0]?.id ?? null;
      const beforeLength = letters.length;
      return patchState({ action: "sendLetter", payload }).then((next) => {
        const afterFirstLetter = next.letters[0] ?? null;
        const changed = next.letters.length !== beforeLength || afterFirstLetter?.id !== beforeFirstLetterId;
        if (!changed || !afterFirstLetter) {
          throw new Error("letter_not_sent");
        }
        return afterFirstLetter;
      });
    },
    markRead(letterId: string) {
      return patchState({ action: "markRead", payload: { letterId } });
    },
    formatClock,
    formatDateTime,
    formatRelativeMinutes,
  };
}

export type DemoStore = ReturnType<typeof useDemoStore>;
