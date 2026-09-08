import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { LogoMark } from "@/components/site/logo";
import type { SiteEvent } from "@/data/events";
import { SITE } from "@/data/site";
import { formatDateNumeric, formatDateVi } from "@/lib/dates";
import { getPhotos } from "@/lib/photos";

/** Dấu ngăn giữa hai mẩu chữ, vẽ bằng khối tròn chứ không gõ ký tự. */
function Sep() {
  return <span aria-hidden className="size-1 shrink-0 rounded-full bg-current opacity-40" />;
}

export function SiteFooter({ events }: { events: SiteEvent[] }) {
  const photoCount = events.reduce((total, event) => total + getPhotos(event).length, 0);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto px-3 pb-3">
      {/* footer-card: nở ra từ một viên bo tròn nhỏ. Xem globals.css. */}
      <div className="liquid-glass footer-card mx-auto w-full max-w-6xl overflow-hidden rounded-3xl px-5 py-14 shadow-lg sm:px-8">
        {/* Reveal nằm BÊN TRONG thẻ kính chứ không bọc ngoài: nó animate
            opacity, mà một tổ tiên có opacity < 1 sẽ tạo backdrop root mới
            khiến backdrop-filter của thẻ kính không còn gì để lấy mẫu và đổ ra
            mảng đen suốt lúc footer trôi vào màn. */}
        {/* Ghim bề ngang nội dung bằng đúng khổ cuối: nếu để nó co theo thẻ thì
            suốt lúc nở ra lưới 4 cột bị bóp, chữ dồn dòng và chiều cao footer
            nhảy liên tục. Ghim rồi thì overflow-hidden của thẻ chỉ việc xén. */}
        <Reveal distance={24} className="w-[min(68rem,100vw-3.5rem)]">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-3 lg:col-span-2">
              <div className="flex items-center gap-2.5">
                <LogoMark className="size-9" />
                <div className="flex flex-col">
                  <span className="text-lg font-extrabold tracking-tight">{SITE.name}</span>
                  <span className="font-sans text-xs text-muted-foreground">{SITE.fullName}</span>
                </div>
              </div>
              <p className="max-w-sm font-sans text-sm leading-relaxed text-muted-foreground">
                {SITE.description} Trang được dựng lại mỗi khi có thêm một cột mốc, để sau này
                lớn lên {SITE.name} còn xem lại được.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-sans text-xs font-semibold tracking-[0.12em] uppercase">
                Cột mốc
              </h2>
              <ul className="flex flex-col gap-2">
                <li>
                  <Link
                    href="/"
                    className="font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Tất cả cột mốc
                  </Link>
                </li>
                {events.map((event) => (
                  <li key={event.slug}>
                    <Link
                      href={`/${event.slug}`}
                      className="font-sans text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {event.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-3">
              <h2 className="font-sans text-xs font-semibold tracking-[0.12em] uppercase">
                Đôi dòng
              </h2>
              <dl className="flex flex-col gap-2 font-sans text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Ngày sinh</dt>
                  <dd className="tabular-nums">{formatDateNumeric(SITE.birthDate)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Cột mốc</dt>
                  <dd className="tabular-nums">{events.length}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Khoảnh khắc</dt>
                  <dd className="tabular-nums">{photoCount}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center gap-2 border-t border-border/25 pt-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="flex items-center gap-2 font-sans text-xs text-muted-foreground">
              {SITE.fullName}
              <Sep />
              Sinh ngày {formatDateVi(SITE.birthDate)}
            </p>
            <p className="flex items-center gap-2 font-sans text-xs text-muted-foreground/80">
              © {currentYear}
              <Sep />
              Làm bằng tay cho {SITE.name}
            </p>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
