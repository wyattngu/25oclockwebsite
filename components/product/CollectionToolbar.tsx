"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/Drawer";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "bestseller", label: "Bán chạy" },
];

const SIZE_OPTIONS = ["S", "M", "L", "XL"];

type Props = {
  resultCount: number;
  sort: string;
  sizes: string[];
  inStock: boolean;
};

export function CollectionToolbar({ resultCount, sort, sizes, inStock }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [filterOpen, setFilterOpen] = useState(false);
  // state nháp bên trong drawer, chỉ áp dụng vào URL khi bấm "Xem kết quả"
  const [draftSizes, setDraftSizes] = useState<string[]>(sizes);
  const [draftInStock, setDraftInStock] = useState(inStock);

  function buildUrl(next: { sort?: string; sizes?: string[]; inStock?: boolean }) {
    const params = new URLSearchParams();
    const nextSort = next.sort ?? sort;
    const nextSizes = next.sizes ?? sizes;
    const nextInStock = next.inStock ?? inStock;
    if (nextSort !== "newest") params.set("sort", nextSort);
    nextSizes.forEach((s) => params.append("size", s));
    if (nextInStock) params.set("instock", "1");
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function setSort(value: string) {
    router.push(buildUrl({ sort: value }), { scroll: false });
  }

  function toggleDraftSize(size: string) {
    setDraftSizes((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  }

  function applyFilters() {
    router.push(buildUrl({ sizes: draftSizes, inStock: draftInStock }), { scroll: false });
    setFilterOpen(false);
  }

  function clearFilters() {
    setDraftSizes([]);
    setDraftInStock(false);
    router.push(buildUrl({ sizes: [], inStock: false }), { scroll: false });
    setFilterOpen(false);
  }

  const activeFilterCount = sizes.length + (inStock ? 1 : 0);

  return (
    <div>
      <div className="flex items-center justify-between border-y border-line py-3">
        <span className="text-[13px] text-ink-60">{resultCount} sản phẩm</span>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => {
              setDraftSizes(sizes);
              setDraftInStock(inStock);
              setFilterOpen(true);
            }}
            className="nav-link"
          >
            Bộ lọc{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </button>
          <label className="flex items-center gap-1.5">
            <span className="nav-link text-ink-60">Sắp xếp:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="nav-link cursor-pointer border-0 bg-transparent focus:outline-none"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <Drawer isOpen={filterOpen} onClose={() => setFilterOpen(false)} side="bottom" title="Bộ lọc">
        <div className="space-y-6 p-5">
          <div>
            <h3 className="nav-link mb-3">Size</h3>
            <div className="flex flex-wrap gap-2">
              {SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleDraftSize(size)}
                  className={`h-10 min-w-10 border px-3 text-[13px] transition-colors ${
                    draftSizes.includes(size) ? "border-ink bg-ink text-white" : "border-line text-ink"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-[14px]">
            <input
              type="checkbox"
              checked={draftInStock}
              onChange={(e) => setDraftInStock(e.target.checked)}
              className="h-4 w-4 accent-black"
            />
            Chỉ hiện sản phẩm còn hàng
          </label>
          <div className="flex gap-3 pt-2 pb-4">
            <button type="button" onClick={clearFilters} className="nav-link flex-1 border border-ink py-3">
              Xoá lọc
            </button>
            <button type="button" onClick={applyFilters} className="nav-link flex-1 bg-ink py-3 text-white">
              Xem kết quả
            </button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
