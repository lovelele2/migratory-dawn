import { HomePageClient } from "@/components/home-page-client";
import { getCurrentSunriseSnapshot } from "@/lib/sunrise";

export default async function Home() {
  const snapshot = await getCurrentSunriseSnapshot();
  return <HomePageClient initialSnapshot={snapshot} />;
}
