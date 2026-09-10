"use client";

import { useState } from "react";
import { z } from "zod";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function NewsletterForm() {
  const { dict: t } = useLocale();
  const schema = z.email(t.nav.newsletterInvalidField);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = schema.safeParse(email);
    if (!result.success) {
      setStatus("error");
      return;
    }
    // Chưa nối API thật — lưu ý cho việc tích hợp Klaviyo/Shopify sau này.
    setStatus("success");
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      <div className="flex items-center gap-2 border-b border-white/30 pb-2">
        <input
          type="email"
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setStatus("idle");
          }}
          placeholder={t.nav.newsletterPlaceholder}
          className="w-full bg-transparent text-[13px] text-white placeholder:text-white/40 focus:outline-none"
        />
        <button type="submit" className="shrink-0 text-[12px] uppercase tracking-widest text-white underline underline-offset-2">
          {t.nav.newsletterSend}
        </button>
      </div>
      {status === "success" ? <p className="mt-2 text-[12px] text-white/70">{t.nav.newsletterSuccess}</p> : null}
      {status === "error" ? <p className="mt-2 text-[12px] text-white/70">{t.nav.newsletterInvalid}</p> : null}
    </form>
  );
}
