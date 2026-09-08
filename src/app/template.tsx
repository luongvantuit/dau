"use client";

import { motion } from "motion/react";

// template.tsx (khác layout.tsx) được dựng lại mỗi lần điều hướng, nên đây là
// chỗ đúng để đặt animation chuyển trang.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="flex flex-1 flex-col"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
