🇬🇧 English · [🇳🇱 Nederlands](DEPLOYMENT.md)

# Secure deployment

HB Inventaris is built for **home/LAN** use. By default the app has no login, and anyone who can reach the port can
read, modify and delete everything (including restoring backups). So **never expose the app directly to the internet**.
This page shows how to make it reachable safely.

## Checklist

- [ ] The app runs only on the LAN, or behind a **reverse proxy with HTTPS**.
- [ ] Port 5000 is **not** in your router's port forwarding.
- [ ] Login configured: `HB_AUTH_USER` + `HB_AUTH_PASSWORD` in `.env` (or login via the proxy).
- [ ] `HB_ADMIN_TOKEN` set as extra protection for restore/repair/import/delete.
- [ ] Behind the proxy: port only on `127.0.0.1` (see below), so nobody can bypass the proxy.
- [ ] `.env`, `data/`, `media/` and `backups/` are **not** in Git or in a public share.
- [ ] Backups are also kept **outside** the NAS (another disk or cloud); a backup on the same disk is not a backup.
- [ ] Firewall: only 443 (and optionally 80 for certificate renewal) to the proxy, everything else closed.
- [ ] Containers and NAS are up to date (Watchtower is already enabled for the app).
- [ ] Gemini/Telegram keys only in `.env`, never in code or screenshots.

## 1. Login in the app

Set in `.env`:

```
HB_AUTH_USER=wobbe
HB_AUTH_PASSWORD=een-lang-uniek-wachtwoord
HB_ADMIN_TOKEN=een-ander-lang-geheim
```

The whole app then asks for a login (HTTP Basic). `/api/health` stays open for the Docker healthcheck and shows nothing
sensitive. After 10 failed attempts within 5 minutes that IP is temporarily blocked (HTTP 429) and logged (category `auth`).

> HTTP Basic sends the password with every request. **So only use it over HTTPS** (or strictly within your LAN).

## 2. HTTPS with a reverse proxy

Let the proxy handle the certificate and make the app reachable only locally. Adjust the port in `docker-compose.yml`:

```yaml
    ports:
      - "127.0.0.1:5000:5000"   # only the proxy on the same machine can reach it
```

(Is the proxy running in another container/host? Then use an internal Docker network or the NAS's LAN IP and restrict access with the firewall.)

### Caddy (the simplest, handles Let's Encrypt itself)

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

    client_max_body_size 30m;           # slightly above HB_MAX_UPLOAD_MB

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;        # AI lookups can take a while
    }
}
server { listen 80; server_name inventaris.example.nl; return 301 https://$host$request_uri; }
```

On a Synology this can be done via *Control Panel → Login Portal → Advanced → Reverse Proxy* with a
Let's Encrypt certificate; set the same headers there.

With HTTPS the app sets the `Strict-Transport-Security` header itself. The barcode scanner's camera works in the browser
**only over HTTPS** (or on `localhost`), another reason for a proxy.

### Extra layer: login or VPN in front of the app

If you want to use the app from outside, prefer a **VPN** (WireGuard, Tailscale) over an open port. An
alternative is a proxy with its own login (Authelia, Cloudflare Access, nginx `auth_basic`); then you can leave `HB_AUTH_*` empty or use both.

## 3. Firewall

| What | Rule |
|---|---|
| Port 5000 | only `127.0.0.1` or LAN, never forward it in the router |
| Port 443 | only if you deliberately want to expose the app externally |
| Port 80 | only for certificate renewal / redirect to 443 |
| Samba (445) | LAN only, never to the internet |

## 4. Secrets and files

- `.env` contains API keys and passwords: permissions `600`, don't share, don't commit (already in `.gitignore`).
- Rotate keys if they have ever been exposed (in a screenshot, issue or chat).
- `data/inventaris.db` and `backups/` contain all your data; treat them as sensitive.

## 5. Share the media folder via Samba (placing files from outside)

The media folder may also be filled directly, for example by putting a Samba share on `./media`. Files (including in subfolders)
show up immediately in Media management and can be linked to parts.

Safety rules the app applies:

- only allowed types (images and pdf) are shown and served; other files are ignored;
- **externally placed files are never cleaned up automatically**; deleting is only possible deliberately via *Admin → Media*;
- *Admin → Media* checks externally placed files for fake extensions (e.g. a `.png` that is not an image);
- path traversal (`..`, absolute paths) is blocked.

Practical tips:

- Give the Samba user **write access only to `media/`**, not to `data/` or `backups/`.
- Make sure files are readable by the container user (e.g. `chmod -R a+rX media`).
- A share with guest write access means anyone on your LAN can place files; use a user with a password.

## 6. After an incident

1. Shut the app down (`docker compose stop`).
2. Change `HB_AUTH_PASSWORD`, `HB_ADMIN_TOKEN` and the API keys.
3. Check the log (*Admin → Log*, filter `auth`).
4. If necessary, restore a backup via *Admin → Backups* (with verification).
