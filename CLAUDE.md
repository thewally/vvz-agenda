# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

`vvz-agenda` is een agenda-widget voor een voetbalvereniging. Het is een zelfstandige frontend app die:
- Draait via **GitHub Pages** (statische HTML)
- **Ingebed kan worden in een WordPress-site** via een `<script>`-tag
- Een **datumgesorteerde lijst van activiteiten** toont (wedstrijden, trainingen, evenementen)
- Activiteiten laadt uit **Markdown-bestanden** met frontmatter: `title`, `date` of `dateRange` (begin- en einddatum), en een korte `description`

Voorbeeld frontmatter van een activiteit:
```markdown
---
title: Competitiewedstrijd A1 vs FC Utrecht
date: 2026-04-05
timeStart: "14:00"
timeEnd: "16:00"
description: Thuiswedstrijd op sportpark De Meent
---
```

Of met een datumbereik:
```markdown
---
title: Zomerkamp jeugd
dateStart: 2026-07-14
dateEnd: 2026-07-18
timeStart: "09:00"
timeEnd: "17:00"
description: Jaarlijks zomerkamp voor de jeugdteams U10–U14
---
```

`timeStart` en `timeEnd` zijn optioneel. Bij activiteiten zonder eindtijd wordt alleen `timeStart` getoond.

Bij meerdaagse activiteiten (`dateStart`/`dateEnd`) wordt de datum vermeld samen met de tijd, zodat duidelijk is op welke dag de activiteit begint en eindigt. Weergave-voorbeeld: "14 jul 09:00 – 18 jul 17:00".

## Agent

Use the **`frontend-embedded-app-builder`** subagent (defined in [.claude/agents/frontend-embedded-app-builder.md](.claude/agents/frontend-embedded-app-builder.md)) when building or enhancing the frontend application. This agent specializes in:
- Embeddable widgets and micro-frontends (IIFE, ESM, Web Components, iframe)
- Markdown file integration: static bundling, dynamic `fetch()`, frontmatter parsing
- TypeScript with strict mode
- Vite (preferred bundler), esbuild, Rollup

## Technology Defaults

When the project is initialized, follow these defaults unless project files establish otherwise:
- **Language**: TypeScript with `strict: true`
- **Bundler**: Vite (output: IIFE bundle voor `<script>`-tag embedding)
- **Markdown**: `marked` of `markdown-it` voor parsing, `gray-matter` voor frontmatter, `DOMPurify` voor sanitization
- **Tests**: Vitest
- **Style isolation**: Shadow DOM of CSS Modules om conflicten met WordPress-thema's te vermijden
- **Public API pattern**: `window.VvzAgenda.init(config)` — `config` bevat minimaal de URL naar de map met `.md`-bestanden
- **Hosting**: GitHub Pages (`gh-pages` branch of `/docs` map), activiteiten als `.md`-bestanden in de repo

## Git-beleid

- **Nooit automatisch committen of pushen.** Vraag altijd eerst toestemming aan de gebruiker voordat je commit of pusht.

## Key Architectural Concerns

- **Style isolation**: De widget mag geen stijlen lekken naar of overnemen van het WordPress-thema.
- **CORS**: GitHub Pages stuurt de juiste headers; zorg dat de `.md`-bestanden via dezelfde origin worden geserved of dat CORS correct is geconfigureerd.
- **XSS**: Sanitize alle Markdown-rendered HTML vóór DOM-insertie.
- **Zelfstandige bundle**: De output werkt als losse `<script>`-tag in WordPress zonder extra dependencies.
- **Datum-sortering**: Activiteiten worden gesorteerd op `date` of `dateStart`; verlopen activiteiten kunnen optioneel worden verborgen.
