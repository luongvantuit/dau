import { ImageResponse } from "next/og";

import { SITE } from "@/data/site";
import { formatDateNumeric } from "@/lib/dates";
import { getEvent, getEventAge } from "@/lib/events";
import { loadOgFonts } from "@/lib/og";
import { getPhotos } from "@/lib/photos";

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

  const age = getEventAge(event);
  const photoCount = getPhotos(event).length;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: `linear-gradient(135deg, ${event.palette.join(", ")})`,
          color: "#1c3049",
          fontFamily: "Be Vietnam Pro",
          position: "relative",
        }}
      >
        {/* Số tuổi làm hoa văn chìm bên phải. Satori không có opacity trên
            text nên dùng màu trắng pha sẵn thay vì rgba trên chữ đặc. */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            right: -60,
            bottom: -190,
            fontSize: 620,
            fontFamily: "Baloo 2",
            color: "rgba(255,255,255,0.30)",
            lineHeight: 1,
          }}
        >
          {age > 0 ? age : "0"}
        </div>

        {/* Vạch màu dọc mép trái, lấy màu nhấn của trang. */}
        <div style={{ width: 16, height: "100%", background: "#e08a4c" }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
            padding: "0 70px",
            flex: 1,
          }}
        >
          <div style={{ display: "flex", fontSize: 30, letterSpacing: 4, opacity: 0.75 }}>
            {`${SITE.name} · ${SITE.fullName}`}
          </div>

          <div style={{ display: "flex", fontSize: 96, fontFamily: "Baloo 2", lineHeight: 1.15, marginTop: 6 }}>
            {event.title}
          </div>

          {event.tagline ? (
            <div style={{ display: "flex", fontSize: 36, opacity: 0.8 }}>{event.tagline}</div>
          ) : null}

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 30 }}>
            <div style={{ width: 90, height: 5, borderRadius: 3, background: "#e08a4c" }} />
            <div style={{ display: "flex", fontSize: 30, opacity: 0.8 }}>{formatDateNumeric(event.date)}</div>
            <div style={{ display: "flex", fontSize: 30, opacity: 0.45 }}>·</div>
            <div style={{ display: "flex", fontSize: 30, opacity: 0.8 }}>{`${photoCount} khoảnh khắc`}</div>
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await loadOgFonts() },
  );
}
