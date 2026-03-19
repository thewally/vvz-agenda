import { listActivities, deleteActivityById, deleteActivitiesByGroupId } from "../supabase.js";
import type { ActivityRow } from "../types.js";
import { StatusBanner } from "./StatusBanner.js";

const DUTCH_MONTHS_SHORT = [
  "jan", "feb", "mrt", "apr", "mei", "jun",
  "jul", "aug", "sep", "okt", "nov", "dec",
];

function formatSortDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${DUTCH_MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
}

function formatTime(start: string | null, end: string | null): string {
  if (!start) return "";
  return end ? `${start} – ${end}` : start;
}

function formatDateInfo(row: ActivityRow): string {
  if (row.date_start) {
    const s = formatSortDate(row.date_start);
    const e = row.date_end ? formatSortDate(row.date_end) : "";
    return e ? `${s} – ${e}` : `Vanaf ${s}`;
  }
  return formatSortDate(row.sort_date);
}

interface ActivityGroup {
  groupId: string;
  title: string;
  description: string;
  rows: ActivityRow[];
}

export interface ActivityListController {
  element: HTMLElement;
  reload(): void;
}

function buildCard(
  titleText: string,
  dateText: string,
  timeText: string,
  descriptionText: string,
  badgeText: string | null,
  onEditClick: () => void,
  onDeleteClick: () => void,
): HTMLLIElement {
  const li = document.createElement("li");
  li.className = "activity-card";

  const body = document.createElement("div");
  body.className = "activity-card-body";

  // Title row (with optional badge)
  const titleRow = document.createElement("div");
  titleRow.className = "activity-card-title-row";
  const titleEl = document.createElement("span");
  titleEl.className = "activity-card-title";
  titleEl.textContent = titleText;
  titleRow.append(titleEl);
  if (badgeText) {
    const badge = document.createElement("span");
    badge.className = "activity-card-badge";
    badge.textContent = badgeText;
    titleRow.append(badge);
  }
  body.append(titleRow);

  // Meta line: date + time
  const meta = document.createElement("div");
  meta.className = "activity-card-meta";
  meta.textContent = timeText ? `${dateText}  ·  ${timeText}` : dateText;
  body.append(meta);

  // Description
  if (descriptionText) {
    const desc = document.createElement("div");
    desc.className = "activity-card-desc";
    desc.textContent = descriptionText;
    body.append(desc);
  }

  // Actions
  const actions = document.createElement("div");
  actions.className = "activity-card-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "edit-btn";
  editBtn.textContent = "Bewerken";
  editBtn.addEventListener("click", onEditClick);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.textContent = "Verwijderen";
  deleteBtn.addEventListener("click", onDeleteClick);

  actions.append(editBtn, deleteBtn);

  li.append(body, actions);
  return li;
}

export function createActivityList(
  statusBanner: StatusBanner,
  onEdit?: (row: ActivityRow) => void
): ActivityListController {
  const container = document.createElement("div");
  container.className = "activity-list";

  const heading = document.createElement("h2");
  heading.textContent = "Activiteiten beheren";
  container.append(heading);

  const loadingP = document.createElement("p");
  loadingP.textContent = "Laden...";
  container.append(loadingP);

  const list = document.createElement("ul");
  list.className = "activity-list-items";
  list.style.display = "none";
  container.append(list);

  void loadAll();

  return { element: container, reload: () => { void loadAll(); } };

  async function loadAll(): Promise<void> {
    try {
      const rows = await listActivities();

      list.textContent = "";

      if (rows.length === 0) {
        const emptyP = document.createElement("p");
        emptyP.textContent = "Geen activiteiten gevonden.";
        loadingP.replaceWith(emptyP);
        return;
      }

      // Group rows by group_id where applicable
      const groups: ActivityGroup[] = [];
      const singles: ActivityRow[] = [];
      const groupMap = new Map<string, ActivityRow[]>();

      for (const row of rows) {
        if (row.group_id) {
          let arr = groupMap.get(row.group_id);
          if (!arr) {
            arr = [];
            groupMap.set(row.group_id, arr);
          }
          arr.push(row);
        } else {
          singles.push(row);
        }
      }

      for (const [groupId, groupRows] of groupMap) {
        groups.push({
          groupId,
          title: groupRows[0].title,
          description: groupRows[0].description,
          rows: groupRows,
        });
      }

      // Render singles
      for (const row of singles) {
        const li = buildCard(
          row.title,
          formatDateInfo(row),
          formatTime(row.time_start, row.time_end),
          row.description,
          null,
          () => onEdit?.(row),
          () => { void handleDeleteSingle(row.id, row.title, li); },
        );
        list.append(li);
      }

      // Render groups
      for (const group of groups) {
        const dates = group.rows.map((r) => formatSortDate(r.sort_date)).join(", ");
        const li = buildCard(
          group.title,
          dates,
          formatTime(group.rows[0].time_start, group.rows[0].time_end),
          group.description,
          `${group.rows.length}x`,
          () => onEdit?.(group.rows[0]),
          () => { void handleDeleteGroup(group.groupId, group.title, li); },
        );
        list.append(li);
      }

      loadingP.style.display = "none";
      list.style.display = "";
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      loadingP.textContent = `Fout bij laden: ${msg}`;
    }
  }

  async function handleDeleteSingle(id: string, title: string, li: HTMLElement): Promise<void> {
    if (!confirm(`Weet je zeker dat je '${title}' wilt verwijderen?`)) return;

    statusBanner.hide();
    try {
      await deleteActivityById(id);
      li.remove();
      checkEmpty();
      statusBanner.show("success", `'${title}' verwijderd.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      statusBanner.show("error", `Verwijderen mislukt: ${msg}`);
    }
  }

  async function handleDeleteGroup(groupId: string, title: string, li: HTMLElement): Promise<void> {
    if (!confirm(`Weet je zeker dat je alle activiteiten in deze reeks wilt verwijderen?`)) return;

    statusBanner.hide();
    try {
      await deleteActivitiesByGroupId(groupId);
      li.remove();
      checkEmpty();
      statusBanner.show("success", `Reeks '${title}' verwijderd.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      statusBanner.show("error", `Verwijderen mislukt: ${msg}`);
    }
  }

  function checkEmpty(): void {
    if (list.children.length === 0) {
      const emptyP = document.createElement("p");
      emptyP.textContent = "Geen activiteiten gevonden.";
      list.before(emptyP);
      list.style.display = "none";
    }
  }
}
