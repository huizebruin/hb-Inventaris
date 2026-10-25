"""Rooktests en gedragstests voor de kern-API: onderdelen, voorraad + historie, categorieën, bestellingen, projecten."""


def make_part(client, **kw):
    body = {'name': 'Weerstand 10k', 'stock': 5}
    body.update(kw)
    r = client.post('/api/parts', json=body)
    assert r.status_code in (200, 201), r.get_json()
    return r.get_json()


def test_frontend_is_served(client):
    assert client.get('/').status_code == 200
    assert client.get('/app.js').status_code == 200


def test_health_endpoint(client):
    j = client.get('/api/health').get_json()
    assert j


def test_part_crud(client):
    p = make_part(client)
    pid = p['id']
    assert any(x['id'] == pid for x in client.get('/api/parts').get_json())
    r = client.put(f'/api/parts/{pid}', json={'name': 'Weerstand 4k7', 'stock': 7})
    assert r.status_code == 200
    data = client.get('/api/data').get_json()
    got = next(x for x in data['parts'] if x['id'] == pid)
    assert got['name'] == 'Weerstand 4k7' and got['stock'] == 7
    assert client.delete(f'/api/parts/{pid}').status_code == 200
    assert not any(x['id'] == pid for x in client.get('/api/parts').get_json())


def test_unknown_part_is_404(client):
    assert client.put('/api/parts/9999', json={'name': 'x'}).status_code == 404
    assert client.patch('/api/parts/9999/stock', json={'delta': 1}).status_code == 404


def test_stock_delta_set_and_history(client):
    pid = make_part(client, stock=5)['id']
    assert client.patch(f'/api/parts/{pid}/stock', json={'delta': 3}).get_json()['stock'] == 8
    assert client.patch(f'/api/parts/{pid}/stock', json={'delta': -100}).get_json()['stock'] == 0   # nooit negatief
    assert client.patch(f'/api/parts/{pid}/stock', json={'set': 12, 'note': 'telling'}).get_json()['stock'] == 12
    hist = client.get(f'/api/history?partId={pid}').get_json()
    assert len(hist) == 3 and {h['note'] for h in hist} >= {'telling'}


def test_stock_requires_set_or_delta(client):
    pid = make_part(client)['id']
    assert client.patch(f'/api/parts/{pid}/stock', json={}).status_code == 400


def test_categories_add_rename_delete(client):
    c = client.post('/api/categories', json={'name': 'Testcat'}).get_json()
    cid = c['id']
    assert client.put(f'/api/categories/{cid}', json={'name': 'Anders'}).status_code == 200
    names = [x['name'] for x in client.get('/api/categories').get_json()]
    assert 'Anders' in names
    assert client.delete(f'/api/categories/{cid}').status_code in (200, 204)


def test_category_with_missing_parent_is_400(client):
    assert client.post('/api/categories', json={'name': 'x', 'parent': 424242}).status_code == 400


def test_locations_list(client):
    assert client.get('/api/locations').status_code == 200


def test_order_and_project_lifecycle(client):
    r = client.post('/api/orders', json={'items': [], 'reference': 'T1'})
    assert r.status_code == 201
    oid = r.get_json()['id']
    assert any(o['id'] == oid for o in client.get('/api/orders').get_json())
    assert client.delete(f'/api/orders/{oid}').status_code in (200, 204)

    r = client.post('/api/projects', json={'name': 'Mijn project'})
    assert r.status_code == 201
    prid = r.get_json()['id']
    assert client.put(f'/api/projects/{prid}', json={'name': 'Nieuwe naam'}).status_code == 200
    assert client.delete(f'/api/projects/{prid}').status_code in (200, 204)


def test_invalid_order_and_project_are_400(client):
    assert client.post('/api/projects', json={}).status_code == 400
    assert client.post('/api/orders', json={'items': 'geen lijst'}).status_code == 400



def test_qr_libraries_are_local_and_no_external_qr_service(client):
    for f in ('qrcode-generator.js', 'jsqr.js'):
        r = client.get('/vendor/' + f)
        assert r.status_code == 200 and len(r.data) > 10000
    assert client.get('/vendor/../server.py').status_code == 404
    html = client.get('/').get_data(as_text=True) + client.get('/app.js').get_data(as_text=True)
    assert 'qrserver.com' not in html and 'qrcodejs' not in html


def test_csv_exports_use_real_line_breaks(client):
    js = client.get('/app.js').get_data(as_text=True)
    assert 'function csvDownload' in js and "join('\\r\\n')" in js
