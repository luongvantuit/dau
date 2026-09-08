import { cn } from "cn";

/**
 * Hình hạt đậu — cùng hình với favicon (src/app/icon.svg). Sửa hình thì sửa
 * cả hai chỗ để logo trên trang và icon trên tab không lệch nhau.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn("size-7", className)}>
      <defs>
        <linearGradient id="logo-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f27fae" />
          <stop offset="0.55" stopColor="#f9a97f" />
          <stop offset="1" stopColor="#7fb8f2" />
        </linearGradient>
        <mask id="logo-bean">
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
      <rect width="32" height="32" rx="8" fill="url(#logo-bg)" />
      <rect width="32" height="32" fill="#fff" mask="url(#logo-bean)" />
    </svg>
  );
}
