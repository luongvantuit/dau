import { EventTimeline } from "@/components/event/event-timeline";
import { BackgroundMesh } from "@/components/shaders/background-mesh";
import { SITE } from "@/data/site";
import { getAllEvents } from "@/lib/events";

export default function Home() {
  const events = getAllEvents();
  const palette = events[0]?.palette ?? ["#ffd9e8", "#fff4d6", "#d9ecff", "#f0dcff"];

  return (
    <>
      <BackgroundMesh palette={palette} />
      <main className="flex flex-1 flex-col gap-16 py-24">
        <header className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center">
          <h1 className="text-6xl font-extrabold sm:text-7xl">{SITE.name}</h1>
          <p className="font-sans text-lg text-muted-foreground">{SITE.fullName}</p>
          <p className="max-w-prose font-sans text-base text-muted-foreground">
            {SITE.description}
          </p>
        </header>
        <EventTimeline events={events} />
      </main>
    </>
  );
}
