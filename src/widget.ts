import type { VvzAgendaConfig, Activity, Manifest } from "./types";
import { parseActivities } from "./parse";
import { filterUpcoming } from "./filter";
import { WIDGET_CSS } from "./styles";

const DUTCH_MONTHS_SHORT = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

const DUTCH_MONTHS_LONG = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

const DUTCH_DAYS = [
  "zondag", "maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag",
];

const DUTCH_DAYS_SHORT = [
  "zo", "ma", "di", "wo", "do", "vr", "za",
];

function formatDateBadge(isoDate: string): { weekday: string; day: string; month: string } {
  const d = new Date(isoDate + "T00:00:00");
  return {
    weekday: DUTCH_DAYS_SHORT[d.getDay()],
    day: String(d.getDate()),
    month: DUTCH_MONTHS_SHORT[d.getMonth()],
  };
}

function formatTimeRange(activity: Activity): string {
  const { dateStart, dateEnd, timeStart, timeEnd } = activity;

  if (dateStart && dateEnd) {
    // Multi-day: "maandag 12 augustus 09:00 uur t/m dinsdag 13 augustus 17:00 uur"
    const s = new Date(dateStart + "T00:00:00");
    const e = new Date(dateEnd + "T00:00:00");
    let startPart = `${DUTCH_DAYS[s.getDay()]} ${s.getDate()} ${DUTCH_MONTHS_LONG[s.getMonth()]}`;
    if (timeStart) startPart += ` ${timeStart} uur`;
    let endPart = `${DUTCH_DAYS[e.getDay()]} ${e.getDate()} ${DUTCH_MONTHS_LONG[e.getMonth()]}`;
    if (timeEnd) endPart += ` ${timeEnd} uur`;
    return `${startPart} t/m ${endPart}`;
  }

  // Single day
  if (timeStart && timeEnd) return `${timeStart} \u2013 ${timeEnd} uur`;
  if (timeStart) return `${timeStart} uur`;
  return "";
}

function renderCard(activity: Activity): string {
  const badge = formatDateBadge(activity.date ?? activity.dateStart!);
  const time = formatTimeRange(activity);

  return `
    <div class="vvz-card">
      <div class="vvz-date-badge">
        <span class="weekday">${badge.weekday}</span>
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

  // Group activities by year-month
  const monthGroups = groupByMonth(activities);
  const monthKeys = Array.from(monthGroups.keys());

  // Build tabs
  const tabsHtml = monthKeys
    .map((key, i) => {
      const [, monthIdx] = key.split("-").map(Number);
      const label = DUTCH_MONTHS_LONG[monthIdx];
      return `<button class="vvz-month-tab${i === 0 ? " active" : ""}" data-month="${key}">${escapeHtml(label)}</button>`;
    })
    .join("");

  // Build month sections
  const sectionsHtml = monthKeys
    .map((key, i) => {
      const items = monthGroups.get(key)!;
      return `<div class="vvz-month-section${i === 0 ? " active" : ""}" data-month="${key}">${items.map(renderCard).join("")}</div>`;
    })
    .join("");

  container.innerHTML = `
    <div class="vvz-header">Agenda</div>
    <div class="vvz-month-tabs">${tabsHtml}</div>
    <div class="vvz-list">${sectionsHtml}</div>
  `;

  // Tab click handlers (inside shadow DOM)
  container.querySelectorAll<HTMLButtonElement>(".vvz-month-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const month = tab.dataset.month!;
      container.querySelectorAll<HTMLButtonElement>(".vvz-month-tab").forEach((t) => t.classList.toggle("active", t.dataset.month === month));
      container.querySelectorAll<HTMLElement>(".vvz-month-section").forEach((s) => s.classList.toggle("active", s.dataset.month === month));
    });
  });
}

function groupByMonth(activities: Activity[]): Map<string, Activity[]> {
  const map = new Map<string, Activity[]>();
  for (const a of activities) {
    const isoDate = a.date ?? a.dateStart!;
    const d = new Date(isoDate + "T00:00:00");
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const list = map.get(key);
    if (list) {
      list.push(a);
    } else {
      map.set(key, [a]);
    }
  }
  return map;
}
