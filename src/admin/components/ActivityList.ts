import { getConfig, getFile, getFileSha, deleteFile, createOrUpdateFile } from "../github.js";
import { StatusBanner } from "./StatusBanner.js";

export function createActivityList(
  token: string,
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

  void loadActivities();

  return container;

  async function loadActivities(): Promise<void> {
    try {
      const config = getConfig();
      const manifestPath = `${config.activitiesPath}/manifest.json`;
      const { content } = await getFile(token, manifestPath);
      const filenames = JSON.parse(content) as string[];

      list.textContent = "";

      if (filenames.length === 0) {
        const emptyP = document.createElement("p");
        emptyP.textContent = "Geen activiteiten gevonden.";
        loadingP.replaceWith(emptyP);
        return;
      }

      for (const filename of filenames) {
        const li = document.createElement("li");
        li.className = "activity-list-item";

        const nameSpan = document.createElement("span");
        nameSpan.className = "activity-list-name";
        nameSpan.textContent = filename;

        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "delete-btn";
        deleteBtn.textContent = "Verwijderen";
        deleteBtn.addEventListener("click", () => {
          void handleDelete(filename, li);
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

  async function handleDelete(filename: string, li: HTMLElement): Promise<void> {
    if (!confirm(`Weet je zeker dat je '${filename}' wilt verwijderen?`)) {
      return;
    }

    statusBanner.hide();
    const config = getConfig();
    const filePath = `${config.activitiesPath}/${filename}`;

    try {
      // Get sha of the activity file
      const sha = await getFileSha(token, filePath);

      // Delete the activity file
      await deleteFile(token, filePath, sha, `chore: delete activity ${filename}`);

      // Update manifest
      const manifestPath = `${config.activitiesPath}/manifest.json`;
      const existing = await getFile(token, manifestPath);
      const manifest = JSON.parse(existing.content) as string[];
      const updated = manifest.filter((f) => f !== filename);

      await createOrUpdateFile(
        token,
        manifestPath,
        JSON.stringify(updated, null, 2) + "\n",
        `chore: remove ${filename} from manifest`,
        existing.sha
      );

      // Remove from DOM
      li.remove();

      // Check if list is now empty
      if (list.children.length === 0) {
        const emptyP = document.createElement("p");
        emptyP.textContent = "Geen activiteiten gevonden.";
        list.before(emptyP);
        list.style.display = "none";
      }

      statusBanner.show("success", `'${filename}' verwijderd.`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      statusBanner.show("error", `Verwijderen mislukt: ${msg}`);
    }
  }
}
