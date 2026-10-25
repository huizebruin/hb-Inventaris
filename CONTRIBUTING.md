# Bijdragen / Contributing

🇳🇱 Nederlands · 🇬🇧 English (hieronder / below)

## 🇳🇱 Nederlands

Fijn dat je wilt meehelpen! Vragen, ideeën en foutmeldingen zijn ook welkom als [issue](../../issues/new/choose).

### Snel starten

```bash
git clone https://github.com/huizebruin/hb-Inventaris.git
cd hb-Inventaris
pip install -r requirements-dev.txt
python -m pytest        # tests (gebruiken een tijdelijke database, jouw data blijft ongemoeid)
ruff check .            # lint
python server.py        # app op http://localhost:5000 (data komt in ./data, ./media en ./backups)
```

### Werkwijze

1. Maak een branch vanaf `main` en houd een pull request klein en gericht.
2. Voeg tests toe of pas ze aan bij gedragswijzigingen (`tests/`). De CI (tests, lint, Docker-build) moet groen zijn.
3. Schrijf teksten in de app in het **Nederlands** (brontaal) en zet de Engelse vertaling in `static/i18n-en.js`
   (`"Nederlandse tekst": "English text"`, met `{0}`, `{1}` voor variabele delen).
4. Documentatie en changelog bestaan in twee talen: werk zowel `CHANGELOG.md` als `CHANGELOG.en.md` bij (en `README.en.md` / `docs/*.en.md` als je de Nederlandse versie wijzigt).
5. Databasewijzigingen gaan via een migratie in `MIGRATIONS` in `server.py` (idempotent, additief). Zie `docs/ADMIN.md`.
6. Beveiligingsproblemen niet als openbaar issue melden, maar volgens [SECURITY.md](SECURITY.md).

Met een bijdrage ga je akkoord dat die onder de [licentie](LICENSE) van het project valt. Zie ook de [gedragscode](CODE_OF_CONDUCT.md).

## 🇬🇧 English

Thanks for helping out! Questions, ideas and bug reports are welcome as an [issue](../../issues/new/choose) too.

### Quick start

```bash
git clone https://github.com/huizebruin/hb-Inventaris.git
cd hb-Inventaris
pip install -r requirements-dev.txt
python -m pytest        # tests (use a temporary database, your data is left alone)
ruff check .            # lint
python server.py        # app at http://localhost:5000 (data goes to ./data, ./media and ./backups)
```

### Workflow

1. Branch off `main` and keep pull requests small and focused.
2. Add or update tests for behavior changes (`tests/`). CI (tests, lint, Docker build) must be green.
3. Write in-app text in **Dutch** (source language) and add the English translation to `static/i18n-en.js`
   (`"Nederlandse tekst": "English text"`, using `{0}`, `{1}` for variable parts).
4. Docs and changelog exist in two languages: update both `CHANGELOG.md` and `CHANGELOG.en.md` (and `README.en.md` / `docs/*.en.md` when you change the Dutch version).
5. Database changes go through a migration in `MIGRATIONS` in `server.py` (idempotent, additive). See `docs/ADMIN.en.md`.
6. Don't report security problems as public issues; follow [SECURITY.md](SECURITY.md).

By contributing you agree that your work falls under the project's [license](LICENSE). See also the [code of conduct](CODE_OF_CONDUCT.md).
