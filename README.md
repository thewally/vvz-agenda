# VVZ'49 Agenda

Een agenda-widget voor [sv VVZ'49](https://www.vvz49.nl) in Soest. De widget laadt activiteiten uit Markdown-bestanden en toont ze als datumgesorteerde kaarten. De widget kan ingebed worden in de WordPress-site van VVZ'49 via een `<script>`-tag.

---

## Benodigde tools

| Tool | Versie | Waarvoor |
|---|---|---|
| [Node.js](https://nodejs.org) | 18 of hoger | JavaScript runtime voor de build-tooling |
| [npm](https://www.npmjs.com) | meegeleverd met Node.js | Pakketbeheer en het uitvoeren van scripts |
| [Git](https://git-scm.com) | recent | Versiebeheer en pushen naar GitHub |

Controleer je installatie:

```bash
node --version   # bijv. v22.0.0
npm --version    # bijv. 10.0.0
git --version    # bijv. git version 2.44.0
```

> Aanbevolen: installeer Node.js via [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) of [nvm-windows](https://github.com/coreybutler/nvm-windows) zodat je eenvoudig tussen versies kunt wisselen.

---

## Lokaal starten

**Vereisten:** Node.js 18 of hoger, npm

```bash
# Installeer dependencies
npm install

# Start de ontwikkelserver
npm run dev
```

De app is daarna bereikbaar op [http://localhost:5173/vvz-agenda/](http://localhost:5173/vvz-agenda/).

---

## Builden

```bash
# Type-check en bouw de productie-bundle
npm run build
```

De output verschijnt in de `dist/` map:
- `vvz-agenda.iife.js` — de zelfstandige widget-bundle
- `index.html` — wordt door de pipeline aangevuld met `index.prod.html`
- `activities/` — Markdown-bestanden voor de activiteiten

---

## Tests uitvoeren

```bash
npm test
```

---

## Deployment

De app wordt automatisch gedeployed naar GitHub Pages via de GitHub Actions pipeline (`.github/workflows/deploy.yml`) bij iedere push naar de `main` branch.

Live URL: [https://thewally.github.io/vvz-agenda/](https://thewally.github.io/vvz-agenda/)

---

## Activiteiten toevoegen

Activiteiten staan als Markdown-bestanden in de map `public/activities/`. Maak een nieuw `.md`-bestand aan met de bestandsnaam `YYYY-MM-DD-naam-van-activiteit.md`.

### Enkeldaagse activiteit

```markdown
---
title: Paascup 2026
date: 2026-04-04
timeStart: "08:30"
timeEnd: "13:00"
description: Jaarlijkse Paascup op sportpark De Meent.
url: https://www.vvz49.nl/paascup
---
```

### Meerdaagse activiteit (aaneengesloten)

```markdown
---
title: Jeugdkamp 2026
dateStart: 2026-06-12
dateEnd: 2026-06-13
timeStart: "09:00"
timeEnd: "17:00"
description: Jaarlijks jeugdkamp van sv VVZ '49.
---
```

### Activiteit op meerdere losse datums

Gebruik `dates` (een lijst) voor activiteiten die meerdere keren terugkomen op vaste datums:

```markdown
---
title: Techniektraining JO08 t/m JO10
dates:
  - 2026-03-20
  - 2026-03-27
  - 2026-04-10
timeStart: "16:00"
timeEnd: "17:00"
description: Techniektraining op vrijdagmiddag aan de Eemweg.
url: https://www.vvz49.nl/techniektraining
---
```

### Velden

| Veld | Verplicht | Omschrijving |
|---|---|---|
| `title` | ja | Naam van de activiteit |
| `date` | ja* | Datum (enkeldaagse activiteit) |
| `dateStart` + `dateEnd` | ja* | Begin- en einddatum (meerdaagse aaneengesloten activiteit) |
| `dates` | ja* | Lijst van losse datums (terugkerende activiteit) |
| `timeStart` | nee | Starttijd, bijv. `"14:00"` |
| `timeEnd` | nee | Eindtijd, bijv. `"16:00"` |
| `description` | nee | Korte omschrijving |
| `url` | nee | Link naar meer informatie (opent in hetzelfde tabblad) |

*Gebruik precies één van `date`, `dateStart`/`dateEnd` of `dates`.

> Verlopen activiteiten worden automatisch verborgen. Een activiteit die vandaag plaatsvindt wordt nog wel getoond.

### Manifest bijwerken

Na het toevoegen van een nieuw bestand moet het manifest bijgewerkt worden zodat de widget het bestand kan vinden. Het manifest staat in `public/activities/manifest.json`:

```json
{
  "files": [
    "2026-04-04-paascup.md",
    "2026-06-12-jeugdkamp-2026.md"
  ]
}
```

Voeg de bestandsnaam van de nieuwe activiteit toe aan de `files`-lijst.

---

## Insluiten op de WordPress-site

Voeg de volgende code toe aan een pagina of widget op [vvz49.nl](https://www.vvz49.nl):

```html
<div id="vvz-agenda"></div>
<script src="https://thewally.github.io/vvz-agenda/vvz-agenda.iife.js"></script>
<script>
  VvzAgenda.init({
    container: '#vvz-agenda',
    activitiesUrl: 'https://thewally.github.io/vvz-agenda/activities/manifest.json'
  });
</script>
```
