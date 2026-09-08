import { EventTimeline } from "@/components/event/event-timeline";
import { BackgroundMesh } from "@/components/shaders/background-mesh";
import { AnimatedGroup } from "@/components/ui/motion-primitives/animated-group";
import { TextEffect } from "@/components/ui/motion-primitives/text-effect";
import { SITE } from "@/data/site";
import { getAllEvents } from "@/lib/events";

export default function Home() {
  const events = getAllEvents();
  const palette = events[0]?.palette ?? ["#ffd9e8", "#fff4d6", "#d9ecff", "#f0dcff"];

  return (
    <>
      <BackgroundMesh palette={palette} />
      <main className="flex flex-1 flex-col gap-16 py-24">
        <AnimatedGroup
          as="header"
          preset="blur-slide"
          className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center"
        >
          <TextEffect
            as="h1"
            per="char"
            preset="fade-in-blur"
            speedSegment={1.6}
            className="text-7xl font-extrabold sm:text-8xl md:text-9xl"
          >
            {SITE.name}
          </TextEffect>
          <p className="font-sans text-lg text-muted-foreground md:text-xl">{SITE.fullName}</p>
          <p className="max-w-prose font-sans text-base text-muted-foreground">
            {SITE.description}
          </p>
        </AnimatedGroup>
        <EventTimeline events={events} />
      </main>
    </>
  );
}
