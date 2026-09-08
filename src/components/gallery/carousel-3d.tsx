"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon } from "@/components/ui/chevron-left";
import { ChevronRightIcon } from "@/components/ui/chevron-right";
import { useMedia } from "@/hooks/use-media";
import type { Photo } from "@/lib/photos";
import { DotNav } from "./dot-nav";
import { PhotoImage } from "./photo-image";
import { ShaderPhoto } from "./shader-photo";

export function Carousel3D({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  // Màn hẹp chỉ đủ chỗ cho một ảnh mỗi bên; nhồi bốn ảnh thì chúng chồng lên
  // ảnh giữa. Trước đây tôi ẩn hẳn nên trên điện thoại mất luôn hiệu ứng xoè.
  const wide = useMedia("(min-width: 768px)");
  const dragStart = useRef<{ x: number; at: number } | null>(null);
  const offsets = wide ? [-2, -1, 1, 2] : [-1, 1];
  const active = photos[index];

  const move = (step: number) =>
    setIndex((current) => (current + step + photos.length) % photos.length);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Vuốt bằng pointer event chứ không dùng prop drag của motion: khi
          người dùng bật giảm chuyển động, MotionConfig tắt các tính năng dựa
          trên transform và drag ngừng hoạt động — họ sẽ không vuốt được nữa.
          Pointer event thì luôn chạy. */}
      <div
        className="relative flex w-full touch-pan-y cursor-grab items-center justify-center [perspective:1400px] active:cursor-grabbing"
        onPointerDown={(event) => {
          dragStart.current = { x: event.clientX, at: event.timeStamp };
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerUp={(event) => {
          const start = dragStart.current;
          dragStart.current = null;
          if (!start) return;
          const dx = event.clientX - start.x;
          const elapsed = Math.max(event.timeStamp - start.at, 1);
          // Ngưỡng kép: kéo đủ xa, hoặc hất nhanh dù quãng ngắn.
          if (Math.abs(dx) < 60 && Math.abs(dx) / elapsed < 0.45) return;
          move(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => {
          dragStart.current = null;
        }}
      >
        {/* Ảnh hai bên: chỉ là <img> xoay bằng CSS, không tốn WebGL context. */}
        {offsets.map((offset) => {
          const neighbour = photos[(index + offset + photos.length) % photos.length];
          return (
            <motion.div
              key={`slot-${offset}`}
              aria-hidden
              className="absolute aspect-[2/3] w-[32%] max-w-[260px] overflow-hidden rounded-2xl shadow-xl"
              animate={{
                x: `${offset * (wide ? 72 : 58)}%`,
                rotateY: offset * (wide ? -18 : -12),
                rotate: neighbour.tilt,
                scale: 1 - Math.abs(offset) * 0.12,
                opacity: 1 - Math.abs(offset) * 0.32,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 30 }}
            >
              <PhotoImage
                photo={neighbour}
                sizes="320px"
                className="h-full object-cover select-none"
              />
            </motion.div>
          );
        })}

        {/* Ảnh giữa: WebGL context DUY NHẤT cho ảnh. Không bọc AnimatePresence
            quanh ShaderPhoto — remount sẽ tạo context mới mỗi lần bấm. */}
        {/* Khung tỉ lệ cố định: thiếu nó thì mỗi ảnh tự quyết chiều cao và
            cả hàng nhảy giật mỗi lần chuyển ảnh. */}
        <div className="relative z-10 aspect-[2/3] w-[70%] max-w-[380px] overflow-hidden rounded-3xl shadow-2xl ring-1 ring-border/40">
          <ShaderPhoto photo={active} effect={active.effect} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Ảnh trước">
          <ChevronLeftIcon size={18} />
        </Button>

        {/* Dot thay cho "4 / 27": con số đó đếm riêng ảnh hợp khổ dọc nên lệch
            với số ảnh dưới gallery, nhìn vào tưởng thiếu ảnh. */}
        <DotNav count={photos.length} index={index} onSelect={setIndex} />

        <Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Ảnh sau">
          <ChevronRightIcon size={18} />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {active.caption ? (
          <motion.p
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-prose text-center font-sans text-sm text-muted-foreground"
          >
            {active.caption}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
