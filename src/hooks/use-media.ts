"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Theo dõi một media query. Dùng useSyncExternalStore thay vì useState +
 * useEffect: matchMedia là nguồn dữ liệu ngoài React, và cách này không gây
 * render thừa ở lần mount đầu.
 *
 * Server không biết kích thước màn hình nên trả về true (giả định màn rộng);
 * client tự chỉnh lại ngay khi hydrate.
 */
export function useMedia(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => true,
  );
}
