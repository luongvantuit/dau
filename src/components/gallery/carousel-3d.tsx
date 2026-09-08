"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Photo } from "@/lib/photos";
import { PhotoImage } from "./photo-image";
import { ShaderPhoto } from "./shader-photo";

export function Carousel3D({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const active = photos[index];
  const move = (step: number) =>
    setIndex((current) => (current + step + photos.length) % photos.length);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex w-full items-center justify-center [perspective:1400px]">
        {/* Ảnh hai bên: chỉ là <img> xoay bằng CSS, không tốn WebGL context. */}
        {[-2, -1, 1, 2].map((offset) => {
          const neighbour = photos[(index + offset + photos.length) % photos.length];
          return (
            <motion.div
              key={`slot-${offset}`}
              aria-hidden
              className="absolute hidden w-[38%] max-w-[300px] overflow-hidden rounded-2xl shadow-xl md:block"
              animate={{
                x: `${offset * 62}%`,
                rotateY: offset * -18,
                rotate: neighbour.tilt,
                scale: 1 - Math.abs(offset) * 0.12,
                opacity: 1 - Math.abs(offset) * 0.32,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 30 }}
            >
              <PhotoImage photo={neighbour} sizes="300px" />
            </motion.div>
          );
        })}

        {/* Ảnh giữa: WebGL context DUY NHẤT cho ảnh. Không bọc AnimatePresence
            quanh ShaderPhoto — remount sẽ tạo context mới mỗi lần bấm. */}
        <div className="relative z-10 aspect-[2/3] w-[72%] max-w-[420px] overflow-hidden rounded-3xl shadow-2xl">
          <ShaderPhoto photo={active} effect={active.effect} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Ảnh trước">
          <ChevronLeft />
        </Button>
        <p className="font-sans text-sm tabular-nums text-muted-foreground">
          {index + 1} / {photos.length}
        </p>
        <Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Ảnh sau">
          <ChevronRight />
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
