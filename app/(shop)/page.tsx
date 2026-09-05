import type { Metadata } from "next";
import { Hero } from "@/components/home/Hero";
import { NewArrivals } from "@/components/home/NewArrivals";
import { CampaignSection, Campaign2Section, Campaign3Section } from "@/components/home/CampaignSection";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { InstagramStrip } from "@/components/home/InstagramStrip";

export const metadata: Metadata = {
  title: "25 O'Clock",
};

// Hero + Campaign đọc ảnh thật tại request time — không prerender tĩnh, để
// thêm/đổi ảnh không cần build lại mới thấy (giống trang sản phẩm).
export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <>
      <Hero />
      <NewArrivals />
      <CampaignSection />
      <Campaign2Section />
      <Campaign3Section />
      <CategoryTiles />
      <InstagramStrip />
    </>
  );
}
