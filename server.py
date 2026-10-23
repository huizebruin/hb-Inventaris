import csv
import io
import json
import logging
import logging.handlers
import os
import platform
import secrets
import sys
import uuid
import re
import sqlite3
import threading
import time
import shutil
from collections import deque
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from functools import wraps
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory, send_file
from werkzeug.exceptions import HTTPException

APP_VERSION = '1.2.0'
APP_BUILD = os.environ.get('HB_BUILD', 'dev')
START_TIME = time.time()
START_DT = datetime.now(timezone.utc)

# ── LOAD .env ─────────────────────────────────────────────────
# BASE_DIR = map waar server.py in staat. Werkt zowel in Docker (WORKDIR /app)
# als los op Windows/Mac/Linux, zonder aanpassingen.
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.environ.get('HB_DATA_DIR', BASE_DIR / 'data'))
DATA_DIR.mkdir(exist_ok=True, parents=True)

_env_file = DATA_DIR / '.env'
if _env_file.exists():
    for line in _env_file.read_text().splitlines():
        line = line.strip()
        if line and not line.startswith('#') and '=' in line:
            k, v = line.split('=', 1)
            os.environ.setdefault(k.strip(), v.strip())

import urllib.request
import urllib.error

from werkzeug.middleware.proxy_fix import ProxyFix

app = Flask(__name__, static_folder='static')
app.config['JSON_AS_ASCII'] = False

@app.after_request
def set_utf8(r):
    if r.content_type.startswith('text/html'): r.headers['Content-Type'] = 'text/html; charset=utf-8'
    r.headers.setdefault('X-Content-Type-Options', 'nosniff')
    return r

app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# ── PATHS ─────────────────────────────────────────────────────
DB_FILE    = DATA_DIR / 'inventaris.db'
JSON_FILE  = BASE_DIR / 'data.json'
MEDIA_DIR  = Path(os.environ.get('HB_MEDIA_DIR', BASE_DIR / 'media'))
BACKUP_DIR = Path(os.environ.get('HB_BACKUP_DIR', BASE_DIR / 'backups'))
LOG_DIR    = Path(os.environ.get('HB_LOG_DIR', DATA_DIR / 'logs'))
MEDIA_DIR.mkdir(exist_ok=True, parents=True)
BACKUP_DIR.mkdir(exist_ok=True, parents=True)
LOG_DIR.mkdir(exist_ok=True, parents=True)
ALLOWED_EXT = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'}

# ── INSTELLINGEN (allemaal optioneel via .env) ────────────────
def _env_num(name, default, cast=int):
    try: return cast(os.environ.get(name, default))
    except (TypeError, ValueError): return cast(default)

BACKUP_RETENTION_DAYS = _env_num('HB_BACKUP_RETENTION_DAYS', 14)   # backups ouder dan dit worden opgeruimd
BACKUP_KEEP_MIN       = _env_num('HB_BACKUP_KEEP_MIN', 3)          # minimaal zoveel (geldige) backups blijven altijd staan
BACKUP_TIME           = os.environ.get('HB_BACKUP_TIME', '00:00')  # dagelijks tijdstip (HH:MM, lokale tijd)
BACKUP_STALE_HOURS    = _env_num('HB_BACKUP_STALE_HOURS', 36)      # backup ouder dan dit = "niet actueel"
DISK_WARN_PCT         = _env_num('HB_DISK_WARN_PCT', 85)
DISK_CRIT_PCT         = _env_num('HB_DISK_CRIT_PCT', 95)
DISK_WARN_FREE_MB     = _env_num('HB_DISK_WARN_FREE_MB', 500)
MAX_UPLOAD_MB         = _env_num('HB_MAX_UPLOAD_MB', 25)           # per bestand
MEDIA_MAX_MB          = _env_num('HB_MEDIA_MAX_MB', 0)             # totaal mediamap, 0 = onbeperkt
MAX_IMPORT_MB         = _env_num('HB_MAX_IMPORT_MB', 10)
MAX_IMPORT_ROWS       = _env_num('HB_MAX_IMPORT_ROWS', 20000)
ORPHAN_GRACE_MIN      = _env_num('HB_ORPHAN_GRACE_MIN', 60)        # net geüploade bestanden worden niet als "ongebruikt" opgeruimd
LOG_MAX_MB            = _env_num('HB_LOG_MAX_MB', 2, float)
LOG_BACKUPS           = _env_num('HB_LOG_BACKUPS', 5)
ADMIN_TOKEN           = os.environ.get('HB_ADMIN_TOKEN', '')       # optioneel: beveiligt beheer-acties

app.config['MAX_CONTENT_LENGTH'] = max(MAX_UPLOAD_MB, MAX_IMPORT_MB) * 1024 * 1024 + 1024 * 1024

# ── LOGGING ───────────────────────────────────────────────────
# Eén logbestand met rotatie (HB_LOG_MAX_MB / HB_LOG_BACKUPS). Regels:
#   2026-10-23 12:00:00 | WARNING | upload | bericht
LOG_FILE = LOG_DIR / 'inventaris.log'
logger = logging.getLogger('hb')
logger.setLevel(logging.INFO)
logger.propagate = False
for _h in list(logger.handlers):
    logger.removeHandler(_h)
    try: _h.close()
    except Exception: pass
_fmt = logging.Formatter('%(asctime)s | %(levelname)s | %(message)s', '%Y-%m-%d %H:%M:%S')
try:
    _fh = logging.handlers.RotatingFileHandler(LOG_FILE, maxBytes=int(LOG_MAX_MB * 1024 * 1024),
                                               backupCount=LOG_BACKUPS, encoding='utf-8')
    _fh.setFormatter(_fmt); logger.addHandler(_fh)
except Exception as _e:   # logbestand niet beschrijfbaar: val terug op alleen console
    print(f'[log] Kan logbestand niet openen: {_e}')
_sh = logging.StreamHandler(sys.stdout); _sh.setFormatter(_fmt); logger.addHandler(_sh)

RECENT_EVENTS = deque(maxlen=200)   # WARNING/ERROR in geheugen, voor de snelle samenvatting in beheer

def log_event(category, level, msg, **ctx):
    """Logt een gebeurtenis als 'categorie | bericht'. level: info|warning|error."""
    if ctx:
        try: msg = f'{msg} {json.dumps(ctx, ensure_ascii=False, default=str)}'
        except Exception: pass
    msg = str(msg).replace('\r', ' ').replace('\n', ' ⏎ ')
    lvl = {'info': logging.INFO, 'warning': logging.WARNING, 'error': logging.ERROR}.get(level, logging.INFO)
    try: logger.log(lvl, f'{category} | {msg}')
    except Exception: pass
    if lvl >= logging.WARNING:
        RECENT_EVENTS.append({'ts': datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'level': level.upper(),
                              'category': category, 'message': msg})

def client_ip():
    return request.remote_addr or '?' if request else '?'

@app.errorhandler(413)
def too_large(e):
    log_event('upload', 'warning', f'Request te groot afgewezen (limiet {MAX_UPLOAD_MB} MB)', ip=client_ip())
    return jsonify({'error': f'Bestand te groot (maximaal {MAX_UPLOAD_MB} MB)'}), 413

@app.errorhandler(Exception)
def unhandled_error(e):
    """Geen stille fouten: alles wat onverwacht misgaat komt in het logboek en wordt netjes als JSON teruggegeven."""
    if isinstance(e, HTTPException):
        return e
    log_event('app', 'error', f'{request.method} {request.path}: {type(e).__name__}: {e}')
    if request.path.startswith('/api/'):
        return jsonify({'error': 'Interne fout — zie het logboek in Beheer'}), 500
    return 'Interne fout', 500

def admin_required(fn):
    """Optionele beveiliging van beheer-acties: zet HB_ADMIN_TOKEN in .env om een token te eisen
    (header X-Admin-Token). Zonder token in .env werkt alles zoals voorheen (LAN-gebruik)."""
    @wraps(fn)
    def wrapper(*a, **kw):
        if ADMIN_TOKEN:
            sent = request.headers.get('X-Admin-Token', '')
            if not secrets.compare_digest(sent.encode(), ADMIN_TOKEN.encode()):
                log_event('admin', 'warning', f'Beheer-actie geweigerd (token ontbreekt/onjuist): {request.method} {request.path}', ip=client_ip())
                return jsonify({'error': 'Beheer-token vereist', 'code': 'admin_token'}), 401
        return fn(*a, **kw)
    return wrapper

# ── AI LOOKUP (Gemini) ───────────────────────────────────────────
# Zet GEMINI_API_KEY=... in data/.env om deze functie te activeren.
# Optioneel: GEMINI_MODEL=... (standaard gemini-2.5-flash)
GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
GEMINI_MODEL   = os.environ.get('GEMINI_MODEL', 'gemini-3.5-flash')

# ── TELEGRAM (optioneel server-side, i.p.v. per-browser instellen) ──
# Zet TELEGRAM_BOT_TOKEN=... en TELEGRAM_CHAT_ID=... in je .env om dit
# voor alle browsers/apparaten in één keer in te stellen.
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_CHAT_ID   = os.environ.get('TELEGRAM_CHAT_ID', '')

# ── DATABASE ──────────────────────────────────────────────────
def get_db():
    db = sqlite3.connect(str(DB_FILE))
    db.row_factory = sqlite3.Row
    db.execute('PRAGMA journal_mode=WAL')
    db.execute('PRAGMA foreign_keys=ON')
    return db

@contextmanager
def db_conn():
    db = get_db()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    with db_conn() as db:
        db.executescript('''
            CREATE TABLE IF NOT EXISTS parts (
                id        INTEGER PRIMARY KEY,
                name      TEXT NOT NULL,
                desc      TEXT DEFAULT '',
                IPN       TEXT DEFAULT '',
                link      TEXT DEFAULT '',
                stock     INTEGER DEFAULT 0,
                minStock  INTEGER DEFAULT 0,
                catId     INTEGER,
                locId     INTEGER,
                img       TEXT DEFAULT '',
                active    INTEGER DEFAULT 1,
                notes     TEXT DEFAULT '',
                docs      TEXT DEFAULT '[]',
                suppliers TEXT DEFAULT '[]',
                extraLocs TEXT DEFAULT '[]',
                related   TEXT DEFAULT '[]',
                tags      TEXT DEFAULT '[]'
            );
            CREATE TABLE IF NOT EXISTS history (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                ts         TEXT NOT NULL,
                partId     INTEGER,
                partName   TEXT,
                fromStock  INTEGER,
                toStock    INTEGER,
                delta      INTEGER,
                note       TEXT DEFAULT '',
                price_paid REAL DEFAULT NULL,
                suppId     INTEGER DEFAULT NULL
            );
            CREATE TABLE IF NOT EXISTS custom_locs (
                id   TEXT PRIMARY KEY,
                name TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS suppliers (
                id    INTEGER PRIMARY KEY,
                name  TEXT NOT NULL,
                url   TEXT DEFAULT '',
                color TEXT DEFAULT '#888888'
            );
            CREATE TABLE IF NOT EXISTS projects (
                id      INTEGER PRIMARY KEY,
                name    TEXT NOT NULL,
                desc    TEXT DEFAULT '',
                status  TEXT DEFAULT 'actief',
                items         TEXT DEFAULT '[]',
                buildHistory  TEXT DEFAULT '[]',
                extra         TEXT DEFAULT '{}',
                created       TEXT
            );
            CREATE TABLE IF NOT EXISTS orders (
                id           INTEGER PRIMARY KEY,
                suppId       INTEGER,
                status       TEXT DEFAULT 'besteld',
                orderDate    TEXT,
                expectedDate TEXT DEFAULT '',
                receivedDate TEXT DEFAULT '',
                reference    TEXT DEFAULT '',
                notes        TEXT DEFAULT '',
                items        TEXT DEFAULT '[]'
            );
            CREATE TABLE IF NOT EXISTS meta (
                key   TEXT PRIMARY KEY,
                value TEXT
            );
            INSERT OR IGNORE INTO meta VALUES ('nextLocId', '300');
            INSERT OR IGNORE INTO meta VALUES ('nextId', '1');
            INSERT OR IGNORE INTO meta VALUES ('nextSuppId', '10');
            INSERT OR IGNORE INTO meta VALUES ('nextProjectId', '1');
            INSERT OR IGNORE INTO meta VALUES ('nextOrderId', '1');
            CREATE TABLE IF NOT EXISTS categories (
                id     INTEGER PRIMARY KEY,
                name   TEXT NOT NULL,
                parent INTEGER DEFAULT NULL,
                icon   TEXT DEFAULT '',
                sort   INTEGER DEFAULT 0
            );
        ''')
        # Seed default locations: INSERT OR IGNORE bewaart bestaande custom locs
        try:
            _locs = [('1', 'Lade 1'), ('2', 'Doos A'), ('3', 'Werkplek')]
            db.executemany('INSERT OR IGNORE INTO custom_locs (id, name) VALUES (?, ?)', _locs)
            print(f'[init_db] Locaties geseed')
        except Exception as e:
            print(f'[init_db] Seed fout: {e}')
        # Seed categories (INSERT OR IGNORE)
        try:
            db.execute('''CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY, name TEXT NOT NULL,
                parent INTEGER DEFAULT NULL, icon TEXT DEFAULT '', sort INTEGER DEFAULT 0)''')
            _cats = [(201, 'Passieve componenten', None, '🔌', 0), (202, 'Weerstanden (THT)', 201, '', 0), (203, 'Weerstanden (SMD)', 201, '', 1), (204, 'Condensatoren - Keramisch', 201, '', 2), (205, 'Condensatoren - Elektrolytisch', 201, '', 3), (206, 'Condensatoren - Overig', 201, '', 4), (207, 'Spoelen & Ferrieten', 201, '', 5), (208, 'Kristallen & Oscillatoren', 201, '', 6), (210, 'Actieve componenten', None, '⚡', 1), (211, 'Diodes (algemeen)', 210, '', 0), (212, 'Zener diodes', 210, '', 1), (213, 'Transistoren NPN/PNP', 210, '', 2), (214, 'MOSFETs', 210, '', 3), (215, 'Voltage regulators', 210, '', 4), (216, 'Bridge rectifiers', 210, '', 5), (220, "IC's & Modules", None, '💡', 2), (221, 'Microcontrollers', 220, '', 0), (222, 'ESP8266 / ESP32', 220, '', 1), (223, 'Raspberry Pi', 220, '', 2), (224, 'Drivers & Logic', 220, '', 3), (225, 'Displays (LCD/OLED)', 220, '', 4), (226, 'Audio modules', 220, '', 5), (227, 'Relais & Schakelaars', 220, '', 6), (228, 'Sensoren modules', 220, '', 7), (230, 'Communicatie', None, '📡', 3), (231, 'WiFi modules', 230, '', 0), (232, 'Ethernet / RJ45', 230, '', 1), (233, 'RS485 / UART', 230, '', 2), (234, 'RF & LoRa', 230, '', 3), (235, 'Bluetooth / Zigbee', 230, '', 4), (236, 'USB Interfaces', 230, '', 5), (240, 'Connectors & Kabels', None, '🔌', 4), (241, 'Header pins (male/female)', 240, '', 0), (242, 'Schroefklemmen', 240, '', 1), (243, 'Banana plugs', 240, '', 2), (244, 'DC power jacks', 240, '', 3), (245, 'USB connectors', 240, '', 4), (246, 'JST / RJ45', 240, '', 5), (250, 'Sensoren', None, '📡', 5), (251, 'Temperatuur / Vochtigheid', 250, '', 0), (252, 'Afstand / Beweging', 250, '', 1), (253, 'Gas / Vloeistof', 250, '', 2), (254, 'Stroom / Spanning', 250, '', 3), (255, 'Licht / IR', 250, '', 4), (256, 'Overige sensoren', 250, '', 5), (260, 'Gereedschap', None, '🛠️', 6), (261, 'Handgereedschap', 260, '', 0), (262, 'Meetapparatuur', 260, '', 1), (263, '3D-printer gereedschap', 260, '', 2), (264, 'Reinigingsmiddelen', 260, '', 3), (265, 'Testapparatuur', 260, '', 4), (270, 'Verbruiksartikelen', None, '📦', 7), (271, 'Soldeertin & Flux', 270, '', 0), (272, 'Bevestigingsmateriaal', 270, '', 1), (273, 'Verpakkingsmateriaal', 270, '', 2), (274, 'Labels & Tape', 270, '', 3), (275, 'ESD zakken', 270, '', 4), (280, '3D Printing', None, '🖨️', 8), (281, 'Filament - PLA', 280, '', 0), (282, 'Filament - Overig', 280, '', 1), (283, '3D-printer onderdelen', 280, '', 2), (290, "Producten & PCB's", None, '🧩', 9), (293, "PCB's (inkoop)", 290, '', 0), (294, 'Prototype builds', 290, '', 1), (295, 'Eindproducten', 290, '', 2), (300, 'Overige', None, '🗃️', 10), (301, 'Tablets & Apparaten', 300, '', 0), (302, 'Reserveonderdelen', 300, '', 1), (303, 'Diverse', 300, '', 2), (304, 'Uurloon', 300, '', 3)]
            db.executemany(
                'INSERT OR IGNORE INTO categories (id, name, parent, icon, sort) VALUES (?, ?, ?, ?, ?)',
                _cats
            )
        except Exception as e:
            print(f'[init_db] Cat seed fout: {e}')
        # Demo materiaal: alleen bij een volledig lege database (nooit bij bestaande data)
        try:
            part_count = db.execute('SELECT COUNT(*) c FROM parts').fetchone()['c']
            if part_count == 0:
                db.execute(
                    "INSERT OR IGNORE INTO suppliers (id, name, url, color) VALUES "
                    "(1, 'Voorbeeld Leverancier', 'https://www.example.com', '#4f8ff7')"
                )
                db.executemany(
                    '''INSERT INTO parts (id, name, desc, IPN, stock, minStock, catId, locId, suppliers)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                    [
                        (1, 'Weerstand 220Ω', 'THT weerstand, 0.25W, 5%', 'DEMO-001', 50, 10, 202, 1, '[]'),
                        (2, 'ESP32 DevKit', 'WiFi/BT microcontroller devboard', 'DEMO-002', 3, 1, 222, 2, '[]'),
                        (3, 'Soldeertin 0.8mm', 'Loodvrij soldeertin, 100g rol', 'DEMO-003', 2, 1, 271, 3, '[]'),
                    ]
                )
                set_meta(db, 'nextId', 4)
                print('[init_db] Demo materiaal geseed')
        except Exception as e:
            print(f'[init_db] Demo seed fout: {e}')
    run_migrations()

# ── SCHEMA-VERSIES & MIGRATIES ────────────────────────────────
# De versie staat in meta('schemaVersion'). Een nieuwe databasewijziging = een nieuwe
# functie hieronder + toevoegen aan MIGRATIONS. Migraties moeten idempotent zijn
# (veilig om twee keer uit te voeren) en draaien in volgorde. Vóór het uitvoeren van
# openstaande migraties op een bestaande database wordt automatisch een backup gemaakt.
REQUIRED_TABLES = ['parts', 'history', 'custom_locs', 'suppliers', 'projects', 'orders', 'meta', 'categories']
REQUIRED_META   = ['nextId', 'nextLocId', 'nextSuppId', 'nextProjectId', 'nextOrderId']

def _has_column(db, table, col):
    return any(r[1] == col for r in db.execute(f'PRAGMA table_info({table})').fetchall())

def _add_column(db, table, col, ddl):
    if not _has_column(db, table, col):
        db.execute(f'ALTER TABLE {table} ADD COLUMN {col} {ddl}')

def _migrate_1_baseline(db):
    """Kolommen die in oudere versies later zijn toegevoegd (voorheen losse try/except-blokken)."""
    _add_column(db, 'projects', 'buildHistory', "TEXT DEFAULT '[]'")
    _add_column(db, 'projects', 'extra', "TEXT DEFAULT '{}'")
    _add_column(db, 'history', 'price_paid', 'REAL DEFAULT NULL')
    _add_column(db, 'history', 'suppId', 'INTEGER DEFAULT NULL')

def _migrate_2_indexes(db):
    """Indexen zodat filteren/opzoeken snel blijft bij grote inventarissen."""
    db.execute('CREATE INDEX IF NOT EXISTS idx_parts_cat  ON parts(catId)')
    db.execute('CREATE INDEX IF NOT EXISTS idx_parts_loc  ON parts(locId)')
    db.execute('CREATE INDEX IF NOT EXISTS idx_parts_ipn  ON parts(IPN)')
    db.execute('CREATE INDEX IF NOT EXISTS idx_history_part ON history(partId)')

def _migrate_3_expiry(db):
    """De frontend stuurt expiryDate al mee, maar de server sloeg het nog niet op."""
    _add_column(db, 'parts', 'expiryDate', "TEXT DEFAULT ''")

MIGRATIONS = [
    (1, 'Basiskolommen (projects.buildHistory/extra, history.price_paid/suppId)', _migrate_1_baseline),
    (2, 'Indexen op parts en history', _migrate_2_indexes),
    (3, 'parts.expiryDate (verloopdatum wordt nu echt opgeslagen)', _migrate_3_expiry),
]
SCHEMA_VERSION = MIGRATIONS[-1][0]

def get_schema_version(db=None):
    def _q(d):
        try:
            row = d.execute("SELECT value FROM meta WHERE key='schemaVersion'").fetchone()
            return int(row[0]) if row else 0
        except Exception:
            return 0
    if db is not None: return _q(db)
    with db_conn() as d: return _q(d)

def run_migrations():
    """Voert openstaande migraties uit. Crasht nooit het opstarten: fouten worden gelogd."""
    try:
        cur = get_schema_version()
        pending = [m for m in MIGRATIONS if m[0] > cur]
        if not pending: return
        with db_conn() as db:
            has_data = (db.execute('SELECT COUNT(*) FROM parts').fetchone()[0] or 0) > 0
        if cur > 0 or has_data:
            try: do_backup(tag='pre-migratie')
            except Exception as e: log_event('db', 'warning', f'Pre-migratie backup mislukt: {e}')
        for ver, desc, fn in pending:
            with db_conn() as db:
                fn(db)
                set_meta(db, 'schemaVersion', ver)
            log_event('db', 'info', f'Migratie {ver} toegepast: {desc}')
    except Exception as e:
        log_event('db', 'error', f'Migratie mislukt, database blijft op huidige versie: {e}')

def get_meta(key, default='1'):
    with db_conn() as db:
        row = db.execute('SELECT value FROM meta WHERE key=?', (key,)).fetchone()
        return int(row['value']) if row else int(default)

def set_meta(db, key, value):
    db.execute('INSERT OR REPLACE INTO meta VALUES (?,?)', (key, str(value)))

_WARNED_JSON = set()
def _jlist(raw, row_id=None, field=''):
    """Leest een JSON-lijst uit de database. Kapotte of verkeerd getypeerde data geeft een lege lijst
    (en één logregel), zodat één beschadigd record niet de hele inventaris onbruikbaar maakt."""
    if raw is None or raw == '': return []
    try:
        v = json.loads(raw)
        if isinstance(v, list): return v
        problem = 'is geen lijst'
    except (ValueError, TypeError):
        problem = 'is geen geldige JSON'
    key = (row_id, field)
    if key not in _WARNED_JSON and len(_WARNED_JSON) < 500:
        _WARNED_JSON.add(key)
        log_event('db', 'warning', f'Onderdeel {row_id}: veld {field} {problem}, leeg getoond (repareren via Beheer)')
    return []

def part_to_dict(row):
    rid = row['id']
    return {
        'id': rid, 'name': row['name'], 'desc': row['desc'] or '',
        'IPN': row['IPN'] or '', 'link': row['link'] or '',
        'stock': row['stock'] or 0, 'minStock': row['minStock'] or 0,
        'catId': row['catId'], 'locId': row['locId'],
        'img': row['img'] or '', 'active': bool(row['active']),
        'notes': row['notes'] or '',
        'docs': _jlist(row['docs'], rid, 'docs'),
        'suppliers': _jlist(row['suppliers'], rid, 'suppliers'),
        'extraLocs': _jlist(row['extraLocs'], rid, 'extraLocs'),
        'related': _jlist(row['related'], rid, 'related'),
        'tags': _jlist(row['tags'], rid, 'tags'),
        'expiryDate': (row['expiryDate'] if 'expiryDate' in row.keys() else '') or '',
    }

# ── MIGRATE FROM JSON ─────────────────────────────────────────
def migrate_from_json():
    try:
        data = json.loads(JSON_FILE.read_text('utf-8'))
    except Exception as e:
        print(f'[migrate] Kan JSON niet lezen: {e}')
        return
    print('[migrate] Migreren van data.json naar SQLite...')
    with db_conn() as db:
        for p in data.get('parts', []):
            db.execute('''INSERT OR REPLACE INTO parts
                (id,name,desc,IPN,link,stock,minStock,catId,locId,img,active,notes,docs,suppliers,extraLocs,related,tags)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', (
                p['id'], p.get('name',''), p.get('desc',''), p.get('IPN',''), p.get('link',''),
                p.get('stock',0), p.get('minStock',0), p.get('catId'), p.get('locId'), p.get('img',''),
                1 if p.get('active', True) else 0, p.get('notes',''),
                json.dumps(p.get('docs',[])), json.dumps(p.get('suppliers',[])),
                json.dumps(p.get('extraLocs',[])), json.dumps(p.get('related',[])), json.dumps(p.get('tags',[]))
            ))
        max_id = db.execute('SELECT MAX(id) as m FROM parts').fetchone()['m'] or 0
        set_meta(db, 'nextId', max_id + 1)
        for h in data.get('history', []):
            db.execute('INSERT INTO history (ts,partId,partName,fromStock,toStock,delta,note) VALUES (?,?,?,?,?,?,?)',
                (h.get('ts',''), h.get('partId'), h.get('partName',''),
                 h.get('from',0), h.get('to',0), h.get('delta',0), h.get('note','')))
        for lid, name in data.get('customLocs', {}).items():
            db.execute('INSERT OR REPLACE INTO custom_locs VALUES (?,?)', (str(lid), name))
        next_loc = max((int(k) for k in data.get('customLocs', {}).keys() if k.isdigit()), default=299) + 1
        set_meta(db, 'nextLocId', max(next_loc, 300))
        for s in data.get('suppliers', []):
            db.execute('INSERT OR REPLACE INTO suppliers VALUES (?,?,?,?)',
                (s['id'], s['name'], s.get('url',''), s.get('color','#888888')))
        set_meta(db, 'nextSuppId', data.get('nextSuppId', 10))
        for p in data.get('projects', []):
            db.execute('INSERT OR REPLACE INTO projects VALUES (?,?,?,?,?,?)',
                (p['id'], p['name'], p.get('desc',''), p.get('status','actief'),
                 json.dumps(p.get('items',[])), p.get('created','')))
        set_meta(db, 'nextProjectId', data.get('nextProjectId', 1))
        for o in data.get('orders', []):
            db.execute('INSERT OR REPLACE INTO orders VALUES (?,?,?,?,?,?,?,?,?)',
                (o['id'], o.get('suppId'), o.get('status','besteld'), o.get('orderDate',''),
                 o.get('expectedDate',''), o.get('receivedDate',''), o.get('reference',''),
                 o.get('notes',''), json.dumps(o.get('items',[]))))
        set_meta(db, 'nextOrderId', data.get('nextOrderId', 1))
    backup = JSON_FILE.parent / 'data.json.migrated'
    JSON_FILE.rename(backup)
    print(f'[migrate] Klaar! {len(data.get("parts",[]))} onderdelen gemigreerd. JSON hernoemd naar {backup.name}')


# ── STATIC ────────────────────────────────────────────────────
@app.route('/')
def index(): return send_file('static/app.html')

@app.route('/manifest.json')
def manifest(): return send_file('static/manifest.json', mimetype='application/manifest+json')

@app.route('/sw.js')
def service_worker(): return send_file('static/sw.js', mimetype='application/javascript')

@app.route('/favicon.ico')
def favicon(): return send_file('static/favicon.ico', mimetype='image/x-icon')

@app.route('/favicon-32.png')
def favicon32(): return send_file('static/favicon-32.png', mimetype='image/png')

@app.route('/favicon-16.png')
def favicon16(): return send_file('static/favicon-16.png', mimetype='image/png')

@app.route('/icon-192.png')
def icon192(): return send_file('static/icon-192.png', mimetype='image/png')

@app.route('/icon-512.png')
def icon512(): return send_file('static/icon-512.png', mimetype='image/png')

@app.route('/app.css')
def appcss(): return send_file('static/app.css', mimetype='text/css; charset=utf-8')

@app.route('/app.js')
def appjs(): return send_file('static/app.js', mimetype='text/javascript')

@app.route('/fonts/<path:filename>')
def fonts(filename): return send_from_directory('static/fonts', filename)

@app.route('/media/<path:filename>')
def media(filename): return send_from_directory(MEDIA_DIR, filename)

# ── API: DATA (legacy voor frontend) ─────────────────────────
@app.route('/api/data')
def get_data():
    with db_conn() as db:
        parts = [part_to_dict(r) for r in db.execute('SELECT * FROM parts').fetchall()]
        history = [{'ts':r['ts'],'partId':r['partId'],'partName':r['partName'],
                    'from':r['fromStock'],'to':r['toStock'],'delta':r['delta'],'note':r['note'] or ''}
                   for r in db.execute('SELECT * FROM history ORDER BY ts DESC LIMIT 500').fetchall()]
        custom_locs = {str(r['id']): r['name']
                       for r in db.execute('SELECT * FROM custom_locs').fetchall()}
    return jsonify({'parts':parts,'history':history,'customLocs':custom_locs})

# ── API: PARTS ────────────────────────────────────────────────
@app.route('/api/parts', methods=['GET'])
def get_parts():
    with db_conn() as db:
        return jsonify([part_to_dict(r) for r in db.execute('SELECT * FROM parts').fetchall()])

@app.route('/api/parts', methods=['POST'])
def add_part():
    p = request.get_json()
    with db_conn() as db:
        nid = get_meta('nextId', '1')
        db.execute('''INSERT INTO parts (id,name,desc,IPN,link,stock,minStock,catId,locId,img,active,notes,docs,suppliers,extraLocs,related,tags,expiryDate)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', (
            nid, p.get('name',''), p.get('desc',''), p.get('IPN',''), p.get('link',''),
            p.get('stock',0), p.get('minStock',0), p.get('catId'), p.get('locId'), p.get('img',''),
            1 if p.get('active',True) else 0, p.get('notes',''),
            json.dumps(p.get('docs',[])), json.dumps(p.get('suppliers',[])),
            json.dumps(p.get('extraLocs',[])), json.dumps(p.get('related',[])), json.dumps(p.get('tags',[])),
            p.get('expiryDate','') or ''
        ))
        set_meta(db, 'nextId', nid + 1)
        return jsonify(part_to_dict(db.execute('SELECT * FROM parts WHERE id=?',(nid,)).fetchone())), 201

@app.route('/api/parts/<int:pid>', methods=['PUT'])
def update_part(pid):
    p = request.get_json()
    with db_conn() as db:
        row = db.execute('SELECT * FROM parts WHERE id=?',(pid,)).fetchone()
        if not row: return jsonify({'error':'not found'}), 404
        db.execute('''UPDATE parts SET name=?,desc=?,IPN=?,link=?,stock=?,minStock=?,catId=?,locId=?,
            img=?,active=?,notes=?,docs=?,suppliers=?,extraLocs=?,related=?,tags=?,expiryDate=? WHERE id=?''', (
            p.get('name',row['name']), p.get('desc',row['desc']), p.get('IPN',row['IPN']),
            p.get('link',row['link']), p.get('stock',row['stock']), p.get('minStock',row['minStock']),
            p.get('catId',row['catId']), p.get('locId',row['locId']), p.get('img',row['img']),
            1 if p.get('active',bool(row['active'])) else 0, p.get('notes',row['notes']),
            json.dumps(p.get('docs',_jlist(row['docs'], pid, 'docs'))),
            json.dumps(p.get('suppliers',_jlist(row['suppliers'], pid, 'suppliers'))),
            json.dumps(p.get('extraLocs',_jlist(row['extraLocs'], pid, 'extraLocs'))),
            json.dumps(p.get('related',_jlist(row['related'], pid, 'related'))),
            json.dumps(p.get('tags',_jlist(row['tags'], pid, 'tags'))),
            p.get('expiryDate', row['expiryDate'] if 'expiryDate' in row.keys() else '') or '', pid
        ))
        return jsonify(part_to_dict(db.execute('SELECT * FROM parts WHERE id=?',(pid,)).fetchone()))

@app.route('/api/parts/<int:pid>', methods=['DELETE'])
def delete_part(pid):
    with db_conn() as db:
        row = db.execute('SELECT * FROM parts WHERE id=?',(pid,)).fetchone()
        if not row: return jsonify({'error':'not found'}), 404
        db.execute('DELETE FROM parts WHERE id=?',(pid,))
        # Foto alleen weghalen als geen enkel ander onderdeel er nog naar verwijst
        img_name = _media_name(row['img'])
        if img_name and not any(r[0] == img_name for r in media_refs(db)):
            try: (MEDIA_DIR / img_name).unlink(missing_ok=True)
            except OSError as e: log_event('media', 'warning', f'Foto van verwijderd onderdeel niet weg te halen: {img_name}: {e}')
        return jsonify({'ok':True})

@app.route('/api/parts/<int:pid>/stock', methods=['PATCH'])
def patch_stock(pid):
    with db_conn() as db:
        row = db.execute('SELECT * FROM parts WHERE id=?',(pid,)).fetchone()
        if not row: return jsonify({'error':'not found'}), 404
        body = request.get_json()
        old = int(row['stock'] or 0)
        if 'set' in body: new = max(0, int(body['set']))
        elif 'delta' in body: new = max(0, old + int(body['delta']))
        else: return jsonify({'error':'set or delta required'}), 400
        price_paid = body.get('price_paid')   # prijs per stuk op moment van inkoop
        supp_id    = body.get('suppId')       # welke leverancier
        db.execute('UPDATE parts SET stock=? WHERE id=?',(new,pid))
        db.execute('INSERT INTO history (ts,partId,partName,fromStock,toStock,delta,note,price_paid,suppId) VALUES (?,?,?,?,?,?,?,?,?)',
            (datetime.now(timezone.utc).isoformat(), pid, row['name'], old, new, new-old,
             body.get('note',''), price_paid, supp_id))
        return jsonify({'stock':new})

@app.route('/api/parts/migrate', methods=['POST'])
def migrate_parts():
    body = request.get_json()
    with db_conn() as db:
        for p in body.get('parts',[]):
            db.execute('UPDATE parts SET catId=? WHERE id=?',(p.get('catId'),p['id']))
    return jsonify({'ok':True})

# ── API: AI LOOKUP (Gemini) ──────────────────────────────────────
def _call_gemini(prompt, max_tokens=2000, thinking_level='low', image_b64=None, image_mime=None):
    """Roept Gemini generateContent aan en parsed het JSON-antwoord.
    Retourneert (parsed_dict, None) bij succes, of (None, (error_dict, status_code)) bij fout.
    Geef image_b64/image_mime mee voor een multimodale (foto) aanvraag."""
    if not GEMINI_API_KEY:
        return None, ({'error': 'Geen GEMINI_API_KEY ingesteld in data/.env'}, 400)

    content_parts = []
    if image_b64:
        content_parts.append({'inline_data': {'mime_type': image_mime or 'image/jpeg', 'data': image_b64}})
    content_parts.append({'text': prompt})

    req_body = json.dumps({
        'contents': [{'role': 'user', 'parts': content_parts}],
        'generationConfig': {
            'temperature': 0.1,
            'maxOutputTokens': max_tokens,
            'thinkingConfig': {'thinkingLevel': thinking_level}
        }
    }).encode('utf-8')

    url = f'https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent?key={GEMINI_API_KEY}'
    req = urllib.request.Request(url, data=req_body, headers={'Content-Type': 'application/json'}, method='POST')

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        detail = e.read().decode('utf-8', 'ignore')[:500]
        if e.code == 429:
            if 'PerDay' in detail or 'RPD' in detail or 'per day' in detail.lower():
                msg = 'Dagelijkse gratis limiet van Gemini bereikt. Probeer het morgen opnieuw, of zet billing aan op je Google AI Studio-project om deze limiet te verhogen.'
            else:
                msg = 'Gemini-limiet (rate limit) even bereikt. Wacht een minuutje en probeer het opnieuw.'
            return None, ({'error': msg}, 429)
        if e.code == 404:
            msg = f'Model "{GEMINI_MODEL}" niet gevonden of niet meer beschikbaar. Zet GEMINI_MODEL in je .env op een geldig model.'
            return None, ({'error': msg}, 502)
        if e.code in (401, 403):
            msg = 'Gemini API-key ongeldig of geen toegang. Controleer GEMINI_API_KEY in je .env.'
            return None, ({'error': msg}, 502)
        return None, ({'error': f'Gemini API fout ({e.code}): {detail[:300]}'}, 502)
    except Exception as e:
        return None, ({'error': f'Gemini API onbereikbaar: {e}'}, 502)

    candidates = data.get('candidates') or []
    if not candidates:
        return None, ({'error': f'Gemini gaf geen resultaat terug: {data}'}, 502)
    finish_reason = candidates[0].get('finishReason', '')
    parts_out = candidates[0].get('content', {}).get('parts', [])
    text = ''.join(p.get('text', '') for p in parts_out).strip()
    if not text:
        return None, ({'error': f'Gemini gaf een leeg antwoord (finishReason: {finish_reason})'}, 502)
    text = re.sub(r'^```(?:json)?\s*|\s*```$', '', text.strip())
    try:
        return json.loads(text), None
    except json.JSONDecodeError as e:
        return None, ({'error': f'Kon Gemini-antwoord niet verwerken (mogelijk afgekapt): {e}'}, 502)


@app.route('/api/ai/lookup', methods=['POST'])
def ai_lookup():
    body  = request.get_json() or {}
    name  = (body.get('name')  or '').strip()
    link  = (body.get('link')  or '').strip()
    query = (body.get('query') or '').strip()

    if not (name or query):
        return jsonify({'error': 'Geen zoekgegevens opgegeven'}), 400

    context_lines = []
    if query: context_lines.append(f'Zoekterm: {query}')
    if name:  context_lines.append(f'Naam: {name}')
    if link:  context_lines.append(f'Productlink: {link}')
    context = '\n'.join(context_lines)

    prompt = f"""Je bent een expert in elektronica-onderdelen. Zoek op basis van onderstaande gegevens de technische specificaties op van dit onderdeel.

{context}

Antwoord ALLEEN met een geldig JSON-object, zonder markdown-opmaak, zonder uitleg eromheen, exact in dit formaat:
{{"value": "<waarde, bv. 10k Ohm of 100nF, leeg als onbekend>", "brand": "<meest voorkomend/waarschijnlijk merk voor dit specifieke onderdeel (bv. bij een IPN/typenummer), of bij generieke onderdelen zonder merk een gangbaar merk als voorbeeld (bv. 'Panasonic (indicatief)'), leeg als niet zinvol>", "package": "<behuizing/package. Voor generieke passieve onderdelen zoals weerstanden/condensatoren geef een TYPISCHE/gangbare afmeting (bv. 'Radiaal, 5x11mm' of 'THT 1/4W axiaal'), niet alleen leeg laten. Voor IC's/modules de exacte package (bv. TO-220, SOIC-8). Leeg alleen als er echt geen zinnig antwoord mogelijk is.>", "datasheet_url": "<directe URL naar een datasheet PDF indien je die kent, anders leeg>", "extra_info": "<overige relevante specs zoals voedingsspanning, max. stroom, temperatuurbereik, pinout-opmerkingen, bijzonderheden — kort en bondig, leeg als niet relevant>", "found": true of false}}

Gebruik lege strings voor velden die je niet zeker weet. Verzin geen URLs. Doe bij generieke onderdelen zonder exact typenummer altijd een indicatieve best-effort inschatting voor waarde/package in plaats van alles leeg te laten — vermeld dan wel in extra_info dat dit indicatief is."""

    parsed, err = _call_gemini(prompt, max_tokens=2800)
    if err:
        return jsonify(err[0]), err[1]

    return jsonify({
        'value':         str(parsed.get('value', '') or ''),
        'brand':         str(parsed.get('brand', '') or ''),
        'package':       str(parsed.get('package', '') or ''),
        'datasheet_url': str(parsed.get('datasheet_url', '') or ''),
        'extra_info':    str(parsed.get('extra_info', '') or ''),
        'found':         bool(parsed.get('found', False)),
    })


@app.route('/api/ai/suggest-category', methods=['POST'])
def ai_suggest_category():
    body = request.get_json() or {}
    name = (body.get('name') or '').strip()
    desc = (body.get('desc') or '').strip()
    if not name and not desc:
        return jsonify({'error': 'Geen naam/beschrijving opgegeven'}), 400

    with db_conn() as db:
        cats = db.execute('SELECT id,name,parent FROM categories ORDER BY id').fetchall()
    if not cats:
        return jsonify({'error': 'Geen categorieën gevonden'}), 400

    cat_by_id = {c['id']: c['name'] for c in cats}
    lines = []
    for c in cats:
        parent_name = cat_by_id.get(c['parent'], '')
        label = f"{parent_name} > {c['name']}" if parent_name else c['name']
        lines.append(f"{c['id']}: {label}")
    cat_list = '\n'.join(lines)

    prompt = f"""Je bent een expert in het indelen van elektronica-onderdelen. Kies de best passende categorie voor dit onderdeel uit onderstaande lijst.

Onderdeel naam: {name}
Beschrijving: {desc}

Beschikbare categorieën (ID: Naam):
{cat_list}

Antwoord ALLEEN met een geldig JSON-object, zonder markdown-opmaak: {{"category_id": <het ID-nummer van de best passende categorie, of null als echt niets past>, "confidence": "hoog, gemiddeld of laag"}}"""

    parsed, err = _call_gemini(prompt, max_tokens=500)
    if err:
        return jsonify(err[0]), err[1]

    cat_id = parsed.get('category_id')
    try:
        cat_id = int(cat_id) if cat_id is not None else None
    except (TypeError, ValueError):
        cat_id = None
    if cat_id is not None and cat_id not in cat_by_id:
        cat_id = None

    return jsonify({
        'category_id': cat_id,
        'category_name': cat_by_id.get(cat_id, ''),
        'confidence': str(parsed.get('confidence', '') or ''),
    })


@app.route('/api/ai/check-duplicate', methods=['POST'])
def ai_check_duplicate():
    body = request.get_json() or {}
    name = (body.get('name') or '').strip()
    desc = (body.get('desc') or '').strip()
    ipn  = (body.get('IPN')  or '').strip()
    if not name:
        return jsonify({'error': 'Geen naam opgegeven'}), 400

    with db_conn() as db:
        rows = db.execute("SELECT id,name,IPN,desc FROM parts WHERE active=1").fetchall()
    if not rows:
        return jsonify({'duplicates': [], 'none_found': True})

    existing = '\n'.join(f"{r['id']}: {r['name']} (IPN: {r['IPN'] or '-'}, {r['desc'] or ''})" for r in rows)

    prompt = f"""Je checkt of een nieuw elektronica-onderdeel mogelijk al bestaat in de inventaris, ook als de naam anders geschreven is (synoniemen, afkortingen, spatiëring, eenheden, hoofdletters).

Nieuw onderdeel: naam="{name}", IPN="{ipn}", beschrijving="{desc}"

Bestaande onderdelen (ID: naam (IPN, beschrijving)):
{existing}

Antwoord ALLEEN met geldig JSON, zonder markdown: {{"duplicates": [{{"id": <id>, "reason": "<korte reden waarom dit een mogelijk duplicaat is>"}}], "none_found": true of false}}. Neem alleen serieuze kandidaten op (max 5), geen zwakke gokjes."""

    parsed, err = _call_gemini(prompt, max_tokens=1500)
    if err:
        return jsonify(err[0]), err[1]

    id_map = {r['id']: r for r in rows}
    out = []
    for d in (parsed.get('duplicates') or []):
        try:
            did = int(d.get('id'))
        except (TypeError, ValueError):
            continue
        if did in id_map:
            out.append({
                'id': did, 'name': id_map[did]['name'], 'IPN': id_map[did]['IPN'] or '',
                'reason': str(d.get('reason', '') or '')
            })
    return jsonify({'duplicates': out, 'none_found': len(out) == 0})


@app.route('/api/ai/photo-lookup', methods=['POST'])
def ai_photo_lookup():
    body = request.get_json() or {}
    image_b64 = body.get('image_base64', '')
    mime = body.get('mime_type', 'image/jpeg')
    if not image_b64:
        return jsonify({'error': 'Geen afbeelding ontvangen'}), 400
    if len(image_b64) > 8_000_000:  # ~6MB binair, ruime marge
        return jsonify({'error': 'Afbeelding is te groot'}), 400

    with db_conn() as db:
        cats = db.execute('SELECT id,name,parent FROM categories ORDER BY id').fetchall()
    cat_by_id = {c['id']: c['name'] for c in cats}
    lines = []
    for c in cats:
        parent_name = cat_by_id.get(c['parent'], '')
        label = f"{parent_name} > {c['name']}" if parent_name else c['name']
        lines.append(f"{c['id']}: {label}")
    cat_list = '\n'.join(lines)

    prompt = f"""Je bent een expert in het herkennen van elektronica-onderdelen op foto's. Bekijk de bijgevoegde foto zorgvuldig (inclusief eventuele opdruk/tekst/kleurcodes op het onderdeel) en identificeer wat erop staat.

Beschikbare categorieën (ID: Naam), kies de best passende:
{cat_list}

Antwoord ALLEEN met een geldig JSON-object, zonder markdown-opmaak:
{{"name": "<korte herkenbare naam, bv. '10k Ohm weerstand' of 'ESP32-WROOM-32 module'>", "value": "<waarde indien van toepassing, leeg als n.v.t.>", "brand": "<merk indien zichtbaar/herkenbaar, anders leeg>", "package": "<behuizing/package die je op de foto ziet>", "extra_info": "<overige zichtbare specs, opdruk/tekst, kleurcodes, bijzonderheden — kort>", "category_id": <best passende categorie-ID uit de lijst hierboven, of null>, "confidence": "hoog, gemiddeld of laag", "found": true of false}}

Als je het onderdeel niet met voldoende zekerheid kunt identificeren, zet found op false en laat de overige velden leeg. Verzin niets dat je niet op de foto kunt zien."""

    parsed, err = _call_gemini(prompt, max_tokens=1500, image_b64=image_b64, image_mime=mime)
    if err:
        return jsonify(err[0]), err[1]

    cat_id = parsed.get('category_id')
    try:
        cat_id = int(cat_id) if cat_id is not None else None
    except (TypeError, ValueError):
        cat_id = None
    if cat_id is not None and cat_id not in cat_by_id:
        cat_id = None

    return jsonify({
        'name':          str(parsed.get('name', '') or ''),
        'value':         str(parsed.get('value', '') or ''),
        'brand':         str(parsed.get('brand', '') or ''),
        'package':       str(parsed.get('package', '') or ''),
        'extra_info':    str(parsed.get('extra_info', '') or ''),
        'category_id':   cat_id,
        'category_name': cat_by_id.get(cat_id, ''),
        'confidence':    str(parsed.get('confidence', '') or ''),
        'found':         bool(parsed.get('found', False)),
    })


@app.route('/api/ai/suggest-replacement', methods=['POST'])
def ai_suggest_replacement():
    body = request.get_json() or {}
    name = (body.get('name') or '').strip()
    desc = (body.get('desc') or '').strip()
    ipn  = (body.get('IPN')  or '').strip()
    if not name:
        return jsonify({'error': 'Geen onderdeel opgegeven'}), 400

    with db_conn() as db:
        rows = db.execute("SELECT id,name,IPN,desc,stock FROM parts WHERE active=1 AND stock>0").fetchall()
    if not rows:
        return jsonify({'suggestions': [], 'none_found': True})

    stock_list = '\n'.join(
        f"{r['id']}: {r['name']} (IPN: {r['IPN'] or '-'}, voorraad: {r['stock']}, {r['desc'] or ''})" for r in rows
    )

    prompt = f"""Je bent een elektronica-expert. Een BOM-item is niet (voldoende) op voorraad. Zoek in onderstaande lijst van onderdelen die WEL op voorraad zijn naar een elektrisch/functioneel bruikbaar alternatief (bv. een andere maar in de praktijk gelijkwaardige weerstandswaarde, een pin-compatibele IC, een vergelijkbare condensator).

Ontbrekend onderdeel: naam="{name}", IPN="{ipn}", beschrijving="{desc}"

Op voorraad (ID: naam (IPN, voorraad, beschrijving)):
{stock_list}

Antwoord ALLEEN met geldig JSON, zonder markdown: {{"suggestions": [{{"id": <id>, "reason": "<korte technische onderbouwing waarom dit een bruikbaar alternatief is>"}}], "none_found": true of false}}. Wees kritisch en terughoudend — neem alleen op wat écht elektrisch/functioneel geschikt is, max 5 suggesties. Bij twijfel: niet opnemen."""

    parsed, err = _call_gemini(prompt, max_tokens=1500)
    if err:
        return jsonify(err[0]), err[1]

    id_map = {r['id']: r for r in rows}
    out = []
    for s in (parsed.get('suggestions') or []):
        try:
            sid = int(s.get('id'))
        except (TypeError, ValueError):
            continue
        if sid in id_map:
            out.append({
                'id': sid, 'name': id_map[sid]['name'], 'IPN': id_map[sid]['IPN'] or '',
                'stock': id_map[sid]['stock'], 'reason': str(s.get('reason', '') or '')
            })
    return jsonify({'suggestions': out, 'none_found': len(out) == 0})

# ── API: CONFIG ───────────────────────────────────────────────
@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify({
        'telegram_token':       TELEGRAM_BOT_TOKEN,
        'telegram_chat_id':     TELEGRAM_CHAT_ID,
        'telegram_from_server': bool(TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID),
    })

# ── API: HISTORY ──────────────────────────────────────────────
@app.route('/api/history')
def get_history():
    pid = request.args.get('partId')
    with db_conn() as db:
        if pid:
            rows = db.execute('SELECT * FROM history WHERE partId=? ORDER BY ts DESC LIMIT 200',(pid,)).fetchall()
        else:
            rows = db.execute('SELECT * FROM history ORDER BY ts DESC LIMIT 200').fetchall()
        return jsonify([{'ts':r['ts'],'partId':r['partId'],'partName':r['partName'],
                         'from':r['fromStock'],'to':r['toStock'],'delta':r['delta'],'note':r['note'] or '',
                         'price_paid':r['price_paid'],'suppId':r['suppId']} for r in rows])

# ── API: LOCATIONS ────────────────────────────────────────────


@app.route('/api/categories/seed', methods=['POST'])
def seed_categories():
    _cats = [(201, 'Passieve componenten', None, '🔌', 0), (202, 'Weerstanden (THT)', 201, '', 0), (203, 'Weerstanden (SMD)', 201, '', 1), (204, 'Condensatoren - Keramisch', 201, '', 2), (205, 'Condensatoren - Elektrolytisch', 201, '', 3), (206, 'Condensatoren - Overig', 201, '', 4), (207, 'Spoelen & Ferrieten', 201, '', 5), (208, 'Kristallen & Oscillatoren', 201, '', 6), (210, 'Actieve componenten', None, '⚡', 1), (211, 'Diodes (algemeen)', 210, '', 0), (212, 'Zener diodes', 210, '', 1), (213, 'Transistoren NPN/PNP', 210, '', 2), (214, 'MOSFETs', 210, '', 3), (215, 'Voltage regulators', 210, '', 4), (216, 'Bridge rectifiers', 210, '', 5), (220, "IC's & Modules", None, '💡', 2), (221, 'Microcontrollers', 220, '', 0), (222, 'ESP8266 / ESP32', 220, '', 1), (223, 'Raspberry Pi', 220, '', 2), (224, 'Drivers & Logic', 220, '', 3), (225, 'Displays (LCD/OLED)', 220, '', 4), (226, 'Audio modules', 220, '', 5), (227, 'Relais & Schakelaars', 220, '', 6), (228, 'Sensoren modules', 220, '', 7), (230, 'Communicatie', None, '📡', 3), (231, 'WiFi modules', 230, '', 0), (232, 'Ethernet / RJ45', 230, '', 1), (233, 'RS485 / UART', 230, '', 2), (234, 'RF & LoRa', 230, '', 3), (235, 'Bluetooth / Zigbee', 230, '', 4), (236, 'USB Interfaces', 230, '', 5), (240, 'Connectors & Kabels', None, '🔌', 4), (241, 'Header pins (male/female)', 240, '', 0), (242, 'Schroefklemmen', 240, '', 1), (243, 'Banana plugs', 240, '', 2), (244, 'DC power jacks', 240, '', 3), (245, 'USB connectors', 240, '', 4), (246, 'JST / RJ45', 240, '', 5), (250, 'Sensoren', None, '📡', 5), (251, 'Temperatuur / Vochtigheid', 250, '', 0), (252, 'Afstand / Beweging', 250, '', 1), (253, 'Gas / Vloeistof', 250, '', 2), (254, 'Stroom / Spanning', 250, '', 3), (255, 'Licht / IR', 250, '', 4), (256, 'Overige sensoren', 250, '', 5), (260, 'Gereedschap', None, '🛠️', 6), (261, 'Handgereedschap', 260, '', 0), (262, 'Meetapparatuur', 260, '', 1), (263, '3D-printer gereedschap', 260, '', 2), (264, 'Reinigingsmiddelen', 260, '', 3), (265, 'Testapparatuur', 260, '', 4), (270, 'Verbruiksartikelen', None, '📦', 7), (271, 'Soldeertin & Flux', 270, '', 0), (272, 'Bevestigingsmateriaal', 270, '', 1), (273, 'Verpakkingsmateriaal', 270, '', 2), (274, 'Labels & Tape', 270, '', 3), (275, 'ESD zakken', 270, '', 4), (280, '3D Printing', None, '🖨️', 8), (281, 'Filament - PLA', 280, '', 0), (282, 'Filament - Overig', 280, '', 1), (283, '3D-printer onderdelen', 280, '', 2), (290, "Producten & PCB's", None, '🧩', 9), (293, "PCB's (inkoop)", 290, '', 0), (294, 'Prototype builds', 290, '', 1), (295, 'Eindproducten', 290, '', 2), (300, 'Overige', None, '🗃️', 10), (301, 'Tablets & Apparaten', 300, '', 0), (302, 'Reserveonderdelen', 300, '', 1), (303, 'Diverse', 300, '', 2), (304, 'Uurloon', 300, '', 3)]
    with db_conn() as db:
        db.execute('''CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY, name TEXT NOT NULL,
            parent INTEGER DEFAULT NULL, icon TEXT DEFAULT '', sort INTEGER DEFAULT 0)''')
        before = db.execute('SELECT COUNT(*) FROM categories').fetchone()[0]
        db.executemany('INSERT OR IGNORE INTO categories (id,name,parent,icon,sort) VALUES (?,?,?,?,?)', _cats)
        after = db.execute('SELECT COUNT(*) FROM categories').fetchone()[0]
    return jsonify({'added': after-before, 'total': after, 'seeded': len(_cats)})


@app.route('/api/categories', methods=['GET'])
def get_categories():
    with db_conn() as db:
        rows = db.execute('SELECT * FROM categories ORDER BY sort, id').fetchall()
        return jsonify([{'id':r['id'],'name':r['name'],'parent':r['parent'],'icon':r['icon'],'sort':r['sort']} for r in rows])

@app.route('/api/categories', methods=['POST'])
def add_category():
    b = request.get_json()
    with db_conn() as db:
        # Auto-assign ID based on parent range or max+1
        parent = b.get('parent')
        if parent:
            existing = db.execute('SELECT MAX(id) as m FROM categories WHERE parent=?',(parent,)).fetchone()
            new_id = (existing['m'] or parent) + 1
        else:
            existing = db.execute('SELECT MAX(id) as m FROM categories WHERE parent IS NULL').fetchone()
            new_id = (existing['m'] or 200) + 10
        db.execute('INSERT INTO categories (id,name,parent,icon,sort) VALUES (?,?,?,?,?)',
            (new_id, b['name'], parent, b.get('icon',''), b.get('sort',0)))
        return jsonify({'id':new_id,'name':b['name'],'parent':parent,'icon':b.get('icon',''),'sort':b.get('sort',0)})

@app.route('/api/categories/<int:cid>', methods=['PUT'])
def update_category(cid):
    b = request.get_json()
    with db_conn() as db:
        db.execute('UPDATE categories SET name=?,icon=?,sort=? WHERE id=?',
            (b['name'], b.get('icon',''), b.get('sort',0), cid))
        return jsonify({'ok': True})

@app.route('/api/categories/<int:cid>', methods=['DELETE'])
def delete_category(cid):
    with db_conn() as db:
        # Check if any parts use this category
        count = db.execute('SELECT COUNT(*) FROM parts WHERE catId=?',(cid,)).fetchone()[0]
        if count > 0:
            return jsonify({'error': f'{count} onderdelen gebruiken deze categorie'}), 400
        # Check if has children
        children = db.execute('SELECT COUNT(*) FROM categories WHERE parent=?',(cid,)).fetchone()[0]
        if children > 0:
            return jsonify({'error': f'Verwijder eerst de {children} subcategorieën'}), 400
        db.execute('DELETE FROM categories WHERE id=?',(cid,))
        return jsonify({'ok': True})


@app.route('/api/locations/seed', methods=['POST'])
def seed_locations():
    """Eenmalig aanroepen om default locaties in DB te zetten. POST /api/locations/seed"""
    _locs = [('1', 'Lade 1'), ('2', 'Doos A'), ('3', 'Werkplek')]
    with db_conn() as db:
        existing = db.execute('SELECT COUNT(*) FROM custom_locs').fetchone()[0]
        db.executemany('INSERT OR IGNORE INTO custom_locs (id, name) VALUES (?, ?)', _locs)
        after = db.execute('SELECT COUNT(*) FROM custom_locs').fetchone()[0]
    added = after - existing
    return jsonify({'seeded': len(_locs), 'added': added, 'total': after})

@app.route('/api/locations', methods=['GET'])
def get_locations():
    with db_conn() as db:
        return jsonify({str(r['id']): r['name']
                        for r in db.execute('SELECT * FROM custom_locs ORDER BY CAST(id AS INTEGER)').fetchall()})

@app.route('/api/locations', methods=['POST'])
def add_location():
    body = request.get_json()
    name = body.get('name','').strip()
    if not name: return jsonify({'error':'name required'}), 400
    with db_conn() as db:
        nid = get_meta('nextLocId','300')
        parent = body.get('parent','')
        if parent:
            pr = db.execute('SELECT name FROM custom_locs WHERE id=?',(str(parent),)).fetchone()
            display = (pr['name'] if pr else str(parent)) + '/' + name
        else:
            display = name
        db.execute('INSERT OR REPLACE INTO custom_locs VALUES (?,?)',(str(nid),display))
        set_meta(db,'nextLocId',nid+1)
        return jsonify({'id':str(nid),'name':display}), 201

@app.route('/api/locations/rename', methods=['POST'])
def rename_location():
    body = request.get_json()
    lid = str(body.get('id',''))
    name = body.get('name','').strip()
    if not lid or not name: return jsonify({'error':'id and name required'}), 400
    with db_conn() as db:
        db.execute('INSERT OR REPLACE INTO custom_locs VALUES (?,?)',(lid,name))
        return jsonify({'id':lid,'name':name})

@app.route('/api/locations/<lid>', methods=['PUT'])
def update_location(lid):
    name = request.get_json().get('name','').strip()
    if not name: return jsonify({'error':'name required'}), 400
    with db_conn() as db:
        db.execute('INSERT OR REPLACE INTO custom_locs VALUES (?,?)',(lid,name))
        return jsonify({'id':lid,'name':name})

@app.route('/api/locations/<lid>', methods=['DELETE'])
def delete_location(lid):
    with db_conn() as db:
        if not db.execute('SELECT 1 FROM custom_locs WHERE id=?',(lid,)).fetchone():
            return jsonify({'error':'not found'}), 404
        db.execute('DELETE FROM custom_locs WHERE id=?',(lid,))
        if lid.isdigit():
            db.execute('UPDATE parts SET locId=NULL WHERE locId=?',(int(lid),))
        return jsonify({'ok':True})

# ── API: SUPPLIERS ────────────────────────────────────────────
DEFAULT_SUPPLIERS = [
    {'id':1,'name':'OpenCircuit.nl','url':'https://opencircuit.nl','color':'#e85d04'},
    {'id':2,'name':'AliExpress','url':'https://aliexpress.com','color':'#e62a10'},
    {'id':3,'name':'Reichelt','url':'https://reichelt.com','color':'#0057a8'},
    {'id':4,'name':'JLCPCB','url':'https://jlcpcb.com','color':'#d40000'},
    {'id':5,'name':'Bits & Parts','url':'https://bitsandparts.nl','color':'#2d6a4f'},
    {'id':6,'name':'Conrad','url':'https://conrad.nl','color':'#e63946'},
    {'id':7,'name':'Mouser','url':'https://mouser.com','color':'#004e8c'},
    {'id':8,'name':'Farnell','url':'https://farnell.com','color':'#007bc0'},
    {'id':9,'name':'DigiKey','url':'https://digikey.com','color':'#c8102e'},
]

@app.route('/api/suppliers', methods=['GET'])
def get_suppliers():
    with db_conn() as db:
        custom = [{'id':r['id'],'name':r['name'],'url':r['url'],'color':r['color']}
                  for r in db.execute('SELECT * FROM suppliers').fetchall()]
        overridden = {s['id'] for s in custom}
        merged = [s for s in DEFAULT_SUPPLIERS if s['id'] not in overridden] + custom
        return jsonify(sorted(merged, key=lambda s: s['name'].lower()))

@app.route('/api/suppliers', methods=['POST'])
def add_supplier():
    body = request.get_json()
    name = body.get('name','').strip()
    if not name: return jsonify({'error':'name required'}), 400
    with db_conn() as db:
        nid = get_meta('nextSuppId','10')
        db.execute('INSERT INTO suppliers VALUES (?,?,?,?)',(nid,name,body.get('url',''),body.get('color','#888888')))
        set_meta(db,'nextSuppId',nid+1)
        return jsonify({'id':nid,'name':name,'url':body.get('url',''),'color':body.get('color','#888888')}), 201

@app.route('/api/suppliers/<int:sid>', methods=['PUT'])
def update_supplier(sid):
    body = request.get_json()
    with db_conn() as db:
        existing = db.execute('SELECT * FROM suppliers WHERE id=?',(sid,)).fetchone()
        if existing:
            db.execute('UPDATE suppliers SET name=?,url=?,color=? WHERE id=?',
                (body.get('name',existing['name']),body.get('url',existing['url']),body.get('color',existing['color']),sid))
        else:
            base = next((s for s in DEFAULT_SUPPLIERS if s['id']==sid),{})
            db.execute('INSERT INTO suppliers VALUES (?,?,?,?)',
                (sid,body.get('name',base.get('name','')),body.get('url',base.get('url','')),body.get('color',base.get('color','#888888'))))
        row = db.execute('SELECT * FROM suppliers WHERE id=?',(sid,)).fetchone()
        return jsonify({'id':row['id'],'name':row['name'],'url':row['url'],'color':row['color']})

@app.route('/api/suppliers/<int:sid>', methods=['DELETE'])
def delete_supplier(sid):
    with db_conn() as db:
        db.execute('DELETE FROM suppliers WHERE id=?',(sid,))
        for row in db.execute('SELECT id,suppliers FROM parts').fetchall():
            supps = _jlist(row['suppliers'], row['id'], 'suppliers')
            filtered = [s for s in supps if not (isinstance(s, dict) and s.get('suppId') == sid)]
            if len(filtered) != len(supps):
                db.execute('UPDATE parts SET suppliers=? WHERE id=?',(json.dumps(filtered),row['id']))
        return jsonify({'ok':True})

# ── API: ORDERS ───────────────────────────────────────────────
@app.route('/api/orders', methods=['GET'])
def get_orders():
    with db_conn() as db:
        return jsonify([{'id':r['id'],'suppId':r['suppId'],'status':r['status'],
            'orderDate':r['orderDate'],'expectedDate':r['expectedDate'],'receivedDate':r['receivedDate'],
            'reference':r['reference'],'notes':r['notes'],'items':json.loads(r['items'] or '[]')}
            for r in db.execute('SELECT * FROM orders').fetchall()])

@app.route('/api/orders', methods=['POST'])
def add_order():
    body = request.get_json()
    with db_conn() as db:
        nid = get_meta('nextOrderId','1')
        db.execute('INSERT INTO orders VALUES (?,?,?,?,?,?,?,?,?)',
            (nid,body.get('suppId'),'besteld',
             body.get('orderDate',datetime.now(timezone.utc).date().isoformat()),
             body.get('expectedDate',''),'',body.get('reference',''),body.get('notes',''),
             json.dumps(body.get('items',[]))))
        set_meta(db,'nextOrderId',nid+1)
        return jsonify({'id':nid,'status':'besteld',**body}), 201

@app.route('/api/orders/<int:oid>', methods=['PUT'])
def update_order(oid):
    body = request.get_json()
    with db_conn() as db:
        row = db.execute('SELECT * FROM orders WHERE id=?',(oid,)).fetchone()
        if not row: return jsonify({'error':'not found'}), 404
        db.execute('''UPDATE orders SET suppId=?,status=?,orderDate=?,expectedDate=?,
            receivedDate=?,reference=?,notes=?,items=? WHERE id=?''', (
            body.get('suppId',row['suppId']),body.get('status',row['status']),
            body.get('orderDate',row['orderDate']),body.get('expectedDate',row['expectedDate']),
            body.get('receivedDate',row['receivedDate']),body.get('reference',row['reference']),
            body.get('notes',row['notes']),json.dumps(body.get('items',json.loads(row['items'] or '[]'))),oid))
        return jsonify({'ok':True})

@app.route('/api/orders/<int:oid>/receive', methods=['POST'])
def receive_order(oid):
    body = request.get_json()
    with db_conn() as db:
        row = db.execute('SELECT * FROM orders WHERE id=?',(oid,)).fetchone()
        if not row: return jsonify({'error':'not found'}), 404
        for item in body.get('items',json.loads(row['items'] or '[]')):
            pid,qty = item.get('partId'),int(item.get('qty',0))
            if not pid or qty <= 0: continue
            part = db.execute('SELECT * FROM parts WHERE id=?',(pid,)).fetchone()
            if part:
                old,new = int(part['stock'] or 0),int(part['stock'] or 0)+qty
                db.execute('UPDATE parts SET stock=? WHERE id=?',(new,pid))
                db.execute('INSERT INTO history (ts,partId,partName,fromStock,toStock,delta,note) VALUES (?,?,?,?,?,?,?)',
                    (datetime.now(timezone.utc).isoformat(),pid,part['name'],old,new,qty,f'Ontvangen via inkooporder #{oid}'))
        db.execute("UPDATE orders SET status='ontvangen',receivedDate=? WHERE id=?",
            (datetime.now(timezone.utc).date().isoformat(),oid))
        return jsonify({'ok':True})

@app.route('/api/orders/<int:oid>', methods=['DELETE'])
def delete_order(oid):
    with db_conn() as db:
        db.execute('DELETE FROM orders WHERE id=?',(oid,))
        return jsonify({'ok':True})

# ── API: PROJECTS ─────────────────────────────────────────────
@app.route('/api/projects', methods=['GET'])
def get_projects():
    with db_conn() as db:
        rows = db.execute('SELECT * FROM projects').fetchall()
        result = []
        for r in rows:
            p = {'id':r['id'],'name':r['name'],'desc':r['desc'],'status':r['status'],
                 'items':json.loads(r['items'] or '[]'),'created':r['created'],
                 'buildHistory':json.loads(r['buildHistory'] or '[]')}
            # Merge extra fields (version, deadline, margin, tags etc)
            extra = json.loads(r['extra'] or '{}')
            p.update(extra)
            result.append(p)
        return jsonify(result)

@app.route('/api/projects', methods=['POST'])
def add_project():
    body = request.get_json()
    name = body.get('name','').strip()
    if not name: return jsonify({'error':'name required'}), 400
    with db_conn() as db:
        nid = get_meta('nextProjectId','1')
        created = datetime.now(timezone.utc).isoformat()
        build_history = json.dumps(body.get('buildHistory',[]))
        extra = {k:v for k,v in body.items() if k not in ('id','name','desc','status','items','buildHistory','created')}
        db.execute('INSERT INTO projects (id,name,desc,status,items,buildHistory,extra,created) VALUES (?,?,?,?,?,?,?,?)',
            (nid,name,body.get('desc',''),body.get('status','actief'),
             json.dumps(body.get('items',[])),build_history,json.dumps(extra),created))
        set_meta(db,'nextProjectId',nid+1)
        result = {'id':nid,'name':name,'desc':body.get('desc',''),
                  'status':body.get('status','actief'),'items':body.get('items',[]),
                  'buildHistory':body.get('buildHistory',[]),'created':created}
        result.update(extra)
        return jsonify(result), 201

@app.route('/api/projects/<int:pid>', methods=['PUT'])
def update_project(pid):
    body = request.get_json()
    with db_conn() as db:
        row = db.execute('SELECT * FROM projects WHERE id=?',(pid,)).fetchone()
        if not row: return jsonify({'error':'not found'}), 404
        build_history = json.dumps(body.get('buildHistory', json.loads(row['buildHistory'] or '[]')))
        extra = {k:v for k,v in body.items() if k not in ('id','name','desc','status','items','buildHistory','created')}
        db.execute('UPDATE projects SET name=?,desc=?,status=?,items=?,buildHistory=?,extra=? WHERE id=?',
            (body.get('name',row['name']), body.get('desc',row['desc']),
             body.get('status',row['status']),
             json.dumps(body.get('items',json.loads(row['items'] or '[]'))),
             build_history, json.dumps(extra), pid))
        return jsonify({'ok':True})

@app.route('/api/projects/<int:pid>', methods=['DELETE'])
def delete_project(pid):
    with db_conn() as db:
        db.execute('DELETE FROM projects WHERE id=?',(pid,))
        return jsonify({'ok':True})

# ── API: MEDIA ────────────────────────────────────────────────
IMAGE_EXT = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
# Deze extensies zijn nooit toegestaan, ook niet als "dubbele" extensie (bijv. foto.php.jpg)
DANGEROUS_EXT = {'.php', '.phtml', '.phar', '.exe', '.sh', '.bat', '.cmd', '.com', '.msi', '.dll', '.js', '.mjs',
                 '.html', '.htm', '.svg', '.xml', '.py', '.pl', '.cgi', '.jar', '.ps1', '.vbs', '.asp', '.aspx',
                 '.jsp', '.htaccess', '.scr', '.lnk'}
EXT_KIND = {'.jpg': 'jpeg', '.jpeg': 'jpeg', '.png': 'png', '.gif': 'gif', '.webp': 'webp', '.pdf': 'pdf'}
KIND_MIME = {'jpeg': {'image/jpeg', 'image/jpg', 'image/pjpeg'}, 'png': {'image/png'}, 'gif': {'image/gif'},
             'webp': {'image/webp'}, 'pdf': {'application/pdf', 'application/x-pdf'}}

class UploadError(Exception):
    def __init__(self, msg, status=400, log=True):
        super().__init__(msg); self.msg, self.status, self.log = msg, status, log

def sniff_kind(head):
    """Bepaalt het echte bestandstype aan de hand van de eerste bytes."""
    if head.startswith(b'\xff\xd8\xff'): return 'jpeg'
    if head.startswith(b'\x89PNG\r\n\x1a\n'): return 'png'
    if head[:6] in (b'GIF87a', b'GIF89a'): return 'gif'
    if head[:4] == b'RIFF' and head[8:12] == b'WEBP': return 'webp'
    if head.startswith(b'%PDF-'): return 'pdf'
    return None

def media_total_bytes():
    total = 0
    for f in MEDIA_DIR.iterdir():
        try:
            if f.is_file(): total += f.stat().st_size
        except OSError: pass
    return total

def validate_upload(f, allowed_ext):
    """Controleert een geüpload bestand. Retourneert (ext, bytes) of gooit UploadError.
    Controles: bestandsnaam (pad-traversal, gevaarlijke/dubbele extensies), extensie,
    maximale grootte, echte inhoud (magic bytes), MIME-type van de browser, echt beeld
    (Pillow, indien aanwezig) en de totale grootte van de mediamap."""
    raw = f.filename or ''
    if not raw.strip(): raise UploadError('Geen bestandsnaam')
    if '\x00' in raw or any(ord(c) < 32 for c in raw): raise UploadError('Ongeldige bestandsnaam (stuurtekens)')
    if '/' in raw or '\\' in raw or '..' in raw: raise UploadError('Ongeldige bestandsnaam (pad niet toegestaan)')
    if raw.startswith('.'): raise UploadError('Ongeldige bestandsnaam (verborgen bestand)')
    if len(raw) > 200: raise UploadError('Bestandsnaam te lang')
    parts_ = raw.lower().split('.')
    ext = '.' + parts_[-1] if len(parts_) > 1 else ''
    for mid in parts_[1:-1]:
        if '.' + mid in DANGEROUS_EXT: raise UploadError('Gevaarlijke bestandsnaam (dubbele extensie)')
    if ext in DANGEROUS_EXT: raise UploadError('Dit bestandstype is niet toegestaan')
    if ext not in allowed_ext: raise UploadError('Bestandstype niet toegestaan', log=False)
    limit = MAX_UPLOAD_MB * 1024 * 1024
    data = f.stream.read(limit + 1)
    if len(data) > limit: raise UploadError(f'Bestand te groot (maximaal {MAX_UPLOAD_MB} MB)', 413)
    if not data: raise UploadError('Leeg bestand')
    kind = sniff_kind(data[:16])
    if kind is None or kind != EXT_KIND[ext]:
        raise UploadError('Inhoud komt niet overeen met de extensie')
    mt = (f.mimetype or '').lower()
    if mt and mt not in ('application/octet-stream', 'binary/octet-stream') and mt not in KIND_MIME[kind]:
        raise UploadError(f'MIME-type {mt} komt niet overeen met de inhoud')
    if ext in IMAGE_EXT:
        try:
            from PIL import Image as PILImage
            with PILImage.open(io.BytesIO(data)) as im: im.verify()
        except ImportError: pass
        except Exception: raise UploadError('Beschadigd of ongeldig beeldbestand')
    if MEDIA_MAX_MB and media_total_bytes() + len(data) > MEDIA_MAX_MB * 1024 * 1024:
        raise UploadError(f'De mediamap zit vol (limiet {MEDIA_MAX_MB} MB)', 507, log=False)
    return ext, data

def save_unique(data, make_name):
    """Schrijft data weg onder een naam die nog niet bestaat (exclusief aanmaken, dus nooit overschrijven)."""
    for _ in range(20):
        name = make_name()
        try:
            with open(MEDIA_DIR / name, 'xb') as fh: fh.write(data)
            return name
        except FileExistsError: continue
    raise UploadError('Kon geen unieke bestandsnaam maken', 500)

def _handle_upload(allowed_ext, namer):
    if 'file' not in request.files: return jsonify({'error': 'no file'}), 400
    f = request.files['file']
    try:
        ext, data = validate_upload(f, allowed_ext)
        name = save_unique(data, lambda: namer(f, ext))
    except UploadError as e:
        if e.log:
            log_event('upload', 'warning', f'Onveilige upload geweigerd: {e.msg}',
                      filename=(f.filename or '')[:80], ip=client_ip())
        return jsonify({'error': e.msg}), e.status
    except OSError as e:
        log_event('media', 'error', f'Upload opslaan mislukt: {e}')
        return jsonify({'error': 'Opslaan mislukt'}), 500
    return jsonify({'url': f'/media/{name}'})

@app.route('/api/upload', methods=['POST'])
def upload_image():
    return _handle_upload(ALLOWED_EXT, lambda f, ext: f'{uuid.uuid4().hex}{ext}')

@app.route('/api/upload/pdf', methods=['POST'])
def upload_pdf():
    def namer(f, ext):
        stem = re.sub(r'[^\w\-.]', '_', Path(f.filename).stem)[:80].strip('._') or 'document'
        return f'{stem}_{uuid.uuid4().hex[:6]}.pdf'
    return _handle_upload({'.pdf'}, namer)

def _jl(raw, default=None):
    """Veilig JSON lezen: bij kapotte data het default teruggeven i.p.v. crashen."""
    try:
        v = json.loads(raw) if isinstance(raw, (str, bytes)) and raw else (default if default is not None else [])
    except (ValueError, TypeError):
        return default if default is not None else []
    return v

def _media_name(url):
    """'/media/abc.jpg' -> 'abc.jpg' voor interne verwijzingen, anders None (externe URL's tellen niet mee)."""
    if not url or not isinstance(url, str): return None
    u = url.split('?', 1)[0].split('#', 1)[0]
    if '://' in u or u.startswith('//'): return None
    from urllib.parse import unquote
    name = unquote(Path(u).name)
    return name or None

def media_refs(db):
    """Alle verwijzingen naar mediabestanden vanuit onderdelen: lijst van (bestandsnaam, partId, partNaam, veld, url)."""
    refs = []
    for p in db.execute('SELECT id,name,img,docs FROM parts').fetchall():
        n = _media_name(p['img'])
        if n: refs.append((n, p['id'], p['name'], 'img', p['img']))
        docs = _jl(p['docs'])
        for d in (docs if isinstance(docs, list) else []):
            if isinstance(d, dict):
                n = _media_name(d.get('url'))
                if n: refs.append((n, p['id'], p['name'], 'docs', d.get('url')))
    return refs

def find_orphans(include_recent=False):
    """Bestanden in de mediamap waar geen onderdeel meer naar verwijst. Bestanden die minder dan
    HB_ORPHAN_GRACE_MIN minuten oud zijn worden overgeslagen: ze kunnen zojuist geüpload zijn
    voor een formulier dat nog niet is opgeslagen."""
    with db_conn() as db:
        used = {r[0] for r in media_refs(db)}
    now = time.time()
    orphans, recent = [], []
    for f in sorted(MEDIA_DIR.iterdir()):
        if not f.is_file() or f.name.startswith('.') or f.name in used: continue
        st = f.stat()
        entry = {'name': f.name, 'url': f'/media/{f.name}', 'size': st.st_size,
                 'age_min': int((now - st.st_mtime) / 60)}
        if not include_recent and entry['age_min'] < ORPHAN_GRACE_MIN: recent.append(entry)
        else: orphans.append(entry)
    return orphans, recent

@app.route('/api/upload/<filename>', methods=['DELETE'])
def delete_image(filename):
    if re.search(r'[/\\]',filename): return jsonify({'error':'invalid'}), 400
    force = request.args.get('force') == '1'
    if not force:
        with db_conn() as db:
            rows = db.execute('SELECT id,name,img,docs FROM parts').fetchall()
        used_by = []
        for p in rows:
            if p['img'] and Path(p['img']).name == filename:
                used_by.append({'id': p['id'], 'name': p['name']})
            for doc in _jl(p['docs']):
                if isinstance(doc, dict) and doc.get('url') and Path(doc['url']).name == filename:
                    used_by.append({'id': p['id'], 'name': p['name']})
        if used_by:
            # Bestand wordt nog door (een) ander(e) onderdeel/onderdelen gebruikt — niet verwijderen.
            return jsonify({'error': 'in_use', 'used_by': used_by}), 409
    (MEDIA_DIR/filename).unlink(missing_ok=True)
    return jsonify({'ok':True})

@app.route('/api/media', methods=['GET'])
def list_media():
    with db_conn() as db:
        rows = db.execute('SELECT id,name,img,docs FROM parts').fetchall()
    used = {}
    for p in rows:
        if p['img']: used.setdefault(Path(p['img']).name,[]).append({'id':p['id'],'name':p['name']})
        for doc in _jl(p['docs']):
            if isinstance(doc, dict) and doc.get('url'): used.setdefault(Path(doc['url']).name,[]).append({'id':p['id'],'name':p['name']})
    files = []
    for f in sorted(MEDIA_DIR.iterdir()):
        if not f.is_file() or f.name.startswith('.'): continue
        entry = {'name':f.name,'url':f'/media/{f.name}','size':f.stat().st_size,
                 'ext':f.suffix.lower(),'used_by':used.get(f.name,[]),'width':None,'height':None}
        if f.suffix.lower() in {'.jpg','.jpeg','.png','.webp','.gif'}:
            try:
                from PIL import Image as PILImage
                with PILImage.open(f) as img: entry['width'],entry['height'] = img.size
            except: pass
        files.append(entry)
    return jsonify(files)

@app.route('/api/media/resize', methods=['POST'])
def resize_image():
    body = request.get_json()
    filename = body.get('filename','')
    if re.search(r'[/\\]',filename): return jsonify({'error':'invalid'}), 400
    path = MEDIA_DIR/filename
    if not path.exists(): return jsonify({'error':'not found'}), 404
    ext = path.suffix.lower()
    if ext not in {'.jpg','.jpeg','.png','.webp','.gif'}: return jsonify({'error':'not an image'}), 400
    max_size = int(body.get('maxSize', 800))
    max_bytes = int(body.get('maxBytes', 500 * 1024))  # 500KB standaard
    try:
        from PIL import Image as PILImage
        import io
        img = PILImage.open(path)
        ow, oh = img.size

        # Stap 1: verklein pixels als groter dan max_size
        ratio = min(max_size/ow, max_size/oh)
        if ratio < 1:
            img = img.resize((int(ow*ratio), int(oh*ratio)), PILImage.LANCZOS)

        # Stap 2: converteer PNG naar JPEG als bestand te groot blijft
        # PNG comprimeert slecht voor foto's
        save_ext = ext
        save_path = path
        if ext == '.png':
            # Probeer eerst als PNG
            buf = io.BytesIO()
            img.save(buf, 'PNG', optimize=True)
            if buf.tell() > max_bytes:
                # Converteer naar JPEG
                if img.mode in ('RGBA', 'P', 'LA'):
                    bg = PILImage.new('RGB', img.size, (255,255,255))
                    if img.mode == 'P': img = img.convert('RGBA')
                    bg.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                    img = bg
                else:
                    img = img.convert('RGB')
                save_ext = '.jpg'
                save_path = path.with_suffix('.jpg')

        # Stap 3: sla op met afnemende kwaliteit tot onder max_bytes
        if save_ext in {'.jpg', '.jpeg'}:
            for quality in [82, 70, 55, 40, 25]:
                buf = io.BytesIO()
                img.save(buf, 'JPEG', quality=quality, optimize=True)
                if buf.tell() <= max_bytes or quality == 25:
                    save_path.write_bytes(buf.getvalue())
                    # Verwijder originele PNG als we naar JPEG zijn gegaan
                    if save_path != path and path.exists():
                        path.unlink()
                    break
        else:
            img.save(save_path, 'PNG', optimize=True)

        return jsonify({
            'ok': True,
            'width': img.width,
            'height': img.height,
            'size': save_path.stat().st_size,
            'newName': save_path.name,
            'converted': save_path.name != filename
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/media/orphans', methods=['GET'])
def list_orphans():
    """Voorbeeld: welke bestanden zouden worden opgeruimd? Verwijdert niets."""
    orphans, recent = find_orphans()
    return jsonify({'files': orphans, 'count': len(orphans), 'size': sum(o['size'] for o in orphans),
                    'skipped_recent': recent, 'grace_min': ORPHAN_GRACE_MIN})

@app.route('/api/media/orphans', methods=['DELETE'])
@admin_required
def delete_orphans():
    """Verwijdert ongebruikte bestanden. ?dry_run=1 toont alleen wat er zou gebeuren.
    Body {"names": [...]} beperkt het tot die bestanden; ?include_recent=1 slaat de wachttijd over."""
    dry = request.args.get('dry_run') == '1'
    orphans, recent = find_orphans(include_recent=request.args.get('include_recent') == '1')
    body = request.get_json(silent=True) or {}
    names = body.get('names')
    if isinstance(names, list): orphans = [o for o in orphans if o['name'] in set(map(str, names))]
    deleted, errors = [], []
    if not dry:
        for o in orphans:
            try:
                (MEDIA_DIR / o['name']).unlink(missing_ok=True); deleted.append(o['name'])
            except OSError as e:
                errors.append({'name': o['name'], 'error': str(e)})
                log_event('media', 'error', f'Orphan verwijderen mislukt: {o["name"]}: {e}')
        if deleted: log_event('media', 'info', f'{len(deleted)} ongebruikte mediabestanden verwijderd', files=deleted[:50])
    return jsonify({'dry_run': dry, 'deleted': deleted if not dry else [], 'would_delete': [o['name'] for o in orphans] if dry else [],
                    'count': len(deleted) if not dry else len(orphans),
                    'freed': sum(o['size'] for o in orphans if o['name'] in deleted),
                    'skipped_recent': len(recent), 'errors': errors})

@app.route('/api/media/broken', methods=['GET'])
def broken_media_refs():
    """Onderdelen waarvan de foto of een document niet (meer) in de mediamap staat."""
    return jsonify(find_broken_refs())

def find_broken_refs():
    existing = {f.name for f in MEDIA_DIR.iterdir() if f.is_file()}
    out = []
    with db_conn() as db:
        for name, pid, pname, field, url in media_refs(db):
            if name not in existing:
                out.append({'partId': pid, 'partName': pname, 'field': field, 'url': url, 'file': name})
    return out

# ── BACKUP ────────────────────────────────────────────────────
# Bestandsnamen:  inventaris-2026-10-23.db                       (dagelijkse automatische backup)
#                 inventaris-2026-10-23_141502-pre-restore.db    (extra backup met label: handmatig, pre-restore,
#                                                                  pre-migratie, pre-repair, pre-import)
# Elke backup wordt na het maken gecontroleerd (integriteit + verplichte tabellen). Een backup die niet
# klopt wordt weggegooid en gemeld, zodat er nooit een "kapotte" backup tussen de goede blijft staan.
BACKUP_RE = re.compile(r'^inventaris-(\d{4}-\d{2}-\d{2})(?:_(\d{6})-([a-z0-9-]{1,30}))?\.db$')
BACKUP_LOCK  = threading.RLock()
BACKUP_STOP  = threading.Event()
BACKUP_STATE = {'last_error': None, 'last_error_at': None, 'last_success_at': None, 'scheduler': False}
_VALID_CACHE = {}

def count_rows(db, table):
    try: return db.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]
    except sqlite3.Error: return None

def check_db_file(path, quick=True):
    """Controleert een SQLite-bestand zonder het te wijzigen. Retourneert een rapport met errors/warnings."""
    rep = {'ok': False, 'errors': [], 'warnings': [], 'tables_missing': [], 'counts': {}, 'schema_version': None,
           'integrity': None}
    try:
        db = sqlite3.connect(f'file:{Path(path).as_posix()}?mode=ro', uri=True, timeout=10)
    except sqlite3.Error as e:
        rep['errors'].append(f'Kan bestand niet openen: {e}'); return rep
    try:
        db.row_factory = sqlite3.Row
        try:
            res = db.execute('PRAGMA quick_check' if quick else 'PRAGMA integrity_check').fetchall()
            rep['integrity'] = 'ok' if (len(res) == 1 and res[0][0] == 'ok') else '; '.join(str(r[0]) for r in res[:5])
        except sqlite3.Error as e:
            rep['integrity'] = f'fout: {e}'
        if rep['integrity'] != 'ok': rep['errors'].append(f'Integriteitscontrole mislukt: {rep["integrity"]}')
        try:
            tables = {r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()}
        except sqlite3.Error as e:
            rep['errors'].append(f'Kan tabellen niet lezen: {e}'); return rep
        rep['tables_missing'] = [t for t in REQUIRED_TABLES if t not in tables]
        if rep['tables_missing']: rep['errors'].append('Ontbrekende tabellen: ' + ', '.join(rep['tables_missing']))
        for t in REQUIRED_TABLES:
            if t in tables: rep['counts'][t] = count_rows(db, t)
        if 'meta' in tables:
            keys = {r[0]: r[1] for r in db.execute('SELECT key,value FROM meta').fetchall()}
            rep['schema_version'] = int(keys['schemaVersion']) if str(keys.get('schemaVersion', '')).isdigit() else 0
            missing_meta = [k for k in REQUIRED_META if k not in keys]
            if missing_meta: rep['warnings'].append('Ontbrekende metadata-rijen: ' + ', '.join(missing_meta))
            if rep['schema_version'] > SCHEMA_VERSION:
                rep['errors'].append(f'Backup komt van een nieuwere versie van de app (schema {rep["schema_version"]} > {SCHEMA_VERSION})')
    except sqlite3.Error as e:
        rep['errors'].append(f'Databasefout: {e}')
    finally:
        db.close()
    rep['ok'] = not rep['errors']
    return rep

def parse_backup_name(name):
    m = BACKUP_RE.match(name)
    if not m: return None
    d, t, tag = m.groups()
    try:
        dt = datetime.strptime(d + (t or '000000'), '%Y-%m-%d%H%M%S')
    except ValueError:
        return None
    return {'date': d, 'dt': dt, 'tag': tag or 'dagelijks'}

def validate_backup(path):
    """Gecachte controle (per bestand + wijzigingstijd + grootte)."""
    st = Path(path).stat()
    key = (str(path), st.st_mtime_ns, st.st_size)
    if key not in _VALID_CACHE:
        if len(_VALID_CACHE) > 200: _VALID_CACHE.clear()
        _VALID_CACHE[key] = check_db_file(path)
    return _VALID_CACHE[key]

def backup_infos():
    """Alle backups, nieuwste eerst, met validatiestatus."""
    out = []
    for f in BACKUP_DIR.glob('inventaris-*.db'):
        meta = parse_backup_name(f.name)
        if not meta or not f.is_file(): continue
        try: st = f.stat()
        except OSError: continue
        v = validate_backup(f)
        out.append({'name': f.name, 'size': st.st_size, 'date': meta['date'], 'tag': meta['tag'],
                    'ts': meta['dt'].isoformat(timespec='seconds'), '_dt': meta['dt'],
                    'valid': v['ok'], 'errors': v['errors'], 'warnings': v['warnings'],
                    'counts': v['counts'], 'schema_version': v['schema_version']})
    out.sort(key=lambda b: b['_dt'], reverse=True)
    return out

def _public(b):
    return {k: v for k, v in b.items() if not k.startswith('_')}

def plan_retention(infos=None, now=None):
    """Bepaalt welke backups opgeruimd worden. Regels:
      • Alleen backups ouder dan HB_BACKUP_RETENTION_DAYS komen in aanmerking.
      • De nieuwste geldige backup en de HB_BACKUP_KEEP_MIN nieuwste geldige backups blijven ALTIJD staan.
      • Ongeldige (kapotte) backups tellen nooit mee als "veilige" backup."""
    infos = backup_infos() if infos is None else infos
    now = now or datetime.now()
    valid = [b for b in infos if b['valid']]
    protected = {}
    for i, b in enumerate(valid[:max(1, BACKUP_KEEP_MIN)]):
        protected[b['name']] = 'nieuwste geldige backup' if i == 0 else f'een van de {max(1, BACKUP_KEEP_MIN)} nieuwste geldige backups'
    delete, keep = [], []
    for b in infos:
        age = (now - b['_dt']).total_seconds() / 86400
        if b['name'] in protected: keep.append({'name': b['name'], 'reason': protected[b['name']]})
        elif age > BACKUP_RETENTION_DAYS:
            delete.append({'name': b['name'], 'size': b['size'], 'age_days': round(age, 1),
                           'reason': 'ouder dan retentie' + ('' if b['valid'] else ' en ongeldig')})
        else: keep.append({'name': b['name'], 'reason': 'binnen retentieperiode'})
    return {'policy': {'retention_days': BACKUP_RETENTION_DAYS, 'keep_min': BACKUP_KEEP_MIN},
            'total': len(infos), 'valid': len(valid), 'keep': keep, 'delete': delete,
            'newest_valid': valid[0]['name'] if valid else None,
            'freed': sum(d['size'] for d in delete)}

def apply_retention(dry_run=False):
    with BACKUP_LOCK:
        plan = plan_retention()
        deleted = []
        if not dry_run:
            for d in plan['delete']:
                if d['name'] == plan['newest_valid']: continue   # extra vangnet
                try:
                    (BACKUP_DIR / d['name']).unlink(missing_ok=True); deleted.append(d['name'])
                    log_event('backup', 'info', f'Oude backup opgeruimd: {d["name"]} ({d["reason"]}, {d["age_days"]} dagen)')
                except OSError as e:
                    log_event('backup', 'error', f'Backup opruimen mislukt: {d["name"]}: {e}')
        plan['dry_run'] = dry_run
        plan['deleted'] = deleted
        return plan

def do_backup(tag=None, keep_retention=True):
    """Maakt een backup via de SQLite backup-API (veilig tijdens gebruik), controleert hem en ruimt daarna op."""
    tag = re.sub(r'[^a-z0-9-]', '', (tag or '').lower())[:30] or None
    with BACKUP_LOCK:
        now = datetime.now()
        name = f'inventaris-{now:%Y-%m-%d_%H%M%S}-{tag}.db' if tag else f'inventaris-{now:%Y-%m-%d}.db'
        final, tmp = BACKUP_DIR / name, BACKUP_DIR / (name + '.tmp')
        try:
            tmp.unlink(missing_ok=True)
            src = sqlite3.connect(str(DB_FILE)); dst = sqlite3.connect(str(tmp))
            try:
                src.backup(dst)
                dst.execute('PRAGMA journal_mode=DELETE')   # één zelfstandig bestand, geen -wal/-shm erbij
                dst.commit()
            finally:
                dst.close(); src.close()
            rep = check_db_file(tmp)
            if not rep['ok']:
                raise RuntimeError('Backup is na het maken niet geldig: ' + '; '.join(rep['errors']))
            os.replace(tmp, final)
        except Exception as e:
            tmp.unlink(missing_ok=True)
            BACKUP_STATE['last_error'] = f'{type(e).__name__}: {e}'
            BACKUP_STATE['last_error_at'] = datetime.now().isoformat(timespec='seconds')
            log_event('backup', 'error', f'Backup mislukt ({tag or "dagelijks"}): {e}')
            raise
        BACKUP_STATE['last_success_at'] = datetime.now().isoformat(timespec='seconds')
        BACKUP_STATE['last_error'] = None
        log_event('backup', 'info', f'Backup gemaakt: {name} ({final.stat().st_size} bytes)')
        if keep_retention:
            try: apply_retention()
            except Exception as e: log_event('backup', 'error', f'Retentie-opruiming mislukt: {e}')
        return name

def next_backup_time(now=None):
    now = now or datetime.now()
    try: hh, mm = [int(x) for x in BACKUP_TIME.split(':')[:2]]
    except Exception: hh, mm = 0, 0
    nxt = now.replace(hour=min(max(hh, 0), 23), minute=min(max(mm, 0), 59), second=0, microsecond=0)
    if nxt <= now: nxt += timedelta(days=1)
    return nxt

def backup_status():
    infos = backup_infos()
    newest_valid = next((b for b in infos if b['valid']), None)
    newest = infos[0] if infos else None
    age_h = None
    if newest_valid: age_h = round((datetime.now() - newest_valid['_dt']).total_seconds() / 3600, 1)
    current = newest_valid is not None and age_h is not None and age_h <= BACKUP_STALE_HOURS
    return {'count': len(infos), 'valid_count': sum(1 for b in infos if b['valid']),
            'invalid_count': sum(1 for b in infos if not b['valid']),
            'total_size': sum(b['size'] for b in infos),
            'last_valid': _public(newest_valid) if newest_valid else None,
            'newest': _public(newest) if newest else None,
            'age_hours': age_h, 'current': current, 'stale_after_hours': BACKUP_STALE_HOURS,
            'last_error': BACKUP_STATE['last_error'], 'last_error_at': BACKUP_STATE['last_error_at'],
            'next_scheduled': next_backup_time().isoformat(timespec='minutes'),
            'scheduler_running': BACKUP_STATE['scheduler'],
            'retention': {'days': BACKUP_RETENTION_DAYS, 'keep_min': BACKUP_KEEP_MIN}}

def auto_backup():
    """Achtergrondtaak: dagelijks op HB_BACKUP_TIME een backup. Mist de server die tijd (uit, herstart),
    dan wordt kort na het opstarten alsnog een backup gemaakt als de laatste ouder is dan 24 uur."""
    BACKUP_STATE['scheduler'] = True
    try:
        if BACKUP_STOP.wait(20): return
        try:
            st = backup_status()
            if st['age_hours'] is None or st['age_hours'] > 24:
                log_event('backup', 'info', 'Inhaalbackup bij opstarten (laatste backup is ouder dan 24 uur)')
                do_backup()
        except Exception as e:
            log_event('backup', 'error', f'Inhaalbackup mislukt: {e}')
        while not BACKUP_STOP.is_set():
            wait = max(1.0, (next_backup_time() - datetime.now()).total_seconds())
            if BACKUP_STOP.wait(wait): break
            for attempt in range(3):    # bij een fout: 15 minuten later opnieuw, max 3 pogingen
                try:
                    do_backup(); break
                except Exception:
                    if BACKUP_STOP.wait(900): return
            BACKUP_STOP.wait(60)
    finally:
        BACKUP_STATE['scheduler'] = False

def _backup_path(name):
    if not BACKUP_RE.match(name or ''): return None
    p = BACKUP_DIR / name
    return p if p.is_file() else None

@app.route('/api/backups', methods=['GET'])
def list_backups():
    return jsonify([_public(b) for b in backup_infos()])

@app.route('/api/backups', methods=['POST'])
@admin_required
def create_backup():
    try:
        name = do_backup(tag='handmatig')
    except Exception as e:
        return jsonify({'error': f'Backup mislukt: {e}'}), 500
    return jsonify({'ok': True, 'name': name}), 201

@app.route('/api/backups/<filename>', methods=['GET'])
def download_backup(filename):
    p = _backup_path(filename)
    if not BACKUP_RE.match(filename): return jsonify({'error': 'invalid'}), 400
    if not p: return jsonify({'error': 'not found'}), 404
    return send_file(p, as_attachment=True)

@app.route('/api/backups/<filename>', methods=['DELETE'])
@admin_required
def delete_backup(filename):
    p = _backup_path(filename)
    if not p: return jsonify({'error': 'not found'}), 404
    with BACKUP_LOCK:
        infos = backup_infos()
        newest_valid = next((b for b in infos if b['valid']), None)
        if newest_valid and newest_valid['name'] == filename:
            return jsonify({'error': 'Dit is de nieuwste geldige backup en wordt niet verwijderd. Maak eerst een nieuwe backup.'}), 409
        p.unlink(missing_ok=True)
    log_event('backup', 'info', f'Backup handmatig verwijderd: {filename}', ip=client_ip())
    return jsonify({'ok': True})

@app.route('/api/backups/<filename>/verify', methods=['POST'])
def verify_backup(filename):
    p = _backup_path(filename)
    if not p: return jsonify({'error': 'not found'}), 404
    rep = check_db_file(p, quick=False)   # volledige integriteitscontrole
    return jsonify(rep)

@app.route('/api/admin/retention', methods=['GET'])
def retention_report():
    plan = plan_retention()
    plan['status'] = backup_status()
    return jsonify(plan)

@app.route('/api/admin/retention/run', methods=['POST'])
@admin_required
def retention_run():
    dry = bool((request.get_json(silent=True) or {}).get('dry_run'))
    return jsonify(apply_retention(dry_run=dry))

# ── RESTORE (met verificatie vooraf en achteraf) ──────────────
def verify_live_db(expected_counts=None):
    """Controle van de actieve database na een restore: tabellen, metadata, minimale dataset en integriteit."""
    rep = check_db_file(DB_FILE, quick=False)
    rep['issues'] = None
    if expected_counts:
        for t in ('parts', 'categories', 'custom_locs', 'suppliers'):
            exp = expected_counts.get(t)
            if exp is not None and rep['counts'].get(t) != exp:
                rep['errors'].append(f'Aantal rijen in {t} klopt niet na restore: {rep["counts"].get(t)} i.p.v. {exp}')
    try:
        with db_conn() as db:
            rep['issues'] = summarize_issues(run_checks(db))
        if rep['counts'].get('parts'):
            rep['sample'] = None
            with db_conn() as db:
                row = db.execute('SELECT id,name FROM parts ORDER BY id LIMIT 1').fetchone()
                rep['sample'] = {'id': row['id'], 'name': row['name']} if row else None
                if row is None: rep['errors'].append('Geen onderdeel te lezen na restore')
    except Exception as e:
        rep['errors'].append(f'Controle na restore mislukt: {e}')
    rep['ok'] = not rep['errors']
    return rep

def _restore_file_into_live(path):
    src = sqlite3.connect(f'file:{Path(path).as_posix()}?mode=ro', uri=True)
    dst = sqlite3.connect(str(DB_FILE), timeout=30)
    try:
        src.backup(dst)
        dst.commit()
    finally:
        dst.close(); src.close()

@app.route('/api/backups/<filename>/restore', methods=['POST'])
@admin_required
def restore_backup(filename):
    """Zet een backup terug. Vereist {"confirm": "<bestandsnaam>"}; met {"dry_run": true} wordt alleen
    de controle vooraf uitgevoerd. Volgorde: controle backup → veiligheidsbackup van de huidige data →
    terugzetten → migraties → controle → bij een fout automatisch terug naar de veiligheidsbackup."""
    p = _backup_path(filename)
    if not p: return jsonify({'error': 'not found'}), 404
    body = request.get_json(silent=True) or {}
    pre = check_db_file(p, quick=False)
    if not pre['ok']:
        log_event('restore', 'error', f'Restore geweigerd, backup is niet geldig: {filename}', errors=pre['errors'])
        return jsonify({'error': 'Backup is niet geldig en wordt niet teruggezet', 'precheck': pre}), 422
    if body.get('dry_run'): return jsonify({'ok': True, 'dry_run': True, 'precheck': pre})
    if body.get('confirm') != filename:
        return jsonify({'error': 'Bevestiging vereist: stuur de bestandsnaam mee als "confirm"'}), 400
    with BACKUP_LOCK:
        try:
            safety = do_backup(tag='pre-restore', keep_retention=False)
        except Exception as e:
            return jsonify({'error': f'Veiligheidsbackup van de huidige data mislukt, restore afgebroken: {e}'}), 500
        log_event('restore', 'info', f'Restore gestart: {filename}', safety_backup=safety, ip=client_ip())
        rolled_back, rep = False, None
        try:
            _restore_file_into_live(p)
            run_migrations()
            rep = verify_live_db(pre['counts'])
        except Exception as e:
            rep = {'ok': False, 'errors': [f'Restore mislukt: {e}'], 'warnings': []}
        if not rep['ok']:
            try:
                _restore_file_into_live(BACKUP_DIR / safety); rolled_back = True
                log_event('restore', 'error', f'Restore van {filename} mislukt, teruggezet naar {safety}', errors=rep['errors'])
            except Exception as e:
                log_event('restore', 'error', f'Rollback mislukt! Zet {safety} handmatig terug: {e}')
            return jsonify({'ok': False, 'rolled_back': rolled_back, 'safety_backup': safety, 'verify': rep}), 500
        for w in rep.get('warnings', []): log_event('restore', 'warning', f'Na restore: {w}')
        log_event('restore', 'info', f'Restore geslaagd: {filename} ({rep["counts"].get("parts")} onderdelen)', safety_backup=safety)
        return jsonify({'ok': True, 'rolled_back': False, 'safety_backup': safety, 'verify': rep})

# ── INTEGRITEIT, GEZONDHEID & REPARATIE ───────────────────────
# run_checks() onderzoekt de database en geeft een lijst "issues". Elk issue heeft een code, ernst
# (error/warning/info), aantal, een paar voorbeelden en — als er een veilige oplossing is — een
# repair-actie. Repairs draaien altijd eerst als voorbeeld (dry-run) en vragen om bevestiging; vóór
# het echte uitvoeren wordt automatisch een backup gemaakt en de aangepaste ID's worden gelogd.
JSON_SPECS = {
    'parts':    [('docs', list), ('suppliers', list), ('extraLocs', list), ('related', list), ('tags', list)],
    'projects': [('items', list), ('buildHistory', list), ('extra', dict)],
    'orders':   [('items', list)],
}

def _json_problem(raw, typ):
    if raw is None or raw == '': return None
    try: v = json.loads(raw)
    except (ValueError, TypeError): return 'ongeldige JSON'
    return None if isinstance(v, typ) else f'verkeerd type ({type(v).__name__}, verwacht {typ.__name__})'

def _tables(db):
    return {r[0] for r in db.execute("SELECT name FROM sqlite_master WHERE type='table'").fetchall()}

def _ctx(db):
    t = _tables(db)
    def col(sql): return [r[0] for r in db.execute(sql).fetchall()]
    return {
        'tables': t,
        'cat_ids':  set(col('SELECT id FROM categories')) if 'categories' in t else set(),
        'loc_ids':  {str(x) for x in col('SELECT id FROM custom_locs')} if 'custom_locs' in t else set(),
        'part_ids': set(col('SELECT id FROM parts')) if 'parts' in t else set(),
        'supp_ids': set(col('SELECT id FROM suppliers')) if 'suppliers' in t else set(),
    }

def find_malformed_json(db):
    out = []
    t = _tables(db)
    for table, specs in JSON_SPECS.items():
        if table not in t: continue
        cols = ','.join(f for f, _ in specs)
        for r in db.execute(f'SELECT id,{cols} FROM {table}').fetchall():
            for f, typ in specs:
                prob = _json_problem(r[f], typ)
                if prob: out.append({'table': table, 'id': r['id'], 'field': f, 'problem': prob, 'raw': str(r[f])[:300]})
    return out

def find_invalid_values(db):
    out = []
    for r in db.execute('SELECT id,name,stock,minStock,typeof(stock) ts,typeof(minStock) tm,active FROM parts').fetchall():
        probs = []
        if not (r['name'] or '').strip(): probs.append('naam leeg')
        if r['stock'] is None or r['ts'] != 'integer' or r['stock'] < 0: probs.append(f'voorraad ongeldig ({r["stock"]!r})')
        if r['minStock'] is None or r['tm'] != 'integer' or r['minStock'] < 0: probs.append(f'minimum ongeldig ({r["minStock"]!r})')
        if r['active'] is None: probs.append('actief-vlag ontbreekt')
        if probs: out.append({'id': r['id'], 'name': r['name'], 'problems': probs})
    return out

def find_bad_refs(db, ctx):
    """Verwijzingen naar iets dat niet (meer) bestaat."""
    cat_bad, loc_bad, extra_bad, related_bad, supp_bad = [], [], [], [], []
    for r in db.execute('SELECT id,name,catId,locId,extraLocs,related,suppliers FROM parts').fetchall():
        if r['catId'] is not None and r['catId'] not in ctx['cat_ids']:
            cat_bad.append({'id': r['id'], 'name': r['name'], 'catId': r['catId']})
        if r['locId'] is not None and str(r['locId']) not in ctx['loc_ids']:
            loc_bad.append({'id': r['id'], 'name': r['name'], 'locId': r['locId']})
        bad = [x for x in _jlist(r['extraLocs']) if isinstance(x, (int, str)) and str(x) not in ctx['loc_ids']]
        if bad: extra_bad.append({'id': r['id'], 'name': r['name'], 'bad': bad})
        bad = [x for x in _jlist(r['related']) if isinstance(x, (int, str)) and
               (not str(x).lstrip('-').isdigit() or int(x) not in ctx['part_ids'] or int(x) == r['id'])]
        if bad: related_bad.append({'id': r['id'], 'name': r['name'], 'bad': bad})
        bad = [x.get('suppId') for x in _jlist(r['suppliers']) if isinstance(x, dict) and x.get('suppId') not in ctx['supp_ids']]
        if bad: supp_bad.append({'id': r['id'], 'name': r['name'], 'bad': bad})
    return cat_bad, loc_bad, extra_bad, related_bad, supp_bad

def find_orphan_categories(db, ctx):
    return [{'id': r['id'], 'name': r['name'], 'parent': r['parent']}
            for r in db.execute('SELECT id,name,parent FROM categories').fetchall()
            if r['parent'] is not None and (r['parent'] not in ctx['cat_ids'] or r['parent'] == r['id'])]

def find_duplicate_locations(db):
    """Locaties met dezelfde naam (hoofdletters/spaties genegeerd). 'keep' = laagste ID."""
    groups = {}
    for r in db.execute('SELECT id,name FROM custom_locs').fetchall():
        groups.setdefault(re.sub(r'\s+', ' ', (r['name'] or '').strip().lower()), []).append((str(r['id']), r['name']))
    out = []
    for key, items in groups.items():
        if len(items) > 1:
            items.sort(key=lambda x: (0, int(x[0])) if x[0].isdigit() else (1, x[0]))
            out.append({'name': items[0][1], 'keep': items[0][0], 'ids': [i[0] for i in items]})
    return out

def find_duplicate_location_ids(db):
    """Verschillende tekst-ID's die hetzelfde getal zijn (bijv. '5' en '05')."""
    groups = {}
    for r in db.execute('SELECT id FROM custom_locs').fetchall():
        sid = str(r['id'])
        if sid.strip().isdigit(): groups.setdefault(int(sid), []).append(sid)
    return [{'id': k, 'variants': v} for k, v in groups.items() if len(v) > 1]

def find_meta_problems(db, ctx):
    t = ctx['tables']
    if 'meta' not in t: return {'missing': list(REQUIRED_META), 'behind': [], 'needed': {}}
    meta = {r[0]: r[1] for r in db.execute('SELECT key,value FROM meta').fetchall()}
    def mx(sql):
        try: return db.execute(sql).fetchone()[0] or 0
        except sqlite3.Error: return 0
    needed = {
        'nextId': mx('SELECT MAX(id) FROM parts') + 1,
        'nextLocId': max(300, max([int(i) for i in ctx['loc_ids'] if i.isdigit()] or [0]) + 1),
        'nextSuppId': max(10, mx('SELECT MAX(id) FROM suppliers') + 1),
        'nextProjectId': mx('SELECT MAX(id) FROM projects') + 1,
        'nextOrderId': mx('SELECT MAX(id) FROM orders') + 1,
    }
    missing = [k for k in REQUIRED_META if k not in meta]
    behind = []
    for k, need in needed.items():
        if k in meta:
            try: cur = int(meta[k])
            except (TypeError, ValueError): behind.append({'key': k, 'current': meta[k], 'needed': need}); continue
            if cur < need: behind.append({'key': k, 'current': cur, 'needed': need})
    return {'missing': missing, 'behind': behind, 'needed': needed}

def find_bom_refs(db, ctx):
    out = []
    if 'projects' not in ctx['tables']: return out
    for r in db.execute('SELECT id,name,items FROM projects').fetchall():
        bad = [i.get('partId') for i in _jlist(r['items']) if isinstance(i, dict) and i.get('partId') not in ctx['part_ids']]
        if bad: out.append({'id': r['id'], 'name': r['name'], 'bad': bad})
    return out

def _issue(code, severity, title, items, repair=None, inspect=None, detail='', count=None):
    return {'code': code, 'severity': severity, 'title': title, 'count': len(items) if count is None else count,
            'items': items[:50], 'repair': repair, 'inspect': inspect, 'detail': detail}

def run_checks(db, include_media=True):
    issues = []
    ctx = _ctx(db)
    missing_t = [t for t in REQUIRED_TABLES if t not in ctx['tables']]
    if missing_t:
        issues.append(_issue('tables_missing', 'error', 'Verplichte tabellen ontbreken', missing_t,
                             detail='Zet een backup terug (Back-ups → Terugzetten).'))
        return issues   # verdere controles hebben die tabellen nodig
    mp = find_meta_problems(db, ctx)
    if mp['missing'] or mp['behind']:
        items = [{'key': k, 'problem': 'ontbreekt'} for k in mp['missing']] + \
                [{'key': b['key'], 'problem': f'staat op {b["current"]}, moet minstens {b["needed"]} zijn'} for b in mp['behind']]
        issues.append(_issue('meta_inconsistent', 'error' if mp['behind'] else 'warning',
                             'Metadata-tellers kloppen niet' if mp['behind'] else 'Metadata-rijen ontbreken', items,
                             repair='fix_meta',
                             detail='Een te lage teller laat het toevoegen van nieuwe onderdelen/locaties/orders mislukken.'))
    sv = get_schema_version(db)
    if sv < SCHEMA_VERSION:
        issues.append(_issue('schema_outdated', 'warning', f'Databaseschema is {sv}, nieuwste is {SCHEMA_VERSION}',
                             [{'version': sv, 'latest': SCHEMA_VERSION}], detail='Herstart de app om migraties uit te voeren.'))
    mj = find_malformed_json(db)
    if mj:
        issues.append(_issue('malformed_json', 'error', 'Kapotte JSON in metadata-velden', mj, repair='fix_json',
                             detail='Herstellen zet het veld terug naar leeg; de oude waarde wordt in het logboek bewaard.'))
    iv = find_invalid_values(db)
    if iv:
        issues.append(_issue('invalid_values', 'warning', 'Onderdelen met ongeldige waarden (naam/voorraad/minimum)', iv, repair='fix_values'))
    cat_bad, loc_bad, extra_bad, related_bad, supp_bad = find_bad_refs(db, ctx)
    if cat_bad: issues.append(_issue('invalid_category', 'warning', 'Onderdelen met een categorie die niet bestaat', cat_bad,
                                     repair='clear_invalid_category', inspect='parts'))
    if loc_bad: issues.append(_issue('invalid_location', 'warning', 'Onderdelen met een locatie die niet bestaat', loc_bad,
                                     repair='clear_invalid_location', inspect='parts'))
    if extra_bad: issues.append(_issue('invalid_extra_locations', 'warning', 'Extra locaties die niet bestaan', extra_bad,
                                       repair='clean_extra_locs', inspect='parts'))
    if related_bad: issues.append(_issue('invalid_related', 'info', 'Gerelateerde onderdelen die niet bestaan', related_bad,
                                         repair='clean_related', inspect='parts'))
    if supp_bad: issues.append(_issue('invalid_suppliers', 'info', 'Leveranciersregels met een leverancier die niet bestaat', supp_bad,
                                      inspect='parts', detail='Alleen melden; controleer de prijzen handmatig.'))
    oc = find_orphan_categories(db, ctx)
    if oc: issues.append(_issue('orphan_categories', 'warning', 'Categorieën met een hoofdcategorie die niet bestaat', oc,
                                repair='fix_orphan_categories', detail='Herstellen maakt ze hoofdcategorie.'))
    dl = find_duplicate_locations(db)
    if dl: issues.append(_issue('duplicate_locations', 'warning', 'Dubbele locatienamen', dl, repair='merge_duplicate_locations',
                                detail='Samenvoegen verplaatst onderdelen naar de locatie met het laagste ID en verwijdert de dubbelen.'))
    di = find_duplicate_location_ids(db)
    if di: issues.append(_issue('duplicate_location_ids', 'warning', 'Locatie-ID\'s die hetzelfde getal zijn', di))
    bom = find_bom_refs(db, ctx)
    if bom: issues.append(_issue('invalid_bom', 'info', 'Projecten met onderdelen die niet meer bestaan', bom, inspect='projects'))
    if include_media:
        broken = find_broken_refs()
        if broken: issues.append(_issue('broken_media', 'warning', 'Foto\'s/documenten die ontbreken in de mediamap', broken,
                                        repair='clear_broken_media', inspect='parts'))
        orphans, recent = find_orphans()
        if orphans: issues.append(_issue('orphan_media', 'info', 'Ongebruikte mediabestanden', orphans, inspect='media',
                                         detail=f'Samen {sum(o["size"] for o in orphans) // 1024} KB; opruimen via Media-tab (met voorbeeld).'))
    return issues

def summarize_issues(issues):
    e = sum(1 for i in issues if i['severity'] == 'error')
    w = sum(1 for i in issues if i['severity'] == 'warning')
    n = sum(1 for i in issues if i['severity'] == 'info')
    return {'errors': e, 'warnings': w, 'infos': n, 'total': len(issues),
            'status': 'error' if e else 'warning' if w else 'ok'}

# ── REPAIRS ───────────────────────────────────────────────────
# Elke repair krijgt (db, ctx, apply). Bij apply=False wordt alleen berekend wat er zou veranderen.
def _rep_fix_meta(db, ctx, apply):
    mp = find_meta_problems(db, ctx)
    changes = []
    for k in mp['missing']: changes.append({'key': k, 'to': mp['needed'].get(k, 1)})
    for b in mp['behind']: changes.append({'key': b['key'], 'to': b['needed']})
    if apply:
        for c in changes: set_meta(db, c['key'], c['to'])
    return {'affected': [c['key'] for c in changes], 'changes': changes}

def _rep_fix_json(db, ctx, apply):
    probs = find_malformed_json(db)
    if apply:
        for pr in probs:
            default = '{}' if pr['field'] == 'extra' else '[]'
            log_event('repair', 'warning', f'JSON hersteld {pr["table"]}#{pr["id"]}.{pr["field"]} ({pr["problem"]}); oude waarde: {pr["raw"]}')
            db.execute(f'UPDATE {pr["table"]} SET {pr["field"]}=? WHERE id=?', (default, pr['id']))
    return {'affected': [f'{p["table"]}#{p["id"]}.{p["field"]}' for p in probs], 'changes': len(probs)}

def _rep_fix_values(db, ctx, apply):
    probs = find_invalid_values(db)
    if apply:
        for pr in probs:
            db.execute("""UPDATE parts SET
                name = CASE WHEN TRIM(COALESCE(name,''))='' THEN '(naamloos #' || id || ')' ELSE name END,
                stock = CASE WHEN stock IS NULL OR stock < 0 THEN 0 ELSE CAST(stock AS INTEGER) END,
                minStock = CASE WHEN minStock IS NULL OR minStock < 0 THEN 0 ELSE CAST(minStock AS INTEGER) END,
                active = COALESCE(active, 1) WHERE id=?""", (pr['id'],))
    return {'affected': [p['id'] for p in probs], 'changes': len(probs)}

def _rep_clear_invalid_category(db, ctx, apply):
    bad = find_bad_refs(db, ctx)[0]
    if apply:
        for b in bad: db.execute('UPDATE parts SET catId=NULL WHERE id=?', (b['id'],))
    return {'affected': [b['id'] for b in bad], 'changes': len(bad)}

def _rep_clear_invalid_location(db, ctx, apply):
    bad = find_bad_refs(db, ctx)[1]
    if apply:
        for b in bad: db.execute('UPDATE parts SET locId=NULL WHERE id=?', (b['id'],))
    return {'affected': [b['id'] for b in bad], 'changes': len(bad)}

def _rep_clean_list_field(field, bad_idx):
    def run(db, ctx, apply):
        bad = find_bad_refs(db, ctx)[bad_idx]
        if apply:
            for b in bad:
                row = db.execute(f'SELECT {field} FROM parts WHERE id=?', (b['id'],)).fetchone()
                badset = {str(x) for x in b['bad']}
                keep = [x for x in _jlist(row[field]) if str(x) not in badset]
                db.execute(f'UPDATE parts SET {field}=? WHERE id=?', (json.dumps(keep), b['id']))
        return {'affected': [b['id'] for b in bad], 'changes': len(bad)}
    return run

def _rep_fix_orphan_categories(db, ctx, apply):
    oc = find_orphan_categories(db, ctx)
    if apply:
        for c in oc: db.execute('UPDATE categories SET parent=NULL WHERE id=?', (c['id'],))
    return {'affected': [c['id'] for c in oc], 'changes': len(oc)}

def _rep_merge_duplicate_locations(db, ctx, apply):
    groups = find_duplicate_locations(db)
    affected = []
    for g in groups:
        keep = g['keep']
        for dup in g['ids']:
            if dup == keep: continue
            affected.append({'removed': dup, 'merged_into': keep, 'name': g['name']})
            if not apply: continue
            if dup.isdigit() and keep.isdigit():
                db.execute('UPDATE parts SET locId=? WHERE locId=?', (int(keep), int(dup)))
            for r in db.execute('SELECT id,extraLocs FROM parts').fetchall():
                lst = _jlist(r['extraLocs'])
                if any(str(x) == dup for x in lst):
                    new = []
                    for x in lst:
                        x = keep if str(x) == dup else x
                        if str(x) not in {str(y) for y in new}: new.append(x)
                    db.execute('UPDATE parts SET extraLocs=? WHERE id=?', (json.dumps(new), r['id']))
            db.execute('DELETE FROM custom_locs WHERE id=?', (dup,))
    return {'affected': affected, 'changes': len(affected)}

def _rep_clear_broken_media(db, ctx, apply):
    broken = find_broken_refs()
    if apply:
        by_part = {}
        for b in broken: by_part.setdefault(b['partId'], []).append(b)
        for pid, items in by_part.items():
            row = db.execute('SELECT img,docs FROM parts WHERE id=?', (pid,)).fetchone()
            gone = {b['file'] for b in items}
            img = '' if _media_name(row['img']) in gone else row['img']
            docs = [d for d in _jlist(row['docs']) if not (isinstance(d, dict) and _media_name(d.get('url')) in gone)]
            db.execute('UPDATE parts SET img=?, docs=? WHERE id=?', (img, json.dumps(docs), pid))
    return {'affected': sorted({b['partId'] for b in broken}), 'changes': len(broken)}

REPAIRS = {
    'fix_meta': ('Metadata-tellers herstellen', _rep_fix_meta),
    'fix_json': ('Kapotte JSON-velden resetten', _rep_fix_json),
    'fix_values': ('Ongeldige waarden corrigeren', _rep_fix_values),
    'clear_invalid_category': ('Ongeldige categorieën leegmaken', _rep_clear_invalid_category),
    'clear_invalid_location': ('Ongeldige locaties leegmaken', _rep_clear_invalid_location),
    'clean_extra_locs': ('Ongeldige extra locaties verwijderen', _rep_clean_list_field('extraLocs', 2)),
    'clean_related': ('Ongeldige gerelateerde onderdelen verwijderen', _rep_clean_list_field('related', 3)),
    'fix_orphan_categories': ('Wees-categorieën hoofdcategorie maken', _rep_fix_orphan_categories),
    'merge_duplicate_locations': ('Dubbele locaties samenvoegen', _rep_merge_duplicate_locations),
    'clear_broken_media': ('Ontbrekende foto-/documentverwijzingen wissen', _rep_clear_broken_media),
}

_CHECK_CACHE = {'t': 0, 'issues': None}

@app.route('/api/admin/repair', methods=['POST'])
@admin_required
def admin_repair():
    """Body: {"action": "...", "confirm": true}. Zonder confirm (of met dry_run) krijg je alleen het voorbeeld
    met de betrokken ID's. Met confirm: eerst een backup, dan repareren, en alles wordt gelogd."""
    body = request.get_json(silent=True) or {}
    action = body.get('action')
    if action not in REPAIRS: return jsonify({'error': 'Onbekende actie', 'actions': list(REPAIRS)}), 400
    label, fn = REPAIRS[action]
    with db_conn() as db:
        preview = fn(db, _ctx(db), False)
    if body.get('dry_run') or body.get('confirm') is not True:
        return jsonify({'action': action, 'label': label, 'preview': True, 'confirm_required': True, **preview})
    if not preview['affected']:
        return jsonify({'action': action, 'label': label, 'preview': False, 'affected': [], 'changes': 0, 'note': 'Niets te herstellen'})
    try:
        safety = do_backup(tag='pre-repair', keep_retention=False)
    except Exception as e:
        return jsonify({'error': f'Veiligheidsbackup mislukt, reparatie afgebroken: {e}'}), 500
    try:
        with db_conn() as db:
            result = fn(db, _ctx(db), True)
    except Exception as e:
        log_event('repair', 'error', f'Reparatie {action} mislukt (niets gewijzigd): {e}')
        return jsonify({'error': f'Reparatie mislukt, er is niets gewijzigd: {e}', 'safety_backup': safety}), 500
    log_event('repair', 'info', f'Reparatie uitgevoerd: {action}', affected=result['affected'][:200], count=result['changes'],
              safety_backup=safety, ip=client_ip())
    _CHECK_CACHE['t'] = 0
    with db_conn() as db:
        summary = summarize_issues(run_checks(db))
    return jsonify({'action': action, 'label': label, 'preview': False, 'safety_backup': safety, 'summary': summary, **result})

# ── SYSTEEM, OPSLAG & DASHBOARD ───────────────────────────────
def _dir_size(path, skip_hidden=True):
    total, n = 0, 0
    try:
        for f in Path(path).iterdir():
            try:
                if f.is_file() and not (skip_hidden and f.name.startswith('.')): total += f.stat().st_size; n += 1
            except OSError: pass
    except OSError: pass
    return total, n

def _file_size(p):
    try: return Path(p).stat().st_size
    except OSError: return 0

def storage_report():
    db_size = _file_size(DB_FILE)
    wal_size = _file_size(str(DB_FILE) + '-wal')
    media_size, media_files = _dir_size(MEDIA_DIR)
    backup_size, backup_files = _dir_size(BACKUP_DIR)
    log_size, _ = _dir_size(LOG_DIR)
    disks, seen = [], {}
    for label, path in (('data', DATA_DIR), ('media', MEDIA_DIR), ('backups', BACKUP_DIR)):
        try:
            dev = Path(path).stat().st_dev
            if dev in seen: seen[dev]['paths'].append(label); continue
            u = shutil.disk_usage(path)
        except OSError: continue
        pct = round(u.used / u.total * 100, 1) if u.total else 0
        free_mb = u.free / 1048576
        level = 'critical' if (pct >= DISK_CRIT_PCT or free_mb < DISK_WARN_FREE_MB / 2) else \
                'warning' if (pct >= DISK_WARN_PCT or free_mb < DISK_WARN_FREE_MB) else 'ok'
        d = {'paths': [label], 'total': u.total, 'used': u.used, 'free': u.free, 'percent': pct, 'level': level}
        seen[dev] = d; disks.append(d)
    warnings = []
    for d in disks:
        names = '/'.join(d['paths'])
        if d['level'] == 'critical': warnings.append({'level': 'error', 'message': f'Schijf ({names}) bijna vol: {d["percent"]}% gebruikt, {d["free"] // 1048576} MB vrij'})
        elif d['level'] == 'warning': warnings.append({'level': 'warning', 'message': f'Schijf ({names}) raakt vol: {d["percent"]}% gebruikt, {d["free"] // 1048576} MB vrij'})
    quota = None
    if MEDIA_MAX_MB:
        quota = {'limit': MEDIA_MAX_MB * 1048576, 'used': media_size, 'percent': round(media_size / (MEDIA_MAX_MB * 1048576) * 100, 1)}
        if quota['percent'] >= 90: warnings.append({'level': 'warning', 'message': f'Mediamap bijna op de ingestelde limiet ({quota["percent"]}% van {MEDIA_MAX_MB} MB)'})
    worst = 'error' if any(w['level'] == 'error' for w in warnings) else 'warning' if warnings else 'ok'
    return {'db_size': db_size, 'wal_size': wal_size, 'media_size': media_size, 'media_files': media_files,
            'backup_size': backup_size, 'backup_files': backup_files, 'log_size': log_size, 'disks': disks,
            'media_quota': quota, 'warnings': warnings, 'status': worst,
            'thresholds': {'warn_pct': DISK_WARN_PCT, 'crit_pct': DISK_CRIT_PCT, 'warn_free_mb': DISK_WARN_FREE_MB}}

def _has_module(name):
    try: __import__(name); return True
    except ImportError: return False

def system_info():
    import flask
    up = int(time.time() - START_TIME)
    return {'version': APP_VERSION, 'build': APP_BUILD, 'schema_version': get_schema_version(), 'schema_latest': SCHEMA_VERSION,
            'started_at': START_DT.astimezone().isoformat(timespec='seconds'), 'uptime_seconds': up,
            'python': platform.python_version(), 'platform': platform.platform(), 'flask': flask.__version__,
            'sqlite': sqlite3.sqlite_version, 'pillow': _has_module('PIL'), 'openpyxl': _has_module('openpyxl'),
            'gemini_configured': bool(GEMINI_API_KEY), 'telegram_configured': bool(TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID),
            'admin_token_required': bool(ADMIN_TOKEN),
            'settings': {'backup_time': BACKUP_TIME, 'backup_retention_days': BACKUP_RETENTION_DAYS, 'backup_keep_min': BACKUP_KEEP_MIN,
                         'backup_stale_hours': BACKUP_STALE_HOURS, 'max_upload_mb': MAX_UPLOAD_MB, 'media_max_mb': MEDIA_MAX_MB,
                         'orphan_grace_min': ORPHAN_GRACE_MIN, 'log_max_mb': LOG_MAX_MB, 'log_backups': LOG_BACKUPS}}

def db_health():
    h = {'exists': DB_FILE.exists(), 'size': _file_size(DB_FILE), 'readable': False, 'writable': False,
         'integrity': None, 'tables': {}, 'schema_version': None, 'schema_latest': SCHEMA_VERSION}
    try:
        with db_conn() as db:
            h['readable'] = True
            res = db.execute('PRAGMA quick_check').fetchall()
            h['integrity'] = 'ok' if (len(res) == 1 and res[0][0] == 'ok') else '; '.join(str(r[0]) for r in res[:5])
            t = _tables(db)
            for name in REQUIRED_TABLES:
                h['tables'][name] = {'exists': name in t, 'rows': count_rows(db, name) if name in t else None}
            h['schema_version'] = get_schema_version(db)
            h['writable'] = True
            db.execute("INSERT OR REPLACE INTO meta VALUES ('lastHealthCheck', ?)", (datetime.now().isoformat(timespec='seconds'),))
    except sqlite3.Error as e:
        h['error'] = str(e)
    return h

def folder_health():
    out = {}
    for label, path in (('data', DATA_DIR), ('media', MEDIA_DIR), ('backups', BACKUP_DIR), ('logs', LOG_DIR)):
        ok = Path(path).is_dir() and os.access(path, os.W_OK)
        out[label] = {'exists': Path(path).is_dir(), 'writable': ok}
    return out

def full_health(include_media=True):
    with db_conn() as db:
        issues = run_checks(db, include_media=include_media)
    dbh = db_health()
    folders = folder_health()
    backup = backup_status()
    storage = storage_report()
    # Extra signalen uit infrastructuur → ook als issues, zodat alles op één plek staat
    if dbh['integrity'] != 'ok':
        issues.insert(0, _issue('sqlite_integrity', 'error', 'SQLite-integriteitscontrole mislukt', [{'result': dbh['integrity']}],
                                detail='De database is beschadigd. Zet een geldige backup terug.'))
    for label, f in folders.items():
        if not f['exists'] or not f['writable']:
            issues.insert(0, _issue(f'folder_{label}', 'error', f'Map "{label}" ontbreekt of is niet beschrijfbaar', [{'folder': label}]))
    if not backup['current']:
        sev = 'error' if backup['valid_count'] == 0 else 'warning'
        msg = 'Er is nog geen geldige backup' if backup['valid_count'] == 0 else f'Laatste geldige backup is {backup["age_hours"]} uur oud'
        issues.append(_issue('backup_stale', sev, msg, [{'age_hours': backup['age_hours']}],
                             repair='create_backup', detail='Maak nu een backup via Back-ups.'))
    if backup['invalid_count']:
        bad = [{'name': b['name'], 'errors': b['errors']} for b in backup_infos() if not b['valid']]
        issues.append(_issue('backup_invalid', 'warning', f'{backup["invalid_count"]} backup(s) zijn niet geldig', bad))
    if backup['last_error']:
        issues.append(_issue('backup_error', 'error', 'Laatste backup-poging mislukt', [{'error': backup['last_error'], 'at': backup['last_error_at']}]))
    for w in storage['warnings']:
        issues.append(_issue('storage', 'error' if w['level'] == 'error' else 'warning', w['message'], [{'message': w['message']}]))
    summary = summarize_issues(issues)
    return {'status': summary['status'], 'checked_at': datetime.now().isoformat(timespec='seconds'), 'summary': summary,
            'database': dbh, 'folders': folders, 'backup': backup, 'storage': storage, 'issues': issues,
            'repair_labels': {k: v[0] for k, v in REPAIRS.items()}}

@app.route('/api/health', methods=['GET'])
def public_health():
    """Lichtgewicht status voor Docker-healthcheck / monitoring (geen details)."""
    try:
        with db_conn() as db: db.execute('SELECT 1 FROM parts LIMIT 1')
        return jsonify({'status': 'ok', 'version': APP_VERSION})
    except Exception as e:
        return jsonify({'status': 'error', 'error': str(e)}), 503

@app.route('/api/admin/health', methods=['GET'])
def admin_health():
    return jsonify(full_health())

@app.route('/api/admin/integrity', methods=['GET'])
def admin_integrity():
    """Alleen de integriteitscontroles (database, metadata, verwijzingen, media) — geen opslag/backup-info."""
    with db_conn() as db:
        issues = run_checks(db)
    return jsonify({'summary': summarize_issues(issues), 'issues': issues, 'schema_version': get_schema_version(),
                    'schema_latest': SCHEMA_VERSION, 'checked_at': datetime.now().isoformat(timespec='seconds')})

@app.route('/api/admin/system', methods=['GET'])
def admin_system():
    return jsonify({'system': system_info(), 'storage': storage_report()})

@app.route('/api/admin/overview', methods=['GET'])
def admin_overview():
    """Alles voor het beheer-dashboard in één aanroep."""
    h = full_health()
    log = log_summary()
    return jsonify({'system': system_info(), 'health': {k: h[k] for k in ('status', 'summary', 'database', 'folders', 'issues', 'checked_at', 'repair_labels')},
                    'storage': h['storage'], 'backup': h['backup'], 'log': log})

# ── LOGBOEK ───────────────────────────────────────────────────
LOG_LINE = re.compile(r'^(\d{4}-\d\d-\d\d \d\d:\d\d:\d\d) \| (\w+) \| ([\w-]+) \| (.*)$')

def read_log(limit=300, level=None, category=None, q=None, since=None):
    """Leest het einde van het logbestand (en zo nodig het vorige, geroteerde bestand)."""
    files = [LOG_FILE] + [Path(f'{LOG_FILE}.{i}') for i in range(1, 3)]
    entries = []
    for f in files:
        if not f.exists(): continue
        try:
            with open(f, 'rb') as fh:
                fh.seek(0, os.SEEK_END); size = fh.tell(); fh.seek(max(0, size - 768 * 1024))
                text = fh.read().decode('utf-8', 'replace')
        except OSError: continue
        for line in reversed(text.splitlines()):
            m = LOG_LINE.match(line)
            if not m: continue
            ts, lvl, cat, msg = m.groups()
            if since and ts < since: break
            entries.append({'ts': ts, 'level': lvl, 'category': cat, 'message': msg})
        if len(entries) >= limit * 4: break
    rank = {'INFO': 0, 'WARNING': 1, 'ERROR': 2, 'CRITICAL': 2}
    if level: entries = [e for e in entries if rank.get(e['level'], 0) >= rank.get(level.upper(), 0)]
    if category: entries = [e for e in entries if e['category'] == category]
    if q: entries = [e for e in entries if q.lower() in e['message'].lower()]
    entries.sort(key=lambda e: e['ts'], reverse=True)
    return entries[:limit]

def log_summary():
    since = (datetime.now() - timedelta(hours=24)).strftime('%Y-%m-%d %H:%M:%S')
    recent = read_log(limit=2000, level='warning', since=since)
    by_cat = {}
    for e in recent:
        c = by_cat.setdefault(e['category'], {'errors': 0, 'warnings': 0, 'last': None})
        c['errors' if e['level'] in ('ERROR', 'CRITICAL') else 'warnings'] += 1
        if c['last'] is None: c['last'] = {'ts': e['ts'], 'message': e['message'][:200]}
    return {'window_hours': 24, 'errors': sum(1 for e in recent if e['level'] in ('ERROR', 'CRITICAL')),
            'warnings': sum(1 for e in recent if e['level'] == 'WARNING'), 'by_category': by_cat,
            'last_errors': [e for e in recent if e['level'] in ('ERROR', 'CRITICAL')][:5],
            'file_size': _file_size(LOG_FILE), 'rotation': {'max_mb': LOG_MAX_MB, 'backups': LOG_BACKUPS}}

@app.route('/api/admin/logs', methods=['GET'])
def admin_logs():
    try: limit = min(max(int(request.args.get('limit', 200)), 1), 1000)
    except ValueError: limit = 200
    return jsonify({'entries': read_log(limit, request.args.get('level'), request.args.get('category'), request.args.get('q')),
                    'summary': log_summary()})

@app.route('/api/admin/logs/download', methods=['GET'])
def admin_logs_download():
    if not LOG_FILE.exists(): return jsonify({'error': 'Nog geen logbestand'}), 404
    return send_file(LOG_FILE, as_attachment=True, download_name='inventaris.log')


# ── IMPORT / EXPORT (CSV, Excel, JSON) ────────────────────────
# Importeren gaat in twee stappen: (1) /api/import/preview leest het bestand, controleert elke rij en
# laat zien wat er zou gebeuren — er wordt NIETS geschreven; (2) /api/import/commit past precies dat
# plan toe, in één transactie, na een automatische backup. Annuleren = de preview weggooien.
IMPORT_FIELDS = {
    'name':       {'label': 'Naam', 'required': True, 'aliases': ['naam', 'name', 'onderdeel', 'part', 'partname', 'titel']},
    'desc':       {'label': 'Beschrijving', 'aliases': ['beschrijving', 'omschrijving', 'desc', 'description']},
    'IPN':        {'label': 'IPN / artikelnummer', 'aliases': ['ipn', 'artikelnummer', 'sku', 'partnumber', 'partnummer', 'mpn', 'artnr']},
    'link':       {'label': 'Link', 'aliases': ['link', 'url', 'website']},
    'stock':      {'label': 'Voorraad', 'aliases': ['voorraad', 'stock', 'aantal', 'qty', 'quantity', 'hoeveelheid']},
    'minStock':   {'label': 'Minimum voorraad', 'aliases': ['minvoorraad', 'minstock', 'minimum', 'min', 'minimumvoorraad']},
    'category':   {'label': 'Categorie', 'aliases': ['categorie', 'category', 'cat']},
    'location':   {'label': 'Locatie', 'aliases': ['locatie', 'location', 'loc', 'opslag']},
    'tags':       {'label': 'Tags', 'aliases': ['tags', 'labels', 'tag']},
    'notes':      {'label': 'Notities', 'aliases': ['notities', 'notes', 'opmerking', 'opmerkingen', 'notitie']},
    'expiryDate': {'label': 'Verloopdatum', 'aliases': ['verloopdatum', 'expiry', 'expirydate', 'houdbaarheid']},
    'active':     {'label': 'Actief', 'aliases': ['actief', 'active']},
    'id':         {'label': 'ID (alleen om bestaand onderdeel te vinden)', 'aliases': ['id', 'nr', 'nummer']},
}
IMPORT_SESSIONS = {}
IMPORT_TTL = 30 * 60
_IMPORT_LOCK = threading.Lock()

def _norm_header(h):
    return re.sub(r'[^a-z0-9]', '', str(h or '').lower())

def auto_mapping(headers):
    """Raadt welke kolom bij welk veld hoort (op basis van de kolomnamen)."""
    norm = {i: _norm_header(h) for i, h in enumerate(headers)}
    mapping, used = {}, set()
    for field, spec in IMPORT_FIELDS.items():
        names = {_norm_header(a) for a in spec['aliases']} | {_norm_header(spec['label']), _norm_header(field)}
        for i, n in norm.items():
            if i not in used and n and n in names:
                mapping[field] = i; used.add(i); break
    return mapping

def _decode_text(data):
    for enc in ('utf-8-sig', 'cp1252'):
        try: return data.decode(enc)
        except UnicodeDecodeError: continue
    return data.decode('utf-8', 'replace')

def _cell(v):
    if v is None: return ''
    if isinstance(v, float) and v.is_integer(): return str(int(v))
    if isinstance(v, datetime): return v.strftime('%Y-%m-%d')
    if hasattr(v, 'isoformat') and not isinstance(v, str): return v.isoformat()[:10]
    s = str(v).strip()
    if len(s) > 1 and s[0] == "'" and s[1] in '=+-@': s = s[1:]   # zie export: formule-injectie beveiliging
    return s

def parse_table_file(filename, data):
    """Leest CSV of XLSX. Retourneert (headers, rows). Gooit ValueError met een begrijpelijke melding."""
    ext = Path(filename or '').suffix.lower()
    if ext in ('.csv', '.txt', '.tsv'):
        text = _decode_text(data)
        sample = text[:4096].splitlines()[0] if text.strip() else ''
        delim = max([',', ';', '\t'], key=lambda d: sample.count(d)) if sample else ','
        if sample.count(delim) == 0: delim = ','
        rows = [[_cell(c) for c in r] for r in csv.reader(io.StringIO(text), delimiter=delim)]
    elif ext in ('.xlsx', '.xlsm'):
        try: import openpyxl
        except ImportError: raise ValueError('Excel-import vereist het pakket openpyxl (pip install openpyxl)')
        try:
            wb = openpyxl.load_workbook(io.BytesIO(data), read_only=True, data_only=True)
            ws = wb.worksheets[0]
            rows = []
            for r in ws.iter_rows(values_only=True):
                rows.append([_cell(c) for c in r])
                if len(rows) > MAX_IMPORT_ROWS + 1: break
            wb.close()
        except Exception as e:
            raise ValueError(f'Kan het Excel-bestand niet lezen: {e}')
    else:
        raise ValueError('Bestandstype niet ondersteund (gebruik .csv, .xlsx of .json)')
    rows = [r for r in rows if any(c for c in r)]
    if len(rows) < 2: raise ValueError('Het bestand bevat geen gegevensrijen (alleen een koptekst of leeg)')
    if len(rows) - 1 > MAX_IMPORT_ROWS: raise ValueError(f'Te veel rijen (maximaal {MAX_IMPORT_ROWS})')
    headers = [h or f'kolom {i + 1}' for i, h in enumerate(rows[0])]
    width = len(headers)
    body = [(r + [''] * width)[:width] for r in rows[1:]]
    return headers, body

def _to_int(v, name):
    if v in ('', None): return None, None
    try:
        f = float(str(v).replace(',', '.'))
    except ValueError:
        return None, f'{name} is geen getal ("{v}")'
    if not f.is_integer(): return None, f'{name} is geen geheel getal ("{v}")'
    if f < 0: return None, f'{name} mag niet negatief zijn ("{v}")'
    return int(f), None

def _to_date(v):
    if not v: return '', None
    for fmt in ('%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d', '%d.%m.%Y'):
        try: return datetime.strptime(v[:10], fmt).strftime('%Y-%m-%d'), None
        except ValueError: continue
    return '', f'verloopdatum niet herkend ("{v}")'

def _to_bool(v):
    s = str(v).strip().lower()
    if s in ('1', 'ja', 'yes', 'true', 'y', 'j', 'x', 'waar'): return True, None
    if s in ('0', 'nee', 'no', 'false', 'n', 'onwaar'): return False, None
    return None, f'actief-waarde niet herkend ("{v}")'

def _split_tags(v):
    if isinstance(v, list): return [str(t).strip() for t in v if str(t).strip()]
    return [t.strip() for t in re.split(r'[;,|]', str(v or '')) if t.strip()]

def _lookup_maps(db):
    cats = {r['id']: r['name'] for r in db.execute('SELECT id,name FROM categories').fetchall()}
    locs = {str(r['id']): r['name'] for r in db.execute('SELECT id,name FROM custom_locs').fetchall()}
    def by_name(d):
        out = {}
        for k, v in d.items(): out.setdefault((v or '').strip().lower(), []).append(k)
        return out
    return cats, locs, by_name(cats), by_name(locs)

def _resolve_cat(v, cats, cat_by_name):
    if v in ('', None): return None, None
    if str(v).strip().isdigit() and int(v) in cats: return int(v), None
    hit = cat_by_name.get(str(v).strip().lower())
    if hit and len(hit) == 1: return hit[0], None
    if hit: return hit[0], f'categorie "{v}" komt meerdere keren voor, eerste gekozen'
    return None, f'categorie "{v}" bestaat niet — veld blijft leeg'

def _resolve_loc(v, locs, loc_by_name):
    if v in ('', None): return None, None
    key = str(v).strip()
    if key.isdigit() and key in locs: return int(key), None
    hit = loc_by_name.get(key.lower())
    if hit:
        h = hit[0]
        return (int(h) if str(h).isdigit() else None), (None if len(hit) == 1 else f'locatie "{v}" komt meerdere keren voor, eerste gekozen')
    return None, f'locatie "{v}" bestaat niet — veld blijft leeg'

def _records_from_table(headers, rows, mapping):
    """Maakt per rij een dict met veldnamen (ruwe tekstwaarden) volgens de kolomkoppeling."""
    recs = []
    for r in rows:
        rec = {}
        for field, idx in mapping.items():
            if idx is not None and 0 <= idx < len(r): rec[field] = r[idx]
        recs.append(rec)
    return recs

def _normalize_mapping(headers, mapping):
    """Accepteert {'name': 'Naam'} (kolomnaam) of {'name': 0} (index) en geeft indexen terug."""
    out = {}
    for field, ref in (mapping or {}).items():
        if field not in IMPORT_FIELDS or ref in (None, ''): continue
        if isinstance(ref, int) and 0 <= ref < len(headers): out[field] = ref
        elif isinstance(ref, str) and ref in headers: out[field] = headers.index(ref)
        elif isinstance(ref, str) and ref.isdigit() and int(ref) < len(headers): out[field] = int(ref)
    return out

def plan_import(db, records, options, row_offset=2, src_cat_names=None, src_loc_names=None):
    """Controleert alle records en bepaalt per rij de actie. Schrijft niets.
    records: lijst dicts met ruwe waarden. Retourneert (plan, report)."""
    mode = options.get('duplicate_mode', 'skip')
    if mode not in ('skip', 'update', 'create'): mode = 'skip'
    cats, locs, cat_by_name, loc_by_name = _lookup_maps(db)
    existing = db.execute('SELECT id,name,IPN,stock,minStock,desc,link,notes,tags,catId,locId,expiryDate,active FROM parts').fetchall()
    by_id = {r['id']: r for r in existing}
    by_ipn, by_nm = {}, {}
    for r in existing:
        if (r['IPN'] or '').strip(): by_ipn.setdefault(r['IPN'].strip().lower(), r)
        by_nm.setdefault((r['name'] or '').strip().lower(), r)
    plan, seen_file = [], {}
    report = {'invalid_rows': [], 'duplicates': [], 'warnings': [], 'updates': []}
    counts = {'total': len(records), 'valid': 0, 'invalid': 0, 'create': 0, 'update': 0, 'skip': 0,
              'duplicate_in_file': 0, 'duplicate_in_db': 0, 'missing_required': 0, 'warnings': 0}
    for i, raw in enumerate(records):
        rown = i + row_offset
        errs, warns, rec = [], [], {}
        name = str(raw.get('name', '') or '').strip()
        if not name:
            errs.append('verplicht veld ontbreekt: naam'); counts['missing_required'] += 1
        rec['name'] = name
        for f in ('desc', 'IPN', 'link', 'notes'):
            if f in raw: rec[f] = str(raw[f] or '').strip()
        for f, lbl in (('stock', 'voorraad'), ('minStock', 'minimum voorraad')):
            if f in raw:
                v, e = _to_int(raw[f], lbl)
                if e: errs.append(e)
                elif v is not None: rec[f] = v
        if 'expiryDate' in raw:
            v, e = _to_date(str(raw['expiryDate'] or '').strip())
            if e: warns.append(e)
            elif v: rec['expiryDate'] = v
        if 'active' in raw and str(raw['active']).strip() != '':
            v, e = _to_bool(raw['active'])
            if e: warns.append(e)
            else: rec['active'] = v
        if 'tags' in raw: rec['tags'] = _split_tags(raw['tags'])
        if 'category' in raw:
            val = raw['category']
            if src_cat_names is not None and str(val).isdigit() and int(val) in src_cat_names: val = src_cat_names[int(val)]
            v, w = _resolve_cat(str(val).strip() if val is not None else '', cats, cat_by_name)
            if w: warns.append(w)
            if v is not None: rec['catId'] = v
        if 'location' in raw:
            val = raw['location']
            if src_loc_names is not None and str(val) in src_loc_names: val = src_loc_names[str(val)]
            v, w = _resolve_loc(str(val).strip() if val is not None else '', locs, loc_by_name)
            if w: warns.append(w)
            if v is not None: rec['locId'] = v
        match = None
        if not errs:
            rid = None
            if str(raw.get('id', '')).strip().isdigit(): rid = int(raw['id'])
            if rid is not None and rid in by_id: match = by_id[rid]
            elif rec.get('IPN'):
                match = by_ipn.get(rec['IPN'].lower())          # IPN opgegeven: alleen op IPN vergelijken
            else:
                match = by_nm.get(name.lower())                 # geen IPN: vergelijk op naam
        entry = {'row': rown, 'rec': rec, 'action': None, 'match': match['id'] if match else None}
        if errs:
            entry['action'] = 'invalid'; counts['invalid'] += 1
            report['invalid_rows'].append({'row': rown, 'name': name, 'errors': errs})
        else:
            key = ('ipn', rec['IPN'].lower()) if rec.get('IPN') else ('name', name.lower())
            if key in seen_file:
                entry['action'] = 'duplicate_file'; counts['duplicate_in_file'] += 1
                report['duplicates'].append({'row': rown, 'name': name, 'IPN': rec.get('IPN', ''), 'kind': 'in_file',
                                             'first_row': seen_file[key]})
            else:
                seen_file[key] = rown
                if match:
                    counts['duplicate_in_db'] += 1
                    report['duplicates'].append({'row': rown, 'name': name, 'IPN': rec.get('IPN', ''), 'kind': 'in_db',
                                                 'match_id': match['id'], 'match_name': match['name'], 'mode': mode})
                    if mode == 'update':
                        entry['action'] = 'update'; counts['update'] += 1
                        diff = {}
                        for f in ('name', 'desc', 'IPN', 'link', 'notes', 'stock', 'minStock', 'catId', 'locId', 'expiryDate'):
                            if f not in rec or (f == 'name' and not rec[f]): continue
                            old = match[f]
                            if isinstance(rec[f], str): old = old or ''
                            if rec[f] != old: diff[f] = [old, rec[f]]
                        entry['diff'] = diff
                        if len(report['updates']) < 30: report['updates'].append({'row': rown, 'id': match['id'], 'name': match['name'], 'diff': diff})
                    elif mode == 'create':
                        entry['action'] = 'create'; counts['create'] += 1; entry['match'] = None
                    else:
                        entry['action'] = 'skip'; counts['skip'] += 1
                else:
                    entry['action'] = 'create'; counts['create'] += 1
            counts['valid'] += 0 if entry['action'] in ('duplicate_file',) else 1
        for w in warns:
            counts['warnings'] += 1
            if len(report['warnings']) < 100: report['warnings'].append({'row': rown, 'message': w})
        plan.append(entry)
    report['invalid_rows'] = report['invalid_rows'][:100]
    report['duplicates'] = report['duplicates'][:100]
    return plan, counts, report

def _cleanup_sessions():
    now = time.time()
    for t in [t for t, s in IMPORT_SESSIONS.items() if now - s['created'] > IMPORT_TTL]:
        IMPORT_SESSIONS.pop(t, None)
    while len(IMPORT_SESSIONS) > 5:
        IMPORT_SESSIONS.pop(min(IMPORT_SESSIONS, key=lambda k: IMPORT_SESSIONS[k]['created']), None)

def _validate_json_payload(obj):
    """Structuurcontrole van een JSON-export. Retourneert (parts_records, errors, info)."""
    errors, info = [], {}
    if not isinstance(obj, dict): return [], ['Bestand is geen JSON-object'], info
    parts = obj.get('parts')
    if not isinstance(parts, list): return [], ['Sleutel "parts" ontbreekt of is geen lijst'], info
    info['format'] = obj.get('format') or 'onbekend'
    info['full'] = obj.get('format') == 'hb-inventaris' and obj.get('scope') == 'full' \
        and all(isinstance(obj.get(k), list) for k in ('categories', 'suppliers', 'projects', 'orders')) \
        and isinstance(obj.get('locations'), dict)
    if info['full']:
        for key in ('categories', 'suppliers', 'projects', 'orders'):
            for j, it in enumerate(obj[key]):
                if not isinstance(it, dict) or not isinstance(it.get('id'), int): errors.append(f'{key}[{j}]: ontbrekend of ongeldig id')
    ids, recs = set(), []
    for i, p in enumerate(parts):
        if not isinstance(p, dict): errors.append(f'parts[{i}] is geen object'); continue
        pid = p.get('id')
        if info['full']:
            if not isinstance(pid, int): errors.append(f'parts[{i}]: id ontbreekt of is geen getal')
            elif pid in ids: errors.append(f'parts[{i}]: dubbel id {pid}')
            else: ids.add(pid)
        for f in ('docs', 'suppliers', 'extraLocs', 'related', 'tags'):
            if f in p and not isinstance(p[f], list): errors.append(f'parts[{i}].{f} is geen lijst')
        recs.append(p)
    info['counts'] = {k: len(obj[k]) for k in ('parts', 'categories', 'suppliers', 'projects', 'orders', 'history')
                      if isinstance(obj.get(k), list)}
    if isinstance(obj.get('locations'), dict): info['counts']['locations'] = len(obj['locations'])
    return recs, errors, info

def _json_records(parts_json):
    recs = []
    for p in parts_json:
        r = {'id': '', 'name': p.get('name', ''), 'desc': p.get('desc', ''), 'IPN': p.get('IPN', ''), 'link': p.get('link', ''),
             'stock': p.get('stock', 0) if p.get('stock') is not None else 0, 'minStock': p.get('minStock', 0) if p.get('minStock') is not None else 0,
             'category': p.get('catId', ''), 'location': p.get('locId', ''), 'tags': p.get('tags', []), 'notes': p.get('notes', ''),
             'expiryDate': p.get('expiryDate', ''), 'active': '' if p.get('active') is None else ('1' if p.get('active') else '0')}
        recs.append({k: ('' if v is None else v) for k, v in r.items()})
    return recs

def _preview_payload(sess, token):
    with db_conn() as db:
        if sess['kind'] == 'json':
            src_cat = {c['id']: c.get('name', '') for c in sess['json'].get('categories', []) if isinstance(c, dict) and 'id' in c}
            src_loc = {str(k): v for k, v in (sess['json'].get('locations') or {}).items()} if isinstance(sess['json'].get('locations'), dict) else None
            records = _json_records(sess['json']['parts'])
            plan, counts, report = plan_import(db, records, sess['options'], row_offset=1, src_cat_names=src_cat or None, src_loc_names=src_loc)
        else:
            records = _records_from_table(sess['headers'], sess['rows'], sess['mapping'])
            plan, counts, report = plan_import(db, records, sess['options'])
        existing_total = count_rows(db, 'parts')
    sess['plan'], sess['counts'] = plan, counts
    out = {'token': token, 'filename': sess['filename'], 'kind': sess['kind'], 'options': sess['options'],
           'counts': counts, **report, 'existing_parts': existing_total,
           'expires_in': int(IMPORT_TTL - (time.time() - sess['created']))}
    if sess['kind'] == 'table':
        out.update({'headers': sess['headers'], 'sample': sess['rows'][:5],
                    'mapping': {f: sess['headers'][i] for f, i in sess['mapping'].items()},
                    'fields': {k: {'label': v['label'], 'required': bool(v.get('required'))} for k, v in IMPORT_FIELDS.items()},
                    'missing_required': [f for f, v in IMPORT_FIELDS.items() if v.get('required') and f not in sess['mapping']]})
    else:
        j = sess['json']
        _, errs, info = _validate_json_payload(j)
        out.update({'json_info': info, 'json_errors': errs[:50], 'replace_possible': bool(info.get('full')) and not errs})
        if sess['options'].get('mode') == 'replace':
            out['replace_summary'] = {'will_replace': {t: count_rows_safe(t) for t in ('parts', 'categories', 'custom_locs', 'suppliers', 'projects', 'orders')},
                                      'incoming': info.get('counts', {})}
    return out

def count_rows_safe(t):
    with db_conn() as db: return count_rows(db, t)

@app.route('/api/import/preview', methods=['POST'])
def import_preview():
    """Stap 1. Met een bestand ('file', multipart) start je een nieuwe preview; met JSON {token, mapping, options}
    herbereken je de preview van een lopende import (bijv. na het aanpassen van de kolomkoppeling).
    Er wordt niets in de database gewijzigd."""
    with _IMPORT_LOCK:
        _cleanup_sessions()
        if 'file' in request.files:
            f = request.files['file']
            data = f.stream.read(MAX_IMPORT_MB * 1024 * 1024 + 1)
            if len(data) > MAX_IMPORT_MB * 1024 * 1024: return jsonify({'error': f'Bestand te groot (maximaal {MAX_IMPORT_MB} MB)'}), 413
            name = (f.filename or 'import')[:120]
            opts = {'duplicate_mode': request.form.get('duplicate_mode', 'skip'), 'mode': request.form.get('mode', 'merge')}
            ext = Path(name).suffix.lower()
            try:
                if ext == '.json':
                    try: obj = json.loads(_decode_text(data))
                    except ValueError as e: raise ValueError(f'Ongeldige JSON: {e}')
                    recs, errs, info = _validate_json_payload(obj)
                    if not recs and errs: raise ValueError('; '.join(errs))
                    sess = {'kind': 'json', 'json': obj, 'filename': name, 'options': opts}
                else:
                    headers, rows = parse_table_file(name, data)
                    mapping = _normalize_mapping(headers, request.form.get('mapping') and json.loads(request.form['mapping'])) or auto_mapping(headers)
                    sess = {'kind': 'table', 'headers': headers, 'rows': rows, 'mapping': mapping, 'filename': name, 'options': opts}
            except ValueError as e:
                log_event('import', 'warning', f'Import-bestand geweigerd ({name}): {e}', ip=client_ip())
                return jsonify({'error': str(e)}), 400
            sess['created'] = time.time()
            token = secrets.token_urlsafe(16)
            IMPORT_SESSIONS[token] = sess
        else:
            body = request.get_json(silent=True) or {}
            token = body.get('token')
            sess = IMPORT_SESSIONS.get(token)
            if not sess: return jsonify({'error': 'Import niet gevonden of verlopen — upload het bestand opnieuw'}), 404
            if isinstance(body.get('options'), dict):
                sess['options'].update({k: v for k, v in body['options'].items() if k in ('duplicate_mode', 'mode')})
            if sess['kind'] == 'table' and isinstance(body.get('mapping'), dict):
                sess['mapping'] = _normalize_mapping(sess['headers'], body['mapping'])
        return jsonify(_preview_payload(sess, token))

@app.route('/api/import/<token>', methods=['DELETE'])
def import_cancel(token):
    """Annuleren: gooit de preview weg. Er is dan nooit iets gewijzigd."""
    with _IMPORT_LOCK:
        existed = IMPORT_SESSIONS.pop(token, None) is not None
    return jsonify({'ok': True, 'cancelled': existed})

def _apply_part_insert(db, rec, nid):
    db.execute('''INSERT INTO parts (id,name,desc,IPN,link,stock,minStock,catId,locId,img,active,notes,docs,suppliers,extraLocs,related,tags,expiryDate)
                  VALUES (?,?,?,?,?,?,?,?,?,'',?,?,'[]','[]','[]','[]',?,?)''',
               (nid, rec['name'], rec.get('desc', ''), rec.get('IPN', ''), rec.get('link', ''), rec.get('stock', 0), rec.get('minStock', 0),
                rec.get('catId'), rec.get('locId'), 1 if rec.get('active', True) else 0, rec.get('notes', ''),
                json.dumps(rec.get('tags', []), ensure_ascii=False), rec.get('expiryDate', '')))

def _apply_part_update(db, pid, rec, filename):
    row = db.execute('SELECT * FROM parts WHERE id=?', (pid,)).fetchone()
    sets, vals = [], []
    for f in ('name', 'desc', 'IPN', 'link', 'notes', 'minStock', 'catId', 'locId', 'expiryDate'):
        if f in rec and not (f == 'name' and not rec[f]):
            sets.append(f'{f}=?'); vals.append(rec[f])
    if 'tags' in rec and rec['tags']: sets.append('tags=?'); vals.append(json.dumps(rec['tags'], ensure_ascii=False))
    if 'active' in rec: sets.append('active=?'); vals.append(1 if rec['active'] else 0)
    if 'stock' in rec and rec['stock'] != (row['stock'] or 0):
        old = row['stock'] or 0
        sets.append('stock=?'); vals.append(rec['stock'])
        db.execute('INSERT INTO history (ts,partId,partName,fromStock,toStock,delta,note) VALUES (?,?,?,?,?,?,?)',
                   (datetime.now(timezone.utc).isoformat(), pid, row['name'], old, rec['stock'], rec['stock'] - old, f'Import: {filename}'))
    if sets: db.execute(f'UPDATE parts SET {",".join(sets)} WHERE id=?', vals + [pid])

def _replace_everything(db, obj, filename):
    """Volledige restore uit een JSON-export: vervangt alle tabellen en behoudt de ID's."""
    for t in ('parts', 'categories', 'custom_locs', 'suppliers', 'projects', 'orders'): db.execute(f'DELETE FROM {t}')
    db.execute('DELETE FROM history')
    for c in obj.get('categories', []):
        db.execute('INSERT INTO categories (id,name,parent,icon,sort) VALUES (?,?,?,?,?)',
                   (c['id'], c.get('name', ''), c.get('parent'), c.get('icon', ''), c.get('sort', 0)))
    for lid, name in (obj.get('locations') or {}).items(): db.execute('INSERT INTO custom_locs VALUES (?,?)', (str(lid), name))
    for s in obj.get('suppliers', []):
        db.execute('INSERT INTO suppliers VALUES (?,?,?,?)', (s['id'], s.get('name', ''), s.get('url', ''), s.get('color', '#888888')))
    for p in obj['parts']:
        db.execute('''INSERT INTO parts (id,name,desc,IPN,link,stock,minStock,catId,locId,img,active,notes,docs,suppliers,extraLocs,related,tags,expiryDate)
                      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''',
                   (p['id'], p.get('name', ''), p.get('desc', ''), p.get('IPN', ''), p.get('link', ''), int(p.get('stock') or 0), int(p.get('minStock') or 0),
                    p.get('catId'), p.get('locId'), p.get('img', ''), 0 if p.get('active') is False else 1, p.get('notes', ''),
                    json.dumps(p.get('docs', [])), json.dumps(p.get('suppliers', [])), json.dumps(p.get('extraLocs', [])),
                    json.dumps(p.get('related', [])), json.dumps(p.get('tags', [])), p.get('expiryDate', '') or ''))
    for pr in obj.get('projects', []) or []:
        db.execute('INSERT INTO projects (id,name,desc,status,items,buildHistory,extra,created) VALUES (?,?,?,?,?,?,?,?)',
                   (pr['id'], pr.get('name', ''), pr.get('desc', ''), pr.get('status', 'actief'), json.dumps(pr.get('items', [])),
                    json.dumps(pr.get('buildHistory', [])), json.dumps(pr.get('extra', {})), pr.get('created', '')))
    for o in obj.get('orders', []) or []:
        db.execute('INSERT INTO orders (id,suppId,status,orderDate,expectedDate,receivedDate,reference,notes,items) VALUES (?,?,?,?,?,?,?,?,?)',
                   (o['id'], o.get('suppId'), o.get('status', 'besteld'), o.get('orderDate', ''), o.get('expectedDate', ''),
                    o.get('receivedDate', ''), o.get('reference', ''), o.get('notes', ''), json.dumps(o.get('items', []))))
    for h in obj.get('history', []) or []:
        db.execute('INSERT INTO history (ts,partId,partName,fromStock,toStock,delta,note,price_paid,suppId) VALUES (?,?,?,?,?,?,?,?,?)',
                   (h.get('ts', ''), h.get('partId'), h.get('partName', ''), h.get('from', h.get('fromStock', 0)),
                    h.get('to', h.get('toStock', 0)), h.get('delta', 0), h.get('note', ''), h.get('price_paid'), h.get('suppId')))
    ctx = _ctx(db)
    for k, v in find_meta_problems(db, ctx)['needed'].items(): set_meta(db, k, v)
    for k in ('nextId', 'nextLocId', 'nextSuppId', 'nextProjectId', 'nextOrderId'):
        if isinstance(obj.get('meta'), dict) and str(obj['meta'].get(k, '')).isdigit():
            cur = int(db.execute('SELECT value FROM meta WHERE key=?', (k,)).fetchone()[0])
            set_meta(db, k, max(cur, int(obj['meta'][k])))

@app.route('/api/import/commit', methods=['POST'])
@admin_required
def import_commit():
    """Stap 2. Past het geplande resultaat van de preview toe. Vereist {"token": ..., "confirm": true}.
    Gebeurt in één transactie na een automatische backup: bij een fout is er niets gewijzigd."""
    body = request.get_json(silent=True) or {}
    with _IMPORT_LOCK:
        sess = IMPORT_SESSIONS.get(body.get('token'))
        if not sess: return jsonify({'error': 'Import niet gevonden of verlopen — upload het bestand opnieuw'}), 404
        if body.get('confirm') is not True: return jsonify({'error': 'Bevestiging vereist (confirm: true)'}), 400
        if isinstance(body.get('options'), dict): sess['options'].update({k: v for k, v in body['options'].items() if k in ('duplicate_mode', 'mode')})
        if sess['kind'] == 'table' and isinstance(body.get('mapping'), dict): sess['mapping'] = _normalize_mapping(sess['headers'], body['mapping'])
        prev = _preview_payload(sess, body['token'])   # herberekenen: wat we toepassen is exact wat de gebruiker ziet
        replace = sess['kind'] == 'json' and sess['options'].get('mode') == 'replace'
        if sess['kind'] == 'table' and prev['missing_required']:
            return jsonify({'error': 'Koppel eerst de verplichte kolom(men): ' + ', '.join(prev['missing_required'])}), 400
        if replace and not prev.get('replace_possible'):
            return jsonify({'error': 'Dit JSON-bestand is geen volledige export of bevat fouten; terugzetten niet mogelijk', 'details': prev.get('json_errors')}), 422
        if prev['counts']['create'] + prev['counts']['update'] == 0 and not replace:
            return jsonify({'error': 'Niets om te importeren: alle rijen zijn ongeldig of worden overgeslagen'}), 400
        try:
            safety = do_backup(tag='pre-import', keep_retention=False)
        except Exception as e:
            return jsonify({'error': f'Veiligheidsbackup mislukt, import afgebroken: {e}'}), 500
        summary = {'created': 0, 'updated': 0, 'skipped': 0, 'invalid': prev['counts']['invalid'],
                   'duplicates_in_file': prev['counts']['duplicate_in_file'], 'safety_backup': safety, 'mode': 'replace' if replace else 'merge'}
        try:
            with db_conn() as db:
                if replace:
                    _replace_everything(db, sess['json'], sess['filename'])
                    summary['created'] = len(sess['json']['parts'])
                else:
                    nid = max(int(db.execute("SELECT value FROM meta WHERE key='nextId'").fetchone()[0] or 1),
                              (db.execute('SELECT MAX(id) FROM parts').fetchone()[0] or 0) + 1)
                    for e in sess['plan']:
                        if e['action'] == 'create':
                            _apply_part_insert(db, e['rec'], nid); nid += 1; summary['created'] += 1
                        elif e['action'] == 'update':
                            _apply_part_update(db, e['match'], e['rec'], sess['filename']); summary['updated'] += 1
                        elif e['action'] in ('skip', 'duplicate_file'):
                            summary['skipped'] += 1
                    set_meta(db, 'nextId', nid)
        except Exception as e:
            log_event('import', 'error', f'Import mislukt, niets gewijzigd ({sess["filename"]}): {e}', safety_backup=safety)
            return jsonify({'error': f'Import mislukt, er is niets gewijzigd: {e}', 'safety_backup': safety}), 500
        IMPORT_SESSIONS.pop(body['token'], None)
        log_event('import', 'info', f'Import toegepast: {sess["filename"]}', **summary)
        return jsonify({'ok': True, **summary})

# ── EXPORT ────────────────────────────────────────────────────
def _selected_ids():
    raw = request.args.get('ids', '')
    ids = [int(x) for x in raw.split(',') if x.strip().isdigit()]
    return ids or None

def _export_parts(db, ids):
    rows = db.execute('SELECT * FROM parts ORDER BY id').fetchall()
    if ids is not None: rows = [r for r in rows if r['id'] in set(ids)]
    return [part_to_dict(r) for r in rows]

def _safe_cell(v):
    """Voorkomt formule-injectie in Excel/CSV: tekst die met = + - @ begint krijgt een apostrof."""
    if isinstance(v, str) and v and v[0] in '=+-@\t\r': return "'" + v
    return v

def _export_table(db, ids):
    cats, locs = {r['id']: r['name'] for r in db.execute('SELECT id,name FROM categories')}, {str(r['id']): r['name'] for r in db.execute('SELECT id,name FROM custom_locs')}
    supps = {r['id']: r['name'] for r in db.execute('SELECT id,name FROM suppliers')}
    header = ['id', 'name', 'desc', 'IPN', 'link', 'stock', 'minStock', 'category', 'location', 'tags', 'notes', 'expiryDate', 'active', 'supplier', 'price']
    rows = []
    for p in _export_parts(db, ids):
        prices = [s.get('price') for s in p['suppliers'] if isinstance(s, dict) and s.get('price')]
        snames = [supps.get(s.get('suppId'), '') for s in p['suppliers'] if isinstance(s, dict)]
        rows.append([p['id'], p['name'], p['desc'], p['IPN'], p['link'], p['stock'], p['minStock'], cats.get(p['catId'], ''),
                     locs.get(str(p['locId']), ''), ';'.join(map(str, p['tags'])), p['notes'], p['expiryDate'],
                     'ja' if p['active'] else 'nee', ', '.join(n for n in snames if n), min(prices) if prices else ''])
    return header, rows

@app.route('/api/export/json', methods=['GET'])
def export_json():
    """Volledige export (of alleen ?ids=1,2,3). Met ?history=1 gaat ook de mutatiegeschiedenis mee."""
    ids = _selected_ids()
    with db_conn() as db:
        parts_ = _export_parts(db, ids)
        out = {'format': 'hb-inventaris', 'version': 1, 'app_version': APP_VERSION, 'schema_version': get_schema_version(db),
               'exported_at': datetime.now().isoformat(timespec='seconds'), 'scope': 'selection' if ids is not None else 'full',
               'parts': parts_}
        out['categories'] = [dict(r) for r in db.execute('SELECT * FROM categories ORDER BY sort,id')]
        out['locations'] = {str(r['id']): r['name'] for r in db.execute('SELECT * FROM custom_locs ORDER BY CAST(id AS INTEGER)')}
        out['suppliers'] = [dict(r) for r in db.execute('SELECT * FROM suppliers ORDER BY id')]
        if ids is None:
            out['projects'] = [{'id': r['id'], 'name': r['name'], 'desc': r['desc'], 'status': r['status'], 'created': r['created'],
                                'items': _jlist(r['items']), 'buildHistory': _jlist(r['buildHistory']), 'extra': _jl(r['extra'], {})}
                               for r in db.execute('SELECT * FROM projects ORDER BY id')]
            out['orders'] = [{**{k: r[k] for k in ('id', 'suppId', 'status', 'orderDate', 'expectedDate', 'receivedDate', 'reference', 'notes')},
                              'items': _jlist(r['items'])} for r in db.execute('SELECT * FROM orders ORDER BY id')]
            out['meta'] = {r['key']: r['value'] for r in db.execute("SELECT key,value FROM meta WHERE key LIKE 'next%'")}
        if request.args.get('history') == '1':
            out['history'] = [{'ts': r['ts'], 'partId': r['partId'], 'partName': r['partName'], 'from': r['fromStock'], 'to': r['toStock'],
                               'delta': r['delta'], 'note': r['note'] or '', 'price_paid': r['price_paid'], 'suppId': r['suppId']}
                              for r in db.execute('SELECT * FROM history ORDER BY id')]
    log_event('export', 'info', f'JSON-export: {len(parts_)} onderdelen', ip=client_ip())
    resp = app.response_class(json.dumps(out, ensure_ascii=False, indent=2), mimetype='application/json')
    resp.headers['Content-Disposition'] = f'attachment; filename="hb-inventaris-{datetime.now():%Y-%m-%d}.json"'
    return resp

@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    delim = ',' if request.args.get('delimiter') == 'comma' else ';'
    with db_conn() as db:
        header, rows = _export_table(db, _selected_ids())
    buf = io.StringIO()
    w = csv.writer(buf, delimiter=delim, lineterminator='\r\n')
    w.writerow(header)
    for r in rows: w.writerow([_safe_cell(c) for c in r])
    log_event('export', 'info', f'CSV-export: {len(rows)} onderdelen', ip=client_ip())
    resp = app.response_class('﻿' + buf.getvalue(), mimetype='text/csv; charset=utf-8')
    resp.headers['Content-Disposition'] = f'attachment; filename="hb-inventaris-{datetime.now():%Y-%m-%d}.csv"'
    return resp

@app.route('/api/export/xlsx', methods=['GET'])
def export_xlsx():
    try:
        import openpyxl
        from openpyxl.styles import Font
        from openpyxl.utils import get_column_letter
    except ImportError:
        return jsonify({'error': 'Excel-export vereist het pakket openpyxl (pip install openpyxl)'}), 501
    with db_conn() as db:
        header, rows = _export_table(db, _selected_ids())
    wb = openpyxl.Workbook(); ws = wb.active; ws.title = 'Onderdelen'
    ws.append(header)
    for c in ws[1]: c.font = Font(bold=True)
    for r in rows: ws.append([_safe_cell(c) for c in r])
    ws.freeze_panes = 'A2'; ws.auto_filter.ref = ws.dimensions
    for i, col in enumerate(header, 1):
        width = max([len(str(col))] + [len(str(r[i - 1])) for r in rows[:500]]) + 2
        ws.column_dimensions[get_column_letter(i)].width = min(width, 50)
    info = wb.create_sheet('Info')
    info.append(['Export', 'HB Inventaris']); info.append(['Datum', datetime.now().strftime('%Y-%m-%d %H:%M')])
    info.append(['Versie', APP_VERSION]); info.append(['Aantal onderdelen', len(rows)])
    bio = io.BytesIO(); wb.save(bio); bio.seek(0)
    log_event('export', 'info', f'Excel-export: {len(rows)} onderdelen', ip=client_ip())
    return send_file(bio, as_attachment=True, download_name=f'hb-inventaris-{datetime.now():%Y-%m-%d}.xlsx',
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


# ── START ─────────────────────────────────────────────────────
def startup_check():
    """Integriteitscontrole bij het opstarten. Logt waarschuwingen maar laat de app nooit crashen."""
    try:
        with db_conn() as db:
            issues = run_checks(db, include_media=False)
        s = summarize_issues(issues)
        if s['total'] == 0:
            log_event('startup', 'info', f'Integriteitscontrole OK (schema {get_schema_version()}, versie {APP_VERSION})')
        for i in issues:
            lvl = 'error' if i['severity'] == 'error' else 'warning' if i['severity'] == 'warning' else 'info'
            log_event('startup', lvl, f'{i["title"]} ({i["count"]})', code=i['code'])
    except Exception as e:
        log_event('startup', 'error', f'Integriteitscontrole kon niet draaien: {e}')

def start_background_jobs():
    t = threading.Thread(target=auto_backup, daemon=True, name='hb-backup'); t.start()
    return t

init_db()

# Automatische migratie van JSON naar SQLite
if JSON_FILE.exists() and JSON_FILE.is_file():
    with db_conn() as db:
        count = db.execute('SELECT COUNT(*) as c FROM parts').fetchone()['c']
    if count == 0:
        migrate_from_json()

startup_check()

if __name__ == '__main__':
    start_background_jobs()
    print('[db] SQLite geinitialiseerd — WAL mode actief')
    print(f'[backup] Auto-backup actief — dagelijks om {BACKUP_TIME}, bewaard {BACKUP_RETENTION_DAYS} dagen (min. {BACKUP_KEEP_MIN} geldige)')
    app.run(host='0.0.0.0', port=5000, debug=False)
