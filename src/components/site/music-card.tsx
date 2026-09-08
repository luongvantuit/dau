"use client";

import { Loader2 } from "lucide-react";
import { useRef, type PointerEvent } from "react";

import { LogoMark } from "@/components/site/logo";
import { PauseIcon } from "@/components/ui/pause";
import { PlayIcon } from "@/components/ui/play";
import { XIcon } from "@/components/ui/x";
import { cn } from "cn";
import { MUSIC } from "@/data/music";
import { MUSIC_DURATION, MUSIC_WAVEFORM } from "@/data/music.generated";
import { withBasePath } from "@/lib/base-path";

function formatTime(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}

export function MusicCard({
  elapsed,
  playing,
  loading,
  error,
  onToggle,
  onScrub,
  onSeek,
  onClose,
}: {
  elapsed: number;
  playing: boolean;
  loading: boolean;
  error: string | null;
  onToggle: () => void;
  /** Đang kéo: chỉ dời vạch, chưa đụng tới tiếng. */
  onScrub: (seconds: number) => void;
  /** Thả tay: chốt vị trí, phát tiếp từ đó nếu trước khi kéo đang phát. */
  onSeek: (seconds: number) => void;
  onClose: () => void;
}) {
  const dragging = useRef(false);
  const progress = Math.min(elapsed / MUSIC_DURATION, 1);

  const positionOf = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - rect.left) / rect.width;
    // Chặn sát mép cuối: tua đúng vào giây kết thúc thì không còn gì để phát,
    // bài coi như hết ngay lập tức.
    return Math.min(Math.max(ratio, 0), 1) * (MUSIC_DURATION - 0.05);
  };

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="relative size-12 shrink-0">
          <div
            className={cn(
              "size-full overflow-hidden rounded-full shadow-md ring-1 ring-border/50",
              // Quay như đĩa than lúc đang phát.
              playing && "animate-[spin_7s_linear_infinite] motion-reduce:animate-none",
            )}
          >
            {MUSIC.cover ? (
              // eslint-disable-next-line @next/next/no-img-element -- ảnh bìa cố định, không cần bộ tối ưu
              <img src={withBasePath(MUSIC.cover)} alt="" className="size-full object-cover" />
            ) : (
              <LogoMark className="size-full" />
            )}
          </div>

          {loading ? (
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/70">
              <Loader2 size={18} className="animate-spin text-primary" />
            </span>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-sans text-sm font-semibold">{MUSIC.title}</p>
          <p className="truncate font-sans text-xs text-muted-foreground">{MUSIC.artist}</p>
        </div>

        <button
          onClick={onClose}
          aria-label="Đóng trình phát"
          className="cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <XIcon size={16} />
        </button>
      </div>

      {error ? (
        <p className="mt-4 font-sans text-xs leading-relaxed text-destructive">{error}</p>
      ) : (
        <div
          role="slider"
          tabIndex={0}
          aria-label="Vị trí phát"
          aria-valuemin={0}
          aria-valuemax={Math.round(MUSIC_DURATION)}
          aria-valuenow={Math.round(elapsed)}
          aria-valuetext={`${formatTime(elapsed)} trên ${formatTime(MUSIC_DURATION)}`}
          // Bắt con trỏ về thẻ này ngay từ lúc nhấn: thiếu nó thì kéo chệch ra
          // ngoài thanh sóng là mất sự kiện, vạch đứng chết giữa chừng.
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            dragging.current = true;
            onScrub(positionOf(event));
          }}
          onPointerMove={(event) => {
            if (dragging.current) onScrub(positionOf(event));
          }}
          onPointerUp={(event) => {
            if (!dragging.current) return;
            dragging.current = false;
            event.currentTarget.releasePointerCapture(event.pointerId);
            onSeek(positionOf(event));
          }}
          onPointerCancel={() => {
            dragging.current = false;
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") onSeek(Math.min(elapsed + 5, MUSIC_DURATION - 0.05));
            if (event.key === "ArrowLeft") onSeek(Math.max(elapsed - 5, 0));
          }}
          // touch-none: thiếu nó thì trên điện thoại vuốt ngang trên thanh sóng
          // bị trình duyệt hiểu là cuộn trang.
          className="relative mt-4 flex h-11 cursor-grab touch-none items-center gap-[2px] rounded-lg select-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary active:cursor-grabbing"
        >
          {MUSIC_WAVEFORM.map((height, index) => (
            <span
              key={index}
              style={{ height: `${height * 100}%` }}
              className={cn(
                "flex-1 rounded-full transition-colors duration-150",
                // Cột được tô khi mốc giữa của nó đã trôi qua, nên vạch tô luôn
                // trùng với chỗ tai đang nghe.
                (index + 0.5) / MUSIC_WAVEFORM.length <= progress
                  ? "bg-primary"
                  : "bg-foreground/20",
              )}
            />
          ))}

          {/* Tay nắm: không có nó thì nhìn vào chỉ đoán được là bấm được, chứ
              không biết là kéo được. */}
          <span
            aria-hidden
            style={{ left: `${progress * 100}%` }}
            className="pointer-events-none absolute top-0 h-full w-[3px] -translate-x-1/2 rounded-full bg-primary shadow-sm"
          />
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="w-9 font-sans text-xs tabular-nums text-muted-foreground">
          {formatTime(elapsed)}
        </span>

        <button
          onClick={onToggle}
          aria-label={playing ? "Tạm dừng" : "Phát"}
          className="flex size-10 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
        </button>

        <span className="w-9 text-right font-sans text-xs tabular-nums text-muted-foreground">
          {formatTime(MUSIC_DURATION)}
        </span>
      </div>
    </div>
  );
}
