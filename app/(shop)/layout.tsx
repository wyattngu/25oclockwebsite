import { cookies } from "next/headers";
import { CartProvider } from "@/lib/store/cart-context";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AddedToast } from "@/components/cart/AddedToast";
import { FloatingInstagram } from "@/components/layout/FloatingInstagram";
import { MainOffset } from "@/components/layout/MainOffset";
import { PageTransition } from "@/components/layout/PageTransition";
import { CursorSparkles } from "@/components/effects/CursorSparkles";
import { CUSTOMER_COOKIE_NAME, verifySessionToken } from "@/lib/auth/customer";
import { navCollections } from "@/lib/data/collections";
import { getCollectionCovers } from "@/lib/utils/collectionImages";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  // Chỉ kiểm tra chữ ký cookie (không gọi DB) — đủ để biết còn đăng nhập hay không,
  // hiển thị đúng icon tài khoản trên Header ở mọi trang.
  const store = await cookies();
  const isLoggedIn = Boolean(verifySessionToken(store.get(CUSTOMER_COOKIE_NAME)?.value));
  const collectionCovers = getCollectionCovers(navCollections.map((c) => c.handle));

  return (
    <CartProvider>
      <Header isLoggedIn={isLoggedIn} collectionCovers={collectionCovers} />
      <MainOffset>
        <PageTransition>{children}</PageTransition>
      </MainOffset>
      <Footer />
      <CartDrawer />
      <AddedToast />
      <FloatingInstagram />
      <CursorSparkles />
    </CartProvider>
  );
}
