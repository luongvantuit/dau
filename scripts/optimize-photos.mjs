// Sinh ảnh tối ưu từ photos/<slug>/ vào public/photos/<slug>/.
//
// Ảnh gốc (photos/) bị gitignore vì quá nặng — chỉ bản tối ưu và manifest được
// commit, nên CI không cần sharp lẫn ảnh gốc. Chạy lại mỗi khi thêm ảnh mới:
//     pnpm photos

import sharp from "sharp";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC_DIR = "photos";
const OUT_DIR = path.join("public", "photos");
const MANIFEST = path.join("src", "data", "photos.generated.ts");

const WIDTHS = [400, 800, 1600];
const QUALITY = 76;
const BLUR_WIDTH = 16;
const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;

async function buildPhoto(srcDir, outDir, file) {
  const id = file.replace(IMAGE_EXT, "");
  const src = path.join(srcDir, file);

  const srcSet = [];
  let width = 0;
  let height = 0;

  for (const w of WIDTHS) {
    const { data, info } = await sharp(src)
      // Không truyền tham số = xoay theo EXIF. Ảnh máy ảnh hay có orientation
      // khác 1; thiếu bước này thì ảnh dọc bị nằm ngang.
      .rotate()
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer({ resolveWithObject: true });

    const name = `${id}-${w}.webp`;
    await writeFile(path.join(outDir, name), data);
    srcSet.push({ w: info.width, src: `/photos/${path.basename(outDir)}/${name}` });

    // Kích thước thật lấy từ bản lớn nhất đã xoay, nên luôn khớp với ảnh hiển
    // thị. Đọc metadata ảnh gốc sẽ sai khi EXIF có orientation.
    if (info.width > width) {
      width = info.width;
      height = info.height;
    }
  }

  const blur = await sharp(src)
    .rotate()
    .resize({ width: BLUR_WIDTH })
    .webp({ quality: 40 })
    .toBuffer();

  return {
    id,
    width,
    height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    srcSet,
  };
}

async function main() {
  let slugs;
  try {
    slugs = (await readdir(SRC_DIR, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
  } catch {
    console.error(`Không tìm thấy thư mục "${SRC_DIR}/". Bỏ ảnh gốc vào photos/<slug>/ rồi chạy lại.`);
    process.exit(1);
  }

  if (slugs.length === 0) {
    console.error(`"${SRC_DIR}/" rỗng — không có gì để xử lý.`);
    process.exit(1);
  }

  const manifest = {};

  for (const slug of slugs) {
    const srcDir = path.join(SRC_DIR, slug);
    const outDir = path.join(OUT_DIR, slug);
    await mkdir(outDir, { recursive: true });

    const files = (await readdir(srcDir)).filter((f) => IMAGE_EXT.test(f)).sort();
    if (files.length === 0) {
      console.warn(`  ${slug}: không có ảnh, bỏ qua`);
      continue;
    }

    const photos = [];
    for (const [i, file] of files.entries()) {
      photos.push(await buildPhoto(srcDir, outDir, file));
      process.stdout.write(`\r  ${slug}: ${i + 1}/${files.length}`);
    }
    process.stdout.write("\n");
    manifest[slug] = photos;
  }

  const body = `// TỆP TỰ SINH — đừng sửa tay.
// Chạy \`pnpm photos\` để tạo lại từ photos/<slug>/.

export type GeneratedPhoto = {
  /** Tên file gốc bỏ phần đuôi. Khoá để events.ts gắn caption/hiệu ứng. */
  id: string;
  /** Kích thước bản lớn nhất, đã xoay theo EXIF. Đưa vào <img> để khỏi giật layout. */
  width: number;
  height: number;
  /** WebP ${BLUR_WIDTH}px base64, làm nền mờ trong lúc ảnh thật đang tải. */
  blurDataURL: string;
  srcSet: { w: number; src: string }[];
};

export const PHOTO_MANIFEST: Record<string, GeneratedPhoto[]> = ${JSON.stringify(manifest, null, 2)};
`;

  await mkdir(path.dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, body);

  const total = Object.values(manifest).reduce((n, p) => n + p.length, 0);
  console.log(`\nXong: ${total} ảnh, ${slugs.length} sự kiện -> ${MANIFEST}`);
}

await main();
