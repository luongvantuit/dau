"use client";

// Dựa trên @aceternity/parallax-scroll, sửa lại cho khớp dự án:
// - cuộn theo trang thay vì khung overflow riêng (bản gốc bọc trong h-[40rem])
// - tràn hết chiều ngang, bỏ max-w-5xl
// - nhận Photo[] để giữ srcSet + ảnh mờ + alt thật, thay cho string[]
// - giữ tỉ lệ ảnh dọc thay vì ép h-80
// - số cột đổi theo màn hình, và tôn trọng prefers-reduced-motion

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

import { cn } from "cn";
import { useMedia } from "@/hooks/use-media";
import type { Photo } from "@/lib/photos";
import { PhotoImage } from "./photo-image";
import { ShaderPhoto } from "./shader-photo";

/** Mỗi cột trôi một quãng khác nhau thì mới thấy được độ lệch. */
const COLUMN_SHIFT = [-140, 90, -60];

export function ParallaxGallery({
  photos,
  className,
}: {
  photos: Photo[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  // Chia cột bằng JS chứ không ẩn cột bằng CSS: ẩn thì mất hẳn số ảnh nằm
  // trong cột đó trên điện thoại.
  const wide = useMedia("(min-width: 768px)");
  const columnCount = wide ? 3 : 2;

  // Mốc "start end" -> "end start": tiến trình chạy từ lúc phần này chạm đáy
  // khung nhìn tới lúc rời khỏi đỉnh, nên parallax bám theo cuộn của cả trang.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const shift = reducedMotion ? [0, 0, 0] : COLUMN_SHIFT;
  // Gọi cố định 3 lần: số hook phải bất biến giữa các lần render.
  const y = [
    useTransform(scrollYProgress, [0, 1], [0, shift[0]]),
    useTransform(scrollYProgress, [0, 1], [0, shift[1]]),
    useTransform(scrollYProgress, [0, 1], [0, shift[2]]),
  ];

  // Xen kẽ thay vì cắt khúc liền nhau: đọc theo hàng ngang vẫn đúng thứ tự
  // thời gian, và các cột cao gần bằng nhau kể cả khi số ảnh lẻ.
  const columns = Array.from({ length: columnCount }, (_, column) =>
    photos.filter((_, index) => index % columnCount === column),
  );

  return (
    <div
      ref={ref}
      className={cn(
        "grid w-full grid-cols-2 items-start gap-3 px-3 md:grid-cols-3 md:gap-5 md:px-5",
        className,
      )}
    >
      {columns.map((column, columnIndex) => (
        <motion.div
          key={`cot-${columnIndex}`}
          style={{ y: y[columnIndex] }}
          className="grid gap-3 md:gap-5"
        >
          {column.map((photo) => (
            <figure
              key={photo.id}
              className="overflow-hidden rounded-2xl shadow-lg ring-1 ring-border/40"
            >
              {photo.effect === "none" ? (
                <PhotoImage
                  photo={photo}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="transition-transform duration-700 hover:scale-[1.03]"
                />
              ) : (
                // Shader vẽ ra canvas không có kích thước nội tại, nên phải
                // đặt sẵn tỉ lệ của chính ảnh đó, nếu không ô sẽ sập về 0.
                <div style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
                  <ShaderPhoto photo={photo} effect={photo.effect} />
                </div>
              )}
              {photo.caption ? (
                <figcaption className="bg-card/70 px-3 py-2 font-sans text-xs text-muted-foreground backdrop-blur">
                  {photo.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </motion.div>
      ))}
    </div>
  );
}
