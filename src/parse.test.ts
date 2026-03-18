import { describe, it, expect } from "vitest";
import { parseActivities, parseActivity } from "./parse";

describe("parseFrontmatter + parseActivities", () => {
  it("parses a single-day activity with all fields", () => {
    const md = `---
title: Competitiewedstrijd A1 vs FC Utrecht
date: 2026-04-05
timeStart: "14:00"
timeEnd: "16:00"
description: Thuiswedstrijd op sportpark De Meent
---

Neem je **scheenbeschermers** mee!
`;
    const activities = parseActivities(md);
    expect(activities).toHaveLength(1);
    const a = activities[0];
    expect(a.title).toBe("Competitiewedstrijd A1 vs FC Utrecht");
    expect(a.date).toBe("2026-04-05");
    expect(a.timeStart).toBe("14:00");
    expect(a.timeEnd).toBe("16:00");
    expect(a.description).toBe("Thuiswedstrijd op sportpark De Meent");
    expect(a.sortDate).toBe("2026-04-05");
    expect(a.bodyHtml).toContain("scheenbeschermers");
  });

  it("parses a multi-day activity with dateStart/dateEnd", () => {
    const md = `---
title: Zomerkamp jeugd
dateStart: 2026-07-14
dateEnd: 2026-07-18
timeStart: "09:00"
timeEnd: "17:00"
description: Jaarlijks zomerkamp
---
`;
    const activities = parseActivities(md);
    expect(activities).toHaveLength(1);
    const a = activities[0];
    expect(a.dateStart).toBe("2026-07-14");
    expect(a.dateEnd).toBe("2026-07-18");
    expect(a.date).toBeUndefined();
    expect(a.sortDate).toBe("2026-07-14");
  });

  it("expands a dates list into multiple activities", () => {
    const md = `---
title: Training
dates:
  - 2026-04-01
  - 2026-04-08
  - 2026-04-15
timeStart: "19:00"
description: Wekelijkse training
---
`;
    const activities = parseActivities(md);
    expect(activities).toHaveLength(3);
    expect(activities[0].date).toBe("2026-04-01");
    expect(activities[1].date).toBe("2026-04-08");
    expect(activities[2].date).toBe("2026-04-15");
    expect(activities[0].title).toBe("Training");
  });

  it("returns empty array for missing title", () => {
    const md = `---
date: 2026-04-05
---
`;
    expect(parseActivities(md)).toEqual([]);
  });

  it("returns empty array for missing date fields", () => {
    const md = `---
title: Orphan event
---
`;
    expect(parseActivities(md)).toEqual([]);
  });

  it("returns empty array for non-frontmatter input", () => {
    expect(parseActivities("Just some text")).toEqual([]);
  });

  it("parses activity with optional url field", () => {
    const md = `---
title: Externe wedstrijd
date: 2026-05-01
url: https://example.com
description: Klik voor details
---
`;
    const a = parseActivities(md)[0];
    expect(a.url).toBe("https://example.com");
  });
});

describe("parseActivity", () => {
  it("returns the first activity or null", () => {
    const md = `---
title: Test
date: 2026-01-01
description: desc
---
`;
    const a = parseActivity(md);
    expect(a).not.toBeNull();
    expect(a!.title).toBe("Test");
  });

  it("returns null for invalid input", () => {
    expect(parseActivity("no frontmatter")).toBeNull();
  });
});
