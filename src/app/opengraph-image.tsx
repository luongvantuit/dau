import { ImageResponse } from "next/og";

import { SITE } from "@/data/site";
import { loadOgFonts } from "@/lib/og";

// output: "export" không có runtime, nên route ảnh phải được đánh dấu tĩnh;
// thiếu dòng này build đứt với "dynamic/revalidate not configured".
export const dynamic = "force-static";

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
