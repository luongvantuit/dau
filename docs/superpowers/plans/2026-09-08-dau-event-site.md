# Trang sự kiện của Đậu — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trang tĩnh tiếng Việt mừng sinh nhật 1 tuổi của Đậu, mở rộng được cho các sự kiện sau, deploy lên GitHub Pages.

**Architecture:** Một event registry (`src/data/events.ts`) là nguồn sự thật duy nhất; `/` và `/[slug]` cùng `generateStaticParams` từ đó. Ảnh đến từ manifest do script sinh. Shader dùng có ngân sách: tối đa 1 nền + 1 ảnh đang focus.

**Tech Stack:** Next.js 16 (App Router, static export), React 19, Tailwind v4, shadcn/ui trên Base UI, tailark (OSS registry), `motion` 13, `@paper-design/shaders-react` 0.0.80, vitest, sharp.

**Spec:** `docs/superpowers/specs/2026-09-08-dau-birthday-site-design.md`

## Global Constraints

- `output: "export"` — không có runtime. Mọi route phải liệt kê được lúc build.
- `images: { unoptimized: true }` — **không dùng `next/image`**; dùng `<img srcSet>` tự viết.
- Mọi URL tài nguyên tĩnh phải đi qua `withBasePath()` (GitHub Pages có basePath `/dau`).
- **Tối đa 2 WebGL context sống cùng lúc:** 1 nền + 1 ảnh focus. Vượt ngưỡng → canvas trắng.
- `@paper-design/shaders-react` pin **chính xác** `0.0.80`, không dùng `^`.
- Font phải có subset `vietnamese`. **Fredoka không có** — dùng `Baloo 2` + `Be Vietnam Pro`.
- Satori (OG) chỉ đọc **TTF/OTF/WOFF**, không đọc WOFF2, không chạy WebGL.
- Ngày sinh: **2025-09-17**. Ngôn ngữ: tiếng Việt.
- **Không bao giờ `git add -A`** — commit bằng đường dẫn cụ thể; `photos/` phải luôn nằm ngoài git.

**Đã xong trước plan này:** `next-themes`, pipeline ảnh (`scripts/optimize-photos.mjs`, `public/photos/`, `src/data/photos.generated.ts` — 31 ảnh).

---

### Task 1: Vitest + withBasePath

**Files:**
- Create: `vitest.config.ts`, `src/lib/base-path.ts`, `src/lib/base-path.test.ts`
- Modify: `package.json` (scripts)

**Interfaces:**
- Consumes: nothing
- Produces: `withBasePath(pathname: string): string`

- [ ] **Step 1: Cài vitest**

```bash
pnpm add -D vitest
```

- [ ] **Step 2: Tạo `vitest.config.ts`**

```ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
```

Thêm vào `package.json` scripts: `"test": "vitest run"` và `"test:watch": "vitest"`.

- [ ] **Step 3: Viết test thất bại — `src/lib/base-path.test.ts`**

`basePath` được đọc lúc module load nên mỗi test phải nạp lại module bằng `vi.resetModules()`.

```ts
import { afterEach, describe, expect, it, vi } from "vitest";

const ORIGINAL = process.env.NEXT_PUBLIC_BASE_PATH;

async function load(basePath: string | undefined) {
  vi.resetModules();
  if (basePath === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
  else process.env.NEXT_PUBLIC_BASE_PATH = basePath;
  return (await import("./base-path")).withBasePath;
}

afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.NEXT_PUBLIC_BASE_PATH;
  else process.env.NEXT_PUBLIC_BASE_PATH = ORIGINAL;
});

describe("withBasePath", () => {
  it("giữ nguyên khi chạy ở gốc tên miền", async () => {
    const withBasePath = await load(undefined);
    expect(withBasePath("/photos/a.webp")).toBe("/photos/a.webp");
  });

  it("thêm tiền tố khi deploy trong thư mục con", async () => {
    const withBasePath = await load("/dau");
    expect(withBasePath("/photos/a.webp")).toBe("/dau/photos/a.webp");
  });

  it("không thêm tiền tố hai lần", async () => {
    const withBasePath = await load("/dau");
    expect(withBasePath("/dau/photos/a.webp")).toBe("/dau/photos/a.webp");
  });

  it("từ chối đường dẫn tương đối", async () => {
    const withBasePath = await load("/dau");
    expect(() => withBasePath("photos/a.webp")).toThrow(/bắt đầu bằng/);
  });
});
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

Run: `pnpm test`
Expected: FAIL — `Cannot find module './base-path'`

- [ ] **Step 5: Viết `src/lib/base-path.ts`**

```ts
// GitHub Pages phục vụ site ở /<repo>. next/image và <Link> tự thêm tiền tố,
// nhưng URL viết tay (srcSet, ảnh truyền vào shader) thì không — phải qua đây.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function withBasePath(pathname: string): string {
  if (!pathname.startsWith("/")) {
    throw new Error(`Đường dẫn phải bắt đầu bằng "/": ${pathname}`);
  }
  if (!basePath) return pathname;
  if (pathname === basePath || pathname.startsWith(`${basePath}/`)) return pathname;
  return `${basePath}${pathname}`;
}
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

Run: `pnpm test`
Expected: 4 passed

- [ ] **Step 7: Commit**

```bash
git add vitest.config.ts src/lib/base-path.ts src/lib/base-path.test.ts package.json pnpm-lock.yaml
git commit -m "Add vitest and basePath helper"
```

---

### Task 2: Tính tuổi và định dạng ngày

**Files:**
- Create: `src/lib/dates.ts`, `src/lib/dates.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `ageInYears(birthISO: string, atISO: string): number`, `formatDateVi(iso: string): string`, `parseISODate(iso: string): { y: number; m: number; d: number }`

- [ ] **Step 1: Viết test thất bại — `src/lib/dates.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import { ageInYears, formatDateVi } from "./dates";

describe("ageInYears", () => {
  it("tròn 1 tuổi đúng ngày sinh nhật", () => {
    expect(ageInYears("2025-09-17", "2026-09-17")).toBe(1);
  });

  it("còn 0 tuổi khi sinh nhật chưa tới", () => {
    expect(ageInYears("2025-09-17", "2026-09-16")).toBe(0);
  });

  it("bằng 0 ngay ngày sinh", () => {
    expect(ageInYears("2025-09-17", "2025-09-17")).toBe(0);
  });

  it("sinh 29/02: năm thường phải đợi hết 28/02", () => {
    expect(ageInYears("2024-02-29", "2025-02-28")).toBe(0);
    expect(ageInYears("2024-02-29", "2025-03-01")).toBe(1);
  });

  it("trả số âm nếu mốc nằm trước ngày sinh", () => {
    expect(ageInYears("2025-09-17", "2025-01-01")).toBe(-1);
  });

  it("từ chối định dạng ngày kiểu Việt", () => {
    expect(() => ageInYears("17-09-2025", "2026-09-17")).toThrow(/không hợp lệ/);
  });
});

describe("formatDateVi", () => {
  it("bỏ số 0 thừa ở ngày và tháng", () => {
    expect(formatDateVi("2026-09-17")).toBe("17 tháng 9, 2026");
    expect(formatDateVi("2026-01-05")).toBe("5 tháng 1, 2026");
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `pnpm test src/lib/dates.test.ts`
Expected: FAIL — `Cannot find module './dates'`

- [ ] **Step 3: Viết `src/lib/dates.ts`**

Tự tách chuỗi thay vì `new Date(iso)`: `new Date("2026-09-17")` là UTC nửa đêm, đọc lại
bằng getter local ở múi giờ âm sẽ ra ngày hôm trước.

```ts
export type DateParts = { y: number; m: number; d: number };

export function parseISODate(iso: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Ngày không hợp lệ, cần dạng YYYY-MM-DD: ${iso}`);
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

export function ageInYears(birthISO: string, atISO: string): number {
  const birth = parseISODate(birthISO);
  const at = parseISODate(atISO);
  let age = at.y - birth.y;
  // Chưa qua ngày sinh nhật trong năm thì trừ đi 1. So sánh tháng/ngày trực tiếp
  // nên 29/02 tự động đúng: 28/02 vẫn nhỏ hơn 29 nên chưa tính thêm tuổi.
  if (at.m < birth.m || (at.m === birth.m && at.d < birth.d)) age -= 1;
  return age;
}

export function formatDateVi(iso: string): string {
  const { y, m, d } = parseISODate(iso);
  return `${d} tháng ${m}, ${y}`;
}
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `pnpm test src/lib/dates.test.ts`
Expected: 7 passed

- [ ] **Step 5: Commit**

```bash
git add src/lib/dates.ts src/lib/dates.test.ts
git commit -m "Add Vietnamese date formatting and age calculation"
```

---

### Task 3: Event registry

**Files:**
- Create: `src/data/site.ts`, `src/data/events.ts`, `src/lib/events.ts`, `src/lib/events.test.ts`

**Interfaces:**
- Consumes: `ageInYears` (Task 2)
- Produces: types `ShaderEffect`, `PhotoOverride`, `GalleryLayout`, `SiteEvent`; `SITE`; `EVENTS`; `sortEvents(events: SiteEvent[]): SiteEvent[]`, `getAllEvents(): SiteEvent[]`, `getEvent(slug: string): SiteEvent | undefined`, `getEventAge(event: SiteEvent): number`

- [ ] **Step 1: Tạo `src/data/site.ts`**

```ts
export const SITE = {
  name: "Đậu",
  fullName: "Lương Tuấn Kiệt",
  birthDate: "2025-09-17",
  description: "Nhật ký những cột mốc đầu đời của Đậu.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://luongvantuit.github.io/dau",
} as const;
```

- [ ] **Step 2: Tạo `src/data/events.ts`**

```ts
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
```

- [ ] **Step 3: Viết test thất bại — `src/lib/events.test.ts`**

`sortEvents` tách riêng khỏi `getAllEvents` để test được với dữ liệu giả.

```ts
import { describe, expect, it } from "vitest";
import type { SiteEvent } from "@/data/events";
import { getAllEvents, getEvent, getEventAge, sortEvents } from "./events";

function fixture(slug: string, date: string): SiteEvent {
  return {
    slug, date, kind: "milestone", title: slug, description: "",
    palette: ["#fff", "#fff", "#fff", "#fff"],
    gallery: { layout: "carousel-3d", defaultEffect: "none", photoDir: slug },
  };
}

describe("sortEvents", () => {
  it("sắp theo ngày tăng dần, không theo thứ tự khai báo", () => {
    const sorted = sortEvents([
      fixture("c", "2027-01-01"),
      fixture("a", "2025-01-01"),
      fixture("b", "2026-01-01"),
    ]);
    expect(sorted.map((e) => e.slug)).toEqual(["a", "b", "c"]);
  });

  it("không sửa mảng gốc", () => {
    const input = [fixture("b", "2026-01-01"), fixture("a", "2025-01-01")];
    sortEvents(input);
    expect(input.map((e) => e.slug)).toEqual(["b", "a"]);
  });

  it("báo lỗi khi trùng slug", () => {
    expect(() => sortEvents([fixture("a", "2025-01-01"), fixture("a", "2026-01-01")]))
      .toThrow(/trùng/);
  });
});

describe("getEvent", () => {
  it("tìm được sự kiện có thật", () => {
    expect(getEvent("sinh-nhat-1-tuoi")?.title).toBe("Sinh nhật 1 tuổi");
  });

  it("trả undefined với slug lạ", () => {
    expect(getEvent("khong-co-that")).toBeUndefined();
  });
});

describe("getEventAge", () => {
  it("sinh nhật 1 tuổi ứng với 1", () => {
    expect(getEventAge(getAllEvents()[0])).toBe(1);
  });
});
```

- [ ] **Step 4: Chạy test, xác nhận FAIL**

Run: `pnpm test src/lib/events.test.ts`
Expected: FAIL — `Cannot find module './events'`

- [ ] **Step 5: Viết `src/lib/events.ts`**

```ts
import { EVENTS, type SiteEvent } from "@/data/events";
import { SITE } from "@/data/site";
import { ageInYears } from "./dates";

export function sortEvents(events: SiteEvent[]): SiteEvent[] {
  const seen = new Set<string>();
  for (const event of events) {
    if (seen.has(event.slug)) {
      throw new Error(`Slug bị trùng trong events.ts: ${event.slug}`);
    }
    seen.add(event.slug);
  }
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}

export function getAllEvents(): SiteEvent[] {
  return sortEvents(EVENTS);
}

export function getEvent(slug: string): SiteEvent | undefined {
  return getAllEvents().find((event) => event.slug === slug);
}

export function getEventAge(event: SiteEvent): number {
  return ageInYears(SITE.birthDate, event.date);
}
```

- [ ] **Step 6: Chạy test, xác nhận PASS**

Run: `pnpm test`
Expected: 17 passed

- [ ] **Step 7: Commit**

```bash
git add src/data/site.ts src/data/events.ts src/lib/events.ts src/lib/events.test.ts
git commit -m "Add event registry with slug and date validation"
```

---

### Task 4: Gộp manifest ảnh với override

**Files:**
- Create: `src/lib/photos.ts`, `src/lib/photos.test.ts`

**Interfaces:**
- Consumes: `PHOTO_MANIFEST`, `GeneratedPhoto` (đã có), `SiteEvent`, `ShaderEffect` (Task 3), `withBasePath` (Task 1)
- Produces: `type Photo`, `getPhotos(event: SiteEvent): Photo[]`

- [ ] **Step 1: Viết test thất bại — `src/lib/photos.test.ts`**

```ts
import { describe, expect, it } from "vitest";
import type { SiteEvent } from "@/data/events";
import { getPhotos } from "./photos";

function event(overrides?: SiteEvent["gallery"]["overrides"]): SiteEvent {
  return {
    slug: "sinh-nhat-1-tuoi", date: "2026-09-17", kind: "birthday",
    title: "Sinh nhật 1 tuổi", description: "",
    palette: ["#fff", "#fff", "#fff", "#fff"],
    gallery: {
      layout: "carousel-3d", defaultEffect: "water",
      photoDir: "sinh-nhat-1-tuoi", overrides,
    },
  };
}

describe("getPhotos", () => {
  it("lấy đủ 31 ảnh từ manifest", () => {
    expect(getPhotos(event())).toHaveLength(31);
  });

  it("ảnh không có override vẫn có alt mô tả được", () => {
    const [first] = getPhotos(event());
    expect(first.alt).toContain("Sinh nhật 1 tuổi");
    expect(first.alt).not.toBe("");
  });

  it("mọi ảnh nhận defaultEffect khi không khai báo riêng", () => {
    expect(getPhotos(event()).every((p) => p.effect === "water")).toBe(true);
  });

  it("override đổi được caption và hiệu ứng của đúng một ảnh", () => {
    const photos = getPhotos(event({
      DSC05289: { caption: "Thổi nến", effect: "fluted-glass" },
    }));
    const target = photos.find((p) => p.id === "DSC05289");
    expect(target?.caption).toBe("Thổi nến");
    expect(target?.effect).toBe("fluted-glass");
    expect(photos.filter((p) => p.effect === "fluted-glass")).toHaveLength(1);
  });

  it("báo lỗi khi override trỏ tới ảnh không tồn tại", () => {
    expect(() => getPhotos(event({ KHONG_CO: { caption: "x" } })))
      .toThrow(/KHONG_CO/);
  });

  it("báo lỗi khi photoDir không có trong manifest", () => {
    const bad = event();
    bad.gallery.photoDir = "chua-chay-pnpm-photos";
    expect(() => getPhotos(bad)).toThrow(/pnpm photos/);
  });

  it("tilt lặp lại được giữa các lần gọi (tránh lệch hydration)", () => {
    expect(getPhotos(event()).map((p) => p.tilt))
      .toEqual(getPhotos(event()).map((p) => p.tilt));
  });
});
```

- [ ] **Step 2: Chạy test, xác nhận FAIL**

Run: `pnpm test src/lib/photos.test.ts`
Expected: FAIL — `Cannot find module './photos'`

- [ ] **Step 3: Viết `src/lib/photos.ts`**

```ts
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
  const { photoDir, defaultEffect, overrides = {} } = event.gallery;
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

  return generated.map((photo, index) => {
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
```

- [ ] **Step 4: Chạy test, xác nhận PASS**

Run: `pnpm test`
Expected: 24 passed

- [ ] **Step 5: Commit**

```bash
git add src/lib/photos.ts src/lib/photos.test.ts
git commit -m "Merge photo manifest with authored overrides"
```

---

### Task 5: Nền tảng giao diện — font, màu, thư viện

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/globals.css`, `components.json`
- Create: `src/components/ui/card.tsx`, `src/components/ui/badge.tsx` (qua CLI)

**Interfaces:**
- Consumes: `SITE` (Task 3)
- Produces: biến CSS `--font-display`, `--font-sans`; token màu pastel; component `Card`, `Badge`

- [ ] **Step 1: Cài thư viện**

`@paper-design/shaders-react` pin cứng — `0.0.x` có breaking change giữa các patch.

```bash
pnpm add motion
pnpm add --save-exact @paper-design/shaders-react@0.0.80
```

- [ ] **Step 2: Đăng ký tailark OSS registry**

Thêm vào `components.json` (thay thế `"registries": {}` đang rỗng). Dùng đường dẫn Base UI
vì dự án đang chạy `@base-ui/react`, không phải Radix.

```json
"registries": {
  "@tailark-oss": "https://oss.tailark.com/r/{name}.json"
}
```

- [ ] **Step 3: Thêm component nền**

```bash
pnpm dlx shadcn@latest add card badge separator
pnpm dlx shadcn@latest add @tailark-oss/motion-primitives-text-effect
```

Nếu lệnh tailark hỏi ghi đè `src/components/ui/*`, chọn **không** — giữ nguyên bản shadcn.

- [ ] **Step 4: Đổi font trong `src/app/layout.tsx`**

Thay `Geist`/`Geist_Mono`. Bắt buộc có `"vietnamese"` trong `subsets`, nếu thiếu thì dấu
tiếng Việt sẽ rơi sang font dự phòng và chữ trông lệch nhau.

```tsx
import type { Metadata } from "next";
import { Baloo_2, Be_Vietnam_Pro } from "next/font/google";

import { SITE } from "@/data/site";
import { ThemeProvider } from "@/providers/theme-provider";

import "./globals.css";

const display = Baloo_2({
  variable: "--font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
});

const sans = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} · ${SITE.fullName}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: { type: "website", locale: "vi_VN", siteName: SITE.name },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Đổi bảng màu sang pastel trong `src/app/globals.css`**

Thay giá trị trong `:root` và `.dark` (giữ nguyên cấu trúc `@theme inline`, chỉ đổi màu).
Thêm `--font-display` vào khối `@theme inline`:

```css
  --font-display: var(--font-display);
```

`:root` — kem ấm, hồng phấn:

```css
  --background: oklch(0.985 0.012 85);
  --foreground: oklch(0.32 0.045 320);
  --card: oklch(1 0.006 85);
  --card-foreground: oklch(0.32 0.045 320);
  --popover: oklch(1 0.006 85);
  --popover-foreground: oklch(0.32 0.045 320);
  --primary: oklch(0.72 0.145 350);
  --primary-foreground: oklch(0.99 0.01 350);
  --secondary: oklch(0.94 0.035 250);
  --secondary-foreground: oklch(0.35 0.05 260);
  --muted: oklch(0.955 0.018 85);
  --muted-foreground: oklch(0.52 0.035 320);
  --accent: oklch(0.93 0.05 200);
  --accent-foreground: oklch(0.33 0.05 220);
  --border: oklch(0.90 0.02 320);
  --input: oklch(0.90 0.02 320);
  --ring: oklch(0.72 0.145 350);
```

`.dark` — tím đêm:

```css
  --background: oklch(0.19 0.03 300);
  --foreground: oklch(0.95 0.015 320);
  --card: oklch(0.24 0.035 300);
  --card-foreground: oklch(0.95 0.015 320);
  --popover: oklch(0.24 0.035 300);
  --popover-foreground: oklch(0.95 0.015 320);
  --primary: oklch(0.78 0.13 350);
  --primary-foreground: oklch(0.20 0.04 350);
  --secondary: oklch(0.30 0.04 260);
  --secondary-foreground: oklch(0.93 0.02 260);
  --muted: oklch(0.27 0.03 300);
  --muted-foreground: oklch(0.70 0.03 320);
  --accent: oklch(0.32 0.05 220);
  --accent-foreground: oklch(0.93 0.02 220);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 16%);
  --ring: oklch(0.78 0.13 350);
```

Thêm vào cuối `@layer base`:

```css
  h1, h2, h3 {
    font-family: var(--font-display), system-ui, sans-serif;
    letter-spacing: -0.01em;
  }
```

- [ ] **Step 6: Kiểm tra build**

Run: `pnpm typecheck && pnpm build`
Expected: build thành công, không cảnh báo font

- [ ] **Step 7: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css components.json src/components package.json pnpm-lock.yaml
git commit -m "Switch to Vietnamese-capable fonts and pastel palette"
```

---

### Task 6: Component ảnh

**Files:**
- Create: `src/components/gallery/photo-image.tsx`

**Interfaces:**
- Consumes: `Photo` (Task 4)
- Produces: `<PhotoImage photo sizes priority className />`

- [ ] **Step 1: Viết `src/components/gallery/photo-image.tsx`**

Không dùng `next/image`: với `images.unoptimized` nó chỉ render `<img src>` trơn, mất luôn
`srcSet` — tức là điện thoại vẫn tải bản 1600w. Viết tay thì chọn được đúng cỡ.

```tsx
import { cn } from "cn";

import type { Photo } from "@/lib/photos";

export function PhotoImage({
  photo,
  sizes,
  priority = false,
  className,
}: {
  photo: Photo;
  /** Bắt buộc: thiếu sizes thì trình duyệt mặc định 100vw và luôn tải bản lớn nhất. */
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <img
      src={photo.src}
      srcSet={photo.srcSet.map((item) => `${item.src} ${item.w}w`).join(", ")}
      sizes={sizes}
      width={photo.width}
      height={photo.height}
      alt={photo.alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      // Ảnh mờ 16px làm nền trong lúc ảnh thật tải, hết giật khung trắng.
      style={{
        backgroundImage: `url("${photo.blurDataURL}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      className={cn("h-auto w-full object-cover", className)}
    />
  );
}
```

- [ ] **Step 2: Kiểm tra typecheck**

Run: `pnpm typecheck`
Expected: không lỗi

- [ ] **Step 3: Commit**

```bash
git add src/components/gallery/photo-image.tsx
git commit -m "Add responsive photo component with srcSet"
```

---

### Task 7: Shader nền

**Files:**
- Create: `src/components/shaders/background-mesh.tsx`

**Interfaces:**
- Consumes: `SiteEvent["palette"]`
- Produces: `<BackgroundMesh palette />`

- [ ] **Step 1: Viết `src/components/shaders/background-mesh.tsx`**

Đây là **1 trong 2** WebGL context được phép. Không mount nhiều hơn một `BackgroundMesh`.

```tsx
"use client";

import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";

export function BackgroundMesh({ palette }: { palette: readonly string[] }) {
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      // Gradient CSS nằm dưới canvas: nếu WebGL không chạy được (máy cũ, trình
      // duyệt chặn) thì vẫn thấy đúng tông màu thay vì nền trắng trơn.
      style={{
        background: `linear-gradient(140deg, ${palette.join(", ")})`,
      }}
    >
      <MeshGradient
        colors={[...palette]}
        distortion={0.8}
        swirl={0.6}
        speed={reducedMotion ? 0 : 0.15}
        style={{ width: "100%", height: "100%" }}
      />
      {/* Làm dịu nền để chữ đọc được ở cả sáng lẫn tối. */}
      <div className="absolute inset-0 bg-background/55 backdrop-blur-2xl" />
    </div>
  );
}
```

- [ ] **Step 2: Kiểm tra build**

Run: `pnpm build`
Expected: thành công. `MeshGradient` là client component nên phải có `"use client"` — thiếu sẽ lỗi build.

- [ ] **Step 3: Commit**

```bash
git add src/components/shaders/background-mesh.tsx
git commit -m "Add animated mesh gradient background with CSS fallback"
```

---

### Task 8: Carousel 3D với một shader dùng chung

**Files:**
- Create: `src/components/gallery/shader-photo.tsx`, `src/components/gallery/carousel-3d.tsx`

**Interfaces:**
- Consumes: `Photo` (Task 4), `PhotoImage` (Task 6)
- Produces: `<ShaderPhoto photo effect />`, `<Carousel3D photos />`

- [ ] **Step 1: Viết `src/components/gallery/shader-photo.tsx`**

```tsx
"use client";

import {
  FlutedGlass, ImageDithering, LensDistortion, Water,
} from "@paper-design/shaders-react";
import { useInView, useReducedMotion } from "motion/react";
import { useRef } from "react";

import type { ShaderEffect } from "@/data/events";
import type { Photo } from "@/lib/photos";
import { PhotoImage } from "./photo-image";

export function ShaderPhoto({ photo, effect }: { photo: Photo; effect: ShaderEffect }) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px" });
  // Cuộn qua rồi thì ngừng vẽ: context vẫn giữ (không mất canvas) nhưng GPU nghỉ.
  const speed = reducedMotion || !inView ? 0 : 0.4;

  // Bản 1600w: shader lấy ảnh làm texture nên cần độ phân giải cao nhất có.
  const source = photo.srcSet[photo.srcSet.length - 1].src;
  const common = { image: source, fit: "cover" as const, style: { width: "100%", height: "100%" } };

  return (
    <div ref={ref} className="h-full w-full">
      {effect === "none" ? (
        <PhotoImage photo={photo} sizes="(max-width: 768px) 90vw, 520px" priority />
      ) : effect === "water" ? (
        <Water {...common} speed={speed} highlights={0.4} />
      ) : effect === "fluted-glass" ? (
        <FlutedGlass {...common} speed={speed} />
      ) : effect === "lens-distortion" ? (
        <LensDistortion {...common} speed={speed} />
      ) : (
        <ImageDithering {...common} speed={speed} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Viết `src/components/gallery/carousel-3d.tsx`**

Điểm cốt lõi: **`ShaderPhoto` chỉ được mount đúng một lần.** Đổi ảnh bằng cách đổi prop
`photo`, không unmount/mount lại — mỗi lần mount là một WebGL context mới, mount 31 lần thì
trình duyệt thu hồi context cũ và canvas hoá trắng.

```tsx
"use client";

import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { Photo } from "@/lib/photos";
import { PhotoImage } from "./photo-image";
import { ShaderPhoto } from "./shader-photo";

export function Carousel3D({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const active = photos[index];
  const move = (step: number) =>
    setIndex((current) => (current + step + photos.length) % photos.length);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex w-full items-center justify-center [perspective:1400px]">
        {/* Ảnh hai bên: chỉ là <img> xoay bằng CSS, không tốn WebGL context. */}
        {[-2, -1, 1, 2].map((offset) => {
          const neighbour = photos[(index + offset + photos.length) % photos.length];
          return (
            <motion.div
              key={`slot-${offset}`}
              aria-hidden
              className="absolute hidden w-[38%] max-w-[300px] overflow-hidden rounded-2xl shadow-xl md:block"
              animate={{
                x: `${offset * 62}%`,
                rotateY: offset * -18,
                rotate: neighbour.tilt,
                scale: 1 - Math.abs(offset) * 0.12,
                opacity: 1 - Math.abs(offset) * 0.32,
              }}
              transition={{ type: "spring", stiffness: 220, damping: 30 }}
            >
              <PhotoImage photo={neighbour} sizes="300px" />
            </motion.div>
          );
        })}

        {/* Ảnh giữa: WebGL context DUY NHẤT cho ảnh. Không bọc AnimatePresence
            quanh ShaderPhoto — remount sẽ tạo context mới mỗi lần bấm. */}
        <div className="relative z-10 aspect-[2/3] w-[72%] max-w-[420px] overflow-hidden rounded-3xl shadow-2xl">
          <ShaderPhoto photo={active} effect={active.effect} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => move(-1)} aria-label="Ảnh trước">
          <ChevronLeft />
        </Button>
        <p className="font-sans text-sm tabular-nums text-muted-foreground">
          {index + 1} / {photos.length}
        </p>
        <Button variant="outline" size="icon" onClick={() => move(1)} aria-label="Ảnh sau">
          <ChevronRight />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {active.caption ? (
          <motion.p
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-prose text-center font-sans text-sm text-muted-foreground"
          >
            {active.caption}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 3: Kiểm tra build**

Run: `pnpm build`
Expected: thành công

- [ ] **Step 4: Commit**

```bash
git add src/components/gallery/shader-photo.tsx src/components/gallery/carousel-3d.tsx
git commit -m "Add 3D carousel sharing a single WebGL context"
```

---

### Task 9: Trang chủ

**Files:**
- Create: `src/components/event/event-timeline.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `getAllEvents`, `getEventAge` (Task 3), `formatDateVi` (Task 2), `BackgroundMesh` (Task 7), `getPhotos` (Task 4), `PhotoImage` (Task 6)
- Produces: trang `/`

- [ ] **Step 1: Viết `src/components/event/event-timeline.tsx`**

```tsx
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { PhotoImage } from "@/components/gallery/photo-image";
import type { SiteEvent } from "@/data/events";
import { formatDateVi } from "@/lib/dates";
import { getPhotos } from "@/lib/photos";

export function EventTimeline({ events }: { events: SiteEvent[] }) {
  return (
    <ol className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6">
      {events.map((event) => {
        const [cover] = getPhotos(event);
        return (
          <li key={event.slug}>
            <Card className="overflow-hidden p-0 transition-shadow hover:shadow-lg">
              <Link href={`/${event.slug}`} className="flex flex-col gap-4 sm:flex-row">
                <div className="w-full shrink-0 sm:w-40">
                  <PhotoImage
                    photo={cover}
                    sizes="(max-width: 640px) 100vw, 160px"
                    className="aspect-[2/3] sm:rounded-l-xl"
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
    </ol>
  );
}
```

- [ ] **Step 2: Viết `src/app/page.tsx`**

```tsx
import { BackgroundMesh } from "@/components/shaders/background-mesh";
import { EventTimeline } from "@/components/event/event-timeline";
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
```

- [ ] **Step 3: Xem thật**

Run: `pnpm dev` rồi mở `http://localhost:3000`
Expected: nền gradient chuyển động, tên "Đậu" bằng Baloo 2 với dấu đúng, thẻ sự kiện có ảnh bìa

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx src/components/event/event-timeline.tsx
git commit -m "Add home page with event timeline"
```

---

### Task 10: Trang sự kiện

**Files:**
- Create: `src/app/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getAllEvents`, `getEvent`, `getEventAge` (Task 3), `getPhotos` (Task 4), `Carousel3D` (Task 8), `BackgroundMesh` (Task 7)
- Produces: route `/[slug]`

- [ ] **Step 1: Viết `src/app/[slug]/page.tsx`**

`generateStaticParams` là thứ làm `output: "export"` sinh ra được các route này — thiếu nó
thì build đứt với lỗi "Page is missing param".

```tsx
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
```

- [ ] **Step 2: Kiểm tra route được sinh ra**

Run: `pnpm build && ls out/sinh-nhat-1-tuoi/`
Expected: có `index.html`

- [ ] **Step 3: Commit**

```bash
git add src/app/[slug]/page.tsx
git commit -m "Add event detail page with static params"
```

---

### Task 11: OG image

**Files:**
- Create: `src/assets/fonts/Baloo2-Bold.ttf`, `src/assets/fonts/BeVietnamPro-Regular.ttf`, `src/lib/og.ts`, `src/app/opengraph-image.tsx`, `src/app/[slug]/opengraph-image.tsx`

**Interfaces:**
- Consumes: `getAllEvents`, `getEvent` (Task 3), `SITE` (Task 3), `formatDateVi` (Task 2)
- Produces: `loadOgFonts()`, hai route ảnh OG

- [ ] **Step 1: Tải font TTF**

Satori không giải nén được WOFF2, mà `next/font` chỉ cho WOFF2 — nên phải có bản TTF riêng.
User-agent cũ khiến Google Fonts trả về TTF thay vì WOFF2.

```bash
mkdir -p src/assets/fonts
curl -sL -A "Mozilla/4.0" "https://fonts.googleapis.com/css?family=Baloo+2:700&subset=vietnamese" \
  | grep -o 'https://[^)]*\.ttf' | head -1 | xargs curl -sL -o src/assets/fonts/Baloo2-Bold.ttf
curl -sL -A "Mozilla/4.0" "https://fonts.googleapis.com/css?family=Be+Vietnam+Pro:400&subset=vietnamese" \
  | grep -o 'https://[^)]*\.ttf' | head -1 | xargs curl -sL -o src/assets/fonts/BeVietnamPro-Regular.ttf
ls -la src/assets/fonts/
```

Expected: hai file, mỗi file > 20KB. File 0 byte nghĩa là URL đổi — mở CSS ra xem thủ công.

- [ ] **Step 2: Viết `src/lib/og.ts`**

```ts
import { readFile } from "node:fs/promises";
import path from "node:path";

export async function loadOgFonts() {
  const dir = path.join(process.cwd(), "src/assets/fonts");
  const [display, sans] = await Promise.all([
    readFile(path.join(dir, "Baloo2-Bold.ttf")),
    readFile(path.join(dir, "BeVietnamPro-Regular.ttf")),
  ]);
  return [
    { name: "Baloo 2", data: display, weight: 700 as const, style: "normal" as const },
    { name: "Be Vietnam Pro", data: sans, weight: 400 as const, style: "normal" as const },
  ];
}
```

- [ ] **Step 3: Viết `src/app/[slug]/opengraph-image.tsx`**

Không dùng shader ở đây: Satori dựng ảnh bằng SVG, không có WebGL. Nền là gradient CSS lấy
từ đúng `palette` của sự kiện nên vẫn khớp tông với trang.

```tsx
import { ImageResponse } from "next/og";

import { SITE } from "@/data/site";
import { formatDateVi } from "@/lib/dates";
import { getAllEvents, getEvent } from "@/lib/events";
import { loadOgFonts } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ảnh chia sẻ";

export function generateStaticParams() {
  return getAllEvents().map((event) => ({ slug: event.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) return new Response("Not found", { status: 404 });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
          background: `linear-gradient(140deg, ${event.palette.join(", ")})`,
          color: "#3a2740",
        }}
      >
        <div style={{ fontFamily: "Be Vietnam Pro", fontSize: 30, opacity: 0.75 }}>
          {formatDateVi(event.date)}
        </div>
        <div style={{ fontFamily: "Baloo 2", fontSize: 88, textAlign: "center", padding: "0 60px" }}>
          {event.title}
        </div>
        <div style={{ fontFamily: "Be Vietnam Pro", fontSize: 34, opacity: 0.8 }}>
          {SITE.name} · {SITE.fullName}
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
```

- [ ] **Step 4: Viết `src/app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

import { SITE } from "@/data/site";
import { loadOgFonts } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} · ${SITE.fullName}`;

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 20,
          background: "linear-gradient(140deg, #ffd9e8, #fff4d6, #d9ecff, #f0dcff)",
          color: "#3a2740",
        }}
      >
        <div style={{ fontFamily: "Baloo 2", fontSize: 130 }}>{SITE.name}</div>
        <div style={{ fontFamily: "Be Vietnam Pro", fontSize: 40, opacity: 0.8 }}>
          {SITE.fullName}
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
```

- [ ] **Step 5: Build và kiểm tra dấu tiếng Việt trong ảnh**

```bash
pnpm build
find out -name "opengraph-image*"
```

Expected: có PNG ở gốc và trong `out/sinh-nhat-1-tuoi/`. **Mở file PNG ra xem** — chữ phải là
"Sinh nhật 1 tuổi" đầy đủ dấu. Thấy ô vuông hoặc mất dấu nghĩa là font TTF nạp sai.

- [ ] **Step 6: Commit**

```bash
git add src/assets/fonts src/lib/og.ts src/app/opengraph-image.tsx "src/app/[slug]/opengraph-image.tsx"
git commit -m "Generate per-event OG images with Vietnamese fonts"
```

---

### Task 12: Trang 404 và kiểm tra cuối

**Files:**
- Create: `src/app/not-found.tsx`

- [ ] **Step 1: Viết `src/app/not-found.tsx`**

```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-5xl font-extrabold">Không tìm thấy trang</h1>
      <p className="font-sans text-muted-foreground">
        Cột mốc này chưa có, hoặc đường dẫn bị gõ nhầm.
      </p>
      <Link href="/" className="font-sans text-primary hover:underline">
        Về trang chủ
      </Link>
    </main>
  );
}
```

- [ ] **Step 2: Chạy toàn bộ kiểm tra**

```bash
pnpm test && pnpm lint && pnpm typecheck && pnpm build
```

Expected: test pass, lint sạch, build thành công

- [ ] **Step 3: Kiểm tra kết quả export**

```bash
ls out/ out/sinh-nhat-1-tuoi/
du -sh out/
grep -c "photos/sinh-nhat-1-tuoi" out/sinh-nhat-1-tuoi/index.html
```

Expected: có `404.html`, `index.html`, thư mục sự kiện; `out/` khoảng 5–6MB; HTML có tham
chiếu ảnh.

- [ ] **Step 4: Kiểm tra basePath không làm hỏng ảnh**

```bash
NEXT_PUBLIC_BASE_PATH=/dau pnpm build
grep -o '/dau/photos/[^" ]*' out/sinh-nhat-1-tuoi/index.html | head -3
```

Expected: đường dẫn ảnh có tiền tố `/dau/`, **không** có `/dau/dau/`.

- [ ] **Step 5: Commit**

```bash
git add src/app/not-found.tsx
git commit -m "Add not-found page"
```

---

## Ghi chú vận hành

- **Thêm sự kiện mới:** bỏ ảnh vào `photos/<slug>/`, chạy `pnpm photos`, thêm một object vào
  `EVENTS`. Không phải sửa route hay component.
- **Thêm caption:** điền vào `gallery.overrides` theo id ảnh (chính là tên file bỏ đuôi).
- **Không bao giờ `git add -A`** — `photos/` đã gitignore nhưng vẫn nên commit theo đường dẫn.
