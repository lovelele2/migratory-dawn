"use client";

import type { DemoStore } from "./use-demo-store";

type DemoPanelProps = {
  store: DemoStore;
};

export function DemoPanel({ store }: DemoPanelProps) {
  const isDemo = Boolean(store.currentProfile?.isDemo || store.currentProfile?.isAdmin);

  if (!isDemo) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
          这个页面只对演示账号开放。请先用 `demo@example.com` 登录。
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        这是受保护的演示控制区。普通用户不应该把这些开关当成正式产品功能。
      </div>
      <label className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="font-semibold text-white">强制使用回退内容</p>
          <p className="mt-1 text-sm text-white/60">模拟 Windy 不可用时的安全路径。</p>
        </div>
        <button
          type="button"
          onClick={() => store.updateFlags({ forceFallback: !store.flags.forceFallback })}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            store.flags.forceFallback ? "bg-white text-black" : "border border-white/15 bg-black/20 text-white"
          }`}
        >
          {store.flags.forceFallback ? "已开启" : "已关闭"}
        </button>
      </label>
      <label className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="font-semibold text-white">立即送达</p>
          <p className="mt-1 text-sm text-white/60">把信件状态直接推到已送达，方便演示。</p>
        </div>
        <button
          type="button"
          onClick={() => store.updateFlags({ immediateDelivery: !store.flags.immediateDelivery })}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            store.flags.immediateDelivery ? "bg-white text-black" : "border border-white/15 bg-black/20 text-white"
          }`}
        >
          {store.flags.immediateDelivery ? "已开启" : "已关闭"}
        </button>
      </label>
      <label className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-4">
        <div>
          <p className="font-semibold text-white">只看已保留相机</p>
          <p className="mt-1 text-sm text-white/60">帮助审核者快速筛掉拒绝项。</p>
        </div>
        <button
          type="button"
          onClick={() => store.updateFlags({ showOnlyApproved: !store.flags.showOnlyApproved })}
          className={`rounded-full px-4 py-2 text-sm font-semibold ${
            store.flags.showOnlyApproved ? "bg-white text-black" : "border border-white/15 bg-black/20 text-white"
          }`}
        >
          {store.flags.showOnlyApproved ? "已开启" : "已关闭"}
        </button>
      </label>
      <button
        type="button"
        onClick={() => store.resetDemo()}
        className="w-full rounded-full border border-amber-200/20 bg-amber-300/10 px-5 py-3 text-sm font-semibold text-amber-100"
      >
        重置演示数据
      </button>
    </div>
  );
}
