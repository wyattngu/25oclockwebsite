"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SizeChartRow } from "@/lib/types";
import type { NewProductInput } from "@/lib/admin/newProductInput";
import { Button } from "@/components/ui/Button";

const fieldClass = "w-full border border-line bg-transparent px-3 py-2 text-[13px] focus:border-ink";
const labelClass = "mb-1 block text-[12px] font-medium uppercase tracking-wide text-ink-60";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required ? <span className="text-sale"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line p-4 md:p-6">
      <h2 className="mb-4 text-[14px] font-medium uppercase tracking-wide">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

const EMPTY_SIZE_ROW: SizeChartRow = { size: "" };

const EMPTY_FORM: NewProductInput = {
  title: "",
  code: "",
  handle: "",
  category: "Tops",
  tags: "",
  price: 0,
  compareAtPrice: undefined,
  sizes: "",
  unavailableSizes: "",
  sizeChart: [],
  material: "",
  materialEn: "",
  care: "",
  careEn: "",
  fit: "Regular",
  modelInfo: "",
  modelInfoEn: "",
  isNewArrival: true,
  descriptionVi: "",
  descriptionEn: "",
  details: "",
  detailsEn: "",
  soldOut: false,
  lastSizes: false,
};

export function NewProductForm() {
  const router = useRouter();
  const [form, setForm] = useState<NewProductInput>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ ok: true; handle: string; commitUrl: string } | { ok: false; message: string } | null>(
    null,
  );

  function set<K extends keyof NewProductInput>(key: K, value: NewProductInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateSizeRow(index: number, patch: Partial<SizeChartRow>) {
    setForm((prev) => ({
      ...prev,
      sizeChart: prev.sizeChart.map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  }

  function addSizeRow() {
    setForm((prev) => ({ ...prev, sizeChart: [...prev.sizeChart, { ...EMPTY_SIZE_ROW }] }));
  }

  function removeSizeRow(index: number) {
    setForm((prev) => ({ ...prev, sizeChart: prev.sizeChart.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/products/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setResult({ ok: false, message: data.message || "Có lỗi xảy ra, thử lại." });
        return;
      }
      setResult({ ok: true, handle: data.handle, commitUrl: data.commitUrl });
      setForm(EMPTY_FORM);
      router.refresh();
    } catch {
      setResult({ ok: false, message: "Không gửi được yêu cầu — kiểm tra kết nối mạng rồi thử lại." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Thông tin cơ bản">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tên sản phẩm" required>
            <input
              className={fieldClass}
              required
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="VD: MIDNIGHT BOOTCUT RAW DENIM PANT"
            />
          </Field>
          <Field label="Mã sản phẩm" required>
            <input className={fieldClass} required value={form.code} onChange={(e) => set("code", e.target.value)} placeholder="VD: MBC" />
          </Field>
          <Field label="Đường dẫn (URL)">
            <input
              className={fieldClass}
              value={form.handle ?? ""}
              onChange={(e) => set("handle", e.target.value)}
              placeholder="Để trống — tự tạo từ tên sản phẩm"
            />
          </Field>
          <Field label="Danh mục" required>
            <select className={fieldClass} value={form.category} onChange={(e) => set("category", e.target.value as NewProductInput["category"])}>
              <option value="Tops">Tops</option>
              <option value="Bottoms">Bottoms</option>
              <option value="Outerwear">Outerwear</option>
              <option value="Accessories">Accessories</option>
            </select>
          </Field>
          <Field label="Tags (cách nhau bởi dấu phẩy)">
            <input className={fieldClass} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="denim, raw, bootcut" />
          </Field>
        </div>
      </Section>

      <Section title="Giá & kích cỡ">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Giá bán (₫)" required>
            <input
              className={fieldClass}
              required
              type="number"
              min={0}
              value={form.price || ""}
              onChange={(e) => set("price", Number(e.target.value))}
            />
          </Field>
          <Field label="Giá gốc trước giảm (₫) — để trống nếu không giảm giá">
            <input
              className={fieldClass}
              type="number"
              min={0}
              value={form.compareAtPrice ?? ""}
              onChange={(e) => set("compareAtPrice", e.target.value ? Number(e.target.value) : undefined)}
            />
          </Field>
          <Field label="Size có sẵn (cách nhau bởi dấu phẩy)" required>
            <input className={fieldClass} required value={form.sizes} onChange={(e) => set("sizes", e.target.value)} placeholder="S, M, L, XL" />
          </Field>
          <Field label="Size đã hết hàng (nếu có)">
            <input
              className={fieldClass}
              value={form.unavailableSizes}
              onChange={(e) => set("unavailableSizes", e.target.value)}
              placeholder="VD: M"
            />
          </Field>
        </div>
      </Section>

      <Section title="Bảng số đo (tuỳ chọn)">
        {form.sizeChart.length === 0 ? (
          <p className="text-[13px] text-ink-60">Chưa có dòng nào — có thể bỏ qua, thêm sau bằng cách sửa code.</p>
        ) : null}
        <div className="space-y-3">
          {form.sizeChart.map((row, i) => (
            <div key={i} className="grid grid-cols-2 gap-2 border border-line p-3 sm:grid-cols-4 md:grid-cols-8">
              <input
                className={fieldClass}
                placeholder="Size*"
                value={row.size}
                onChange={(e) => updateSizeRow(i, { size: e.target.value })}
              />
              <input className={fieldClass} placeholder="Ngực" value={row.chest ?? ""} onChange={(e) => updateSizeRow(i, { chest: e.target.value || undefined })} />
              <input className={fieldClass} placeholder="Eo" value={row.waist ?? ""} onChange={(e) => updateSizeRow(i, { waist: e.target.value || undefined })} />
              <input className={fieldClass} placeholder="Dài" value={row.length ?? ""} onChange={(e) => updateSizeRow(i, { length: e.target.value || undefined })} />
              <input className={fieldClass} placeholder="Mông" value={row.hip ?? ""} onChange={(e) => updateSizeRow(i, { hip: e.target.value || undefined })} />
              <input className={fieldClass} placeholder="Đùi" value={row.thigh ?? ""} onChange={(e) => updateSizeRow(i, { thigh: e.target.value || undefined })} />
              <input
                className={fieldClass}
                placeholder="Gấu quần"
                value={row.legOpening ?? ""}
                onChange={(e) => updateSizeRow(i, { legOpening: e.target.value || undefined })}
              />
              <div className="flex gap-2">
                <input className={fieldClass} placeholder="Ngang thân" value={row.width ?? ""} onChange={(e) => updateSizeRow(i, { width: e.target.value || undefined })} />
                <button type="button" onClick={() => removeSizeRow(i)} className="shrink-0 border border-sale px-2 text-[12px] text-sale hover:bg-sale hover:text-white">
                  Xoá
                </button>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" variant="ghost" onClick={addSizeRow} className="mt-2 h-10 px-4 text-[12px]">
          + Thêm dòng size
        </Button>
      </Section>

      <Section title="Chất liệu & bảo quản">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Chất liệu (Tiếng Việt)" required>
            <textarea className={fieldClass} required rows={3} value={form.material} onChange={(e) => set("material", e.target.value)} />
          </Field>
          <Field label="Chất liệu (English)">
            <textarea className={fieldClass} rows={3} value={form.materialEn} onChange={(e) => set("materialEn", e.target.value)} />
          </Field>
          <Field label="Hướng dẫn bảo quản (Tiếng Việt)" required>
            <textarea className={fieldClass} required rows={3} value={form.care} onChange={(e) => set("care", e.target.value)} />
          </Field>
          <Field label="Hướng dẫn bảo quản (English)">
            <textarea className={fieldClass} rows={3} value={form.careEn} onChange={(e) => set("careEn", e.target.value)} />
          </Field>
          <Field label="Dáng (fit)" required>
            <select className={fieldClass} value={form.fit} onChange={(e) => set("fit", e.target.value as NewProductInput["fit"])}>
              <option value="Slim">Slim</option>
              <option value="Regular">Regular</option>
              <option value="Oversized">Oversized</option>
            </select>
          </Field>
          <div />
          <Field label="Thông tin người mẫu (Tiếng Việt)" required>
            <input className={fieldClass} required value={form.modelInfo} onChange={(e) => set("modelInfo", e.target.value)} placeholder="Model cao 1m65, nặng 47kg, mặc size M" />
          </Field>
          <Field label="Thông tin người mẫu (English)">
            <input className={fieldClass} value={form.modelInfoEn} onChange={(e) => set("modelInfoEn", e.target.value)} placeholder="Model is 165cm / 47kg, wearing size M" />
          </Field>
        </div>
      </Section>

      <Section title="Mô tả & đặc điểm nổi bật (tuỳ chọn)">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Mô tả sản phẩm (Tiếng Việt)">
            <textarea className={fieldClass} rows={3} value={form.descriptionVi} onChange={(e) => set("descriptionVi", e.target.value)} />
          </Field>
          <Field label="Mô tả sản phẩm (English)">
            <textarea className={fieldClass} rows={3} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} />
          </Field>
          <Field label="Đặc điểm nổi bật (Tiếng Việt) — mỗi dòng 1 gạch đầu dòng">
            <textarea className={fieldClass} rows={4} value={form.details} onChange={(e) => set("details", e.target.value)} placeholder={"Màu: Black\nKhoá kéo YKK"} />
          </Field>
          <Field label="Đặc điểm nổi bật (English) — mỗi dòng 1 gạch đầu dòng">
            <textarea className={fieldClass} rows={4} value={form.detailsEn} onChange={(e) => set("detailsEn", e.target.value)} placeholder={"Color: Black\nYKK zipper"} />
          </Field>
        </div>
      </Section>

      <Section title="Hiển thị">
        <div className="flex flex-wrap gap-6 text-[13px]">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isNewArrival} onChange={(e) => set("isNewArrival", e.target.checked)} />
            Hiện trong "Hàng mới về"
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.lastSizes} onChange={(e) => set("lastSizes", e.target.checked)} />
            Chỉ còn vài size
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.soldOut} onChange={(e) => set("soldOut", e.target.checked)} />
            Hết hàng toàn bộ
          </label>
        </div>
      </Section>

      {result ? (
        <div className={`border p-4 text-[13px] ${result.ok ? "border-ink" : "border-sale text-sale"}`}>
          {result.ok ? (
            <>
              <p className="font-medium">Đã lưu — đang triển khai lên web, chờ khoảng 1-2 phút nữa sẽ thấy.</p>
              <p className="mt-1 text-ink-60">
                Đường dẫn sản phẩm: <code>/products/{result.handle}</code>
              </p>
              <p className="mt-1 text-ink-60">
                Ảnh sản phẩm đang để placeholder "Ảnh sẽ được cập nhật sau" — thêm ảnh thật vào thư mục{" "}
                <code>public/images/products/{result.handle}/</code> khi có.
              </p>
            </>
          ) : (
            result.message
          )}
        </div>
      ) : null}

      <Button type="submit" disabled={submitting} className="px-10">
        {submitting ? "Đang lưu…" : "Thêm sản phẩm"}
      </Button>
    </form>
  );
}
