"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ContactForm() {
  const { dict: t } = useLocale();
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Chưa nối API/email thật — chỉ demo trải nghiệm gửi form thành công.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-line px-6 py-10 text-center">
        <p className="text-[15px]">{t.contact.thankYou}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input required placeholder={t.checkout.fullName} />
        <Input required type="tel" placeholder={t.checkout.phone} />
      </div>
      <Input required type="email" placeholder={t.checkout.email} />
      <Textarea required rows={4} placeholder={t.contact.messageContent} />
      <Button type="submit" className="px-8">
        {t.contact.submit}
      </Button>
    </form>
  );
}
