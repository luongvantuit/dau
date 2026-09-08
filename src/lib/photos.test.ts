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
