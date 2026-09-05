"use client";

import { useState } from "react";

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard không khả dụng — bỏ qua
    }
  }

  const fbHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  const messengerHref = `fb-messenger://share/?link=${encodeURIComponent(url)}`;

  return (
    <div className="flex items-center gap-4 text-[12px] uppercase tracking-wider text-ink-60">
      <span>Chia sẻ:</span>
      <a href={fbHref} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
        Facebook
      </a>
      <a href={messengerHref} className="underline underline-offset-2 hover:text-ink">
        Messenger
      </a>
      <button type="button" onClick={copyLink} className="underline underline-offset-2 hover:text-ink">
        {copied ? "Đã sao chép" : "Sao chép link"}
      </button>
      <span className="sr-only" aria-label={title} />
    </div>
  );
}
