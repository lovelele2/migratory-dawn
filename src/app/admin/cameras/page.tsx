"use client";

import { PageShell } from "@/components/page-shell";
import { AdminCameraPanel } from "@/components/admin-camera-panel";
import { useDemoStore } from "@/components/use-demo-store";

export default function CameraAdminPage() {
  const store = useDemoStore();

  return (
    <PageShell
      kicker="相机审核"
      title="供人工审核的相机排序卡片。"
      description="这个页面会让审核者在地理筛选和日出筛选之后，保留、备用或拒绝相机。"
    >
      <AdminCameraPanel store={store} />
    </PageShell>
  );
}

