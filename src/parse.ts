import { Marked } from "marked";
import DOMPurify from "dompurify";
import type { Activity } from "./types";

const marked = new Marked();

/**
 * Lightweight frontmatter parser (avoids gray-matter's Node.js dependencies).
 * Extracts YAML-style key: value pairs between --- fences.
 * Supports simple YAML lists (lines starting with "  - ").
 */
function parseFrontmatter(raw: string): { data: Record<string, string | string[]>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: raw };
  }

  const data: Record<string, string | string[]> = {};
  let currentKey: string | null = null;

  for (const line of match[1].split(/\r?\n/)) {
    // Check if this is a YAML list item (e.g., "  - 2026-04-01")
    const listItemMatch = line.match(/^\s+-\s+(.+)$/);
    if (listItemMatch && currentKey) {
      let value = listItemMatch[1].trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      const existing = data[currentKey];
      if (Array.isArray(existing)) {
        existing.push(value);
      } else {
        data[currentKey] = [value];
      }
      continue;
    }

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    currentKey = key;

    // Empty value after colon means a list follows
    if (value === "") continue;

    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, body: match[2] };
}

/**
 * Parse a raw .md string into one or more Activity objects.
 * Activities with `dates` (list) are expanded into one Activity per date.
 * Returns an empty array if the frontmatter is invalid.
 */
export function parseActivities(raw: string): Activity[] {
  const { data, body } = parseFrontmatter(raw);

  const title = data.title;
  if (!title || typeof title !== "string") return [];

  const date = typeof data.date === "string" ? data.date : undefined;
  const dateStart = typeof data.dateStart === "string" ? data.dateStart : undefined;
  const dateEnd = typeof data.dateEnd === "string" ? data.dateEnd : undefined;
  const dates = Array.isArray(data.dates) ? data.dates : undefined;

  if (!date && !dateStart && !dates) return [];

  const bodyHtml = DOMPurify.sanitize(marked.parse(body.trim()) as string);
  const description = typeof data.description === "string" ? data.description : "";
  const timeStart = typeof data.timeStart === "string" ? data.timeStart : undefined;
  const timeEnd = typeof data.timeEnd === "string" ? data.timeEnd : undefined;
  const url = typeof data.url === "string" ? data.url : undefined;

  // Expand dates list into individual single-date activities
  if (dates && dates.length > 0) {
    return dates.map((d) => ({
      title,
      description,
      bodyHtml,
      date: d,
      timeStart,
      timeEnd,
      url,
      sortDate: d,
    }));
  }

  const sortDate = date ?? dateStart!;

  return [
    {
      title,
      description,
      bodyHtml,
      date,
      dateStart,
      dateEnd,
      timeStart,
      timeEnd,
      url,
      sortDate,
    },
  ];
}

/** Parse a raw .md string into an Activity, or null if invalid. */
export function parseActivity(raw: string): Activity | null {
  const activities = parseActivities(raw);
  return activities.length > 0 ? activities[0] : null;
}
