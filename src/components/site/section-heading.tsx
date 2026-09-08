import { cn } from "cn";

/** Tiêu đề mục kèm hai vạch ngang, dùng chung để các trang có cùng nhịp. */
export function SectionHeading({
  children,
  hint,
  className,
}: {
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 px-5 text-center", className)}>
      <div className="flex w-full max-w-lg items-center gap-4">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent to-border" />
        <h2 className="text-xl font-bold whitespace-nowrap sm:text-2xl">{children}</h2>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent to-border" />
      </div>
      {hint ? (
        <p className="font-sans text-xs text-muted-foreground sm:text-sm">{hint}</p>
      ) : null}
    </div>
  );
}
