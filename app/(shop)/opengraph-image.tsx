import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getHeroImages } from "@/lib/utils/heroImage";

export const alt = "25 O'Clock";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Ảnh mặc định khi chia sẻ link web lên Zalo/Facebook/Messenger — áp dụng cho mọi
// trang chưa có ảnh riêng (trang chủ, collection, giỏ hàng...). Trang sản phẩm có
// ảnh thật riêng, ghi đè ảnh này (xem products/[handle]/page.tsx generateMetadata).
//
// Đọc file ảnh hero + logo THẬT từ public/images/ ngay trong hàm (không phải ở module
// scope) — để khi bạn thay ảnh hero mới (public/images/home/hero-desktop.*), ảnh chia
// sẻ link cũng tự cập nhật theo, không cần build lại (giống cách Hero.tsx đọc ảnh).
async function toDataUri(publicPath: string): Promise<string | null> {
  try {
    const ext = publicPath.split(".").pop()?.toLowerCase();
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    const bytes = await readFile(join(process.cwd(), "public", publicPath));
    return `data:${mime};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image() {
  const { desktop, mobile } = getHeroImages();
  // Ảnh nền OG là khung ngang (1200×630) nên ưu tiên bản desktop (cũng ngang) — bản
  // mobile (dọc) chỉ dùng khi chưa có bản desktop.
  const heroPath = (desktop ?? mobile)?.split("?")[0] ?? null; // bỏ "?v=..." (chỉ để phá cache trình duyệt, không phải đường dẫn file thật)
  const [heroSrc, logoSrc] = await Promise.all([
    heroPath ? toDataUri(heroPath) : Promise.resolve(null),
    toDataUri("/images/logo/logo-white.png"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a09",
          position: "relative",
        }}
      >
        {heroSrc ? (
          // objectFit "contain" — hiện TRỌN VẸN ảnh hero, không cắt xén, phần thừa
          // (nếu tỉ lệ khung ảnh khác 1200×630) tự lấp bằng màu nền đen thương hiệu.
          <img src={heroSrc} width={size.width} height={size.height} style={{ objectFit: "contain" }} />
        ) : (
          <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: 4, color: "#ffffff" }}>25 O&apos;CLOCK</div>
        )}

        {logoSrc && heroSrc ? (
          <div
            style={{
              position: "absolute",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(10,10,9,0.82)",
              padding: "28px 56px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (next/og) cần thẻ <img> thường, không dùng next/image được */}
            <img src={logoSrc} height={56} style={{ objectFit: "contain" }} />
          </div>
        ) : null}
      </div>
    ),
    { ...size },
  );
}
