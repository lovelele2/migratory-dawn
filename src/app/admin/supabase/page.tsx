import { PageShell } from "@/components/page-shell";
import { checkSupabaseConnectivity } from "@/lib/supabase-health";

export const dynamic = "force-dynamic";

export default async function SupabaseHealthPage() {
  const result = await checkSupabaseConnectivity();

  return (
    <PageShell
      kicker="Supabase 检查"
      title="只显示连接状态，不展示任何密钥值。"
      description="这个页面用于确认 Supabase URL 和匿名/Publishable 密钥是否可用，以及服务端是否能拿到响应。"
    >
      <div className="space-y-3 text-sm text-white/75">
        <p>连接状态：{result.ok ? "成功" : "失败"}</p>
        {"status" in result ? <p>HTTP 状态：{result.status}</p> : null}
        {"reason" in result ? <p>失败原因：{result.reason}</p> : null}
        {"urlConfigured" in result ? <p>URL 已配置：{result.urlConfigured ? "是" : "否"}</p> : null}
        {"anonKeyConfigured" in result ? <p>匿名/Publishable 密钥已配置：{result.anonKeyConfigured ? "是" : "否"}</p> : null}
      </div>
    </PageShell>
  );
}
