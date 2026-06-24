"use client";

import { useMemo, useState } from "react";
import { formatClock, nextSunriseAt, originCities } from "@/lib/demo-state";
import type { DemoStore } from "./use-demo-store";

type WritePanelProps = {
  store: DemoStore;
};

export function WritePanel({ store }: WritePanelProps) {
  const currentProfile = store.currentProfile ?? store.profiles[0] ?? null;
  const [recipientBirdCode, setRecipientBirdCode] = useState(store.draft.recipientBirdCode);
  const [deliveryMode, setDeliveryMode] = useState(store.draft.deliveryMode);
  const [originCity, setOriginCity] = useState(store.draft.originCity || currentProfile?.homeCity || "东京");
  const [content, setContent] = useState(store.draft.content);
  const [feedback, setFeedback] = useState<string | null>(null);
  const origin = useMemo(
    () => originCities.find((city) => city.city === originCity) ?? originCities[0],
    [originCity],
  );

  if (!store.ready) {
    return <p className="text-sm text-white/70">正在读取本地演示数据……</p>;
  }

  if (!currentProfile) {
    return <p className="text-sm text-white/70">还没有可用的登录资料，请先去登录页创建一个鸟码。</p>;
  }

  const previewPickup = nextSunriseAt(origin.latitude, origin.longitude, new Date());
  const characterCount = content.trim().length;

  async function handleSend() {
    if (!content.trim()) {
      setFeedback("请先写一点内容。");
      return;
    }

    if (deliveryMode === "direct" && !recipientBirdCode.trim()) {
      setFeedback("直接送达时需要填写鸟码。");
      return;
    }

    try {
      const letter = await store.sendLetter({
        recipientBirdCode,
        content,
        deliveryMode,
        originCity,
      });
      setRecipientBirdCode("");
      setContent("");
      setFeedback(
        `${letter.deliveryMode === "direct" ? "直送" : "随机"}已记录，${formatClock(new Date(letter.pickupAt))} 取件，${formatClock(new Date(letter.deliverAt))} 送达。`,
      );
    } catch {
      setFeedback("没有找到对应的收件人鸟码，或当前连接不可写。");
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-white/75">
        当前登录用户：
        <span className="ml-2 font-semibold text-white">
          {currentProfile.nickname} · {currentProfile.birdCode}
        </span>
      </div>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">送达方式</span>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setDeliveryMode("direct")}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              deliveryMode === "direct"
                ? "border-white bg-white text-black"
                : "border-white/10 bg-black/20 text-white/75"
            }`}
          >
            直接发送
          </button>
          <button
            type="button"
            onClick={() => setDeliveryMode("random")}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
              deliveryMode === "random"
                ? "border-white bg-white text-black"
                : "border-white/10 bg-black/20 text-white/75"
            }`}
          >
            随机送达
          </button>
        </div>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">目的鸟码</span>
        <input
          type="text"
          value={recipientBirdCode}
          onChange={(event) => setRecipientBirdCode(event.target.value)}
          placeholder="MD-4281"
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/25"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">起飞城市</span>
        <select
          value={originCity}
          onChange={(event) => setOriginCity(event.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-white/25"
        >
          {originCities.map((city) => (
            <option key={city.city} value={city.city}>
              {city.country} · {city.city}
            </option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.24em] text-white/45">信件内容</span>
        <textarea
          rows={8}
          maxLength={300}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="最多 300 个中文字符，或相当长度的内容。"
          className="w-full rounded-3xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-white/25"
        />
      </label>

      <div className="flex items-center justify-between text-xs tracking-[0.16em] text-white/45">
        <span>{characterCount}/300</span>
        <span>{formatClock(previewPickup)} 预计起飞</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={handleSend} className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black">
          发送信件
        </button>
        <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75">
          {store.flags.immediateDelivery ? "演示模式：立即送达" : "正常模式：按日出取件"}
        </div>
      </div>

      {feedback ? (
        <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
          {feedback}
        </p>
      ) : null}

      <p className="text-sm leading-6 text-white/65">
        发送后会在本地生成取件和送达时间。当前的 demo 开关可让你模拟立即送达，方便演示。
      </p>
    </div>
  );
}
