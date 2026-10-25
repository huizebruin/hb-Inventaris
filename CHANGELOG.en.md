🇬🇧 English · [🇳🇱 Nederlands](CHANGELOG.md)

# Changelog

All notable changes. Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versions follow [SemVer](https://semver.org/).

## [3.9.2] - 2026-10-25

### Added
- **Location labels and scanning:** QR label per bin/cabinet/drawer (*Print location labels*); scanning shows only the parts in that place. The camera scanner now also works on iPhone/Safari and Firefox (built-in QR reader).
- **QR codes drawn locally:** in the browser (offline, no external QR service any more). Bundled in `static/vendor/` (qrcode-generator MIT, jsQR Apache-2.0).
- **Recognize via photo in the scanner:** Gemini describes the part, the app finds the best matches in your inventory and books a quantity in or out with one click.
- **Several kinds on one photo:** shown as separate suggestions, each can be added as a new part with one click.
- **Order list per supplier:** combines low stock with the BOM shortages of ticked projects, picks one supplier per part (cheapest or first), with CSV, copy *SKU;quantity* and open all links per supplier.
- **Stock value over time** (Dashboard → Stock): recorded daily; the past is estimated once from the movement history.
- **Price increase alert:** supplier price changes are recorded; a rise of at least `HB_PRICE_ALERT_PCT` (default 10%) shows in the bell, the dashboard and the daily email digest.
- **New part from a photo:** *Menu → Admin → New part via photo*. Take a photo, Gemini identifies the part and counts the quantity (marked *counted* or *estimated*). Take over quantity and photo with one click. Warns when several types are in the photo. Requires `GEMINI_API_KEY`.
- **Update notification:** every 12 hours the app checks GitHub for a newer release and tells you in the bell, in Admin and in the daily email digest. *Updates* tab with release notes.
- **Self-update** (not with Docker): downloads the release, verifies SHA-256, paths and contents, first backs up the database and program code, applies it, restarts and rolls back automatically on error. See `docs/ADMIN.en.md#updates`.
- Settings `HB_UPDATE_CHECK`, `HB_UPDATE_INSTALL` and `HB_UPDATE_REPO`.

### Changed
- **CSV exports** (order list and BOM) had all rows on one line; now proper line breaks, and cells starting with `=`, `+`, `-` or `@` are made safe for Excel.
- The deep link `?loc=ID` (location filter) did not work; it does now, including extra locations.
- Database schema 4: tables `value_snapshots` and `price_log` (automatic migration with prior backup).
- `.env` is now also read from the folder next to `server.py` (besides `data/.env`); quotes and BOM are handled. The message for a missing `GEMINI_API_KEY` now points to the right place.
- The check *Price lines with a supplier that no longer exists* now explains the problem, compares IDs tolerantly (text "3" = number 3, empty values ignored) and has a repair button that removes the referencing lines (with preview, automatic backup and log).

### Upgrading from 3.9.1
No database migration. Rebuild (`docker compose up -d --build`) or copy the new files.

## [3.9.1] - 2026-10-24

### Added
- **Multilingual: Dutch and English.** Choose the language via *Menu → Settings → Language / Taal*. Without a choice, the app follows the browser language (Dutch stays Dutch, other languages get English). The dictionary lives in `static/i18n-en.js`; texts that are not in it stay Dutch, so it can be extended line by line.
- Emails (digest, backup alarm, test email) follow `HB_LANG=nl|en` in `.env`.

### Changed
- Date and number formatting follows the selected language.
- "1 onderdeeleen" in the cabinet overview has been corrected to "onderdelen".

### Upgrading from 3.9.0
No database migration needed. Rebuild (`docker compose up -d --build`); when copying files by hand, include `static/i18n.js` and `static/i18n-en.js` too.

## [3.9.0] - 2026-10-24

### Added
- **Admin page** (Menu → Admin & health): overview, health, backups, import/export, media, log. See `docs/ADMIN.en.md`.
- **Database check** with repair actions (preview first, then confirm, automatic backup before repair): broken JSON fields,
  unknown category/location, duplicate ids/IPNs, lagging counters, missing files.
- **System and storage monitor**: disk space with warning thresholds, database, media and backup size.
- **Backups**: verified backups, retention (14 days by default, at least 3 valid ones are kept), restore with a pre-check,
  safety backup, post-check and automatic rollback on failure.
- **Import/export** CSV, Excel and JSON with a preview (dry run) before saving and duplicate detection.
- **Upload checks**: content (magic bytes), extension, MIME type, dangerous/double extensions, size and media quota.
- **External media**: files may also be placed directly in the media folder (including subfolders), for example via Samba. They are never cleaned up automatically.
- **Optional login** (`HB_AUTH_USER`/`HB_AUTH_PASSWORD`) with rate limiting, and security headers. See `docs/DEPLOYMENT.en.md`.
- **Structured log** with rotation and categories (db, backup, media, import, ai, auth, ...).
- **Central validation** of API input: invalid input returns `400` with `{error, fields}`.
- **Schema versioning** with a migration system (`meta.schemaVersion`), automatic backup before migrations.
- **Tests and CI**: pytest suite, ruff lint and Docker build in GitHub Actions; release workflow.
- **Email notifications** (server-side, via `SMTP_*` and `HB_EMAIL`): daily digest with low stock, nearly expired items and system alerts (only when there is something to report), immediate email on a failed backup, test buttons in Admin.
- `docs/DEPLOYMENT.en.md`: reverse proxy (Caddy/nginx), firewall, checklist, Samba tips.

### Changed
- **Search** now searches all fields, tolerates typos and word order, sorts by relevance and shows the number of results.
- `expiryDate` is now actually stored in the database (migration 3).
- A broken JSON field in a single record no longer crashes the whole list.
- Deleting a part no longer deletes shared photos.
- Docker healthcheck on `/api/health`; `requirements.txt` now includes Pillow and openpyxl.

### Upgrading from 3.8.x
1. **First make a copy of `data/`** (or use the existing backup).
2. Pull the new code and rebuild: `docker compose up -d --build`. `requirements.txt` has changed, so a rebuild is required.
   On Windows: the start script installs the new packages itself (one time).
3. On first start, migrations 1 through 3 run automatically. A backup is made beforehand in `backups/` (`...-pre-migratie.db`).
4. Check *Admin → Health*. If there are alerts, use the repair buttons (with preview).
5. Optional: set `HB_AUTH_*` and `HB_ADMIN_TOKEN`; see `docs/DEPLOYMENT.en.md`. New settings are in `.env.example`.

**Rolling back:** restore the old code and restore the `...-pre-migratie.db` from `backups/` over `data/inventaris.db`.
Migrations are additive only (columns and indexes), so older versions usually keep working with the new database.

## [3.8.0]
Last version before this changelog. See the Git history.
