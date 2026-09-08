import { ImageResponse } from "next/og";

import { SITE } from "@/data/site";
import { formatDateNumeric } from "@/lib/dates";
import { getAllEvents } from "@/lib/events";
import { loadOgFonts } from "@/lib/og";
import { getPhotos } from "@/lib/photos";

// output: "export" không có runtime, nên route ảnh phải được đánh dấu tĩnh;
// thiếu dòng này build đứt với "dynamic/revalidate not configured".
export const dynamic = "force-static";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE.name} · ${SITE.fullName}`;

export default async function Image() {
  const events = getAllEvents();
  const photoCount = events.reduce((total, event) => total + getPhotos(event).length, 0);
  const palette = events[0]?.palette ?? ["#a8c6e8", "#f0c49a", "#8fb4dd", "#ffe9c9"];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `linear-gradient(135deg, ${palette.join(", ")})`,
          color: "#1c3049",
          fontFamily: "Be Vietnam Pro",
        }}
      >
        <div style={{ width: 16, height: "100%", background: "#e08a4c" }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
            padding: "0 80px",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", fontSize: 190, fontFamily: "Baloo 2", lineHeight: 1 }}>
            {SITE.name}
          </div>
          <div style={{ display: "flex", fontSize: 42, letterSpacing: 2, opacity: 0.8 }}>
            {SITE.fullName}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 34 }}>
            <div style={{ width: 90, height: 5, borderRadius: 3, background: "#e08a4c" }} />
            <div style={{ display: "flex", fontSize: 30, opacity: 0.8 }}>
              {formatDateNumeric(SITE.birthDate)}
            </div>
            <div style={{ display: "flex", fontSize: 30, opacity: 0.45 }}>·</div>
            <div style={{ display: "flex", fontSize: 30, opacity: 0.8 }}>
              {`${events.length} cột mốc`}
            </div>
            <div style={{ display: "flex", fontSize: 30, opacity: 0.45 }}>·</div>
            <div style={{ display: "flex", fontSize: 30, opacity: 0.8 }}>
              {`${photoCount} khoảnh khắc`}
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
