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
