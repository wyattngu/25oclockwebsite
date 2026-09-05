import { IconClose } from "@/components/ui/icons";
import { company } from "@/lib/data/company";
import { formatPrice } from "@/lib/utils/formatPrice";

export function AnnouncementBar({ transparent, onClose }: { transparent: boolean; onClose: () => void }) {
  return (
    <div
      className={`flex items-center justify-center gap-3 px-4 py-2 text-center text-[12px] transition-colors duration-300 ${
        transparent ? "bg-ink/60 text-white" : "bg-ink text-white"
      }`}
    >
      <span>
        Miễn phí vận chuyển toàn quốc cho đơn từ {formatPrice({ amount: company.freeShippingThreshold, currencyCode: "VND" })}
      </span>
      <button aria-label="Đóng thông báo" onClick={onClose} className="shrink-0">
        <IconClose className="h-3 w-3" />
      </button>
    </div>
  );
}
