import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Carousel3D } from "@/components/gallery/carousel-3d";
import { BackgroundMesh } from "@/components/shaders/background-mesh";
import { formatDateVi } from "@/lib/dates";
import { getAllEvents, getEvent, getEventAge } from "@/lib/events";
import { getPhotos } from "@/lib/photos";

export function generateStaticParams() {
  return getAllEvents().map((event) => ({ slug: event.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.description,
    openGraph: { title: event.title, description: event.description },
  };
}

export default async function EventPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const photos = getPhotos(event);
  const age = getEventAge(event);

  return (
    <>
      <BackgroundMesh palette={event.palette} />
      <main className="flex flex-1 flex-col gap-12 py-20">
        <header className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-6 text-center">
          <Link href="/" className="font-sans text-sm text-muted-foreground hover:underline">
            ← Tất cả cột mốc
          </Link>
          <p className="font-sans text-sm text-muted-foreground">{formatDateVi(event.date)}</p>
          <h1 className="text-5xl font-extrabold sm:text-6xl">{event.title}</h1>
          {event.tagline ? (
            <p className="font-sans text-lg text-muted-foreground">{event.tagline}</p>
          ) : null}
          <p className="font-sans text-sm text-muted-foreground">
            {age > 0 ? `${age} tuổi` : "Chào đời"}
          </p>
        </header>

        <section className="px-6">
          <Carousel3D photos={photos} />
        </section>

        {event.note ? (
          <section className="mx-auto max-w-prose px-6">
            <p className="whitespace-pre-line text-center font-sans text-base leading-relaxed">
              {event.note}
            </p>
          </section>
        ) : null}
      </main>
    </>
  );
}
