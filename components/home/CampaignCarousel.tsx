"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

const SCROLL_SPEED = 0.6; // px/khung hình (~36px/s ở 60fps) — chạy liên tục kiểu marquee
const DRAG_CLICK_THRESHOLD = 6; // px — di chuyển ít hơn mức này khi thả chuột thì tính là bấm, không phải kéo

export function CampaignCarousel({ images, basePath = "/campaign" }: { images: string[]; basePath?: string }) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const interacting = useRef(false); // true trong lúc đang thực sự bấm/kéo — tick() sẽ bỏ qua bước tự chạy
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const movedDistance = useRef(0);
  const pressedIndex = useRef<number | null>(null);

  // Nhân đôi danh sách ảnh để cuộn liên tục không bị "giật" khi lặp lại.
  const loop = images.length > 1 ? [...images, ...images] : images;

  // Tự chạy liên tục, vĩnh viễn. Chỉ tạm bỏ qua bước tăng vị trí trong đúng lúc
  // người dùng đang bấm/kéo, rồi tiếp tục ngay khi thả ra.
  useEffect(() => {
    if (images.length <= 1) return;
    function tick() {
      const el = trackRef.current;
      if (el && !interacting.current) {
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 1) {
          el.scrollLeft -= el.scrollWidth / 2;
        } else {
          el.scrollLeft += SCROLL_SPEED;
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [images.length]);

  // Không dùng thẻ <a>/<Link> cho từng ảnh — thẻ link có thể tự kích hoạt kéo-thả
  // gốc của trình duyệt, tranh chấp với code kéo tự viết dưới đây (gây ra cả lỗi
  // "kéo không được" lẫn "bấm không vào trang"). Thay vào đó tự điều hướng bằng
  // router.push() sau khi xác định chắc chắn đây là 1 cú bấm, không phải kéo.
  function onPointerDown(e: React.PointerEvent, index: number) {
    const el = trackRef.current;
    if (!el) return;
    interacting.current = true;
    movedDistance.current = 0;
    pressedIndex.current = index;
    dragStartX.current = e.clientX;
    dragStartScroll.current = el.scrollLeft;
    el.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!interacting.current) return;
    const el = trackRef.current;
    if (!el) return;
    const delta = e.clientX - dragStartX.current;
    movedDistance.current = Math.abs(delta);
    el.scrollLeft = dragStartScroll.current - delta;
  }
  function onPointerUp() {
    interacting.current = false;
    const wasClick = movedDistance.current <= DRAG_CLICK_THRESHOLD;
    const index = pressedIndex.current;
    pressedIndex.current = null;
    if (wasClick && index !== null) {
      router.push(`${basePath}?start=${index % images.length}`);
    }
  }

  if (images.length === 0) return null;

  return (
    <div
      ref={trackRef}
      className="no-scrollbar flex cursor-grab gap-2 overflow-x-auto select-none active:cursor-grabbing"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onDragStart={(e) => e.preventDefault()}
    >
      {loop.map((src, i) => (
        <div
          key={`${src}-${i}`}
          onPointerDown={(e) => onPointerDown(e, i)}
          className="relative aspect-[3/4] w-[260px] shrink-0 overflow-hidden bg-bg-alt"
        >
          <Image
            src={src}
            alt={`Campaign khách hàng ${(i % images.length) + 1}`}
            fill
            sizes="260px"
            draggable={false}
            className="pointer-events-none object-cover"
          />
        </div>
      ))}
    </div>
  );
}
