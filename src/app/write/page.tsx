"use client";

import { PageShell } from "@/components/page-shell";
import { WritePanel } from "@/components/write-panel";
import { useDemoStore } from "@/components/use-demo-store";

export default function WritePage() {
  const store = useDemoStore();

  return (
    <PageShell
      kicker="写信"
      title="写一封让鸟在日出时携带的信。"
      description="写信页面要有一点仪式感，但不能拖沓。现在已经能直接生成本地信件并计算取件时间。"
    >
      <WritePanel store={store} />
    </PageShell>
  );
}

