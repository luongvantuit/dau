import { LogoMark } from "@/components/site/logo";
import { SITE } from "@/data/site";
import { formatDateVi } from "@/lib/dates";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-3 px-5 py-10 text-center">
        <LogoMark className="size-8" />
        <p className="font-sans text-sm text-muted-foreground">
          {SITE.fullName} · sinh ngày {formatDateVi(SITE.birthDate)}
        </p>
        <p className="font-sans text-xs text-muted-foreground/80">
          Trang lưu giữ những cột mốc của {SITE.name}.
        </p>
      </div>
    </footer>
  );
}
