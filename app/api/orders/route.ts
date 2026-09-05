import { NextResponse } from "next/server";
import { Resend } from "resend";
import { company } from "@/lib/data/company";
import { formatPrice } from "@/lib/utils/formatPrice";
import { createOrder } from "@/lib/data/orders";
import type { OrderPayload } from "@/lib/types";

/**
 * Nhận đơn hàng từ trang /checkout:
 * 1. Lưu vào Supabase (bảng `orders`, trạng thái "pending") để hiện trong /admin/orders.
 *    Cấu hình: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY trong .env.local, và chạy
 *    supabase/schema.sql trong SQL Editor của project (1 lần).
 * 2. Gửi email báo về company.orderNotificationEmail qua Resend.
 *    Cấu hình: RESEND_API_KEY trong .env.local.
 *
 * Thiếu 1 trong 2 cấu hình trên thì phần đó chỉ bị bỏ qua (log cảnh báo) —
 * KHÔNG làm hỏng luồng đặt hàng của khách. Xem .env.local.example.
 */

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildAdminEmailHtml(payload: OrderPayload): string {
  const { customer, lines, orderId, paymentMethod, subtotal, shippingFee, total } = payload;

  const itemsHtml = lines
    .map(
      (l) => `
        <tr>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5">${escapeHtml(l.title)} — size ${escapeHtml(l.size)} × ${l.quantity}</td>
          <td style="padding:6px 8px;border-bottom:1px solid #e5e5e5;text-align:right;white-space:nowrap">${formatPrice({ amount: l.price.amount * l.quantity, currencyCode: "VND" })}</td>
        </tr>`,
    )
    .join("");

  const addressLine = [customer.address, customer.ward, customer.district, customer.city]
    .filter((part): part is string => Boolean(part))
    .map(escapeHtml)
    .join(", ");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;max-width:520px">
      <h2 style="margin:0 0 4px">Đơn hàng mới #${escapeHtml(orderId)}</h2>
      <p style="margin:0 0 16px;color:#666">Phương thức thanh toán: ${escapeHtml(paymentMethod)}</p>

      <h3 style="margin:0 0 6px">Khách hàng</h3>
      <p style="margin:0 0 16px;line-height:1.6">
        ${escapeHtml(customer.name)}<br/>
        ${escapeHtml(customer.phone)} — ${escapeHtml(customer.email)}<br/>
        ${addressLine}
        ${customer.note ? `<br/><em>Ghi chú: ${escapeHtml(customer.note)}</em>` : ""}
      </p>

      <h3 style="margin:0 0 6px">Sản phẩm</h3>
      <table style="border-collapse:collapse;width:100%">${itemsHtml}</table>

      <p style="margin-top:16px;line-height:1.8">
        Tạm tính: ${formatPrice(subtotal)}<br/>
        Vận chuyển: ${shippingFee.amount === 0 ? "Miễn phí" : formatPrice(shippingFee)}<br/>
        <strong style="font-size:16px">Tổng cộng: ${formatPrice(total)}</strong>
      </p>

      <p style="margin-top:20px;color:#666">
        Xem &amp; xác nhận đơn tại trang quản trị: /admin/orders/${escapeHtml(orderId)}
      </p>
    </div>`;
}

async function sendAdminEmail(payload: OrderPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[api/orders] RESEND_API_KEY chưa cấu hình — bỏ qua gửi email báo đơn hàng.");
    return false;
  }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "25 o'clock <onboarding@resend.dev>",
      to: company.orderNotificationEmail,
      subject: `Đơn hàng mới #${payload.orderId} — ${formatPrice(payload.total)}`,
      html: buildAdminEmailHtml(payload),
    });
    if (error) {
      console.error("[api/orders] Resend trả lỗi:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[api/orders] Gửi email thất bại:", err);
    return false;
  }
}

export async function POST(request: Request) {
  let payload: OrderPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!payload?.orderId || !payload?.customer || !Array.isArray(payload.lines)) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const [{ ok: saved }, emailed] = await Promise.all([createOrder(payload), sendAdminEmail(payload)]);

  return NextResponse.json({ ok: true, saved, emailed });
}
