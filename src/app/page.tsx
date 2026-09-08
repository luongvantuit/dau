import { EventTimeline } from "@/components/event/event-timeline";
import { LogoMark } from "@/components/site/logo";
import { SectionHeading } from "@/components/site/section-heading";
import { AnimatedGroup } from "@/components/ui/motion-primitives/animated-group";
import { TextEffect } from "@/components/ui/motion-primitives/text-effect";
import { SITE } from "@/data/site";
import { formatDateNumeric } from "@/lib/dates";
import { getAllEvents } from "@/lib/events";
import { getPhotos } from "@/lib/photos";


export default function Home() {
  const events = getAllEvents();
  const photoCount = events.reduce((total, event) => total + getPhotos(event).length, 0);

  // Số liệu tĩnh, suy ra từ registry lúc build. Không tính "hiện đang mấy
  // tháng tuổi" vì trang là static export, con số đó sẽ cũ dần sau mỗi ngày.
  const stats = [
    { label: "Ngày sinh", value: formatDateNumeric(SITE.birthDate) },
    { label: "Cột mốc", value: `${events.length}` },
    { label: "Khoảnh khắc", value: `${photoCount}` },
  ];

  return (
    <>
      <main className="flex flex-1 flex-col gap-16 py-12 md:gap-24 md:py-20">
        <AnimatedGroup
          as="header"
          preset="blur-slide"
          className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-5 text-center"
        >
          <LogoMark className="size-14 drop-shadow-sm md:size-16" />

          <div className="flex flex-col items-center gap-2">
            <TextEffect
              as="h1"
              per="char"
              preset="fade-in-blur"
              speedSegment={1.6}
              className="text-5xl font-extrabold sm:text-7xl md:text-8xl"
            >
              {SITE.name}
            </TextEffect>
            <p className="font-sans text-base tracking-wide text-muted-foreground sm:text-lg">
              {SITE.fullName}
            </p>
          </div>

          <p className="max-w-prose font-sans text-sm text-muted-foreground sm:text-base">
            {SITE.description}
          </p>

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

        <section className="flex flex-col gap-8">
          <SectionHeading hint="Bấm vào từng mốc để xem ảnh">Các cột mốc</SectionHeading>
          <EventTimeline events={events} />
        </section>
      </main>
    </>
  );
}
