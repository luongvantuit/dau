import { describe, expect, it } from "vitest";

import { ageParts, countdownTo, daysInMonth, toISODate } from "./dates";

describe("daysInMonth", () => {
  it("tháng 12 không tràn sang năm sau", () => {
    expect(daysInMonth(2026, 12)).toBe(31);
  });

  it("tháng 2 năm nhuận có 29 ngày", () => {
    expect(daysInMonth(2028, 2)).toBe(29);
    expect(daysInMonth(2026, 2)).toBe(28);
  });
});

describe("ageParts", () => {
  it("đúng ngày sinh nhật thì tròn năm", () => {
    expect(ageParts("2025-09-17", "2026-09-17")).toEqual({ years: 1, months: 0, days: 0 });
  });

  it("mượn ngày từ tháng liền trước khi chưa qua ngày", () => {
    // 8/9 chưa tới 17/9 -> mượn tháng 8 (31 ngày): 8 + 31 - 17 = 22
    expect(ageParts("2025-09-17", "2026-09-08")).toEqual({ years: 0, months: 11, days: 22 });
  });

  it("mượn qua ranh giới năm", () => {
    expect(ageParts("2025-09-17", "2026-01-05")).toEqual({ years: 0, months: 3, days: 19 });
  });
});

describe("countdownTo", () => {
  it("mốc đã qua trả về done", () => {
    expect(countdownTo("2026-09-01", new Date(2026, 8, 8, 10, 0, 0)).done).toBe(true);
  });

  it("chính nửa đêm ngày diễn ra đã tính là done", () => {
    expect(countdownTo("2026-09-17", new Date(2026, 8, 17, 0, 0, 0)).done).toBe(true);
  });

  it("tách đúng ngày/giờ/phút/giây", () => {
    // 08/09 lúc 21:00:30 -> tới 17/09 00:00:00 là 8 ngày 2 giờ 59 phút 30 giây
    expect(countdownTo("2026-09-17", new Date(2026, 8, 8, 21, 0, 30))).toEqual({
      days: 8,
      hours: 2,
      minutes: 59,
      seconds: 30,
      done: false,
    });
  });
});

describe("toISODate", () => {
  it("đệm số 0 và dùng giờ địa phương", () => {
    expect(toISODate(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
  });
});
