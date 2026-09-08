"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";

export function BackgroundMesh({ palette }: { palette: readonly string[] }) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      // Gradient CSS nằm dưới canvas: nếu WebGL không chạy được (máy cũ, trình
      // duyệt chặn) thì vẫn thấy đúng tông màu thay vì nền trắng trơn.
      style={{ background: `linear-gradient(140deg, ${palette.join(", ")})` }}
    >
      <MeshGradient
        colors={[...palette]}
        distortion={0.8}
        swirl={0.6}
        speed={reducedMotion ? 0 : 0.15}
        style={{ width: "100%", height: "100%" }}
      />
      {/* Làm dịu nền để chữ đọc được ở cả sáng lẫn tối. */}
      <div className="absolute inset-0 bg-background/55 backdrop-blur-2xl" />
    </div>
  );
}
