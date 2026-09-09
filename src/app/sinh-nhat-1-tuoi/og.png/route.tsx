import { ImageResponse } from "next/og";

import { SITE } from "@/data/site";
import { formatDateNumeric } from "@/lib/dates";
import { getEvent } from "@/lib/events";
import { loadOgFonts, loadOgPhoto } from "@/lib/og";
import { getPhotos } from "@/lib/photos";

// Vì sao là route handler tên "og.png" chứ không phải opengraph-image.tsx:
// xem ghi chú ở src/app/og.png/route.tsx.
export const dynamic = "force-static";

const SIZE = { width: 1200, height: 630 };
const SLUG = "sinh-nhat-1-tuoi";

export async function GET() {
  const event = getEvent(SLUG);
  if (!event) return new Response("Not found", { status: 404 });

  const photos = getPhotos(event);
  const photoCount = photos.length;
  // Ảnh thật là thứ đáng giá nhất trên tấm chia sẻ: chỉ có chữ trên nền gradient
  // thì lên Zalo hay Messenger nhìn như tấm thiệp, không ai biết là ảnh em bé.
  const cover = await loadOgPhoto(event.gallery.photoDir, photos[0].id, 380, 538);

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
        {/* Vạch màu dọc mép trái, lấy màu nhấn của trang. */}
        <div style={{ width: 16, height: "100%", background: "#e08a4c" }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 6,
            padding: "0 56px",
            flex: 1,
          }}
        >
          {/* Dấu ngăn vẽ bằng khối tròn thay cho ký tự gõ tay. Satori đòi mọi
              div nhiều con phải khai báo display: flex tường minh. */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 30,
              letterSpacing: 4,
              opacity: 0.75,
            }}
          >
            <div style={{ display: "flex" }}>{SITE.name}</div>
            <div
              style={{
                display: "flex",
                width: 7,
                height: 7,
                borderRadius: 4,
                background: "#1c3049",
                opacity: 0.5,
              }}
            />
            <div style={{ display: "flex" }}>{SITE.fullName}</div>
          </div>

          <div style={{ display: "flex", fontSize: 72, fontFamily: "Baloo 2", lineHeight: 1.15, marginTop: 6 }}>
            {event.title}
          </div>

          {event.tagline ? (
            <div style={{ display: "flex", fontSize: 36, opacity: 0.8 }}>{event.tagline}</div>
          ) : null}

          <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 30 }}>
            <div style={{ width: 90, height: 5, borderRadius: 3, background: "#e08a4c" }} />
            <div style={{ display: "flex", fontSize: 30, opacity: 0.8 }}>{formatDateNumeric(event.date)}</div>
            <div style={{ display: "flex", width: 7, height: 7, borderRadius: 4, background: "#1c3049", opacity: 0.35 }} />
            <div style={{ display: "flex", fontSize: 30, opacity: 0.8 }}>{`${photoCount} khoảnh khắc`}</div>
          </div>
        </div>

        {/* Ảnh bìa. Bo góc và chừa lề để nó đọc ra như một tấm ảnh đặt lên nền,
            chứ không phải nửa khung hình bị cắt đôi. */}
        <div style={{ display: "flex", padding: "46px 46px 46px 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori chỉ hiểu <img>, không chạy được next/image */}
          <img
            src={cover}
            width={380}
            height={538}
            style={{ borderRadius: 28, objectFit: "cover", boxShadow: "0 20px 44px rgba(28,48,73,0.28)" }}
            alt=""
          />
        </div>
      </div>
    ),
    { ...SIZE, fonts: await loadOgFonts() },
  );
}
