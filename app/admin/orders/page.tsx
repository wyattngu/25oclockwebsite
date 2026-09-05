import Link from "next/link";
import { listOrders } from "@/lib/data/orders";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { formatPrice } from "@/lib/utils/formatPrice";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";

// Danh sách đơn hàng thay đổi liên tục — không được cache/prerender tĩnh.
export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="border border-line p-6 text-[14px]">
        <p className="font-medium">Chưa cấu hình Supabase.</p>
        <p className="mt-2 text-ink-60">
          Thêm <code>SUPABASE_URL</code> và <code>SUPABASE_SERVICE_ROLE_KEY</code> vào{" "}
          <code>.env.local</code> (xem <code>.env.local.example</code>), chạy{" "}
          <code>supabase/schema.sql</code> trong SQL Editor của project, rồi khởi động lại server.
        </p>
      </div>
    );
  }

  const orders = await listOrders();

  return (
    <div>
      <h1 className="mb-6 text-[20px] font-medium uppercase tracking-[0.06em]">
        Đơn hàng ({orders.length})
      </h1>

      {orders.length === 0 ? (
        <p className="text-[14px] text-ink-60">Chưa có đơn hàng nào.</p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-[720px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-bg-alt">
                <th className="px-4 py-3 font-medium uppercase tracking-wider">Mã đơn</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider">Khách hàng</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider">Thanh toán</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider">Tổng tiền</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider">Trạng thái</th>
                <th className="px-4 py-3 font-medium uppercase tracking-wider">Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-line last:border-0 hover:bg-bg-alt">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="underline underline-offset-2">
                      #{order.id}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {order.customer.name}
                    <div className="text-ink-60">{order.customer.phone}</div>
                  </td>
                  <td className="px-4 py-3">{order.paymentMethod}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-ink-60">
                    {new Date(order.createdAt).toLocaleString("vi-VN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
