// Phát nhạc bằng Web Audio thay vì thẻ <audio>: tua được chính xác tới từng
// giây và bám đúng đồng hồ của AudioContext, nên vạch tiến độ không trôi lệch.
//
// Thanh sóng KHÔNG tính ở đây mà sinh sẵn lúc build (xem scripts/analyze-music.mjs):
// card mở sẵn lúc vào trang, đợi tải xong cả bài mới vẽ được sóng thì ai vào
// trang cũng phải tải 3.4MB dù không định nghe.

export async function loadTrack(context: AudioContext, url: string): Promise<AudioBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Không tải được nhạc (${response.status}): ${url}`);
  return context.decodeAudioData(await response.arrayBuffer());
}

export type PlaybackHandle = {
  stop: () => void;
  /**
   * Thời điểm trên đồng hồ của AudioContext ứng với giây 0 của bài. Tiến độ
   * chỉ là `context.currentTime - startedAt`, kể cả khi phát từ giữa bài, nên
   * không cần đếm giờ riêng.
   */
  startedAt: number;
};

/** Phát `buffer` từ giây `offset`. */
export function playBuffer(
  context: AudioContext,
  buffer: AudioBuffer,
  offset: number,
): PlaybackHandle {
  const source = context.createBufferSource();
  source.buffer = buffer;

  // Vào bằng một đoạn dốc rất ngắn: cắt thẳng giữa sóng thì loa kêu "bụp".
  const gain = context.createGain();
  const startedAt = context.currentTime - offset;
  gain.gain.setValueAtTime(0, context.currentTime);
  gain.gain.linearRampToValueAtTime(1, context.currentTime + 0.03);

  source.connect(gain).connect(context.destination);
  source.start(context.currentTime, offset);

  return {
    startedAt,
    stop: () => {
      try {
        source.stop();
      } catch {
        // Nguồn đã dừng sẵn thì stop() ném lỗi; bỏ qua.
      }
      gain.disconnect();
    },
  };
}
