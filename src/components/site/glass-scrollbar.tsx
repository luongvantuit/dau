"use client";

import { useRef, useSyncExternalStore } from "react";

/**
 * Thanh cuộn tự vẽ, nổi đè lên nội dung.
 *
 * Vì sao phải tự vẽ: thanh cuộn gốc của trình duyệt luôn chiếm một máng riêng
 * bên ngoài vùng nội dung, và không có gì của trang lọt xuống dưới nó được —
 * kể cả lớp shader position: fixed. Nên máng đó luôn phơi ra đúng màu nền gốc
 * (--background), thành một sọc phẳng dọc mép phải. Ẩn thanh gốc rồi vẽ đè một
 * thanh của mình là cách duy nhất để chỗ đó cũng là shader.
 *
 * Kèm theo: bỏ luôn được máng cuộn nên nội dung không còn nhảy ngang giữa các
 * trang, thứ mà trước đây phải chừa sẵn overflow-y: scroll mới xử lý được.
 */

// Snapshot là chuỗi chứ không phải object: useSyncExternalStore so sánh bằng
// Object.is, trả object mới mỗi lần gọi sẽ render vô tận.
function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  window.addEventListener("resize", onChange);
  const observer = new ResizeObserver(onChange);
  observer.observe(document.documentElement);
  return () => {
    window.removeEventListener("scroll", onChange);
    window.removeEventListener("resize", onChange);
    observer.disconnect();
  };
}

const getSnapshot = () =>
  `${Math.round(window.scrollY)}|${document.documentElement.scrollHeight}|${window.innerHeight}`;
const getServerSnapshot = () => "0|0|0";

export function GlassScrollbar() {
  const railRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; scroll: number } | null>(null);
  const [scrollY, docHeight, viewHeight] = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )
    .split("|")
    .map(Number);

  // Trang không tràn thì không có gì để cuộn.
  if (docHeight <= viewHeight + 1) return null;

  const thumbHeight = Math.max((viewHeight / docHeight) * 100, 6);
  const thumbTop = (scrollY / docHeight) * 100;

  return (
    <div
      ref={railRef}
      // group + opacity: chỉ hiện khi rê chuột vào dải mép phải, đúng như thanh
      // cuộn nổi của macOS. Dải rộng 14px, đủ để trỏ trúng mà không chắn nội dung.
      className="group fixed top-0 right-0 z-[70] hidden h-full w-3.5 opacity-0 transition-opacity duration-200 hover:opacity-100 md:block"
    >
      <div
        role="presentation"
        onPointerDown={(event) => {
          drag.current = { y: event.clientY, scroll: window.scrollY };
          event.currentTarget.setPointerCapture(event.pointerId);
          event.preventDefault();
        }}
        onPointerMove={(event) => {
          const start = drag.current;
          const rail = railRef.current;
          if (!start || !rail) return;
          // Quãng chuột trên thanh quy đổi sang quãng cuộn của tài liệu.
          const ratio = docHeight / rail.clientHeight;
          window.scrollTo({ top: start.scroll + (event.clientY - start.y) * ratio });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
        style={{ height: `${thumbHeight}%`, top: `${thumbTop}%` }}
        className="liquid-glass absolute right-1 w-2 min-h-9 cursor-grab rounded-full shadow-sm active:cursor-grabbing"
      />
    </div>
  );
}
