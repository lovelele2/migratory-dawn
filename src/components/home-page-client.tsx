"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { SourceBadge } from "./source-badge";
import type { SunriseSnapshot } from "@/lib/camera-types";
import { getMediaFreshnessLabel, getMediaModeLabel, getMediaSources, getMediaStatus, getMediaTone, getSunriseDeltaLabel } from "@/lib/home-media";

type HomePageClientProps = {
  initialSnapshot: SunriseSnapshot;
};

function getCameraPlayerUrl(snapshot: SunriseSnapshot) {
  return snapshot.currentCamera.player?.live ?? snapshot.currentCamera.player?.day ?? null;
}

export function HomePageClient({ initialSnapshot }: HomePageClientProps) {
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    const loadSnapshot = async () => {
      try {
        const response = await fetch("/api/current-sunrise", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`snapshot_${response.status}`);
        }
        const data = (await response.json()) as SunriseSnapshot;
        if (active) {
          setSnapshot(data);
        }
      } catch {
        if (active) {
          setSnapshot(initialSnapshot);
        }
      }
    };

    loadSnapshot();
    const timer = window.setInterval(loadSnapshot, 5 * 60 * 1000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [initialSnapshot]);

  const mediaSources = useMemo(() => getMediaSources(snapshot.currentCamera), [snapshot.currentCamera]);
  const activeSource = mediaSources[Math.min(activeSourceIndex, mediaSources.length - 1)] ?? mediaSources[mediaSources.length - 1];
  const activeSourceMode = activeSource?.mode ?? null;
  const activeSourceUrl = activeSource?.url ?? "";

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setActiveSourceIndex(0);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [snapshot.currentCamera.webcamId, snapshot.currentCamera.mediaMode]);

  useEffect(() => {
    if (!activeSourceMode || !activeSourceUrl) {
      return;
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setActiveSourceIndex((current) => Math.min(current + 1, mediaSources.length - 1));
    }, 8000);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [activeSourceMode, activeSourceUrl, mediaSources.length]);

  const mediaLabel = activeSource ? getMediaModeLabel(activeSource.mode) : getMediaModeLabel(snapshot.currentCamera.mediaMode);
  const mediaTone = activeSource ? getMediaTone(activeSource.mode) : getMediaTone(snapshot.currentCamera.mediaMode);
  const mediaStatus = activeSource ? activeSource.status : getMediaStatus(snapshot.currentCamera.mediaMode);
  const mediaFreshness = activeSource ? getMediaFreshnessLabel(activeSource.mode, snapshot.currentCamera.freshnessLabel) : snapshot.currentCamera.freshnessLabel;
  const sunriseDeltaLabel = getSunriseDeltaLabel(snapshot.currentCamera.sunriseDeltaMinutes);
  const windysideLink = activeSource?.secondaryUrl ?? getCameraPlayerUrl(snapshot);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,170,90,0.2),_transparent_25%),linear-gradient(180deg,_#131313_0%,_#060606_100%)] text-white">
      <section className="relative min-h-screen overflow-hidden pb-24">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.52))]" />
        <div className="absolute inset-x-0 top-0 h-[58vh] bg-[radial-gradient(circle_at_50%_22%,rgba(255,178,92,0.5),rgba(255,178,92,0.06)_28%,transparent_60%)] opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_82%,rgba(255,255,255,0.08),transparent_28%)]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-8">
          <header className="flex items-start justify-between gap-4 text-xs uppercase tracking-[0.26em] text-white/60">
            <div>
              <p>候鸟逐日 / Migratory Dawn</p>
              <p className="mt-1 text-[0.64rem] tracking-[0.2em] text-white/40">安静的地球日出窗口</p>
            </div>
            <p className="text-right">{mediaStatus}</p>
          </header>

          <div className="mt-auto grid gap-8 pb-10 pt-24 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <SourceBadge label={mediaLabel} tone={mediaTone} />
                <span className="text-sm text-white/65">{mediaStatus}</span>
              </div>
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-[0.28em] text-white/55">{snapshot.source.place}</p>
                <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                  鸟停在黎明边缘等待出发。
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-white/72 sm:text-xl">
                  这是一个真实的日出窗口，带有安静的回退路径，所以主页不会变成空白页。
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-white/72">
                <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2">{snapshot.source.localTime}</div>
                <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2">{sunriseDeltaLabel}</div>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-white/10 bg-black/35 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-black/60">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-xs uppercase tracking-[0.24em] text-white/55">
                  <span>{mediaLabel}</span>
                  <span>{mediaFreshness}</span>
                </div>
                <div className="relative min-h-[200px] aspect-video overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,180,80,0.32),_transparent_48%),linear-gradient(180deg,#2a2018_0%,#0b0b0b_100%)]">
                  {activeSource?.kind === "iframe" ? (
                    <iframe
                      key={activeSource.url}
                      className="absolute inset-0 h-full w-full min-h-[200px] min-w-[110px] object-cover"
                      src={activeSource.url}
                      title={`${snapshot.currentCamera.title} · ${activeSource.label}`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      referrerPolicy="no-referrer"
                      onLoad={() => {
                        if (timeoutRef.current) {
                          window.clearTimeout(timeoutRef.current);
                          timeoutRef.current = null;
                        }
                      }}
                      onError={() => {
                        setActiveSourceIndex((current) => Math.min(current + 1, mediaSources.length - 1));
                      }}
                    />
                  ) : activeSource ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={activeSource.url}
                      alt={`${snapshot.currentCamera.title} · ${activeSource.label}`}
                      className="absolute inset-0 h-full w-full min-h-[200px] min-w-[110px] object-cover"
                      src={activeSource.url}
                      referrerPolicy="no-referrer"
                      loading="eager"
                      onLoad={() => {
                        if (timeoutRef.current) {
                          window.clearTimeout(timeoutRef.current);
                          timeoutRef.current = null;
                        }
                      }}
                      onError={() => {
                        setActiveSourceIndex((current) => Math.min(current + 1, mediaSources.length - 1));
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02)_0%,rgba(0,0,0,0.12)_35%,rgba(0,0,0,0.68)_100%)]" />
                  <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-white/85 backdrop-blur">
                    {activeSource?.label ?? mediaLabel}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm uppercase tracking-[0.24em] text-white/70">
                      {snapshot.currentCamera.location.country} · {snapshot.currentCamera.location.city}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{snapshot.currentCamera.title}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.28em] text-white/45">鸟的状态</p>
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(255,180,70,0.8)]" />
              </div>
              <p className="mt-4 text-lg leading-8 text-white/82">{snapshot.birdStatus}</p>
              {windysideLink ? (
                <a
                  className="mt-5 inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white/85"
                  href={windysideLink}
                  rel="noreferrer"
                  target="_blank"
                >
                  在 Windy 打开
                </a>
              ) : null}
              <div className="mt-6 grid gap-3 text-sm text-white/68">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">来源标签</p>
                  <p className="mt-2 font-medium text-white">{snapshot.currentCamera.previewLabel}</p>
                  <p className="mt-1 text-white/55">{mediaFreshness}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/45">下一步</p>
                  <p className="mt-2 font-medium text-white">打开地球仪，或者写一封信。</p>
                  <p className="mt-1 text-white/55">
                    {snapshot.currentCamera.title} · {snapshot.currentCamera.location.city}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black" href="/globe">
                  打开地球仪
                </Link>
                <Link
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
                  href="/write"
                >
                  写一封信
                </Link>
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/68">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">当前相机</p>
                <p className="mt-2 font-medium text-white">{snapshot.currentCamera.title}</p>
                <p className="mt-1">
                  分数 {snapshot.currentCamera.score} · {sunriseDeltaLabel}
                </p>
              </div>
            </aside>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/65 to-transparent" />
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-4 gap-2 px-3 py-3 sm:px-6">
          <Link className="rounded-full bg-white px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-black" href="/">
            日出
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/80"
            href="/globe"
          >
            地球仪
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/80"
            href="/write"
          >
            写信
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/80"
            href="/inbox"
          >
            收件箱
          </Link>
        </div>
      </nav>
    </main>
  );
}
