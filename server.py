import json
import os
import uuid
import re
import sqlite3
import threading
import time
import shutil
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory, send_file

# ── LOAD .env ─────────────────────────────────────────────────
_env_file = Path('/app/data/.env')
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
    return r

app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)

# ── PATHS ─────────────────────────────────────────────────────
DB_FILE    = Path('/app/data/inventaris.db')
JSON_FILE  = Path('/app/data.json')
MEDIA_DIR  = Path('/app/media')
BACKUP_DIR = Path('/app/backups')
MEDIA_DIR.mkdir(exist_ok=True)
BACKUP_DIR.mkdir(exist_ok=True)
ALLOWED_EXT = {'.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'}

# ── AI LOOKUP (Gemini) ───────────────────────────────────────────
# Zet GEMINI_API_KEY=... in /app/data/.env om deze functie te activeren.
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
        # Add buildHistory column to existing databases
        try:
            db.execute('ALTER TABLE projects ADD COLUMN buildHistory TEXT DEFAULT "[]"')
        except Exception:
            pass
        try:
            db.execute('ALTER TABLE projects ADD COLUMN extra TEXT DEFAULT "{}"')
        except Exception:
            pass
        try:
            db.execute('ALTER TABLE history ADD COLUMN price_paid REAL DEFAULT NULL')
            db.execute('ALTER TABLE history ADD COLUMN suppId INTEGER DEFAULT NULL')
        except Exception:
            pass  # columns already exist

def get_meta(key, default='1'):
    with db_conn() as db:
        row = db.execute('SELECT value FROM meta WHERE key=?', (key,)).fetchone()
        return int(row['value']) if row else int(default)

def set_meta(db, key, value):
    db.execute('INSERT OR REPLACE INTO meta VALUES (?,?)', (key, str(value)))

def part_to_dict(row):
    return {
        'id': row['id'], 'name': row['name'], 'desc': row['desc'] or '',
        'IPN': row['IPN'] or '', 'link': row['link'] or '',
        'stock': row['stock'] or 0, 'minStock': row['minStock'] or 0,
        'catId': row['catId'], 'locId': row['locId'],
        'img': row['img'] or '', 'active': bool(row['active']),
        'notes': row['notes'] or '',
        'docs': json.loads(row['docs'] or '[]'),
        'suppliers': json.loads(row['suppliers'] or '[]'),
        'extraLocs': json.loads(row['extraLocs'] or '[]'),
        'related': json.loads(row['related'] or '[]'),
        'tags': json.loads(row['tags'] or '[]'),
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
        db.execute('''INSERT INTO parts (id,name,desc,IPN,link,stock,minStock,catId,locId,img,active,notes,docs,suppliers,extraLocs,related,tags)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)''', (
            nid, p.get('name',''), p.get('desc',''), p.get('IPN',''), p.get('link',''),
            p.get('stock',0), p.get('minStock',0), p.get('catId'), p.get('locId'), p.get('img',''),
            1 if p.get('active',True) else 0, p.get('notes',''),
            json.dumps(p.get('docs',[])), json.dumps(p.get('suppliers',[])),
            json.dumps(p.get('extraLocs',[])), json.dumps(p.get('related',[])), json.dumps(p.get('tags',[]))
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
            img=?,active=?,notes=?,docs=?,suppliers=?,extraLocs=?,related=?,tags=? WHERE id=?''', (
            p.get('name',row['name']), p.get('desc',row['desc']), p.get('IPN',row['IPN']),
            p.get('link',row['link']), p.get('stock',row['stock']), p.get('minStock',row['minStock']),
            p.get('catId',row['catId']), p.get('locId',row['locId']), p.get('img',row['img']),
            1 if p.get('active',bool(row['active'])) else 0, p.get('notes',row['notes']),
            json.dumps(p.get('docs',json.loads(row['docs'] or '[]'))),
            json.dumps(p.get('suppliers',json.loads(row['suppliers'] or '[]'))),
            json.dumps(p.get('extraLocs',json.loads(row['extraLocs'] or '[]'))),
            json.dumps(p.get('related',json.loads(row['related'] or '[]'))),
            json.dumps(p.get('tags',json.loads(row['tags'] or '[]'))), pid
        ))
        return jsonify(part_to_dict(db.execute('SELECT * FROM parts WHERE id=?',(pid,)).fetchone()))

@app.route('/api/parts/<int:pid>', methods=['DELETE'])
def delete_part(pid):
    with db_conn() as db:
        row = db.execute('SELECT * FROM parts WHERE id=?',(pid,)).fetchone()
        if not row: return jsonify({'error':'not found'}), 404
        if row['img']: (MEDIA_DIR / Path(row['img']).name).unlink(missing_ok=True)
        db.execute('DELETE FROM parts WHERE id=?',(pid,))
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
        return None, ({'error': 'Geen GEMINI_API_KEY ingesteld in /app/data/.env'}, 400)

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
            supps = json.loads(row['suppliers'] or '[]')
            filtered = [s for s in supps if s.get('suppId') != sid]
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
@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'file' not in request.files: return jsonify({'error':'no file'}), 400
    f = request.files['file']
    ext = Path(f.filename).suffix.lower()
    if ext not in ALLOWED_EXT: return jsonify({'error':'invalid type'}), 400
    filename = f'{uuid.uuid4().hex}{ext}'
    f.save(MEDIA_DIR / filename)
    return jsonify({'url':f'/media/{filename}'})

@app.route('/api/upload/pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files: return jsonify({'error':'no file'}), 400
    f = request.files['file']
    if not f.filename.lower().endswith('.pdf'): return jsonify({'error':'only PDF'}), 400
    safe = re.sub(r'[^\w\-.]','_',Path(f.filename).stem)
    filename = f'{safe}_{uuid.uuid4().hex[:6]}.pdf'
    f.save(MEDIA_DIR / filename)
    return jsonify({'url':f'/media/{filename}'})

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
            for doc in json.loads(p['docs'] or '[]'):
                if doc.get('url') and Path(doc['url']).name == filename:
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
        for doc in json.loads(p['docs'] or '[]'):
            if doc.get('url'): used.setdefault(Path(doc['url']).name,[]).append({'id':p['id'],'name':p['name']})
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

@app.route('/api/media/orphans', methods=['DELETE'])
def delete_orphans():
    with db_conn() as db:
        rows = db.execute('SELECT img,docs FROM parts').fetchall()
    used = set()
    for p in rows:
        if p['img']: used.add(Path(p['img']).name)
        for doc in json.loads(p['docs'] or '[]'):
            if doc.get('url'): used.add(Path(doc['url']).name)
    deleted = []
    for f in MEDIA_DIR.iterdir():
        if f.is_file() and f.name not in used and not f.name.startswith('.'):
            f.unlink(); deleted.append(f.name)
    return jsonify({'deleted':deleted,'count':len(deleted)})

# ── BACKUP ────────────────────────────────────────────────────
def do_backup():
    date_str = datetime.now().strftime('%Y-%m-%d')
    backup_path = BACKUP_DIR / f'inventaris-{date_str}.db'
    src = sqlite3.connect(str(DB_FILE))
    dst = sqlite3.connect(str(backup_path))
    src.backup(dst); dst.close(); src.close()
    for backups in [sorted(BACKUP_DIR.glob('inventaris-*.db'))]:
        for old in backups[:-7]: old.unlink(missing_ok=True)
    print(f'[backup] {backup_path.name}')

def auto_backup():
    while True:
        now = datetime.now()
        secs = (24-now.hour-1)*3600 + (60-now.minute-1)*60 + (60-now.second)
        time.sleep(secs)
        try: do_backup()
        except Exception as e: print(f'[backup] Fout: {e}')
        time.sleep(60)

@app.route('/api/backups', methods=['GET'])
def list_backups():
    backups = sorted(BACKUP_DIR.glob('inventaris-*.db'), reverse=True)
    return jsonify([{'name':b.name,'size':b.stat().st_size,'date':b.stem.replace('inventaris-','')} for b in backups])

@app.route('/api/backups/<filename>', methods=['GET'])
def download_backup(filename):
    if not re.match(r'^inventaris-[\d-]+\.db$', filename):
        return jsonify({'error':'invalid'}), 400
    return send_file(BACKUP_DIR/filename, as_attachment=True)

# ── START ─────────────────────────────────────────────────────
init_db()

# Automatische migratie van JSON naar SQLite
if JSON_FILE.exists() and JSON_FILE.is_file():
    with db_conn() as db:
        count = db.execute('SELECT COUNT(*) as c FROM parts').fetchone()['c']
    if count == 0:
        migrate_from_json()

if __name__ == '__main__':
    threading.Thread(target=auto_backup, daemon=True).start()
    print('[db] SQLite geinitialiseerd — WAL mode actief')
    print('[backup] Auto-backup actief — dagelijks om middernacht')
    app.run(host='0.0.0.0', port=5000, debug=False)