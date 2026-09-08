import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { EventHero } from "@/components/event/event-hero";
import { Carousel3D } from "@/components/gallery/carousel-3d";
import { ParallaxGallery } from "@/components/gallery/parallax-gallery";
import { BackgroundMesh } from "@/components/shaders/background-mesh";
import { getEvent } from "@/lib/events";
import { carouselPhotos, getPhotos } from "@/lib/photos";

// Route cố định thay vì [slug]: mỗi sự kiện có thể xếp layout riêng mà không
// phải nhồi điều kiện vào một trang dùng chung. Dữ liệu vẫn lấy từ registry.
const SLUG = "sinh-nhat-1-tuoi";

export function generateMetadata(): Metadata {
  const event = getEvent(SLUG);
  if (!event) return {};
  return {
    title: event.title,
    description: event.description,
    openGraph: { title: event.title, description: event.description },
  };
}

export default function SinhNhat1TuoiPage() {
  const event = getEvent(SLUG);
  if (!event) notFound();

  const photos = getPhotos(event);
  const stack = carouselPhotos(photos);

  return (
    <>
      <BackgroundMesh palette={event.palette} />

      <main className="flex flex-1 flex-col gap-12 py-10 md:gap-20 md:py-14">
        <EventHero event={event} />

        <section aria-label="Xem từng ảnh" className="px-4">
          <Carousel3D photos={stack} />
        </section>

        <section aria-label="Tất cả ảnh" className="flex flex-col gap-6">
          <h2 className="px-5 text-center text-xl font-bold md:text-3xl">
            {photos.length} khoảnh khắc
          </h2>
          <ParallaxGallery photos={photos} />
        </section>

        {event.note ? (
          <section className="mx-auto max-w-prose px-5">
            <p className="whitespace-pre-line text-center font-sans text-base leading-relaxed">
              {event.note}
            </p>
          </section>
        ) : null}
      </main>
    </>
  );
}
