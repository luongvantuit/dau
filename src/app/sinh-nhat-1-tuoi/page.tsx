import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventHero } from "@/components/event/event-hero";
import { Carousel3D } from "@/components/gallery/carousel-3d";
import { ParallaxGallery } from "@/components/gallery/parallax-gallery";
import { MusicButton } from "@/components/site/music-button";
import { ChevronLeftIcon } from "@/components/ui/chevron-left";
import { SectionHeading } from "@/components/site/section-heading";
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
      <main className="flex flex-1 flex-col gap-16 py-12 md:gap-24 md:py-20">
        <EventHero event={event} photoCount={photos.length} />

        <section aria-label="Xem từng ảnh" className="flex flex-col gap-8">
          <SectionHeading hint="Kéo hoặc bấm mũi tên để xoay qua từng tấm">
            Từng khoảnh khắc
          </SectionHeading>
          <div className="px-4">
            <Carousel3D photos={stack} />
          </div>
        </section>

        <section aria-label="Tất cả ảnh" className="flex flex-col gap-8">
          <SectionHeading hint="Bấm vào ảnh để xem toàn màn hình">
            Tất cả {photos.length} tấm ảnh
          </SectionHeading>
          <ParallaxGallery photos={photos} />
        </section>

        {event.note ? (
          <section className="mx-auto max-w-prose px-5">
            <p className="whitespace-pre-line text-center font-sans text-base leading-relaxed">
              {event.note}
            </p>
          </section>
        ) : null}

        <div className="flex justify-center px-5">
          {/* Mũi tên vẽ bằng icon chứ không gõ ký tự "←": ký tự lệ thuộc vào
              font đang có glyph đó, canh lề không khớp với dòng chữ, và trình
              đọc màn hình đọc thành "mũi tên sang trái". */}
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-border/60 bg-card/70 py-2 pr-5 pl-4 font-sans text-sm text-muted-foreground backdrop-blur transition-colors hover:text-foreground"
          >
            <ChevronLeftIcon size={16} />
            Xem tất cả cột mốc
          </Link>
        </div>
      </main>

      {/* Chỉ đặt ở trang sự kiện: trang chủ là danh mục, bật nhạc ở đó không
          hợp ngữ cảnh. */}
      <MusicButton />
    </>
  );
}
