import type { Money, Product, ProductImage, ProductVariant, SizeChartRow, Tone } from "@/lib/types";

function vnd(amount: number): Money {
  return { amount, currencyCode: "VND" };
}

function images(tones: Tone[], labels: string[]): ProductImage[] {
  return tones.map((tone, i) => ({ id: `img-${i}`, tone, label: labels[i] ?? `ẢNH ${i + 1}` }));
}

const SIZE_SETS = {
  clothing: ["S", "M", "L", "XL"],
  denim: ["28", "29", "30", "31", "32"],
  onesize: ["FREESIZE"],
};

function makeVariants(
  handle: string,
  sizes: string[],
  price: Money,
  compareAtPrice: Money | undefined,
  unavailableSizes: string[] = [],
): ProductVariant[] {
  return sizes.map((size, i) => ({
    id: `${handle}-${size}`,
    size,
    price,
    compareAtPrice,
    available: !unavailableSizes.includes(size),
    sku: `25OC-${handle.toUpperCase()}-${size}`.slice(0, 24),
  }));
}

// Số đo thật, đo trên sản phẩm (bảng size chính thức của Sample 02 — chỉ có M/L).
const SAMPLE_02_SIZE_CHART: SizeChartRow[] = [
  { size: "M", length: "77 cm", width: "61 cm" },
  { size: "L", length: "82 cm", width: "64 cm" },
];

// Số đo thật, đo trên sản phẩm (bảng size chính thức của Midnight Bootcut).
const MIDNIGHT_SIZE_CHART: SizeChartRow[] = [
  { size: "0", waist: "78 cm", length: "105 cm", thigh: "32 cm", legOpening: "27 cm" },
  { size: "1", waist: "82 cm", length: "108 cm", thigh: "33 cm", legOpening: "28 cm" },
  { size: "2", waist: "88 cm", length: "112 cm", thigh: "34 cm", legOpening: "29 cm" },
];

const ECLIPSE_SIZE_CHART: SizeChartRow[] = [
  { size: "1", waist: "78 cm", length: "103 cm", thigh: "30 cm", legOpening: "24 cm" },
  { size: "2", waist: "82 cm", length: "105 cm", thigh: "31 cm", legOpening: "25 cm" },
  { size: "3", waist: "88 cm", length: "108 cm", thigh: "32 cm", legOpening: "26 cm" },
];
type RawProduct = {
  code: string;
  /** Tên sản phẩm đầy đủ, dùng nguyên văn làm title — không qua khuôn "25OC | <MÃ> <LOẠI>". */
  title: string;
  handle: string;
  category: Product["category"];
  tags: string[];
  price: number;
  compareAtPrice?: number;
  tones: Tone[];
  labels: string[];
  sizes: string[];
  sizeChart: SizeChartRow[];
  material: string;
  care: string;
  fit: Product["fit"];
  modelInfo: string;
  collections: string[];
  createdAt: string;
  descriptionVi: string;
  descriptionEn: string;
  /** Danh sách size hết hàng của riêng sản phẩm này — hiện gạch đỏ, không bấm chọn được. Xem hướng dẫn ngay phía trên mảng RAW bên dưới. */
  unavailableSizes?: string[];
  soldOut?: boolean;
  lastSizes?: boolean;
};

// Danh mục sản phẩm thật hiện có: 2 quần jeans (Bottoms) + 1 áo thun (Tops).
// Các collection khác (outerwear/accessories/leather/collab/sale) cố tình để trống —
// ProductGrid tự hiển thị "Không có sản phẩm nào phù hợp." khi rỗng.
//
// ── ĐÁNH DẤU 1 SIZE ĐÃ HẾT HÀNG (gạch đỏ, không bấm chọn được) ─────────────
// Tìm đúng sản phẩm bên dưới, thêm size đó (đúng chính tả như trong "sizes")
// vào mảng "unavailableSizes" của sản phẩm đó. Ví dụ MIDNIGHT BOOTCUT hết
// size "1": đổi `unavailableSizes: []` thành `unavailableSizes: ["1"]`.
// Hết nhiều size thì liệt kê thoải mái: `unavailableSizes: ["1", "2"]`.
// Muốn mở bán lại — xoá size đó ra khỏi mảng (hoặc để lại `[]`) là xong,
// không cần sửa gì khác.
const RAW: RawProduct[] = [
  {
    code: "MBC",
    title: "MIDNIGHT BOOTCUT RAW DENIM PANT",
    handle: "midnight-bootcut-raw-denim-pant",
    category: "Bottoms",
    tags: ["denim", "raw", "bootcut"],
    price: 790000,
    tones: ["charcoal", "ink", "charcoal", "stone"],
    labels: ["FRONT", "ON MODEL", "BACK", "DETAIL"],
    sizes: ["0", "1", "2"],
    unavailableSizes: [], // ví dụ: ["1"] nếu hết size 1
    sizeChart: MIDNIGHT_SIZE_CHART,
    material: "Raw denim 14oz, 100% cotton",
    care: "Hạn chế giặt trong 3–6 tháng đầu để lên form và bạc màu tự nhiên — Không giặt máy, không dùng chất tẩy mạnh / Avoid washing for the first 3–6 months to let the denim break in — avoid machine washing and harsh detergents",
    fit: "Regular",
    modelInfo: "Model cao 1m78, nặng 65kg, mặc size 1",
    collections: ["all", "bottoms", "new"],
    createdAt: "2026-08-28",
    descriptionVi:
      "Quần jean raw denim dáng bootcut, ống loe nhẹ từ đầu gối trở xuống, màu xanh đen (midnight) đặc trưng của vải nguyên bản chưa qua xử lý giặt mài. Form dáng cổ điển, phù hợp phối cùng boots hoặc giày da.",
    descriptionEn:
      "Bootcut raw denim jeans with a subtle flare from the knee down, in a deep midnight indigo unwashed denim. A classic silhouette that pairs well with boots or leather shoes.",
  },
  {
    code: "ECL",
    title: "ECLIPSE STRAIGHT RAW DENIM PANT",
    handle: "eclipse-straight-raw-denim-pant",
    category: "Bottoms",
    tags: ["denim", "raw", "straight"],
    price: 825000,
    tones: ["ink", "charcoal", "ink", "stone"],
    labels: ["FRONT", "ON MODEL", "BACK", "DETAIL"],
    sizes: ["1", "2", "3"],
    unavailableSizes: [], // ví dụ: ["1"] nếu hết size 1
    sizeChart: ECLIPSE_SIZE_CHART,
    material: "Raw denim 13oz, 100% cotton",
    care: "Hạn chế giặt trong 3–6 tháng đầu để lên form và bạc màu tự nhiên — Không giặt máy, không dùng chất tẩy mạnh / Avoid washing for the first 3–6 months to let the denim break in — avoid machine washing and harsh detergents",
    fit: "Regular",
    modelInfo: "Model cao 1m80, nặng 68kg, mặc size 2",
    collections: ["all", "bottoms", "new"],
    createdAt: "2026-08-30",
    descriptionVi:
      "Quần jean raw denim dáng straight ống đứng, màu xanh đen ánh tối (eclipse), vải denim nguyên bản chưa qua xử lý giúp lên màu và nếp gấp tự nhiên theo thời gian sử dụng.",
    descriptionEn:
      "Straight-leg raw denim jeans in a dark eclipse indigo wash. Unprocessed denim that develops natural fades and creases with wear.",
  },
  {
    code: "S02",
    title: "SAMPLE 02 T-SHIRT",
    handle: "sample-02-t-shirt",
    category: "Tops",
    tags: ["cotton", "tee", "sample"],
    price: 460000,
    tones: ["sand", "ink", "sand"],
    labels: ["FRONT", "ON MODEL", "DETAIL"],
    sizes: ["M", "L"],
    unavailableSizes: [], // ví dụ: ["M"] nếu hết size M
    sizeChart: SAMPLE_02_SIZE_CHART,
    material: "Cotton 220gsm",
    care: "Giặt máy nước lạnh, lộn trái trước khi giặt / Machine wash cold, inside out",
    fit: "Regular",
    modelInfo: "Model cao 1m78, nặng 65kg, mặc size M",
    collections: ["all", "tops", "new"],
    createdAt: "2026-08-25",
    descriptionVi:
      "Áo thun cotton 220gsm, phiên bản sample dùng để thử form dáng và chất liệu trước khi sản xuất đại trà. Form regular, dễ phối cùng denim hoặc quần vải.",
    descriptionEn:
      "220gsm cotton tee — a sample run used to test fit and fabric ahead of full production. Regular fit, easy to pair with denim or trousers.",
  },
  {
    code: "OLF",
    title: '"OLF" SHADOW FLIP BEANIE',
    handle: "olf-shadow-flip-beanie",
    category: "Accessories",
    tags: ["beanie", "accessory", "knit"],
    price: 360000,
    tones: ["ink", "stone", "ink"],
    labels: ["FRONT", "ON MODEL", "DETAIL"],
    sizes: SIZE_SETS.onesize,
    unavailableSizes: [], // freesize nên chỉ có 1 size — hết hàng thì dùng "soldOut: true" ở dưới thay vì mục này
    sizeChart: [],
    // TODO: cập nhật đúng chất liệu/hướng dẫn bảo quản thật khi có — để tạm tránh ghi sai thông tin.
    material: "Đang cập nhật",
    care: "Đang cập nhật",
    fit: "Regular",
    modelInfo: "Freesize, phù hợp với đa số vòng đầu.",
    collections: ["all", "accessories", "new"],
    createdAt: "2026-09-04",
    descriptionVi:
      "Beanie form basic, đường phối \"flip\" gập vành đặc trưng. Freesize, dễ phối cùng nhiều outfit. (Mô tả tạm — cập nhật khi có thông tin đầy đủ.)",
    descriptionEn:
      'Basic-fit beanie with a signature "flip" folded brim. One size, easy to pair with most outfits. (Placeholder description — update once full details are available.)',
  },
];

export const products: Product[] = RAW.map((r) => {
  const price = vnd(r.price);
  const compareAtPrice = r.compareAtPrice ? vnd(r.compareAtPrice) : undefined;
  return {
    id: r.handle,
    handle: r.handle,
    title: r.title,
    code: r.code,
    category: r.category,
    tags: r.tags,
    images: images(r.tones, r.labels),
    variants: makeVariants(r.handle, r.sizes, price, compareAtPrice, r.unavailableSizes),
    price,
    compareAtPrice,
    descriptionVi: r.descriptionVi,
    descriptionEn: r.descriptionEn,
    material: r.material,
    care: r.care,
    madeIn: "Việt Nam",
    fit: r.fit,
    modelInfo: r.modelInfo,
    sizeChart: r.sizeChart,
    collections: r.collections,
    createdAt: r.createdAt,
    soldOut: r.soldOut,
    lastSizes: r.lastSizes,
  };
});

export function getAllProducts(): Product[] {
  return products;
}

export function getProductByHandle(handle: string): Product | undefined {
  return products.find((p) => p.handle === handle);
}

export function getProductsByCollection(handle: string): Product[] {
  if (handle === "all") return products;
  return products.filter((p) => p.collections.includes(handle));
}

export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter((p) => p.handle !== product.handle && p.category === product.category)
    .slice(0, limit);
}

export function searchProducts(query: string, limit?: number): Product[] {
  const q = normalize(query);
  if (!q) return [];
  const results = products.filter((p) => {
    const haystack = normalize(`${p.title} ${p.code} ${p.category} ${p.tags.join(" ")}`);
    return haystack.includes(q);
  });
  return typeof limit === "number" ? results.slice(0, limit) : results;
}

/** Bỏ dấu tiếng Việt để tìm kiếm không dấu (mục 6.9). */
export function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .trim();
}
