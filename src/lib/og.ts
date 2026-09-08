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
