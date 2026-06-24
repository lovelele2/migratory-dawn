"use client";

import type { DemoStore } from "./use-demo-store";
import { computeLetterStatus, formatDateTime, statusLabel } from "@/lib/demo-state";

type InboxPanelProps = {
  store: DemoStore;
};

export function InboxPanel({ store }: InboxPanelProps) {
  const currentProfile = store.currentProfile ?? store.profiles[0];

  if (!currentProfile) {
    return <p className="text-white/70">还没有可显示的信件。</p>;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        当前收件人：<span className="font-semibold text-white">{currentProfile.nickname}</span> ·{" "}
        {currentProfile.birdCode}
      </div>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-[0.24em] text-white/45">收到的信</h2>
        {store.receivedLetters.map(({ letter, status }) => (
          <article key={letter.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">{statusLabel(status)}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">{letter.content.slice(0, 24) || "未命名信件"}</h3>
                <p className="mt-1 text-sm text-white/65">
                  {letter.originCity} → {letter.destinationCity}
                </p>
              </div>
              <button
                type="button"
                onClick={() => store.markRead(letter.id)}
                className="rounded-full border border-white/15 bg-black/20 px-3 py-2 text-xs font-semibold text-white/80"
              >
                标为已读
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/78">{letter.content}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs tracking-[0.14em] text-white/45">
              <span>{formatDateTime(new Date(letter.pickupAt))} 取件</span>
              <span>{formatDateTime(new Date(letter.deliverAt))} 送达</span>
              <span>状态：{statusLabel(computeLetterStatus(letter))}</span>
            </div>
          </article>
        ))}
        {store.receivedLetters.length === 0 ? <p className="text-sm text-white/60">暂时没有收到新信。</p> : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-[0.24em] text-white/45">发出的信</h2>
        {store.sentLetters.map(({ letter, status }) => (
          <article key={letter.id} className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-white/45">{statusLabel(status)}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{letter.content.slice(0, 24) || "未命名信件"}</h3>
            <p className="mt-1 text-sm text-white/65">
              {letter.originCity} → {letter.destinationCity}
            </p>
            <p className="mt-3 text-sm leading-6 text-white/78">{letter.content}</p>
          </article>
        ))}
        {store.sentLetters.length === 0 ? <p className="text-sm text-white/60">你还没有发出任何信件。</p> : null}
      </section>
    </div>
  );
}

