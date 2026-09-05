import type { Product } from "@/lib/types";
import { ProductGrid } from "@/components/product/ProductGrid";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="container-25 py-16 md:py-24">
      <h2 className="mb-8 text-[20px] font-medium uppercase tracking-[0.06em] md:text-[24px]">Sản phẩm liên quan</h2>
      <ProductGrid products={products} />
    </section>
  );
}
