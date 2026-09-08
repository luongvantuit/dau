import sharp from "sharp";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Satori không giải nén được WOFF2 (định dạng next/font dùng), nên OG image cần
// bản TTF riêng nằm trong repo. Đọc lúc build, không phải lúc chạy.
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

/**
 * Một tấm ảnh thật để nhúng vào ảnh chia sẻ, trả về data URI.
 *
 * Phải đổi sang JPEG: Satori không giải mã được WebP, mà kho ảnh của trang thì
 * chỉ có WebP. Đọc từ public/photos/ lúc build, không phải lúc chạy.
 */
export async function loadOgPhoto(
  photoDir: string,
  id: string,
  width: number,
  height: number,
): Promise<string> {
  const file = path.join(process.cwd(), "public", "photos", photoDir, `${id}-800.webp`);
  const jpeg = await sharp(await readFile(file))
    // position "attention" cắt quanh vùng nhiều chi tiết nhất, nên ảnh dọc
    // không bị xén mất mặt khi ép về khung ngang.
    .resize(width, height, { fit: "cover", position: "attention" })
    .jpeg({ quality: 82 })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}
