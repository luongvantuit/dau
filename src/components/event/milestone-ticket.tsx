"use client";

import { motion } from "motion/react";

import { cn } from "cn";
import { SITE } from "@/data/site";
import { ageParts, countdownTo, formatDateVi, parseISODate, toISODate } from "@/lib/dates";

const pad = (value: number) => String(value).padStart(2, "0");

/** Cuống vé bên trái: hai dòng ngắn, cỡ chữ cố định để mọi vé cao bằng nhau. */
function Stub({ top, bottom, tone }: { top: string; bottom: string; tone: "muted" | "primary" }) {
  return (
    <div
      className={cn(
        "flex w-14 shrink-0 flex-col items-center justify-center gap-0.5 px-2 py-2 text-center",
        tone === "primary" ? "bg-primary text-primary-foreground" : "bg-primary/12 text-foreground",
      )}
    >
      <span className="font-sans text-base leading-none font-bold tabular-nums">{top}</span>
      <span className="font-sans text-[0.6rem] leading-none tracking-[0.08em] opacity-75">
        {bottom}
      </span>
    </div>
  );
}

/** Đường xé giữa cuống và thân vé. */
function Perforation() {
  return <div aria-hidden className="w-0 shrink-0 border-l border-dashed border-border/70" />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    // ticket = hai vết lõm hai mép (globals.css). bo góc nhỏ hơn vết lõm để
    // hai hiệu ứng không ăn vào nhau ở bốn góc.
    <div className="ticket flex items-stretch overflow-hidden rounded-lg bg-card/85 shadow-md ring-1 ring-border/40 backdrop-blur dark:bg-card/80 dark:ring-white/10">
      {children}
    </div>
  );
}

/**
 * Vé của một cột mốc. Mốc chưa tới thì kèm đồng hồ đếm ngược chạy theo `now`;
 * `now` là null cho tới khi component mount (xem useNow) nên lúc đó chỉ hiện
 * ngày, chưa hiện dòng đếm ngược.
 */
export function MilestoneTicket({
  date,
  title,
  now,
}: {
  date: string;
  title: string;
  now: Date | null;
}) {
  const { m, d } = parseISODate(date);
  const countdown = now ? countdownTo(date, now) : null;
  const upcoming = countdown ? !countdown.done : false;

  return (
    <Shell>
      <Stub top={pad(d)} bottom={`Th.${m}`} tone="muted" />
      <Perforation />
      <div className="flex min-w-0 flex-col justify-center gap-1 px-3 py-2">
        <span className="font-sans text-xs font-semibold sm:text-[0.8rem]">
          {formatDateVi(date)}
        </span>

        {/* Cùng bố cục với vé "Hôm nay": nhãn màu primary trước, rồi tới dòng
            phụ. Chừa sẵn chiều cao vì dòng đếm ngược chỉ xuất hiện sau khi
            mount — không chừa thì cả timeline nhích xuống một nhịp. */}
        <div className="flex min-h-[1.05rem] flex-wrap items-center gap-1.5">
          <span className="font-sans text-[0.7rem] font-semibold text-primary">{title}</span>
          {/* Không thêm chấm ngăn tĩnh ở đây: chấm nhấp nháy phía dưới vừa
              ngăn hai mẩu chữ vừa báo đồng hồ đang chạy, để cả hai thì thành
              hai chấm dính nhau. */}
          {countdown === null ? null : upcoming ? (
            <span className="flex items-center gap-1.5">
              <motion.span
                aria-hidden
                className="size-1.5 shrink-0 rounded-full bg-primary"
                animate={{ opacity: [1, 0.25, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="font-sans text-[0.7rem] text-muted-foreground tabular-nums">
                Còn {countdown.days} ngày {pad(countdown.hours)}:{pad(countdown.minutes)}:
                {pad(countdown.seconds)}
              </span>
            </span>
          ) : (
            <span className="font-sans text-[0.7rem] text-muted-foreground">Đã diễn ra</span>
          )}
        </div>
      </div>
    </Shell>
  );
}

/**
 * Vé đánh dấu hôm nay, chèn giữa các mốc để thấy đang đứng ở đâu trên dòng
 * thời gian. Chỉ render khi đã có `now`.
 */
export function NowTicket({ now }: { now: Date }) {
  const today = toISODate(now);
  const age = ageParts(SITE.birthDate, today);

  const parts = [
    age.years > 0 ? `${age.years} tuổi` : null,
    age.months > 0 ? `${age.months} tháng` : null,
    `${age.days} ngày`,
  ].filter(Boolean);

  const { m, d } = parseISODate(today);

  return (
    <Shell>
      {/* Cùng dáng cuống với vé mốc, chỉ khác màu: nhồi chữ "HÔM NAY" vào ô
          rộng 56px thì bị xuống dòng giữa từ. Nghĩa "hôm nay" do màu và dòng
          chữ bên thân vé đảm nhiệm. */}
      <Stub top={pad(d)} bottom={`Th.${m}`} tone="primary" />
      <Perforation />
      <div className="flex min-w-0 flex-col justify-center gap-1 px-3 py-2">
        <span className="font-sans text-xs font-semibold sm:text-[0.8rem]">
          {formatDateVi(today)}
        </span>
        <div className="flex min-h-[1.05rem] flex-wrap items-center gap-1.5">
          <span className="font-sans text-[0.7rem] font-semibold text-primary">Hôm nay</span>
          <span aria-hidden className="size-1 rounded-full bg-muted-foreground/50" />
          <span className="font-sans text-[0.7rem] text-muted-foreground">
            {SITE.name} được {parts.join(" ")}
          </span>
        </div>
      </div>
    </Shell>
  );
}
