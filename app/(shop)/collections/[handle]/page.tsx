import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections, getCollectionByHandle } from "@/lib/data/collections";
import { getProductsByCollection } from "@/lib/data/products";
import { withPhotosList } from "@/lib/utils/productImages";
import type { Product } from "@/lib/types";
import { CollectionToolbar } from "@/components/product/CollectionToolbar";
import { LoadMoreGrid } from "@/components/product/LoadMoreGrid";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateStaticParams() {
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const collection = getCollectionByHandle(handle);
  if (!collection) return {};
  return {
    title: collection.title,
    description: collection.description,
  };
}

function sortProducts(items: Product[], sort: string): Product[] {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price.amount - b.price.amount);
    case "price-desc":
      return copy.sort((a, b) => b.price.amount - a.price.amount);
    case "bestseller":
      // Chưa có dữ liệu bán chạy thật (cần nối Shopify orders) — tạm ưu tiên dòng mainline.
      return copy.sort((a, b) => Number(b.tags.includes("mainline")) - Number(a.tags.includes("mainline")));
    default:
      return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const sp = await searchParams;
  const collection = getCollectionByHandle(handle);
  if (!collection) notFound();

  const sort = typeof sp.sort === "string" ? sp.sort : "newest";
  const sizeParam = sp.size;
  const sizes = Array.isArray(sizeParam) ? sizeParam : sizeParam ? [sizeParam] : [];
  const inStock = sp.instock === "1";

  let items = getProductsByCollection(handle);

  if (sizes.length > 0) {
    items = items.filter((p) => p.variants.some((v) => sizes.includes(v.size) && (!inStock || v.available)));
  } else if (inStock) {
    items = items.filter((p) => p.variants.some((v) => v.available));
  }

  items = withPhotosList(sortProducts(items, sort));

  return (
    <div className="container-25 py-8 md:py-12">
      <header className="mb-6 border-b border-line pb-6 text-center">
        <h1 className="text-[22px] font-medium uppercase tracking-[0.06em] md:text-[28px]">{collection.title}</h1>
        {collection.description ? <p className="mx-auto mt-2 max-w-xl text-[14px] text-ink-60">{collection.description}</p> : null}
      </header>
      <CollectionToolbar resultCount={items.length} sort={sort} sizes={sizes} inStock={inStock} />
      <div className="pt-8">
        <LoadMoreGrid products={items} />
      </div>
    </div>
  );
}
