import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { getT, getLocale } from "@/lib/i18n/locale";
import { company } from "@/lib/data/company";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  const locale = await getLocale();
  return {
    metadataBase: new URL("https://25oclockhome.com"),
    title: {
      default: t.site.titleDefault,
      template: "%s · 25 O'Clock",
    },
    description: t.site.description,
    // Canonical cho trang chủ — tránh Google coi "/" và "/?utm_..." (link quảng cáo/mạng
    // xã hội có tham số theo dõi) là 2 trang nội dung trùng nhau.
    alternates: { canonical: "/" },
    openGraph: {
      title: "25 O'Clock",
      description: t.site.ogDescription,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
    },
  };
}

/**
 * JSON-LD "Organization" — giúp Google hiểu đây là 1 thương hiệu thật (không phải chỉ
 * 1 trang web bất kỳ), gắn tên "25 O'Clock" với đúng domain này. "alternateName" liệt
 * kê các cách gõ khác của tên thương hiệu (không dấu, viết liền...) — tăng khả năng
 * khớp khi khách tìm "25oclock" thay vì gõ đúng "25 O'Clock". "sameAs" trỏ sang
 * Instagram chính chủ — Google dùng để xác thực đây đúng là cùng 1 thương hiệu, không
 * phải hàng giả/trang giả mạo (nhất là khi có vài cái tên gần giống đã tồn tại sẵn).
 */
function organizationJsonLd(locale: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "25 O'Clock",
    alternateName: ["25oclock", "25 oclock", "25OClock", "25oclock.home"],
    url: "https://25oclockhome.com",
    logo: "https://25oclockhome.com/images/logo/logo-black.png",
    description:
      locale === "en"
        ? "25 O'Clock — a denim and genuine leather label, made in Vietnam."
        : "25 O'Clock — thương hiệu thời trang denim & da thật, sản xuất tại Việt Nam.",
    sameAs: [company.instagram.url],
  };
}

/**
 * Layout gốc — chỉ dựng khung <html>/<body> + font. Chrome của cửa hàng (Header,
 * Footer, CartDrawer) nằm ở app/(shop)/layout.tsx; trang quản trị có khung riêng
 * ở app/admin/layout.tsx — để trang admin không hiện giỏ hàng/menu khách hàng.
 */
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={inter.variable}>
      <body>
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd(locale)) }} />
        <NextTopLoader color="#000000" height={2} showSpinner={false} shadow={false} />
        {children}
      </body>
    </html>
  );
}
