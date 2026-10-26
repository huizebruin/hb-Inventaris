"""Voorraadwaarde in de tijd, prijslog en prijsstijgingsmeldingen."""
import sqlite3
from datetime import datetime, timedelta, timezone

from test_core_api import make_part


def add_supplier(srv, name='Mouser'):
    db = sqlite3.connect(str(srv.DB_FILE))
    cur = db.execute('INSERT INTO suppliers (name) VALUES (?)', (name,)); db.commit(); sid = cur.lastrowid; db.close()
    return sid


def test_unit_price_is_cheapest_positive(srv):
    assert srv.unit_price([{'price': 2}, {'price': 0.5}, {'price': 0}, {'price': 'x'}, 'rommel']) == 0.5
    assert srv.unit_price([]) == 0 and srv.unit_price(None) == 0


def test_price_changes_are_logged_and_increase_detected(srv, client):
    sid = add_supplier(srv)
    p = make_part(client, name='ESP32', stock=4, suppliers=[{'suppId': sid, 'price': 4.0, 'sku': 'A1'}])
    pid = p['id']
    assert client.get('/api/prices/changes').get_json()['items'] == []       # eerste prijs is geen stijging
    client.put(f'/api/parts/{pid}', json={'suppliers': [{'suppId': sid, 'price': 4.0, 'sku': 'A1'}]})   # ongewijzigd: niets loggen
    assert len(client.get(f'/api/prices/part/{pid}').get_json()) == 1
    client.put(f'/api/parts/{pid}', json={'suppliers': [{'suppId': sid, 'price': 4.6, 'sku': 'A1'}]})   # +15%
    items = client.get('/api/prices/changes').get_json()['items']
    assert len(items) == 1 and items[0]['pct'] == 15.0 and items[0]['supplier'] == 'Mouser' and items[0]['part'] == 'ESP32'
    client.put(f'/api/parts/{pid}', json={'suppliers': [{'suppId': sid, 'price': 4.5, 'sku': 'A1'}]})   # daling t.o.v. 4,6: geen melding
    assert client.get('/api/prices/changes').get_json()['items'] == []
    assert client.get('/api/prices/changes?min_pct=2').get_json()['items'] == []


def test_small_increase_below_threshold_ignored(srv, client):
    sid = add_supplier(srv)
    pid = make_part(client, suppliers=[{'suppId': sid, 'price': 10.0}])['id']
    client.put(f'/api/parts/{pid}', json={'suppliers': [{'suppId': sid, 'price': 10.5}]})
    assert client.get('/api/prices/changes').get_json()['items'] == []
    assert len(client.get('/api/prices/changes?min_pct=5').get_json()['items']) == 1


def test_value_snapshot_and_endpoint(srv, client):
    sid = add_supplier(srv)
    make_part(client, name='A', stock=10, suppliers=[{'suppId': sid, 'price': 2.0}, {'suppId': sid, 'price': 3.0}])
    make_part(client, name='B', stock=3, suppliers=[{'suppId': sid, 'price': 1.5}])
    make_part(client, name='C', stock=5)    # zonder prijs telt niet mee
    snap = srv.take_value_snapshot()
    assert snap['value'] == 24.5
    j = client.get('/api/stats/value?days=30').get_json()
    assert j['current']['value'] == 24.5 and j['points'][-1]['value'] == 24.5 and j['points'][-1]['estimated'] is False


def test_backfill_reconstructs_from_history(srv, client):
    sid = add_supplier(srv)
    pid = make_part(client, name='A', stock=0, suppliers=[{'suppId': sid, 'price': 2.0}])['id']
    db = sqlite3.connect(str(srv.DB_FILE))
    db.execute('DELETE FROM history'); db.execute('DELETE FROM value_snapshots'); db.execute('UPDATE parts SET stock=10 WHERE id=?', (pid,))
    d10 = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
    d3 = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
    db.execute('INSERT INTO history (ts,partId,partName,fromStock,toStock,delta) VALUES (?,?,?,?,?,?)', (d10, pid, 'A', 0, 6, 6))
    db.execute('INSERT INTO history (ts,partId,partName,fromStock,toStock,delta) VALUES (?,?,?,?,?,?)', (d3, pid, 'A', 6, 10, 4))
    db.commit(); db.close()
    assert srv.backfill_value_history() >= 9
    pts = {p['day']: p for p in client.get('/api/stats/value?days=30').get_json()['points']}
    day = lambda n: (datetime.now(timezone.utc) - timedelta(days=n)).date().isoformat()
    assert pts[day(5)]['value'] == 12.0 and pts[day(5)]['estimated'] is True      # 6 stuks × 2
    assert pts[day(1)]['value'] == 20.0
    assert srv.backfill_value_history() == 0                                       # tweede keer niets


def test_digest_mentions_price_increase(srv, client, monkeypatch):
    sid = add_supplier(srv)
    pid = make_part(client, name='Condensator', suppliers=[{'suppId': sid, 'price': 1.0}])['id']
    client.put(f'/api/parts/{pid}', json={'suppliers': [{'suppId': sid, 'price': 1.5}]})
    monkeypatch.setattr(srv, 'full_health', lambda include_media=False: {'issues': []})
    d = srv.build_digest()
    assert d and 'Condensator' in d[1] and '+50%' in d[1]
