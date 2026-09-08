"use client";

import { MotionConfig } from "motion/react";

/**
 * reducedMotion="user" để motion tự bỏ qua transform khi người dùng bật giảm
 * chuyển động. Rẽ nhánh bằng useReducedMotion ngay trong render thì server và
 * client ra markup khác nhau -> lỗi hydration.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
