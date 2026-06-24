"use client";

import { useEffect, useState } from "react";
import { GlobePanel } from "./globe-panel";
import { MapboxGlobe } from "./mapbox-globe";
import { useDemoStore } from "./use-demo-store";
import type { SunriseSnapshot } from "@/lib/camera-types";

type GlobePageClientProps = {
  initialSnapshot: SunriseSnapshot | null;
};

export function GlobePageClient({ initialSnapshot }: GlobePageClientProps) {
  const store = useDemoStore();
  const [snapshot, setSnapshot] = useState<SunriseSnapshot | null>(initialSnapshot);

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

  return (
    <div className="space-y-4">
      <MapboxGlobe store={store} initialSnapshot={snapshot} />
      <GlobePanel store={store} snapshot={snapshot} hideVisual />
    </div>
  );
}
