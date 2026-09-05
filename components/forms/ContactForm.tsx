"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Chưa nối API/email thật — chỉ demo trải nghiệm gửi form thành công.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="border border-line px-6 py-10 text-center">
        <p className="text-[15px]">Cảm ơn bạn đã liên hệ, 25 o&apos;clock sẽ phản hồi trong 24 giờ làm việc.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Input required placeholder="Họ và tên" />
        <Input required type="tel" placeholder="Số điện thoại" />
      </div>
      <Input required type="email" placeholder="Email" />
      <Textarea required rows={4} placeholder="Nội dung liên hệ" />
      <Button type="submit" className="px-8">
        Gửi liên hệ
      </Button>
    </form>
  );
}
