import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-25 flex flex-col items-center gap-4 py-32 text-center">
      <p className="text-[13px] uppercase tracking-[0.2em] text-ink-60">404</p>
      <h1 className="text-[24px] font-medium uppercase tracking-[0.06em]">Không tìm thấy trang</h1>
      <p className="max-w-sm text-[14px] text-ink-60">
        Trang bạn tìm không tồn tại hoặc đã được di chuyển. Quay lại cửa hàng để tiếp tục khám phá.
      </p>
      <LinkButton href="/" className="mt-2">
        Về trang chủ
      </LinkButton>
    </div>
  );
}
