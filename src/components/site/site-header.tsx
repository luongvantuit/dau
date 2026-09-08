import Link from "next/link";

import { SITE } from "@/data/site";
import { getAllEvents } from "@/lib/events";

export function SiteHeader() {
  const events = getAllEvents();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex h-14 w-full max-w-7xl items-center gap-6 px-5">
        <Link href="/" className="text-xl font-extrabold tracking-tight">
          {SITE.name}
        </Link>

        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {events.map((event) => (
            <Link
              key={event.slug}
              href={`/${event.slug}`}
              className="rounded-lg px-3 py-1.5 font-sans text-sm whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {event.title}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
