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
      {/* Palette là màu pastel sáng; để nguyên trên nền tối sẽ chói và nuốt
          hết chữ, nên giảm độ đục ở dark mode thay vì làm hai bảng màu. */}
      <div className="h-full w-full opacity-100 dark:opacity-40">
        <MeshGradient
          colors={[...palette]}
          distortion={1.1}
          swirl={0.75}
          speed={reducedMotion ? 0 : 0.28}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Chỉ một lớp duy nhất, và nó trong suốt ở giữa. Bản trước chồng ba lớp
          (nền phẳng + dải dọc + vệt góc) nên shader bị dìm gần hết. Giờ đậm ở
          đỉnh và đáy để chữ trong nav/footer đủ tương phản, còn khoảng giữa
          để trống cho màu chạy. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
    </div>
  );
}
