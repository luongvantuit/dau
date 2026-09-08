"use client";

import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MusicCard } from "@/components/site/music-card";
import { AudioLinesIcon, type AudioLinesIconHandle } from "@/components/ui/audio-lines";
import { MUSIC } from "@/data/music";
import { MUSIC_DURATION } from "@/data/music.generated";
import { withBasePath } from "@/lib/base-path";
import { loadTrack, playBuffer, type PlaybackHandle } from "@/lib/audio-track";
import { inkBlobPath } from "@/lib/ink-blob";

/**
 * navigator.audioSession là API riêng của Safari (16.4+), chưa có trong lib DOM
 * của TypeScript nên phải tự khai báo và dò trước khi dùng.
 */
type NavigatorWithAudioSession = Navigator & {
  audioSession?: {
    type: "auto" | "playback" | "ambient" | "transient" | "transient-solo" | "play-and-record";
  };
};

/** Kéo vào trong khoảng này tính từ cuối bài thì coi như đã nghe hết. */
const END_EPSILON = 0.5;

/** Chờ giọt mực rơi xong rồi mới loang ra thành card. */
const AUTO_OPEN_DELAY = 1400;

export function MusicButton() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contextRef = useRef<AudioContext | null>(null);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const handleRef = useRef<PlaybackHandle | null>(null);
  const frameRef = useRef(0);
  // Đang phát mà kéo vạch thì tắt tiếng trong lúc kéo rồi phát tiếp khi thả.
  const resumeAfterScrubRef = useRef(false);

  // Truyền ref vào icon là nó chuyển sang chế độ điều khiển ngoài, hết tự chạy
  // khi rê chuột. Cần thế vì icon này chạy hoạt cảnh trên chính thuộc tính `d`
  // của path; ngắt giữa chừng là motion ghi vào đó chữ "undefined" và console
  // đỏ rực một loạt lỗi <path>.
  const iconRef = useRef<AudioLinesIconHandle>(null);

  const stopVoice = useCallback(() => {
    handleRef.current?.stop();
    handleRef.current = null;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = 0;
  }, []);

  // Dừng nhạc khi rời trang, nếu không tiếng vẫn chạy sau khi component đã
  // unmount.
  useEffect(() => () => stopVoice(), [stopVoice]);

  // Vào trang là card tự loang ra. Thanh sóng và thời lượng đã tính sẵn lúc
  // build nên chưa tải một byte nhạc nào; file chỉ tải khi có người bấm phát.
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), AUTO_OPEN_DELAY);
    return () => clearTimeout(timer);
  }, []);

  // Kích thước thật của card, đo từ chính lớp ruột. Chốt cứng con số thì hỏng
  // ngay khi màn hẹp hơn 21rem hoặc khi ruột đổi chiều cao.
  const contentRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 360, height: 224 });

  useEffect(() => {
    const element = contentRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      // Đệm nằm trong chính lớp ruột nên số đo đã là kích thước card. Trước
      // đây tôi để p-8 lên vỏ kính và cộng bù ở đây: sai, vì phần tử
      // absolute inset-0 không co xuống dưới mức đệm được, nên lúc thu về làm
      // nút thì vỏ kính vẫn 64px trong khi nút chỉ 48px — thừa ra 16px, thò
      // lệch xuống dưới sang phải.
      setSize({ width: element.offsetWidth, height: element.offsetHeight });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Đường viền vũng mực. Vẽ lại theo kích thước thật ở từng khung hình nên nó
  // loang ra cùng nhịp với card, và chỉ chạy trong lúc đang biến hình: phần tử
  // này có backdrop-filter, đổi đường cắt mỗi khung hình là trình duyệt phải
  // dựng lại cả mảng nền mờ, để chạy mãi thì hao pin vô ích.
  const shellRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    const element = shellRef.current;
    if (!element) return;

    const targetWidth = open ? size.width : 48;
    let frame = 0;
    let steady = 0;

    const draw = () => {
      // offsetWidth/Height chứ KHÔNG phải getBoundingClientRect: cái sau trả về
      // kích thước đã nhân scale, mà clip-path lại vẽ trong hệ toạ độ gốc chưa
      // nhân scale. Hiệu ứng rơi vào có đoạn nảy quá đà lên scale 1.08, dùng
      // rect thì đường cắt được dựng cho hộp 51.9px rồi áp lên hộp 48px: hình
      // vừa to hơn hộp vừa lệch, cắt cụt mép trên trái.
      const width = element.offsetWidth;
      const height = element.offsetHeight;
      // 0 lúc còn là nút, 1 khi đã nở hết: cả độ vuông lẫn độ lồi lõm của mép
      // đều buộc vào con số này.
      const spread = Math.min(Math.max((width - 48) / Math.max(size.width - 48, 1), 0), 1);
      phaseRef.current += 0.04;
      const clipPath = `path("${inkBlobPath(width, height, phaseRef.current, spread)}")`;
      if (glassRef.current) glassRef.current.style.clipPath = clipPath;

      const shadow = shadowRef.current;
      if (shadow) {
        shadow.style.clipPath = clipPath;
        // Bóng phải co theo vật. Để nguyên độ mờ và độ lệch của card (10px và
        // 6px) sau một cái nút 48px thì vệt xám loang hẳn ra ngoài mép, nhìn
        // nút hoá méo mó.
        shadow.style.filter = `blur(${(3 + 7 * spread).toFixed(1)}px)`;
        shadow.style.translate = `0 ${(1 + 5 * spread).toFixed(1)}px`;
      }

      steady = Math.abs(width - targetWidth) < 0.5 ? steady + 1 : 0;
      frame = steady > 2 ? 0 : requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [open, size.width]);

  /**
   * AudioContext chỉ được dựng bên trong một cử chỉ của người dùng, nếu không
   * trình duyệt treo nó ở trạng thái suspended.
   */
  const getContext = useCallback(async () => {
    // iOS xếp Web Audio vào phiên âm thanh "ambient", mà ambient thì bị công
    // tắc im lặng chặn: cắm tai nghe nghe được, rút ra là im re. Khai báo
    // "playback" để nó đi theo đường phát nhạc, không phụ thuộc công tắc nữa.
    // Phải gán TRƯỚC khi dựng AudioContext, vì phiên được chốt lúc khởi tạo.
    const nav = navigator as NavigatorWithAudioSession;
    if (nav.audioSession) nav.audioSession.type = "playback";

    contextRef.current ??= new AudioContext();
    const context = contextRef.current;
    if (context.state === "suspended") await context.resume();
    return context;
  }, []);

  const start = useCallback(
    (context: AudioContext, buffer: AudioBuffer, from: number) => {
      stopVoice();
      handleRef.current = playBuffer(context, buffer, from);
      setPlaying(true);

      const tick = () => {
        const handle = handleRef.current;
        if (!handle) return;
        const at = context.currentTime - handle.startedAt;

        if (at >= MUSIC_DURATION) {
          // Hết bài thì về đầu. Vòng rAF này vốn đã phải chạy để vẽ tiến độ nên
          // dùng luôn nó làm mốc kết thúc, thay vì trông chờ sự kiện "ended"
          // của nguồn phát.
          stopVoice();
          setElapsed(0);
          setPlaying(false);
          return;
        }

        setElapsed(Math.max(at, 0));
        frameRef.current = requestAnimationFrame(tick);
      };
      frameRef.current = requestAnimationFrame(tick);
    },
    [stopVoice],
  );

  /** Phát từ giây `from`, tải bài nếu đây là lần đầu. */
  const play = useCallback(
    async (from: number) => {
      const context = await getContext();

      if (bufferRef.current) {
        start(context, bufferRef.current, from);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const buffer = await loadTrack(context, withBasePath(MUSIC.src));
        bufferRef.current = buffer;
        start(context, buffer, from);
      } catch {
        setError("Chưa phát được bài này. Kiểm tra lại file nhạc trong public/music/.");
      } finally {
        setLoading(false);
      }
    },
    [getContext, start],
  );

  const toggle = () => {
    if (playing) {
      stopVoice();
      setPlaying(false);
      return;
    }
    void play(elapsed);
  };

  /** Đang kéo vạch: tắt tiếng, chỉ dời vị trí. */
  const scrub = (to: number) => {
    if (handleRef.current) {
      resumeAfterScrubRef.current = true;
      stopVoice();
      setPlaying(false);
    }
    setElapsed(to);
  };

  /** Thả tay: chốt vị trí, phát tiếp nếu trước khi kéo đang phát. */
  const commitSeek = (to: number) => {
    const resume = resumeAfterScrubRef.current;
    resumeAfterScrubRef.current = false;

    // Kéo sát mép cuối thì coi như đã nghe hết. Trước đây chỗ này vẫn cho phát
    // tiếp: nguồn phát chạy đúng vài chục mili giây cuối rồi mới chạm mốc kết
    // thúc, nên nút đứng ở trạng thái "đang phát" một lúc trong khi chẳng nghe
    // thấy gì.
    if (to >= MUSIC_DURATION - END_EPSILON) {
      stopVoice();
      setPlaying(false);
      setElapsed(0);
      return;
    }

    setElapsed(to);
    if (resume) void play(to);
  };

  // Đóng thì chỉ tắt tiếng, GIỮ NGUYÊN vị trí đang nghe: mở lại là nghe tiếp
  // chứ không phải nghe lại từ đầu.
  const close = () => {
    stopVoice();
    setPlaying(false);
    setOpen(false);
  };

  return (
    <motion.div
      ref={shellRef}
      // MỘT phần tử duy nhất phình từ nút ra thành card. Tự lái width/height
      // chứ không dùng prop `layout`: đo thực tế thì layout nhảy thẳng sang bề
      // ngang cuối ngay khung hình đầu rồi mới giật chiều cao, nhìn ra đúng cái
      // cảnh "nút biến mất, card hiện lên" cần tránh.
      animate={{ width: open ? size.width : 48, height: open ? size.height : 48 }}
      initial={false}
      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
      className="music-orb fixed right-4 bottom-4 z-50 md:right-6 md:bottom-6"
    >
      {/* Bóng đổ tự vẽ. clip-path cắt luôn box-shadow của lớp kính, mà đặt
          filter lên chính lớp kính thì backdrop-filter mất nền lấy mẫu và ra
          mảng đen. Nên bóng là một lớp ANH EM nằm dưới, cùng hình cắt, tự làm
          mờ lấy — filter ở đây vô hại vì lớp này không có backdrop-filter. */}
      <div
        ref={shadowRef}
        aria-hidden
        // Màu đen cố định, KHÔNG dùng --foreground: ở nền tối foreground là màu
        // sáng nên bóng hoá thành quầng sáng. Độ mờ và độ lệch do vòng rAF đặt
        // theo kích thước hiện tại.
        className="absolute inset-0 bg-black/20 dark:bg-black/45"
        // Cùng hình với lớp kính lúc chưa có clip-path.
        style={{ borderRadius: open ? 24 : 9999 }}
      />

      <div
        ref={glassRef}
        className="liquid-glass absolute inset-0 overflow-hidden"
        // Bo góc chỉ là lưới đỡ cho trình duyệt không hiểu path(): thấy được
        // nó thì vẫn ra một cái card bo tròn tử tế. Hình thật do clip-path lo.
        style={{ borderRadius: open ? 24 : 9999 }}
        {...(open ? { role: "dialog", "aria-label": "Trình phát nhạc" } : {})}
      >
        {/* Cả hai lớp ruột luôn nằm sẵn trong DOM và chỉ mờ đi/hiện ra. Mờ dần
            ở đây là an toàn vì chúng là CON của lớp kính; đặt opacity < 1 lên
            chính .liquid-glass mới làm backdrop-filter mất nền lấy mẫu. Giữ
            sẵn cũng để đo được bề ngang, chiều cao thật của card. */}
        <motion.div
          ref={contentRef}
          inert={!open}
          animate={{ opacity: open ? 1 : 0 }}
          initial={false}
          transition={{ duration: 0.2, delay: open ? 0.14 : 0 }}
          // Chốt bề ngang bằng đúng bề ngang card: để nó co theo vỏ thì chữ và
          // thanh sóng dồn lại rồi bung ra trong lúc đang nở, giật rất rõ.
          className="w-[min(22.5rem,100vw-2rem)] p-8"
        >
          <MusicCard
            elapsed={elapsed}
            playing={playing}
            loading={loading}
            error={error}
            onToggle={toggle}
            onScrub={scrub}
            onSeek={commitSeek}
            onClose={close}
          />
        </motion.div>

        <motion.button
          inert={open}
          onClick={() => setOpen(true)}
          aria-label="Mở trình phát nhạc"
          animate={{ opacity: open ? 0 : 1 }}
          initial={false}
          transition={{ duration: 0.18 }}
          // Phủ kín vỏ: lúc đóng thì thứ người ta thấy là nút màu đặc, lớp
          // kính nằm dưới chỉ lộ ra khi card mở.
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-primary text-primary-foreground"
        >
          <AudioLinesIcon ref={iconRef} size={20} />
        </motion.button>
      </div>
    </motion.div>
  );
}
