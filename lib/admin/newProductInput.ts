import type { SizeChartRow } from "@/lib/types";

/**
 * Dữ liệu form "Thêm sản phẩm" ở /admin/products/new — dùng chung giữa component
 * form (client) và route xử lý (server), nên file này KHÔNG được import bất cứ gì
 * chỉ chạy được ở server (node:fs, node:buffer...).
 */
export type NewProductInput = {
  title: string;
  code: string;
  /** Để trống thì server tự tạo từ title. */
  handle?: string;
  category: "Tops" | "Bottoms" | "Outerwear" | "Accessories";
  /** Chuỗi, cách nhau bởi dấu phẩy — ví dụ "denim, raw, bootcut". */
  tags: string;
  price: number;
  compareAtPrice?: number;
  /** Chuỗi, cách nhau bởi dấu phẩy — ví dụ "S, M, L, XL". */
  sizes: string;
  /** Chuỗi, cách nhau bởi dấu phẩy — các size trong "sizes" đã hết hàng. */
  unavailableSizes: string;
  sizeChart: SizeChartRow[];
  material: string;
  materialEn: string;
  care: string;
  careEn: string;
  fit: "Slim" | "Regular" | "Oversized";
  modelInfo: string;
  modelInfoEn: string;
  /** Có hiện trong mục "Hàng mới về" không — "all" + danh mục theo "category" luôn tự thêm. */
  isNewArrival: boolean;
  descriptionVi: string;
  descriptionEn: string;
  /** Mỗi dòng là 1 gạch đầu dòng. */
  details: string;
  detailsEn: string;
  soldOut: boolean;
  lastSizes: boolean;
};
