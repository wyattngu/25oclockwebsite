import type { Metadata } from "next";
import { getCampaign2Images } from "@/lib/utils/campaignImages";
import { CampaignSlideshow } from "@/components/home/CampaignSlideshow";

export const metadata: Metadata = {
  title: "Campaign",
  description: "Hình ảnh chiến dịch của 25 o'clock.",
};

// Đọc ảnh thật tại request time — thêm/xoá ảnh không cần build lại.
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ start?: string }> };

export default async function Campaign2Page({ searchParams }: Props) {
  const images = getCampaign2Images();
  const { start } = await searchParams;
  const startIndex = Math.min(Math.max(Number(start) || 0, 0), Math.max(images.length - 1, 0));

  if (images.length === 0) {
    return (
      <div className="container-25 flex flex-col items-center gap-2 py-24 text-center">
        <h1 className="text-[20px] font-medium uppercase tracking-[0.06em]">Campaign</h1>
        <p className="text-[14px] text-ink-60">Chưa có ảnh nào — quay lại sau nhé.</p>
      </div>
    );
  }

  return <CampaignSlideshow images={images} startIndex={startIndex} />;
}
