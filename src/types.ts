/** Configuration passed to VvzAgenda.init() */
export interface VvzAgendaConfig {
  /** CSS selector or DOM element to mount the widget into */
  target: string | HTMLElement;
  /** URL to a JSON manifest listing activity .md file paths */
  manifestUrl?: string;
  /** Direct array of .md file URLs (alternative to manifestUrl) */
  files?: string[];
  /** Hide activities with a date in the past. Default: true */
  hidePast?: boolean;
  /** Maximum number of activities to show. Default: unlimited (0) */
  maxItems?: number;
}

/** Manifest JSON shape: array of relative .md file paths */
export type Manifest = string[];

/** Parsed activity from frontmatter */
export interface Activity {
  title: string;
  description: string;
  /** Body markdown rendered to HTML (sanitized) */
  bodyHtml: string;
  /** For single-day activities */
  date?: string;
  /** For multi-day activities */
  dateStart?: string;
  dateEnd?: string;
  /** For activities on multiple specific (non-consecutive) dates — expanded into separate Activity objects during parsing */
  dates?: string[];
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
