import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://25oclock.vn"),
  title: {
    default: "25 O'Clock — Thời trang denim & da thật",
    template: "%s · 25 O'Clock",
  },
  description:
    "25 o'clock — thương hiệu thời trang denim & da thật, sản xuất tại Việt Nam. Gallery tối giản, sản phẩm là nhân vật chính.",
  openGraph: {
    title: "25 O'Clock",
    description: "Thời trang denim & da thật, sản xuất tại Việt Nam.",
    type: "website",
    locale: "vi_VN",
  },
};

/**
 * Layout gốc — chỉ dựng khung <html>/<body> + font. Chrome của cửa hàng (Header,
 * Footer, CartDrawer) nằm ở app/(shop)/layout.tsx; trang quản trị có khung riêng
 * ở app/admin/layout.tsx — để trang admin không hiện giỏ hàng/menu khách hàng.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>
        <NextTopLoader color="#000000" height={2} showSpinner={false} shadow={false} />
        {children}
      </body>
    </html>
  );
}
