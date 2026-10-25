"""Updatemelding en zelf bijwerken: versievergelijking, veilige installatie, terugdraaien bij fouten."""
import hashlib
import io
import json
import zipfile

import pytest

VER = '9.9.9'
BASE = f'https://github.com/huizebruin/hb-Inventaris/releases/download/{VER}/'


def make_zip(version=VER, extra=None, server_version=None, req='Flask>=3.0\n'):
    buf = io.BytesIO()
    pre = f'hb-inventaris-{version}/'
    with zipfile.ZipFile(buf, 'w') as z:
        z.writestr(pre + 'server.py', f"APP_VERSION = '{server_version or version}'\nprint('nieuw')\n")
        z.writestr(pre + 'static/app.js', '// nieuw\n')
        z.writestr(pre + 'requirements.txt', req)
        z.writestr(pre + 'docs/x.md', 'doc')
        for name, content in (extra or {}).items():
            z.writestr(name, content)
    return buf.getvalue()


@pytest.fixture()
def rel(srv, monkeypatch, tmp_path):
    code = tmp_path / 'code'
    (code / 'static').mkdir(parents=True)
    (code / 'server.py').write_text("APP_VERSION = '3.9.1'\n")
    (code / 'static' / 'app.js').write_text('// oud\n')
    (code / 'requirements.txt').write_text('Flask>=3.0\n')
    (code / '.env').write_text('GEHEIM=1\n')
    monkeypatch.setattr(srv, 'CODE_DIR', code)
    monkeypatch.setattr(srv, 'in_docker', lambda: False)
    monkeypatch.setattr(srv, 'APP_VERSION', '3.9.1')
    state = {'zip': make_zip(), 'sha': None, 'fail': False, 'restarted': 0}

    def fake_get(url, timeout=10, accept=None, max_bytes=None):
        if state['fail']: raise OSError('geen verbinding')
        if url.endswith('/releases/latest'):
            return json.dumps({'tag_name': VER, 'html_url': 'https://github.com/x/y/releases/tag/' + VER, 'body': 'Notities', 'published_at': '2026-10-25T10:00:00Z',
                               'assets': [{'name': f'hb-inventaris-{VER}.zip', 'browser_download_url': BASE + f'hb-inventaris-{VER}.zip'},
                                          {'name': f'hb-inventaris-{VER}.zip.sha256', 'browser_download_url': BASE + f'hb-inventaris-{VER}.zip.sha256'}]}).encode()
        if url.endswith('.zip'): return state['zip']
        if url.endswith('.sha256'): return ((state['sha'] or hashlib.sha256(state['zip']).hexdigest()) + '  x.zip\n').encode()
        raise AssertionError(url)
    monkeypatch.setattr(srv, '_http_get', fake_get)
    monkeypatch.setattr(srv, 'restart_app', lambda delay=1.5: state.__setitem__('restarted', state['restarted'] + 1))
    srv.UPDATE_STATE.update(checked_at=None, latest=None)
    state['code'] = code
    return state


def test_version_parsing(srv):
    assert srv.parse_version('v3.9.1') == (3, 9, 1) and srv.parse_version('3.10.0') > srv.parse_version('3.9.9')
    assert srv.parse_version('latest') is None


def test_update_available_is_reported(srv, client, rel):
    j = client.get('/api/update').get_json()
    assert j['available'] and j['latest'] == VER and j['current'] == '3.9.1' and j['install_possible'] and j['notes'] == 'Notities'


def test_no_update_when_same_or_older(srv, client, rel, monkeypatch):
    monkeypatch.setattr(srv, 'APP_VERSION', '9.9.9')
    assert client.get('/api/update').get_json()['available'] is False


def test_network_failure_is_not_fatal(srv, client, rel):
    rel['fail'] = True
    j = client.get('/api/update?refresh=1').get_json()
    assert j['available'] is False and j['error']


def test_check_can_be_disabled(srv, client, rel, monkeypatch):
    monkeypatch.setattr(srv, 'UPDATE_CHECK', False)
    j = client.get('/api/update').get_json()
    assert j['enabled'] is False and j['available'] is False and not j['install_possible']


def test_docker_gets_commands_not_install(srv, client, rel, monkeypatch):
    monkeypatch.setattr(srv, 'in_docker', lambda: True)
    j = client.get('/api/update').get_json()
    assert j['available'] and not j['install_possible'] and j['install_blocked'] == 'docker' and 'docker compose up -d --build' in j['commands']
    r = client.post('/api/admin/update/install', json={'version': VER, 'confirm': True})
    assert r.status_code == 500 and 'Docker' in r.get_json()['error']


def test_install_requires_confirm(client, rel):
    client.get('/api/update')
    assert client.post('/api/admin/update/install', json={'version': VER}).status_code == 400


def test_install_respects_admin_token(srv, client, rel, monkeypatch):
    monkeypatch.setattr(srv, 'ADMIN_TOKEN', 'geheim')
    client.get('/api/update')
    assert client.post('/api/admin/update/install', json={'version': VER, 'confirm': True}).status_code == 401


def test_install_success_keeps_user_files_and_makes_backups(srv, client, rel):
    client.get('/api/update')
    r = client.post('/api/admin/update/install', json={'version': VER, 'confirm': True})
    assert r.status_code == 200, r.get_json()
    code = rel['code']
    assert f"APP_VERSION = '{VER}'" in (code / 'server.py').read_text()
    assert (code / 'static' / 'app.js').read_text() == '// nieuw\n'
    assert (code / '.env').read_text() == 'GEHEIM=1\n'
    zips = list(srv.BACKUP_DIR.glob('code-3.9.1-*.zip'))
    assert zips and 'server.py' in zipfile.ZipFile(zips[0]).namelist()
    assert list(srv.BACKUP_DIR.glob('*pre-update*.db'))
    assert rel['restarted'] == 1


def test_wrong_checksum_changes_nothing(srv, client, rel):
    rel['sha'] = '0' * 64
    client.get('/api/update')
    r = client.post('/api/admin/update/install', json={'version': VER, 'confirm': True})
    assert r.status_code == 500 and 'SHA-256' in r.get_json()['error']
    assert "3.9.1" in (rel['code'] / 'server.py').read_text() and rel['restarted'] == 0


def test_zip_slip_is_refused(srv, client, rel):
    rel['zip'] = make_zip(extra={f'hb-inventaris-{VER}/../evil.py': 'x'})
    client.get('/api/update')
    r = client.post('/api/admin/update/install', json={'version': VER, 'confirm': True})
    assert r.status_code == 500 and 'Onveilig' in r.get_json()['error']
    assert not (rel['code'].parent / 'evil.py').exists()


def test_version_inside_zip_must_match(srv, client, rel):
    rel['zip'] = make_zip(server_version='1.0.0')
    client.get('/api/update')
    r = client.post('/api/admin/update/install', json={'version': VER, 'confirm': True})
    assert r.status_code == 500 and 'komt niet overeen' in r.get_json()['error']
    assert "3.9.1" in (rel['code'] / 'server.py').read_text()


def test_only_latest_version_can_be_installed(srv, client, rel):
    client.get('/api/update')
    assert client.post('/api/admin/update/install', json={'version': '1.0.0', 'confirm': True}).status_code == 500


def test_rollback_when_package_install_fails(srv, client, rel, monkeypatch):
    rel['zip'] = make_zip(req='Flask>=3.0\nnieuwpakket\n')
    client.get('/api/update')

    class R:
        returncode, stderr, stdout = 1, 'boem', ''
    monkeypatch.setattr('subprocess.run', lambda *a, **k: R())
    r = client.post('/api/admin/update/install', json={'version': VER, 'confirm': True})
    assert r.status_code == 500 and 'Pakketten' in r.get_json()['error']
    assert "APP_VERSION = '3.9.1'" in (rel['code'] / 'server.py').read_text()
    assert (rel['code'] / 'static' / 'app.js').read_text() == '// oud\n' and rel['restarted'] == 0


def test_digest_mentions_update(srv, client, rel):
    client.get('/api/update')
    subject, text, html = srv.build_digest()
    assert VER in text and 'update' in subject.lower()
