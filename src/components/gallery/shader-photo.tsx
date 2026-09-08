"use client";

import {
  FlutedGlass, ImageDithering, LensDistortion, Water,
} from "@paper-design/shaders-react";
import { useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

import type { ShaderEffect } from "@/data/events";
import type { Photo } from "@/lib/photos";
import { PhotoImage } from "./photo-image";

export function ShaderPhoto({ photo, effect }: { photo: Photo; effect: ShaderEffect }) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px" });
  // Cuộn qua rồi thì ngừng vẽ: context vẫn giữ (không mất canvas) nhưng GPU nghỉ.
  const speed = reducedMotion || !inView ? 0 : 0.4;

  // Bản 1600w: shader lấy ảnh làm texture nên cần độ phân giải cao nhất có.
  const source = photo.srcSet[photo.srcSet.length - 1].src;
  const common = { image: source, fit: "cover" as const, style: { width: "100%", height: "100%" } };

  return (
    <div ref={ref} className="h-full w-full">
      {effect === "none" ? (
        <PhotoImage photo={photo} sizes="(max-width: 768px) 90vw, 520px" priority />
      ) : effect === "water" ? (
        <Water {...common} speed={speed} highlights={0.4} />
      ) : effect === "fluted-glass" ? (
        <FlutedGlass {...common} speed={speed} />
      ) : effect === "lens-distortion" ? (
        <LensDistortion {...common} speed={speed} />
      ) : (
        <ImageDithering {...common} speed={speed} />
      )}
    </div>
  );
}
