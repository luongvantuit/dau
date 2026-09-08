"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";

/** Biên độ trôi theo chuột, theo đơn vị offset của shader (khoảng -1..1). */
const STRENGTH = 0.22;
/** Hệ số bám mỗi khung hình: càng nhỏ càng trôi chậm và mượt. */
const FOLLOW = 0.055;
/** Dưới ngưỡng này coi như đã bám kịp, dừng vòng lặp. */
const SETTLED = 0.0015;

export function BackgroundMesh({ palette }: { palette: readonly string[] }) {
  const reducedMotion = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const value = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (reducedMotion) return;

    let frame = 0;

    const tick = () => {
      const v = value.current;
      const t = target.current;
      v.x += (t.x - v.x) * FOLLOW;
      v.y += (t.y - v.y) * FOLLOW;

      const settled = Math.abs(t.x - v.x) < SETTLED && Math.abs(t.y - v.y) < SETTLED;
      if (settled) {
        v.x = t.x;
        v.y = t.y;
      }
      setOffset({ x: v.x, y: v.y });

      // Dừng hẳn khi đã bám kịp: shader đã tự chạy một vòng rAF riêng, để thêm
      // một vòng chạy không tải nữa chỉ tốn pin.
      frame = settled ? 0 : requestAnimationFrame(tick);
    };

    const onMove = (event: PointerEvent) => {
      target.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2 * STRENGTH,
        y: (event.clientY / window.innerHeight - 0.5) * 2 * STRENGTH,
      };
      if (frame === 0) frame = requestAnimationFrame(tick);
    };

    // Nghe ở window chứ không ở canvas: cả lớp nền đặt pointer-events: none để
    // không chắn click, nên chính nó không nhận được sự kiện chuột nào.
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  return (
    <div
      aria-hidden
      // w-screen chứ không phải inset-0 cho bề ngang: khối chứa của phần tử
      // fixed không tính máng cuộn, mà trang luôn chừa sẵn máng (overflow-y:
      // scroll), nên inset-0 để hở một sọc ~11px ở mép phải lộ nền navy.
      className="pointer-events-none fixed inset-y-0 left-0 -z-10 w-screen dark:brightness-[0.42] dark:saturate-[1.7]"
      // Gradient CSS nằm dưới canvas: nếu WebGL không chạy được (máy cũ, trình
      // duyệt chặn) thì vẫn thấy đúng tông màu thay vì nền trắng trơn.
      style={{ background: `linear-gradient(140deg, ${palette.join(", ")})` }}
    >
      {/* Bộ lọc giảm sáng cho nền tối đặt ở thẻ NGOÀI, cùng chỗ với gradient
          dự phòng. Để nó ở thẻ trong thì gradient dự phòng không bị giảm sáng,
          và vì canvas chỉ dựng sau khi hydrate nên lúc mới vào trang người dùng
          thấy nguyên dải pastel chói rồi mới sập xuống tối — đúng một cái nháy.
          Dùng filter chứ không hạ opacity: pastel mờ 40% trên nền navy ra màn
          sương xám, còn giảm sáng + tăng bão hoà thì giữ được sắc màu. */}
      <div className="shader-layer h-full w-full">
        <MeshGradient
          colors={[...palette]}
          distortion={1.1}
          swirl={0.75}
          speed={reducedMotion ? 0 : 0.28}
          offsetX={offset.x}
          offsetY={offset.y}
          style={{ width: "100%", height: "100%" }}
        />
      </div>

      {/* Ở đây từng có một lớp che hai đầu: gradient
          from-background -> transparent -> to-background phủ 80%, đặt ra để
          header và footer đủ tương phản. Đã xoá hẳn vì chính nó tô ra một mảng
          PHẲNG đúng bằng --background ngay chỗ header và footer đứng, ở cả hai
          chế độ màu. Đo trên ảnh chụp nền sáng: y=2..30 ra #f4f3f8 trong khi
          --background là #f7f9fb, tới y=60 mới thấy shader. Tương phản giờ do
          nền của .liquid-glass lo, đo lại vẫn dư. */}
    </div>
  );
}
