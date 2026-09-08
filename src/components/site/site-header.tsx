"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";


import { LogoMark } from "@/components/site/logo";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { SITE } from "@/data/site";
import type { SiteEvent } from "@/data/events";

export function SiteHeader({ events }: { events: SiteEvent[] }) {
  const pathname = usePathname();
  // Trang chủ đã có nguyên dòng thời gian ngay bên dưới; lặp lại đúng những
  // link đó trên nav chỉ làm rối.
  const onHome = pathname === "/";

  return (
    // Khối kính nổi, chừa lề để thấy được bo góc. sticky nằm ở lớp ngoài cùng
    // vì transform sẽ tạo containing block mới và làm sticky mất tác dụng.
    <header className="sticky top-0 z-50 px-3 pt-3">
      {/* header-bar: mở trang ra là một viên bo tròn nhỏ, rồi nở ngang thành
          thanh kính đúng khổ. Chạy một lần lúc tải, không dính gì tới cuộn.
          Nội dung bên trong chỉ có logo, một khoảng co giãn và nút đổi nền, nên
          lúc thanh còn hẹp nó chỉ bị bóp lại chứ không xuống dòng. */}
      <nav className="liquid-glass header-bar relative mx-auto flex h-14 w-full max-w-6xl items-center overflow-hidden rounded-2xl px-4 shadow-lg sm:px-5">
        {/* Hiệu ứng vào màn đặt ở lớp NỘI DUNG, tuyệt đối không đặt lên chính
            thẻ .liquid-glass hay bất kỳ tổ tiên nào của nó: phần tử có
            opacity < 1 tạo ra một "backdrop root" mới, backdrop-filter khi đó
            không còn gì phía sau để lấy mẫu và đổ ra một mảng đen. Đó chính là
            khoảng đen loé lên sau header lúc trang vừa mở. */}
        <motion.div
          className="flex w-full items-center gap-6"
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <LogoMark className="size-7" />
            <span className="text-xl font-extrabold tracking-tight">{SITE.name}</span>
          </Link>

          <div className="flex flex-1 items-center gap-1 overflow-x-auto">
            {onHome
              ? null
              : events.map((event) => (
                  <Link
                    key={event.slug}
                    href={`/${event.slug}`}
                    aria-current={pathname === `/${event.slug}` ? "page" : undefined}
                    className="rounded-lg px-3 py-1.5 font-sans text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:text-foreground"
                  >
                    {event.title}
                  </Link>
                ))}
          </div>

          <ThemeToggle />
        </motion.div>
      </nav>
    </header>
  );
}
