import { ImageResponse } from "next/og";

export const alt = "25 O'Clock";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Ảnh mặc định khi chia sẻ link web lên Zalo/Facebook/Messenger — áp dụng cho mọi
// trang chưa có ảnh riêng (trang chủ, collection, giỏ hàng...). Trang sản phẩm có
// ảnh thật riêng, ghi đè ảnh này (xem products/[handle]/page.tsx generateMetadata).
// Dùng chữ không dấu để tránh phải nạp thêm font hỗ trợ tiếng Việt cho next/og.
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a09",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: 4 }}>25 O&apos;CLOCK</div>
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#a8a79e", marginTop: 24 }}>
          DENIM &amp; LEATHER — MADE IN VIETNAM
        </div>
      </div>
    ),
    { ...size },
  );
}
