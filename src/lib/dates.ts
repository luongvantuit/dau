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
