import { Resend } from "resend";
import { formatPrice } from "@/lib/utils/formatPrice";
import type { Order } from "@/lib/types";

/**
 * Gửi email báo khách "đơn hàng đã được xác nhận" — CẦN domain đã xác minh trên Resend,
 * vì đích gửi là email của khách (khác nhau mỗi đơn), không phải email chủ tài khoản
 * Resend. Set RESEND_CUSTOMER_FROM trong .env.local (ví dụ:
 * "25 o'clock <noreply@25oclock.vn>") sau khi xác minh domain tại resend.com/domains.
 *
 * Chưa cấu hình thì hàm này bỏ qua, trả về false — trang admin sẽ nhắc bạn tự báo
 * khách qua Zalo/điện thoại.
 */
export async function sendCustomerConfirmation(order: Order): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_CUSTOMER_FROM;
  if (!apiKey || !from) {
    console.warn(
      "[orders] RESEND_CUSTOMER_FROM chưa cấu hình (cần domain đã xác minh) — bỏ qua email báo khách.",
    );
    return false;
  }

  const itemsText = order.lines.map((l) => `${l.title} — size ${l.size} × ${l.quantity}`).join("<br/>");

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;max-width:480px">
      <h2 style="margin:0 0 12px">Đơn hàng #${order.id} đã được xác nhận</h2>
      <p>Chào ${order.customer.name},</p>
      <p>25 o'clock đã nhận được thanh toán và xác nhận đơn hàng của bạn. Đơn sẽ được chuẩn bị và giao trong thời gian sớm nhất.</p>
      <p style="margin-top:16px">${itemsText}</p>
      <p style="margin-top:12px"><strong>Tổng cộng: ${formatPrice(order.total)}</strong></p>
      <p style="margin-top:20px;color:#666">Cảm ơn bạn đã mua sắm cùng 25 o'clock.</p>
    </div>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: order.customer.email,
      subject: `Đơn hàng #${order.id} đã được xác nhận`,
      html,
    });
    if (error) {
      console.error("[orders] Gửi email báo khách thất bại:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[orders] Gửi email báo khách thất bại:", err);
    return false;
  }
}
