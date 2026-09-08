// Giai điệu "Happy Birthday to You" — phần nhạc đã thuộc phạm vi công cộng.
// Tổng hợp bằng Web Audio thay vì phát file: không thêm dung lượng vào repo,
// không vướng bản quyền bản thu, và chạy được trên site tĩnh.

/** [bán cung so với A4=440Hz, số phách] */
type Note = [semitonesFromA4: number, beats: number];

// Giọng Fa trưởng, mở đầu bằng nhịp lấy đà hai móc đơn.
const MELODY: Note[] = [
  [0, 0.5], [0, 0.5], [2, 1], [0, 1], [5, 1], [4, 2],
  [0, 0.5], [0, 0.5], [2, 1], [0, 1], [7, 1], [5, 2],
  [0, 0.5], [0, 0.5], [12, 1], [9, 1], [5, 1], [4, 1], [2, 2],
  [10, 0.5], [10, 0.5], [9, 1], [5, 1], [7, 1], [5, 2],
];

const BEAT_SECONDS = 0.42;

function frequency(semitones: number): number {
  return 440 * 2 ** (semitones / 12);
}

/**
 * Phát trọn giai điệu, trả về hàm dừng. Mỗi nốt là một oscillator riêng có
 * đường bao âm lượng — thiếu đường bao thì đầu và cuối nốt kêu "cụp".
 */
export function playHappyBirthday(context: AudioContext, onEnd: () => void): () => void {
  const master = context.createGain();
  master.gain.value = 0.22;
  master.connect(context.destination);

  const voices: OscillatorNode[] = [];
  let at = context.currentTime + 0.08;

  for (const [semitones, beats] of MELODY) {
    const duration = beats * BEAT_SECONDS;
    const osc = context.createOscillator();
    const gain = context.createGain();

    // Sóng tam giác nghe gần hộp nhạc, dịu hơn sóng vuông hay răng cưa.
    osc.type = "triangle";
    osc.frequency.value = frequency(semitones);

    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(1, at + 0.02);
    gain.gain.setValueAtTime(1, at + duration * 0.65);
    gain.gain.exponentialRampToValueAtTime(0.001, at + duration * 0.98);

    osc.connect(gain).connect(master);
    osc.start(at);
    osc.stop(at + duration);
    voices.push(osc);

    at += duration;
  }

  voices[voices.length - 1].addEventListener("ended", onEnd);

  return () => {
    for (const osc of voices) {
      try {
        osc.stop();
      } catch {
        // Nốt chưa bắt đầu thì stop() ném lỗi; bỏ qua.
      }
    }
    master.disconnect();
  };
}
