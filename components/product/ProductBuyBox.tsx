"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { useCart } from "@/lib/store/cart-context";
import { formatPrice } from "@/lib/utils/formatPrice";
import { SizeGuideDrawer } from "@/components/product/SizeGuideDrawer";
import { Button } from "@/components/ui/Button";
import { IconMinus, IconPlus } from "@/components/ui/icons";

export function ProductBuyBox({ product, initialVariantId }: { product: Product; initialVariantId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart } = useCart();

  const defaultVariant =
    product.variants.find((v) => v.id === initialVariantId) ??
    product.variants.find((v) => v.available) ??
    product.variants[0];

  const [selectedId, setSelectedId] = useState(defaultVariant.id);
  const [quantity, setQuantity] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const addToCartRowRef = useRef<HTMLDivElement>(null);

  // Thanh mua nhanh dính đáy màn hình (chỉ mobile) — hiện ra khi hàng nút
  // "Thêm vào giỏ" gốc đã cuộn khỏi màn hình, để luôn có nút mua trong tầm tay.
  useEffect(() => {
    const el = addToCartRowRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedId) ?? defaultVariant,
    [product.variants, selectedId, defaultVariant],
  );

  function selectVariant(id: string) {
    setSelectedId(id);
    router.replace(`${pathname}?variant=${id}`, { scroll: false });
  }

  function handleAddToCart() {
    if (!selectedVariant.available) return;
    addToCart(product, selectedVariant, quantity);
  }

  function handleBuyNow() {
    if (!selectedVariant.available) return;
    addToCart(product, selectedVariant, quantity);
    router.push("/checkout");
  }

  const onSale = !!product.compareAtPrice && product.compareAtPrice.amount > product.price.amount;

  return (
    <div>
      <p className="mt-1 text-[13px] text-ink-60">SKU: {selectedVariant.sku}</p>
      <p className="mt-3 text-[16px] tabular-nums">
        {onSale && product.compareAtPrice ? (
          <>
            <span className="mr-2 text-ink-60 line-through">{formatPrice(product.compareAtPrice)}</span>
            <span className="text-sale">{formatPrice(product.price)}</span>
          </>
        ) : (
          formatPrice(product.price)
        )}
      </p>

      {/* Chọn size — nút vuông (mục 6.4.3) */}
      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="nav-link">Size</span>
          <button type="button" onClick={() => setSizeGuideOpen(true)} className="text-[12px] underline underline-offset-2">
            Hướng dẫn chọn size
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {product.variants.map((v) => {
            const isSelected = v.id === selectedVariant.id;
            return (
              <button
                key={v.id}
                type="button"
                disabled={!v.available}
                onClick={() => selectVariant(v.id)}
                aria-pressed={isSelected}
                className={`relative h-11 min-w-11 border px-3 text-[13px] transition-colors ${
                  isSelected ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-ink"
                } ${!v.available ? "text-ink-60/50 pointer-events-none overflow-hidden" : ""}`}
              >
                {v.size}
                {!v.available ? (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-px w-[140%] rotate-[-20deg] bg-ink-60/40" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Số lượng + thêm vào giỏ */}
      <div ref={addToCartRowRef} className="mt-6 flex items-stretch gap-4 md:gap-3">
        <div className="flex items-center border border-line">
          <button
            type="button"
            aria-label="Giảm số lượng"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-12 w-10 items-center justify-center hover:bg-bg-alt"
          >
            <IconMinus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-[14px] tabular-nums">{quantity}</span>
          <button
            type="button"
            aria-label="Tăng số lượng"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="flex h-12 w-10 items-center justify-center hover:bg-bg-alt"
          >
            <IconPlus className="h-3.5 w-3.5" />
          </button>
        </div>
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={!selectedVariant.available}
          className="flex-1"
        >
          {selectedVariant.available ? "Thêm vào giỏ" : "Hết hàng"}
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        fullWidth
        onClick={handleBuyNow}
        disabled={!selectedVariant.available}
        className="mt-4 md:mt-3"
      >
        Mua ngay
      </Button>

      <SizeGuideDrawer
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
        sizeChart={product.sizeChart}
        modelInfo={product.modelInfo}
      />

      <AnimatePresence>
        {showStickyBar ? (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-line bg-bg px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] md:hidden"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium uppercase tracking-wide">{product.title}</p>
              <p className="text-[13px] tabular-nums text-ink-60">
                {formatPrice(product.price)} · Size {selectedVariant.size}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={!selectedVariant.available}
              className="shrink-0"
            >
              {selectedVariant.available ? "Thêm vào giỏ" : "Hết hàng"}
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
