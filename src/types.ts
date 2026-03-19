/** Configuration passed to VvzAgenda.init() */
export interface VvzAgendaConfig {
  /** CSS selector or DOM element to mount the widget into */
  target: string | HTMLElement;
  /** Supabase project URL */
  supabaseUrl: string;
  /** Supabase anonymous (public) key */
  supabaseAnonKey: string;
  /** Hide activities with a date in the past. Default: true */
  hidePast?: boolean;
  /** Maximum number of activities to show. Default: unlimited (0) */
  maxItems?: number;
}

/** Parsed activity */
export interface Activity {
  title: string;
  description: string;
  /** Body HTML (optional, not used with Supabase) */
  bodyHtml?: string;
  /** For single-day activities */
  date?: string;
  /** For multi-day activities */
  dateStart?: string;
  dateEnd?: string;
  /** For activities on specific individual dates */
  datesItem?: string;
  timeStart?: string;
  timeEnd?: string;
  /** Optional link URL — makes the title a clickable link */
  url?: string;
  /** Computed sort key (ISO date string) */
  sortDate: string;
}

declare global {
  interface Window {
    VvzAgenda: {
      init: (config: VvzAgendaConfig) => Promise<void>;
    };
  }
}
