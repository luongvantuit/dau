"use client";

import { cn } from "cn";

/** Số chấm tối đa hiện cùng lúc. Lẻ để luôn có một chấm đúng giữa. */
const MAX_DOTS = 7;

/**
 * Dải chấm chỉ vị trí, dùng chung cho carousel và lightbox.
 *
 * Chỉ hiện một cửa sổ trượt chứ không đủ 28 chấm: dải chấm dài bằng cả bề
 * ngang ảnh đọc thành một hàng lấm tấm, không còn nói được đang ở đâu. Hai
 * chấm ngoài cùng thu nhỏ để lộ ý còn ảnh phía sau.
 */
export function DotNav({
  count,
  index,
  onSelect,
  tone = "default",
  className,
}: {
  count: number;
  index: number;
  onSelect: (next: number) => void;
  /** "inverse" cho nền tối của lightbox. */
  tone?: "default" | "inverse";
  className?: string;
}) {
  const visible = Math.min(MAX_DOTS, count);
  const start = Math.min(
    Math.max(index - Math.floor(MAX_DOTS / 2), 0),
    Math.max(count - MAX_DOTS, 0),
  );

  const active = tone === "inverse" ? "bg-background" : "bg-primary";
  const idle =
    tone === "inverse"
      ? "bg-background/40 hover:bg-background/70"
      : "bg-foreground/30 hover:bg-foreground/55";
  const edge =
    tone === "inverse"
      ? "bg-background/25 hover:bg-background/50"
      : "bg-foreground/20 hover:bg-foreground/40";

  return (
    <div
      role="tablist"
      aria-label="Chọn ảnh"
      className={cn("flex h-4 items-center justify-center gap-1.5", className)}
    >
      {Array.from({ length: visible }, (_, offset) => start + offset).map((dotIndex) => {
        const current = dotIndex === index;
        const atEdge =
          (dotIndex === start && start > 0) ||
          (dotIndex === start + visible - 1 && start + visible < count);
        return (
          <button
            key={dotIndex}
            type="button"
            role="tab"
            aria-selected={current}
            aria-label={`Ảnh ${dotIndex + 1} trên ${count}`}
            onClick={() => onSelect(dotIndex)}
            className={cn(
              "rounded-full transition-all duration-500 ease-out",
              current ? `h-1.5 w-6 ${active}` : atEdge ? `size-1 ${edge}` : `size-1.5 ${idle}`,
            )}
          />
        );
      })}
    </div>
  );
}
