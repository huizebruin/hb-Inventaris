# HB Inventaris

Zelf-gehoste inventarisbeheer-app voor elektronica-onderdelen. Flask +
SQLite backend, single-page frontend.

Gemaakt door [huizebruin.nl](https://huizebruin.nl).

<img width="1919" height="908" alt="image" src="https://github.com/user-attachments/assets/fe64ef7e-de9b-4ccc-9041-08463941c275" />

## Let op: alleen voor LAN-gebruik

Deze app heeft **geen authenticatie** — hij is bedoeld om binnen je eigen
netwerk te draaien (bijv. achter een nginx reverse proxy op je NAS), of
lokaal op je eigen pc. Zet hem **niet** direct open op het internet zonder
zelf authenticatie/HTTPS ervoor te regelen.

Er zijn twee manieren om de app te draaien: via **Docker** (aanbevolen voor
een NAS/server), of **direct op Windows** zonder Docker.

---

## Optie A: Draaien via Docker

1. Zorg dat Docker en docker-compose geïnstalleerd zijn.
2. Kopieer `.env.example` naar `.env` en vul eventueel je eigen keys in:
   ```bash
   cp .env.example .env
   ```
   - `GEMINI_API_KEY` / `GEMINI_MODEL` — voor AI-functies (spec lookup,
     categorie-suggesties, duplicate detection, foto-herkenning). Laat leeg
     om deze features uit te schakelen.
   - `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` — voor build-notificaties via
     Telegram. Laat leeg om uit te schakelen.
3. Start de app:
   ```bash
   docker-compose up -d
   ```
4. De app draait intern op poort **5000** (Flask). In `docker-compose.yml`
   wordt dit gemapt naar een poort op je NAS/server via de `ports:`-regel
   (bijv. `5000:5000`). Je bereikt de app dan op
   `http://<NAS-ip-of-hostnaam>:5000`, of via je nginx reverse proxy als je
   die hebt ingesteld.
5. Bij een eerste start wordt een lege database aangemaakt, met een klein
   setje voorbeeldlocaties, categorieën en demo-onderdelen zodat je meteen
   ziet hoe alles werkt.

### Herstarten na wijzigingen

- Alleen code gewijzigd (bijv. `server.py`, `app.html`): `docker restart <containernaam>`
- `.env` gewijzigd (nieuwe API keys etc.): `docker-compose up -d` (niet
  alleen restart, anders worden de nieuwe env vars niet geladen)

---

## Optie B: Draaien op Windows, zonder Docker

De app kan ook los op een Windows-pc draaien, zonder enige technische
voorkennis.

1. **Zet alle bestanden in één map** — `server.py`, de map `static/` (met
   `app.html`, `app.css`, `fonts/`) en `Start HB Inventaris.bat` samen in
   bijvoorbeeld een map op je Bureaublad.
2. **Dubbelklik op `Start HB Inventaris.bat`.** Staat Python nog niet op de
   pc, dan opent automatisch de downloadpagina — installeer die zoals elk
   ander programma (Volgende, Volgende, Voltooien), en zet tijdens de
   installatie het vinkje **"Add python.exe to PATH"** aan.
3. **Dubbelklik daarna nogmaals** op `Start HB Inventaris.bat`. De eerste
   keer installeert het script zelf de benodigde onderdelen (Flask) — dat
   zie je even voorbijkomen, daar hoef je niets voor te doen.
4. **De browser opent vanzelf** met de app erin, na een paar seconden.
5. **Volgende keer:** gewoon opnieuw dubbelklikken op hetzelfde
   bat-bestand. Alles staat al klaar, dus dat gaat meteen snel.

Laat het "HB Inventaris"-venster dat opent gewoon openstaan zolang je de
app gebruikt — sluiten stopt de app.

---

## Data

Alle persoonlijke data (database, foto's, backups) leeft in een map genaamd
`data/` (en `media/`, `backups/`) naast `server.py`, en wordt **niet**
meegeleverd in deze repository. Dit is bewust: je start met een schone
inventaris plus een klein demo-setje.

Bij Docker-gebruik zijn dit gemounte volumes; bij het los draaien op
Windows maakt de app deze mappen gewoon zelf aan naast `server.py`.

## Structuur

- `server.py` — Flask backend + SQLite (WAL mode)
- `static/app.html` — volledige frontend (single-page app)
- `static/app.css` — styling
- `static/fonts/` — lokaal ingebedde fonts (geen CDN-afhankelijkheid, werkt
  offline)
- `docker-compose.yml`, `Dockerfile` — deployment (Docker)
- `Start HB Inventaris.bat` — start-script (Windows, zonder Docker)
- `requirements.txt` — Python-dependencies (`pip install -r requirements.txt`)

## Licentie

MIT-licentie met een attributieverplichting — zie [LICENSE](./LICENSE).
Elke publiek toegankelijke deployment van deze software (gewijzigd of niet)
moet ergens in de app een zichtbare "Made by huizebruin.nl"-vermelding met
link naar https://huizebruin.nl behouden (bijv. op een "Over"-scherm of in
de footer).
