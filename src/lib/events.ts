import { EVENTS, type SiteEvent } from "@/data/events";
import { SITE } from "@/data/site";
import { ageInYears } from "./dates";

export function sortEvents(events: SiteEvent[]): SiteEvent[] {
  const seen = new Set<string>();
  for (const event of events) {
    if (seen.has(event.slug)) {
      throw new Error(`Slug bị trùng trong events.ts: ${event.slug}`);
    }
    seen.add(event.slug);
  }
  return [...events].sort((a, b) => a.date.localeCompare(b.date));
}

export function getAllEvents(): SiteEvent[] {
  return sortEvents(EVENTS);
}

export function getEvent(slug: string): SiteEvent | undefined {
  return getAllEvents().find((event) => event.slug === slug);
}

export function getEventAge(event: SiteEvent): number {
  return ageInYears(SITE.birthDate, event.date);
}
