# HB Inventaris

Zelf-gehoste inventarisbeheer-app voor elektronica-onderdelen. Flask +
SQLite backend, single-page frontend die werkt op pc, tablet en telefoon.

Gemaakt door [huizebruin.nl](https://huizebruin.nl).

<img src="docs/screenshots/hoofdscherm-desktop.png" alt="HB Inventaris op de desktop: onderdelenlijst met snelfilters, voorraad +/- en statusbalk" width="100%">

## Let op: alleen voor LAN-gebruik

Deze app heeft **geen authenticatie** — hij is bedoeld om binnen je eigen
netwerk te draaien (bijv. achter een nginx reverse proxy op je NAS), of
lokaal op je eigen pc. Zet hem **niet** direct open op het internet zonder
zelf authenticatie/HTTPS ervoor te regelen.

Er zijn twee manieren om de app te draaien: via **Docker** (aanbevolen voor
een NAS/server), of **direct op Windows** zonder Docker.

---

## Het hoofdscherm

Het hoofdscherm is bedoeld om rustig te blijven, ook bij een grote
inventaris. Alles wat je dagelijks nodig hebt staat in één oogopslag; de rest
zit één tik verder.

### Lijst met voorraad in de rij

- **Standaard drie kolommen:** naam, locatie en voorraad. Het IPN staat als
  kleine regel onder de naam. Extra kolommen (IPN, categorie, prijs,
  gewijzigd) zet je aan via *Menu → Instellingen → Kolommen instellen*, daar
  vind je ook **Compacte regels** en een knop om de standaardweergave te
  herstellen. Een eerder opgeslagen kolomkeuze blijft gewoon gelden.
- **Voorraad direct aanpassen:** met **−** en **+** in de rij zelf (ook in de
  kaarten op telefoon), of klik op het getal om een exact aantal in te typen.
  Elke wijziging wordt als mutatie in de geschiedenis vastgelegd.
- **Statusbalk onder het getal:** laat zien hoe ver je boven of onder het
  ingestelde minimum zit. Het streepje in het midden is het minimum. Rood is
  onder het minimum, oranje tot 1,5× het minimum, groen daarboven. Onderdelen
  zonder minimum krijgen geen balk.
- **Acties achter ⋯:** vastzetten, link openen, bewerken en verwijderen
  (verwijderen staat apart onderaan, in het rood).

### Snelfilters

Onder de werkbalk staan chips met een teller: **Lage voorraad**, **Leeg**,
**Zonder locatie**, **Vastgezet** en **Verloopt**. Chips combineer je met
elkaar en met de zoekbalk of een categorie; **✕ Wis filters** zet alles terug.
Chips zonder resultaat worden niet getoond, zodat de balk leeg blijft als er
niets aan de hand is.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/filterchips-desktop.png" alt="Snelfilter Lage voorraad actief"></td>
    <td width="50%"><img src="docs/screenshots/rij-acties-desktop.png" alt="Actiemenu achter de drie puntjes in een rij"></td>
  </tr>
  <tr>
    <td align="center"><sub>Filter <b>Lage voorraad</b> actief</sub></td>
    <td align="center"><sub>Acties per rij achter <b>⋯</b></sub></td>
  </tr>
</table>

### Meerdere onderdelen tegelijk

Vink onderdelen aan en er verschijnt een balk met de drie meest gebruikte
acties: **Locatie**, **Categorie** en **Voorraad**. Alles wat minder vaak
nodig is (tags toevoegen/verwijderen, labels printen, archiveren en
verwijderen) zit onder **⋯ Meer**.

<img src="docs/screenshots/bulk-desktop.png" alt="Bulk-balk met Locatie, Categorie, Voorraad en het Meer-menu" width="100%">

## Meldingen en menu

**Meldingen:** de losse badges in de header zijn vervangen door één bel met
een teller. Tik je erop, dan zie je Lage voorraad, Verloopt binnenkort en
Suggesties, elk met een aantal, plus een snelkoppeling om lege vakken te
tonen. Een regel aanklikken zet het bijbehorende filter aan.

**Menu:** alle opties blijven bereikbaar, maar staan nu in inklapbare groepen:
*Beheer*, *Afdrukken & export*, *Gegevens* en *Instellingen* (op telefoon ook
*Overzichten*). Bovenin staat een zoekveld ("export" vindt direct *Exporteren*
en *Excel export*) en het menu onthoudt welke groep je het laatst open had.

<table>
  <tr>
    <td width="50%"><img src="docs/screenshots/meldingen-desktop.png" alt="Meldingen-popover met lage voorraad, verloopt en suggesties"></td>
    <td width="50%"><img src="docs/screenshots/menu-desktop.png" alt="Menu met inklapbare groepen en zoekveld"></td>
  </tr>
  <tr>
    <td align="center"><sub>Meldingen onder de bel</sub></td>
    <td align="center"><sub>Menu met groepen en zoekveld</sub></td>
  </tr>
</table>

## Op telefoon en tablet

De interface past zich aan het scherm aan.

- **Telefoon (tot 640 px):** de lijst wordt een lijst met kaarten met
  **−/+** rechts en de statusbalk eronder. Onderin staat een navigatiebalk
  met *Categorieën*, *Toevoegen*, *Locaties* en *Menu*. Categorieën schuiven
  als paneel uit, het menu opent als blad onderaan, en een onderdeel opent
  schermvullend. Het houdt rekening met de notch en de home-indicator, en
  invoervelden zijn groot genoeg zodat iOS niet inzoomt.
- **Tablet (641–1024 px):** de zijbalk blijft zichtbaar en het detailpaneel
  schuift over de lijst heen in plaats van de tabel samen te drukken.
- **Als app installeren:** open de site in je telefoonbrowser en kies
  *Toevoegen aan beginscherm*. De app opent dan zonder browserbalk. Er is geen
  offline-modus: de app en je inventaris komen altijd van je eigen server,
  dus je hebt verbinding met je netwerk nodig.

<table>
  <tr>
    <td width="33%"><img src="docs/screenshots/hoofdscherm-mobiel.png" alt="Hoofdscherm op telefoon"></td>
    <td width="33%"><img src="docs/screenshots/menu-mobiel.png" alt="Menu als blad onderaan op telefoon"></td>
    <td width="33%"><img src="docs/screenshots/detail-mobiel.png" alt="Onderdeel-detail op telefoon"></td>
  </tr>
  <tr>
    <td align="center"><sub>Lijst</sub></td>
    <td align="center"><sub>Menu</sub></td>
    <td align="center"><sub>Detail</sub></td>
  </tr>
  <tr>
    <td width="33%"><img src="docs/screenshots/filterchips-mobiel.png" alt="Snelfilter actief op telefoon"></td>
    <td width="33%"><img src="docs/screenshots/categorieen-mobiel.png" alt="Categorieën-paneel op telefoon"></td>
    <td width="33%"><img src="docs/screenshots/hoofdscherm-tablet.png" alt="Hoofdscherm op tablet"></td>
  </tr>
  <tr>
    <td align="center"><sub>Snelfilter</sub></td>
    <td align="center"><sub>Categorieën</sub></td>
    <td align="center"><sub>Tablet</sub></td>
  </tr>
</table>

<details>
<summary>Licht thema</summary>

Wisselen tussen donker en licht kan met de zon/maan rechtsboven in de header.
De keuze wordt in je browser onthouden.

<img src="docs/screenshots/licht-thema-desktop.png" alt="Hoofdscherm in het lichte thema" width="100%">

</details>

## Beheer, back-ups en import/export

Onder **Menu → Beheer → Beheer & gezondheid** vind je een dashboard met databasegrootte, schijfruimte, laatste/volgende backup en
integriteitsstatus, een controle met herstelacties, back-ups (met retentie en terugzetten met verificatie), import/export
(CSV, Excel, JSON met voorbeeld vóór het opslaan), media-opruiming en het logboek. Zie [docs/ADMIN.md](docs/ADMIN.md).
Nieuwe optionele instellingen staan in `.env.example`.

## Sneltoetsen

Sneltoetsen werken zolang je niet in een invoerveld typt. Een overzicht vind
je ook in de app onder **?** (*Help & sneltoetsen*).

| Toets | Actie |
| --- | --- |
| `/` | Zoekbalk activeren |
| `N` | Nieuw onderdeel |
| `F2` | Scanner |
| `Z` | Lege vakken tonen/verbergen |
| `R` | Herbestelvoorstel |
| `B` | Bestellijst |
| `D` | Dashboard |
| `E` | Exporteren |
| `H` | Geschiedenis |
| `K` / `M` / `P` / `I` | Kasten / Media / Projecten / Inkooporders |
| `?` | Help |
| `Esc` | Sluiten |

Met een onderdeel geopend: `F` bewerken, `↑` of `+` voorraad +1, `↓` of `-`
voorraad −1, `L` logboek, `C` kopiëren.

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
- `docs/screenshots/` — screenshots voor deze README
- `docker-compose.yml`, `Dockerfile` — deployment (Docker)
- `Start HB Inventaris.bat` — start-script (Windows, zonder Docker)
- `requirements.txt` — Python-dependencies (`pip install -r requirements.txt`)

De screenshots zijn gemaakt met demo-onderdelen; er staat geen echte
inventaris in.

## Licentie

MIT-licentie met een attributieverplichting — zie [LICENSE](./LICENSE).
Elke publiek toegankelijke deployment van deze software (gewijzigd of niet)
moet ergens in de app een zichtbare "Made by huizebruin.nl"-vermelding met
link naar https://huizebruin.nl behouden (bijv. op een "Over"-scherm of in
de footer).
