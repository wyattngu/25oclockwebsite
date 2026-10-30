import type { NewProductInput } from "@/lib/admin/newProductInput";

/**
 * Sản phẩm của web KHÔNG nằm trong database — nằm thẳng trong code, ở
 * lib/data/products.ts (mảng RAW). Trang "Thêm sản phẩm" ở /admin/products/new
 * (xem app/api/admin/products/new/route.ts) không ghi được vào ổ đĩa lúc chạy
 * thật trên Vercel (filesystem chỉ đọc), nên thay vào đó TỰ COMMIT 1 sản phẩm
 * mới thẳng vào file này trên GitHub qua API — Vercel đã nối sẵn với GitHub nên
 * tự động build + deploy lại sau khi commit xong (khoảng 1-2 phút).
 *
 * Cần biến môi trường GITHUB_TOKEN (Personal Access Token, quyền ghi nội dung
 * repo này) — xem hướng dẫn tạo trong .env.local.example.
 */

const OWNER = "wyattngu";
const REPO = "25oclockwebsite";
const BRANCH = "main";
const FILE_PATH = "lib/data/products.ts";

// Ngay sau dòng đóng mảng RAW, trước khi RAW được map thành "products" — xem
// lib/data/products.ts. Chuỗi này chỉ xuất hiện đúng 1 lần trong file, dùng làm
// điểm neo để chèn sản phẩm mới vào NGAY TRƯỚC dấu "];" đóng mảng.
const ARRAY_END_ANCHOR = "\n];\n\nexport const products: Product[] = RAW.map";

export class GithubProductsError extends Error {
  constructor(
    message: string,
    public code:
      | "missing_token"
      | "fetch_failed"
      | "anchor_not_found"
      | "invalid_input"
      | "commit_failed",
  ) {
    super(message);
  }
}

function githubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new GithubProductsError("Chưa cấu hình GITHUB_TOKEN", "missing_token");
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function fetchProductsFile(): Promise<{ content: string; sha: string }> {
  const res = await fetch(
    `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`,
    { headers: githubHeaders(), cache: "no-store" },
  );
  if (!res.ok) {
    throw new GithubProductsError(`Không đọc được file từ GitHub (${res.status})`, "fetch_failed");
  }
  const data: { content: string; sha: string } = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf8");
  return { content, sha: data.sha };
}

async function commitProductsFile(content: string, sha: string, message: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}`, {
    method: "PUT",
    headers: { ...githubHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      sha,
      branch: BRANCH,
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new GithubProductsError(`Commit lên GitHub thất bại (${res.status}): ${body.slice(0, 300)}`, "commit_failed");
  }
  const data: { commit?: { html_url?: string } } = await res.json().catch(() => ({}));
  return data.commit?.html_url ?? `https://github.com/${OWNER}/${REPO}/commits/${BRANCH}`;
}

/** Bỏ dấu tiếng Việt + chuẩn hoá thành URL handle, ví dụ "Áo Thun Basic" -> "ao-thun-basic". */
export function slugifyHandle(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractExistingHandles(content: string): Set<string> {
  const handles = new Set<string>();
  const re = /handle:\s*"([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content))) handles.add(m[1]);
  return handles;
}

function csvToList(input: string): string[] {
  return input
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function linesToList(input: string): string[] {
  return input
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function orUndefined(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

// Danh mục hiển thị (/collections/<handle>) hiện có — khớp "category" của sản
// phẩm thì tự gắn thêm collection cùng tên (xem lib/data/collections.ts). Outerwear
// chưa có trang collection riêng nên không gắn gì thêm ngoài "all"/"new".
const CATEGORY_TO_COLLECTION: Record<NewProductInput["category"], string | null> = {
  Tops: "tops",
  Bottoms: "bottoms",
  Accessories: "accessories",
  Outerwear: null,
};

function indentBlock(text: string, spaces: number): string {
  const pad = " ".repeat(spaces);
  return text
    .split("\n")
    .map((line) => (line ? pad + line : line))
    .join("\n");
}

function buildRawProductObject(input: NewProductInput, handle: string): Record<string, unknown> {
  const price = Math.round(input.price);
  const compareAtPrice =
    typeof input.compareAtPrice === "number" && input.compareAtPrice > 0 ? Math.round(input.compareAtPrice) : undefined;
  const sizes = csvToList(input.sizes);
  const unavailableSizes = csvToList(input.unavailableSizes).filter((s) => sizes.includes(s));
  const collections = ["all"];
  const categoryCollection = CATEGORY_TO_COLLECTION[input.category];
  if (categoryCollection) collections.push(categoryCollection);
  if (input.isNewArrival) collections.push("new");
  const details = linesToList(input.details);
  const detailsEn = linesToList(input.detailsEn);

  return {
    code: input.code.trim(),
    title: input.title.trim(),
    handle,
    category: input.category,
    tags: csvToList(input.tags),
    price,
    compareAtPrice,
    // Chưa có ảnh thật — đặt 1 placeholder nhất quán (xem components/ui/Placeholder.tsx),
    // ghi rõ "sẽ cập nhật sau" để khách hiểu đây là tạm thời, không phải lỗi hiển thị.
    // Khi có ảnh thật, chỉ cần thêm file vào public/images/products/<handle>/ — web tự
    // dùng ảnh thật thay placeholder này ngay, không cần sửa code (xem productImages.ts).
    tones: ["sand"],
    labels: ["Ảnh sản phẩm sẽ được cập nhật sau"],
    sizes,
    sizeChart: input.sizeChart,
    material: input.material.trim(),
    materialEn: orUndefined(input.materialEn),
    care: input.care.trim(),
    careEn: orUndefined(input.careEn),
    fit: input.fit,
    modelInfo: input.modelInfo.trim(),
    modelInfoEn: orUndefined(input.modelInfoEn),
    collections,
    createdAt: new Date().toISOString().slice(0, 10),
    descriptionVi: orUndefined(input.descriptionVi),
    descriptionEn: orUndefined(input.descriptionEn),
    details: details.length ? details : undefined,
    detailsEn: detailsEn.length ? detailsEn : undefined,
    unavailableSizes,
    soldOut: input.soldOut || undefined,
    lastSizes: input.lastSizes || undefined,
  };
}

export type AddProductResult = { handle: string; commitUrl: string };

/** Validate tối thiểu — các lỗi nghiệp vụ cụ thể hơn (handle trùng...) kiểm tra riêng. */
export function validateNewProductInput(input: NewProductInput): string | null {
  if (!input.title.trim()) return "Thiếu tên sản phẩm.";
  if (!input.code.trim()) return "Thiếu mã sản phẩm.";
  if (!["Tops", "Bottoms", "Outerwear", "Accessories"].includes(input.category)) return "Danh mục không hợp lệ.";
  if (!Number.isFinite(input.price) || input.price <= 0) return "Giá sản phẩm không hợp lệ.";
  if (!csvToList(input.sizes).length) return "Cần ít nhất 1 size.";
  if (!input.material.trim()) return "Thiếu chất liệu.";
  if (!input.care.trim()) return "Thiếu hướng dẫn bảo quản.";
  if (!["Slim", "Regular", "Oversized"].includes(input.fit)) return "Dáng (fit) không hợp lệ.";
  if (!input.modelInfo.trim()) return "Thiếu thông tin người mẫu.";
  return null;
}

/**
 * Phần logic THUẦN (không gọi mạng) — tách riêng để unit-test được mà không cần
 * GITHUB_TOKEN/gọi API thật: chèn 1 sản phẩm mới vào nội dung file products.ts
 * (dạng text), trả về nội dung file mới + handle cuối cùng đã dùng (có thể khác
 * input.handle nếu bị trùng, xem phần tự thêm hậu tố bên dưới).
 */
export function insertProductIntoContent(content: string, input: NewProductInput): { content: string; handle: string } {
  const existingHandles = extractExistingHandles(content);

  let handle = input.handle?.trim() ? slugifyHandle(input.handle) : slugifyHandle(input.title);
  if (!handle) throw new GithubProductsError("Không tạo được URL (handle) từ tên sản phẩm.", "invalid_input");
  if (existingHandles.has(handle)) {
    // Tự thêm hậu tố -2, -3... thay vì chặn hẳn — admin thường chỉ muốn thêm nhanh,
    // không cần quay lại sửa tên nếu trùng (ví dụ ra thêm màu/bản phối mới của cùng mẫu).
    let suffix = 2;
    while (existingHandles.has(`${handle}-${suffix}`)) suffix++;
    handle = `${handle}-${suffix}`;
  }

  const rawObject = buildRawProductObject(input, handle);
  const objectText = indentBlock(JSON.stringify(rawObject, null, 2), 2);
  if (!content.includes(ARRAY_END_ANCHOR)) {
    throw new GithubProductsError("Không tìm thấy vị trí để chèn sản phẩm trong file.", "anchor_not_found");
  }
  const newContent = content.replace(
    ARRAY_END_ANCHOR,
    `\n${objectText},\n];\n\nexport const products: Product[] = RAW.map`,
  );

  return { content: newContent, handle };
}

/**
 * Thêm 1 sản phẩm mới: đọc file hiện tại trên GitHub (luôn lấy bản mới nhất, không
 * dùng bản trên ổ đĩa — tránh chèn sai vị trí nếu vừa có người khác thêm sản phẩm
 * khác), kiểm tra handle không trùng, chèn object mới vào cuối mảng RAW, commit lại.
 */
export async function addProduct(input: NewProductInput): Promise<AddProductResult> {
  const validationError = validateNewProductInput(input);
  if (validationError) throw new GithubProductsError(validationError, "invalid_input");

  const { content, sha } = await fetchProductsFile();
  const { content: newContent, handle } = insertProductIntoContent(content, input);

  const commitUrl = await commitProductsFile(
    newContent,
    sha,
    `Thêm sản phẩm: ${input.title.trim()} (từ trang admin)`,
  );

  return { handle, commitUrl };
}
