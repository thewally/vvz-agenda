import type { ActivityFormData, ActivityRow, DateType, InsertRow } from "../types.js";
import { insertActivities, updateActivity, deleteActivitiesByGroupId } from "../supabase.js";
import { StatusBanner } from "./StatusBanner.js";

function createField(
  tag: "input" | "textarea" | "select",
  attrs: Record<string, string>,
  labelText: string
): { wrapper: HTMLElement; field: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement } {
  const wrapper = document.createElement("div");
  wrapper.className = "form-field";

  const label = document.createElement("label");
  label.textContent = labelText;
  if (attrs.id) label.htmlFor = attrs.id;

  const field = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    field.setAttribute(k, v);
  }

  wrapper.append(label, field);
  return { wrapper, field };
}

export function formDataToRows(data: ActivityFormData): InsertRow[] {
  const base = {
    title: data.title,
    description: data.description,
    date: null as string | null,
    date_start: null as string | null,
    date_end: null as string | null,
    dates_item: null as string | null,
    group_id: null as string | null,
    time_start: data.timeStart ?? null,
    time_end: data.timeEnd ?? null,
    url: data.url ?? null,
    sort_date: "",
  };

  if (data.dateType === "single") {
    return [{ ...base, date: data.date!, sort_date: data.date! }];
  }

  if (data.dateType === "range") {
    return [{
      ...base,
      date_start: data.dateStart!,
      date_end: data.dateEnd ?? null,
      sort_date: data.dateStart!,
    }];
  }

  // list
  const groupId = crypto.randomUUID();
  return data.dates!.map((d) => ({
    ...base,
    dates_item: d,
    group_id: groupId,
    sort_date: d,
  }));
}

export interface ActivityFormController {
  element: HTMLElement;
  loadActivity(rows: ActivityRow[]): void;
}

export function createActivityForm(
  statusBanner: StatusBanner,
  onSaved?: () => void,
  onCancel?: () => void
): ActivityFormController {
  let editingId: string | null = null;
  let editingGroupId: string | null = null;

  const form = document.createElement("form");
  form.className = "activity-form";

  const heading = document.createElement("h2");
  heading.textContent = "Nieuwe activiteit";
  form.append(heading);

  // Title
  const { wrapper: titleW, field: titleF } = createField(
    "input",
    { id: "title", type: "text", required: "true", placeholder: "Titel" },
    "Titel *"
  );
  form.append(titleW);

  // Date type
  const { wrapper: dtW, field: dtF } = createField(
    "select",
    { id: "dateType" },
    "Datumtype"
  );
  for (const [val, lbl] of [
    ["single", "Enkele datum"],
    ["range", "Datumbereik"],
    ["list", "Datumlijst"],
  ] as const) {
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = lbl;
    dtF.append(opt);
  }
  form.append(dtW);

  // Single date
  const { wrapper: dateW, field: dateF } = createField(
    "input",
    { id: "date", type: "date" },
    "Datum"
  );
  form.append(dateW);

  // Range
  const { wrapper: dsW, field: dsF } = createField(
    "input",
    { id: "dateStart", type: "date" },
    "Startdatum"
  );
  const { wrapper: deW, field: deF } = createField(
    "input",
    { id: "dateEnd", type: "date" },
    "Einddatum"
  );
  dsW.style.display = "none";
  deW.style.display = "none";
  form.append(dsW, deW);

  // List
  const { wrapper: dlW, field: dlF } = createField(
    "textarea",
    { id: "dates", rows: "4", placeholder: "2026-04-01\n2026-04-08\n2026-04-15" },
    "Datums (een per regel)"
  );
  dlW.style.display = "none";
  form.append(dlW);

  // Toggle date fields
  dtF.addEventListener("change", () => {
    const v = (dtF as HTMLSelectElement).value as DateType;
    dateW.style.display = v === "single" ? "" : "none";
    dsW.style.display = v === "range" ? "" : "none";
    deW.style.display = v === "range" ? "" : "none";
    dlW.style.display = v === "list" ? "" : "none";
  });

  // Times
  const { wrapper: tsW, field: tsF } = createField(
    "input",
    { id: "timeStart", type: "time" },
    "Starttijd"
  );
  const { wrapper: teW, field: teF } = createField(
    "input",
    { id: "timeEnd", type: "time" },
    "Eindtijd"
  );
  form.append(tsW, teW);

  // Description
  const { wrapper: descW, field: descF } = createField(
    "textarea",
    { id: "description", rows: "3", placeholder: "Beschrijving" },
    "Beschrijving"
  );
  form.append(descW);

  // URL
  const { wrapper: urlW, field: urlF } = createField(
    "input",
    { id: "url", type: "url", placeholder: "https://..." },
    "URL"
  );
  form.append(urlW);

  // Submit
  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.textContent = "Activiteit opslaan";
  form.append(submitBtn);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusBanner.hide();

    const title = (titleF as HTMLInputElement).value.trim();
    if (!title) {
      statusBanner.show("error", "Titel is verplicht.");
      return;
    }

    const dateType = (dtF as HTMLSelectElement).value as DateType;
    const data: ActivityFormData = {
      title,
      dateType,
      description: (descF as HTMLTextAreaElement).value.trim(),
    };

    if (dateType === "single") {
      data.date = (dateF as HTMLInputElement).value;
      if (!data.date) {
        statusBanner.show("error", "Datum is verplicht.");
        return;
      }
    } else if (dateType === "range") {
      data.dateStart = (dsF as HTMLInputElement).value;
      data.dateEnd = (deF as HTMLInputElement).value;
      if (!data.dateStart) {
        statusBanner.show("error", "Startdatum is verplicht.");
        return;
      }
    } else if (dateType === "list") {
      data.dates = (dlF as HTMLTextAreaElement).value
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => /^\d{4}-\d{2}-\d{2}$/.test(l));
      if (data.dates.length === 0) {
        statusBanner.show("error", "Voer minimaal een geldige datum in (yyyy-mm-dd).");
        return;
      }
    }

    const ts = (tsF as HTMLInputElement).value;
    const te = (teF as HTMLInputElement).value;
    if (ts) data.timeStart = ts;
    if (te) data.timeEnd = te;

    const u = (urlF as HTMLInputElement).value.trim();
    if (u) data.url = u;

    submitBtn.disabled = true;
    submitBtn.textContent = "Opslaan...";

    try {
      if (editingGroupId) {
        // List edit: delete all old rows for this group, insert new ones
        await deleteActivitiesByGroupId(editingGroupId);
        await insertActivities(formDataToRows(data));
        statusBanner.show("success", `Reeks "${data.title}" bijgewerkt.`);
      } else if (editingId) {
        const rows = formDataToRows(data);
        await updateActivity(editingId, rows[0]);
        statusBanner.show("success", `Activiteit "${data.title}" bijgewerkt.`);
      } else {
        await insertActivities(formDataToRows(data));
        statusBanner.show("success", `Activiteit "${data.title}" opgeslagen.`);
      }

      resetForm();
      onSaved?.();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      statusBanner.show("error", `Opslaan mislukt: ${msg}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Activiteit opslaan";
    }
  });

  // Cancel edit button
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "cancel-btn";
  cancelBtn.textContent = "Annuleren";
  cancelBtn.style.display = "none";
  cancelBtn.addEventListener("click", () => {
    resetForm();
    onCancel?.();
  });
  form.append(cancelBtn);

  function resetForm(): void {
    editingId = null;
    editingGroupId = null;
    form.reset();
    heading.textContent = "Nieuwe activiteit";
    submitBtn.textContent = "Activiteit opslaan";
    cancelBtn.style.display = "none";
    dateW.style.display = "";
    dsW.style.display = "none";
    deW.style.display = "none";
    dlW.style.display = "none";
  }

  function loadActivity(rows: ActivityRow[]): void {
    resetForm();
    const row = rows[0];
    heading.textContent = "Activiteit bewerken";
    submitBtn.textContent = "Wijziging opslaan";
    cancelBtn.style.display = "";

    (titleF as HTMLInputElement).value = row.title;
    (descF as HTMLTextAreaElement).value = row.description;
    (tsF as HTMLInputElement).value = row.time_start ?? "";
    (teF as HTMLInputElement).value = row.time_end ?? "";
    (urlF as HTMLInputElement).value = row.url ?? "";

    if (row.dates_item !== null) {
      editingGroupId = row.group_id;
      (dtF as HTMLSelectElement).value = "list";
      dateW.style.display = "none";
      dlW.style.display = "";
      (dlF as HTMLTextAreaElement).value = rows.map((r) => r.dates_item ?? "").filter(Boolean).join("\n");
    } else if (row.date_start) {
      editingId = row.id;
      (dtF as HTMLSelectElement).value = "range";
      dateW.style.display = "none";
      dsW.style.display = "";
      deW.style.display = "";
      (dsF as HTMLInputElement).value = row.date_start;
      (deF as HTMLInputElement).value = row.date_end ?? "";
    } else {
      editingId = row.id;
      (dtF as HTMLSelectElement).value = "single";
      (dateF as HTMLInputElement).value = row.date ?? "";
    }
  }

  return { element: form, loadActivity };
}
