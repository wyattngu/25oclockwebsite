import { Resend } from "resend";
import { formatPrice } from "@/lib/utils/formatPrice";
import { buildVietQrUrl } from "@/lib/utils/vietqr";
import { company } from "@/lib/data/company";
import { escapeHtml } from "@/lib/utils/escapeHtml";
import type { Order } from "@/lib/types";

/**
 * Gửi email nhắc khách "đơn hàng chưa ghi nhận thanh toán" — dùng khi shop kiểm tra
 * sao kê ngân hàng nhưng chưa thấy tiền vào cho đơn chuyển khoản VietQR. Cùng giới hạn
 * như sendCustomerConfirmation: cần RESEND_CUSTOMER_FROM (domain đã xác minh trên
 * Resend), chưa cấu hình thì bỏ qua, trả về false.
 */
export async function sendPaymentReminder(order: Order): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_CUSTOMER_FROM;
  if (!apiKey || !from) {
    console.warn(
      "[orders] RESEND_CUSTOMER_FROM chưa cấu hình (cần domain đã xác minh) — bỏ qua email nhắc thanh toán.",
    );
    return false;
  }

  const qrUrl = buildVietQrUrl(order.total.amount, order.id);

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;max-width:480px">
      <h2 style="margin:0 0 12px">Đơn hàng #${escapeHtml(order.id)} chưa được thanh toán</h2>
      <p>Chào ${escapeHtml(order.customer.name)},</p>
      <p>25 o'clock chưa ghi nhận được thanh toán cho đơn hàng #${escapeHtml(order.id)} của bạn. Vui lòng hoàn tất chuyển khoản theo thông tin bên dưới để đơn được xử lý và giao sớm nhất.</p>

      <div style="margin:20px 0;text-align:center">
        <img src="${qrUrl}" alt="Mã VietQR" width="240" style="border:1px solid #ddd" />
      </div>

      <p>
        Số tiền: <strong>${formatPrice(order.total)}</strong><br/>
        Nội dung chuyển khoản: <strong>${escapeHtml(order.id)}</strong><br/>
        ${company.bankAccount.accountName} — ${company.bankAccount.bankId.toUpperCase()} — ${company.bankAccount.accountNumber}
      </p>

      <p style="margin-top:20px;color:#666">
        Nếu bạn đã thanh toán hoặc gặp vấn đề gì, vui lòng liên hệ Instagram
        <a href="${company.instagram.url}" style="color:#111">${company.instagram.label}</a> để được hỗ trợ nhanh nhất.
      </p>
      <p style="margin-top:12px;color:#666">Cảm ơn bạn đã mua sắm cùng 25 o'clock.</p>
    </div>`;

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to: order.customer.email,
      subject: `Đơn hàng #${order.id} chưa được thanh toán — vui lòng hoàn tất`,
      html,
    });
    if (error) {
      console.error("[orders] Gửi email nhắc thanh toán thất bại:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[orders] Gửi email nhắc thanh toán thất bại:", err);
    return false;
  }
}
