export const company = {
  email: "25oclockhome@gmail.com",
  instagram: { label: "@25oclock.home", url: "https://instagram.com/25oclock.home" },
  freeShippingThreshold: 1000000,
  /**
   * Tài khoản ngân hàng nhận chuyển khoản — dùng để tạo mã VietQR ở trang /checkout.
   * Sửa 3 dòng dưới đây thành thông tin thật của bạn rồi lưu lại, web sẽ tự cập nhật QR.
   *
   * bankId: mã ngân hàng theo VietQR — dùng tên viết thường không dấu, ví dụ:
   *   vietcombank, vietinbank, bidv, agribank, techcombank, mbbank, acb, vpbank,
   *   tpbank, sacombank, hdbank, vib, shb, msb, ocb, eximbank, scb...
   *   (tra đầy đủ tại https://api.vietqr.io/v2/banks — lấy giá trị cột "code")
   */
  bankAccount: {
    bankId: "TECHCOMBANK",
    accountNumber: "19074609130010",
    accountName: "DO QUOC HUNG",
  },
  /**
   * Email nhận thông báo mỗi khi có đơn hàng mới (xem app/api/orders/route.ts).
   *
   * Đang để tạm là email bạn dùng đăng ký Resend — vì khi CHƯA xác minh domain
   * riêng trên Resend, "from: onboarding@resend.dev" chỉ được phép gửi tới đúng
   * email đó. Muốn nhận thông báo ở email khác (ví dụ hello@25oclock.vn), vào
   * resend.com/domains xác minh domain đó rồi đổi "from" trong
   * app/api/orders/route.ts sang địa chỉ thuộc domain vừa xác minh.
   */
  orderNotificationEmail: "doquochung251205@gmail.com",
};
