import { Drawer } from "@/components/ui/Drawer";
import type { SizeChartRow } from "@/lib/types";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  sizeChart: SizeChartRow[];
  modelInfo: string;
};

const COLUMN_LABELS: Record<keyof Omit<SizeChartRow, "size">, string> = {
  chest: "Vòng ngực",
  waist: "Vòng eo",
  hip: "Vòng mông",
  length: "Dài",
  thigh: "Vòng đùi",
  legOpening: "Ống quần",
  width: "Ngang thân",
};

export function SizeGuideDrawer({ isOpen, onClose, sizeChart, modelInfo }: Props) {
  const columns = (Object.keys(COLUMN_LABELS) as (keyof typeof COLUMN_LABELS)[]).filter((key) =>
    sizeChart.some((row) => row[key]),
  );

  return (
    <Drawer isOpen={isOpen} onClose={onClose} side="bottom" title="Hướng dẫn chọn size">
      <div className="p-5">
        {sizeChart.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-2 pr-4 font-medium uppercase tracking-wider">Size</th>
                  {columns.map((col) => (
                    <th key={col} className="py-2 pr-4 font-medium uppercase tracking-wider">
                      {COLUMN_LABELS[col]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row) => (
                  <tr key={row.size} className="border-b border-line">
                    <td className="py-2 pr-4 font-medium">{row.size}</td>
                    {columns.map((col) => (
                      <td key={col} className="py-2 pr-4 text-ink-60">
                        {row[col] ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[14px] text-ink-60">Sản phẩm freesize, không có bảng số đo chi tiết.</p>
        )}
        <p className="mt-4 text-[13px] text-ink-60">{modelInfo}</p>
        <p className="mt-4 text-[13px] text-ink-60">
          Số đo mang tính tương đối, có thể sai lệch 1–2cm. Xem thêm{" "}
          <a href="/pages/size-guide" className="underline underline-offset-2">
            hướng dẫn chọn size chung
          </a>
          .
        </p>
      </div>
    </Drawer>
  );
}
