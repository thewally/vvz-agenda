# Admin-handleiding VVZ'49 Agenda

Deze handleiding beschrijft hoe je als beheerder activiteiten beheert via de admin interface.

---

## Toegang tot de admin interface

De admin interface is bereikbaar op:
**[https://thewally.github.io/vvz-agenda/admin/](https://thewally.github.io/vvz-agenda/admin/)**

### Inloggen

Je hebt een account nodig (e-mailadres en wachtwoord). Dit account wordt aangemaakt door de projectbeheerder.

1. Open de admin interface
2. Vul je e-mailadres en wachtwoord in
3. Klik op **Inloggen**

Na het inloggen zie je bovenaan je e-mailadres en een **Uitloggen**-knop.

---

## Navigatie

De admin interface heeft twee tabbladen:

- **Activiteiten** -- overzicht van alle bestaande activiteiten
- **Nieuwe activiteit** -- formulier om een activiteit toe te voegen

---

## Activiteit toevoegen

1. Klik op het tabblad **Nieuwe activiteit**
2. Vul het formulier in (zie "Velden" hieronder)
3. Klik op **Opslaan**
4. Bij succes verschijnt een groene bevestigingsmelding en word je teruggestuurd naar het activiteitenoverzicht

### Velden

| Veld | Verplicht | Omschrijving |
|---|---|---|
| **Titel** | ja | Naam van de activiteit |
| **Type datum** | ja | Kies uit: *Enkele datum*, *Datumbereik* (meerdaags), of *Datumlijst* (meerdere losse datums) |
| **Datum** | ja* | Datum van de activiteit (bij enkele datum) |
| **Begindatum / Einddatum** | ja* | Begin- en einddatum (bij datumbereik) |
| **Datums** | ja* | Lijst van losse datums (bij datumlijst) |
| **Starttijd** | nee | Tijdstip waarop de activiteit begint, bijv. `14:00` |
| **Eindtijd** | nee | Tijdstip waarop de activiteit eindigt, bijv. `16:00` |
| **Omschrijving** | nee | Korte beschrijving van de activiteit |
| **URL** | nee | Link naar meer informatie (wordt getoond als klikbare titel) |

*Afhankelijk van het gekozen datumtype is precies een van deze groepen verplicht.

### Datumtypen

**Enkele datum** -- voor activiteiten op een specifieke dag, zoals een wedstrijd of vergadering.

**Datumbereik** -- voor aaneengesloten meerdaagse activiteiten, zoals een zomerkamp. De widget toont de begin- en einddatum.

**Datumlijst** -- voor terugkerende activiteiten op losse datums, zoals een wekelijkse training. Elke datum wordt als aparte activiteitkaart getoond in de widget, maar ze worden als groep beheerd in de admin interface.

---

## Activiteit bewerken

1. Ga naar het tabblad **Activiteiten**
2. Klik op **Bewerken** bij de gewenste activiteit
3. Het bewerkformulier verschijnt boven de lijst
4. Pas de gegevens aan
5. Klik op **Opslaan** om de wijzigingen door te voeren, of op **Annuleren** om terug te gaan

> Bij het verlaten van het bewerkformulier met niet-opgeslagen wijzigingen verschijnt een waarschuwing.

---

## Activiteit verwijderen

1. Ga naar het tabblad **Activiteiten**
2. Klik op **Verwijderen** bij de gewenste activiteit
3. Bevestig de verwijdering

Bij activiteiten van het type *datumlijst* worden alle datums in de groep verwijderd.

---

## Veelgemaakte fouten

| Probleem | Oorzaak | Oplossing |
|---|---|---|
| Inloggen lukt niet | Verkeerd wachtwoord of account bestaat niet | Controleer je gegevens, neem contact op met de projectbeheerder |
| Activiteit verschijnt niet in de widget | De datum is verstreken en verlopen activiteiten worden verborgen | Controleer of de datum in de toekomst ligt |
| Foutmelding bij opslaan | Mogelijk een netwerkprobleem of ontbrekende verplichte velden | Controleer je internetverbinding en vul alle verplichte velden in |
