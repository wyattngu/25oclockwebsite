"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password.length < 6) {
      setError("Mật khẩu cần ít nhất 6 ký tự.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/account/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(
          data.error === "email_taken"
            ? "Email này đã được đăng ký."
            : data.message || "Có lỗi xảy ra, thử lại.",
        );
        return;
      }
      router.push("/account");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-25 max-w-sm py-16">
      <h1 className="mb-8 text-center text-[22px] font-medium uppercase tracking-[0.06em]">Tạo tài khoản</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input required placeholder="Họ và tên" value={form.name} onChange={(e) => update("name", e.target.value)} autoFocus />
        <Input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <Input type="tel" placeholder="Số điện thoại (tuỳ chọn)" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        <Input
          type="password"
          required
          placeholder="Mật khẩu (tối thiểu 6 ký tự)"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
        <Input
          type="password"
          required
          placeholder="Nhập lại mật khẩu"
          value={form.confirm}
          onChange={(e) => update("confirm", e.target.value)}
        />
        {error ? <p className="text-[13px] text-sale">{error}</p> : null}
        <Button type="submit" fullWidth disabled={loading}>
          {loading ? "Đang tạo…" : "Tạo tài khoản"}
        </Button>
      </form>
      <p className="mt-6 text-center text-[13px] text-ink-60">
        Đã có tài khoản?{" "}
        <Link href="/account/login" className="text-ink underline underline-offset-2">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
