import { describe, expect, it } from "vitest";
import type { SiteEvent } from "@/data/events";
import { getAllEvents, getEvent, getEventAge, sortEvents } from "./events";

function fixture(slug: string, date: string): SiteEvent {
  return {
    slug, date, kind: "milestone", title: slug, description: "",
    palette: ["#fff", "#fff", "#fff", "#fff"],
    gallery: { layout: "carousel-3d", defaultEffect: "none", photoDir: slug },
  };
}

describe("sortEvents", () => {
  it("sắp theo ngày tăng dần, không theo thứ tự khai báo", () => {
    const sorted = sortEvents([
      fixture("c", "2027-01-01"),
      fixture("a", "2025-01-01"),
      fixture("b", "2026-01-01"),
    ]);
    expect(sorted.map((e) => e.slug)).toEqual(["a", "b", "c"]);
  });

  it("không sửa mảng gốc", () => {
    const input = [fixture("b", "2026-01-01"), fixture("a", "2025-01-01")];
    sortEvents(input);
    expect(input.map((e) => e.slug)).toEqual(["b", "a"]);
  });

  it("báo lỗi khi trùng slug", () => {
    expect(() => sortEvents([fixture("a", "2025-01-01"), fixture("a", "2026-01-01")]))
      .toThrow(/trùng/);
  });
});

describe("getEvent", () => {
  it("tìm được sự kiện có thật", () => {
    expect(getEvent("sinh-nhat-1-tuoi")?.title).toBe("Sinh nhật 1 tuổi");
  });

  it("trả undefined với slug lạ", () => {
    expect(getEvent("khong-co-that")).toBeUndefined();
  });
});

describe("getEventAge", () => {
  it("sinh nhật 1 tuổi ứng với 1", () => {
    expect(getEventAge(getAllEvents()[0])).toBe(1);
  });
});
