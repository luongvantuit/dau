import { cn } from "cn";

import type { Photo } from "@/lib/photos";

export function PhotoImage({
  photo,
  sizes,
  priority = false,
  className,
}: {
  photo: Photo;
  /** Bắt buộc: thiếu sizes thì trình duyệt mặc định 100vw và luôn tải bản lớn nhất. */
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- images.unoptimized khiến
    // next/image bỏ luôn srcSet, nên viết tay mới chọn được đúng cỡ ảnh.
    <img
      src={photo.src}
      srcSet={photo.srcSet.map((item) => `${item.src} ${item.w}w`).join(", ")}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      // Ảnh mờ 16px làm nền trong lúc ảnh thật tải, hết giật khung trắng.
      style={{
        backgroundImage: `url("${photo.blurDataURL}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}
