"""Taalondersteuning: woordenboek Nederlands → Engels is geldig en consistent; e-mails volgen HB_LANG."""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_dict():
    src = (ROOT / 'static' / 'i18n-en.js').read_text(encoding='utf-8')
    start = src.index('window.HB_I18N_EN')
    body = src[src.index('{', start):src.rindex('}') + 1]
    return json.loads(body)


def test_dictionary_is_valid_json_and_not_empty():
    d = load_dict()
    assert len(d) > 800
    assert all(isinstance(k, str) and isinstance(v, str) and v.strip() for k, v in d.items())


def test_placeholders_match_between_source_and_translation():
    ph = re.compile(r'\{\d+\}')
    bad = [(k, v) for k, v in load_dict().items() if sorted(ph.findall(k)) != sorted(ph.findall(v))]
    assert not bad, bad[:5]


def test_language_files_are_served_and_loaded_before_app(client):
    html = client.get('/').get_data(as_text=True)
    assert html.index('/static/i18n-en.js') < html.index('/static/i18n.js') < html.index('/static/app.js')
    for f in ('i18n.js', 'i18n-en.js'):
        assert client.get('/static/' + f).status_code == 200


def test_no_hardcoded_dutch_locale_left():
    for f in ('app.js', 'admin.js'):
        assert "'nl-NL'" not in (ROOT / 'static' / f).read_text(encoding='utf-8')


def test_digest_follows_language(srv, client, monkeypatch):
    client.post('/api/parts', json={'name': 'Laag', 'stock': 0, 'minStock': 3})
    monkeypatch.setattr(srv, 'MAIL_LANG', 'en')
    subject, text, html = srv.build_digest()
    assert subject.startswith('Summary:') and 'Low stock' in text and 'minimum 3' in text
    monkeypatch.setattr(srv, 'MAIL_LANG', 'nl')
    subject, text, html = srv.build_digest()
    assert subject.startswith('Overzicht:') and 'Lage voorraad' in text


def test_changelogs_have_same_versions():
    def versions(name):
        return re.findall(r'^## \[([^\]]+)\]', (ROOT / name).read_text(encoding='utf-8'), re.M)
    nl, en = versions('CHANGELOG.md'), versions('CHANGELOG.en.md')
    nl = ['Unreleased' if v == 'Onuitgebracht' else v for v in nl]
    assert nl == en


def test_english_docs_exist_and_link_back():
    for en, nl in (('README.en.md', 'README.md'), ('docs/ADMIN.en.md', 'ADMIN.md'), ('docs/DEPLOYMENT.en.md', 'DEPLOYMENT.md'), ('CHANGELOG.en.md', 'CHANGELOG.md')):
        assert nl in (ROOT / en).read_text(encoding='utf-8').splitlines()[0]
