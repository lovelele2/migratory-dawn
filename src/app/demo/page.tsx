"use client";

import { PageShell } from "@/components/page-shell";
import { DemoPanel } from "@/components/demo-panel";
import { useDemoStore } from "@/components/use-demo-store";

export default function DemoPage() {
  const store = useDemoStore();

  return (
    <PageShell
      kicker="演示"
      title="受保护的演示控制将放在这里。"
      description="普通用户不应该看到这个页面。它只用于安全的手动覆盖、回退测试和评审日控制。"
    >
      <DemoPanel store={store} />
    </PageShell>
  );
}

