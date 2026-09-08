import { LogoMark } from "@/components/site/logo";
import { AnimatedGroup } from "@/components/ui/motion-primitives/animated-group";
import { TextEffect } from "@/components/ui/motion-primitives/text-effect";
import type { SiteEvent } from "@/data/events";
import { formatDateNumeric } from "@/lib/dates";
import { getEventAge } from "@/lib/events";

export function EventHero({ event, photoCount }: { event: SiteEvent; photoCount: number }) {
  const age = getEventAge(event);

  const stats = [
    { label: "Ngày", value: formatDateNumeric(event.date) },
    { label: "Tuổi", value: age > 0 ? `${age} tuổi` : "Chào đời" },
    { label: "Ảnh", value: `${photoCount}` },
  ];

  return (
    <AnimatedGroup
      as="header"
      preset="blur-slide"
      className="flex flex-col items-center gap-3 px-5 text-center"
    >
      <LogoMark className="size-10 drop-shadow-sm md:size-12" />
      {/* Cỡ chữ bắt đầu từ mức đọc được trên điện thoại rồi mới nở ra: đặt
          text-7xl ngay từ breakpoint nhỏ nhất thì tiêu đề tràn khỏi màn 390px. */}
      <TextEffect
        as="h1"
        per="char"
        preset="fade-in-blur"
        speedSegment={2.2}
        className="text-4xl font-extrabold sm:text-6xl md:text-7xl"
      >
        {event.title}
      </TextEffect>
      {event.tagline ? (
        <p className="font-sans text-base text-muted-foreground sm:text-lg">{event.tagline}</p>
      ) : null}
      <dl className="mt-3 grid w-full max-w-md grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border/50 bg-border/50 text-center shadow-sm dark:border-white/10 dark:bg-white/10">
        {stats.map((stat) => (
          <div
                key={stat.label}
                className="flex flex-col items-center justify-center gap-1.5 bg-card/70 px-3 py-5 backdrop-blur sm:px-4 dark:bg-card/85"
              >
            <dt className="font-sans text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">
              {stat.label}
            </dt>
            <dd className="font-sans text-sm font-semibold tabular-nums sm:text-base">{stat.value}</dd>
          </div>
        ))}
      </dl>
    </AnimatedGroup>
  );
}
