"use client";

import {
  FlutedGlass,
  GemSmoke,
  HalftoneCmyk,
  HalftoneDots,
  Heatmap,
  ImageDithering,
  LensDistortion,
  LiquidMetal,
  PaperTexture,
  Water,
} from "@paper-design/shaders-react";
import { useInView, useReducedMotion } from "motion/react";
import type { ComponentType } from "react";
import { useRef } from "react";

import type { ShaderEffect } from "@/data/events";
import type { Photo } from "@/lib/photos";
import { PhotoImage } from "./photo-image";

type ImageShaderProps = {
  image: string;
  fit?: "none" | "contain" | "cover";
  speed?: number;
  style?: React.CSSProperties;
};

// Bảng tra thay cho chuỗi if: thêm hiệu ứng mới chỉ là thêm một dòng, và
// TypeScript bắt lỗi ngay nếu union ShaderEffect có giá trị chưa khai báo ở đây.
const SHADERS: Record<
  Exclude<ShaderEffect, "none">,
  ComponentType<ImageShaderProps>
> = {
  "paper-texture": PaperTexture,
  "fluted-glass": FlutedGlass,
  water: Water,
  "image-dithering": ImageDithering,
  "halftone-dots": HalftoneDots,
  "halftone-cmyk": HalftoneCmyk,
  "lens-distortion": LensDistortion,
  "liquid-metal": LiquidMetal,
  "gem-smoke": GemSmoke,
  heatmap: Heatmap,
};

export function ShaderPhoto({ photo, effect }: { photo: Photo; effect: ShaderEffect }) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px" });
  // Cuộn qua rồi thì ngừng vẽ: context vẫn giữ (không mất canvas) nhưng GPU nghỉ.
  const speed = reducedMotion || !inView ? 0 : 0.4;

  // Bản 1600w: shader lấy ảnh làm texture nên cần độ phân giải cao nhất có.
  const source = photo.srcSet[photo.srcSet.length - 1].src;
  const Shader = effect === "none" ? null : SHADERS[effect];

  return (
    <div ref={ref} className="h-full w-full">
      {Shader ? (
        <Shader
          image={source}
          fit="cover"
          speed={speed}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <PhotoImage photo={photo} sizes="(max-width: 768px) 90vw, 520px" priority />
      )}
    </div>
  );
}
