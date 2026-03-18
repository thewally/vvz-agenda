import type { VvzAgendaConfig, Activity, Manifest } from "./types";
import { parseActivities } from "./parse";
import { filterUpcoming } from "./filter";
import { WIDGET_CSS } from "./styles";

const DUTCH_MONTHS = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

function formatDateBadge(isoDate: string): { day: string; month: string } {
  const d = new Date(isoDate + "T00:00:00");
  return {
    day: String(d.getDate()),
    month: DUTCH_MONTHS[d.getMonth()],
  };
}

function formatTimeRange(activity: Activity): string {
  const { date, dateStart, dateEnd, timeStart, timeEnd } = activity;

  if (dateStart && dateEnd) {
    // Multi-day
    const s = new Date(dateStart + "T00:00:00");
    const e = new Date(dateEnd + "T00:00:00");
    let str = `${s.getDate()} ${DUTCH_MONTHS[s.getMonth()]}`;
    if (timeStart) str += ` ${timeStart}`;
    str += ` \u2013 ${e.getDate()} ${DUTCH_MONTHS[e.getMonth()]}`;
    if (timeEnd) str += ` ${timeEnd}`;
    return str;
  }

  // Single day
  if (timeStart && timeEnd) return `${timeStart} \u2013 ${timeEnd}`;
  if (timeStart) return timeStart;
  return "";
}

function renderCard(activity: Activity): string {
  const badge = formatDateBadge(activity.date ?? activity.dateStart!);
  const time = formatTimeRange(activity);

  return `
    <div class="vvz-card">
      <div class="vvz-date-badge">
        <span class="day">${badge.day}</span>
        <span class="month">${badge.month}</span>
      </div>
      <div class="vvz-card-body">
        <h3 class="vvz-card-title">${activity.url ? `<a class="vvz-card-link" href="${escapeHtml(activity.url)}">${escapeHtml(activity.title)}</a>` : escapeHtml(activity.title)}</h3>
        ${time ? `<div class="vvz-card-time">${escapeHtml(time)}</div>` : ""}
        ${activity.description ? `<p class="vvz-card-desc">${escapeHtml(activity.description)}</p>` : ""}
        ${activity.bodyHtml ? `<div class="vvz-card-body-content">${activity.bodyHtml}</div>` : ""}
      </div>
    </div>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function fetchManifest(url: string): Promise<string[]> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch manifest: ${resp.status}`);
  const data: Manifest = await resp.json();
  // Resolve relative paths against manifest URL
  const base = url.substring(0, url.lastIndexOf("/") + 1);
  return data.map((f) => (f.startsWith("http") ? f : base + f));
}

async function fetchActivities(url: string): Promise<Activity[]> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const raw = await resp.text();
    return parseActivities(raw);
  } catch {
    return [];
  }
}

export async function initWidget(config: VvzAgendaConfig): Promise<void> {
  const target =
    typeof config.target === "string"
      ? document.querySelector<HTMLElement>(config.target)
      : config.target;

  if (!target) {
    console.error("[VvzAgenda] Target element not found:", config.target);
    return;
  }

  // Create Shadow DOM host
  const shadow = target.attachShadow({ mode: "open" });
  const style = document.createElement("style");
  style.textContent = WIDGET_CSS;
  shadow.appendChild(style);

  const container = document.createElement("div");
  container.className = "vvz-agenda";
  container.innerHTML = `
    <div class="vvz-header">Agenda VVZ'49</div>
    <div class="vvz-loading">Activiteiten laden&hellip;</div>
  `;
  shadow.appendChild(container);

  // Resolve file URLs
  let fileUrls: string[] = [];
  try {
    if (config.files) {
      fileUrls = config.files;
    } else if (config.manifestUrl) {
      fileUrls = await fetchManifest(config.manifestUrl);
    } else {
      throw new Error("Provide either 'files' or 'manifestUrl' in config.");
    }
  } catch (err) {
    container.innerHTML = `
      <div class="vvz-header">Agenda VVZ'49</div>
      <div class="vvz-error">Kon activiteiten niet laden.</div>
    `;
    console.error("[VvzAgenda]", err);
    return;
  }

  // Fetch all activities in parallel, skip failures; flatten expanded dates
  const results = await Promise.all(fileUrls.map(fetchActivities));
  let activities = results.flat();

  // Filter past activities
  const hidePast = config.hidePast ?? true;
  if (hidePast) {
    activities = filterUpcoming(activities);
  }

  // Sort by date ascending
  activities.sort((a, b) => a.sortDate.localeCompare(b.sortDate));

  // Limit
  if (config.maxItems && config.maxItems > 0) {
    activities = activities.slice(0, config.maxItems);
  }

  // Render
  if (activities.length === 0) {
    container.innerHTML = `
      <div class="vvz-header">Agenda</div>
      <div class="vvz-empty">Geen komende activiteiten.</div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="vvz-header">Agenda</div>
    <div class="vvz-list">${activities.map(renderCard).join("")}</div>
  `;
}
