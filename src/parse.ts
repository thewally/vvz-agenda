import { Marked } from "marked";
import DOMPurify from "dompurify";
import type { Activity } from "./types";

const marked = new Marked();

/**
 * Lightweight frontmatter parser (avoids gray-matter's Node.js dependencies).
 * Extracts YAML-style key: value pairs between --- fences.
 */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: raw };
  }

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, body: match[2] };
}

/** Parse a raw .md string into an Activity, or null if invalid. */
export function parseActivity(raw: string): Activity | null {
  const { data, body } = parseFrontmatter(raw);

  const title = data.title;
  if (!title) return null;

  const date = data.date;
  const dateStart = data.dateStart;
  const dateEnd = data.dateEnd;

  if (!date && !dateStart) return null;

  const sortDate = date ?? dateStart!;

  const bodyHtml = DOMPurify.sanitize(marked.parse(body.trim()) as string);

  return {
    title,
    description: data.description ?? "",
    bodyHtml,
    date,
    dateStart,
    dateEnd,
    timeStart: data.timeStart,
    timeEnd: data.timeEnd,
    url: data.url,
    sortDate,
  };
}
