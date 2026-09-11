import { cookies } from "next/headers";
import { CartProvider } from "@/lib/store/cart-context";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getLocale, hasChosenLocale } from "@/lib/i18n/locale";
import { LanguagePopup } from "@/components/layout/LanguagePopup";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AddedToast } from "@/components/cart/AddedToast";
import { FloatingInstagram } from "@/components/layout/FloatingInstagram";
import { MainOffset } from "@/components/layout/MainOffset";
import { PageTransition } from "@/components/layout/PageTransition";
import { NavigationHistoryTracker } from "@/components/layout/NavigationHistoryTracker";
import { CursorSparkles } from "@/components/effects/CursorSparkles";
import { CUSTOMER_COOKIE_NAME, verifySessionToken } from "@/lib/auth/customer";
import { navCollections } from "@/lib/data/collections";
import { getAllProducts } from "@/lib/data/products";
import { getCollectionCovers } from "@/lib/utils/collectionImages";
import { getProductPhotosMap } from "@/lib/utils/productImages";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  // Chỉ kiểm tra chữ ký cookie (không gọi DB) — đủ để biết còn đăng nhập hay không,
  // hiển thị đúng icon tài khoản trên Header ở mọi trang.
  const store = await cookies();
  const isLoggedIn = Boolean(verifySessionToken(store.get(CUSTOMER_COOKIE_NAME)?.value));
  const collectionCovers = getCollectionCovers(navCollections.map((c) => c.handle));
  // Đọc trước ảnh thật của tất cả sản phẩm ở server, truyền xuống cho ô tìm
  // kiếm (chạy ở client, không tự đọc file ảnh được) — xem SearchOverlay.tsx.
  const productPhotos = getProductPhotosMap(getAllProducts().map((p) => p.handle));
  const locale = await getLocale();
  const localeChosen = await hasChosenLocale();

  return (
    <LocaleProvider initialLocale={locale} initialHasChosen={localeChosen}>
      <CartProvider>
        <NavigationHistoryTracker />
        <LanguagePopup />
        <Header isLoggedIn={isLoggedIn} collectionCovers={collectionCovers} productPhotos={productPhotos} />
        <MainOffset>
          <PageTransition>{children}</PageTransition>
        </MainOffset>
        <Footer />
        <CartDrawer />
        <AddedToast />
        <FloatingInstagram />
        <CursorSparkles />
      </CartProvider>
    </LocaleProvider>
  );
}
