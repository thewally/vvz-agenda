# Technische documentatie VVZ'49 Agenda

Deze documentatie beschrijft de technische architectuur van het vvz-agenda project voor ontwikkelaars en technisch beheerders.

---

## Projectstructuur

```
vvz-agenda/
  admin/index.html          # Admin interface entry point
  src/
    main.ts                 # Widget entry point (IIFE export)
    widget.ts               # Widget rendering en initialisatie
    supabase.ts             # Supabase data-ophaling (widget)
    types.ts                # TypeScript types en VvzAgendaConfig
    styles.ts               # Widget CSS (Shadow DOM)
    admin/
      main.ts               # Admin app bootstrap
      supabase.ts           # Supabase client (admin CRUD)
      types.ts              # Admin-specifieke types
      components/           # UI-componenten (LoginForm, ActivityForm, ActivityList, StatusBanner)
  .github/workflows/
    deploy.yml              # GitHub Actions deployment pipeline
  vite.config.ts            # Vite config (dev server)
  vite.widget.config.ts     # Vite config (widget IIFE build)
  vite.admin.config.ts      # Vite config (admin build)
  vitest.config.ts          # Vitest configuratie
  index.html                # Dev entry point (widget)
  index.prod.html           # Productie template (envsubst)
```

---

## Authenticatie

De admin interface gebruikt **Supabase Auth** met e-mail/wachtwoord-login. Accounts worden aangemaakt door de projectbeheerder in het [Supabase dashboard](https://supabase.com/dashboard).

Relevante functies in `src/admin/supabase.ts`:

- `signIn(email, password)` -- inloggen, retourneert een `SupabaseUser`
- `signOut()` -- uitloggen
- `getSession()` -- controleert of er een actieve sessie is

De Supabase client wordt geinitialiseerd met de omgevingsvariabelen `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY`.

---

## Database

Het project gebruikt een **Supabase PostgreSQL**-database met een `activities`-tabel.

### Tabelstructuur: `activities`

| Kolom | Type | Omschrijving |
|---|---|---|
| `id` | `string` (UUID) | Primaire sleutel |
| `title` | `string` | Naam van de activiteit |
| `description` | `string` | Korte omschrijving |
| `date` | `string \| null` | Datum (voor enkele-datum activiteiten) |
| `date_start` | `string \| null` | Begindatum (voor datumbereik) |
| `date_end` | `string \| null` | Einddatum (voor datumbereik) |
| `dates_item` | `string \| null` | Individuele datum (voor datumlijst-activiteiten) |
| `group_id` | `string \| null` | Groeps-ID (koppelt datumlijst-items) |
| `time_start` | `string \| null` | Starttijd, bijv. `"14:00"` |
| `time_end` | `string \| null` | Eindtijd, bijv. `"16:00"` |
| `url` | `string \| null` | Optionele link naar meer informatie |
| `sort_date` | `string` | Berekende sorteersleutel (ISO-datumstring) |
| `created_at` | `string` | Aanmaakdatum |
| `updated_at` | `string` | Laatste wijzigingsdatum |

### Datumtypen

Activiteiten kennen drie datumtypen, bepaald door welke kolommen gevuld zijn:

- **Enkele datum** (`date` gevuld) -- activiteit op een specifieke dag
- **Datumbereik** (`date_start` + `date_end` gevuld) -- aaneengesloten meerdaagse activiteit
- **Datumlijst** (`dates_item` + `group_id` gevuld) -- meerdere losse datums die als groep worden beheerd; elke datum is een apart record met hetzelfde `group_id`

### CRUD-operaties

De admin interface voert CRUD-operaties uit via `src/admin/supabase.ts`:

- `listActivities()` -- alle activiteiten ophalen, gesorteerd op `sort_date`
- `insertActivities(rows)` -- een of meerdere rijen invoegen (meerdere bij datumlijst)
- `updateActivity(id, row)` -- een activiteit bijwerken
- `deleteActivityById(id)` -- enkele activiteit verwijderen
- `deleteActivitiesByGroupId(groupId)` -- alle datumlijst-items in een groep verwijderen

---

## GitHub Secrets

De volgende secrets moeten geconfigureerd zijn in de GitHub repository-instellingen (Settings > Secrets and variables > Actions):

| Secret | Omschrijving | Gebruikt door |
|---|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL (bijv. `https://xxx.supabase.co`) | Build-stap en `envsubst` in deploy pipeline |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (publieke) key | Build-stap en `envsubst` in deploy pipeline |

Voor lokale ontwikkeling worden deze waarden ingesteld via een `.env`-bestand in de projectroot.

---

## Deployment pipeline

De GitHub Actions workflow (`.github/workflows/deploy.yml`) draait bij iedere push naar `main`:

1. Checkout code
2. Setup Node.js (v24)
3. `npm ci` -- dependencies installeren
4. `npx vitest run` -- tests draaien
5. `npm run build` -- widget en admin bouwen (met Supabase secrets als env vars)
6. `envsubst < index.prod.html > dist/index.html` -- Supabase-credentials invullen in de productie-HTML
7. Upload `dist/` als GitHub Pages artifact
8. Deploy naar GitHub Pages

---

## Widget configuratie-API

### `window.VvzAgenda.init(config)`

| Optie | Type | Verplicht | Standaard | Omschrijving |
|---|---|---|---|---|
| `target` | `string \| HTMLElement` | ja | -- | CSS-selector of DOM-element waarin de widget wordt geplaatst |
| `supabaseUrl` | `string` | ja | -- | Supabase project URL |
| `supabaseAnonKey` | `string` | ja | -- | Supabase anonymous (publieke) key |
| `hidePast` | `boolean` | nee | `true` | Verberg activiteiten waarvan de datum is verstreken |
| `maxItems` | `number` | nee | `0` (ongelimiteerd) | Maximum aantal activiteiten om te tonen |

### Stijlisolatie

De widget gebruikt een **Shadow DOM**, waardoor stijlen niet lekken naar of worden overgenomen van het omringende WordPress-thema.

### Voorbeeld embedding

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
