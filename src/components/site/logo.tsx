"use client";

import { useId } from "react";

import { cn } from "cn";

/**
 * Hình hạt đậu theo lối Fluent: tile bo góc phủ gradient ấm, một vệt gloss
 * chéo ở góc trên trái, rồi hạt đậu trắng đặt chồng lên.
 *
 * Dải màu chỉ đi trong tông ấm (vàng đào -> cam -> đỏ đất). Bản trước có thêm
 * stop navy ngay trong dải này, mà cam và navy đối nhau trên vòng màu nên ở cỡ
 * nhỏ chúng hoà thành nâu olive đục.
 *
 * Sửa hình thì sửa cả src/app/icon.svg để logo trên trang và icon trên tab
 * không lệch nhau.
 *
 * Client component chỉ vì useId: logo xuất hiện nhiều lần trong một trang
 * (header, hero, footer) mà id trong SVG là duy nhất theo cả tài liệu. Đặt id
 * cố định thì ba bản dùng chung một định nghĩa, bản nào unmount trước là hai
 * bản còn lại trỏ vào id không còn tồn tại và mất sạch màu.
 */
export function LogoMark({ className }: { className?: string }) {
  const uid = useId();
  const tile = `tile-${uid}`;
  const bean = `bean-${uid}`;
  const gloss = `gloss-${uid}`;
  const cut = `cut-${uid}`;

  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)}>
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffc978" />
          <stop offset="0.55" stopColor="#ef8f3c" />
          <stop offset="1" stopColor="#d1512c" />
        </linearGradient>
        {/* Trắng ngả ấm rất nhẹ ở đáy: trắng phẳng tuyệt đối trông dẹt, còn
            đổi hẳn sang màu khác thì mất tương phản với tile cam. */}
        <linearGradient id={bean} x1="0.15" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#fff1de" />
        </linearGradient>
        <linearGradient id={gloss} x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.28" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        {/* Hình bầu dục nghiêng trừ đi một hình tròn = vết lõm của hạt đậu.
            Khối đặc đọc rõ hơn hẳn ở 16px so với nét vẽ mảnh. */}
        <mask id={cut}>
          <rect width="32" height="32" fill="black" />
          <ellipse
            cx="16.4"
            cy="15.8"
            rx="8.3"
            ry="11"
            transform="rotate(-38 16.4 15.8)"
            fill="white"
          />
          <circle cx="6.2" cy="23.2" r="5.9" fill="black" />
        </mask>
      </defs>

      <rect width="32" height="32" rx="9" fill={`url(#${tile})`} />
      {/* Vệt sáng chéo ôm góc trên trái, vẽ trước hạt đậu nên không làm nhoà hạt. */}
      <path d="M0 9a9 9 0 0 1 9-9h13L0 22Z" fill={`url(#${gloss})`} />
      <rect width="32" height="32" fill={`url(#${bean})`} mask={`url(#${cut})`} />
    </svg>
  );
}
