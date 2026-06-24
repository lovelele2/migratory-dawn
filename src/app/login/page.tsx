"use client";

import { PageShell } from "@/components/page-shell";
import { LoginPanel } from "@/components/login-panel";
import { useDemoStore } from "@/components/use-demo-store";

export default function LoginPage() {
  const store = useDemoStore();

  return (
    <PageShell
      kicker="登录"
      title="邮箱登录把鸟码和真实的人绑定在一起。"
      description="当前页面先用本地演示登录跑通流程，后续可以平滑接 Supabase 邮箱验证码。"
    >
      <LoginPanel store={store} />
    </PageShell>
  );
}

