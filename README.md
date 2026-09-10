# HB Inventaris

Self-hosted inventory management app for electronic components. Flask +
SQLite backend, single-page frontend, runs in Docker.

Made by [huizebruin.nl](https://huizebruin.nl).
<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/fe64ef7e-de9b-4ccc-9041-08463941c275" />


## Note: LAN use only

This app has **no built-in authentication** — it's meant to run within your
own network (e.g. behind an nginx reverse proxy on your NAS). Do **not**
expose it directly to the public internet without adding your own
authentication/HTTPS in front of it.

## Getting started

1. Make sure Docker and docker-compose are installed.
2. Copy `.env.example` to `.env` and fill in your own values if you want to
   use the optional features:
   ```bash
   cp .env.example .env
   ```
   - `GEMINI_API_KEY` / `GEMINI_MODEL` — enables AI features (spec lookup,
     category suggestions, duplicate detection, photo recognition). Leave
     empty to disable these.
   - `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` — enables low-stock
     notifications via Telegram. Leave empty to disable.
3. Start the app:
   ```bash
   docker-compose up -d
   ```
4. The app runs on the port configured in `docker-compose.yml`. On first
   start, an empty database is created automatically, pre-seeded with a
   small set of example locations, categories, and demo parts so you can
   see how everything fits together.

## Restarting after changes

- Code changes only (e.g. `server.py`, `app.html`): `docker restart <container-name>`
- `.env` changes (new API keys, etc.): `docker-compose up -d` (not just a
  restart, otherwise the new env vars won't be picked up)

## Data

All personal data (database, photos, backups) lives in the mounted Docker
volumes (`/app/data`, `/app/media`, `/app/backups`) and is **not** included
in this repository. This is intentional: you start with a clean, empty
inventory plus a small demo dataset.

## Structure

- `server.py` — Flask backend + SQLite (WAL mode)
- `static/app.html` — full frontend (single-page app)
- `static/app.css` — styling
- `static/fonts/` — locally embedded fonts (no CDN dependency, works
  offline)
- `docker-compose.yml`, `Dockerfile` — deployment

## License

MIT License with an attribution requirement — see [LICENSE](./LICENSE).
Any public-facing deployment of this software (modified or not) must keep
a visible "Made by huizebruin.nl" credit with a link to
https://huizebruin.nl somewhere in the app (e.g. an About screen or
footer).
