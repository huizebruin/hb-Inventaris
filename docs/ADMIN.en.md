🇬🇧 English · [🇳🇱 Nederlands](ADMIN.md)

# Admin & health

Open via **Menu → Admin → Admin & health**. Tabs: Overview, Health, Backups, Import / export, Media, Log.
All actions are also available as an API (`/api/admin/...`).

## What is checked
Required tables, SQLite integrity, metadata counters (`nextId` etc.), schema version, broken JSON in fields,
invalid values (empty name, negative stock), parts with a non-existent category/location/extra location,
orphan categories, duplicate location names, missing photos/documents, unused media files, backup status and disk space.
The same check runs at startup; problems show up as a warning in the log, and the app always starts.

## Repair actions
Every repair action first shows the IDs involved (preview), asks for confirmation, then automatically makes a backup
(`...-pre-repair.db`), runs in a single transaction and logs the modified IDs. Broken JSON is reset to empty; the
old value remains in the log.

## Backups
* Daily at `HB_BACKUP_TIME` (default 00:00). If the server is off at that time, a catch-up backup follows shortly after startup.
* Every backup is verified after it is created; an invalid backup is discarded and reported.
* **Retention:** backups older than `HB_BACKUP_RETENTION_DAYS` (14) are cleaned up, except the `HB_BACKUP_KEEP_MIN` (3) newest *valid*
  backups. The newest valid backup is never deleted (not even manually). Every cleanup is recorded in the log.
* Extra backups get a label: `handmatig` (manual), `pre-restore`, `pre-repair`, `pre-import`, `pre-migratie` (pre-migration).

## Restore procedure (and verification)
1. Admin → Backups → **Restore** next to a valid backup, type the file name to confirm.
2. The app checks the backup beforehand (integrity, required tables, schema not newer than the app). Invalid = rejected.
3. A safety backup of the current data is made (`pre-restore`). If that fails, the restore stops.
4. The backup is restored, pending migrations run.
5. Verification: tables, metadata, number of parts/categories/locations vs. the backup, full integrity check,
   one part readable, and the logical integrity check. The result is shown on screen and in the log.
6. If step 4/5 fails, the safety backup is restored automatically.

Manually (app stopped): copy a backup to `data/inventaris.db`, delete `inventaris.db-wal` and `-shm`, start the app.

## Import / export
* Export: JSON (full, selection via `?ids=1,2,3`, optionally with history), CSV (`;` for Dutch Excel, or comma), Excel.
  Text starting with `= + - @` gets an apostrophe (protection against formula injection), which is removed again on import.
* Import: choose file → **preview** (counts, invalid rows, duplicates, missing required fields, column mapping,
  changes) → **Import** or **Cancel**. Nothing is written until you import, and then only after a backup, in a single transaction.
* Duplicates: by ID (only for CSV/Excel with an id column), otherwise IPN, otherwise name. Choose skip / update / add anyway.
* JSON "replace all" is only possible with a full export and asks for an extra confirmation.

## Uploads
Only jpg/png/gif/webp/pdf; the actual content (magic bytes), extension and MIME type must match, no path characters or double
dangerous extensions, max. `HB_MAX_UPLOAD_MB`, optionally a total limit `HB_MEDIA_MAX_MB`. File names never collide.
Rejected uploads appear as an `upload` warning in the log.

## Log
`data/logs/inventaris.log`, rotating (`HB_LOG_MAX_MB`, `HB_LOG_BACKUPS`). Categories: app, db, media, upload, backup, restore,
repair, import, export, ai, startup, admin. Unexpected errors in an API call are logged and returned as a clean JSON error.

## Security
The app has no login (LAN only). Set `HB_ADMIN_TOKEN` in `.env` to put restore, repair, import commit, creating/deleting backups
and media cleanup behind a token (the app asks for it once).

## Tests
`pip install -r requirements-dev.txt && python -m pytest tests` — including a backup → modify → restore smoke test (also in CI).

## External files in the media folder (Samba)

Files you place directly in `media/` (including in subfolders, e.g. via a Samba share) show up in Media management.
Under *Admin → Media* you see them separately ("Externally placed"), with a check for fake extensions. They are **never automatically**
deleted; deleting is only possible deliberately, with the separate button. See also [DEPLOYMENT.en.md](DEPLOYMENT.en.md#5-share-the-media-folder-via-samba-placing-files-from-outside).

## Email notifications

Set in `.env`: `SMTP_HOST`, `SMTP_PORT` (587 STARTTLS or 465 SSL), `SMTP_USER`, `SMTP_PASS` and `HB_EMAIL` (recipient, multiple separated by commas), and restart the container.
Optionally `SMTP_FROM`, `HB_MAIL_DIGEST_TIME`, `HB_MAIL_EXPIRY_DAYS`, `HB_MAIL_ALERTS` (see `.env.example`).

- **Daily digest** (default 08:00): low stock, nearly expired and system notices. An email is only sent if there is something to report.
- **Backup failed**: immediate email after three failed attempts (max. 1 per 12 hours).
- *Admin → Overview* has buttons for a test email and to send the digest right away. Errors are in the log (category `mail`).

The password is only stored in `.env`; the app never displays it.
