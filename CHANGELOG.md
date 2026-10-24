🇳🇱 Nederlands · [🇬🇧 English](CHANGELOG.en.md)

# Changelog

Alle noemenswaardige wijzigingen. Formaat volgens [Keep a Changelog](https://keepachangelog.com/nl/1.1.0/),
versies volgens [SemVer](https://semver.org/lang/nl/).

## [3.9.1] - 2026-10-24

### Toegevoegd
- **Meertalig: Nederlands en Engels.** Kies de taal via *Menu → Instellingen → Language / Taal*. Zonder keuze volgt de app de taal van de browser (Nederlands blijft Nederlands, andere talen krijgen Engels). Het woordenboek staat in `static/i18n-en.js`; teksten die er niet in staan blijven Nederlands, dus aanvullen kan regel voor regel.
- E-mails (overzicht, backup-alarm, testmail) volgen `HB_LANG=nl|en` in `.env`.

### Gewijzigd
- Datum- en getalnotatie volgt de gekozen taal.
- "1 onderdeeleen" in het kastoverzicht is "onderdelen" geworden.

### Upgraden van 3.9.0
Geen databasemigratie nodig. Bouw opnieuw (`docker compose up -d --build`); bij handmatig kopiëren ook `static/i18n.js` en `static/i18n-en.js` meenemen.

## [3.9.0] - 2026-10-24

### Toegevoegd
- **Beheerpagina** (Menu → Beheer & gezondheid): overzicht, gezondheid, back-ups, import/export, media, logboek. Zie `docs/ADMIN.md`.
- **Databasecontrole** met herstelacties (eerst voorbeeld, dan bevestigen, automatische back-up vóór herstel): kapotte JSON-velden,
  onbekende categorie/locatie, dubbele id's/IPN's, achterlopende tellers, ontbrekende bestanden.
- **Systeem- en opslagmonitor**: schijfruimte met waarschuwingsdrempels, database-, media- en backupgrootte.
- **Back-ups**: geverifieerde back-ups, retentie (standaard 14 dagen, minimaal 3 geldige blijven), restore met controle vooraf,
  veiligheidsback-up, controle achteraf en automatische terugdraai bij mislukking.
- **Import/export** CSV, Excel en JSON met voorbeeld (dry-run) vóór opslaan en detectie van dubbelen.
- **Uploadcontroles**: inhoud (magic bytes), extensie, MIME, gevaarlijke/dubbele extensies, grootte en mediaquotum.
- **Externe media**: bestanden mogen ook rechtstreeks in de mediamap (ook submappen), bijvoorbeeld via Samba. Worden nooit automatisch opgeruimd.
- **Optionele login** (`HB_AUTH_USER`/`HB_AUTH_PASSWORD`) met rate limiting, en beveiligingsheaders. Zie `docs/DEPLOYMENT.md`.
- **Gestructureerd logboek** met rotatie en categorieën (db, backup, media, import, ai, auth, ...).
- **Centrale validatie** van API-invoer: ongeldige invoer geeft `400` met `{error, fields}`.
- **Schema-versiebeheer** met migratiesysteem (`meta.schemaVersion`), automatische back-up vóór migraties.
- **Tests en CI**: pytest-suite, ruff-lint en Docker-build in GitHub Actions; release-workflow.
- **E-mailmeldingen** (server-side, via `SMTP_*` en `HB_EMAIL`): dagelijks overzicht met lage voorraad, bijna verlopen en systeemmeldingen (alleen als er iets te melden is), directe mail bij mislukte backup, testknoppen in Beheer.
- `docs/DEPLOYMENT.md`: reverse proxy (Caddy/nginx), firewall, checklist, Samba-tips.

### Gewijzigd
- **Zoekfunctie** doorzoekt nu alle velden, tolereert typefouten en volgorde van woorden, sorteert op relevantie en toont het aantal resultaten.
- `expiryDate` wordt nu daadwerkelijk in de database bewaard (migratie 3).
- Een kapot JSON-veld in één record laat niet langer de hele lijst crashen.
- Een onderdeel verwijderen verwijdert gedeelde foto's niet meer.
- Docker-healthcheck op `/api/health`; `requirements.txt` bevat nu Pillow en openpyxl.

### Upgraden van 3.8.x
1. **Maak eerst een kopie van `data/`** (of gebruik de bestaande back-up).
2. Haal de nieuwe code binnen en bouw opnieuw: `docker compose up -d --build`. `requirements.txt` is gewijzigd, dus een rebuild is nodig.
   Op Windows: het startscript installeert de nieuwe pakketten zelf (eenmalig).
3. Bij de eerste start draaien de migraties 1 t/m 3 automatisch. Vooraf wordt een back-up gemaakt in `backups/` (`...-pre-migratie.db`).
4. Controleer *Beheer → Gezondheid*. Staan er meldingen, gebruik dan de herstelknoppen (met voorbeeld).
5. Optioneel: stel `HB_AUTH_*` en `HB_ADMIN_TOKEN` in; zie `docs/DEPLOYMENT.md`. Nieuwe instellingen staan in `.env.example`.

**Terugdraaien:** zet de oude code terug en herstel de `...-pre-migratie.db` uit `backups/` over `data/inventaris.db`.
Migraties zijn alleen additief (kolommen en indexen), oudere versies blijven dus meestal werken met de nieuwe database.

## [3.8.0]
Laatste versie vóór dit changelog. Zie de Git-geschiedenis.
