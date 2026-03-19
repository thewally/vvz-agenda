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

interface ActivityGroup {
  groupId: string;
  title: string;
  rows: ActivityRow[];
}

export function createActivityList(
  statusBanner: StatusBanner
): HTMLElement {
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

  return container;

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
        groups.push({ groupId, title: groupRows[0].title, rows: groupRows });
      }

      // Render singles
      for (const row of singles) {
        const li = document.createElement("li");
        li.className = "activity-list-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "activity-list-name";
        nameSpan.textContent = `${row.title} — ${formatSortDate(row.sort_date)}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Verwijderen";
        deleteBtn.addEventListener("click", () => {
          void handleDeleteSingle(row.id, row.title, li);
        });

        li.append(nameSpan, deleteBtn);
        list.append(li);
      }

      // Render groups
      for (const group of groups) {
        const li = document.createElement("li");
        li.className = "activity-list-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "activity-list-name";
        const dates = group.rows.map((r) => formatSortDate(r.sort_date)).join(", ");
        nameSpan.textContent = `${group.title} (${group.rows.length}x: ${dates})`;

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Verwijderen";
        deleteBtn.addEventListener("click", () => {
          void handleDeleteGroup(group.groupId, group.title, li);
        });

        li.append(nameSpan, deleteBtn);
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
