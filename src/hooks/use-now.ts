"use client";

import { useSyncExternalStore } from "react";

/**
 * Một đồng hồ dùng chung cho cả trang thay vì mỗi component một setInterval:
 * các vé nhờ đó nhảy số cùng lúc, và chỉ tốn đúng một timer dù có bao nhiêu
 * mốc. Dùng useSyncExternalStore chứ không phải useEffect + setState vì gọi
 * setState thẳng trong effect gây thêm một vòng render nữa ngay sau mount.
 */
let currentMs = 0; // 0 = chưa có giờ thật (server, hoặc trước khi mount)
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(listener: () => void) {
  listeners.add(listener);

  if (timer === null) {
    currentMs = Date.now();
    timer = setInterval(() => {
      currentMs = Date.now();
      for (const notify of listeners) notify();
    }, 1000);
  }

  // Báo ngay cho người vừa đăng ký: snapshot vừa đổi từ 0 sang giờ thật, không
  // gọi thì phải chờ hết một nhịp 1 giây mới thấy đồng hồ hiện ra.
  listener();

  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

// Trả về số nguyên chứ không phải Date mới mỗi lần: useSyncExternalStore so
// sánh snapshot bằng Object.is, cấp một object mới mỗi lần gọi sẽ render vô tận.
const getSnapshot = () => currentMs;
const getServerSnapshot = () => 0;

/** Thời điểm hiện tại, cập nhật mỗi giây. null cho tới khi component mount. */
export function useNow(): Date | null {
  const ms = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return ms === 0 ? null : new Date(ms);
}
