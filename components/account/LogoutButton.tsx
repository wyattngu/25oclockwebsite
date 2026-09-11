"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { clearLastOrderInfo } from "@/lib/utils/lastOrderInfo";

export function LogoutButton() {
  const router = useRouter();
  const { dict: t } = useLocale();

  async function handleLogout() {
    await fetch("/api/account/logout", { method: "POST" });
    // Đăng xuất thì xoá luôn thông tin giao hàng đã nhớ (mục "tự điền cho đơn tiếp
    // theo" ở checkout) — tránh lỡ điền nhầm thông tin của người này cho người khác
    // đăng nhập sau trên cùng máy/trình duyệt.
    clearLastOrderInfo();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" onClick={handleLogout} className="text-[13px] underline underline-offset-2 hover:text-ink-60">
      {t.account.logout}
    </button>
  );
}
