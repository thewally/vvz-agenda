import type { Activity } from "./types";

interface ActivityRow {
  id: string;
  title: string;
  description: string;
  date: string | null;
  date_start: string | null;
  date_end: string | null;
  dates_item: string | null;
  time_start: string | null;
  time_end: string | null;
  url: string | null;
  sort_date: string;
}

export function rowToActivity(row: ActivityRow): Activity {
  return {
    title: row.title,
    description: row.description ?? "",
    date: row.date ?? (row.dates_item ?? undefined),
    dateStart: row.date_start ?? undefined,
    dateEnd: row.date_end ?? undefined,
    datesItem: row.dates_item ?? undefined,
    timeStart: row.time_start ?? undefined,
    timeEnd: row.time_end ?? undefined,
    url: row.url ?? undefined,
    sortDate: row.sort_date,
  };
}

function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function fetchActivitiesFromSupabase(
  supabaseUrl: string,
  supabaseAnonKey: string,
  hidePast: boolean
): Promise<Activity[]> {
  const params = new URLSearchParams({
    select: "id,title,description,date,date_start,date_end,dates_item,time_start,time_end,url,sort_date",
    order: "sort_date.asc",
  });

  if (hidePast) {
    params.append("sort_date", `gte.${todayISO()}`);
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/activities?${params.toString()}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Supabase fetch failed: ${res.status}`);
  }

  const rows: ActivityRow[] = await res.json();
  return rows.map(rowToActivity);
}
