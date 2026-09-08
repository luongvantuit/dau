// Đường viền vũng mực cho card nhạc.
//
// border-radius KHÔNG làm được việc này: nó chỉ dựng được bốn góc elip, cho
// bốn góc bốn số khác nhau thì ra hình chữ nhật bo méo, mắt đọc ngay thành làm
// ẩu. Nên phải cắt bằng clip-path.
//
// Điểm được rải đều theo CHU VI rồi đẩy dọc pháp tuyến. Bản đầu tôi rải theo
// góc quanh tâm: trên một hộp bẹt thì điểm dồn hết về hai đầu trái phải và
// thưa ra dọc cạnh trên dưới, kết quả là hai đầu phình cục còn cạnh trên gần
// như thẳng — ra cái gối chứ không ra vũng mực.

/** Khoảng cách giữa hai điểm mẫu, tính theo chu vi. */
const STEP = 12;
const MIN_POINTS = 24;
const MAX_POINTS = 140;

/** Bán kính bo của hình nền lúc đã loang hết. */
const SPREAD_RADIUS = 50;
/** Biên độ lồi lõm của mép lúc đã loang hết, tính bằng pixel. */
const SPREAD_AMPLITUDE = 8;
/** Biên độ lúc còn là nút. Không về 0: giọt mực cũng phải méo, không phải hình tròn. */
const DROP_AMPLITUDE = 2;

/**
 * Ba sóng với số chu kỳ NGUYÊN trên trọn chu vi nên điểm cuối gặp điểm đầu
 * khít, không để lại vết nối. Tần số lệch nhau và không phải bội của nhau để
 * các thuỳ không đều tăm tắp như bánh răng.
 */
const WAVES: ReadonlyArray<readonly [gain: number, frequency: number]> = [
  [0.5, 5],
  [0.3, 8],
  [0.2, 13],
];

type Sample = [x: number, y: number, normalX: number, normalY: number];

/** Đi vòng quanh hình chữ nhật bo góc, trả về điểm và pháp tuyến hướng ra. */
function outline(width: number, height: number, radius: number) {
  const straightX = width - 2 * radius;
  const straightY = height - 2 * radius;
  const arc = (Math.PI * radius) / 2;

  const segments: Array<{ length: number; at: (t: number) => Sample }> = [
    { length: straightX, at: (t) => [radius + t, 0, 0, -1] },
    {
      length: arc,
      at: (t) => {
        const a = -Math.PI / 2 + t / radius;
        return [
          width - radius + radius * Math.cos(a),
          radius + radius * Math.sin(a),
          Math.cos(a),
          Math.sin(a),
        ];
      },
    },
    { length: straightY, at: (t) => [width, radius + t, 1, 0] },
    {
      length: arc,
      at: (t) => {
        const a = t / radius;
        return [
          width - radius + radius * Math.cos(a),
          height - radius + radius * Math.sin(a),
          Math.cos(a),
          Math.sin(a),
        ];
      },
    },
    { length: straightX, at: (t) => [width - radius - t, height, 0, 1] },
    {
      length: arc,
      at: (t) => {
        const a = Math.PI / 2 + t / radius;
        return [
          radius + radius * Math.cos(a),
          height - radius + radius * Math.sin(a),
          Math.cos(a),
          Math.sin(a),
        ];
      },
    },
    { length: straightY, at: (t) => [0, height - radius - t, -1, 0] },
    {
      length: arc,
      at: (t) => {
        const a = Math.PI + t / radius;
        return [
          radius + radius * Math.cos(a),
          radius + radius * Math.sin(a),
          Math.cos(a),
          Math.sin(a),
        ];
      },
    },
  ];

  const total = segments.reduce((sum, segment) => sum + segment.length, 0);
  return {
    total,
    at(distance: number): Sample {
      let left = distance % total;
      for (const segment of segments) {
        if (left <= segment.length) return segment.at(left);
        left -= segment.length;
      }
      return segments[0].at(0);
    },
  };
}

/** Nối các điểm thành đường cong trơn khép kín (Catmull-Rom đổi sang Bézier). */
function smoothClosedPath(points: Array<[number, number]>): string {
  const n = points.length;
  const at = (index: number) => points[(index + n) % n];
  const [startX, startY] = at(0);

  let d = `M${startX.toFixed(1)} ${startY.toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [p0x, p0y] = at(i - 1);
    const [p1x, p1y] = at(i);
    const [p2x, p2y] = at(i + 1);
    const [p3x, p3y] = at(i + 2);
    d +=
      `C${(p1x + (p2x - p0x) / 6).toFixed(1)} ${(p1y + (p2y - p0y) / 6).toFixed(1)}` +
      ` ${(p2x - (p3x - p1x) / 6).toFixed(1)} ${(p2y - (p3y - p1y) / 6).toFixed(1)}` +
      ` ${p2x.toFixed(1)} ${p2y.toFixed(1)}`;
  }
  return `${d}Z`;
}

/**
 * Đường viền cho hộp `width` × `height`.
 *
 * `spread` 0 là giọt mực chưa loang, 1 là đã loang hết thành card. Bán kính bo
 * đi từ nửa cạnh ngắn (giọt) tới bán kính card, còn biên độ lồi lõm đi từ
 * DROP_AMPLITUDE tới SPREAD_AMPLITUDE — nghĩa là ngay cả lúc bé nhất mép vẫn
 * méo, chỉ méo ít thôi.
 */
export function inkBlobPath(width: number, height: number, phase: number, spread: number): string {
  const amplitude = DROP_AMPLITUDE + (SPREAD_AMPLITUDE - DROP_AMPLITUDE) * spread;
  const radius = (Math.min(width, height) / 2) * (1 - spread) + SPREAD_RADIUS * spread;

  // Thụt hình nền vào đúng bằng biên độ, để thuỳ phình ra xa nhất cũng chỉ vừa
  // chạm mép hộp. Thiếu bước này thì phần phình ra nằm ngoài hộp, trình duyệt
  // không vẽ gì ở đó, mép hoá ra chỉ bị khoét vào — nhìn như sứt sẹo.
  const innerWidth = width - 2 * amplitude;
  const innerHeight = height - 2 * amplitude;
  const innerRadius = Math.min(radius, Math.min(innerWidth, innerHeight) / 2);

  const path = outline(innerWidth, innerHeight, innerRadius);
  const count = Math.max(MIN_POINTS, Math.min(MAX_POINTS, Math.round(path.total / STEP)));

  const points: Array<[number, number]> = [];
  for (let i = 0; i < count; i++) {
    const distance = (i / count) * path.total;
    const [x, y, normalX, normalY] = path.at(distance);
    const t = (distance / path.total) * Math.PI * 2;

    let offset = 0;
    for (const [gain, frequency] of WAVES) {
      offset += gain * Math.sin(frequency * t + phase * (frequency % 2 === 0 ? -0.7 : 1));
    }

    points.push([
      amplitude + x + normalX * amplitude * offset,
      amplitude + y + normalY * amplitude * offset,
    ]);
  }

  return smoothClosedPath(points);
}
