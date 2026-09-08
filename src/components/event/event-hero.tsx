import { AnimatedGroup } from "@/components/ui/motion-primitives/animated-group";
import { TextEffect } from "@/components/ui/motion-primitives/text-effect";
import type { SiteEvent } from "@/data/events";
import { formatDateVi } from "@/lib/dates";
import { getEventAge } from "@/lib/events";

export function EventHero({ event }: { event: SiteEvent }) {
  const age = getEventAge(event);

  return (
    <AnimatedGroup
      as="header"
      preset="blur-slide"
      className="flex flex-col items-center gap-3 px-5 text-center"
    >
      <p className="font-sans text-xs tracking-wide text-muted-foreground uppercase sm:text-sm">
        {formatDateVi(event.date)}
      </p>
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
      <p className="rounded-full bg-card/70 px-4 py-1 font-sans text-sm font-medium backdrop-blur">
        {age > 0 ? `${age} tuổi` : "Chào đời"}
      </p>
    </AnimatedGroup>
  );
}
