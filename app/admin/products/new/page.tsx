import { NewProductForm } from "@/components/admin/NewProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-[20px] font-medium uppercase tracking-[0.06em]">Thêm sản phẩm</h1>
      <p className="mb-6 text-[13px] text-ink-60">
        Sau khi lưu, sản phẩm được commit thẳng vào code và web tự deploy lại — cần đợi khoảng 1-2 phút mới thấy sản
        phẩm xuất hiện trên web thật.
      </p>
      <NewProductForm />
    </div>
  );
}
