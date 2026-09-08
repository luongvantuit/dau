export type DateParts = { y: number; m: number; d: number };

export function parseISODate(iso: string): DateParts {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Ngày không hợp lệ, cần dạng YYYY-MM-DD: ${iso}`);
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

export function ageInYears(birthISO: string, atISO: string): number {
  const birth = parseISODate(birthISO);
  const at = parseISODate(atISO);
  let age = at.y - birth.y;
  // Chưa qua ngày sinh nhật trong năm thì trừ đi 1. So sánh tháng/ngày trực tiếp
  // nên 29/02 tự động đúng: 28/02 vẫn nhỏ hơn 29 nên chưa tính thêm tuổi.
  if (at.m < birth.m || (at.m === birth.m && at.d < birth.d)) age -= 1;
  return age;
}

export function formatDateVi(iso: string): string {
  const { y, m, d } = parseISODate(iso);
  return `${d} tháng ${m}, ${y}`;
}

/**
 * Dạng gọn "17.09.2026" cho ô số liệu. Giữ số 0 đứng đầu nên mọi ngày đều
 * đúng 10 ký tự — dạng dài "17 tháng 9, 2026" bị xuống dòng trong ô hẹp và
 * làm cả hàng lệch nhau.
 */
export function formatDateNumeric(iso: string): string {
  const { y, m, d } = parseISODate(iso);
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

/** Số ngày của tháng `m` (1-12) trong năm `y`. */
export function daysInMonth(y: number, m: number): number {
  // Ngày 0 của tháng kế tiếp chính là ngày cuối tháng này; Date tự xử lý việc
  // tràn sang năm khác khi m = 12.
  return new Date(y, m, 0).getDate();
}

export type AgeParts = { years: number; months: number; days: number };

/**
 * Tuổi tách thành năm/tháng/ngày. Mượn từ tháng liền trước khi thiếu ngày, nên
 * quãng tính ra khớp với cách người ta đọc lịch ("11 tháng 22 ngày") thay vì
 * quy hết về số ngày.
 */
export function ageParts(birthISO: string, atISO: string): AgeParts {
  const b = parseISODate(birthISO);
  const at = parseISODate(atISO);
  let years = at.y - b.y;
  let months = at.m - b.m;
  let days = at.d - b.d;
  if (days < 0) {
    months -= 1;
    days += daysInMonth(at.y, at.m - 1);
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

/** Ngày địa phương của một Date, dạng YYYY-MM-DD. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  /** Đã tới hoặc đã qua mốc. */
  done: boolean;
};

/**
 * Đếm ngược tới 00:00 giờ địa phương của ngày `iso`. Lấy mốc là nửa đêm chứ
 * không phải thời điểm hiện tại trong ngày: sự kiện chỉ có ngày, không có giờ,
 * nên "còn 0 ngày" phải đúng nghĩa là hôm nay.
 */
export function countdownTo(iso: string, now: Date): Countdown {
  const { y, m, d } = parseISODate(iso);
  const diff = new Date(y, m - 1, d).getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: false,
  };
}
