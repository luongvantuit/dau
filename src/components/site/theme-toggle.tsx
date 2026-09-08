"use client";

import { useTheme } from "next-themes";
import { useRef } from "react";
import { flushSync } from "react-dom";

import { Button } from "@/components/ui/button";
import { SunMoonIcon, type SunMoonIconHandle } from "@/components/ui/sun-moon";

/** Kiểu cho View Transitions API — chưa có trong lib.dom mặc định. */
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => { ready: Promise<void> };
};

const DURATION = 520;

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const iconRef = useRef<SunMoonIconHandle>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    const button = buttonRef.current;
    const start = (document as ViewTransitionDocument).startViewTransition?.bind(document);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Trình duyệt không hỗ trợ hoặc người dùng tắt chuyển động thì đổi thẳng.
    if (!start || !button || reduced) {
      setTheme(next);
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    // Bán kính tới góc xa nhất, để vòng tròn phủ kín màn hình.
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );

    const transition = start(() => {
      // flushSync + tự bật class: View Transitions chụp ảnh DOM ngay khi
      // callback trả về, mà setTheme của next-themes áp class trong effect nên
      // ảnh "sau" sẽ vẫn là nền cũ. Tự bật class thì ảnh chụp chắc chắn đúng,
      // setTheme vẫn gọi để lưu lựa chọn.
      flushSync(() => {
        document.documentElement.classList.toggle("dark", next === "dark");
        setTheme(next);
      });
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`],
        },
        {
          duration: DURATION,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          pseudoElement: "::view-transition-new(root)",
        },
      );
    });
  };

  return (
    <Button
      ref={buttonRef}
      variant="ghost"
      size="icon"
      aria-label="Đổi nền sáng/tối"
      onClick={toggle}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      <SunMoonIcon ref={iconRef} size={18} />
    </Button>
  );
}
