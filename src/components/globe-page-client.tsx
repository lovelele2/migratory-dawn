"use client";

import { GlobePanel } from "./globe-panel";
import { MapboxGlobe } from "./mapbox-globe";
import { useDemoStore } from "./use-demo-store";
import type { SunriseSnapshot } from "@/lib/camera-types";

type GlobePageClientProps = {
  initialSnapshot: SunriseSnapshot | null;
};

export function GlobePageClient({ initialSnapshot }: GlobePageClientProps) {
  const store = useDemoStore();
  return (
    <div className="space-y-4">
      <MapboxGlobe store={store} initialSnapshot={initialSnapshot} />
      <GlobePanel store={store} initialSnapshot={initialSnapshot} hideVisual />
    </div>
  );
}
