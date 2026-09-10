import Image from "next/image";
import Link from "next/link";
import { Placeholder } from "@/components/ui/Placeholder";
import { Magnetic } from "@/components/ui/Magnetic";
import { HeroLogo } from "@/components/home/HeroLogo";
import { getHeroImages } from "@/lib/utils/heroImage";
import { getT } from "@/lib/i18n/locale";

export async function Hero() {
  const { desktop, mobile } = getHeroImages();
  const hasPhoto = Boolean(desktop || mobile);
  const t = await getT();

  return (
    <section className="relative h-[100svh] w-full overflow-hidden md:h-[88vh]">
      {hasPhoto ? (
        <>
          {/* Mobile: ưu tiên bản dọc riêng, rơi về bản desktop nếu chưa có */}
          <Image
            src={mobile ?? desktop!}
            alt="25 o'clock — A25 Holiday Lookbook"
            fill
            priority
            sizes="100vw"
            className="object-cover md:hidden"
          />
          <Image
            src={desktop ?? mobile!}
            alt="25 o'clock — A25 Holiday Lookbook"
            fill
            priority
            sizes="100vw"
            className="hidden object-cover md:block"
          />
        </>
      ) : (
        <Placeholder tone="ink" fill label="A25 LOOKBOOK" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 text-center text-ink">
        <HeroLogo variant="black" />
        <Magnetic className="mt-2">
          <Link
            href="/collections/all"
            className="inline-flex h-12 items-center bg-ink px-8 text-[13px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-ink/80"
          >
            {t.common.shopNow}
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}
