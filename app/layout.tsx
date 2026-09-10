import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import { getT, getLocale } from "@/lib/i18n/locale";

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
    openGraph: {
      title: "25 O'Clock",
      description: t.site.ogDescription,
      type: "website",
      locale: locale === "en" ? "en_US" : "vi_VN",
    },
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
        <NextTopLoader color="#000000" height={2} showSpinner={false} shadow={false} />
        {children}
      </body>
    </html>
  );
}
