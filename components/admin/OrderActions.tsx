"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";

type Props = { orderId: string; status: OrderStatus; paymentMethod: string };

type Action = "confirm" | "cancel" | "remind";

export function OrderActions({ orderId, status, paymentMethod }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<Action | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Chỉ 2 phương thức tồn tại: COD và Chuyển khoản (VietQR) — COD không có khái niệm
  // "đã nhận được tiền" trước khi giao hàng, nên đổi nhãn nút và ẩn nút nhắc thanh toán.
  const isCod = paymentMethod.includes("COD");

  async function act(action: "confirm" | "cancel") {
    setLoading(action);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/${action}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMessage("Có lỗi xảy ra, thử lại.");
        return;
      }
      if (action === "confirm") {
        setMessage(
          data.customerEmailed
            ? "Đã xác nhận đơn và gửi email cho khách."
            : "Đã xác nhận đơn. Chưa gửi được email cho khách (chưa cấu hình domain gửi tới khách) — hãy tự nhắn Zalo/gọi điện báo khách.",
        );
      } else {
        setMessage("Đã huỷ đơn.");
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  async function remind() {
    setLoading("remind");
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/remind`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setMessage("Có lỗi xảy ra, thử lại.");
        return;
      }
      setMessage(
        data.emailed
          ? "Đã gửi email nhắc khách thanh toán."
          : "Chưa gửi được email (chưa cấu hình domain gửi tới khách) — hãy tự nhắn Zalo/gọi điện nhắc khách.",
      );
    } finally {
      setLoading(null);
    }
  }

  if (status === "confirmed") {
    return <p className="text-[14px] text-ink-60">Đơn này đã được xác nhận.</p>;
  }
  if (status === "cancelled") {
    return <p className="text-[14px] text-ink-60">Đơn này đã bị huỷ.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => act("confirm")} disabled={loading !== null} className="px-8">
          {loading === "confirm" ? "Đang xử lý…" : isCod ? "Xác nhận đơn hàng" : "Xác nhận đã nhận được tiền"}
        </Button>

        {!isCod ? (
          <Button type="button" variant="ghost" onClick={remind} disabled={loading !== null} className="px-8">
            {loading === "remind" ? "Đang gửi…" : "Chưa nhận được tiền — nhắc khách"}
          </Button>
        ) : null}

        <Button
          type="button"
          variant="ghost"
          onClick={() => act("cancel")}
          disabled={loading !== null}
          className="px-8"
        >
          {loading === "cancel" ? "Đang xử lý…" : "Huỷ đơn"}
        </Button>
      </div>
      {message ? <p className="text-[13px] text-ink-60">{message}</p> : null}
    </div>
  );
}
