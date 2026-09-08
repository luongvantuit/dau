# Trang sự kiện của Đậu — Design

**Ngày:** 2026-09-08
**Trạng thái:** chờ duyệt
**Bối cảnh:** Trang web mừng sinh nhật bé Đậu (Lương Tuấn Kiệt), mở rộng được cho các
sự kiện/mốc năm khác. Next.js 16 static export → GitHub Pages.

**Ngày sinh:** 17-09-2025. Sự kiện đầu tiên: **sinh nhật 1 tuổi, 17-09-2026**.
**Tư liệu:** 31 ảnh trong `public/sinh-nhat-1-tuoi/` — 30 ảnh dọc (2:3), 1 ảnh ngang;
4000×6000 px; **tổng 337MB**. Hiển thị toàn bộ 31 ảnh.

---

## 1. Phạm vi

Một site tĩnh, tiếng Việt, gồm:

- `/` — hero + timeline toàn bộ mốc theo thời gian.
- `/[slug]` — một sự kiện: ảnh (nhiều ảnh), lời nhắn, hiệu ứng shader.
- OG image riêng cho từng route, sinh sẵn lúc build.

**Không làm** (YAGNI): i18n, CMS, comment, auth, analytics, lightbox phóng to toàn màn hình.

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
| 8 | `images: { unoptimized: true }` → Next **không** đụng vào ảnh: phục vụ nguyên file 10MB, và `next/image` **không sinh `srcset`** | Cần pipeline ảnh riêng (mục 5) + component `<Photo>` tự viết `<img srcSet>` thay vì dùng `next/image` |
| 9 | 337MB ảnh gốc, hiện **chưa vào git** (`.git` = 556K) | Ảnh gốc chuyển ra `photos/` và gitignore; chỉ commit bản tối ưu (~8MB) |

## 3. Kiến trúc: Event registry

Một nguồn sự thật duy nhất — `src/data/events.ts`. Route, timeline, metadata và OG image
đều đọc từ đó. Thêm một năm mới = thêm một object, không sửa code.

```ts
export type ShaderEffect =
  | "none" | "water" | "fluted-glass" | "lens-distortion"
  | "dithering" | "heatmap" | "liquid-metal" | "gem-smoke";

/** Phần do người viết, khoá theo id ảnh trong manifest. Mọi field đều tuỳ chọn. */
export type PhotoOverride = {
  caption?: string;
  alt?: string;           // mặc định: "<title sự kiện> — ảnh <n>"
  effect?: ShaderEffect;  // ghi đè defaultEffect. CHỈ có tác dụng khi
                          // layout === "carousel-3d" (xem mục 6)
  tilt?: number;          // độ nghiêng polaroid, -8..8
};

export type GalleryLayout = "carousel-3d" | "polaroid-scatter" | "masonry";

export type SiteEvent = {
  slug: string;           // "sinh-nhat-1-tuoi" — chính là URL
  date: string;           // "2026-09-17" — để sort/hiển thị, KHÔNG nằm trong URL
  kind: "birthday" | "holiday" | "milestone";
  title: string;
  tagline?: string;
  description: string;    // dùng cho <meta description> + OG
  palette: [string, string, string, string];  // 4 màu MeshGradient của trang này
  gallery: {
    layout: GalleryLayout;
    defaultEffect: ShaderEffect;  // bị bỏ qua nếu layout !== "carousel-3d"
    photoDir: string;             // khoá vào PHOTO_MANIFEST, vd "sinh-nhat-1-tuoi"
    overrides?: Record<string, PhotoOverride>;   // id ảnh -> caption/effect
  };
  note?: string;          // lời nhắn của ba mẹ
};
```

Danh sách ảnh **không** liệt kê tay trong `events.ts` — nó đến từ `PHOTO_MANIFEST[photoDir]`
theo thứ tự tên file. `overrides` chỉ để thêm caption hoặc đổi hiệu ứng cho vài ảnh cụ thể,
nên 31 ảnh vẫn chỉ tốn một dòng `photoDir`.

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
    site.ts                 # tên, ngày sinh (2025-09-17), URL
    events.ts               # registry — viết tay
    photos.generated.ts     # do script sinh, KHÔNG sửa tay
  lib/
    events.ts               # getAllEvents, getEvent, ageAt, formatDateVi
    base-path.ts            # withBasePath()
    photos.ts               # gộp manifest + overrides -> Photo[] để render
    og.ts                   # loadOgFonts()
  providers/
    theme-provider.tsx      # (đã có)
  components/gallery/Photo.tsx   # <img srcSet> tự viết, KHÔNG dùng next/image
src/assets/fonts/           # Baloo2-Bold.ttf, BeVietnamPro-Regular.ttf — cho Satori
scripts/optimize-photos.mjs # sharp: sinh webp + manifest
photos/<slug>/              # ẢNH GỐC — .gitignore
public/photos/<slug>/       # bản tối ưu — commit
```

## 5. Pipeline ảnh

Ràng buộc #8 và #9: ảnh gốc quá nặng để phục vụ trực tiếp, và `next/image` không giúp được
gì khi `unoptimized: true`. Nên tách làm hai nửa — **script sinh**, **component đọc**.

```
photos/sinh-nhat-1-tuoi/          ← ảnh gốc, .gitignore, chỉ nằm trên máy
    DSC05289.jpg  (4000×6000, 10MB)  ×31

        ↓  pnpm photos   (scripts/optimize-photos.mjs, sharp, chạy local)

public/photos/sinh-nhat-1-tuoi/   ← commit, ~8MB
    DSC05289-400.webp    ~17KB
    DSC05289-800.webp    ~55KB
    DSC05289-1600.webp  ~170KB

src/data/photos.generated.ts      ← commit, không sửa tay
```

Số liệu đo thật trên `DSC05289.jpg`: 10MB → 242KB ở 1600w (JPEG q78); WebP còn nhỏ hơn ~30%.
Cả gallery từ 337MB xuống còn khoảng 8MB.

**Vì sao script chạy local chứ không chạy trong CI:** CI không có ảnh gốc (đã gitignore).
Bản tối ưu nằm sẵn trong repo nên `next build` trên GitHub Actions không cần `sharp`.
`sharp` là `devDependency`, chỉ dùng khi thêm ảnh mới.

**Manifest sinh ra** (`photos.generated.ts`) giữ những gì chỉ script biết:

```ts
export type GeneratedPhoto = {
  id: string;            // "DSC05289" — khoá để events.ts tham chiếu
  width: number;         // 4000  ─ đưa vào <img> để không giật layout (CLS)
  height: number;        // 6000  ┘
  blurDataURL: string;   // WebP 16px base64, ~200 byte, làm placeholder
  srcSet: { w: number; src: string }[];   // 400 / 800 / 1600
};

export const PHOTO_MANIFEST: Record<string, GeneratedPhoto[]>;
```

Ranh giới rõ ràng: **script sở hữu kích thước và đường dẫn, người sở hữu caption và hiệu ứng.**
Thêm ảnh mới = bỏ file vào `photos/<slug>/` rồi chạy `pnpm photos`; không sửa code.

**Component `<Photo>`** đọc manifest và render `<img>` thuần với `srcSet` + `sizes`, không dùng
`next/image` (vì `unoptimized` làm nó mất `srcset`). Mọi URL đi qua `withBasePath()`.
`loading="lazy"` + `decoding="async"` cho ảnh ngoài màn hình đầu.


## 6. Ngân sách shader — quyết định quan trọng nhất

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

## 7. Route và metadata

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

## 8. Font

| Vai trò | Font | Lý do |
|---|---|---|
| Display (tiêu đề, số tuổi) | **Baloo 2** | Bo tròn, ấm, có subset `vietnamese` (đã kiểm chứng) |
| Body | **Be Vietnam Pro** | Thiết kế riêng cho tiếng Việt, dấu cân đối ở cỡ nhỏ |
| OG image | `.ttf` của chính 2 font trên | Satori không đọc WOFF2 |

Thay `Geist`/`Geist_Mono` mặc định của create-next-app. Nạp qua `next/font/google` với
`subsets: ["latin", "vietnamese"]`.

## 9. Kiểm thử

Chưa có test framework trong repo. Đề xuất thêm **vitest** chỉ cho phần logic thuần trong
`src/lib/` — nơi thật sự có edge case:

- `ageAt(birthDate, eventDate)` — sinh nhật chưa tới trong năm; sinh 29/02; sự kiện trước
  ngày sinh.
- `getAllEvents()` sắp xếp đúng theo `date` chứ không theo thứ tự khai báo.
- `withBasePath()` — có/không có `NEXT_PUBLIC_BASE_PATH`, không nhân đôi prefix.
- `getEvent(slug)` với slug không tồn tại → `notFound()`.
- `getPhotos(event)` — gộp manifest với `overrides`; ảnh không có override vẫn có `alt`
  mặc định; override trỏ tới id không tồn tại thì không được im lặng bỏ qua.

Phần hình ảnh/animation kiểm bằng `pnpm build` + xem thật. Không viết test cho shader.

## 10. Rủi ro

| Rủi ro | Xử lý |
|---|---|
| WebGL không khả dụng (máy cũ, trình duyệt chặn) | `ShaderPhoto` fallback về `<Image>` thường; nền fallback về CSS gradient tĩnh |
| Shader nền làm chữ khó đọc | Lớp phủ `backdrop-blur` + token `--foreground` theo theme; kiểm tương phản ở cả sáng/tối |
| Ảnh thật chưa có | Placeholder SVG đúng tỉ lệ, `alt` mô tả sẵn; thay ảnh không phải sửa layout |
| `basePath` làm hỏng URL ảnh cho shader | `withBasePath()` bắt buộc cho mọi URL truyền vào shader; có test |
| paper-shaders 0.0.x breaking | Pin cứng `0.0.80` |

## 11. Đầu vào đã đủ

| Mục | Giá trị |
|---|---|
| Ngày sinh | **2025-09-17** |
| Sự kiện đầu | `sinh-nhat-1-tuoi`, 2026-09-17 |
| Ảnh | 31 ảnh, hiển thị hết, `photos/sinh-nhat-1-tuoi/` |
| Ngôn ngữ | Tiếng Việt |
| Hướng thiết kế | Pastel mơ màng + shader |

Caption cho từng ảnh và `note` (lời nhắn của ba mẹ) để trống, bổ sung sau — không chặn build.
