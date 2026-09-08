import { describe, expect, it } from "vitest";
import { ageInYears, formatDateVi } from "./dates";

describe("ageInYears", () => {
  it("tròn 1 tuổi đúng ngày sinh nhật", () => {
    expect(ageInYears("2025-09-17", "2026-09-17")).toBe(1);
  });

  it("còn 0 tuổi khi sinh nhật chưa tới", () => {
    expect(ageInYears("2025-09-17", "2026-09-16")).toBe(0);
  });

  it("bằng 0 ngay ngày sinh", () => {
    expect(ageInYears("2025-09-17", "2025-09-17")).toBe(0);
  });

  it("sinh 29/02: năm thường phải đợi hết 28/02", () => {
    expect(ageInYears("2024-02-29", "2025-02-28")).toBe(0);
    expect(ageInYears("2024-02-29", "2025-03-01")).toBe(1);
  });

  it("trả số âm nếu mốc nằm trước ngày sinh", () => {
    expect(ageInYears("2025-09-17", "2025-01-01")).toBe(-1);
  });

  it("từ chối định dạng ngày kiểu Việt", () => {
    expect(() => ageInYears("17-09-2025", "2026-09-17")).toThrow(/không hợp lệ/);
  });
});

describe("formatDateVi", () => {
  it("bỏ số 0 thừa ở ngày và tháng", () => {
    expect(formatDateVi("2026-09-17")).toBe("17 tháng 9, 2026");
    expect(formatDateVi("2026-01-05")).toBe("5 tháng 1, 2026");
  });
});
