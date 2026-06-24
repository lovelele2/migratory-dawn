"use client";

import type { DemoStore } from "./use-demo-store";

type AdminCameraPanelProps = {
  store: DemoStore;
};

const decisionList = ["保留", "备用", "拒绝"] as const;

export function AdminCameraPanel({ store }: AdminCameraPanelProps) {
  const canEdit = Boolean(store.currentProfile?.isDemo || store.currentProfile?.isAdmin);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        这里是人工审核列表。先自动筛选，再由人保留或拒绝，避免把不适合的画面放进主页。
      </div>
      {!canEdit ? (
        <div className="rounded-3xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-50">
          当前账号还不是审核角色。请先用管理员账号登录，或者使用 demo 账号查看。
        </div>
      ) : null}

      <div className="grid gap-4">
        {store.cameraReviews.map((camera) => (
          <article key={camera.webcamId} className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
            <div className="aspect-[16/9] bg-[radial-gradient(circle_at_top,_rgba(255,170,90,0.22),_transparent_42%),linear-gradient(180deg,#2a2018_0%,#090909_100%)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={camera.title}
                src={camera.preview}
                className="h-full w-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">{camera.label}</p>
                  <h2 className="mt-2 text-lg font-semibold text-white">{camera.title}</h2>
                  <p className="mt-1 text-sm text-white/65">{camera.location}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">分数</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{camera.score}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-white/75">{camera.note}</p>
              <div className="flex flex-wrap gap-2 text-xs tracking-[0.12em] text-white/50">
                <span>{camera.freshness}</span>
                <span>·</span>
                <span>经纬度 {camera.latitude.toFixed(2)}, {camera.longitude.toFixed(2)}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {decisionList.map((decision) => (
                  <button
                    key={decision}
                    type="button"
                    onClick={() => store.updateCameraDecision(camera.webcamId, decision)}
                    disabled={!canEdit}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                      !canEdit
                        ? "cursor-not-allowed border-white/10 bg-white/5 text-white/35"
                        : camera.decision === decision
                        ? "border-white bg-white text-black"
                        : "border-white/15 bg-black/20 text-white/80"
                    }`}
                  >
                    {decision}
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
