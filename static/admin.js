// ── BEHEER & GEZONDHEID ───────────────────────────────────────
// Eén venster met tabs: Overzicht, Gezondheid, Back-ups, Import/Export, Media en Logboek.
// Alle destructieve acties tonen eerst een voorbeeld en vragen bevestiging; de server maakt vooraf een backup.
(function () {
  const TABS = [['ov', '📊 Overzicht'], ['health', '🩺 Gezondheid'], ['bk', '💾 Back-ups'], ['io', '🔄 Import / export'], ['media', '🖼 Media'], ['log', '📜 Logboek']];
  let tab = 'ov', imp = null, logF = { level: 'warning', category: '', q: '' };
  const $ = id => document.getElementById(id);
  const E = s => (typeof esc === 'function' ? esc(s) : String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])));
  const SZ = b => (typeof formatSize === 'function' ? formatSize(b || 0) : ((b || 0) / 1048576).toFixed(1) + ' MB');
  const fdt = s => { if (!s) return '—'; const d = new Date(s); return isNaN(d) ? s : d.toLocaleString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
  const dur = sec => { const d = Math.floor(sec / 86400), h = Math.floor(sec % 86400 / 3600), m = Math.floor(sec % 3600 / 60); return (d ? d + 'd ' : '') + (h || d ? h + 'u ' : '') + m + 'm'; };
  const SEV = { ok: 'In orde', warning: 'Aandacht', error: 'Fout', info: 'Info' };
  const badge = (sev, txt) => `<span class="adm-badge ${sev}">${E(txt || SEV[sev] || sev)}</span>`;
  const T = m => (typeof toast === 'function' ? toast(m) : console.log(m));
  const busy = () => { $('admBody').innerHTML = '<div class="adm-note"><i class="spin">⟳</i> Laden…</div>'; };
  const err = e => { $('admBody').innerHTML = `<div class="adm-note" style="color:var(--red)">⚠ ${E(e.message || e)}</div>`; };

  window.openAdmin = function (t) {
    if (!$('adminOvl')) {
      const o = document.createElement('div');
      o.className = 'overlay'; o.id = 'adminOvl';
      o.innerHTML = `<div class="modal" role="dialog" aria-label="Beheer en gezondheid"><div class="mhdr"><h3>🩺 Beheer &amp; gezondheid</h3>
        <div style="display:flex;gap:8px;align-items:center"><span id="admStatus"></span><button class="xcls" data-act="close" aria-label="Sluiten">✕</button></div></div>
        <div class="adm-tabs" role="tablist">${TABS.map(([k, l]) => `<button class="adm-tab" role="tab" data-act="tab" data-arg="${k}">${l}</button>`).join('')}</div>
        <div class="adm-body" id="admBody"></div></div>`;
      o.addEventListener('click', onClick);
      o.addEventListener('change', onChange);
      o.addEventListener('input', onInput);
      document.body.appendChild(o);
    }
    $('adminOvl').classList.add('open');
    go(typeof t === 'string' ? t : tab);
  };
  window.closeAdmin = () => $('adminOvl')?.classList.remove('open');
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAdmin(); });

  function go(t) {
    tab = t;
    document.querySelectorAll('#adminOvl .adm-tab').forEach(b => { const on = b.dataset.arg === t; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    busy();
    ({ ov: tOverview, health: tHealth, bk: tBackups, io: tIO, media: tMedia, log: tLog }[t])().catch(err);
  }

  // ── Overzicht ────────────────────────────────────────────────
  async function tOverview() {
    const d = await api('/api/admin/overview');
    const s = d.system, h = d.health, st = d.storage, bk = d.backup, lg = d.log;
    $('admStatus').innerHTML = badge(h.status, SEV[h.status]);
    const card = (l, v, sub, cls) => `<div class="adm-card ${cls || ''}"><div class="l">${l}</div><div class="v">${v}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div>`;
    const lv = bk.last_valid;
    let html = '<div class="adm-grid">' +
      card('Versie', E(s.version), 'build ' + E(s.build) + ' · schema ' + s.schema_version + '/' + s.schema_latest) +
      card('Gestart', fdt(s.started_at), 'actief ' + dur(s.uptime_seconds)) +
      card('Database', SZ(st.db_size), h.database.integrity === 'ok' ? 'integriteit OK' : '⚠ ' + E(h.database.integrity), h.database.integrity === 'ok' ? 'ok' : 'error') +
      card('Mediamap', SZ(st.media_size), st.media_files + ' bestanden' + (st.media_quota ? ' · ' + st.media_quota.percent + '% van limiet' : '')) +
      card('Laatste backup', lv ? fdt(lv.ts) : 'geen', lv ? (bk.age_hours + ' uur geleden') : 'maak er nu een', bk.current ? 'ok' : 'warning') +
      card('Volgende backup', fdt(bk.next_scheduled), bk.scheduler_running ? 'planner actief' : 'planner niet actief', bk.scheduler_running ? '' : 'warning') +
      card('Integriteit', badge(h.summary.status, SEV[h.summary.status]), `${h.summary.errors} fouten · ${h.summary.warnings} waarschuwingen · ${h.summary.infos} info`, h.summary.status) +
      card('Logboek 24u', `${lg.errors} fouten`, `${lg.warnings} waarschuwingen`, lg.errors ? 'error' : lg.warnings ? 'warning' : 'ok') + '</div>';
    if (h.issues.some(i => i.severity !== 'info')) {
      html += '<div class="adm-h">⚠ Aandachtspunten</div>' + h.issues.filter(i => i.severity !== 'info').map(i =>
        `<div class="adm-issue ${i.severity}"><div class="t">${E(i.title)} ${i.count > 1 ? badge(i.severity, i.count + '×') : ''}</div>
        <div class="acts"><button class="btn sec sm" data-act="tab" data-arg="${i.code.startsWith('backup') ? 'bk' : i.code === 'storage' ? 'ov' : 'health'}">Bekijken</button></div></div>`).join('');
    } else html += '<div class="adm-ok">✓ Alles in orde</div>';
    html += '<div class="adm-h">💽 Opslag</div>' + st.disks.map(dk =>
      `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px"><span>Schijf (${dk.paths.join(', ')})</span><span>${SZ(dk.used)} van ${SZ(dk.total)} · ${SZ(dk.free)} vrij · ${dk.percent}%</span></div>
      <div class="adm-bar ${dk.level}"><i style="width:${Math.min(100, dk.percent)}%"></i></div></div>`).join('') +
      `<div class="adm-note">Waarschuwing vanaf ${st.thresholds.warn_pct}% gebruikt of minder dan ${st.thresholds.warn_free_mb} MB vrij (HB_DISK_WARN_PCT / HB_DISK_WARN_FREE_MB). Back-ups: ${SZ(st.backup_size)} in ${st.backup_files} bestanden · logboek ${SZ(st.log_size)}.</div>`;
    html += `<div class="acts" style="display:flex;gap:8px;flex-wrap:wrap">${lv ? `<a class="btn sec sm" href="/api/backups/${E(lv.name)}" download>↓ Download nieuwste backup</a>` : ''}
      <button class="btn sm" data-act="mkbackup">💾 Nu backup maken</button><button class="btn sec sm" data-act="tab" data-arg="ov">↻ Vernieuwen</button></div>
      <div class="adm-note" style="margin-top:14px">Python ${E(s.python)} · Flask ${E(s.flask)} · SQLite ${E(s.sqlite)} · Pillow ${s.pillow ? 'ja' : 'nee'} · openpyxl ${s.openpyxl ? 'ja' : 'nee'} · AI ${s.gemini_configured ? 'aan' : 'uit'} · Telegram ${s.telegram_configured ? 'aan' : 'uit'} · beheer-token ${s.admin_token_required ? 'vereist' : 'niet ingesteld'}</div>`;
    $('admBody').innerHTML = html;
  }

  // ── Gezondheid ───────────────────────────────────────────────
  let lastIssues = [];
  async function tHealth() {
    const h = await api('/api/admin/health');
    lastIssues = h.issues;
    $('admStatus').innerHTML = badge(h.status, SEV[h.status]);
    const db = h.database;
    let html = `<div class="adm-h">Database ${badge(db.integrity === 'ok' ? 'ok' : 'error', db.integrity === 'ok' ? 'integriteit OK' : 'beschadigd')} <span class="adm-badge">schema ${db.schema_version}/${db.schema_latest}</span>
      <button class="btn sec sm" data-act="tab" data-arg="health" style="margin-left:auto">↻ Opnieuw controleren</button></div>
      <table class="adm-tbl"><tr>${Object.entries(db.tables).map(([n, t]) => `<th>${n}</th>`).join('')}</tr><tr>${Object.entries(db.tables).map(([n, t]) => `<td>${t.exists ? t.rows : '<span style="color:var(--red)">ontbreekt</span>'}</td>`).join('')}</tr></table>
      <div class="adm-note">Mappen: ${Object.entries(h.folders).map(([k, f]) => `${k} ${f.writable ? '✓' : '<b style="color:var(--red)">✗</b>'}`).join(' · ')}</div>
      <div class="adm-h">Bevindingen (${h.summary.total})</div>`;
    if (!h.issues.length) html += '<div class="adm-ok">✓ Geen problemen gevonden</div>';
    html += h.issues.map((i, n) => {
      const rep = i.repair === 'create_backup' ? { label: 'Nu backup maken' } : i.repair ? { label: h.repair_labels[i.repair] } : null;
      return `<div class="adm-issue ${i.severity}"><div class="t">${badge(i.severity)} ${E(i.title)} ${i.count > 1 ? `<span class="adm-badge">${i.count}×</span>` : ''}</div>
        ${i.detail ? `<div class="d">${E(i.detail)}</div>` : ''}
        <div class="acts">${i.items.length ? `<button class="btn sec sm" data-act="items" data-arg="${n}">🔍 Inspecteren</button>` : ''}
        ${rep ? `<button class="btn sm" data-act="${i.repair === 'create_backup' ? 'mkbackup' : 'repair'}" data-arg="${i.repair}">🛠 ${E(rep.label)}</button>` : ''}
        ${i.code === 'orphan_media' ? '<button class="btn sec sm" data-act="tab" data-arg="media">Naar Media</button>' : ''}</div>
        <div class="adm-items" id="admItems${n}" hidden></div></div>`;
    }).join('');
    $('admBody').innerHTML = html;
  }
  function itemLine(it) {
    if (it == null || typeof it !== 'object') return E(it);
    const link = it.id != null && it.name !== undefined && !it.table ? `<a data-act="open" data-arg="${it.id}">#${it.id} ${E(it.name)}</a>` : (it.partId != null ? `<a data-act="open" data-arg="${it.partId}">#${it.partId} ${E(it.partName)}</a>` : '');
    const rest = Object.entries(it).filter(([k]) => !['id', 'name', 'partId', 'partName', 'raw'].includes(k)).map(([k, v]) => `${E(k)}: ${E(typeof v === 'object' ? JSON.stringify(v) : v)}`).join(' · ');
    return (link || (it.id != null ? '#' + it.id : '')) + (rest ? ' — ' + rest : '');
  }
  async function doRepair(action) {
    const pre = await api('/api/admin/repair', 'POST', { action });
    if (!pre.affected.length) { T('Niets te herstellen'); return go('health'); }
    const ids = pre.affected.slice(0, 20).map(a => typeof a === 'object' ? `${a.removed} → ${a.merged_into}` : a).join(', ') + (pre.affected.length > 20 ? ` … (+${pre.affected.length - 20})` : '');
    if (!confirm(`${pre.label}\n\nBetrokken: ${pre.affected.length}\n${ids}\n\nEr wordt eerst automatisch een backup gemaakt. Doorgaan?`)) return;
    const r = await api('/api/admin/repair', 'POST', { action, confirm: true });
    T(`✓ ${r.changes} item(s) hersteld — backup ${r.safety_backup}`);
    if (typeof loadAll === 'function') { await loadAll(); renderTable(); renderSidebar(); }
    go('health');
  }

  // ── Back-ups ─────────────────────────────────────────────────
  async function tBackups() {
    const [list, ret] = await Promise.all([api('/api/backups'), api('/api/admin/retention')]);
    const st = ret.status;
    const del = new Set(ret.delete.map(d => d.name)), keep = Object.fromEntries(ret.keep.map(k => [k.name, k.reason]));
    let html = `<div class="adm-grid">
      <div class="adm-card ${st.current ? 'ok' : 'warning'}"><div class="l">Status</div><div class="v">${st.current ? 'Actueel' : 'Niet actueel'}</div><div class="s">${st.age_hours == null ? 'geen geldige backup' : st.age_hours + ' uur oud (grens ' + st.stale_after_hours + ')'}</div></div>
      <div class="adm-card"><div class="l">Volgende</div><div class="v" style="font-size:14px">${fdt(st.next_scheduled)}</div><div class="s">dagelijks, planner ${st.scheduler_running ? 'actief' : 'niet actief'}</div></div>
      <div class="adm-card"><div class="l">Aantal</div><div class="v">${st.count}</div><div class="s">${st.valid_count} geldig · ${st.invalid_count} ongeldig · ${SZ(st.total_size)}</div></div>
      <div class="adm-card"><div class="l">Retentie</div><div class="v">${ret.policy.retention_days} dagen</div><div class="s">minstens ${ret.policy.keep_min} geldige blijven staan</div></div></div>
      ${st.last_error ? `<div class="adm-note" style="color:var(--red)">Laatste fout (${fdt(st.last_error_at)}): ${E(st.last_error)}</div>` : ''}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px"><button class="btn sm" data-act="mkbackup">💾 Nu backup maken</button></div>
      <div class="adm-h">Beschikbare back-ups</div>`;
    if (!list.length) html += '<div class="adm-note">Nog geen back-ups.</div>';
    html += list.map(b => `<div class="adm-row"><div class="grow"><div class="mono">${E(b.name)}</div><div style="color:var(--text3)">${fdt(b.ts)} · ${E(b.tag)} · ${SZ(b.size)}${b.counts && b.counts.parts != null ? ' · ' + b.counts.parts + ' onderdelen' : ''}</div>
      ${b.errors.length ? `<div style="color:var(--red)">${E(b.errors.join('; '))}</div>` : ''}</div>
      ${b.valid ? badge('ok', 'geldig') : badge('error', 'ongeldig')}
      ${del.has(b.name) ? badge('warning', 'wordt opgeruimd') : keep[b.name] ? `<span class="adm-badge" title="${E(keep[b.name])}">bewaard</span>` : ''}
      <a class="btn sec sm" href="/api/backups/${E(b.name)}" download>↓</a>
      <button class="btn sec sm" data-act="verify" data-arg="${E(b.name)}">Controleren</button>
      ${b.valid ? `<button class="btn sec sm" data-act="restore" data-arg="${E(b.name)}">↩ Terugzetten</button>` : ''}
      <button class="btn sec sm" data-act="delbackup" data-arg="${E(b.name)}">🗑</button></div>`).join('');
    html += `<div class="adm-h">Retentie-rapport</div><div class="adm-note">Backups ouder dan ${ret.policy.retention_days} dagen worden dagelijks opgeruimd, behalve de ${ret.policy.keep_min} nieuwste geldige (de nieuwste geldige wordt nooit verwijderd). Ongeldige backups tellen niet mee als veilige backup.
      ${ret.delete.length ? `<br><b>Nu op te ruimen (${ret.delete.length}, ${SZ(ret.freed)}):</b> ${ret.delete.map(d => E(d.name) + ' (' + d.age_days + ' d)').join(', ')}` : '<br>Op dit moment hoeft er niets te worden opgeruimd.'}</div>
      ${ret.delete.length ? '<button class="btn sec sm" data-act="retention">🧹 Nu opruimen</button>' : ''}
      <div class="adm-note" style="margin-top:12px"><b>Terugzetten, stap voor stap:</b> 1) kies een geldige backup → bevestig met de bestandsnaam; 2) de app controleert de backup (integriteit, tabellen, schema), 3) maakt een veiligheidsbackup van de huidige data, 4) zet terug en voert migraties uit, 5) controleert tabellen, metadata, aantal onderdelen en integriteit; bij een fout gaat alles automatisch terug. Zie ook docs/ADMIN.md.</div>
      <div id="admRestoreOut"></div>`;
    $('admBody').innerHTML = html;
  }
  async function doRestore(name) {
    const pre = await api(`/api/backups/${encodeURIComponent(name)}/restore`, 'POST', { dry_run: true });
    const c = pre.precheck.counts || {};
    const typed = prompt(`Terugzetten van ${name}\n\nBackup bevat ${c.parts ?? '?'} onderdelen, ${c.categories ?? '?'} categorieën, ${c.custom_locs ?? '?'} locaties.\nAlle huidige data wordt vervangen (er komt eerst een veiligheidsbackup).\n\nTyp de bestandsnaam om te bevestigen:`);
    if (typed !== name) { if (typed !== null) T('Bevestiging komt niet overeen — niets gewijzigd'); return; }
    try {
      const r = await api(`/api/backups/${encodeURIComponent(name)}/restore`, 'POST', { confirm: name });
      T('✓ Teruggezet en gecontroleerd');
      if (typeof loadAll === 'function') { await loadAll(); renderTable(); renderSidebar(); }
      await tBackups();
      $('admRestoreOut').innerHTML = `<div class="adm-issue info"><div class="t">✓ Restore geslaagd</div><div class="d">Veiligheidsbackup: ${E(r.safety_backup)} · onderdelen: ${r.verify.counts.parts} · integriteit: ${E(r.verify.integrity)}${r.verify.warnings.length ? '<br>Waarschuwingen: ' + E(r.verify.warnings.join('; ')) : ''}${r.verify.issues ? '<br>Integriteitscontrole: ' + r.verify.issues.errors + ' fouten, ' + r.verify.issues.warnings + ' waarschuwingen' : ''}</div></div>`;
    } catch (e) { T('⚠ ' + e.message); }
  }

  // ── Import / export ──────────────────────────────────────────
  async function tIO() {
    $('admBody').innerHTML = `<div class="adm-h">Exporteren</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><a class="btn sec sm" href="/api/export/json" download>JSON (alles)</a><a class="btn sec sm" href="/api/export/json?history=1" download>JSON + geschiedenis</a>
      <a class="btn sec sm" href="/api/export/csv" download>CSV (Excel-NL, ;)</a><a class="btn sec sm" href="/api/export/csv?delimiter=comma" download>CSV (komma)</a><a class="btn sec sm" href="/api/export/xlsx" download>Excel (.xlsx)</a></div>
      <div class="adm-note">Alleen bepaalde onderdelen? Vink ze aan in de lijst en gebruik de adres-parameter <code>?ids=1,2,3</code>, bijvoorbeeld <code>/api/export/csv?ids=1,2,3</code>.</div>
      <div class="adm-h">Importeren (met voorbeeld, nog niets wordt opgeslagen)</div>
      <div class="adm-drop"><input type="file" id="impFile" accept=".csv,.xlsx,.xlsm,.json,.txt"><div style="margin-top:8px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;align-items:center">
      <label>Bij dubbele onderdelen: <select id="impDup"><option value="skip">overslaan</option><option value="update">bijwerken</option><option value="create">toch toevoegen</option></select></label>
      <label id="impModeWrap">JSON-modus: <select id="impMode"><option value="merge">samenvoegen</option><option value="replace">alles vervangen (restore)</option></select></label>
      <button class="btn sm" data-act="impPreview">Voorbeeld tonen</button></div></div><div id="impOut"></div>`;
    if (imp) renderImport(imp);
  }
  async function impPreview() {
    const f = $('impFile').files[0];
    if (!f) return T('Kies eerst een bestand');
    const fd = new FormData(); fd.append('file', f); fd.append('duplicate_mode', $('impDup').value); fd.append('mode', $('impMode').value);
    const r = await fetch('/api/import/preview', { method: 'POST', body: fd });
    const j = await r.json();
    if (!r.ok) { $('impOut').innerHTML = `<div class="adm-note" style="color:var(--red)">⚠ ${E(j.error)}</div>`; return; }
    imp = j; renderImport(j);
  }
  function renderImport(j) {
    const c = j.counts, replace = j.kind === 'json' && j.options.mode === 'replace';
    let h = `<div class="adm-h">Voorbeeld: ${E(j.filename)} <span class="adm-badge">${j.kind === 'json' ? 'JSON' : 'tabel'}</span></div><div class="adm-grid">` +
      [['Rijen', c.total], ['Nieuw', c.create, 'ok'], ['Bijwerken', c.update], ['Overgeslagen', c.skip], ['Ongeldig', c.invalid, c.invalid ? 'error' : ''], ['Dubbel in bestand', c.duplicate_in_file, c.duplicate_in_file ? 'warning' : ''], ['Bestaat al', c.duplicate_in_db], ['Verplicht ontbreekt', c.missing_required, c.missing_required ? 'error' : ''], ['Waarschuwingen', c.warnings, c.warnings ? 'warning' : '']]
        .map(([l, v, cls]) => `<div class="adm-card ${cls || ''}"><div class="l">${l}</div><div class="v">${v}</div></div>`).join('') + '</div>';
    if (j.kind === 'table') {
      h += `<div class="adm-h">Kolommen koppelen</div><div style="overflow-x:auto"><table class="adm-tbl"><tr>${Object.entries(j.fields).map(([f, m]) => `<th>${E(m.label)}${m.required ? ' *' : ''}</th>`).join('')}</tr><tr>${Object.keys(j.fields).map(f =>
        `<td><select data-map="${f}"><option value="">—</option>${j.headers.map(hd => `<option ${j.mapping[f] === hd ? 'selected' : ''}>${E(hd)}</option>`).join('')}</select></td>`).join('')}</tr></table></div>`;
      if (j.missing_required.length) h += `<div class="adm-note" style="color:var(--red)">Koppel eerst: ${j.missing_required.join(', ')}</div>`;
    } else {
      h += `<div class="adm-note">Inhoud: ${Object.entries(j.json_info.counts || {}).map(([k, v]) => k + ' ' + v).join(' · ')}.${replace ? ` <b style="color:var(--red)">Alles vervangen:</b> huidige data (${Object.entries(j.replace_summary?.will_replace || {}).map(([k, v]) => k + ' ' + v).join(', ')}) wordt gewist en vervangen.` : ''}${replace && !j.replace_possible ? ' <b style="color:var(--red)">Dit bestand is geen volledige, geldige export — vervangen niet mogelijk.</b>' : ''}</div>`;
      if (j.json_errors.length) h += `<div class="adm-issue error"><div class="t">Fouten in het bestand</div><div class="adm-items">${j.json_errors.map(e => `<div>${E(e)}</div>`).join('')}</div></div>`;
    }
    if (j.invalid_rows.length) h += `<div class="adm-h">Ongeldige rijen (${c.invalid})</div><div class="adm-items" style="max-height:140px">${j.invalid_rows.map(r => `<div>rij ${r.row}: ${E(r.name || '(geen naam)')} — ${E(r.errors.join('; '))}</div>`).join('')}</div>`;
    if (j.duplicates.length) h += `<div class="adm-h">Duplicaten (${j.duplicates.length})</div><div class="adm-items" style="max-height:140px">${j.duplicates.map(d => `<div>rij ${d.row}: ${E(d.name)}${d.IPN ? ' [' + E(d.IPN) + ']' : ''} — ${d.kind === 'in_file' ? 'komt eerder voor in rij ' + d.first_row : 'bestaat al als #' + d.match_id + ' ' + E(d.match_name)}</div>`).join('')}</div>`;
    if (j.warnings.length) h += `<div class="adm-h">Waarschuwingen</div><div class="adm-items" style="max-height:120px">${j.warnings.map(w => `<div>rij ${w.row}: ${E(w.message)}</div>`).join('')}</div>`;
    if (j.updates.length) h += `<div class="adm-h">Wijzigingen bij bijwerken (eerste ${j.updates.length})</div><div class="adm-items" style="max-height:140px">${j.updates.map(u => `<div>#${u.id} ${E(u.name)}: ${Object.entries(u.diff).map(([k, v]) => `${k} ${E(JSON.stringify(v[0]))} → ${E(JSON.stringify(v[1]))}`).join(', ') || 'geen verschil'}</div>`).join('')}</div>`;
    const can = replace ? j.replace_possible : (c.create + c.update > 0 && !(j.missing_required || []).length);
    h += `<div style="display:flex;gap:8px;margin-top:14px"><button class="btn ${replace ? 'danger' : ''}" data-act="impCommit" ${can ? '' : 'disabled'}>${replace ? 'Alles vervangen' : `Importeren (${c.create} nieuw, ${c.update} bijwerken)`}</button><button class="btn sec" data-act="impCancel">Annuleren</button></div>
      <div class="adm-note">Vóór het importeren wordt automatisch een backup gemaakt; alles gebeurt in één stap, bij een fout is er niets gewijzigd.</div>`;
    $('impOut').innerHTML = h;
  }
  async function impCommit() {
    const replace = imp.kind === 'json' && imp.options.mode === 'replace';
    if (replace && prompt('Dit vervangt ALLE huidige data. Typ VERVANGEN om door te gaan:') !== 'VERVANGEN') return;
    if (!replace && !confirm(`${imp.counts.create} nieuw en ${imp.counts.update} bijwerken. Importeren?`)) return;
    try {
      const r = await api('/api/import/commit', 'POST', { token: imp.token, confirm: true });
      imp = null; T(`✓ Import klaar: ${r.created} nieuw, ${r.updated} bijgewerkt, ${r.skipped} overgeslagen`);
      if (typeof loadAll === 'function') { await loadAll(); renderTable(); renderSidebar(); }
      $('impOut').innerHTML = `<div class="adm-issue info"><div class="t">✓ Import afgerond</div><div class="d">${r.created} nieuw · ${r.updated} bijgewerkt · ${r.skipped} overgeslagen · ${r.invalid} ongeldig. Veiligheidsbackup: ${E(r.safety_backup)}</div></div>`;
    } catch (e) { T('⚠ ' + e.message); }
  }
  async function impCancel() { if (imp) await fetch('/api/import/' + imp.token, { method: 'DELETE' }); imp = null; $('impOut').innerHTML = '<div class="adm-note">Import geannuleerd — er is niets gewijzigd.</div>'; }
  async function impRemap() {
    const mapping = {}; document.querySelectorAll('#impOut select[data-map]').forEach(s => { if (s.value) mapping[s.dataset.map] = s.value; });
    imp = await api('/api/import/preview', 'POST', { token: imp.token, mapping, options: { duplicate_mode: $('impDup').value } }); renderImport(imp);
  }

  // ── Media ────────────────────────────────────────────────────
  async function tMedia() {
    const [o, b] = await Promise.all([api('/api/media/orphans'), api('/api/media/broken')]);
    let h = `<div class="adm-h">Ongebruikte bestanden (${o.count}, ${SZ(o.size)})</div>`;
    h += o.count ? `<table class="adm-tbl"><tr><th>Bestand</th><th>Grootte</th><th>Leeftijd</th></tr>${o.files.map(f => `<tr><td><a href="${E(f.url)}" target="_blank" rel="noopener">${E(f.name)}</a></td><td>${SZ(f.size)}</td><td>${f.age_min} min</td></tr>`).join('')}</table>
      <div style="margin-top:8px"><button class="btn danger sm" data-act="delorph">🗑 Deze ${o.count} bestanden verwijderen</button></div>` : '<div class="adm-ok">✓ Geen ongebruikte bestanden</div>';
    if (o.skipped_recent.length) h += `<div class="adm-note">${o.skipped_recent.length} recent geüpload bestand(en) worden overgeslagen (minder dan ${o.grace_min} min oud), voor het geval het formulier nog niet is opgeslagen.</div>`;
    h += `<div class="adm-h">Verwijzingen naar ontbrekende bestanden (${b.length})</div>`;
    h += b.length ? `<table class="adm-tbl"><tr><th>Onderdeel</th><th>Veld</th><th>Bestand</th></tr>${b.map(x => `<tr><td><a data-act="open" data-arg="${x.partId}">#${x.partId} ${E(x.partName)}</a></td><td>${x.field}</td><td>${E(x.file)}</td></tr>`).join('')}</table>
      <div style="margin-top:8px"><button class="btn sm" data-act="repair" data-arg="clear_broken_media">🛠 Ontbrekende verwijzingen wissen</button></div>` : '<div class="adm-ok">✓ Alle foto\'s en documenten bestaan</div>';
    $('admBody').innerHTML = h;
  }

  // ── Logboek ──────────────────────────────────────────────────
  async function tLog() {
    const q = new URLSearchParams({ limit: 300, level: logF.level, category: logF.category, q: logF.q });
    const d = await api('/api/admin/logs?' + q);
    const cats = Object.keys(d.summary.by_category);
    let h = `<div class="adm-grid"><div class="adm-card ${d.summary.errors ? 'error' : 'ok'}"><div class="l">Fouten (24u)</div><div class="v">${d.summary.errors}</div></div><div class="adm-card ${d.summary.warnings ? 'warning' : 'ok'}"><div class="l">Waarschuwingen (24u)</div><div class="v">${d.summary.warnings}</div></div>
      <div class="adm-card"><div class="l">Logbestand</div><div class="v">${SZ(d.summary.file_size)}</div><div class="s">rotatie: ${d.summary.rotation.max_mb} MB × ${d.summary.rotation.backups}</div></div></div>`;
    if (cats.length) h += `<div class="adm-note">Per categorie (24u): ${cats.map(c => `<b>${E(c)}</b> ${d.summary.by_category[c].errors} fouten / ${d.summary.by_category[c].warnings} waarschuwingen`).join(' · ')}</div>`;
    h += `<div class="adm-filters"><select data-f="level">${[['info', 'Alles'], ['warning', 'Waarschuwingen+'], ['error', 'Alleen fouten']].map(([v, l]) => `<option value="${v}" ${logF.level === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <select data-f="category"><option value="">Alle categorieën</option>${['app', 'db', 'media', 'upload', 'backup', 'restore', 'repair', 'import', 'export', 'ai', 'startup', 'admin'].map(c => `<option ${logF.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
      <input data-f="q" placeholder="Zoek in logboek…" value="${E(logF.q)}"><a class="btn sec sm" href="/api/admin/logs/download" download>↓ Logbestand</a></div>`;
    h += d.entries.length ? `<table class="adm-tbl adm-log">${d.entries.map(e => `<tr class="${e.level}"><td style="white-space:nowrap">${e.ts}</td><td>${e.level}</td><td>${E(e.category)}</td><td>${E(e.message)}</td></tr>`).join('')}</table>` : '<div class="adm-ok">Geen meldingen</div>';
    $('admBody').innerHTML = h;
  }

  // ── events ───────────────────────────────────────────────────
  let _t; function onInput(e) { const f = e.target.dataset.f; if (f === 'q') { logF.q = e.target.value; clearTimeout(_t); _t = setTimeout(() => tLog().then(() => { const i = document.querySelector('[data-f=q]'); i.focus(); i.setSelectionRange(99, 99); }), 350); } }
  function onChange(e) {
    const t = e.target;
    if (t.dataset.f && t.dataset.f !== 'q') { logF[t.dataset.f] = t.value; tLog().catch(err); }
    if (t.dataset.map !== undefined) impRemap().catch(x => T('⚠ ' + x.message));
    if (t.id === 'impDup' && imp) impRemap().catch(x => T('⚠ ' + x.message));
    if (t.id === 'impMode' && imp) { api('/api/import/preview', 'POST', { token: imp.token, options: { mode: t.value } }).then(j => { imp = j; renderImport(j); }); }
  }
  async function onClick(e) {
    const el = e.target.closest('[data-act]'); if (!el) { if (e.target.id === 'adminOvl') closeAdmin(); return; }
    const a = el.dataset.act, arg = el.dataset.arg;
    try {
      if (a === 'close') closeAdmin();
      else if (a === 'tab') go(arg);
      else if (a === 'items') { const box = $('admItems' + arg); box.hidden = !box.hidden; if (!box.innerHTML) box.innerHTML = lastIssues[arg].items.map(i => `<div>${itemLine(i)}</div>`).join('') + (lastIssues[arg].count > lastIssues[arg].items.length ? `<div>… en ${lastIssues[arg].count - lastIssues[arg].items.length} meer</div>` : ''); }
      else if (a === 'open') { closeAdmin(); if (typeof selPart === 'function') selPart(parseInt(arg)); }
      else if (a === 'repair') await doRepair(arg);
      else if (a === 'mkbackup') { await api('/api/backups', 'POST'); T('✓ Backup gemaakt en gecontroleerd'); go(tab); }
      else if (a === 'verify') { const r = await api(`/api/backups/${encodeURIComponent(arg)}/verify`, 'POST'); T(r.ok ? `✓ ${arg} is geldig (${r.counts.parts} onderdelen)` : '⚠ ' + r.errors.join('; ')); }
      else if (a === 'restore') await doRestore(arg);
      else if (a === 'delbackup') { if (confirm('Backup verwijderen: ' + arg + '?')) { await api('/api/backups/' + encodeURIComponent(arg), 'DELETE'); go('bk'); } }
      else if (a === 'retention') { const r = await api('/api/admin/retention/run', 'POST', {}); T(`🧹 ${r.deleted.length} backup(s) opgeruimd`); go('bk'); }
      else if (a === 'impPreview') await impPreview();
      else if (a === 'impCommit') await impCommit();
      else if (a === 'impCancel') await impCancel();
      else if (a === 'delorph') { const r = await api('/api/media/orphans', 'DELETE'); T(`🗑 ${r.count} bestand(en) verwijderd`); go('media'); }
    } catch (x) { T('⚠ ' + (x.message || x)); }
  }
})();
