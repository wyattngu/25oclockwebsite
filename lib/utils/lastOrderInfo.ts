"use client";

/**
 * Nhớ lại thông tin giao hàng (họ tên/SĐT/địa chỉ) của lần đặt hàng GẦN NHẤT cho khách
 * đã đăng nhập — đơn tiếp theo trong cùng lượt đăng nhập tự điền sẵn, khách chỉ việc
 * kiểm tra lại rồi bấm đặt hàng, khỏi gõ lại từ đầu. Xem app/(shop)/checkout/page.tsx.
 *
 * Dùng localStorage (không phải sessionStorage) để sống được qua việc đóng/mở lại tab
 * hay khởi động lại trình duyệt — miễn khách CHƯA đăng xuất — nhưng gắn theo đúng email
 * tài khoản (kiểm tra khớp trước khi áp dụng) và tự xoá khi đăng xuất (xem
 * components/account/LogoutButton.tsx) để không lỡ điền nhầm thông tin của người khác
 * nếu nhiều người dùng chung 1 máy/trình duyệt.
 *
 * Không lưu "note" (ghi chú đơn) — ghi chú thường riêng theo từng đơn, không nên tự
 * lặp lại ghi chú của đơn trước.
 */
const STORAGE_KEY = "25oclock:lastOrderInfo";

export type LastOrderInfo = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  provinceCode: number | null;
  districtCode: number | null;
};

export function saveLastOrderInfo(info: LastOrderInfo) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
  } catch {
    // localStorage đầy/bị chặn — bỏ qua, chỉ mất tiện ích tự điền, không ảnh hưởng đặt hàng.
  }
}

/** Trả về thông tin đã lưu CHỈ KHI đúng khớp email tài khoản đang đăng nhập, ngược lại trả null. */
export function getLastOrderInfoFor(email: string): LastOrderInfo | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved: LastOrderInfo = JSON.parse(raw);
    return saved.email?.toLowerCase() === email.toLowerCase() ? saved : null;
  } catch {
    return null;
  }
}

export function clearLastOrderInfo() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // bỏ qua
  }
}
