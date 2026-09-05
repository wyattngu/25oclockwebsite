import { company } from "@/lib/data/company";

/** Tài khoản trong lib/data/company.ts vẫn còn là dữ liệu mẫu, chưa được chủ shop sửa lại. */
export function isBankAccountConfigured(): boolean {
  return company.bankAccount.accountNumber !== "0000000000";
}

/**
 * Dựng URL ảnh mã VietQR động (ngân hàng + số tài khoản lấy từ company.ts, số tiền và
 * nội dung chuyển khoản theo từng đơn) — dùng service ảnh miễn phí của VietQR.io, không
 * cần API key. Chi tiết: https://www.vietqr.io/danh-sach-api/tao-ma-qr-tren-cac-dinh-dang/
 */
export function buildVietQrUrl(amount: number, addInfo: string): string {
  const { bankId, accountNumber, accountName } = company.bankAccount;
  const params = new URLSearchParams({
    amount: String(Math.max(0, Math.round(amount))),
    addInfo,
    accountName,
  });
  return `https://img.vietqr.io/image/${encodeURIComponent(bankId)}-${encodeURIComponent(accountNumber)}-compact2.png?${params.toString()}`;
}
