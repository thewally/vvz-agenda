# VVZ'49 Agenda

Een agenda-widget voor [sv VVZ'49](https://www.vvz49.nl) in Soest. De widget laadt activiteiten uit een **Supabase**-database en toont ze als datumgesorteerde kaarten, gegroepeerd per maand. De widget kan ingebed worden in de WordPress-site van VVZ'49 via een `<script>`-tag.

Het project bevat ook een **admin interface** waarmee beheerders activiteiten kunnen toevoegen, bewerken en verwijderen.

---

## Vereisten

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

> Aanbevolen: installeer Node.js via [nvm](https://github.com/nvm-sh/nvm) (macOS/Linux) of [nvm-windows](https://github.com/coreybutler/nvm-windows).

---

## Installatie

```bash
npm install
```

### Omgevingsvariabelen

Maak een `.env`-bestand aan in de projectroot met de Supabase-credentials:

```env
VITE_SUPABASE_URL=https://jouw-project.supabase.co
VITE_SUPABASE_ANON_KEY=jouw-anon-key
```

Deze variabelen worden door Vite ingelezen via `import.meta.env`. Zie [docs/technische-documentatie.md](docs/technische-documentatie.md) voor meer details over de Supabase-configuratie en GitHub Secrets.

---

## Ontwikkeling

### Widget (dev server)

```bash
npm run dev
```

Start de Vite dev server op [http://localhost:5173/vvz-agenda/](http://localhost:5173/vvz-agenda/). Gebruikt `index.html` met de widget-initialisatie.

### Admin interface (dev server)

```bash
npm run dev:admin
```

Start de admin interface vanuit `admin/index.html`.

### Tests

```bash
npm test
```

Gebruikt [Vitest](https://vitest.dev/) als testraamwerk. Configuratie staat in `vitest.config.ts`.

### Typecheck

```bash
npx tsc --noEmit
```

TypeScript is geconfigureerd met `strict: true`.

---

## Bouwen

```bash
npm run build
```

Dit voert achtereenvolgens uit:

1. `tsc` -- typecheck
2. `npm run build:widget` -- bouwt de IIFE-bundle (`dist/vvz-agenda.js`)
3. `npm run build:admin` -- bouwt de admin interface (`dist/admin/`)

### Afzonderlijk bouwen

```bash
npm run build:widget   # alleen de widget-bundle
npm run build:admin    # alleen de admin interface
```

### Output

De `dist/` map bevat na het bouwen:

| Bestand/map | Omschrijving |
|---|---|
| `vvz-agenda.js` | Zelfstandige IIFE widget-bundle |
| `index.html` | Demopagina (gegenereerd uit `index.prod.html` met `envsubst`) |
| `admin/` | Admin interface (HTML + JS) |

---

## Deployment

De app wordt automatisch gedeployed naar **GitHub Pages** via de GitHub Actions pipeline (`.github/workflows/deploy.yml`) bij iedere push naar de `main` branch.

### Live URL's

- **Widget demo:** [https://thewally.github.io/vvz-agenda/](https://thewally.github.io/vvz-agenda/)
- **Admin interface:** [https://thewally.github.io/vvz-agenda/admin/](https://thewally.github.io/vvz-agenda/admin/)

---

## Insluiten op de WordPress-site

```html
<div id="vvz-agenda"></div>
<script src="https://thewally.github.io/vvz-agenda/vvz-agenda.js"></script>
<script>
  window.VvzAgenda.init({
    target: '#vvz-agenda',
    supabaseUrl: 'https://jouw-project.supabase.co',
    supabaseAnonKey: 'jouw-anon-key',
    hidePast: true
  });
</script>
```

Zie [docs/technische-documentatie.md](docs/technische-documentatie.md) voor de volledige configuratie-API.

---

## Documentatie

| Document | Doelgroep | Inhoud |
|---|---|---|
| [docs/technische-documentatie.md](docs/technische-documentatie.md) | Ontwikkelaars, technisch beheerders | Architectuur, Supabase, database, API, projectstructuur |
| [docs/admin-handleiding.md](docs/admin-handleiding.md) | Beheerders (niet-technisch) | Inloggen, activiteiten beheren |
| [docs/gebruiker-handleiding.md](docs/gebruiker-handleiding.md) | Eindgebruikers | Wat de widget toont, hoe te navigeren |
