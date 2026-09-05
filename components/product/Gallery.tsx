"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { ProductImage } from "@/lib/types";
import { Placeholder } from "@/components/ui/Placeholder";
import { ImageLightbox } from "@/components/product/ImageLightbox";

type Props = {
  /** Ảnh thật (đã đọc từ public/images/products/<handle>/ ở page.tsx). */
  photos?: string[];
  /** Placeholder theo tông màu — dùng khi chưa có ảnh thật. */
  images: ProductImage[];
  code: string;
  alt: string;
};

const GALLERY_SIZES = "(max-width: 767px) 100vw, 60vw";

export function Gallery({ photos = [], images, code, alt }: Props) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasPhotos = photos.length > 0;
  const count = hasPhotos ? photos.length : images.length;

  function onScroll() {
    const el = containerRef.current;
    if (!el || el.clientWidth === 0) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  }

  function openLightbox(index: number) {
    if (!hasPhotos) return; // Không có gì để phóng to trên placeholder màu.
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function renderFrame(index: number) {
    if (hasPhotos) {
      return (
        <button
          type="button"
          onClick={() => openLightbox(index)}
          aria-label={`Phóng to ảnh ${index + 1}`}
          className="relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden bg-bg-alt"
        >
          <Image
            src={photos[index]}
            alt={`${alt} — ảnh ${index + 1}`}
            fill
            sizes={GALLERY_SIZES}
            priority={index === 0}
            className="object-cover"
          />
        </button>
      );
    }
    const img = images[index];
    return <Placeholder tone={img.tone} label={img.label} title={index === 0 ? code : undefined} ratio="3 / 4" />;
  }

  return (
    <div>
      {/* Mobile: carousel vuốt ngang, chấm chỉ số (mục 6.4) */}
      <div className="md:hidden">
        <div
          ref={containerRef}
          onScroll={onScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
        >
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="w-full shrink-0 snap-start">
              {renderFrame(i)}
            </div>
          ))}
        </div>
        {count > 1 ? (
          <div className="mt-3 flex justify-center gap-1.5">
            {Array.from({ length: count }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${i === active ? "bg-ink" : "bg-line"}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* Desktop: gallery cuộn dọc xếp chồng, không phải carousel (mục 6.4) */}
      <div className="hidden md:flex md:flex-col md:gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i}>{renderFrame(i)}</div>
        ))}
      </div>

      {hasPhotos ? (
        <ImageLightbox
          photos={photos}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          alt={alt}
        />
      ) : null}
    </div>
  );
}
