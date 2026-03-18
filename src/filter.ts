import type { Activity } from "./types";

/**
 * Returns today's date as a YYYY-MM-DD string in the local timezone.
 */
function todayLocal(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Filter activities to only include upcoming ones (today or later).
 *
 * - Single-day (`date`): compare `date` >= today
 * - Multi-day (`dateStart`/`dateEnd`): compare `dateEnd` >= today (falls back to `dateStart` if no `dateEnd`)
 *
 * Uses local-timezone date comparison via YYYY-MM-DD string comparison.
 */
export function filterUpcoming(activities: Activity[]): Activity[] {
  const today = todayLocal();
  return activities.filter((a) => {
    const endDate = a.dateEnd ?? a.date ?? a.dateStart!;
    return endDate >= today;
  });
}
