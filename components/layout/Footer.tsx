import Link from "next/link";
import { company } from "@/lib/data/company";
import { NewsletterForm } from "@/components/layout/NewsletterForm";

const shopLinks = [
  { label: "Tops", href: "/collections/tops" },
  { label: "Bottoms", href: "/collections/bottoms" },
];

const supportLinks = [
  { label: "Hướng dẫn chọn size", href: "/pages/size-guide" },
  { label: "Vận chuyển & đổi trả", href: "/pages/shipping-returns" },
  { label: "Liên hệ", href: "/pages/contact" },
];

const aboutLinks = [
  { label: "Campaign", href: "/campaign" },
  { label: "Instagram", href: company.instagram.url },
];

function FooterColumn({ heading, links }: { heading: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="nav-link mb-4 text-ink-60">{heading}</h3>
      <ul className="space-y-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className="text-[14px] hover:text-ink-60">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="container-25 grid grid-cols-2 gap-x-6 gap-y-10 py-14 md:grid-cols-4 md:gap-x-10 md:py-16">
        <div>
          <h3 className="nav-link mb-4 text-white/50">Shop</h3>
          <ul className="space-y-2.5">
            {shopLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-[14px] hover:text-white/60">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="nav-link mb-4 text-white/50">Hỗ trợ</h3>
          <ul className="space-y-2.5">
            {supportLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-[14px] hover:text-white/60">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="nav-link mb-4 text-white/50">Về 25 O&apos;Clock</h3>
          <ul className="space-y-2.5">
            {aboutLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-[14px] hover:text-white/60">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <h3 className="nav-link mb-4 text-white/50">Đăng ký nhận tin</h3>
          <p className="text-[13px] text-white/70">Sản phẩm mới, campaign và ưu đãi — gửi thẳng vào email của bạn.</p>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-white/15">
        <div className="container-25 flex flex-col gap-3 py-6 text-[12px] text-white/60 md:flex-row md:items-center md:justify-between">
          <p>Email: {company.email}</p>
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} 25 o&apos;clock</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
