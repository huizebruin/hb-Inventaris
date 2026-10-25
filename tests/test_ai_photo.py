"""AI-foto: herkenning en aantal worden veilig verwerkt (Gemini zelf wordt nagebootst)."""
import base64
import pytest

IMG = base64.b64encode(b'\x89PNG\r\n\x1a\n' + b'0' * 50).decode()


def call(client, srv, monkeypatch, parsed):
    seen = {}
    def fake(prompt, max_tokens=2000, thinking_level='low', image_b64=None, image_mime=None):
        seen['prompt'] = prompt; seen['img'] = image_b64
        return parsed, None
    monkeypatch.setattr(srv, '_call_gemini', fake)
    r = client.post('/api/ai/photo-lookup', json={'image_base64': IMG, 'mime_type': 'image/png'})
    return r, seen


def test_counted_quantity_is_returned(srv, client, monkeypatch):
    r, seen = call(client, srv, monkeypatch, {'name': '10k weerstand', 'quantity': 12, 'quantity_basis': 'geteld', 'found': True})
    j = r.get_json()
    assert r.status_code == 200 and j['quantity'] == 12 and j['quantity_basis'] == 'geteld' and j['multiple_types'] is False
    assert 'geteld' in seen['prompt'] and seen['img'] == IMG


@pytest.mark.parametrize('qty', [-3, 10**7, 'veel', True, None])
def test_unreasonable_quantities_become_null(srv, client, monkeypatch, qty):
    j = call(client, srv, monkeypatch, {'name': 'x', 'quantity': qty, 'quantity_basis': 'geteld', 'found': True})[0].get_json()
    assert j['quantity'] is None


def test_unknown_basis_drops_quantity(srv, client, monkeypatch):
    j = call(client, srv, monkeypatch, {'name': 'x', 'quantity': 40, 'quantity_basis': 'onbekend', 'found': True})[0].get_json()
    assert j['quantity'] is None and j['quantity_basis'] == 'onbekend'


def test_estimate_and_multiple_types_flags(srv, client, monkeypatch):
    j = call(client, srv, monkeypatch, {'name': 'x', 'quantity': '25', 'quantity_basis': 'Geschat', 'multiple_types': True, 'found': True})[0].get_json()
    assert j['quantity'] == 25 and j['quantity_basis'] == 'geschat' and j['multiple_types'] is True


def test_missing_image_is_400(client):
    assert client.post('/api/ai/photo-lookup', json={}).status_code == 400


def test_missing_key_gives_actionable_message(srv, client, monkeypatch):
    monkeypatch.setattr(srv, 'GEMINI_API_KEY', '')
    r = client.post('/api/ai/photo-lookup', json={'image_base64': IMG, 'mime_type': 'image/png'})
    assert r.status_code == 400 and 'GEMINI_API_KEY' in r.get_json()['error'] and '.env' in r.get_json()['error']


def test_env_file_next_to_server_is_read(tmp_path):
    import subprocess, sys, shutil, pathlib
    root = pathlib.Path(__file__).resolve().parent.parent
    d = tmp_path / 'app'; d.mkdir()
    shutil.copy(root / 'server.py', d / 'server.py')
    (d / '.env').write_text('GEMINI_API_KEY="abc123"\n', encoding='utf-8')
    out = subprocess.run([sys.executable, '-c', 'import os;os.environ.pop("GEMINI_API_KEY",None);import server;print(server.GEMINI_API_KEY)'],
                         cwd=d, capture_output=True, text=True, env={**__import__('os').environ, 'HB_DATA_DIR': str(d / 'data'), 'HB_BACKUP_DIR': str(d / 'b'), 'HB_MEDIA_DIR': str(d / 'm'), 'PYTHONPATH': str(d)})
    assert out.stdout.strip().endswith('abc123'), out.stderr[-500:]
