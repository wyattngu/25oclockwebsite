import { NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase/admin";

/**
 * "Đánh thức" Supabase mỗi ngày — gói Free của Supabase tự TẠM DỪNG project nếu
 * không có hoạt động nào trong 7 ngày (đã gặp 2 lần: web không đặt hàng/đăng ký
 * được nữa cho tới khi vào dashboard bấm "Restore" thủ công). Route này chỉ chạy
 * 1 truy vấn đọc rất nhẹ (không đổi dữ liệu gì) để tính là "có hoạt động", giữ
 * project luôn ở trạng thái chạy — không cần vào dashboard tay nữa.
 *
 * Được gọi tự động mỗi ngày bởi Vercel Cron (xem "crons" trong vercel.json) —
 * Vercel tự thêm header Authorization: Bearer <CRON_SECRET> khi gọi, route
 * kiểm tra đúng header này mới chạy, chặn người ngoài gọi URL này tuỳ ý.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" }, { status: 200 });
  }

  try {
    const { error } = await getSupabaseAdmin().from("orders").select("id").limit(1);
    if (error) {
      console.error("[cron/keep-alive] Supabase trả lỗi:", error);
      // Trả 500 (không phải 200) khi thật sự lỗi — để lịch sử chạy cron trên Vercel
      // hiện rõ "Failed", dễ phát hiện nếu sau này Supabase đổi key/schema...
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, pingedAt: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/keep-alive] Lỗi không rõ:", err);
    return NextResponse.json({ ok: false, error: "unknown" }, { status: 500 });
  }
}
