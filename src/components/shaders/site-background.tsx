"use client";

import { usePathname } from "next/navigation";

import { BackgroundMesh } from "@/components/shaders/background-mesh";
import { getAllEvents } from "@/lib/events";

/** Bảng màu khi không đứng ở trang sự kiện nào (trang chủ, 404). */
const FALLBACK_PALETTE = ["#a8c6e8", "#f0c49a", "#8fb4dd", "#ffe9c9"] as const;

/**
 * Lớp nền dựng ở layout chứ không ở từng trang, và phải nằm NGOÀI template.tsx.
 *
 * template.tsx bọc mọi trang trong một motion.div animate y: 12 -> 0. Phần tử
 * đang có transform sẽ trở thành containing block cho con position: fixed, nên
 * đặt lớp nền bên trong đó thì suốt lúc chuyển trang nó không bám khung nhìn
 * nữa mà tụt xuống dưới header và cụt trước footer — hở đúng hai chỗ đó ra màu
 * --background. Đo được: rect y=80 h=1007 trong khung nhìn cao 780.
 *
 * Bảng màu suy từ đường dẫn để mỗi sự kiện vẫn giữ tông riêng.
 */
export function SiteBackground() {
  const pathname = usePathname();
  const event = getAllEvents().find((item) => pathname === `/${item.slug}`);

  return <BackgroundMesh palette={event?.palette ?? FALLBACK_PALETTE} />;
}
