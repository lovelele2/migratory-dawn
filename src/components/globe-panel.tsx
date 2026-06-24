"use client";

import { useMemo } from "react";
import type { SunriseSnapshot } from "@/lib/camera-types";
import { type DemoStore } from "./use-demo-store";

type GlobePanelProps = {
  store: DemoStore;
  snapshot?: SunriseSnapshot | null;
  hideVisual?: boolean;
};

type Point = { x: number; y: number };

function project(latitude: number, longitude: number, width: number, height: number): Point {
  const x = ((longitude + 180) / 360) * width;
  const y = ((90 - latitude) / 180) * height;
  return { x, y };
}

export function GlobePanel({ store, snapshot = null, hideVisual = false }: GlobePanelProps) {
  const activeLetter = store.lettersWithStatus.find(({ status }) => status !== "read");
  const currentCamera = snapshot?.currentCamera ?? null;
  const markers = useMemo(() => {
    const approved = store.approvedCameraReviews;
    const cameraMarkers = approved.map((camera) => ({
      id: String(camera.webcamId),
      label: camera.title,
      x: project(camera.latitude, camera.longitude, 1000, 620).x,
      y: project(camera.latitude, camera.longitude, 1000, 620).y,
    }));
    const sunriseMarker = currentCamera
      ? {
          id: String(currentCamera.webcamId),
          label: currentCamera.title,
          x: project(currentCamera.location.latitude, currentCamera.location.longitude, 1000, 620).x,
          y: project(currentCamera.location.latitude, currentCamera.location.longitude, 1000, 620).y,
        }
      : null;

    return { cameraMarkers, sunriseMarker };
  }, [currentCamera, store.approvedCameraReviews]);

  const birdPoint = currentCamera
    ? project(currentCamera.location.latitude, currentCamera.location.longitude, 1000, 620)
    : { x: 500, y: 300 };

  const originPoint = activeLetter
    ? project(activeLetter.letter.originLatitude, activeLetter.letter.originLongitude, 1000, 620)
    : null;
  const destinationPoint = activeLetter
    ? project(activeLetter.letter.destinationLatitude, activeLetter.letter.destinationLongitude, 1000, 620)
    : null;

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        地球仪先用轻量 SVG 呈现。它不冒充科学级追踪，但会把鸟、当前日出源和信件路线都标出来。
      </div>

      {hideVisual ? null : (
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,_rgba(255,173,95,0.18),_transparent_30%),linear-gradient(180deg,#0d1117_0%,#050505_100%)]">
          <svg viewBox="0 0 1000 620" className="block h-auto w-full">
          <defs>
            <radialGradient id="glow" cx="50%" cy="45%" r="60%">
              <stop offset="0%" stopColor="rgba(255,185,102,0.38)" />
              <stop offset="50%" stopColor="rgba(255,185,102,0.08)" />
              <stop offset="100%" stopColor="rgba(255,185,102,0)" />
            </radialGradient>
          </defs>
          <rect width="1000" height="620" fill="url(#glow)" />
          <circle cx="500" cy="310" r="235" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" />
          <path d="M265 310c70-96 199-146 235-146s165 50 235 146" fill="none" stroke="rgba(255,255,255,0.08)" />
          <path d="M265 310c70 96 199 146 235 146s165-50 235-146" fill="none" stroke="rgba(255,255,255,0.08)" />
          <path d="M500 75v470" stroke="rgba(255,255,255,0.08)" />
          <path d="M388 120v380" stroke="rgba(255,255,255,0.06)" />
          <path d="M612 120v380" stroke="rgba(255,255,255,0.06)" />

          {originPoint && destinationPoint ? (
            <path
              d={`M ${originPoint.x / 2.5} ${originPoint.y / 1.93} L ${destinationPoint.x / 2.5} ${destinationPoint.y / 1.93}`}
              stroke="rgba(255,180,80,0.45)"
              strokeDasharray="8 8"
              fill="none"
            />
          ) : null}

          {markers.cameraMarkers.slice(0, 8).map((marker, index) => (
            <g key={marker.id}>
              <circle
                cx={marker.x / 2.5}
                cy={marker.y / 1.93}
                r={index === 0 ? 8 : 5}
                fill={index === 0 ? "#ffd166" : "rgba(255,255,255,0.7)"}
              />
            </g>
          ))}

          {markers.sunriseMarker ? (
            <circle
              cx={markers.sunriseMarker.x / 2.5}
              cy={markers.sunriseMarker.y / 1.93}
              r={12}
              fill="none"
              stroke="rgba(255,200,92,0.9)"
              strokeWidth="3"
            />
          ) : null}

          {originPoint ? (
            <circle cx={originPoint.x / 2.5} cy={originPoint.y / 1.93} r={10} fill="rgba(255,255,255,0.86)" />
          ) : null}
          {destinationPoint ? (
            <circle cx={destinationPoint.x / 2.5} cy={destinationPoint.y / 1.93} r={10} fill="#ffb24a" />
          ) : null}

          <circle cx={birdPoint.x / 2.5} cy={birdPoint.y / 1.93} r={14} fill="rgba(255,216,140,0.12)" />
          <circle cx={birdPoint.x / 2.5} cy={birdPoint.y / 1.93} r={6} fill="#fff3cf" />
          </svg>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">当前日出源</p>
          <p className="mt-2 text-lg font-semibold text-white">{snapshot?.currentCamera.title ?? "正在读取"}</p>
          <p className="mt-1 text-sm text-white/65">
            {snapshot?.currentCamera.location.country} · {snapshot?.currentCamera.location.city}
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.24em] text-white/45">正在流转的信</p>
          <p className="mt-2 text-lg font-semibold text-white">
            {activeLetter ? activeLetter.letter.content.slice(0, 20) : "暂无活跃信件"}
          </p>
          <p className="mt-1 text-sm text-white/65">
            {activeLetter
              ? `${activeLetter.letter.originCity} → ${activeLetter.letter.destinationCity}`
              : "发送一封信后会在这里看到路线"}
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/72">
        {store.approvedCameraReviews.map((camera) => (
          <div key={camera.webcamId} className="flex items-center justify-between gap-3">
            <span>
              {camera.location} · {camera.label}
            </span>
            <span>{camera.freshness}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
