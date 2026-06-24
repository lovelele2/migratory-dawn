"use client";

import { useState } from "react";
import type { DemoStore } from "./use-demo-store";

type LoginPanelProps = {
  store: DemoStore;
};

export function LoginPanel({ store }: LoginPanelProps) {
  const [email, setEmail] = useState(store.currentProfile?.email ?? "");
  const [nickname, setNickname] = useState(store.currentProfile?.nickname ?? "");
  const [token, setToken] = useState("");
  const [requested, setRequested] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-5">
      {store.currentProfile ? (
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-50">
          已登录为 <span className="font-semibold">{store.currentProfile.nickname}</span>，鸟码{" "}
          <span className="font-semibold">{store.currentProfile.birdCode}</span>。
        </div>
      ) : null}

      {store.currentProfile ? (
        <button
          type="button"
          onClick={async () => {
            await store.signOut();
            setMessage("已退出登录。");
          }}
          className="w-full rounded-full border border-white/15 bg-black/20 px-5 py-3 text-sm font-semibold text-white"
        >
          退出登录
        </button>
      ) : null}

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">邮箱地址</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="name@example.com"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/25"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">昵称</span>
        <input
          type="text"
          value={nickname}
          onChange={(event) => setNickname(event.target.value)}
          placeholder="你想被怎么称呼"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/25"
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">验证码</span>
        <input
          type="text"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="从邮件里复制验证码"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/25"
        />
      </label>
      <button
        type="button"
        onClick={async () => {
          if (!email.trim()) {
            return;
          }
          const result = await store.requestOtp(email);
          if (result.ok) {
            setRequested(true);
            setMessage("验证码已发送。请去邮箱里查看后填回这里。");
            return;
          }

          await store.signIn(email, nickname);
          setRequested(true);
          setMessage("Supabase 暂时不可用，已切到本地演示登录。");
        }}
        className="w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black"
      >
        发送验证码
      </button>
      <button
        type="button"
        onClick={async () => {
          if (!email.trim() || !token.trim()) {
            return;
          }
          const result = await store.verifyOtp(email, token, nickname);
          if (result.ok) {
            setMessage("已完成 Supabase 登录。");
            return;
          }
          await store.signIn(email, nickname);
          setMessage("验证码验证失败，已切到本地演示登录。");
        }}
        className="w-full rounded-full border border-white/15 bg-black/20 px-5 py-3 text-sm font-semibold text-white"
      >
        确认登录
      </button>
      <p className="text-sm leading-6 text-white/65">
        这一步优先走 Supabase 邮箱验证码。若后端还未准备好，会自动退回本地演示登录。
      </p>
      <p className="text-sm leading-6 text-white/55">
        演示账号：`demo@example.com`，登录后可以看到受保护的 demo 控制。
      </p>
      {requested ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          已请求验证码。请把邮件中的码填到上面，再点“确认登录”。
        </p>
      ) : null}
      {message ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          {message}
        </p>
      ) : null}
    </div>
  );
}
