// Đọc file nhạc trong public/music/ rồi sinh sẵn thanh sóng vào
// src/data/music.generated.ts.
//
// Làm ở đây thay vì ngoài trình duyệt vì card nhạc mở sẵn lúc vào trang: nếu
// đợi tải xong 3.4MB mới vẽ được sóng thì ai vào trang cũng phải tải cả bài dù
// không định nghe. Tính trước thì trang chỉ tải nhạc khi có người bấm phát.
// Chạy lại mỗi khi đổi bài:
//     pnpm music

import decode from "audio-decode";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC = path.join("public", "music", "khuc-hat-mung-sinh-nhat.mp3");
const OUT = path.join("src", "data", "music.generated.ts");
const BAR_COUNT = 48;

/**
 * Gom mẫu âm thành `BAR_COUNT` cột. Lấy trị tuyệt đối lớn nhất trong mỗi khoảng
 * chứ không lấy trung bình: trung bình của sóng dao động quanh 0 ra gần 0 hết,
 * cả bài thành một dải phẳng.
 */
function buildPeaks(channel, count) {
  const perBar = Math.floor(channel.length / count);
  const peaks = [];
  let loudest = 0;

  for (let bar = 0; bar < count; bar++) {
    const from = bar * perBar;
    const to = bar === count - 1 ? channel.length : from + perBar;
    let peak = 0;
    // Nhảy quãng thay vì quét từng mẫu: một bài ba phút rưỡi có hơn mười triệu
    // mẫu, quét hết chỉ để vẽ 48 cột là thừa. Bước 64 vẫn bắt đúng đỉnh.
    for (let i = from; i < to; i += 64) {
      const value = Math.abs(channel[i]);
      if (value > peak) peak = value;
    }
    if (peak > loudest) loudest = peak;
    peaks.push(peak);
  }

  // Chuẩn hoá theo cột to nhất: bản thu nhỏ tiếng vẫn ra thanh sóng đầy đặn.
  // Sàn 0.08 để đoạn lặng vẫn còn một vạch, không bị mất cột.
  return peaks.map((peak) =>
    Number(Math.max(0.08, loudest === 0 ? 0 : peak / loudest).toFixed(3)),
  );
}

// audio-decode trả về { channelData, sampleRate } chứ không phải AudioBuffer
// như trong trình duyệt, nên thời lượng phải tự tính.
const { channelData, sampleRate } = await decode(await readFile(SRC));
const duration = channelData[0].length / sampleRate;
const peaks = buildPeaks(channelData[0], BAR_COUNT);

await writeFile(
  OUT,
  `// TỆP SINH TỰ ĐỘNG — đừng sửa tay. Chạy \`pnpm music\` để dựng lại.
// Nguồn: ${SRC}

/** Chiều cao 0..1 của từng cột trên thanh sóng. */
export const MUSIC_WAVEFORM: readonly number[] = ${JSON.stringify(peaks)};

/** Thời lượng bài, tính bằng giây. */
export const MUSIC_DURATION = ${duration.toFixed(2)};
`,
);

console.log(`${OUT}: ${peaks.length} cột, ${duration.toFixed(1)} giây`);
