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
        distortion={0.9}
        swirl={0.45}
        speed={reducedMotion ? 0 : 0.12}
        style={{ width: "100%", height: "100%" }}
      />

      {/* Bản trước phủ bg-background/55 + backdrop-blur-2xl lên toàn trang, làm
          màu bệt thành xám bùn. Giờ chỉ làm sáng nhẹ và đều bằng một lớp mỏng,
          giữ nguyên độ trong của màu. */}
      <div className="absolute inset-0 bg-background/35" />

      {/* Dải sáng dọc: đậm ở hai đầu, trong ở giữa. Nhờ vậy chữ ở đầu trang và
          chân trang luôn đủ tương phản, còn khoảng giữa vẫn thấy rõ chuyển
          động của shader. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/25 to-background" />

      {/* Vệt tối bốn góc, kéo mắt vào giữa thay vì để nền loang đều. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,color-mix(in_oklch,var(--foreground)_10%,transparent)_100%)]" />
    </div>
  );
}
