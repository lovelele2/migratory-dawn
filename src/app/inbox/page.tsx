"use client";

import { PageShell } from "@/components/page-shell";
import { InboxPanel } from "@/components/inbox-panel";
import { useDemoStore } from "@/components/use-demo-store";

export default function InboxPage() {
  const store = useDemoStore();

  return (
    <PageShell
      kicker="收件箱"
      title="已收到和已发送的信都在这里。"
      description="信件按状态分组，不做聊天气泡。取件、飞行和送达时间都清清楚楚。"
    >
      <InboxPanel store={store} />
    </PageShell>
  );
}

