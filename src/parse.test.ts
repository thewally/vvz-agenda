import { describe, it, expect } from "vitest";
import { rowToActivity } from "./supabase";

describe("rowToActivity", () => {
  it("maps a single-date row to Activity", () => {
    const row = {
      id: "abc",
      title: "Test",
      description: "Desc",
      date: "2026-04-05",
      date_start: null,
      date_end: null,
      dates_item: null,
      time_start: "14:00",
      time_end: "16:00",
      url: null,
      sort_date: "2026-04-05",
    };
    const a = rowToActivity(row);
    expect(a.title).toBe("Test");
    expect(a.date).toBe("2026-04-05");
    expect(a.timeStart).toBe("14:00");
    expect(a.timeEnd).toBe("16:00");
    expect(a.sortDate).toBe("2026-04-05");
    expect(a.url).toBeUndefined();
  });

  it("maps a range row to Activity", () => {
    const row = {
      id: "def",
      title: "Camp",
      description: "",
      date: null,
      date_start: "2026-07-14",
      date_end: "2026-07-18",
      dates_item: null,
      time_start: null,
      time_end: null,
      url: null,
      sort_date: "2026-07-14",
    };
    const a = rowToActivity(row);
    expect(a.dateStart).toBe("2026-07-14");
    expect(a.dateEnd).toBe("2026-07-18");
    expect(a.date).toBeUndefined();
  });

  it("maps a dates_item row to Activity with date set", () => {
    const row = {
      id: "ghi",
      title: "Training",
      description: "",
      date: null,
      date_start: null,
      date_end: null,
      dates_item: "2026-04-01",
      time_start: "19:00",
      time_end: null,
      url: "https://example.com",
      sort_date: "2026-04-01",
    };
    const a = rowToActivity(row);
    expect(a.date).toBe("2026-04-01");
    expect(a.datesItem).toBe("2026-04-01");
    expect(a.url).toBe("https://example.com");
  });
});
