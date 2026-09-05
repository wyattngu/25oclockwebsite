import type { OrderStatus } from "@/lib/types";

const LABELS: Record<OrderStatus, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  cancelled: "Đã huỷ",
};

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-bg-alt text-ink-60",
  confirmed: "bg-ink text-white",
  cancelled: "border border-sale text-sale",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block px-2 py-1 text-[11px] font-medium uppercase tracking-wider ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
