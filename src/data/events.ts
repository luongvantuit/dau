export type ShaderEffect =
  | "none" | "water" | "fluted-glass" | "lens-distortion" | "dithering";

/** Phần người viết, khoá theo id ảnh trong PHOTO_MANIFEST. Mọi field tuỳ chọn. */
export type PhotoOverride = {
  caption?: string;
  alt?: string;
  /** Chỉ có tác dụng khi layout === "carousel-3d" (ngân sách WebGL). */
  effect?: ShaderEffect;
  tilt?: number;
};

// Spec liệt kê thêm "polaroid-scatter" và "masonry", nhưng chưa có sự kiện nào
// dùng nên chưa dựng (YAGNI). Thêm sau = thêm một giá trị vào union và một nhánh
// trong trang sự kiện; kiểu hiện tại không hứa thứ chưa render được.
export type GalleryLayout = "carousel-3d";

export type SiteEvent = {
  slug: string;
  /** YYYY-MM-DD. Dùng để sắp xếp và hiển thị, KHÔNG nằm trong URL. */
  date: string;
  kind: "birthday" | "holiday" | "milestone";
  title: string;
  tagline?: string;
  description: string;
  /** 4 màu cho MeshGradient nền, mỗi sự kiện một tông. */
  palette: [string, string, string, string];
  gallery: {
    layout: GalleryLayout;
    defaultEffect: ShaderEffect;
    /** Khoá vào PHOTO_MANIFEST — chính là tên thư mục trong photos/. */
    photoDir: string;
    overrides?: Record<string, PhotoOverride>;
  };
  note?: string;
};

export const EVENTS: SiteEvent[] = [
  {
    slug: "sinh-nhat-1-tuoi",
    date: "2026-09-17",
    kind: "birthday",
    title: "Sinh nhật 1 tuổi",
    tagline: "Một vòng mặt trời đầu tiên",
    description:
      "Đậu tròn một tuổi. Những bước đi đầu, tiếng cười đầu, và một ngày đầy bóng bay.",
    palette: ["#ffd9e8", "#fff4d6", "#d9ecff", "#f0dcff"],
    gallery: {
      layout: "carousel-3d",
      defaultEffect: "water",
      photoDir: "sinh-nhat-1-tuoi",
    },
  },
];
