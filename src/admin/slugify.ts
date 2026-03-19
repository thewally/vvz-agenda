import { ActivityFormData } from "./types.js";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildFilename(data: ActivityFormData): string {
  const datePrefix =
    data.date ?? data.dateStart ?? data.dates?.[0] ?? "0000-00-00";
  return `${datePrefix}-${slugify(data.title)}.md`;
}
