import { ActivityFormData } from "./types.js";

export function serializeActivity(data: ActivityFormData): string {
  const lines: string[] = ["---"];

  lines.push(`title: ${data.title}`);

  if (data.dateType === "single" && data.date) {
    lines.push(`date: ${data.date}`);
  } else if (data.dateType === "range") {
    if (data.dateStart) lines.push(`dateStart: ${data.dateStart}`);
    if (data.dateEnd) lines.push(`dateEnd: ${data.dateEnd}`);
  } else if (data.dateType === "list" && data.dates && data.dates.length > 0) {
    lines.push("dates:");
    for (const d of data.dates) {
      lines.push(`  - ${d}`);
    }
  }

  if (data.timeStart) lines.push(`timeStart: "${data.timeStart}"`);
  if (data.timeEnd) lines.push(`timeEnd: "${data.timeEnd}"`);
  if (data.description) lines.push(`description: ${data.description}`);
  if (data.url) lines.push(`url: ${data.url}`);

  lines.push("---");
  lines.push("");

  return lines.join("\n");
}
