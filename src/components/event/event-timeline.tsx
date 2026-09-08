"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Fragment } from "react";

import { PhotoImage } from "@/components/gallery/photo-image";
import { MilestoneTicket, NowTicket } from "@/components/event/milestone-ticket";
import { Card } from "@/components/ui/card";
import type { SiteEvent } from "@/data/events";
import { useNow } from "@/hooks/use-now";
import { toISODate } from "@/lib/dates";
import { getPhotos } from "@/lib/photos";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Chấm trên trục. Mốc đã qua tô đặc, mốc chưa tới để rỗng viền. */
function Dot({ filled, pulse, delay = 0 }: { filled: boolean; pulse: boolean; delay?: number }) {
  return (
    <span
      aria-hidden
      className="absolute top-1.5 left-0 flex size-[15px] items-center justify-center md:size-[19px]"
    >
      {pulse ? (
        <motion.span
          className="absolute inset-0 rounded-full bg-primary/30 dark:bg-primary/45"
          animate={{ scale: [1, 1.85, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay }}
        />
      ) : null}
      <span
        className={
          filled
            ? "relative size-2.5 rounded-full bg-primary md:size-3"
            : // Không dùng bg-background cho tâm và cũng không bọc ring-background:
              // nền trang là navy rất tối (L≈8) trong khi phía sau chấm là shader
              // sáng hơn hẳn, nên cả hai đều hiện ra thành vành/tâm đen.
              "relative size-2.5 rounded-full border-2 border-primary bg-primary/30 md:size-3"
        }
      />
    </span>
  );
}

export function EventTimeline({ events }: { events: SiteEvent[] }) {
  const now = useNow();
  const today = now ? toISODate(now) : null;

  // Vị trí chèn vé "hôm nay": ngay trước mốc đầu tiên còn ở tương lai. Không
  // còn mốc nào chưa tới thì vé nằm cuối danh sách.
  const firstUpcoming = today ? events.findIndex((event) => event.date > today) : -1;
  const nowIndex = today ? (firstUpcoming === -1 ? events.length : firstUpcoming) : null;

  const renderNow = (position: number) =>
    now && nowIndex === position ? (
      <motion.li
        key="hom-nay"
        className="relative flex flex-col gap-2 pl-8 md:pl-10"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <Dot filled pulse />
        <div className="max-w-xs">
          <NowTicket now={now} />
        </div>
      </motion.li>
    ) : null;

  return (
    <ol className="relative mx-auto flex w-full max-w-4xl flex-col gap-8 px-5">
      {/* Đường trục chạy dọc sau các chấm. Lệch trái trên mobile, vào giữa cột
          chấm ở desktop. */}
      <div
        aria-hidden
        className="absolute top-2 bottom-2 left-[calc(1.25rem+7px)] w-px bg-gradient-to-b from-transparent via-border to-transparent md:left-[calc(1.25rem+9px)] dark:via-primary/35"
      />

      {events.map((event, index) => {
        const [cover] = getPhotos(event);
        const past = today !== null && event.date <= today;
        return (
          <Fragment key={event.slug}>
          {renderNow(index)}
          <motion.li
            className="relative flex flex-col gap-2.5 pl-8 md:pl-10"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: EASE }}
          >
            <Dot filled={past} pulse={!past} delay={index * 0.4} />

            {/* Vé mang thông tin ngày, và đồng hồ đếm ngược nếu mốc chưa tới. */}
            <div className="max-w-xs">
              <MilestoneTicket date={event.date} title={event.title} now={now} />
            </div>

            <Card className="overflow-hidden border-border/50 bg-card/70 p-0 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-xl dark:border-white/10 dark:bg-card/80 dark:hover:border-primary/30">
              <Link href={`/${event.slug}`} className="flex gap-4 sm:gap-5">
                {/* w-24 cố định thay vì thẻ dọc xếp chồng: trước đây trên mobile
                    ảnh chiếm trọn bề ngang nên phần chữ bị đẩy hẳn xuống dưới. */}
                <div className="w-24 shrink-0 sm:w-36">
                  <PhotoImage
                    photo={cover}
                    sizes="(max-width: 640px) 96px, 144px"
                    className="aspect-[2/3] h-full"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-1 py-4 pr-4 sm:gap-1.5">
                  {/* Ngày đã nằm trên vé ngay phía trên, không lặp lại ở đây. */}
                  <h3 className="text-lg leading-tight font-bold sm:text-2xl">{event.title}</h3>
                  {event.tagline ? (
                    <p className="font-sans text-xs text-muted-foreground sm:text-sm">
                      {event.tagline}
                    </p>
                  ) : null}
                </div>
              </Link>
            </Card>
          </motion.li>
          </Fragment>
        );
      })}

      {/* Mọi mốc đều đã qua thì vé "hôm nay" đứng cuối dòng thời gian. */}
      {renderNow(events.length)}
    </ol>
  );
}
