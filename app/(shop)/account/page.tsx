import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentCustomer } from "@/lib/auth/getCurrentCustomer";
import { getOrdersByEmail } from "@/lib/data/orders";
import { formatPrice } from "@/lib/utils/formatPrice";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { LogoutButton } from "@/components/account/LogoutButton";

export const metadata: Metadata = { title: "Tài khoản" };

// Trạng thái đăng nhập + đơn hàng đọc theo từng request — không prerender tĩnh.
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();

  if (!customer) {
    return (
      <div className="container-25 flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-[15px] text-ink-60">Bạn chưa đăng nhập.</p>
        <div className="flex gap-3">
          <Link
            href="/account/login"
            className="inline-flex h-12 items-center bg-ink px-8 text-[13px] font-medium uppercase tracking-[0.1em] text-white hover:bg-ink-60"
          >
            Đăng nhập
          </Link>
          <Link
            href="/account/register"
            className="inline-flex h-12 items-center border border-ink px-8 text-[13px] font-medium uppercase tracking-[0.1em] text-ink hover:bg-ink hover:text-white"
          >
            Tạo tài khoản
          </Link>
        </div>
      </div>
    );
  }

  const orders = await getOrdersByEmail(customer.email);

  return (
    <div className="container-25 max-w-2xl py-8 md:py-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-[22px] font-medium uppercase tracking-[0.06em]">Tài khoản</h1>
        <LogoutButton />
      </div>

      <section className="border border-line p-5">
        <h2 className="nav-link mb-3">Thông tin</h2>
        <dl className="space-y-1.5 text-[14px]">
          <div className="flex justify-between gap-4">
            <dt className="text-ink-60">Họ tên</dt>
            <dd>{customer.name}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ink-60">Email</dt>
            <dd>{customer.email}</dd>
          </div>
          {customer.phone ? (
            <div className="flex justify-between gap-4">
              <dt className="text-ink-60">Điện thoại</dt>
              <dd>{customer.phone}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="mt-6">
        <h2 className="nav-link mb-3">Đơn hàng ({orders.length})</h2>
        {orders.length === 0 ? (
          <p className="text-[14px] text-ink-60">Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div className="divide-y divide-line border-y border-line">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="flex items-center justify-between py-3 text-[14px] hover:bg-bg-alt"
              >
                <div>
                  <p className="font-medium">#{order.id}</p>
                  <p className="text-ink-60">{new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="tabular-nums">{formatPrice(order.total)}</span>
                  <OrderStatusBadge status={order.status} />
                  <span className="text-ink-60" aria-hidden>
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
