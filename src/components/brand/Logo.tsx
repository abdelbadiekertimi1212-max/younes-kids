import Image from "next/image";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

/**
 * The Younes Kids logo (transparent PNG). Size it with a height class
 * (e.g. "h-14"); the width follows the logo's aspect ratio.
 */
export function Logo({ className, priority = false, sizes = "160px" }: { className?: string; priority?: boolean; sizes?: string }) {
  return (
    <Image
      src={BRAND.logo}
      alt={BRAND.name}
      width={BRAND.logoWidth}
      height={BRAND.logoHeight}
      priority={priority}
      sizes={sizes}
      className={cn("w-auto select-none drop-shadow-[0_2px_6px_rgb(30_38_80/0.18)]", className)}
      draggable={false}
    />
  );
}
