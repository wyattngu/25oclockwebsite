import { Hero } from "@/components/home/Hero";
import { NewArrivals } from "@/components/home/NewArrivals";
import { CampaignSection, Campaign2Section, Campaign3Section } from "@/components/home/CampaignSection";
import { CategoryTiles } from "@/components/home/CategoryTiles";
import { InstagramStrip } from "@/components/home/InstagramStrip";

// Không tự đặt "title" ở đây — để trang chủ thừa hưởng đúng title mặc định (đầy đủ,
// theo đúng ngôn ngữ đang chọn) từ app/layout.tsx. Trước đây có set "25 O'Clock" ở
// đây, cộng với template "%s · 25 O'Clock" của layout gốc, ra tiêu đề tab trình
// duyệt bị lặp "25 O'Clock · 25 O'Clock".

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
