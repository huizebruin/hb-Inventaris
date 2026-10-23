"""Gedeelde testopzet: elke test krijgt een verse app met eigen (tijdelijke) data-, media- en backupmap."""
import importlib
import io
import os
import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


@pytest.fixture()
def srv(tmp_path, monkeypatch):
    for name, sub in (('HB_DATA_DIR', 'data'), ('HB_MEDIA_DIR', 'media'), ('HB_BACKUP_DIR', 'backups'), ('HB_LOG_DIR', 'logs')):
        monkeypatch.setenv(name, str(tmp_path / sub))
    for k in ('HB_ADMIN_TOKEN', 'HB_MEDIA_MAX_MB', 'HB_BACKUP_KEEP_MIN', 'HB_BACKUP_RETENTION_DAYS', 'HB_ORPHAN_GRACE_MIN'):
        monkeypatch.delenv(k, raising=False)
    monkeypatch.setenv('HB_ORPHAN_GRACE_MIN', '0')   # tests: meteen als "ongebruikt" beschouwen
    sys.modules.pop('server', None)
    mod = importlib.import_module('server')
    mod.app.config['TESTING'] = True
    yield mod
    mod.BACKUP_STOP.set()
    for h in list(mod.logger.handlers):
        mod.logger.removeHandler(h)
        try: h.close()
        except Exception: pass
    sys.modules.pop('server', None)


@pytest.fixture()
def client(srv):
    return srv.app.test_client()


def make_png(size=8):
    from PIL import Image
    buf = io.BytesIO()
    Image.new('RGB', (size, size), (200, 30, 30)).save(buf, 'PNG')
    return buf.getvalue()


@pytest.fixture()
def png():
    return make_png()
