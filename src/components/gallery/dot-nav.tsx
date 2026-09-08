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
 *
 * Chấm nhìn thấy chỉ 4-6px nên KHÔNG lấy nó làm vùng bấm: mỗi chấm được bọc
 * trong một nút cao 24px, có đệm ngang, còn phần tròn là thẻ span bên trong.
 * Vùng bấm nhờ đó rộng gấp mấy lần mà bố cục vẫn y nguyên.
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

  const inverse = tone === "inverse";
  const active = inverse ? "bg-background" : "bg-primary";
  const idle = inverse ? "bg-background/45" : "bg-foreground/30";
  const edge = inverse ? "bg-background/30" : "bg-foreground/20";
  const ring = inverse ? "focus-visible:outline-background" : "focus-visible:outline-primary";

  return (
    <div
      role="tablist"
      aria-label="Chọn ảnh"
      className={cn("flex h-6 items-center justify-center", className)}
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
              // Đệm ngang vừa tạo khoảng cách giữa các chấm vừa là vùng bấm,
              // nên không cần gap ở thẻ cha.
              "group/dot flex h-6 cursor-pointer items-center px-1 focus-visible:outline-2 focus-visible:outline-offset-2",
              ring,
            )}
          >
            <span
              className={cn(
                "rounded-full transition-all duration-500 ease-out",
                // Chấm đang chọn đã là viên dài nên chỉ dày lên theo chiều dọc;
                // phóng đều cả hai chiều thì nó thò ra khỏi hàng. Đặt hiệu ứng
                // hover trong từng nhánh chứ không để chung ở trên: gộp
                // scale-150 với scale-x/scale-y là hai lớp tranh nhau cùng một
                // thuộc tính scale.
                current
                  ? `h-1.5 w-6 ${active} group-hover/dot:scale-y-150`
                  : atEdge
                    ? `size-1 ${edge} group-hover/dot:scale-150`
                    : `size-1.5 ${idle} group-hover/dot:scale-150`,
                !current && (inverse ? "group-hover/dot:bg-background" : "group-hover/dot:bg-primary"),
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
