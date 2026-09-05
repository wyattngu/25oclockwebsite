import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
  title: "Quản trị",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="flex h-14 items-center justify-between border-b border-line bg-ink px-4 text-white md:px-8">
        <Link href="/admin/orders" className="text-[14px] font-semibold uppercase tracking-[0.1em]">
          25 O&apos;Clock — Quản trị
        </Link>
        <LogoutButton />
      </header>
      <main className="container-25 py-8">{children}</main>
    </div>
  );
}
