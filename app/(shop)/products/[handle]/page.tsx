import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProducts, getProductByHandle, getRelatedProducts } from "@/lib/data/products";
import { getProductPhotos, withPhotosList } from "@/lib/utils/productImages";
import { company } from "@/lib/data/company";
import { formatPrice } from "@/lib/utils/formatPrice";
import { Gallery } from "@/components/product/Gallery";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { Accordion } from "@/components/ui/Accordion";
import { ShareButtons } from "@/components/product/ShareButtons";
import { RelatedProducts } from "@/components/product/RelatedProducts";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ variant?: string }>;
};

export async function generateStaticParams() {
  return getAllProducts().map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;
  const product = getProductByHandle(handle);
  if (!product) return {};
  // Chưa có ảnh thật thì không set openGraph.images ở đây — trang sẽ tự dùng ảnh
  // mặc định của (shop)/opengraph-image.tsx (logo thương hiệu) thay vì để trống.
  const photos = getProductPhotos(product.handle);
  return {
    title: product.title,
    description: product.descriptionVi,
    openGraph: photos[0] ? { images: [{ url: photos[0] }] } : undefined,
    twitter: photos[0] ? { card: "summary_large_image", images: [photos[0]] } : undefined,
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const { variant } = await searchParams;
  const product = getProductByHandle(handle);
  if (!product) notFound();

  const related = withPhotosList(getRelatedProducts(product));
  const photos = getProductPhotos(product.handle);
  const selectedVariant = product.variants.find((v) => v.id === variant) ?? product.variants[0];
  const canonicalUrl = `https://25oclock.vn/products/${product.handle}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    sku: selectedVariant.sku,
    description: product.descriptionVi,
    brand: { "@type": "Brand", name: "25 O'Clock" },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: selectedVariant.price.currencyCode,
      price: selectedVariant.price.amount,
      availability: selectedVariant.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="container-25 py-6 md:py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />

      <nav className="mb-4 text-[12px] text-ink-60">
        <Link href="/" className="hover:text-ink">
          Trang chủ
        </Link>{" "}
        /{" "}
        <Link href={`/collections/${product.collections[1] ?? "all"}`} className="hover:text-ink">
          {product.category}
        </Link>{" "}
        / <span className="text-ink">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-[60%_40%] md:gap-12">
        <Gallery photos={photos} images={product.images} code={product.code} alt={product.title} />

        <div className="md:sticky md:top-[calc(var(--chrome-h,96px)+24px)] md:max-h-[calc(100svh-var(--chrome-h,96px)-48px)] md:self-start md:overflow-y-auto">
          <h1 className="text-[20px] font-medium uppercase leading-snug tracking-[0.03em] md:text-[24px]">
            {product.title}
          </h1>

          <ProductBuyBox product={product} initialVariantId={variant} />

          <div className="mt-8">
            <Accordion
              defaultOpenIndex={0}
              items={[
                {
                  heading: "Chi tiết",
                  content: (
                    <div className="space-y-3">
                      <ul className="mt-2 space-y-1 text-ink-60">
                        <li>Chất liệu: {product.material}</li>
                        <li>Form dáng: {product.fit}</li>
                        <li>Sản xuất tại: {product.madeIn}</li>
                      </ul>
                      {product.details?.length ? (
                        <ul className="mt-3 list-disc space-y-1 pl-4 text-ink-60">
                          {product.details.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ),
                },
                {
                  heading: "Bảo quản",
                  content: <p>{product.care}</p>,
                },
                {
                  heading: "Vận chuyển & đổi trả",
                  content: (
                    <div className="space-y-2">
                      <p>
                        Giao nội thành 1–2 ngày, tỉnh thành khác 2–4 ngày. Miễn phí ship cho đơn từ{" "}
                        {formatPrice({ amount: company.freeShippingThreshold, currencyCode: "VND" })}.
                      </p>
                      <p>Đổi trả trong {company.returnWindowDays} ngày nếu còn nguyên tem, chưa qua sử dụng.</p>
                      <Link href="/pages/shipping-returns" className="inline-block underline underline-offset-2">
                        Xem chính sách đầy đủ
                      </Link>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          <div className="mt-6">
            <ShareButtons url={canonicalUrl} title={product.title} />
          </div>
        </div>
      </div>

      <RelatedProducts products={related} />
    </div>
  );
}
