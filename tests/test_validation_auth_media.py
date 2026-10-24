"""Tests voor centrale validatie, de optionele login en extern geplaatste media (Samba)."""
import base64
from pathlib import Path

import pytest


def auth(u, p):
    return {'Authorization': 'Basic ' + base64.b64encode(f'{u}:{p}'.encode()).decode()}


# ── validatie ────────────────────────────────────────────────
@pytest.mark.parametrize('url,body', [
    ('/api/parts', {}),
    ('/api/parts', {'name': ''}),
    ('/api/parts', {'name': 'x' * 5000}),
    ('/api/parts', {'name': 'ok', 'stock': 'veel'}),
])
def test_invalid_part_payloads_give_400_with_fields(client, url, body):
    r = client.post(url, json=body)
    assert r.status_code == 400
    j = r.get_json()
    assert j['error'] and 'fields' in j


def test_non_json_body_is_400(client):
    r = client.post('/api/parts', data='geen json', content_type='text/plain')
    assert r.status_code == 400


def test_valid_part_roundtrip(client):
    r = client.post('/api/parts', json={'name': 'Weerstand 10k', 'stock': 5})
    assert r.status_code in (200, 201)


# ── login ────────────────────────────────────────────────────
@pytest.fixture()
def secured(srv, monkeypatch):
    monkeypatch.setattr(srv, 'AUTH_USER', 'wobbe')
    monkeypatch.setattr(srv, 'AUTH_PASSWORD', 'geheim')
    srv._AUTH_FAILS.clear()
    return srv.app.test_client()


def test_login_required_when_enabled(secured):
    r = secured.get('/api/parts')
    assert r.status_code == 401 and 'Basic' in r.headers['WWW-Authenticate']


def test_login_accepts_correct_credentials(secured):
    assert secured.get('/api/parts', headers=auth('wobbe', 'geheim')).status_code == 200


def test_login_rejects_wrong_password(secured):
    assert secured.get('/api/parts', headers=auth('wobbe', 'fout')).status_code == 401


def test_health_stays_open_for_docker_healthcheck(secured):
    assert secured.get('/api/health').status_code == 200


def test_login_rate_limit(secured, srv):
    for _ in range(srv.AUTH_MAX_FAILS):
        secured.get('/api/parts', headers=auth('wobbe', 'fout'))
    r = secured.get('/api/parts', headers=auth('wobbe', 'geheim'))
    assert r.status_code == 429


def test_no_login_when_not_configured(client):
    assert client.get('/api/parts').status_code == 200


def test_security_headers_present(client):
    r = client.get('/api/health')
    assert r.headers['X-Frame-Options'] == 'SAMEORIGIN'
    assert 'camera=(self)' in r.headers['Permissions-Policy']


# ── extern geplaatste media ──────────────────────────────────
def test_external_file_in_subfolder_is_listed_and_served(srv, client, png):
    d = Path(srv.MEDIA_DIR) / 'samba' / 'sub'
    d.mkdir(parents=True)
    (d / 'foto.png').write_bytes(png)
    names = [f['name'] for f in client.get('/api/media/orphans').get_json()['files']]
    assert 'samba/sub/foto.png' in names
    assert client.get('/media/samba/sub/foto.png').status_code == 200


def test_media_serving_blocks_traversal_and_foreign_types(srv, client):
    (Path(srv.MEDIA_DIR) / 'script.py').write_text('print(1)')
    assert client.get('/media/script.py').status_code in (403, 404)
    assert client.get('/media/../server.py').status_code in (400, 403, 404)
    assert client.get('/media/%2e%2e/server.py').status_code in (400, 403, 404)


def test_external_orphans_are_protected_unless_explicit(srv, client, png):
    p = Path(srv.MEDIA_DIR) / 'extern.png'
    p.write_bytes(png)
    j = client.delete('/api/media/orphans').get_json()
    assert j['skipped_external'] == 1 and p.exists()
    j = client.delete('/api/media/orphans?include_external=1').get_json()
    assert j['count'] == 1 and not p.exists()


def test_scan_flags_fake_image(srv, client):
    (Path(srv.MEDIA_DIR) / 'nep.png').write_bytes(b'dit is geen png')
    j = client.get('/api/media/scan').get_json()
    assert any(x['name'] == 'nep.png' for x in j['problems'])
