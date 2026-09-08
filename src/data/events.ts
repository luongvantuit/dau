// Đúng 10 shader của @paper-design/shaders-react nhận ảnh làm input, cộng "none".
// Các shader khác trong gói (mesh-gradient, swirl, waves...) chỉ vẽ hoạ tiết,
// không nhận ảnh, nên không nằm ở đây.
export type ShaderEffect =
  | "none"
  | "paper-texture"
  | "fluted-glass"
  | "water"
  | "image-dithering"
  | "halftone-dots"
  | "halftone-cmyk"
  | "lens-distortion"
  | "liquid-metal"
  | "gem-smoke"
  | "heatmap";

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
    /** Id ảnh không muốn hiện. Ảnh mới thêm mặc định được hiện. */
    exclude?: string[];
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
    palette: ["#dce6f2", "#f5e0cd", "#cdd9e8", "#fff6ec"],
    gallery: {
      layout: "carousel-3d",
      // Ảnh để nguyên. Shader chỉ dùng ở nền phía sau — phủ lên ảnh thì
      // fluted-glass cắt thành sọc, halftone/dithering phá hết chi tiết, và
      // không còn nhìn ra mặt bé nữa. Muốn thử cho một ảnh cụ thể thì đặt
      // effect trong overrides.
      defaultEffect: "none",
      photoDir: "sinh-nhat-1-tuoi",
      // DSC05926 và IMG_8288 chỉ có ba mẹ, không có Đậu. DSC05635 bỏ theo yêu cầu.
      exclude: ["DSC05926", "IMG_8288", "DSC05635"],
    },
  },
];
