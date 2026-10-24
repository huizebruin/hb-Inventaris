🇳🇱 Nederlands · [🇬🇧 English](DEPLOYMENT.en.md)

# Veilig draaien (secure deployment)

HB Inventaris is gemaakt voor **thuis/LAN**. Standaard heeft de app geen login, en wie de poort kan bereiken kan alles
lezen, wijzigen en verwijderen (inclusief back-ups terugzetten). Zet de app daarom **nooit rechtstreeks op internet**.
Deze pagina laat zien hoe je hem wel veilig bereikbaar maakt.

## Checklist

- [ ] App draait alleen in het LAN, of via een **reverse proxy met HTTPS**.
- [ ] Poort 5000 staat **niet** in de port-forward van je router.
- [ ] Login ingesteld: `HB_AUTH_USER` + `HB_AUTH_PASSWORD` in `.env` (of login via de proxy).
- [ ] `HB_ADMIN_TOKEN` ingesteld als extra bescherming voor restore/repair/import/verwijderen.
- [ ] Achter de proxy: poort alleen op `127.0.0.1` (zie hieronder), zodat niemand om de proxy heen kan.
- [ ] `.env`, `data/`, `media/` en `backups/` staan **niet** in Git of in een publieke share.
- [ ] Back-ups worden ook **buiten** de NAS bewaard (andere schijf of cloud); een back-up op dezelfde schijf is geen back-up.
- [ ] Firewall: alleen 443 (en eventueel 80 voor certificaatverlenging) naar de proxy, de rest dicht.
- [ ] Containers en NAS up-to-date (Watchtower staat al aan voor de app).
- [ ] Gemini-/Telegram-sleutels alleen in `.env`, nooit in de code of in screenshots.

## 1. Login in de app

Zet in `.env`:

```
HB_AUTH_USER=wobbe
HB_AUTH_PASSWORD=een-lang-uniek-wachtwoord
HB_ADMIN_TOKEN=een-ander-lang-geheim
```

De hele app vraagt dan om inloggen (HTTP Basic). `/api/health` blijft open voor de Docker-healthcheck en toont niets
gevoeligs. Na 10 mislukte pogingen binnen 5 minuten wordt dat IP tijdelijk geblokkeerd (HTTP 429) en komt het in het logboek (categorie `auth`).

> HTTP Basic stuurt het wachtwoord bij elk verzoek mee. **Gebruik het dus alleen over HTTPS** (of strikt binnen je LAN).

## 2. HTTPS met een reverse proxy

Laat de proxy het certificaat regelen en de app alleen lokaal bereikbaar zijn. Pas in `docker-compose.yml` de poort aan:

```yaml
    ports:
      - "127.0.0.1:5000:5000"   # alleen de proxy op dezelfde machine kan erbij
```

(Draait de proxy in een ander container/host? Gebruik dan een intern Docker-netwerk of het LAN-IP van de NAS en beperk met de firewall.)

### Caddy (het eenvoudigst, regelt Let's Encrypt zelf)

```
inventaris.example.nl {
    reverse_proxy 127.0.0.1:5000
    request_body { max_size 30MB }
}
```

### nginx

```nginx
server {
    listen 443 ssl http2;
    server_name inventaris.example.nl;

    ssl_certificate     /etc/letsencrypt/live/inventaris.example.nl/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/inventaris.example.nl/privkey.pem;

    client_max_body_size 30m;           # iets boven HB_MAX_UPLOAD_MB

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;        # AI-opzoekingen kunnen even duren
    }
}
server { listen 80; server_name inventaris.example.nl; return 301 https://$host$request_uri; }
```

Op een Synology kan dit via *Configuratiescherm → Aanmeldingsportaal → Geavanceerd → Reverse Proxy* met een
Let's Encrypt-certificaat; stel daar dezelfde headers in.

Met HTTPS zet de app zelf de `Strict-Transport-Security`-header. De camera van de barcodescanner werkt in de browser
**alleen over HTTPS** (of op `localhost`), nog een reden voor een proxy.

### Extra laag: login of VPN vóór de app

Wil je de app van buitenaf gebruiken, kies dan liever een **VPN** (WireGuard, Tailscale) dan een open poort. Een
alternatief is een proxy met eigen login (Authelia, Cloudflare Access, nginx `auth_basic`); dan kun je `HB_AUTH_*` leeg laten of beide gebruiken.

## 3. Firewall

| Wat | Regel |
|---|---|
| Poort 5000 | alleen `127.0.0.1` of LAN, nooit in de router doorsturen |
| Poort 443 | alleen als je de app bewust extern wilt ontsluiten |
| Poort 80 | alleen voor certificaatverlenging / redirect naar 443 |
| Samba (445) | alleen LAN, nooit naar internet |

## 4. Geheimen en bestanden

- `.env` bevat API-sleutels en wachtwoorden: rechten `600`, niet delen, niet committen (staat al in `.gitignore`).
- Roteer sleutels als ze ooit zichtbaar zijn geweest (in een screenshot, issue of chat).
- `data/inventaris.db` en `backups/` bevatten al je gegevens; behandel ze als gevoelig.

## 5. Mediamap delen via Samba (bestanden van buiten plaatsen)

De mediamap mag ook rechtstreeks gevuld worden, bijvoorbeeld door een Samba-share op `./media` te zetten. Bestanden (ook in submappen)
verschijnen direct in het Mediabeheer en zijn aan onderdelen te koppelen.

Veiligheidsregels die de app hanteert:

- alleen toegestane types (afbeeldingen en pdf) worden getoond en geserveerd; andere bestanden worden genegeerd;
- **extern geplaatste bestanden worden nooit automatisch opgeruimd**; verwijderen kan alleen bewust via *Beheer → Media*;
- *Beheer → Media* controleert extern geplaatste bestanden op nep-extensies (bv. een `.png` die geen afbeelding is);
- padtraversal (`..`, absolute paden) is geblokkeerd.

Praktische tips:

- Geef de Samba-gebruiker **schrijfrechten alleen op `media/`**, niet op `data/` of `backups/`.
- Zorg dat bestanden leesbaar zijn voor de container-gebruiker (bijv. `chmod -R a+rX media`).
- Een share met gastschrijfrechten betekent dat iedereen in je LAN bestanden kan plaatsen; gebruik een gebruiker met wachtwoord.

## 6. Na een incident

1. Zet de app uit (`docker compose stop`).
2. Wijzig `HB_AUTH_PASSWORD`, `HB_ADMIN_TOKEN` en de API-sleutels.
3. Controleer het logboek (*Beheer → Logboek*, filter `auth`).
4. Herstel zo nodig een back-up via *Beheer → Back-ups* (met verificatie).
