import { describe, expect, it } from "vitest";
import type { SiteEvent } from "@/data/events";
import { CAROUSEL_RATIO, GALLERY_EFFECTS, carouselPhotos, getPhotos, withGalleryEffects } from "./photos";

function event(
  overrides?: SiteEvent["gallery"]["overrides"],
  exclude?: string[],
): SiteEvent {
  return {
    slug: "sinh-nhat-1-tuoi", date: "2026-09-17", kind: "birthday",
    title: "Sinh nhật 1 tuổi", description: "",
    palette: ["#fff", "#fff", "#fff", "#fff"],
    gallery: {
      layout: "carousel-3d", defaultEffect: "water",
      photoDir: "sinh-nhat-1-tuoi", overrides, exclude,
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

  it("bỏ được ảnh không muốn hiện", () => {
    const photos = getPhotos(event(undefined, ["DSC05926", "IMG_8288"]));
    expect(photos).toHaveLength(29);
    expect(photos.map((p) => p.id)).not.toContain("DSC05926");
    expect(photos.map((p) => p.id)).not.toContain("IMG_8288");
  });

  it("đánh số alt liên tục sau khi lọc, không để lại lỗ hổng", () => {
    const photos = getPhotos(event(undefined, ["DSC05289"]));
    expect(photos[0].alt).toContain("ảnh 1");
    expect(photos.at(-1)?.alt).toContain(`ảnh ${photos.length}`);
  });

  it("báo lỗi khi exclude trỏ tới ảnh không tồn tại", () => {
    expect(() => getPhotos(event(undefined, ["KHONG_CO_ANH_NAY"])))
      .toThrow(/KHONG_CO_ANH_NAY/);
  });

  it("tilt lặp lại được giữa các lần gọi (tránh lệch hydration)", () => {
    expect(getPhotos(event()).map((p) => p.tilt))
      .toEqual(getPhotos(event()).map((p) => p.tilt));
  });
});

describe("carouselPhotos", () => {
  it("bỏ ảnh ngang vì khung xoay là khổ dọc cố định", () => {
    const kept = carouselPhotos(getPhotos(event()));
    expect(kept.map((p) => p.id)).not.toContain("DSC05696");
  });

  it("giữ ảnh dọc lệch nhẹ (1600x2240) vì cắt đi chỉ vài phần trăm", () => {
    const kept = carouselPhotos(getPhotos(event()));
    expect(kept.map((p) => p.id)).toContain("DSC05459");
  });

  it("mọi ảnh giữ lại đều nằm trong dung sai quanh khổ dọc chuẩn", () => {
    for (const photo of carouselPhotos(getPhotos(event()))) {
      expect(Math.abs(photo.width / photo.height - CAROUSEL_RATIO)).toBeLessThan(0.1);
    }
  });

  it("không bao giờ trả mảng rỗng nếu đầu vào có ảnh", () => {
    expect(carouselPhotos(getPhotos(event())).length).toBeGreaterThan(0);
  });
});

describe("withGalleryEffects", () => {
  // Giống events.ts thật: ảnh mặc định không có hiệu ứng, gallery mới rải vào.
  const base = () =>
    getPhotos({
      ...event(),
      gallery: { ...event().gallery, defaultEffect: "none" },
    });

  it("chỉ một phần ảnh có hiệu ứng, số còn lại để nguyên", () => {
    const photos = withGalleryEffects(base());
    const shaded = photos.filter((p) => p.effect !== "none");
    expect(shaded.length).toBeGreaterThan(0);
    expect(shaded.length).toBeLessThan(photos.length / 2);
  });

  it("không vượt trần WebGL: tối đa 12 ảnh có shader", () => {
    // Chrome ~16 context/trang, iOS Safari ít hơn. Cộng thêm 1 canvas nền.
    const shaded = withGalleryEffects(base()).filter((p) => p.effect !== "none");
    expect(shaded.length).toBeLessThanOrEqual(12);
  });

  it("chỉ dùng hiệu ứng giữ nguyên màu và còn nhìn rõ ảnh", () => {
    // Dithering/halftone đổi hẳn màu, fluted-glass/lens-distortion cắt vụn
    // khuôn mặt. Gallery là chỗ để xem ảnh nên chỉ nhận hiệu ứng nhẹ.
    expect([...GALLERY_EFFECTS]).toEqual(["paper-texture", "water"]);
  });

  it("xoay vòng qua đủ các hiệu ứng thay vì lặp một loại", () => {
    const used = new Set(
      withGalleryEffects(base()).filter((p) => p.effect !== "none").map((p) => p.effect),
    );
    expect(used.size).toBeGreaterThanOrEqual(Math.min(7, GALLERY_EFFECTS.length));
  });

  it("giữ nguyên số lượng và thứ tự ảnh", () => {
    const before = base();
    const after = withGalleryEffects(before);
    expect(after.map((p) => p.id)).toEqual(before.map((p) => p.id));
  });

  it("không đè lên hiệu ứng đã chỉ định thủ công trong overrides", () => {
    const withOverride = event({ DSC05289: { effect: "water" } });
    const photos = withGalleryEffects(
      getPhotos({ ...withOverride, gallery: { ...withOverride.gallery, defaultEffect: "none" } }),
    );
    expect(photos.find((p) => p.id === "DSC05289")?.effect).toBe("water");
  });
});
