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
    // images.unoptimized khiến next/image bỏ luôn srcSet, nên phải viết tay
    // mới chọn được đúng cỡ ảnh cho từng màn hình.
    // eslint-disable-next-line @next/next/no-img-element
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
      // Ảnh mặc định kéo-thả được; trình duyệt sẽ cướp chuỗi pointer để chạy
      // drag-and-drop của nó và carousel không nhận được thao tác kéo nữa.
      draggable={false}
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
