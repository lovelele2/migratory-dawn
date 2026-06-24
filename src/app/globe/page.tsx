import { PageShell } from "@/components/page-shell";
import { GlobePageClient } from "@/components/globe-page-client";
import { getCurrentSunriseSnapshot } from "@/lib/sunrise";

export default async function GlobePage() {
  const snapshot = await getCurrentSunriseSnapshot();

  return (
    <PageShell
      kicker="地球仪"
      title="深色地球仪承载着鸟的路线和当前日出来源。"
      description="这个视图始终排在日出图片之后。它只告诉你鸟在哪里、来源在哪里，以及一封信从哪里出发、在哪里落地。"
    >
      <GlobePageClient initialSnapshot={snapshot} />
    </PageShell>
  );
}
