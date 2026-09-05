"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Logo lớn ở Hero — rê chuột vào: phóng to nhẹ kiểu spring (hơi nảy tự nhiên,
 * không nhấp nháy) — đúng nguyên tắc "chuyển động tối thiểu" của site.
 */
export function HeroLogo({ variant = "black" }: { variant?: "black" | "white" }) {
  return (
    <motion.div
      className="cursor-default"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Image
        src={`/images/logo/logo-${variant}.png`}
        alt="25 O'Clock"
        width={3000}
        height={580}
        priority
        className="w-[78vw] sm:w-[58vw] md:w-[38vw]"
      />
    </motion.div>
  );
}
