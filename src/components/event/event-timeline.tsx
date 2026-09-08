"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { PhotoImage } from "@/components/gallery/photo-image";
import { Card } from "@/components/ui/card";
import type { SiteEvent } from "@/data/events";
import { formatDateVi } from "@/lib/dates";
import { getPhotos } from "@/lib/photos";

export function EventTimeline({ events }: { events: SiteEvent[] }) {
  return (
    <ol className="relative mx-auto flex w-full max-w-4xl flex-col gap-8 px-5">
      {/* Đường trục chạy dọc sau các chấm. Lệch trái trên mobile, vào giữa cột
          chấm ở desktop. */}
      <div
        aria-hidden
        className="absolute top-2 bottom-2 left-[calc(1.25rem+7px)] w-px bg-gradient-to-b from-transparent via-border to-transparent md:left-[calc(1.25rem+9px)]"
      />

      {events.map((event, index) => {
        const [cover] = getPhotos(event);
        return (
          <motion.li
            key={event.slug}
            className="relative flex gap-5 pl-8 md:gap-7 md:pl-10"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Chấm mốc: vòng ngoài nở ra rồi mờ đi, gợi nhịp đập. */}
            <span aria-hidden className="absolute top-1.5 left-0 flex size-[15px] items-center justify-center md:size-[19px]">
              <motion.span
                className="absolute inset-0 rounded-full bg-primary/30"
                animate={{ scale: [1, 1.85, 1], opacity: [0.55, 0, 0.55] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut", delay: index * 0.4 }}
              />
              <span className="relative size-2.5 rounded-full bg-primary ring-4 ring-background md:size-3" />
            </span>

            <Card className="flex-1 overflow-hidden border-border/50 bg-card/70 p-0 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <Link href={`/${event.slug}`} className="flex gap-4 sm:gap-5">
                {/* w-28 cố định thay vì thẻ dọc xếp chồng: trước đây trên mobile
                    ảnh chiếm trọn bề ngang nên phần chữ bị đẩy hẳn xuống dưới. */}
                <div className="w-24 shrink-0 sm:w-36">
                  <PhotoImage
                    photo={cover}
                    sizes="(max-width: 640px) 96px, 144px"
                    className="aspect-[2/3] h-full"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center gap-1 py-4 pr-4 sm:gap-1.5">
                  <time
                    dateTime={event.date}
                    className="font-sans text-[0.7rem] tracking-wide text-primary uppercase sm:text-xs"
                  >
                    {formatDateVi(event.date)}
                  </time>
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
        );
      })}
    </ol>
  );
}
