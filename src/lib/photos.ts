import type { ShaderEffect, SiteEvent } from "@/data/events";
import { PHOTO_MANIFEST, type GeneratedPhoto } from "@/data/photos.generated";
import { withBasePath } from "./base-path";

export type Photo = Omit<GeneratedPhoto, "srcSet"> & {
  alt: string;
  caption?: string;
  effect: ShaderEffect;
  /** Độ nghiêng polaroid, độ. */
  tilt: number;
  /** Đã qua withBasePath. */
  srcSet: { w: number; src: string }[];
  /** Ảnh dự phòng cho trình duyệt bỏ qua srcSet. */
  src: string;
};

// Danh sách cố định thay vì random: server và client phải ra cùng một giá trị,
// nếu không React sẽ báo lệch hydration.
const TILTS = [-3, 2.5, -1.5, 3, -2.5, 1.5, -2, 2];

export function getPhotos(event: SiteEvent): Photo[] {
  const { photoDir, defaultEffect, overrides = {}, exclude = [] } = event.gallery;
  const generated = PHOTO_MANIFEST[photoDir];

  if (!generated) {
    throw new Error(
      `Không có ảnh cho "${photoDir}" trong manifest. Bỏ ảnh vào photos/${photoDir}/ rồi chạy \`pnpm photos\`.`,
    );
  }

  const ids = new Set(generated.map((photo) => photo.id));
  for (const id of Object.keys(overrides)) {
    if (!ids.has(id)) {
      throw new Error(`overrides của "${event.slug}" trỏ tới ảnh không tồn tại: ${id}`);
    }
  }
  for (const id of exclude) {
    if (!ids.has(id)) {
      throw new Error(`exclude của "${event.slug}" trỏ tới ảnh không tồn tại: ${id}`);
    }
  }

  // Lọc trước khi đánh số: alt phải là "ảnh 1..n" liên tục, không chừa lỗ ở
  // chỗ ảnh bị bỏ.
  const kept = exclude.length
    ? generated.filter((photo) => !exclude.includes(photo.id))
    : generated;

  return kept.map((photo, index) => {
    const override = overrides[photo.id] ?? {};
    const srcSet = photo.srcSet.map((item) => ({ ...item, src: withBasePath(item.src) }));
    return {
      ...photo,
      srcSet,
      src: (srcSet.find((item) => item.w === 800) ?? srcSet[srcSet.length - 1]).src,
      alt: override.alt ?? `${event.title} — ảnh ${index + 1}`,
      caption: override.caption,
      effect: override.effect ?? defaultEffect,
      tilt: override.tilt ?? TILTS[index % TILTS.length],
    };
  });
}

/** Khổ dọc chuẩn của khung xoay (2:3), khớp với đa số ảnh máy ảnh. */
export const CAROUSEL_RATIO = 2 / 3;

// Lệch 7% thì object-cover chỉ cắt vài phần trăm mép, mắt không nhận ra.
// Ảnh ngang lệch tới 0.73 nên bị loại — nhét ảnh ngang vào khung dọc thì hoặc
// méo, hoặc mất gần nửa khuôn hình.
const CAROUSEL_TOLERANCE = 0.1;

/**
 * Lọc ảnh hợp với khung xoay khổ dọc cố định. Gallery parallax không cần hàm
 * này vì mỗi ảnh ở đó tự giữ tỉ lệ riêng.
 */
export function carouselPhotos(photos: Photo[]): Photo[] {
  return photos.filter(
    (photo) => Math.abs(photo.width / photo.height - CAROUSEL_RATIO) < CAROUSEL_TOLERANCE,
  );
}
