"use client";

import { motion, type Transition } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";

/**
 * Hiện dần khi cuộn tới. Dùng useInView thay vì whileInView để giữ được tham
 * chiếu ref — nhờ đó phần tử ngoài màn hình vẫn nằm đúng chỗ trong lưới, chỉ
 * phần hiển thị mới đổi.
 */
export function Reveal({
  children,
  delay = 0,
  duration = 0.9,
  distance = 40,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  distance?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  // once: chạy một lần rồi thôi, cuộn ngược lên không phát lại gây rối mắt.
  // margin âm lớn hơn trước: bắt đầu khi phần tử còn cách mép dưới một quãng,
  // nhờ đó xem hết được chuyển động thay vì thấy nó đã xong lúc cuộn tới.
  const inView = useInView(ref, { once: true, margin: "-120px" });

  const transition: Transition = {
    duration,
    delay,
    ease: [0.22, 1, 0.36, 1],
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: distance, scale: 0.96 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
