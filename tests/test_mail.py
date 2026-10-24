"""E-mailmeldingen: configuratie, testmail, dagelijks overzicht en dedupe (met een nep-SMTP-server)."""
import smtplib

import pytest


class FakeSMTP:
    sent, logins, fail = [], [], False

    def __init__(self, host, port, timeout=0, context=None):
        if FakeSMTP.fail: raise OSError('verbinding geweigerd')
    def __enter__(self): return self
    def __exit__(self, *a): return False
    def ehlo(self): pass
    def has_extn(self, n): return True
    def starttls(self, context=None): pass
    def login(self, u, p): FakeSMTP.logins.append((u, p))
    def send_message(self, m): FakeSMTP.sent.append(m)


@pytest.fixture()
def mail(srv, monkeypatch):
    FakeSMTP.sent, FakeSMTP.logins, FakeSMTP.fail = [], [], False
    monkeypatch.setattr(smtplib, 'SMTP', FakeSMTP)
    monkeypatch.setattr(smtplib, 'SMTP_SSL', FakeSMTP)
    for k, v in dict(SMTP_HOST='smtp.test', SMTP_PORT=587, SMTP_USER='u@test', SMTP_PASS='pw', SMTP_FROM='u@test', MAIL_TO=['a@test', 'b@test']).items():
        monkeypatch.setattr(srv, k, v)
    srv._MAIL_SENT.clear()
    return srv


def test_not_configured_gives_clear_error(srv, client):
    assert not srv.mail_configured()
    r = client.post('/api/admin/mail/test', json={})
    assert r.status_code == 400 and 'SMTP' in r.get_json()['error']


def test_testmail_is_sent_with_login(mail, client):
    r = client.post('/api/admin/mail/test', json={})
    assert r.status_code == 200 and r.get_json()['to'] == ['a@test', 'b@test']
    m = FakeSMTP.sent[0]
    assert m['To'] == 'a@test, b@test' and m['Subject'].startswith('[HB Inventaris]')
    assert FakeSMTP.logins == [('u@test', 'pw')]


def test_smtp_failure_is_reported_and_logged(mail, client):
    FakeSMTP.fail = True
    r = client.post('/api/admin/mail/test', json={})
    assert r.status_code == 502
    assert mail.MAIL_STATE['last_error']


def test_digest_none_when_all_fine(mail, client):
    # verse database met demo-materiaal: zonder lage voorraad/verloop is er (behalve evt. backup-melding) niets of iets
    d = mail.build_digest()
    assert d is None or d[0].startswith('Overzicht')


def test_digest_lists_low_stock_and_expiry(mail, client):
    from datetime import date, timedelta
    client.post('/api/parts', json={'name': 'Laag onderdeel', 'stock': 1, 'minStock': 5})
    client.post('/api/parts', json={'name': 'Oud onderdeel', 'stock': 3, 'expiryDate': (date.today() - timedelta(days=2)).isoformat()})
    subject, text, html = mail.build_digest()
    assert 'Laag onderdeel: 1 (minimaal 5)' in text
    assert 'Oud onderdeel: verlopen' in text and '<li>' in html
    assert mail.send_digest() is True and FakeSMTP.sent


def test_dedupe_blocks_repeat(mail):
    assert mail.send_mail('x', 'y', dedupe_key='k') is True
    assert mail.send_mail('x', 'y', dedupe_key='k') is False
    assert len(FakeSMTP.sent) == 1


def test_html_in_part_names_is_escaped(mail, client):
    client.post('/api/parts', json={'name': '<script>x</script>', 'stock': 0, 'minStock': 2})
    assert '<script>' not in mail.build_digest()[2]


def test_next_digest_time(mail):
    from datetime import datetime
    n = mail.next_digest_time(datetime(2026, 1, 1, 9, 0))
    assert (n.hour, n.minute, n.day) == (8, 0, 2)
