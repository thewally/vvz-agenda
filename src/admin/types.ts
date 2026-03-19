export type DateType = "single" | "range" | "list";

export interface ActivityFormData {
  title: string;
  dateType: DateType;
  date?: string;
  dateStart?: string;
  dateEnd?: string;
  dates?: string[];
  timeStart?: string;
  timeEnd?: string;
  description: string;
  url?: string;
}

export interface SupabaseUser {
  id: string;
  email: string | undefined;
}

export interface ActivityRow {
  id: string;
  title: string;
  description: string;
  date: string | null;
  date_start: string | null;
  date_end: string | null;
  dates_item: string | null;
  group_id: string | null;
  time_start: string | null;
  time_end: string | null;
  url: string | null;
  sort_date: string;
  created_at: string;
  updated_at: string;
}

export interface InsertRow {
  title: string;
  description: string;
  date: string | null;
  date_start: string | null;
  date_end: string | null;
  dates_item: string | null;
  group_id: string | null;
  time_start: string | null;
  time_end: string | null;
  url: string | null;
  sort_date: string;
}
