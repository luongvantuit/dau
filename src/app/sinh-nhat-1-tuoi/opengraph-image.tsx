import { ImageResponse } from "next/og";

import { SITE } from "@/data/site";
import { formatDateVi } from "@/lib/dates";
import { getEvent } from "@/lib/events";
import { loadOgFonts } from "@/lib/og";

// output: "export" không có runtime, nên route ảnh phải được đánh dấu tĩnh;
// thiếu dòng này build đứt với "dynamic/revalidate not configured".
export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Ảnh chia sẻ";

const SLUG = "sinh-nhat-1-tuoi";

export default async function Image() {
  const event = getEvent(SLUG);
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
        {/* Một chuỗi duy nhất: Satori bắt div nhiều child phải khai báo display. */}
        <div style={{ fontFamily: "Be Vietnam Pro", fontSize: 34, opacity: 0.8 }}>
          {`${SITE.name} · ${SITE.fullName}`}
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
