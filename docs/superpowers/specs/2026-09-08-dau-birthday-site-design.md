# Trang sự kiện của Đậu — Design

**Ngày:** 2026-09-08
**Trạng thái:** chờ duyệt
**Bối cảnh:** Trang web mừng sinh nhật bé Đậu (Lương Tuấn Kiệt), mở rộng được cho các
sự kiện/mốc năm khác. Next.js 16 static export → GitHub Pages.

---

## 1. Phạm vi

Một site tĩnh, tiếng Việt, gồm:

- `/` — hero + timeline toàn bộ mốc theo thời gian.
- `/[slug]` — một sự kiện: ảnh (nhiều ảnh), lời nhắn, hiệu ứng shader.
- OG image riêng cho từng route, sinh sẵn lúc build.

**Không làm** (YAGNI): i18n, CMS, comment, auth, analytics, ảnh thật (dùng placeholder
trước — layout đã chừa sẵn slot).

## 2. Ràng buộc kỹ thuật đã kiểm chứng

| # | Ràng buộc | Hệ quả thiết kế |
|---|---|---|
| 1 | `output: "export"` — không có runtime | Mọi route phải liệt kê được lúc build → `generateStaticParams` từ một file dữ liệu |
| 2 | **1 shader = 1 WebGL context.** Chrome ~16 context, iOS Safari ít hơn. Vượt ngưỡng → context bị thu hồi, canvas trắng | Gallery **không** được bọc shader cho mọi ảnh. Phải có ngân sách shader (mục 5) |
| 3 | Satori (next/og) chỉ đọc **TTF/OTF/WOFF**, không đọc WOFF2, và không có sẵn glyph tiếng Việt | Phải commit file `.ttf` vào repo, nạp bằng `fs.readFile` lúc build. OG route dùng **node runtime**, không dùng edge |
| 4 | Satori không chạy WebGL/canvas | OG image là gradient CSS tĩnh + chữ, **không** có shader |
| 5 | `basePath` = `/dau` trên GitHub Pages | `next/image` tự thêm prefix, nhưng paper-shaders nhận URL dạng **string thô** → phải tự prefix bằng helper `withBasePath()`. Đây là lỗi 404 ảnh dễ gặp nhất |
| 6 | Fredoka **không có** subset `vietnamese` (đã kiểm tra qua Google Fonts API) | Dùng `Baloo 2` (display) + `Be Vietnam Pro` (body) — cả hai đều có subset `vietnamese` |
| 7 | paper-shaders đang ở `0.0.x`, breaking change giữa các patch | Pin chính xác `0.0.80`, không dùng `^` |

## 3. Kiến trúc: Event registry

Một nguồn sự thật duy nhất — `src/data/events.ts`. Route, timeline, metadata và OG image
đều đọc từ đó. Thêm một năm mới = thêm một object, không sửa code.

```ts
export type ShaderEffect =
  | "none" | "water" | "fluted-glass" | "lens-distortion"
  | "dithering" | "heatmap" | "liquid-metal" | "gem-smoke";

export type Photo = {
  src: string;            // đường dẫn trong public/, CHƯA có basePath
  alt: string;            // bắt buộc — a11y
  caption?: string;
  effect?: ShaderEffect;  // ghi đè gallery.defaultEffect. CHỈ có tác dụng khi
                          // gallery.layout === "carousel-3d" (xem mục 5)
  tilt?: number;          // độ nghiêng polaroid, -8..8
};

export type GalleryLayout = "carousel-3d" | "polaroid-scatter" | "masonry";

export type SiteEvent = {
  slug: string;           // "sinh-nhat-3-tuoi" — chính là URL
  date: string;           // "2026-09-08" — để sort/hiển thị, KHÔNG nằm trong URL
  kind: "birthday" | "holiday" | "milestone";
  title: string;
  tagline?: string;
  description: string;    // dùng cho <meta description> + OG
  palette: [string, string, string, string];  // 4 màu MeshGradient của trang này
  gallery: {
    layout: GalleryLayout;
    defaultEffect: ShaderEffect;  // bị bỏ qua nếu layout !== "carousel-3d"
    photos: Photo[];
  };
  note?: string;          // lời nhắn của ba mẹ
};
```

`date` tách khỏi `slug` là chủ ý: URL đẹp và ổn định (`/sinh-nhat-3-tuoi`), nhưng thứ tự
timeline và phép tính tuổi vẫn dựa trên ngày thật.

`palette` cho mỗi sự kiện một tông màu riêng mà vẫn dùng chung một component nền.

## 4. Cấu trúc thư mục

```
src/
  app/
    layout.tsx              # fonts, ThemeProvider, metadataBase
    page.tsx                # "/" — hero + timeline
    opengraph-image.tsx     # OG trang chủ
    not-found.tsx           # → out/404.html
    [slug]/
      page.tsx              # generateStaticParams + generateMetadata
      opengraph-image.tsx   # generateStaticParams → 1 PNG mỗi sự kiện
  components/
    ui/                     # shadcn (button, card, badge, separator)
    site/                   # SiteHeader, SiteFooter
    event/                  # EventHero, EventTimeline, EventCard, AgeBadge, ParentNote
    gallery/                # PhotoGallery, Carousel3D, PolaroidScatter, MasonryGrid
    shaders/                # BackgroundMesh, ShaderPhoto, shader-budget
    motion/                 # tailark motion-primitives (text-effect, animated-group)
  data/
    site.ts                 # tên, mô tả, ngày sinh, URL
    events.ts               # registry
  lib/
    events.ts               # getAllEvents, getEvent, ageAt, formatDateVi
    base-path.ts            # withBasePath()
    og.ts                   # loadOgFonts()
  providers/
    theme-provider.tsx      # (đã có)
src/assets/fonts/           # Baloo2-Bold.ttf, BeVietnamPro-Regular.ttf — cho Satori
public/photos/<slug>/       # ảnh từng sự kiện
```

## 5. Ngân sách shader — quyết định quan trọng nhất

Ràng buộc #2 nói: không thể mỗi ảnh một shader. Quy tắc:

> **Tối đa 2 WebGL context sống cùng lúc: 1 nền `MeshGradient` toàn trang + 1 `ShaderPhoto`
> cho đúng ảnh đang được focus.**

Cách đạt được:

- `Carousel3D` mount **đúng một** `ShaderPhoto`. Khi xoay sang ảnh khác, component
  **không** unmount — chỉ đổi prop `image`. Context được tái sử dụng, số context luôn = 1.
- Mọi ảnh còn lại là `<Image>` tĩnh của Next. Hiệu ứng nghiêng/xoay/parallax do **motion**
  làm bằng CSS transform — rẻ, không tốn context.
- Ngoài viewport → `speed={0}` (đóng băng, giữ context nhưng ngừng vẽ) qua
  `IntersectionObserver`.
- `prefers-reduced-motion: reduce` → `speed={0}` toàn site.
- `PolaroidScatter` và `MasonryGrid` **không** dùng shader cho ảnh; chỉ transform + motion.
  Shader ảnh là đặc quyền của `carousel-3d`.

"Xoay các kiểu" vì vậy chia hai tầng: **xoay hình học** (motion/CSS, không giới hạn số ảnh)
và **biến dạng bề mặt** (shader, giới hạn 1 ảnh). Đây là cách duy nhất vừa giữ hiệu ứng vừa
không vỡ trên điện thoại.

## 6. Route và metadata

| Route | Nguồn | Output |
|---|---|---|
| `/` | `site.ts` | `out/index.html` |
| `/[slug]` | `getAllEvents()` | 1 thư mục mỗi sự kiện |
| `/opengraph-image.png` | `site.ts` | 1200×630 PNG |
| `/[slug]/opengraph-image.png` | `getAllEvents()` | 1 PNG mỗi sự kiện |
| 404 | `not-found.tsx` | `out/404.html` |

- `metadataBase` = `process.env.NEXT_PUBLIC_SITE_URL ?? "https://luongvantuit.github.io/dau"`.
- `generateMetadata` cho `[slug]`: title, description, `openGraph`, `twitter:card=summary_large_image`.
- OG image vẽ: tên sự kiện + "Đậu · Lương Tuấn Kiệt" + ngày, trên nền gradient lấy từ
  `event.palette` (CSS `linear-gradient`, không phải shader).

## 7. Font

| Vai trò | Font | Lý do |
|---|---|---|
| Display (tiêu đề, số tuổi) | **Baloo 2** | Bo tròn, ấm, có subset `vietnamese` (đã kiểm chứng) |
| Body | **Be Vietnam Pro** | Thiết kế riêng cho tiếng Việt, dấu cân đối ở cỡ nhỏ |
| OG image | `.ttf` của chính 2 font trên | Satori không đọc WOFF2 |

Thay `Geist`/`Geist_Mono` mặc định của create-next-app. Nạp qua `next/font/google` với
`subsets: ["latin", "vietnamese"]`.

## 8. Kiểm thử

Chưa có test framework trong repo. Đề xuất thêm **vitest** chỉ cho phần logic thuần trong
`src/lib/` — nơi thật sự có edge case:

- `ageAt(birthDate, eventDate)` — sinh nhật chưa tới trong năm; sinh 29/02; sự kiện trước
  ngày sinh.
- `getAllEvents()` sắp xếp đúng theo `date` chứ không theo thứ tự khai báo.
- `withBasePath()` — có/không có `NEXT_PUBLIC_BASE_PATH`, không nhân đôi prefix.
- `getEvent(slug)` với slug không tồn tại → `notFound()`.

Phần hình ảnh/animation kiểm bằng `pnpm build` + xem thật. Không viết test cho shader.

## 9. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| WebGL không khả dụng (máy cũ, trình duyệt chặn) | `ShaderPhoto` fallback về `<Image>` thường; nền fallback về CSS gradient tĩnh |
| Shader nền làm chữ khó đọc | Lớp phủ `backdrop-blur` + token `--foreground` theo theme; kiểm tương phản ở cả sáng/tối |
| Ảnh thật chưa có | Placeholder SVG đúng tỉ lệ, `alt` mô tả sẵn; thay ảnh không phải sửa layout |
| `basePath` làm hỏng URL ảnh cho shader | `withBasePath()` bắt buộc cho mọi URL truyền vào shader; có test |
| paper-shaders 0.0.x breaking | Pin cứng `0.0.80` |

## 10. Đầu vào còn thiếu

**Ngày sinh thật của Đậu.** Chưa có. `src/data/site.ts` sẽ ghi placeholder được đánh dấu rõ:

```ts
// ⚠️ THAY BẰNG NGÀY SINH THẬT CỦA ĐẬU
export const BIRTH_DATE = "2023-09-08";
```

Mọi số tuổi và thứ tự timeline suy ra từ hằng số này — sửa một dòng là toàn site đúng lại.
