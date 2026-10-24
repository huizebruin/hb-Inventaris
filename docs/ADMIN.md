# Beheer & gezondheid

Open via **Menu → Beheer → Beheer & gezondheid**. Tabs: Overzicht, Gezondheid, Back-ups, Import/export, Media, Logboek.
Alle acties zijn ook als API beschikbaar (`/api/admin/...`).

## Wat wordt gecontroleerd
Verplichte tabellen, SQLite-integriteit, metadata-tellers (`nextId` e.d.), schema-versie, kapotte JSON in velden,
ongeldige waarden (lege naam, negatieve voorraad), onderdelen met een niet-bestaande categorie/locatie/extra locatie,
wees-categorieën, dubbele locatienamen, ontbrekende foto's/documenten, ongebruikte mediabestanden, backup-status en schijfruimte.
Dezelfde controle draait bij het opstarten; problemen komen als waarschuwing in het logboek, de app start altijd.

## Herstelacties
Elke herstelactie toont eerst de betrokken ID's (voorbeeld), vraagt bevestiging, maakt daarna automatisch een backup
(`...-pre-repair.db`), voert uit in één transactie en logt de aangepaste ID's. Kapotte JSON wordt gereset naar leeg; de
oude waarde blijft in het logboek staan.

## Back-ups
* Dagelijks op `HB_BACKUP_TIME` (standaard 00:00). Is de server dan uit, dan volgt een inhaalbackup kort na het opstarten.
* Elke backup wordt na het maken gecontroleerd; een ongeldige backup wordt weggegooid en gemeld.
* **Retentie:** ouder dan `HB_BACKUP_RETENTION_DAYS` (14) wordt opgeruimd, behalve de `HB_BACKUP_KEEP_MIN` (3) nieuwste *geldige*
  backups. De nieuwste geldige backup wordt nooit verwijderd (ook niet handmatig). Elke opruiming staat in het logboek.
* Extra backups krijgen een label: `handmatig`, `pre-restore`, `pre-repair`, `pre-import`, `pre-migratie`.

## Restore-procedure (en verificatie)
1. Beheer → Back-ups → **Terugzetten** bij een geldige backup, typ de bestandsnaam ter bevestiging.
2. De app controleert de backup vooraf (integriteit, verplichte tabellen, schema niet nieuwer dan de app). Ongeldig = geweigerd.
3. Er wordt een veiligheidsbackup van de huidige data gemaakt (`pre-restore`). Lukt dat niet, dan stopt de restore.
4. Backup wordt teruggezet, openstaande migraties draaien.
5. Verificatie: tabellen, metadata, aantal onderdelen/categorieën/locaties vs. de backup, volledige integriteitscontrole,
   een onderdeel leesbaar, en de logische integriteitscontrole. Het resultaat staat in het scherm én in het logboek.
6. Bij een fout in stap 4/5 wordt automatisch teruggezet naar de veiligheidsbackup.

Handmatig (app gestopt): kopieer een backup naar `data/inventaris.db`, verwijder `inventaris.db-wal` en `-shm`, start de app.

## Import / export
* Export: JSON (volledig, selectie via `?ids=1,2,3`, optioneel met geschiedenis), CSV (`;` voor Nederlands Excel of komma), Excel.
  Tekst die met `= + - @` begint krijgt een apostrof (beveiliging tegen formule-injectie) en wordt bij import weer verwijderd.
* Import: kies bestand → **voorbeeld** (aantallen, ongeldige rijen, duplicaten, ontbrekende verplichte velden, kolomkoppeling,
  wijzigingen) → **Importeren** of **Annuleren**. Pas bij importeren wordt geschreven, na een backup, in één transactie.
* Duplicaten: op ID (alleen bij CSV/Excel met id-kolom), anders IPN, anders naam. Kies overslaan / bijwerken / toch toevoegen.
* JSON "alles vervangen" is alleen mogelijk met een volledige export en vraagt een extra bevestiging.

## Uploads
Alleen jpg/png/gif/webp/pdf; echte inhoud (magic bytes), extensie en MIME moeten kloppen, geen padtekens of dubbele
gevaarlijke extensies, max. `HB_MAX_UPLOAD_MB`, optioneel een totaallimiet `HB_MEDIA_MAX_MB`. Bestandsnamen botsen nooit.
Geweigerde uploads staan als `upload`-waarschuwing in het logboek.

## Logboek
`data/logs/inventaris.log`, roterend (`HB_LOG_MAX_MB`, `HB_LOG_BACKUPS`). Categorieën: app, db, media, upload, backup, restore,
repair, import, export, ai, startup, admin. Onverwachte fouten in een API-aanroep worden gelogd en als nette JSON-fout teruggegeven.

## Beveiliging
De app heeft geen inlog (alleen LAN). Zet `HB_ADMIN_TOKEN` in `.env` om restore, repair, import-commit, backup aanmaken/verwijderen
en media-opruiming achter een token te zetten (de app vraagt er eenmalig om).

## Tests
`pip install -r requirements-dev.txt && python -m pytest tests` — inclusief backup → wijzigen → restore smoke-test (ook in CI).

## Externe bestanden in de mediamap (Samba)

Bestanden die je rechtstreeks in `media/` zet (ook in submappen, bijv. via een Samba-share) verschijnen in het Mediabeheer.
Onder *Beheer → Media* zie je ze apart (“Extern geplaatst”), met een controle op nep-extensies. Ze worden **nooit automatisch**
verwijderd; verwijderen kan alleen bewust met de aparte knop. Zie ook [DEPLOYMENT.md](DEPLOYMENT.md#5-mediamap-delen-via-samba-bestanden-van-buiten-plaatsen).
