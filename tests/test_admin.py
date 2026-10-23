import io, json, os, sqlite3, time
from datetime import datetime, timedelta
from conftest import make_png


def post_json(c, url, body):
    return c.post(url, json=body)


# ── gezondheid / integriteit ─────────────────────────────────
def test_health_ok_on_fresh_db(client):
    r = client.get('/api/admin/health').get_json()
    assert r['database']['integrity'] == 'ok'
    assert all(t['exists'] for t in r['database']['tables'].values())
    assert r['database']['schema_version'] == r['database']['schema_latest']
    assert r['backup']['count'] >= 1


def test_expirydate_is_persisted(client):
    p = client.post('/api/parts', json={'name': 'X', 'expiryDate': '2027-01-02'}).get_json()
    assert p['expiryDate'] == '2027-01-02'
    p2 = client.put(f'/api/parts/{p["id"]}', json={'expiryDate': '2028-03-04'}).get_json()
    assert p2['expiryDate'] == '2028-03-04'


def _db(srv):
    return sqlite3.connect(str(srv.DB_FILE))


def test_detects_and_repairs_malformed_json(srv, client):
    db = _db(srv); db.execute("UPDATE parts SET tags='{kapot', docs='{}' WHERE id=1"); db.commit(); db.close()
    # één kapot record mag de lijst niet breken
    assert client.get('/api/data').status_code == 200
    issues = {i['code']: i for i in client.get('/api/admin/integrity').get_json()['issues']}
    assert issues['malformed_json']['count'] == 2
    # zonder confirm: alleen voorbeeld
    pre = client.post('/api/admin/repair', json={'action': 'fix_json'}).get_json()
    assert pre['preview'] and pre['confirm_required'] and len(pre['affected']) == 2
    assert 'malformed_json' in {i['code'] for i in client.get('/api/admin/integrity').get_json()['issues']}
    res = client.post('/api/admin/repair', json={'action': 'fix_json', 'confirm': True}).get_json()
    assert res['changes'] == 2 and res['safety_backup'].endswith('pre-repair.db')
    assert 'malformed_json' not in {i['code'] for i in client.get('/api/admin/integrity').get_json()['issues']}
    log = open(srv.LOG_FILE, encoding='utf-8').read()
    assert 'parts#1.tags' in log and 'Reparatie uitgevoerd: fix_json' in log


def test_invalid_category_location_and_duplicates(srv, client):
    db = _db(srv)
    db.execute("UPDATE parts SET catId=9999, locId=8888 WHERE id=1")
    db.execute("INSERT INTO custom_locs VALUES ('50','lade 1')")        # dubbele naam t.o.v. 'Lade 1' (id 1)
    db.execute("UPDATE parts SET locId=50 WHERE id=2")
    db.execute("INSERT INTO categories (id,name,parent) VALUES (777,'Wees',31337)")
    db.commit(); db.close()
    codes = {i['code']: i for i in client.get('/api/admin/integrity').get_json()['issues']}
    for c in ('invalid_category', 'invalid_location', 'duplicate_locations', 'orphan_categories'):
        assert c in codes, c
    assert codes['invalid_category']['items'][0]['id'] == 1
    for a in ('clear_invalid_category', 'clear_invalid_location', 'fix_orphan_categories', 'merge_duplicate_locations'):
        assert client.post('/api/admin/repair', json={'action': a, 'confirm': True}).status_code == 200
    db = _db(srv)
    assert db.execute('SELECT catId,locId FROM parts WHERE id=1').fetchone() == (None, None)
    assert db.execute('SELECT locId FROM parts WHERE id=2').fetchone()[0] == 1   # samengevoegd naar laagste id
    assert db.execute("SELECT COUNT(*) FROM custom_locs WHERE id='50'").fetchone()[0] == 0
    assert db.execute('SELECT parent FROM categories WHERE id=777').fetchone()[0] is None
    db.close()
    assert client.get('/api/admin/integrity').get_json()['summary']['status'] == 'ok'


def test_meta_counter_behind_is_error_and_repairable(srv, client):
    db = _db(srv); db.execute("UPDATE meta SET value='1' WHERE key='nextId'"); db.commit(); db.close()
    i = {x['code']: x for x in client.get('/api/admin/integrity').get_json()['issues']}['meta_inconsistent']
    assert i['severity'] == 'error' and i['repair'] == 'fix_meta'
    client.post('/api/admin/repair', json={'action': 'fix_meta', 'confirm': True})
    assert client.post('/api/parts', json={'name': 'Nieuw'}).status_code == 201


def test_missing_table_reported_without_crash(srv, client):
    db = _db(srv); db.execute('DROP TABLE orders'); db.commit(); db.close()
    r = client.get('/api/admin/integrity').get_json()
    assert r['summary']['status'] == 'error' and r['issues'][0]['code'] == 'tables_missing'


# ── opslag ───────────────────────────────────────────────────
def test_system_and_storage(client):
    r = client.get('/api/admin/system').get_json()
    assert r['system']['version'] and r['system']['uptime_seconds'] >= 0
    assert r['storage']['db_size'] > 0 and r['storage']['disks']


def test_storage_warning_threshold(srv, client, monkeypatch):
    monkeypatch.setattr(srv, 'DISK_WARN_PCT', 0)
    monkeypatch.setattr(srv, 'DISK_CRIT_PCT', 101)
    r = client.get('/api/admin/health').get_json()
    assert r['storage']['status'] == 'warning'
    assert any(i['code'] == 'storage' for i in r['issues'])


# ── backups ──────────────────────────────────────────────────
def _fake_backup(srv, age_days, valid=True):
    dt = datetime.now() - timedelta(days=age_days)
    name = f'inventaris-{dt:%Y-%m-%d}.db'
    path = srv.BACKUP_DIR / name
    if valid:
        src = sqlite3.connect(str(srv.DB_FILE)); dst = sqlite3.connect(str(path)); src.backup(dst); dst.close(); src.close()
    else:
        path.write_bytes(b'dit is geen database')
    return name


def test_backup_is_verified_and_listed(srv, client):
    r = client.post('/api/backups')
    assert r.status_code == 201
    lst = client.get('/api/backups').get_json()
    assert lst and all(b['valid'] for b in lst)
    name = r.get_json()['name']
    assert client.get(f'/api/backups/{name}').status_code == 200
    assert client.get('/api/backups/..%2Fserver.py').status_code in (400, 404)


def test_retention_deletes_old_but_never_newest_valid(srv, client, monkeypatch):
    for f in srv.BACKUP_DIR.glob('*.db'): f.unlink()
    monkeypatch.setattr(srv, 'BACKUP_KEEP_MIN', 1)
    monkeypatch.setattr(srv, 'BACKUP_RETENTION_DAYS', 7)
    old1, old2 = _fake_backup(srv, 40), _fake_backup(srv, 30)
    bad_new = _fake_backup(srv, 1, valid=False)
    plan = client.get('/api/admin/retention').get_json()
    # nieuwste geldige = old2 (30 dagen) → beschermd, ook al is hij ouder dan de retentie
    assert plan['newest_valid'] == old2
    assert [d['name'] for d in plan['delete']] == [old1]
    dry = client.post('/api/admin/retention/run', json={'dry_run': True}).get_json()
    assert (srv.BACKUP_DIR / old1).exists() and dry['deleted'] == []
    done = client.post('/api/admin/retention/run', json={}).get_json()
    assert done['deleted'] == [old1]
    assert (srv.BACKUP_DIR / old2).exists() and (srv.BACKUP_DIR / bad_new).exists()
    assert 'Oude backup opgeruimd' in open(srv.LOG_FILE, encoding='utf-8').read()


def test_cannot_delete_newest_valid_backup(srv, client):
    for f in srv.BACKUP_DIR.glob('*.db'): f.unlink()
    only = _fake_backup(srv, 0)
    assert client.delete(f'/api/backups/{only}').status_code == 409
    assert (srv.BACKUP_DIR / only).exists()


def test_restore_requires_confirm_and_verifies(srv, client):
    name = client.post('/api/backups').get_json()['name']
    client.post('/api/parts', json={'name': 'Na backup'})
    assert client.post(f'/api/backups/{name}/restore', json={}).status_code == 400
    r = client.post(f'/api/backups/{name}/restore', json={'confirm': name})
    j = r.get_json()
    assert r.status_code == 200 and j['ok'] and j['verify']['ok'] and j['verify']['counts']['parts'] == 3
    names = [p['name'] for p in client.get('/api/parts').get_json()]
    assert 'Na backup' not in names
    assert any(b['name'] == j['safety_backup'] for b in client.get('/api/backups').get_json())   # veiligheidsbackup bestaat


def test_restore_refuses_invalid_backup(srv, client):
    for f in srv.BACKUP_DIR.glob('*.db'): f.unlink()
    bad = _fake_backup(srv, 0, valid=False)
    r = client.post(f'/api/backups/{bad}/restore', json={'confirm': bad})
    assert r.status_code == 422
    assert len(client.get('/api/parts').get_json()) == 3


def test_restore_smoke_roundtrip(srv, client):
    """Smoke-test voor CI: backup → wijzigen → restore → data is weer zoals bij de backup."""
    before = client.get('/api/parts').get_json()
    name = client.post('/api/backups').get_json()['name']
    client.delete('/api/parts/1'); client.post('/api/parts', json={'name': 'Extra'})
    assert client.post(f'/api/backups/{name}/restore', json={'confirm': name}).get_json()['ok']
    assert client.get('/api/parts').get_json() == before


def test_admin_token_protects_destructive_actions(srv, client, monkeypatch):
    monkeypatch.setattr(srv, 'ADMIN_TOKEN', 'geheim')
    assert client.post('/api/backups').status_code == 401
    assert client.post('/api/backups', headers={'X-Admin-Token': 'geheim'}).status_code == 201


# ── uploads ──────────────────────────────────────────────────
def up(client, name, data, mime=None, url='/api/upload'):
    return client.post(url, data={'file': (io.BytesIO(data), name, mime or 'application/octet-stream')},
                       content_type='multipart/form-data')


def test_upload_valid_png(srv, client, png):
    r = up(client, 'foto.png', png, 'image/png')
    assert r.status_code == 200
    assert (srv.MEDIA_DIR / r.get_json()['url'].split('/')[-1]).exists()


def test_upload_rejects_dangerous(srv, client, png):
    for name in ('../evil.png', 'a/b.png', '..\\x.png', '.htaccess', 'shell.php', 'foto.php.png', 'x.svg', 'noext'):
        assert up(client, name, png, 'image/png').status_code == 400, name
    # inhoud komt niet overeen met extensie
    assert up(client, 'nep.png', b'<?php echo 1; ?>', 'image/png').status_code == 400
    # MIME klopt niet
    assert up(client, 'foto.png', png, 'text/html').status_code == 400
    # pdf-endpoint alleen pdf
    assert up(client, 'foto.png', png, 'image/png', '/api/upload/pdf').status_code == 400
    assert list(srv.MEDIA_DIR.iterdir()) == []
    log = open(srv.LOG_FILE, encoding='utf-8').read()
    assert log.count('Onveilige upload geweigerd') >= 7


def test_upload_size_limit_and_quota(srv, client, png, monkeypatch):
    monkeypatch.setattr(srv, 'MAX_UPLOAD_MB', 0)   # alles te groot
    assert up(client, 'foto.png', png, 'image/png').status_code == 413
    monkeypatch.setattr(srv, 'MAX_UPLOAD_MB', 25)
    monkeypatch.setattr(srv, 'MEDIA_MAX_MB', 1)
    (srv.MEDIA_DIR / 'groot.bin').write_bytes(b'0' * (1024 * 1024))
    assert up(client, 'foto.png', png, 'image/png').status_code == 507


def test_pdf_upload_unique_names(srv, client):
    pdf = b'%PDF-1.4\n%%EOF'
    a = up(client, 'doc.pdf', pdf, 'application/pdf', '/api/upload/pdf').get_json()['url']
    b = up(client, 'doc.pdf', pdf, 'application/pdf', '/api/upload/pdf').get_json()['url']
    assert a != b


# ── media-opruiming ──────────────────────────────────────────
def test_orphans_preview_then_delete_and_broken_refs(srv, client, png):
    used = up(client, 'a.png', png, 'image/png').get_json()['url']
    orphan = up(client, 'b.png', png, 'image/png').get_json()['url']
    client.put('/api/parts/1', json={'img': used})
    client.put('/api/parts/2', json={'img': '/media/bestaat-niet.jpg'})
    prev = client.get('/api/media/orphans').get_json()
    assert [f['name'] for f in prev['files']] == [orphan.split('/')[-1]]
    dry = client.delete('/api/media/orphans?dry_run=1').get_json()
    assert dry['dry_run'] and (srv.MEDIA_DIR / orphan.split('/')[-1]).exists()
    broken = client.get('/api/media/broken').get_json()
    assert broken[0]['partId'] == 2
    done = client.delete('/api/media/orphans').get_json()
    assert done['count'] == 1 and not (srv.MEDIA_DIR / orphan.split('/')[-1]).exists()
    assert (srv.MEDIA_DIR / used.split('/')[-1]).exists()
    client.post('/api/admin/repair', json={'action': 'clear_broken_media', 'confirm': True})
    assert client.get('/api/parts/2').status_code in (200, 404, 405)
    assert client.get('/api/media/broken').get_json() == []


def test_recent_files_are_not_orphan_cleaned(srv, client, png, monkeypatch):
    monkeypatch.setattr(srv, 'ORPHAN_GRACE_MIN', 60)
    up(client, 'a.png', png, 'image/png')
    j = client.delete('/api/media/orphans').get_json()
    assert j['count'] == 0 and j['skipped_recent'] == 1


def test_deleting_part_keeps_shared_photo(srv, client, png):
    url = up(client, 'a.png', png, 'image/png').get_json()['url']
    client.put('/api/parts/1', json={'img': url}); client.put('/api/parts/2', json={'img': url})
    client.delete('/api/parts/1')
    assert (srv.MEDIA_DIR / url.split('/')[-1]).exists()
    client.delete('/api/parts/2')
    assert not (srv.MEDIA_DIR / url.split('/')[-1]).exists()


# ── logging ──────────────────────────────────────────────────
def test_logs_endpoint_and_error_summary(srv, client):
    srv.log_event('ai', 'error', 'Gemini kapot')
    srv.log_event('db', 'warning', 'iets geks')
    r = client.get('/api/admin/logs?level=warning').get_json()
    assert {e['category'] for e in r['entries']} >= {'ai', 'db'}
    assert r['summary']['errors'] >= 1 and 'ai' in r['summary']['by_category']
    assert all(e['level'] != 'INFO' for e in r['entries'])


def test_unhandled_error_is_logged_as_json(srv, client, monkeypatch):
    def boom(): raise RuntimeError('kapot')
    monkeypatch.setattr(srv, 'part_to_dict', lambda r: boom())
    r = client.get('/api/parts')
    assert r.status_code == 500 and 'error' in r.get_json()
    assert 'RuntimeError: kapot' in open(srv.LOG_FILE, encoding='utf-8').read()


def test_log_rotation_configured(srv):
    h = [h for h in srv.logger.handlers if hasattr(h, 'maxBytes')][0]
    assert h.maxBytes > 0 and h.backupCount == srv.LOG_BACKUPS


# ── migraties ────────────────────────────────────────────────
def test_migrations_upgrade_legacy_db(tmp_path, monkeypatch):
    import importlib, sys
    data = tmp_path / 'data'; data.mkdir()
    db = sqlite3.connect(str(data / 'inventaris.db'))
    db.executescript("CREATE TABLE parts (id INTEGER PRIMARY KEY, name TEXT NOT NULL, desc TEXT DEFAULT '', IPN TEXT DEFAULT '', link TEXT DEFAULT '', stock INTEGER DEFAULT 0, minStock INTEGER DEFAULT 0, catId INTEGER, locId INTEGER, img TEXT DEFAULT '', active INTEGER DEFAULT 1, notes TEXT DEFAULT '', docs TEXT DEFAULT '[]', suppliers TEXT DEFAULT '[]', extraLocs TEXT DEFAULT '[]', related TEXT DEFAULT '[]', tags TEXT DEFAULT '[]');"
                     "INSERT INTO parts (id,name,stock) VALUES (5,'Oud onderdeel',4);")
    db.commit(); db.close()
    for n, s in (('HB_DATA_DIR', 'data'), ('HB_MEDIA_DIR', 'media'), ('HB_BACKUP_DIR', 'backups'), ('HB_LOG_DIR', 'logs')):
        monkeypatch.setenv(n, str(tmp_path / s))
    sys.modules.pop('server', None)
    srv = importlib.import_module('server')
    try:
        assert srv.get_schema_version() == srv.SCHEMA_VERSION
        assert any('pre-migratie' in b.name for b in srv.BACKUP_DIR.iterdir())   # backup vóór migratie
        c = srv.app.test_client()
        assert c.get('/api/parts').get_json()[0]['name'] == 'Oud onderdeel'
    finally:
        srv.BACKUP_STOP.set()
        for h in list(srv.logger.handlers): srv.logger.removeHandler(h); h.close()
        sys.modules.pop('server', None)


def test_ai_errors_are_logged(srv, client, monkeypatch):
    monkeypatch.setattr(srv, 'GEMINI_API_KEY', 'x')
    def boom(*a, **k): raise OSError('geen netwerk')
    monkeypatch.setattr(srv.urllib.request, 'urlopen', boom)
    r = client.post('/api/ai/lookup', json={'name': 'ESP32'})
    assert r.status_code == 502
    assert 'ai |' in open(srv.LOG_FILE, encoding='utf-8').read()
    assert 'ai' in client.get('/api/admin/logs?level=warning').get_json()['summary']['by_category']
