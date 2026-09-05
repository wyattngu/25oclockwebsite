import type { Metadata } from "next";
import { searchProducts } from "@/lib/data/products";
import { withPhotosList } from "@/lib/utils/productImages";
import { LoadMoreGrid } from "@/components/product/LoadMoreGrid";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return { title: q ? `Kết quả cho "${q}"` : "Tìm kiếm" };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const results = withPhotosList(searchProducts(q));

  return (
    <div className="container-25 py-8 md:py-12">
      <header className="mb-8 text-center">
        <h1 className="text-[22px] font-medium uppercase tracking-[0.06em] md:text-[28px]">Kết quả tìm kiếm</h1>
        {q ? (
          <p className="mt-2 text-[14px] text-ink-60">
            {results.length} sản phẩm cho “{q}”
          </p>
        ) : (
          <p className="mt-2 text-[14px] text-ink-60">Nhập từ khoá để tìm sản phẩm.</p>
        )}
      </header>
      <LoadMoreGrid products={results} />
    </div>
  );
}
