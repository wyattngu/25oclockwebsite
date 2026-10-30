import { NextResponse } from "next/server";
import { addProduct, GithubProductsError } from "@/lib/github/products";
import type { NewProductInput } from "@/lib/admin/newProductInput";

/**
 * Thêm sản phẩm mới từ /admin/products/new — đã được proxy.ts bảo vệ (matcher
 * "/api/admin/:path*"), chỉ admin đã đăng nhập mới gọi được route này.
 */
export async function POST(request: Request) {
  let body: Partial<NewProductInput>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // Validate tối thiểu ở đây (kiểu dữ liệu/field bắt buộc có mặt) — validate nghiệp vụ
  // chi tiết hơn (giá > 0, có ít nhất 1 size...) nằm trong addProduct().
  if (
    typeof body.title !== "string" ||
    typeof body.code !== "string" ||
    typeof body.category !== "string" ||
    typeof body.price !== "number" ||
    typeof body.sizes !== "string" ||
    typeof body.material !== "string" ||
    typeof body.care !== "string" ||
    typeof body.fit !== "string" ||
    typeof body.modelInfo !== "string"
  ) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }

  const input: NewProductInput = {
    title: body.title,
    code: body.code,
    handle: typeof body.handle === "string" ? body.handle : undefined,
    category: body.category as NewProductInput["category"],
    tags: typeof body.tags === "string" ? body.tags : "",
    price: body.price,
    compareAtPrice: typeof body.compareAtPrice === "number" ? body.compareAtPrice : undefined,
    sizes: body.sizes,
    unavailableSizes: typeof body.unavailableSizes === "string" ? body.unavailableSizes : "",
    sizeChart: Array.isArray(body.sizeChart) ? body.sizeChart : [],
    material: body.material,
    materialEn: typeof body.materialEn === "string" ? body.materialEn : "",
    care: body.care,
    careEn: typeof body.careEn === "string" ? body.careEn : "",
    fit: body.fit as NewProductInput["fit"],
    modelInfo: body.modelInfo,
    modelInfoEn: typeof body.modelInfoEn === "string" ? body.modelInfoEn : "",
    isNewArrival: Boolean(body.isNewArrival),
    descriptionVi: typeof body.descriptionVi === "string" ? body.descriptionVi : "",
    descriptionEn: typeof body.descriptionEn === "string" ? body.descriptionEn : "",
    details: typeof body.details === "string" ? body.details : "",
    detailsEn: typeof body.detailsEn === "string" ? body.detailsEn : "",
    soldOut: Boolean(body.soldOut),
    lastSizes: Boolean(body.lastSizes),
  };

  try {
    const result = await addProduct(input);
    return NextResponse.json({ ok: true, handle: result.handle, commitUrl: result.commitUrl });
  } catch (err) {
    if (err instanceof GithubProductsError) {
      console.error("[admin/products/new]", err.code, err.message);
      return NextResponse.json({ ok: false, error: err.code, message: err.message }, { status: 400 });
    }
    console.error("[admin/products/new] Lỗi không rõ:", err);
    return NextResponse.json({ ok: false, error: "unknown" }, { status: 500 });
  }
}
