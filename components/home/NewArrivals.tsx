import Link from "next/link";
import { getAllProducts } from "@/lib/data/products";
import { withPhotosList } from "@/lib/utils/productImages";
import { ProductGrid } from "@/components/product/ProductGrid";
import { TextReveal } from "@/components/ui/TextReveal";

export function NewArrivals() {
  const newest = withPhotosList(
    [...getAllProducts()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8),
  );

  return (
    <section className="container-25 py-16 md:py-24">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-[20px] font-medium uppercase tracking-[0.06em] md:text-[24px]">
          <TextReveal text="Sản phẩm mới" />
        </h2>
        <Link href="/collections/all" className="nav-link hidden underline underline-offset-4 sm:inline">
          Xem tất cả
        </Link>
      </div>
      <ProductGrid products={newest} />
      <div className="mt-8 flex justify-center sm:hidden">
        <Link href="/collections/all" className="nav-link underline underline-offset-4">
          Xem tất cả
        </Link>
      </div>
    </section>
  );
}
