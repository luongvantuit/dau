"use client";

import Link from "next/link";

import { PhotoImage } from "@/components/gallery/photo-image";
import { Card } from "@/components/ui/card";
import { AnimatedGroup } from "@/components/ui/motion-primitives/animated-group";
import type { SiteEvent } from "@/data/events";
import { formatDateVi } from "@/lib/dates";
import { getPhotos } from "@/lib/photos";

export function EventTimeline({ events }: { events: SiteEvent[] }) {
  return (
    <AnimatedGroup
      as="ol"
      preset="blur-slide"
      className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5"
    >
      {events.map((event) => {
        const [cover] = getPhotos(event);
        return (
          <li key={event.slug}>
            <Card className="overflow-hidden border-border/50 bg-card/70 p-0 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-xl">
              <Link href={`/${event.slug}`} className="flex flex-col gap-4 sm:flex-row">
                <div className="w-full shrink-0 sm:w-40">
                  <PhotoImage
                    photo={cover}
                    sizes="(max-width: 640px) 100vw, 160px"
                    className="aspect-[3/4] h-full sm:aspect-[2/3] sm:rounded-l-xl"
                  />
                </div>
                <div className="flex flex-col justify-center gap-1 p-5 sm:pl-0">
                  <p className="font-sans text-xs uppercase tracking-wide text-muted-foreground">
                    {formatDateVi(event.date)}
                  </p>
                  <h2 className="text-2xl font-bold">{event.title}</h2>
                  {event.tagline ? (
                    <p className="font-sans text-sm text-muted-foreground">{event.tagline}</p>
                  ) : null}
                </div>
              </Link>
            </Card>
          </li>
        );
      })}
    </AnimatedGroup>
  );
}
