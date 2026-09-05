"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { IconChevronDown, IconClose } from "@/components/ui/icons";
import { Placeholder } from "@/components/ui/Placeholder";
import { navCollections } from "@/lib/data/collections";

const SHOP_LINKS = navCollections.map((c) => ({
  label: c.title,
  href: `/collections/${c.handle}`,
  tone: c.tone,
  handle: c.handle,
}));

// Tên tạm — đổi lại khi có tên chính thức cho từng campaign.
const CAMPAIGNS = [
  { label: "0.1", href: "/campaign" },
  { label: "0.2", href: "/campaign2" },
  { label: "0.3", href: "/campaign3" },
];

const OTHER_LINKS = [
  { label: "Về 25 O'clock", href: "/pages/about" },
  { label: "Liên hệ", href: "/pages/contact" },
  { label: "Vận chuyển & đổi trả", href: "/pages/shipping-returns" },
];

export function NavOverlay({
  isOpen,
  onClose,
  isLoggedIn = false,
  collectionCovers = {},
}: {
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn?: boolean;
  collectionCovers?: Record<string, string | null>;
}) {
  const [hovered, setHovered] = useState(SHOP_LINKS[0]);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const accountLink = isLoggedIn ? { label: "Tài khoản", href: "/account" } : { label: "Đăng nhập", href: "/account/login" };
  const links = [...OTHER_LINKS, accountLink];

  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 bg-ink text-white"
        >
          <button aria-label="Đóng menu" onClick={onClose} className="absolute right-4 top-4 p-2 md:right-8 md:top-6">
            <IconClose className="h-6 w-6" />
          </button>

          <div className="mx-auto flex h-full max-w-6xl flex-col justify-center gap-10 px-6 md:flex-row md:items-center md:gap-16 md:px-8">
            <nav className="flex flex-col gap-2 md:gap-3">
              <p className="mb-2 text-[12px] uppercase tracking-[0.2em] text-white/50">Shop</p>
              {SHOP_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  onMouseEnter={() => setHovered(item)}
                  className="text-[28px] font-medium uppercase leading-tight tracking-wide hover:text-white/60 md:text-[36px]"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-4 h-px w-16 bg-white/20" />

              <div>
                <button
                  type="button"
                  onClick={() => setCampaignOpen((v) => !v)}
                  aria-expanded={campaignOpen}
                  className="flex items-center gap-2 text-[16px] uppercase tracking-wide text-white/70 hover:text-white"
                >
                  Campaign
                  <IconChevronDown className={`h-3.5 w-3.5 transition-transform ${campaignOpen ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {campaignOpen ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-2 py-2 pl-4">
                        {CAMPAIGNS.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            onClick={onClose}
                            className="text-[14px] uppercase tracking-wide text-white/50 hover:text-white"
                          >
                            {c.label}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="text-[16px] uppercase tracking-wide text-white/70 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="relative hidden aspect-[3/4] w-72 shrink-0 overflow-hidden md:block">
              {collectionCovers[hovered.handle] ? (
                <Image
                  src={collectionCovers[hovered.handle]!}
                  alt={hovered.label}
                  fill
                  sizes="288px"
                  className="object-cover"
                />
              ) : (
                <Placeholder tone={hovered.tone} label={hovered.label} fill={false} ratio="3 / 4" />
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
