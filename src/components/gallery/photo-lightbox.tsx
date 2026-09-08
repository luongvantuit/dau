"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect } from "react";

import { DotNav } from "@/components/gallery/dot-nav";
import { PhotoImage } from "@/components/gallery/photo-image";
import { ChevronLeftIcon } from "@/components/ui/chevron-left";
import { ChevronRightIcon } from "@/components/ui/chevron-right";
import { XIcon } from "@/components/ui/x";
import type { Photo } from "@/lib/photos";

export function PhotoLightbox({
  photos,
  index,
  onClose,
  onChange,
}: {
  photos: Photo[];
  /** null = đang đóng. */
  index: number | null;
  onClose: () => void;
  onChange: (next: number) => void;
}) {
  const open = index !== null;

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onChange((index + delta + photos.length) % photos.length);
    },
    [index, onChange, photos.length],
  );

  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    // Khoá cuộn nền: thiếu bước này thì vuốt trên lightbox làm trang phía sau
    // trôi theo.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, step]);

  const photo = index === null ? null : photos[index];

  return (
    <AnimatePresence>
      {photo ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={photo.alt}
          // z cao hơn GlassScrollbar (z-70): thanh cuộn tự vẽ mà nổi đè lên lightbox
          // thì rê ra mép phải vẫn kéo được nó, và trang phía sau chạy theo.
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-foreground/92 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.figure
            key={photo.id}
            className="flex max-h-[78vh] flex-col items-center gap-3"
            // KHÔNG mờ dần lúc vào: ảnh mờ 16px nằm ngay trong thẻ img này, mà
            // cho cả figure chạy từ opacity 0 thì đúng quãng nó cần làm việc
            // lại là lúc nó vô hình — người dùng thấy nền tối trống trơn. Lặp
            // lại mỗi lần bấm ảnh sau, vì key={photo.id} dựng lại từ đầu.
            initial={{ scale: 0.94 }}
            animate={{ scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) step(1);
              else if (info.offset.x > 80) step(-1);
            }}
            // Bấm vào chính tấm ảnh thì không được đóng, chỉ bấm ra nền mới đóng.
            onClick={(event) => event.stopPropagation()}
          >
            <PhotoImage
              photo={photo}
              sizes="(max-width: 768px) 92vw, 70vw"
              priority
              className="max-h-[70vh] w-auto rounded-xl object-contain select-none"
            />
            {photo.caption ? (
              <figcaption className="font-sans text-sm text-background/85">
                {photo.caption}
              </figcaption>
            ) : null}
          </motion.figure>

          <div
            className="flex items-center gap-5 text-background"
            onClick={(event) => event.stopPropagation()}
          >
            <button onClick={() => step(-1)} aria-label="Ảnh trước" className="p-2 opacity-80 hover:opacity-100">
              <ChevronLeftIcon size={22} />
            </button>
            {/* Dot thay cho "3 / 28" cho khớp với carousel: con số đếm thô
                không nói được đang ở đoạn nào của cả tập ảnh. */}
            <DotNav count={photos.length} index={index!} onSelect={onChange} tone="inverse" />
            <button onClick={() => step(1)} aria-label="Ảnh sau" className="p-2 opacity-80 hover:opacity-100">
              <ChevronRightIcon size={22} />
            </button>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng"
            className="absolute top-4 right-4 p-2 text-background opacity-80 hover:opacity-100"
          >
            <XIcon size={22} />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
