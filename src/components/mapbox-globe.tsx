"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SunriseSnapshot } from "@/lib/camera-types";
import type { DemoStore } from "./use-demo-store";

declare global {
  interface Window {
    mapboxgl?: {
      accessToken: string;
      Map: new (options: {
        container: HTMLDivElement;
        style: string;
        projection?: string;
        center?: [number, number];
        zoom?: number;
        pitch?: number;
        bearing?: number;
        interactive?: boolean;
      }) => {
        on(event: string, handler: () => void): void;
        addControl(control: unknown, position?: string): void;
        setCenter(center: [number, number]): void;
        setZoom(zoom: number): void;
        remove(): void;
        getCanvas(): HTMLCanvasElement;
      };
      Marker: new (options?: { color?: string; scale?: number }) => {
        setLngLat(lngLat: [number, number]): { setPopup(popup: unknown): { addTo(map: unknown): unknown } };
        setPopup(popup: unknown): { addTo(map: unknown): unknown };
        addTo(map: unknown): unknown;
      };
      Popup: new (options?: { closeButton?: boolean; closeOnClick?: boolean }) => {
        setHTML(html: string): unknown;
      };
      NavigationControl: new () => unknown;
    };
  }
}

type MapboxMapInstance = {
  on(event: string, handler: () => void): void;
  addControl(control: unknown, position?: string): void;
  setCenter(center: [number, number]): void;
  setZoom(zoom: number): void;
  remove(): void;
  getCanvas(): HTMLCanvasElement;
};

type MapboxGlobeProps = {
  store: DemoStore;
  initialSnapshot: SunriseSnapshot | null;
};

function markerHtml(label: string, sublabel: string) {
  return `
    <div style="font-family: system-ui, sans-serif; color: white; max-width: 180px;">
      <div style="font-size: 12px; opacity: 0.7; letter-spacing: 0.12em; text-transform: uppercase;">${label}</div>
      <div style="font-size: 16px; font-weight: 700; margin-top: 4px;">${sublabel}</div>
    </div>
  `;
}

async function loadMapboxScript() {
  if (window.mapboxgl) {
    return window.mapboxgl;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-mapbox-gl]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Mapbox script failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.js";
    script.async = true;
    script.dataset.mapboxGl = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Mapbox script failed"));
    document.head.appendChild(script);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://api.mapbox.com/mapbox-gl-js/v3.5.1/mapbox-gl.css";
    link.dataset.mapboxGl = "true";
    document.head.appendChild(link);
  });

  if (!window.mapboxgl) {
    throw new Error("Mapbox GL failed to attach");
  }

  return window.mapboxgl;
}

export function MapboxGlobe({ store, initialSnapshot }: MapboxGlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [available, setAvailable] = useState(false);
  const [message, setMessage] = useState<string>("正在准备 Mapbox 地球仪……");
  const currentCamera = initialSnapshot?.currentCamera ?? null;

  const activeLetter = store.lettersWithStatus.find(({ status }) => status !== "read");
  const approved = store.approvedCameraReviews;

  const markers = useMemo(() => {
    return {
      approved,
      activeLetter,
    };
  }, [activeLetter, approved]);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
    if (!token || !containerRef.current || !currentCamera) {
      setMessage("未配置 Mapbox Token，显示安全回退视图。");
      return;
    }

    let map: MapboxMapInstance | null = null;
    let cancelled = false;

    loadMapboxScript()
      .then((mapboxgl) => {
        if (cancelled || !containerRef.current) {
          return;
        }

        mapboxgl.accessToken = token;
        map = new mapboxgl.Map({
          container: containerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          projection: "globe",
          center: [currentCamera.location.longitude, currentCamera.location.latitude],
          zoom: 1.2,
          pitch: 35,
          bearing: -18,
          interactive: true,
        });

        map.addControl(new mapboxgl.NavigationControl(), "top-right");
        map.on("load", () => {
          if (!map) {
            return;
          }
          setAvailable(true);
          setMessage("Mapbox 地球仪已就绪。");

          try {
            // @ts-expect-error mapbox runtime extras
            map.setFog?.({
              color: "rgb(11, 13, 17)",
              "high-color": "rgb(36, 46, 68)",
              "horizon-blend": 0.08,
            });
          } catch {
            // ignore runtime fog support differences
          }

          new mapboxgl.Marker({ color: "#ffd166" })
            .setLngLat([currentCamera.location.longitude, currentCamera.location.latitude])
            .setPopup(new mapboxgl.Popup({ closeButton: false, closeOnClick: false }).setHTML(
              markerHtml("当前日出", `${currentCamera.title}<br />${currentCamera.location.country} · ${currentCamera.location.city}`),
            ))
            .addTo(map);

          markers.approved.slice(0, 5).forEach((camera) => {
            new mapboxgl.Marker({ color: "#9ca3af", scale: 0.85 })
              .setLngLat([camera.longitude, camera.latitude])
              .setPopup(
                new mapboxgl.Popup({ closeButton: false, closeOnClick: false }).setHTML(
                  markerHtml(camera.label, `${camera.location}<br />${camera.freshness}`),
                ),
              )
              .addTo(map);
          });

          if (markers.activeLetter) {
            const { letter } = markers.activeLetter;
            new mapboxgl.Marker({ color: "#7dd3fc", scale: 0.9 })
              .setLngLat([letter.originLongitude, letter.originLatitude])
              .setPopup(
                new mapboxgl.Popup({ closeButton: false, closeOnClick: false }).setHTML(
                  markerHtml("信件起点", `${letter.originCity} → ${letter.destinationCity}`),
                ),
              )
              .addTo(map);

            new mapboxgl.Marker({ color: "#fb923c", scale: 0.9 })
              .setLngLat([letter.destinationLongitude, letter.destinationLatitude])
              .setPopup(
                new mapboxgl.Popup({ closeButton: false, closeOnClick: false }).setHTML(
                  markerHtml("信件终点", `${letter.destinationCity}`),
                ),
              )
              .addTo(map);
          }
        });
      })
      .catch(() => {
        setMessage("Mapbox 加载失败，已切换到安全回退视图。");
      });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [currentCamera, markers]);

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        {message}
      </div>
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/40">
        <div ref={containerRef} className="h-[520px] w-full" />
        {!available ? (
          <div className="pointer-events-none -mt-[520px] h-[520px] w-full bg-[radial-gradient(circle_at_top,_rgba(255,173,95,0.18),_transparent_30%),linear-gradient(180deg,#0d1117_0%,#050505_100%)]">
            <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-7 text-white/70">
              Mapbox 还没有配置好时，会显示这个安全回退层。
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
