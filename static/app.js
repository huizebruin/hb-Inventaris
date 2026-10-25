// ── NIEUWE CATEGORIEËN (v1.5.0) ──────────────────────────────
let CATS = {
  // 🔌 Passieve componenten
  201: "🔌 Passieve componenten",
  202: "Weerstanden (THT)",
  203: "Weerstanden (SMD)",
  204: "Condensatoren - Keramisch",
  205: "Condensatoren - Elektrolytisch",
  206: "Condensatoren - Overig",
  207: "Spoelen & Ferrieten",
  208: "Kristallen & Oscillatoren",
  // ⚡ Actieve componenten
  210: "⚡ Actieve componenten",
  211: "Diodes (algemeen)",
  212: "Zener diodes",
  213: "Transistoren NPN/PNP",
  214: "MOSFETs",
  215: "Voltage regulators",
  216: "Bridge rectifiers",
  // 💡 IC's & Modules
  220: "💡 IC's & Modules",
  221: "Microcontrollers",
  222: "ESP8266 / ESP32",
  223: "Raspberry Pi",
  224: "Drivers & Logic",
  225: "Displays (LCD/OLED)",
  226: "Audio modules",
  227: "Relais & Schakelaars",
  228: "Sensoren modules",
  // 📡 Communicatie
  230: "📡 Communicatie",
  231: "WiFi modules",
  232: "Ethernet / RJ45",
  233: "RS485 / UART",
  234: "RF & LoRa",
  235: "Bluetooth / Zigbee",
  236: "USB Interfaces",
  // 🔌 Connectors & Kabels
  240: "🔌 Connectors & Kabels",
  241: "Header pins (male/female)",
  242: "Schroefklemmen",
  243: "Banana plugs",
  244: "DC power jacks",
  245: "USB connectors",
  246: "JST / RJ45",
  // 📡 Sensoren
  250: "📡 Sensoren",
  251: "Temperatuur / Vochtigheid",
  252: "Afstand / Beweging",
  253: "Gas / Vloeistof",
  254: "Stroom / Spanning",
  255: "Licht / IR",
  256: "Overige sensoren",
  // 🛠️ Gereedschap
  260: "🛠️ Gereedschap",
  261: "Handgereedschap",
  262: "Meetapparatuur",
  263: "3D-printer gereedschap",
  264: "Reinigingsmiddelen",
  265: "Testapparatuur",
  // 📦 Verbruiksartikelen
  270: "📦 Verbruiksartikelen",
  271: "Soldeertin & Flux",
  272: "Bevestigingsmateriaal",
  273: "Verpakkingsmateriaal",
  274: "Labels & Tape",
  275: "ESD zakken",
  // 🖨️ 3D Printing
  280: "🖨️ 3D Printing",
  281: "Filament - PLA",
  282: "Filament - Overig",
  283: "3D-printer onderdelen",
  // 🧩 Producten & PCB's
  290: "🧩 Producten & PCB's",
  293: "PCB's (inkoop)",
  294: "Prototype builds",
  295: "Eindproducten",
  // 🗃️ Overige
  300: "🗃️ Overige",
  301: "Tablets & Apparaten",
  302: "Reserveonderdelen",
  303: "Diverse",
  304: "Uurloon",
};

// Migratie: oude catId → nieuwe catId
const CAT_MIGRATE = {
  1: 201,   // Elektronische componenten → Passieve componenten
  2: 303,   // Onderdelen → Diverse
  3: 202,   // Weerstanden → Weerstanden THT
  4: 240,   // Connectors → Connectors & Kabels
  5: 220,   // IC's → IC's & Modules
  8: 240,   // Kabels & Draad → Connectors & Kabels
  9: 206,   // Condensatoren → Condensatoren Overig
  13: 280,  // 3d printer → 3D Printing
  14: 263,  // 3d printer tools → 3D-printer gereedschap
  15: 281,  // Filament → Filament PLA
  16: 303,  // Behuizingen → Diverse
  19: 273,  // Verzendingen → Verpakkingsmateriaal
  20: 273,  // Enveloppen → Verpakkingsmateriaal
  21: 275,  // Esd zakken → ESD zakken
  22: 228,  // Arduino sensoren → Sensoren modules
  23: 304,  // Uurloon → Uurloon
  24: 301,  // Tablets → Tablets & Apparaten
  26: 211,  // Diodes → Diodes algemeen
  27: 227,  // Relais & Schakelaars → Relais & Schakelaars
  28: 227,  // Schakelaars → Relais & Schakelaars
  29: 216,  // Bruggelijkrichters → Bridge rectifiers
  31: 300,  // Overige → Overige
  32: 303,  // Development Boards → Diverse
  33: 303,  // Arduino → Diverse
  36: 223,  // Raspberry Pi → Raspberry Pi
  37: 260,  // Gereedschap → Gereedschap
  38: 261,  // Handgereedschap → Handgereedschap
  39: 262,  // Meetapparatuur → Meetapparatuur
  40: 265,  // Testapparatuur → Testapparatuur
  41: 294,  // Prototypes → Prototype builds
  42: 302,  // reserveonderdeel → Reserveonderdelen
  43: 270,  // Verbruiksartikelen → Verbruiksartikelen
  44: 271,  // Solderen → Soldeertin & Flux
  45: 271,  // Tin → Soldeertin & Flux
  46: 271,  // Flux → Soldeertin & Flux
  47: 263,  // Tips → 3D-printer gereedschap
  49: 274,  // Lijm & Tape → Labels & Tape
  50: 264,  // Schoonmaakmiddelen → Reinigingsmiddelen
  51: 272,  // Mechanisch → Bevestigingsmateriaal
  52: 272,  // Bevestigingsmateriaal → Bevestigingsmateriaal
  53: 272,  // Schroeven → Bevestigingsmateriaal
  54: 272,  // Moeren → Bevestigingsmateriaal
  55: 272,  // Ringen → Bevestigingsmateriaal
  56: 303,  // Behuizingen mech → Diverse
  57: 303,  // Koppelstukken → Diverse
  58: 303,  // Motoren & Servos → Diverse
  59: 283,  // 3D-print onderdelen → 3D-printer onderdelen
  60: 303,  // Tandwielen → Diverse
  61: 202,  // Doorvoer THT → Weerstanden THT
  62: 203,  // Opbouw SMD → Weerstanden SMD
  63: 204,  // Keramisch → Condensatoren Keramisch
  64: 205,  // Elektrolytisch → Condensatoren Elektrolytisch
  65: 206,  // Tantalum → Condensatoren Overig
  66: 207,  // Spoelen & Ferrieten → Spoelen & Ferrieten
  67: 212,  // Zener → Zener diodes
  68: 211,  // Schottky → Diodes algemeen
  69: 213,  // Transistoren → Transistoren NPN/PNP
  70: 213,  // NPN/PNP → Transistoren NPN/PNP
  71: 214,  // MOSFET → MOSFETs
  72: 224,  // Logica → Drivers & Logic
  73: 221,  // Microcontrollers → Microcontrollers
  74: 224,  // Drivers → Drivers & Logic
  76: 241,  // Header Pins → Header pins
  77: 246,  // JST → JST/RJ45
  78: 245,  // USB → USB connectors
  79: 246,  // RJ45 → JST/RJ45
  80: 225,  // Displays → Displays LCD/OLED
  81: 225,  // LCD → Displays LCD/OLED
  82: 225,  // OLED → Displays LCD/OLED
  83: 225,  // 7-segment → Displays LCD/OLED
  84: 303,  // LEDs & Verlichting → Diverse
  85: 226,  // Audio → Audio modules
  86: 303,  // Variabel potentiometers → Diverse
  87: 230,  // Communicatie → Communicatie
  88: 231,  // WiFi Modules → WiFi modules
  89: 222,  // ESP8266 → ESP8266/ESP32
  90: 222,  // ESP32 → ESP8266/ESP32
  91: 235,  // Bluetooth/BLE → Bluetooth/Zigbee
  92: 234,  // RF Modules → RF & LoRa
  93: 234,  // LoRa → RF & LoRa
  94: 234,  // 433MHz → RF & LoRa
  95: 235,  // Zigbee → Bluetooth/Zigbee
  96: 232,  // Ethernet/RJ45 → Ethernet/RJ45
  97: 233,  // CAN-bus → RS485/UART
  98: 236,  // USB Interfaces → USB Interfaces
  99: 233,  // Seriële converters → RS485/UART
  100: 250, // Sensoren → Sensoren
  101: 251, // Temperatuur → Temperatuur/Vochtigheid
  102: 252, // Beweging → Afstand/Beweging
  103: 256, // Druk → Overige sensoren
  104: 253, // Gas → Gas/Vloeistof
  105: 255, // Licht/IR → Licht/IR
  106: 252, // Afstand/Ultrasoon → Afstand/Beweging
  107: 256, // Hallsensoren → Overige sensoren
  108: 254, // Current Sensors → Stroom/Spanning
  109: 290, // Producten PCB Assemblies → Producten & PCB's
  110: 295, // PCB Assemblies eindproducten → Eindproducten
  111: 293, // PCB Inkoop → PCB's inkoop
  112: 294, // Prototype Builds → Prototype builds
  113: 294, // Testseries → Prototype builds
  114: 294, // Ontwikkeling → Prototype builds
  115: 295, // Behuizingen PCB → Eindproducten
  116: 228, // Sensoren producten → Sensoren modules
  117: 303, // Zekering → Diverse
  118: 215, // Spanningsregelaars → Voltage regulators
};

let TREE = [
  { id: 201, lbl: "🔌 Passieve componenten", ch: [202, 203, 204, 205, 206, 207, 208] },
  { id: 210, lbl: "⚡ Actieve componenten", ch: [211, 212, 213, 214, 215, 216] },
  { id: 220, lbl: "💡 IC's & Modules", ch: [221, 222, 223, 224, 225, 226, 227, 228] },
  { id: 230, lbl: "📡 Communicatie", ch: [231, 232, 233, 234, 235, 236] },
  { id: 240, lbl: "🔌 Connectors & Kabels", ch: [241, 242, 243, 244, 245, 246] },
  { id: 250, lbl: "📡 Sensoren", ch: [251, 252, 253, 254, 255, 256] },
  { id: 260, lbl: "🛠️ Gereedschap", ch: [261, 262, 263, 264, 265] },
  { id: 270, lbl: "📦 Verbruiksartikelen", ch: [271, 272, 273, 274, 275] },
  { id: 280, lbl: "🖨️ 3D Printing", ch: [281, 282, 283] },
  { id: 290, lbl: "🧩 Producten & PCB's", ch: [291, 292, 293, 294, 295] },
  { id: 300, lbl: "🗃️ Overige", ch: [301, 302, 303, 304] },
];

// Category colors per root group
const CAT_COLORS = {
  201: '#f0c040', 202: '#f0c040', 203: '#f0c040', 204: '#f0c040', 205: '#f0c040', 206: '#f0c040', 207: '#f0c040', 208: '#f0c040', // Passief - geel
  210: '#e05c5c', 211: '#e05c5c', 212: '#e05c5c', 213: '#e05c5c', 214: '#e05c5c', 215: '#e05c5c', 216: '#e05c5c', // Actief - rood
  220: '#5bb8f5', 221: '#5bb8f5', 222: '#5bb8f5', 223: '#5bb8f5', 224: '#5bb8f5', 225: '#5bb8f5', 226: '#5bb8f5', 227: '#5bb8f5', 228: '#5bb8f5', // IC's - blauw
  230: '#9b59b6', 231: '#9b59b6', 232: '#9b59b6', 233: '#9b59b6', 234: '#9b59b6', 235: '#9b59b6', 236: '#9b59b6', // Communicatie - paars
  240: '#e0944a', 241: '#e0944a', 242: '#e0944a', 243: '#e0944a', 244: '#e0944a', 245: '#e0944a', 246: '#e0944a', // Connectors - oranje
  250: '#4db884', 251: '#4db884', 252: '#4db884', 253: '#4db884', 254: '#4db884', 255: '#4db884', 256: '#4db884', // Sensoren - groen
  260: '#95a5a6', 261: '#95a5a6', 262: '#95a5a6', 263: '#95a5a6', 264: '#95a5a6', 265: '#95a5a6', // Gereedschap - grijs
  270: '#e67e22', 271: '#e67e22', 272: '#e67e22', 273: '#e67e22', 274: '#e67e22', 275: '#e67e22', // Verbruik - donkeroranje
  280: '#1abc9c', 281: '#1abc9c', 282: '#1abc9c', 283: '#1abc9c', // 3D Print - turquoise
  290: '#e91e8c', 291: '#e91e8c', 292: '#e91e8c', 293: '#e91e8c', 294: '#e91e8c', 295: '#e91e8c', // Producten - roze
  300: '#7f8c8d', 301: '#7f8c8d', 302: '#7f8c8d', 303: '#7f8c8d', 304: '#7f8c8d', // Overige - donkergrijs
};

let LOCS = {};
let parts = [], customLocs = {}, catF = null, srch = '', sortK = 'name', sortA = true, selId = null;
const _pendingDel = new Set();   // onderdelen die verborgen zijn en nog ongedaan gemaakt kunnen worden
let suppliers = [];
// Pinned parts (stored in localStorage)
let _pinned = new Set(JSON.parse(localStorage.getItem('hb_pinned') || '[]'));

// ── API ──────────────────────────────────────────────────────
async function api(path, method = 'GET', body = null) {
  let tok = ''; try { tok = sessionStorage.getItem('hb_admin_token') || ''; } catch (e) { }
  const opts = { method, headers: { 'Content-Type': 'application/json', ...(tok ? { 'X-Admin-Token': tok } : {}) } };
  if (body) opts.body = JSON.stringify(body);
  const r = await fetch(path, opts);
  if (r.status === 401) {   // server heeft HB_ADMIN_TOKEN ingesteld: eenmalig om het token vragen
    const t = prompt('Beheer-token (HB_ADMIN_TOKEN):');
    if (t) { try { sessionStorage.setItem('hb_admin_token', t); } catch (e) { } return api(path, method, body); }
  }
  if (!r.ok) {
    const raw = await r.text();
    try { throw new Error(JSON.parse(raw).error || raw); }
    catch (parseErr) { throw new Error(parseErr instanceof SyntaxError ? raw : parseErr.message); }
  }
  return r.json();
}

async function loadAll() {
  const [d, supps, projs, ords, locs, dbCats] = await Promise.all([
    api('/api/data').catch(e => { console.error('api/data:', e); return { parts: [], history: [], customLocs: {} }; }),
    api('/api/suppliers').catch(e => []),
    api('/api/projects').catch(e => []),
    api('/api/orders').catch(e => []),
    api('/api/locations').catch(e => { console.error('api/locations:', e); return {}; }),
    api('/api/categories').catch(e => []),
  ]);
  // Merge DB categories into CATS and TREE
  if (dbCats && dbCats.length > 0) {
    dbCats.forEach(c => { CATS[c.id] = (c.icon ? c.icon + ' ' : '') + c.name; });
    const parents = dbCats.filter(c => !c.parent).sort((a, b) => a.sort - b.sort);
    TREE.length = 0;
    parents.forEach(p => {
      const children = dbCats.filter(c => c.parent === p.id).map(c => c.id);
      TREE.push({ id: p.id, lbl: CATS[p.id], ch: children });
    });
  }
  // Merge all locations from DB into LOCS - normaliseer keys naar strings
  LOCS = {};
  Object.entries(locs || {}).forEach(([k, v]) => { LOCS[String(k)] = v; });
  parts = (d.parts || []).filter(p => !_pendingDel.has(p.id));
  customLocs = d.customLocs || {};
  Object.entries(customLocs).forEach(([k, v]) => { LOCS[String(k)] = v; });
  suppliers = supps || [];
  projects = projs || [];
  orders = ords || [];
  // Build last-modified index from history
  const hist = d.history || [];
  window._lastModified = {};
  hist.forEach(h => { if (!window._lastModified[h.partId] || h.ts > window._lastModified[h.partId]) window._lastModified[h.partId] = h.ts; });
  // Migrate old category IDs to new ones (silent, non-blocking)
  let migrated = false;
  parts.forEach(p => {
    const oldCat = p.catId;
    if (p.catId && CAT_MIGRATE[p.catId]) {
      p.catId = CAT_MIGRATE[p.catId];
      migrated = true;
    }
  });
  if (migrated) {
    // Save silently in background, don't block rendering
    api('/api/parts/migrate', 'POST', { parts }).catch(() => { });
  }
}

// ── HELPERS ──────────────────────────────────────────────────
function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }
function cat(id) { return CATS[id] || '—' }
function loc(id) { return id != null ? LOCS[String(id)] || LOCS[id] || '—' : '—' }

// ── TABLE ────────────────────────────────────────────────────
let _showArchived = false;

// ── ZOEKEN ────────────────────────────────────────────────────
// Elk zoekwoord moet ergens voorkomen (EN), de beste treffers staan bovenaan. Een treffer aan het
// begin van een woord telt zwaarder dan ergens middenin, naam/IPN zwaarder dan omschrijving/notities.
// Losse-letters-matching ("e-s-p-3-2" verspreid over een lange tekst) is bewust beperkt tot naam/IPN
// en tot compacte treffers, anders matcht bijna alles en moet je door de hele lijst heen.
const _srchNorm = s => String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const _srchWords = s => s.split(/[^a-z0-9\u00b5\u03a9\u03c9]+/).filter(Boolean);

function _tokScore(f, tok) {
  // f = {s: genormaliseerde tekst, w: woorden}
  if (!f.s) return 0;
  if (f.w.includes(tok)) return 100;                         // heel woord
  if (f.w.some(w => w.startsWith(tok))) return 80;           // begin van een woord
  if (f.s.includes(tok)) return 50;                          // ergens in
  return 0;
}
function _subseq(s, q) {
  // alle letters van q in volgorde in s, maar compact (max. span = 1.5 x lengte + 1)
  if (q.length < 3 || q.length > s.length) return 0;
  const max = Math.floor(q.length * 1.5) + 1;
  for (let st = s.indexOf(q[0]); st !== -1; st = s.indexOf(q[0], st + 1)) {
    let qi = 1, i = st + 1;
    while (qi < q.length && i < s.length && i - st < max) { if (s[i] === q[qi]) qi++; i++; }
    if (qi === q.length) return 25;
  }
  return 0;
}

const _SRCH_FIELDS = [['name', 10], ['IPN', 8], ['tags', 5], ['desc', 3], ['cat', 2], ['loc', 2], ['supp', 2], ['notes', 1]];
function _srchIndex(p) {
  const mk = t => { const s = _srchNorm(t); return { s, w: _srchWords(s) }; };
  return {
    name: mk(p.name), IPN: mk(p.IPN), tags: mk((p.tags || []).join(' ')), desc: mk(p.desc),
    cat: mk(cat(p.catId)), loc: mk(loc(p.locId)), notes: mk(p.notes),
    supp: mk((p.suppliers || []).map(s => suppById(s.suppId)?.name || '').join(' '))
  };
}
// Geeft 0 terug als het onderdeel niet voldoet (elk zoekwoord moet matchen), anders een score
function fuzzyMatch(p, q, toks) {
  toks = toks || _srchNorm(q).trim().split(/\s+/).filter(Boolean);
  if (!toks.length) return 0;
  const ix = _srchIndex(p);
  let total = 0;
  for (const tok of toks) {
    let best = 0;
    for (const [k, wgt] of _SRCH_FIELDS) {
      let sc = _tokScore(ix[k], tok);
      if (!sc && (k === 'name' || k === 'IPN') && toks.length === 1) sc = _subseq(ix[k].s.replace(/[^a-z0-9]/g, ''), tok);
      best = Math.max(best, sc * wgt);
    }
    if (!best) return 0;
    total += best;
  }
  const full = toks.join(' ');
  if (ix.name.s === full || ix.IPN.s === full) total += 5000;          // exacte treffer
  else if (ix.name.s.startsWith(full) || ix.IPN.s.startsWith(full)) total += 1500;
  else if (ix.name.s.includes(full)) total += 600;
  if (toks.length > 1 && toks.every(t => ix.name.s.includes(t))) total += 400;
  return total;
}

// ── SNELFILTERS (chips) ───────────────────────────────────────
const CHIP_DEFS = [
  { k: 'low', ic: '⚠', lbl: 'Lage voorraad', test: p => p.minStock > 0 && (p.stock || 0) < p.minStock },
  { k: 'zero', ic: '∅', lbl: 'Leeg', test: p => (p.stock || 0) === 0 },
  { k: 'noloc', ic: '📍', lbl: 'Zonder locatie', test: p => !p.locId },
  { k: 'pinned', ic: '📌', lbl: 'Vastgezet', test: p => _pinned.has(p.id) },
  { k: 'exp', ic: '⏰', lbl: 'Verloopt', test: p => { const s = getExpiryStatus(p.expiryDate); return s === 'expired' || s === 'critical' || s === 'warning'; } },
];
window._chips = { low: false, zero: false, noloc: false, pinned: false, exp: false };

// Grote inventarissen: eerst PAGE rijen tonen, de rest via "Toon meer"
const PAGE = 300;
let _renderLimit = PAGE, _viewSig = '';
// Zijn er maar een paar rijen over, toon ze dan gewoon allemaal i.p.v. een knop voor 3 rijen
const _cap = n => (n <= _renderLimit + 50 ? n : _renderLimit);

function renderChips() {
  const bar = document.getElementById('chipBar'); if (!bar) return;
  const base = window._lastBase || filtered({ noChips: true });
  let h = '', anyOn = false;
  CHIP_DEFS.forEach(c => {
    const n = base.filter(c.test).length, on = _chips[c.k];
    if (!n && !on) return;
    if (on) anyOn = true;
    h += `<button class="chip ${c.k}${on ? ' on' : ''}" aria-pressed="${on}" onclick="toggleChip('${c.k}')"><span class="ic">${c.ic}</span>${c.lbl}<span class="n">${n}</span></button>`;
  });
  if (anyOn) h += '<button class="chip clear" onclick="clearChips()">✕ Wis filters</button>';
  bar.innerHTML = h;
  bar.style.display = h ? '' : 'none';
}
function toggleChip(k) { _chips[k] = !_chips[k]; window._zeroStockMode = _chips.zero; renderTable(); updateAlertCenter(); }
function clearChips() { Object.keys(_chips).forEach(k => _chips[k] = false); window._zeroStockMode = false; renderTable(); updateAlertCenter(); }

// Zoekwoorden markeren in naam / omschrijving / IPN
let _hlRe = null;
function hlPrep() {
  const q = srch.trim().toLowerCase();
  if (!q || q[0] === '#') { _hlRe = null; return; }
  const t = [...new Set(q.split(/\s+/))].sort((a, b) => b.length - a.length).map(x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  _hlRe = new RegExp('(' + t.join('|') + ')', 'gi');
}
function hl(str) {
  str = str == null ? '' : String(str);
  if (!_hlRe || !str) return esc(str);
  return str.split(_hlRe).map((part, i) => i % 2 ? '<mark class="hl">' + esc(part) + '</mark>' : esc(part)).join('');
}

function filtered(opts = {}) {
  let l = _showArchived ? parts : parts.filter(p => p.active !== false);
  if (srch.trim()) {
    const q = srch.toLowerCase().trim();
    if (q.startsWith('#')) {
      const tag = q.slice(1);
      l = l.filter(p => (p.tags || []).some(t => t.includes(tag)));
    } else {
      const toks = _srchNorm(q).trim().split(/\s+/).filter(Boolean);
      const scored = l.map(p => ({ p, score: fuzzyMatch(p, q, toks) })).filter(x => x.score > 0);
      window._srchScore = new Map(scored.map(x => [x.p.id, x.score]));
      l = scored.map(x => x.p);
    }
  } else {
    // No search: apply category filter + advanced filters
    if (catF !== null) l = l.filter(p => p.catId === catF);
  }
  // Advanced filters (always applied)
  if (_advFilter.catId) l = l.filter(p => String(p.catId) === String(_advFilter.catId));
  if (_advFilter.locId) l = l.filter(p => String(p.locId) === String(_advFilter.locId));
  if (_advFilter.stockMin !== null && _advFilter.stockMin !== undefined) l = l.filter(p => (p.stock || 0) >= _advFilter.stockMin);
  if (_advFilter.stockMax !== null && _advFilter.stockMax !== undefined) l = l.filter(p => (p.stock || 0) <= _advFilter.stockMax);
  if (_advFilter.suppId) l = l.filter(p => (p.suppliers || []).some(s => s.suppId === _advFilter.suppId));
  if (_advFilter.tag) l = l.filter(p => (p.tags || []).includes(_advFilter.tag));
  if (_advFilter.lowStock) l = l.filter(p => p.minStock > 0 && (p.stock || 0) < p.minStock);
  if (_advFilter.noLoc) l = l.filter(p => !p.locId);
  if (opts.noChips) return l;
  window._lastBase = l;
  CHIP_DEFS.forEach(c => { if (_chips[c.k]) l = l.filter(c.test); });
  // Tijdens zoeken bepaalt relevantie de volgorde (tenzij je bewust op een andere kolom sorteert)
  const byRelevance = srch.trim() && !srch.trim().startsWith('#') && sortK === 'name' && sortA && window._srchScore;
  l.sort((a, b) => {
    if (byRelevance) {
      const d = (window._srchScore.get(b.id) || 0) - (window._srchScore.get(a.id) || 0);
      if (d) return d;
      return (a.name || '').localeCompare(b.name || '', 'nl');
    }
    // Pinned always first
    const ap = _pinned.has(a.id) ? 0 : 1, bp = _pinned.has(b.id) ? 0 : 1;
    if (ap !== bp) return ap - bp;
    if (sortK === 'stock') return sortA ? (a.stock || 0) - (b.stock || 0) : (b.stock || 0) - (a.stock || 0);
    if (sortK === 'modified') {
      const ha = window._lastModified?.[a.id] || 0;
      const hb = window._lastModified?.[b.id] || 0;
      return sortA ? ha - hb : hb - ha;
    }
    if (sortK === 'price') {
      const pa = Math.min(...(a.suppliers || []).map(s => s.price).filter(Boolean), Infinity);
      const pb = Math.min(...(b.suppliers || []).map(s => s.price).filter(Boolean), Infinity);
      return sortA ? (pa === Infinity ? 1 : pb === Infinity ? -1 : pa - pb) : (pb === Infinity ? 1 : pa === Infinity ? -1 : pb - pa);
    }
    const va = sortK === 'name' ? a.name : sortK === 'IPN' ? a.IPN || '' : sortK === 'category' ? cat(a.catId) : sortK === 'location' ? loc(a.locId) : a.name;
    const vb = sortK === 'name' ? b.name : sortK === 'IPN' ? b.IPN || '' : sortK === 'category' ? cat(b.catId) : sortK === 'location' ? loc(b.locId) : b.name;
    return sortA ? va.localeCompare(vb, 'nl') : vb.localeCompare(va, 'nl');
  });
  return l;
}


// ── VOORRAAD IN DE RIJ (+/− en statusbalk) ────────────────────
function stockBarState(p) {
  const q = p.stock || 0, min = p.minStock || 0;
  return { w: Math.min(100, Math.round(q / (min * 2) * 100)), cls: q < min ? 'sb-red' : q < min * 1.5 ? 'sb-orange' : 'sb-green', tip: `Voorraad ${q} · minimum ${min}` };
}
function stockBarHTML(p) {
  if (!(p.minStock > 0)) return '';
  const b = stockBarState(p);
  return `<div class="sbar" title="${b.tip}"><i class="${b.cls}" style="width:${b.w}%"></i><b></b></div>`;
}
function qtyHTML(p) {
  const q = p.stock || 0, id = p.id;
  return `<div class="qcell" data-qcell="${id}" onclick="event.stopPropagation()">
    <div class="qwrap">
      <button class="qb" onclick="rowAdj(${id},-1)" aria-label="Eén minder">−</button>
      <span class="qv ${qClass(q, p.minStock)}" onclick="inlineStockEdit(event,${id})" title="Klik om aan te passen">${q}</span>
      <button class="qb" onclick="rowAdj(${id},1)" aria-label="Eén meer">+</button>
    </div>${stockBarHTML(p)}</div>`;
}
function paintQty(p) {
  const q = p.stock || 0;
  document.querySelectorAll(`[data-qcell="${p.id}"]`).forEach(c => {
    const v = c.querySelector('.qv');
    if (v) { v.textContent = q; v.className = 'qv ' + qClass(q, p.minStock); }
    const bar = c.querySelector('.sbar');
    if (bar && p.minStock > 0) { const b = stockBarState(p), i = bar.querySelector('i'); i.style.width = b.w + '%'; i.className = b.cls; bar.title = b.tip; }
  });
  if (selId === p.id) { const n = document.getElementById('dNum'); if (n) { n.textContent = q; n.className = 'num ' + qClass(q, p.minStock); } paintDetStock(p); }
  const sEl = document.getElementById('sStock');
  if (sEl) sEl.textContent = parts.filter(x => x.active !== false && x.stock > 0).length;
  updateAlertCenter(); renderChips();
}
const _adjPending = {};
async function rowAdj(id, delta) {
  const p = parts.find(x => x.id === id); if (!p) return;
  if (delta < 0 && (p.stock || 0) <= 0) return;
  const prev = p.stock || 0;
  p.stock = Math.max(0, prev + delta);
  _adjPending[id] = (_adjPending[id] || 0) + 1;
  paintQty(p);
  undoStock(p, prev);
  try {
    const r = await api(`/api/parts/${id}/stock`, 'PATCH', { delta });
    if (_adjPending[id] === 1) p.stock = r.stock;
  } catch (err) {
    p.stock = Math.max(0, (p.stock || 0) - delta);
    dropUndo('stock', id);
    toast('⚠ Voorraad niet opgeslagen');
  } finally {
    _adjPending[id]--;
    if (!_adjPending[id]) { delete _adjPending[id]; paintQty(p); }
  }
}


// ── ONGEDAAN MAKEN ────────────────────────────────────────────
// Eén actieve melding tegelijk. Een nieuwe actie bevestigt de vorige definitief.
let _undo = null, _undoT = null;
function _shortName(p) { const n = p && p.name ? p.name : 'Onderdeel'; return n.length > 28 ? n.slice(0, 27) + '…' : n; }
function _hideUndoEl() { document.getElementById('undoToast')?.classList.remove('show'); }
function flushUndo() {
  clearTimeout(_undoT);
  const u = _undo; _undo = null; _hideUndoEl();
  if (u && u.expire) u.expire();
}
function dropUndo(kind, id) {
  if (_undo && _undo.meta.kind === kind && _undo.meta.id === id) { clearTimeout(_undoT); _undo = null; _hideUndoEl(); }
}
function armUndo(msg, opts) {
  const same = _undo && _undo.meta.kind === opts.meta.kind && _undo.meta.id === opts.meta.id;
  if (_undo && !same) flushUndo();
  clearTimeout(_undoT);
  _undo = opts;
  const el = document.getElementById('undoToast');
  el.querySelector('.ut-msg').textContent = msg;
  el.classList.add('show');
  _undoT = setTimeout(flushUndo, opts.ms || 8000);
}
async function doUndo() {
  const u = _undo; if (!u) return;
  clearTimeout(_undoT); _undo = null; _hideUndoEl();
  try { await u.undo(); } catch (e) { toast('⚠ Ongedaan maken mislukt'); }
}
// Voorraad: onthoud de waarde vóór de eerste wijziging in dit venster en zet die terug
function undoStock(p, prev) {
  const keep = _undo && _undo.meta.kind === 'stock' && _undo.meta.id === p.id;
  const before = keep ? _undo.meta.before : prev;
  if (before === (p.stock || 0)) { dropUndo('stock', p.id); return; }   // terug bij af: niets om ongedaan te maken
  const id = p.id;
  armUndo(`${_shortName(p)}: ${before} → ${p.stock || 0}`, {
    meta: { kind: 'stock', id, before },
    undo: async () => {
      while (_adjPending[id]) await new Promise(r => setTimeout(r, 40));
      const r = await api(`/api/parts/${id}/stock`, 'PATCH', { set: before, note: 'Ongedaan gemaakt' });
      const cur = parts.find(x => x.id === id);
      if (cur) { cur.stock = r.stock; paintQty(cur); renderTable(); }
      toast(`↩ ${_shortName(cur)} terug op ${r.stock}`);
    }
  });
}
// Verwijderen: pas echt naar de server als de melding verloopt
async function commitDelete(id, p) {
  try { await api(`/api/parts/${id}`, 'DELETE'); }
  catch (e) {
    if (p && !parts.some(x => x.id === id)) parts.push(p);
    toast('⚠ Verwijderen mislukt'); renderSidebar(); renderTable();
  }
  finally { _pendingDel.delete(id); }
}
window.addEventListener('pagehide', () => {
  if (_undo && _undo.meta.kind === 'delete') {
    try { fetch(`/api/parts/${_undo.meta.id}`, { method: 'DELETE', keepalive: true }); } catch (e) { }
  }
});

// ── POPOVER-MENU (rij-acties, bulk "Meer") ────────────────────
let _popItems = [];
function closePop() {
  const el = document.getElementById('popMenu');
  if (el) { el._anchor?.setAttribute('aria-expanded', 'false'); el.remove(); }
}
function openPop(anchor, items) {
  const cur = document.getElementById('popMenu');
  if (cur && cur._anchor === anchor) { closePop(); return; }
  closePop();
  _popItems = items;
  const pop = document.createElement('div');
  pop.id = 'popMenu'; pop.className = 'pop'; pop.setAttribute('role', 'menu');
  pop.innerHTML = items.map((it, i) => it.sep ? '<div class="pop-sep"></div>' :
    `<button class="pop-item${it.danger ? ' danger' : ''}" role="menuitem" onclick="popPick(${i})"><span class="ic">${it.ic || ''}</span>${it.label}</button>`).join('');
  document.body.appendChild(pop);
  const r = anchor.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
  const left = Math.min(Math.max(8, r.right - w), window.innerWidth - w - 8);
  let top = r.bottom + 4;
  if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 4);
  pop.style.left = left + 'px'; pop.style.top = top + 'px';
  pop._anchor = anchor; anchor.setAttribute('aria-expanded', 'true');
}
function popPick(i) { const it = _popItems[i]; closePop(); if (it && it.fn) it.fn(); }
document.addEventListener('click', e => { if (!e.target.closest('#popMenu') && !e.target.closest('[aria-haspopup="menu"]')) closePop(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePop(); });
window.addEventListener('scroll', closePop, true);
window.addEventListener('resize', closePop);

function rowMenu(e, id) {
  e.stopPropagation();
  const p = parts.find(x => x.id === id); if (!p) return;
  const pin = _pinned.has(id);
  const items = [{ ic: pin ? '📌' : '📍', label: pin ? 'Losmaken' : 'Vastzetten', fn: () => togglePin(id) }];
  if (p.link && /^https?:/i.test(p.link)) items.push({ ic: '🔗', label: 'Link openen', fn: () => window.open(p.link, '_blank', 'noopener') });
  items.push({ ic: '✏', label: 'Bewerken', fn: () => openEdit(id) });
  items.push({ sep: true });
  items.push({ ic: '🗑', label: 'Verwijderen', danger: true, fn: () => delPart(id) });
  openPop(e.currentTarget, items);
}
function bulkMore(e) {
  e.stopPropagation();
  openPop(e.currentTarget, [
    { ic: '🏷', label: 'Tag toevoegen', fn: () => bulkAddTag() },
    { ic: '🏷', label: 'Tag verwijderen', fn: () => bulkRemoveTag() },
    { ic: '🖨', label: 'Labels printen', fn: () => bulkPrintLabels() },
    { ic: '📦', label: 'Archiveren', fn: () => bulkArchive() },
    { sep: true },
    { ic: '🗑', label: 'Verwijderen…', danger: true, fn: () => bulkDelete() },
  ]);
}

function thumb(p) {
  if (p.img) return `<img src="${esc(p.img)}" style="width:32px;height:32px;border-radius:4px;object-fit:cover;display:block">`;
  return `<div class="ph">📦</div>`;
}

function qClass(q, minStock) {
  if (q === 0) return 'qz';
  // Met een ingesteld minimum: rood onder het minimum, oranje tot 1,5× het minimum (zelfde regel als de statusbalk)
  if (minStock > 0) return q < minStock ? 'qred' : q < minStock * 1.5 ? 'qlow' : 'qok';
  if (q < 5) return 'qred';
  if (q <= 10) return 'qlow';
  return 'qok';
}

function renderTable() {
  const list = filtered();
  hlPrep();
  const sig = JSON.stringify([catF, srch, sortK, sortA, _chips, _advFilter, _showArchived]);
  if (sig !== _viewSig) { _viewSig = sig; _renderLimit = PAGE; }   // nieuwe weergave: weer vanaf het begin
  const shown = list.slice(0, _cap(list.length));
  const tb = document.getElementById('tbody');
  document.getElementById('empty').style.display = list.length ? 'none' : '';
  tb.innerHTML = shown.map(p => {
    const q = p.stock || 0, qc = qClass(q, p.minStock), s = selId === p.id ? 'sel' : '';
    const pinned = _pinned.has(p.id);
    const archived = p.active === false;
    const noteIcon = p.notes ? '<span title="' + p.notes.substring(0, 60).replace(/"/g, '&quot;') + '" style="color:var(--text3);font-size:11px;margin-left:4px;cursor:default">📝</span>' : '';
    const expiryIcon = (() => { const s = getExpiryStatus(p.expiryDate); return s === 'expired' || s === 'critical' ? '<span title="Verloopdatum!" style="font-size:11px;margin-left:4px">⏰</span>' : s === 'warning' ? '<span title="Bijna verlopen" style="font-size:11px;margin-left:4px;opacity:.7">⏰</span>' : ''; })()
    const lastMod = window._lastModified && window._lastModified[p.id] ? new Date(window._lastModified[p.id]).toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short' }) : '';
    return `<tr tabindex="0" class="${s}${pinned ? ' pinned' : ''}${archived ? ' archived' : ''}" onclick="selPart(${p.id})"
      onmouseenter="showHoverPreview(event,${p.id})" onmouseleave="hideHoverPreview()">
  <td onclick="event.stopPropagation()" style="width:32px;padding:8px 4px 8px 10px"><input type="checkbox" class="row-cb" data-id="${p.id}" onchange="updateBulkBar()" style="cursor:pointer"></td>
  <td class="tdi">${thumb(p)}</td>
  <td class="tdn">
    ${pinned ? '<span style="color:var(--acc);font-size:10px;margin-right:3px">📌</span>' : ''}
    ${archived ? '<span style="color:var(--text3);font-size:10px;margin-right:3px">📦</span>' : ''}
    ${hl(p.name)}<small>${!_colVis.IPN && p.IPN ? '<span class="ipn-inline">' + hl(p.IPN) + '</span>' + (p.desc ? ' · ' : '') : ''}${hl(p.desc || '')}</small>${noteIcon}${expiryIcon}
  </td>
  <td class="tdipn hide-sm">${hl(p.IPN || '')}</td>
  <td class="tdcat hide-sm">${esc(cat(p.catId))}</td>
  <td class="tdloc">${esc(loc(p.locId))}</td>
  <td class="tdprice hide-sm" style="text-align:right;font-size:11px;color:var(--text3)">${(() => { const prices = (p.suppliers || []).map(s => s.price).filter(Boolean); return prices.length ? '€' + Math.min(...prices).toFixed(2) : ''; })()} </td>
  <td class="tdq" onclick="event.stopPropagation()">${qtyHTML(p)}</td>
  <td class="tdmod hide-sm" style="text-align:right;font-size:10px;color:var(--text3);white-space:nowrap">${lastMod}</td>
  <td class="tda">
    <button class="abtn kebab" aria-haspopup="menu" aria-expanded="false" title="Acties" onclick="rowMenu(event,${p.id})">⋯</button>
  </td></tr>`;
  }).join('') + (list.length > shown.length
    ? `<tr class="more-row"><td colspan="12"><button class="btn sec" onclick="showMoreRows()">Toon meer · ${shown.length} van ${list.length}</button></td></tr>` : '');
  const active = parts.filter(p => p.active !== false);
  const archivedCount = parts.filter(p => p.active === false).length;
  const lowStock = active.filter(p => p.minStock > 0 && (p.stock || 0) < p.minStock);
  const critStock = active.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 5);
  document.getElementById('sParts').textContent = active.length;
  document.getElementById('sStock').textContent = active.filter(p => p.stock > 0).length;
  // Show archived badge if any
  const archBtn = document.getElementById('archiveToggleBtn');
  if (archBtn && archivedCount > 0 && !_showArchived) {
    archBtn.textContent = `📦 Archief (${archivedCount})`;
  }
  // Warning badge in header
  const warnCount = lowStock.length;
  const warnBtn = document.getElementById('warnBtn');
  const warnBadge = document.getElementById('warnBadge');
  if (warnBtn) {
    warnBtn.style.display = warnCount > 0 ? '' : 'none';
    if (warnBadge) warnBadge.textContent = `⚠ ${warnCount} laag`;
  }
  checkExpiryAlerts();
  updateAlertCenter();
  renderChips();
  renderCards(list);
}

function renderSidebar() {
  const cc = {};
  parts.filter(p => p.active !== false).forEach(p => { if (p.catId) cc[p.catId] = (cc[p.catId] || 0) + 1; });
  const total = parts.filter(p => p.active !== false).length;
  let h = `<div class="sid-all${catF === null ? ' active' : ''}" onclick="setF(null)">Alle onderdelen<span class="cnt">${total}</span></div>`;

  // Sort TREE roots alphabetically by label (strip emoji for sort)
  const sortedTree = [...TREE].sort((a, b) => a.lbl.replace(/\p{Emoji}/gu, '').trim().localeCompare(b.lbl.replace(/\p{Emoji}/gu, '').trim(), 'nl'));

  sortedTree.forEach(r => {
    const tot = (cc[r.id] || 0) + r.ch.reduce((s, c) => s + (cc[c] || 0), 0);
    if (!tot) return;
    const catStyle = CAT_COLORS[r.id] ? 'border-left:3px solid ' + CAT_COLORS[r.id] + ';padding-left:11px' : '';
    h += `<div class="sid-grp"><div class="sid-root${catF === r.id ? ' active' : ''}" onclick="setF(${r.id})">${r.lbl}<span class="cnt">${tot}</span></div>`;
    const sortedCh = [...r.ch].sort((a, b) => (CATS[a] || '').localeCompare(CATS[b] || '', 'nl'));
    sortedCh.forEach(c => { const n = cc[c] || 0; if (!n) return; h += `<div class="sid-child${catF === c ? ' active' : ''}" onclick="setF(${c})">${CATS[c] || c}<span class="cnt">${n}</span></div>`; });
    h += '</div>';
  });
  // Tags section
  const allTags = getAllTags();
  if (allTags.length) {
    h += `<div style="padding:8px 12px 4px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3)">Tags</div>`;
    h += allTags.map(t => {
      const count = parts.filter(p => p.active !== false && (p.tags || []).includes(t)).length;
      const active = srch === `#${t}`;
      return `<div class="sid-child${active ? ' active' : ''}" onclick="filterByTag('${esc(t)}')" style="font-size:11px">#${esc(t)}<span class="cnt">${count}</span></div>`;
    }).join('');
  }

  document.getElementById('sidebar').innerHTML = h;
}

function setF(id) { window._lowStockMode = false; catF = id; document.getElementById('vTitle').textContent = id === null ? 'Alle onderdelen' : (CATS[id] || 'Categorie'); closeSidebar(); renderSidebar(); renderTable(); }
function sb(k) { if (sortK === k) sortA = !sortA; else { sortK = k; sortA = true; } renderTable(); }

// ── ZOEKVELD-PLACEHOLDER: korter op smalle schermen ────────────
(function () {
  const mq = window.matchMedia('(max-width: 640px)');
  const apply = () => {
    const el = document.getElementById('srch');
    if (el) el.placeholder = mq.matches ? 'Zoeken…' : 'Zoek naam, IPN, leverancier... ( / )';
  };
  apply();
  (mq.addEventListener ? mq.addEventListener('change', apply) : mq.addListener(apply));
})();

// ── SIDEBAR TOGGLE (mobile) ───────────────────────────────────
function toggleSidebar() {
  const aside = document.getElementById('sidebar');
  const overlay = document.getElementById('asideOverlay');
  const open = aside.classList.toggle('open');
  overlay.classList.toggle('open', open);
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('asideOverlay').classList.remove('open');
}

// ── CARD RENDERING (mobile) ───────────────────────────────────
function showMoreRows() {
  const keep = new Set(getSelectedIds());          // aangevinkte rijen blijven aangevinkt
  _renderLimit += PAGE;
  renderTable();
  document.querySelectorAll('.row-cb').forEach(c => { if (keep.has(parseInt(c.dataset.id))) c.checked = true; });
  updateBulkBar();
}

function renderCards(list) {
  list = list || filtered();
  const cl = document.getElementById('cardList');
  if (!cl) return;
  if (!list.length) { cl.innerHTML = '<div class="empty"><div class="big">🔍</div><p>Geen onderdelen gevonden</p></div>'; return; }
  hlPrep();
  const shown = list.slice(0, _cap(list.length));
  cl.innerHTML = shown.map(p => {
    const q = p.stock || 0, qc = qClass(q, p.minStock), s = selId === p.id ? 'sel' : '';
    const img = p.img ? `<img class="card-img" src="${esc(p.img)}">` : `<div class="card-img-ph">📦</div>`;
    return `<div class="card-row" data-id="${p.id}">
  <div class="card-swipe">
    <button class="sw-edit" onclick="swipeDo(event,'edit',${p.id})">✏<span>Bewerk</span></button>
    <button class="sw-more" aria-haspopup="menu" onclick="swipeDo(event,'more',${p.id})">⋯<span>Meer</span></button>
  </div>
  <div class="card ${s}" tabindex="0" onclick="selPart(${p.id})">
  ${img}
  <div style="min-width:0">
    <div class="card-name">${hl(p.name)}</div>
    <div class="card-sub">${hl(p.IPN || p.desc || '')}</div>
    <div class="card-loc">${esc(loc(p.locId))}</div>
  </div>
  <div class="card-qty">${qtyHTML(p)}</div>
</div></div>`;
  }).join('') + (list.length > shown.length
    ? `<div class="more-card"><button class="btn sec" onclick="showMoreRows()">Toon meer · ${shown.length} van ${list.length}</button></div>` : '');
}

function showLowStock() {
  // Via de meldingen-knop: toon alleen onderdelen onder het minimum (chip 'Lage voorraad')
  catF = null; srch = '';
  document.getElementById('srch').value = '';
  document.getElementById('vTitle').textContent = 'Alle onderdelen';
  _chips.low = true;
  renderSidebar(); renderTable();
}

// ── DETAIL TABS ──────────────────────────────────────────────
let activeTab = 'info';
function switchTab(tab) {
  activeTab = tab;
  ['info', 'related', 'notes', 'docs', 'hist', 'qr'].forEach(t => {
    document.getElementById('tab-' + t).classList.toggle('active', t === tab);
    document.getElementById('tab-' + t).setAttribute('aria-selected', t === tab ? 'true' : 'false');
    document.getElementById('pane-' + t).classList.toggle('active', t === tab);
  });
  if (tab === 'notes' && selId) document.getElementById('notesArea').focus();
  if (tab === 'docs' && selId) {
    renderPdfList();
    const p = parts.find(x => x.id === selId);
    if (p) document.getElementById('dsQuery').value = p.IPN || p.name || '';
    document.getElementById('dsResults').innerHTML = '';
  }
  if (tab === 'hist' && selId) loadHistTab();
  if (tab === 'related' && selId) renderRelatedParts();
  if (tab !== 'qr') stopScan();
}

// ── DETAIL ────────────────────────────────────────────────────
function paintDetStock(p) {
  const bar = document.getElementById('dBar'), min = document.getElementById('dMin');
  if (!bar || !min) return;
  bar.innerHTML = stockBarHTML(p);
  const m = p.minStock || 0, q = p.stock || 0;
  min.innerHTML = m > 0 ? `minimum ${m}${q < m ? ' · <b class="dlow">onder minimum</b>' : ''}` : '<span class="dnomin">geen minimum ingesteld</span>';
}
function toggleAdjPrice(force) {
  const row = document.getElementById('adjPriceRow'), btn = document.getElementById('adjPriceToggle');
  const open = typeof force === 'boolean' ? force : row.style.display === 'none';
  row.style.display = open ? 'flex' : 'none';
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  btn.textContent = open ? '− Inkoopprijs verbergen' : '＋ Bij bijboeken inkoopprijs invullen';
  if (open) document.getElementById('adjPrice').focus();
}
function detMenu(e, id) {
  e.stopPropagation();
  const p = parts.find(x => x.id === id); if (!p) return;
  const pin = _pinned.has(id);
  const link = getAppBaseUrl() + '?part=' + id;
  const items = [
    { ic: '🔗', label: 'Vaste link kopiëren', fn: () => navigator.clipboard?.writeText(link).then(() => toast('🔗 Link gekopieerd')) },
    { ic: pin ? '📌' : '📍', label: pin ? 'Losmaken' : 'Vastzetten', fn: () => togglePin(id) },
    { ic: '⧉', label: 'Dupliceren', fn: () => duplicatePart(id) },
  ];
  if (p.link && /^https?:/i.test(p.link)) items.push({ ic: '↗', label: 'Leverancierslink openen', fn: () => window.open(p.link, '_blank', 'noopener') });
  items.push({ sep: true });
  items.push(p.active === false
    ? { ic: '↩', label: 'Uit archief halen', fn: () => unarchivePart(id) }
    : { ic: '🗑', label: 'Verwijderen', danger: true, fn: () => delPart(id) });
  openPop(e.currentTarget, items);
}
function selPart(id) {
  selId = id; const p = parts.find(x => x.id === id); if (!p) return;
  document.getElementById('dName').textContent = p.name;
  document.getElementById('dDesc').textContent = p.desc || '—';
  document.getElementById('dMeta').innerHTML =
    [p.IPN ? `<span class="dchip mono">${esc(p.IPN)}</span>` : '',
    p.catId ? `<span class="dchip">${esc(cat(p.catId))}</span>` : '',
    `<span class="dchip${p.locId ? '' : ' warn'}">📍 ${p.locId ? esc(loc(p.locId)) : 'geen locatie'}</span>`,
    p.active === false ? '<span class="dchip warn">gearchiveerd</span>' : ''].join('');
  document.getElementById('dActs').innerHTML =
    `<button class="btn sec" onclick="openEdit(${p.id})">✏ Bewerk</button>
     <button class="btn sec" onclick="printSingle(${p.id})">🏷 Label</button>
     <button class="btn sec" onclick="showPartQr(${p.id})">▦ QR</button>
     <button class="btn sec dmore" aria-haspopup="menu" aria-expanded="false" aria-label="Meer acties" onclick="detMenu(event,${p.id})">⋯</button>`;
  paintDetStock(p);
  const q = p.stock || 0, numEl = document.getElementById('dNum');
  numEl.textContent = q; numEl.className = 'num ' + qClass(q, p.minStock);
  document.getElementById('dImgW').innerHTML = p.img
    ? `<img class="dimg" src="${esc(p.img)}" onclick="openLightbox('${esc(p.img)}')" title="Klik voor groter">`
    : `<div class="diph">📦</div>`;
  // Info tab
  const suppLinks = (p.suppliers || []).map(s => {
    const supp = suppById(s.suppId);
    if (!supp) return null;
    const dot = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${esc(supp.color || '#888')};margin-right:4px"></span>`;
    const name = `${dot}${esc(supp.name)}`;
    const sku = s.sku ? ` <span style="color:var(--text3)">${esc(s.sku)}</span>` : '';
    const price = s.price ? ` <span style="color:var(--green)">€${s.price.toFixed(2)}</span>` : '';
    const link = s.link ? `<a href="${esc(s.link)}" target="_blank" style="color:var(--acc2);margin-left:4px;font-size:11px">↗</a>` : '';
    const txt = `${name}${sku}${price}${link}`;
    return txt;
  }).filter(Boolean);

  // ── Prijsblok: altijd zichtbaar bovenaan ──────────────────
  const allPrices = (p.suppliers || []).filter(s => s.price > 0).sort((a, b) => a.price - b.price);
  const bestPrice = allPrices[0];
  const stockVal = bestPrice ? (bestPrice.price * (p.stock || 0)) : 0;
  const sellPrice = p.sellPrice || 0;
  const margin = bestPrice && sellPrice ? ((sellPrice - bestPrice.price) / bestPrice.price * 100) : 0;

  const priceBlockHtml = `<div style="background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;margin-bottom:10px">
    ${allPrices.length === 0 ? `<div style="color:var(--text3);font-size:12px">Geen inkoopprijs bekend — <a href="#" onclick="openEdit(${p.id});return false" style="color:var(--acc2)">voeg toe</a></div>` : ''}
    ${allPrices.map((s, i) => {
    const supp = suppById(s.suppId);
    const dot = supp ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${esc(supp.color || '#888')};margin-right:5px;flex-shrink:0"></span>` : '';
    const badge = i === 0 && allPrices.length > 1 ? `<span style="font-size:9px;background:var(--green);color:#fff;padding:1px 5px;border-radius:4px;margin-left:4px">goedkoopst</span>` : '';
    const skuTxt = s.sku ? `<span style="color:var(--text3);font-size:11px"> · ${esc(s.sku)}</span>` : '';
    const linkBtn = s.link ? `<a href="${esc(s.link)}" target="_blank" style="color:var(--acc2);font-size:11px;margin-left:auto">↗ bestel</a>` : '';
    return `<div style="display:flex;align-items:center;gap:4px;padding:3px 0;${i > 0 ? 'border-top:1px solid var(--border);' : ''}">
        ${dot}<span style="flex:1;font-size:12px">${supp ? esc(supp.name) : '?'}${skuTxt}${badge}</span>
        <span style="font-weight:700;color:var(--green);font-size:14px">€${s.price.toFixed(2)}</span>
        ${linkBtn}
      </div>`;
  }).join('')}
    ${allPrices.length > 0 ? `<div style="display:flex;gap:12px;margin-top:6px;padding-top:6px;border-top:1px solid var(--border);font-size:11px;flex-wrap:wrap">
      <span style="color:var(--text3)">Voorraadwaarde: <b style="color:var(--text)">€${stockVal.toFixed(2)}</b></span>
      ${sellPrice > 0 ? `<span style="color:var(--text3)">Verkoop: <b style="color:var(--acc2)">€${sellPrice.toFixed(2)}</b></span>` : ''}
      ${margin > 0 ? `<span style="color:var(--text3)">Marge: <b style="color:var(--green)">${margin.toFixed(0)}%</b></span>` : ''}
    </div>` : ''}
  </div>`;

  // IPN, categorie, locatie en minimum staan al in de kop en het voorraadblok
  const rows = [
    ...(p.extraLocs?.length ? [['Extra locaties', p.extraLocs.map(id => loc(id)).join(', ')]] : []),
    p.expiryDate ? ['Verloopdatum', expiryHtml(p.expiryDate)] : null,
    p.link ? ['Link', `<a href="${esc(p.link)}" target="_blank" style="color:var(--acc2)">${esc(p.link.replace(/https?:\/\//, '').substring(0, 32))}…</a>`] : null,
  ].filter(Boolean);

  // Gebruikt in projecten
  const usedInProjects = (typeof projects !== 'undefined' ? projects : [])
    .filter(proj => (proj.items || []).some(item => item.partId === p.id));

  document.getElementById('dBody').innerHTML =
    priceBlockHtml +
    rows.map(([l, v]) => `<div class="dr"><span class="dl">${l}</span><span class="dv">${v}</span></div>`).join('') +
    (usedInProjects.length ? `<div class="dr"><span class="dl">In projecten</span><span class="dv">${usedInProjects.map(proj =>
      `<span style="font-size:11px;background:var(--surf2);border:1px solid var(--border);border-radius:4px;padding:1px 7px;margin:1px 2px;display:inline-block;cursor:pointer" onclick="openProjectsModal();openProjectDetail(${proj.id})">${esc(proj.name)}${proj.version ? ' ' + esc(proj.version) : ''}</span>`
    ).join('')
      }</span></div>` : '') +
    tagsHtml(p) +
    relatedInlineHtml(p) +
    inlineNotesHtml(p);
  // Notes tab
  document.getElementById('notesArea').value = p.notes || '';
  // Switch to info tab when opening
  switchTab('info');
  document.getElementById('adjV').value = 1;
  // Toon prijsrij met suggestie op basis van goedkoopste leverancier
  const adjPriceRow = document.getElementById('adjPriceRow');
  const adjPriceInp = document.getElementById('adjPrice');
  const adjPriceSugg = document.getElementById('adjPriceSugg');
  const cheapSup = (p.suppliers || []).filter(s => s.price > 0).sort((a, b) => a.price - b.price)[0];
  if (cheapSup) {
    adjPriceInp.placeholder = cheapSup.price.toFixed(2);
    adjPriceInp.value = '';
    const sn = suppById(cheapSup.suppId);
    adjPriceSugg.textContent = sn ? '(' + sn.name + ')' : '';
  } else {
    adjPriceInp.placeholder = '0.00';
    adjPriceInp.value = '';
    adjPriceSugg.textContent = '';
  }
  toggleAdjPrice(false);
  document.getElementById('det').classList.add('open');
  document.body.classList.add('detail-open');
  if (window.innerWidth <= 640) history.pushState({ det: id }, '');
  addRecent(id);
  renderTable();
}

function closeDet() {
  stopScan();
  document.getElementById('det').classList.remove('open');
  document.body.classList.remove('detail-open');
  selId = null;
  renderTable();
}
window.addEventListener('popstate', () => { if (selId) closeDet(); });

// ── VERLOOPDATUM HELPERS ──────────────────────────────────────
function expiryHtml(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const days = Math.round((d - now) / (1000 * 86400));
  const fmt = d.toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
  if (days < 0) return `<span style="color:var(--red);font-weight:700">⚠ Verlopen! (${fmt})</span>`;
  if (days === 0) return `<span style="color:var(--red);font-weight:700">⚠ Verloopt vandaag</span>`;
  if (days <= 7) return `<span style="color:var(--red)">⚠ ${fmt} (over ${days}d)</span>`;
  if (days <= 30) return `<span style="color:var(--orange)">⏰ ${fmt} (over ${days}d)</span>`;
  return `<span style="color:var(--text2)">${fmt}</span>`;
}

function getExpiryStatus(dateStr) {
  if (!dateStr) return null;
  const days = Math.round((new Date(dateStr) - new Date()) / (1000 * 86400));
  if (days < 0) return 'expired';
  if (days <= 7) return 'critical';
  if (days <= 30) return 'warning';
  return 'ok';
}

function checkExpiryAlerts() {
  const expiring = parts.filter(p => {
    if (!p.active || !p.expiryDate) return false;
    const s = getExpiryStatus(p.expiryDate);
    return s === 'expired' || s === 'critical' || s === 'warning';
  });
  const btn = document.getElementById('expiryBtn');
  if (!btn) return;
  if (expiring.length) {
    btn.style.display = '';
    document.getElementById('expiryBadge').textContent = `⏰ ${expiring.length}`;
  } else {
    btn.style.display = 'none';
  }
}

function showExpiryList() {
  const expiring = parts.filter(p => p.active !== false && p.expiryDate && getExpiryStatus(p.expiryDate) !== 'ok')
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.innerHTML = `<div class="modal" style="width:520px">
<div class="mhdr"><h3>⏰ Verloopdatums</h3><button class="xcls" onclick="this.closest('.overlay').remove()">✕</button></div>
<div class="mbdy" style="padding:0">
  ${expiring.length ? expiring.map(p => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border);cursor:pointer" onclick="this.closest('.overlay').remove();selPart(${p.id})">
      ${p.img ? `<img src="${esc(p.img)}" style="width:32px;height:32px;border-radius:4px;object-fit:cover;flex-shrink:0">` : `<div style="width:32px;height:32px;border-radius:4px;background:var(--surf2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0">📦</div>`}
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:13px;color:var(--text)">${esc(p.name)}</div>
        <div style="font-size:11px;color:var(--text3)">${esc(loc(p.locId))}</div>
      </div>
      <div style="text-align:right;flex-shrink:0">${expiryHtml(p.expiryDate)}</div>
    </div>`).join('')
      : '<div class="empty" style="padding:40px"><div class="big">✅</div><p>Geen verlopen onderdelen</p></div>'}
</div>
  </div>`;
  document.body.appendChild(modal);
}

// ── INLINE NOTITIE IN DETAILPANEEL ────────────────────────────
function inlineNotesHtml(p) {
  const notes = p.notes || '';
  return `<div style="margin-top:10px;border-top:1px solid var(--border);padding-top:10px">
<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px">
  <span style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text2)">Notities</span>
  <button onclick="toggleInlineNotes()" id="inlineNotesToggle" style="background:none;border:none;color:var(--text3);font-size:11px;cursor:pointer;padding:1px 5px">✏ bewerk</button>
</div>
<div id="inlineNotesView" style="font-size:12px;color:var(--text2);white-space:pre-wrap;line-height:1.5;min-height:20px;cursor:text" onclick="toggleInlineNotes()">${notes ? esc(notes) : '<span style="color:var(--text3);font-style:italic">Klik om notitie toe te voegen…</span>'}</div>
<div id="inlineNotesEdit" style="display:none;flex-direction:column;gap:6px">
  <textarea id="inlineNotesTA" style="width:100%;min-height:80px;background:var(--surf2);border:1px solid var(--acc);border-radius:var(--r);color:var(--text);font-family:'Inter',sans-serif;font-size:12px;padding:7px 9px;outline:none;resize:vertical;line-height:1.5">${esc(notes)}</textarea>
  <div style="display:flex;gap:6px;justify-content:flex-end">
    <button class="btn sec" style="font-size:11px;padding:4px 10px" onclick="cancelInlineNotes()">Annuleer</button>
    <button class="btn" style="font-size:11px;padding:4px 10px" onclick="saveInlineNotes()">💾 Opslaan</button>
  </div>
</div>
  </div>`;
}

function toggleInlineNotes() {
  const view = document.getElementById('inlineNotesView');
  const edit = document.getElementById('inlineNotesEdit');
  const btn = document.getElementById('inlineNotesToggle');
  if (!view || !edit) return;
  const isEditing = edit.style.display !== 'none';
  if (isEditing) { cancelInlineNotes(); return; }
  view.style.display = 'none';
  edit.style.display = 'flex';
  btn.textContent = '✕ annuleer';
  document.getElementById('inlineNotesTA')?.focus();
}

function cancelInlineNotes() {
  const view = document.getElementById('inlineNotesView');
  const edit = document.getElementById('inlineNotesEdit');
  const btn = document.getElementById('inlineNotesToggle');
  if (!view || !edit) return;
  view.style.display = '';
  edit.style.display = 'none';
  btn.textContent = '✏ bewerk';
  // Reset textarea to saved value
  const p = parts.find(x => x.id === selId);
  if (p && document.getElementById('inlineNotesTA'))
    document.getElementById('inlineNotesTA').value = p.notes || '';
}

async function saveInlineNotes() {
  if (!selId) return;
  const ta = document.getElementById('inlineNotesTA');
  if (!ta) return;
  const notes = ta.value;
  const p = parts.find(x => x.id === selId); if (!p) return;
  const updated = await api(`/api/parts/${selId}`, 'PUT', { ...p, notes });
  const i = parts.findIndex(x => x.id === selId); if (i >= 0) parts[i] = updated;
  document.getElementById('notesArea').value = notes;
  toast('💾 Notitie opgeslagen');
  // Refresh info tab inline
  selPart(selId);
}

// ── NOTES ─────────────────────────────────────────────────────
async function saveNotes() {
  if (!selId) return;
  const notes = document.getElementById('notesArea').value;
  const p = parts.find(x => x.id === selId); if (!p) return;
  const updated = await api(`/api/parts/${selId}`, 'PUT', { ...p, notes });
  const i = parts.findIndex(x => x.id === selId); if (i >= 0) parts[i] = updated;
  toast('Notities opgeslagen');
  // Refresh info tab summary
  selPart(selId);
  switchTab('notes');
}

// ── DATASHEETS ────────────────────────────────────────────────
function renderPdfList() {
  if (!selId) return;
  const p = parts.find(x => x.id === selId); if (!p) return;
  const docs = p.docs || [];
  const el = document.getElementById('pdfList');
  if (!docs.length) { el.innerHTML = '<p style="font-size:12px;color:var(--text3);text-align:center;padding:20px 0">Nog geen datasheets</p>'; return; }
  el.innerHTML = docs.map((d, i) => `
<div class="pdf-item">
  <span class="pdf-icon">📄</span>
  <a class="pdf-name" href="${esc(d.url)}" target="_blank" style="color:var(--acc2);text-decoration:none">${esc(d.name)}</a>
  <span class="pdf-size">${d.size || ''}</span>
  <button class="abtn del" onclick="deletePdf(${i})" style="font-size:11px">✕</button>
</div>`).join('');
}

async function uploadPdf(input) {
  const file = input.files[0]; if (!file) return;
  if (!selId) return;
  const fd = new FormData(); fd.append('file', file);
  try {
    const r = await fetch('/api/upload/pdf', { method: 'POST', body: fd });
    const j = await r.json();
    const p = parts.find(x => x.id === selId); if (!p) return;
    const docs = [...(p.docs || []), { name: file.name, url: j.url, size: formatSize(file.size) }];
    const updated = await api(`/api/parts/${selId}`, 'PUT', { ...p, docs });
    const i = parts.findIndex(x => x.id === selId); if (i >= 0) parts[i] = updated;
    renderPdfList();
    toast(`📄 ${file.name} geüpload`);
  } catch (e) { toast('⚠ Upload mislukt: ' + e.message); }
  input.value = '';
}

async function deletePdf(idx) {
  if (!selId) return;
  const p = parts.find(x => x.id === selId); if (!p) return;
  const docs = [...(p.docs || [])];
  const doc = docs[idx];
  docs.splice(idx, 1);
  const updated = await api(`/api/parts/${selId}`, 'PUT', { ...p, docs });
  const i = parts.findIndex(x => x.id === selId); if (i >= 0) parts[i] = updated;
  // Delete file from server
  if (doc && doc.url) { const fn = doc.url.split('/').pop(); await fetch(`/api/upload/${fn}`, { method: 'DELETE' }).catch(() => { }); }
  renderPdfList(); toast('Datasheet verwijderd');
}

function formatSize(b) {
  if (b < 1024) return b + 'B';
  if (b < 1048576) return (b / 1024).toFixed(1) + 'KB';
  return (b / 1048576).toFixed(1) + 'MB';
}

// ── QR / BARCODE SCANNER ──────────────────────────────────────
// Werkt in het scan-venster (balk onderin) én in de tab 'Scan' van het detailpaneel.
let _scanStream = null, _scanInterval = null, _scanBusy = false;
const scanUI = () => document.getElementById('scanOvl')?.classList.contains('open')
  ? { video: 'sqVideo', result: 'sqResult', btn: 'sqStartBtn', log: 'sqLog', ovl: true }
  : { video: 'qrVideo', result: 'qrResult', btn: 'qrStartBtn', log: 'scanLog', ovl: false };
const scanEl = (u, k) => document.getElementById(u[k]);

async function startScan() {
  stopScan();
  const u = scanUI(), video = scanEl(u, 'video'), resultEl = scanEl(u, 'result');
  resultEl.style.display = 'none';
  if (!navigator.mediaDevices?.getUserMedia) {
    resultEl.textContent = 'Camera is alleen beschikbaar via https (of localhost). Typ of scan de code met een USB-scanner.';
    resultEl.style.display = '';
    return;
  }
  try {
    _scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
    video.srcObject = _scanStream;
    scanEl(u, 'btn').textContent = '⟳ Bezig…';
    if ('BarcodeDetector' in window) {
      const bd = new BarcodeDetector({ formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e', 'itf', 'data_matrix'] });
      _scanInterval = setInterval(async () => {
        if (_scanBusy || video.readyState !== video.HAVE_ENOUGH_DATA) return;
        try {
          const barcodes = await bd.detect(video);
          if (barcodes.length > 0) handleScanResult(barcodes[0].rawValue);
        } catch (e) { }
      }, 300);
    } else {
      resultEl.textContent = 'Deze browser kan niet automatisch scannen. Typ of scan de code hieronder.';
      resultEl.style.display = '';
    }
  } catch (e) {
    toast('⚠ Geen cameratoegang: ' + e.message);
  }
}

function stopScan() {
  clearInterval(_scanInterval); _scanInterval = null;
  if (_scanStream) { _scanStream.getTracks().forEach(t => t.stop()); _scanStream = null; }
  ['qrVideo', 'sqVideo'].forEach(id => { const v = document.getElementById(id); if (v) v.srcObject = null; });
  ['qrStartBtn', 'sqStartBtn'].forEach(id => { const b = document.getElementById(id); if (b) b.textContent = '▶ Camera starten'; });
}

// Venster onderin: open met één tik, camera start direct
function openScanOvl() {
  closeMoreMenu?.(); closeAlerts?.(); closePop?.();
  document.getElementById('scanOvl').classList.add('open');
  document.getElementById('sqLog').innerHTML = '';
  document.getElementById('sqResult').style.display = 'none';
  setScanMode(_scanMode);
  startScan();
}
function closeScanOvl() {
  stopScan();
  document.getElementById('scanOvl')?.classList.remove('open');
}
function scanManualGo() {
  const inp = document.getElementById('sqManual'), val = inp.value.trim();
  if (!val) return;
  inp.value = '';
  handleScanResult(val, true);
}
document.addEventListener('keydown', e => {
  if (e.target?.id === 'sqManual' && e.key === 'Enter') { e.preventDefault(); scanManualGo(); }
  if (e.key === 'Escape' && document.getElementById('scanOvl')?.classList.contains('open')) closeScanOvl();
});

async function adjStock(d) {
  if (!selId) return;
  const v = parseInt(document.getElementById('adjV').value) || 1;
  const p0 = parts.find(p => p.id === selId);
  const before0 = p0 ? (p0.stock || 0) : 0;
  const payload = { delta: d * v };
  if (d > 0) {
    // Handmatige prijs heeft prioriteit, daarna goedkoopste leverancier
    const manualPrice = parseFloat(document.getElementById('adjPrice')?.value);
    const cheapSup = (p0?.suppliers || []).filter(s => s.price > 0).sort((a, b) => a.price - b.price)[0];
    if (!isNaN(manualPrice) && manualPrice > 0) {
      payload.price_paid = manualPrice;
      if (cheapSup) payload.suppId = cheapSup.suppId;
    } else if (cheapSup) {
      payload.price_paid = cheapSup.price;
      payload.suppId = cheapSup.suppId;
    }
  }
  const r = await api(`/api/parts/${selId}/stock`, 'PATCH', payload);
  const p2 = parts.find(p => p.id === selId);
  p2.stock = r.stock;
  if (!payload.price_paid) undoStock(p2, before0);
  // Fire webhook
  fireWebhook('stock_change', { id: selId, name: p2.name, stock: r.stock, delta: d * v });
  if (p2.minStock > 0 && r.stock < p2.minStock) {
    fireWebhook('low_stock', { id: selId, name: p2.name, stock: r.stock, minStock: p2.minStock });
    sendLowStockNotif(p2);
  }
  selPart(selId); renderTable(); toast(d > 0 ? `+${v} toegevoegd` : `${v} verwijderd`);
}
async function setStock() {
  if (!selId) return;
  const v = parseInt(document.getElementById('adjV').value);
  if (isNaN(v) || v < 0) return;
  const p0 = parts.find(p => p.id === selId);
  const before0 = p0 ? (p0.stock || 0) : 0;
  const priceSup = p0?.suppliers?.length
    ? p0.suppliers.filter(s => s.price > 0).sort((a, b) => a.price - b.price)[0]
    : null;
  const payload = { set: v };
  if (priceSup) { payload.price_paid = priceSup.price; payload.suppId = priceSup.suppId; }
  const r = await api(`/api/parts/${selId}/stock`, 'PATCH', payload);
  const p2 = parts.find(p => p.id === selId);
  p2.stock = r.stock;
  checkAndNotifyLowStock(p2);
  selPart(selId); renderTable(); toast(`Voorraad ingesteld op ${v}`);
  if (!payload.price_paid) undoStock(p2, before0);
}

// ── IMAGE ─────────────────────────────────────────────────────
function setImgPreview(src) {
  document.getElementById('peImg').value = src;
  document.getElementById('iPreviewInner').innerHTML = src
    ? `<img src="${esc(src)}" style="width:72px;height:72px;object-fit:cover;display:block">`
    : `<span style="font-size:22px">🖼</span><span style="font-size:9px;color:var(--text3)">Foto</span>`;
  document.getElementById('imgClearBtn').style.display = src ? '' : 'none';
}

function clearImg() {
  setImgPreview('');
  document.getElementById('imgFile').value = '';
}

function handleImg(input) {
  const file = input.files[0]; if (!file) return;
  // Auto-resize if > 1MB or > 1200px
  const MAX_SIZE = 800;
  const MAX_BYTES = 800 * 1024;
  if (file.size > MAX_BYTES) {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = e => {
      img.onload = () => {
        const ratio = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height, 1);
        if (ratio >= 1) { setImgPreview(e.target.result); return; }
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const resized = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.85);
        setImgPreview(resized);
        toast(`📐 Afbeelding verkleind naar ${canvas.width}×${canvas.height}px`);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    const reader = new FileReader();
    reader.onload = e => setImgPreview(e.target.result);
    reader.readAsDataURL(file);
  }
}

// ── MEDIA PICKER ──────────────────────────────────────────────
async function openMediaPicker() {
  document.getElementById('mpSrch').value = '';
  document.getElementById('mediaPickOvl').classList.add('open');
  // Load media if not yet loaded
  if (!_mediaFiles.length) {
    document.getElementById('mpGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text3)"><i class="spin">⟳</i> Laden…</div>';
    _mediaFiles = await api('/api/media');
  }
  renderMediaPicker();
}

function closeMediaPicker() { document.getElementById('mediaPickOvl').classList.remove('open'); }

function renderMediaPicker() {
  const imgs = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const q = (document.getElementById('mpSrch').value || '').toLowerCase();
  const list = _mediaFiles.filter(f => imgs.includes(f.ext) && (!q || f.name.toLowerCase().includes(q)));
  if (!list.length) {
    document.getElementById('mpGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text3)">Geen afbeeldingen gevonden</div>';
    return;
  }
  document.getElementById('mpGrid').innerHTML = list.map(f => `
<div onclick="pickMedia('${esc(f.url)}')" style="background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);overflow:hidden;cursor:pointer;transition:all .15s" onmouseover="this.style.borderColor='var(--acc)'" onmouseout="this.style.borderColor='var(--border)'">
  <img src="${esc(f.url)}" loading="lazy" style="width:100%;height:80px;object-fit:cover;display:block">
  <div style="padding:4px 6px;font-size:10px;font-family:'JetBrains Mono',monospace;color:var(--text2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f.name)}</div>
</div>`).join('');
}

function pickMedia(url) {
  setImgPreview(url);
  // Mark as existing URL (not a new upload) by storing in peImg directly
  document.getElementById('imgFile').value = '';
  closeMediaPicker();
}

// ── PART MODAL ────────────────────────────────────────────────
function fillSels() {
  document.getElementById('peCat').innerHTML = '<option value="">— geen categorie —</option>' + Object.entries(CATS).sort((a, b) => a[1].localeCompare(b[1], 'nl')).map(([id, n]) => `<option value="${id}">${esc(n)}</option>`).join('');
  document.getElementById('peLoc').innerHTML = '<option value="">— geen locatie —</option>' + Object.entries(LOCS).sort((a, b) => a[1].localeCompare(b[1], 'nl')).map(([id, n]) => `<option value="${id}">${esc(n)}</option>`).join('');
}
function openAdd() {
  fillSels();
  document.getElementById('pTitle').textContent = 'Nieuw onderdeel';
  ['peId', 'peName', 'peDesc', 'peIPN', 'peLink', 'peImg', 'peImgOld'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('peNotes').value = '';
  document.getElementById('peExpiry').value = '';
  document.getElementById('peStock').value = '0'; document.getElementById('peCat').value = ''; document.getElementById('peLoc').value = ''; document.getElementById('peMin').value = '0'; document.getElementById('peActive').checked = true;
  setImgPreview('');
  document.getElementById('imgFile').value = '';
  loadSuppRows([]);
  loadExtraLocs([]);
  loadTags([]);
  document.getElementById('dupCheckResult').innerHTML = '';
  document.getElementById('dupCheckBtn').style.display = '';
  document.getElementById('catSuggestResult').innerHTML = '';
  document.getElementById('pOvl').classList.add('open');
  setTimeout(() => { document.getElementById('peName').focus(); _partSnapshot = _snapPart(); }, 100);
}
function openEdit(id) {
  const p = parts.find(x => x.id === id); if (!p) return;
  fillSels();
  document.getElementById('pTitle').textContent = 'Onderdeel bewerken';
  document.getElementById('peId').value = p.id;
  document.getElementById('peName').value = p.name;
  document.getElementById('peDesc').value = p.desc || '';
  document.getElementById('peIPN').value = p.IPN || '';
  document.getElementById('peStock').value = p.stock || 0;
  document.getElementById('peCat').value = p.catId || '';
  document.getElementById('peLoc').value = p.locId || '';
  document.getElementById('peLink').value = p.link || '';
  document.getElementById('peNotes').value = p.notes || '';
  document.getElementById('peExpiry').value = p.expiryDate || '';
  document.getElementById('peMin').value = p.minStock || 0;
  document.getElementById('peActive').checked = p.active !== false;
  document.getElementById('peImg').value = p.img || '';
  document.getElementById('peImgOld').value = p.img || '';
  setImgPreview(p.img || '');
  document.getElementById('imgFile').value = '';
  loadSuppRows(p.suppliers || []);
  loadExtraLocs(p.extraLocs || []);
  loadTags(p.tags || []);
  document.getElementById('dupCheckResult').innerHTML = '';
  document.getElementById('dupCheckBtn').style.display = 'none';
  document.getElementById('catSuggestResult').innerHTML = '';
  document.getElementById('pOvl').classList.add('open');
  setTimeout(() => { document.getElementById('peName').focus(); _partSnapshot = _snapPart(); }, 100);
}
function closePart() { document.getElementById('pOvl').classList.remove('open'); }

async function suggestCategory() {
  const btn = document.getElementById('catSuggestBtn');
  const resEl = document.getElementById('catSuggestResult');
  const name = document.getElementById('peName').value.trim();
  const desc = document.getElementById('peDesc').value.trim();
  if (!name && !desc) { resEl.innerHTML = '<span style="color:var(--red)">Vul eerst een naam of beschrijving in.</span>'; return; }
  btn.disabled = true; btn.textContent = '⏳ Bezig…';
  resEl.innerHTML = '';
  try {
    const r = await api('/api/ai/suggest-category', 'POST', { name, desc });
    if (!r.category_id) {
      resEl.innerHTML = '<span style="color:var(--text3)">Geen passende categorie gevonden.</span>';
      return;
    }
    resEl.innerHTML = `<span style="color:var(--text2)">Suggestie: <b>${esc(r.category_name)}</b> (${esc(r.confidence)})</span>
  <button type="button" onclick="document.getElementById('peCat').value='${r.category_id}';document.getElementById('catSuggestResult').innerHTML='✅ Toegepast'" style="margin-left:6px;background:none;border:1px solid var(--acc);border-radius:4px;color:var(--acc);font-size:10px;padding:2px 6px;cursor:pointer">Gebruiken</button>`;
  } catch (e) {
    resEl.innerHTML = `<span style="color:var(--red)">⚠ ${esc(e.message)}</span>`;
  } finally {
    btn.disabled = false; btn.textContent = '🤖 Suggereer categorie';
  }
}

async function checkAiDuplicate() {
  const btn = document.getElementById('dupCheckBtn');
  const resEl = document.getElementById('dupCheckResult');
  const name = document.getElementById('peName').value.trim();
  const desc = document.getElementById('peDesc').value.trim();
  const IPN = document.getElementById('peIPN').value.trim();
  if (!name) { resEl.innerHTML = '<p style="color:var(--red)">Vul eerst een naam in.</p>'; return; }
  btn.disabled = true; btn.textContent = '⏳ Checken…';
  resEl.innerHTML = '';
  try {
    const r = await api('/api/ai/check-duplicate', 'POST', { name, desc, IPN });
    if (r.none_found || !r.duplicates.length) {
      resEl.innerHTML = '<p style="color:var(--green,#4caf50);padding:6px 0">✅ Geen waarschijnlijke duplicaten gevonden.</p>';
    } else {
      resEl.innerHTML = `<div style="padding:6px 0;display:flex;flex-direction:column;gap:4px">
    <div style="color:var(--red);font-weight:600">⚠ Mogelijke duplicaten gevonden:</div>
    ${r.duplicates.map(d => `<div style="color:var(--text2)">• <b>${esc(d.name)}</b>${d.IPN ? ' (IPN: ' + esc(d.IPN) + ')' : ''} — ${esc(d.reason)}</div>`).join('')}
  </div>`;
    }
  } catch (e) {
    resEl.innerHTML = `<p style="color:var(--red)">⚠ ${esc(e.message)}</p>`;
  } finally {
    btn.disabled = false; btn.textContent = '🔍 AI-duplicaatcheck';
  }
}

// ── AI LOOKUP ─────────────────────────────────────────────────
let _aiLookupResult = null;

function openAiLookup() {
  document.getElementById('aiQuery').value = '';
  document.getElementById('aiPhotoFile').value = '';
  document.getElementById('aiResult').innerHTML = '';
  document.getElementById('aiApplyBtn').style.display = 'none';
  _aiLookupResult = null;
  document.getElementById('aiOvl').classList.add('open');
  setTimeout(() => document.getElementById('aiQuery').focus(), 100);
}
function closeAiLookup() { document.getElementById('aiOvl').classList.remove('open'); }

async function runAiLookup() {
  const btn = document.getElementById('aiSearchBtn');
  const resultEl = document.getElementById('aiResult');
  const query = document.getElementById('aiQuery').value.trim();
  const name = document.getElementById('peName').value.trim();
  const link = document.getElementById('peLink').value.trim();
  if (!query && !name) {
    resultEl.innerHTML = '<p style="color:var(--red);font-size:12px">Vul een naam in het formulier in, of typ een zoekterm.</p>';
    return;
  }
  btn.disabled = true; btn.textContent = '⏳ Zoeken…';
  document.getElementById('aiApplyBtn').style.display = 'none';
  resultEl.innerHTML = '';
  try {
    const r = await api('/api/ai/lookup', 'POST', { query, name, link });
    _aiLookupResult = r;
    renderAiResult(r);
  } catch (e) {
    resultEl.innerHTML = `<p style="color:var(--red);font-size:12px">⚠ ${esc(e.message)}</p>`;
  } finally {
    btn.disabled = false; btn.textContent = '🔍 Zoek met AI';
  }
}

async function handleAiPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const resultEl = document.getElementById('aiResult');
  document.getElementById('aiApplyBtn').style.display = 'none';
  resultEl.innerHTML = '<p style="color:var(--text2);font-size:12px">⏳ Foto analyseren…</p>';
  try {
    const b64 = await new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(',')[1]);
      r.onerror = () => rej(new Error('Kon foto niet lezen'));
      r.readAsDataURL(file);
    });
    const r = await api('/api/ai/photo-lookup', 'POST', { image_base64: b64, mime_type: file.type || 'image/jpeg' });
    _aiLookupResult = r;
    renderAiResult(r);
  } catch (e) {
    resultEl.innerHTML = `<p style="color:var(--red);font-size:12px">⚠ ${esc(e.message)}</p>`;
  } finally {
    input.value = '';
  }
}

function renderAiResult(r) {
  const resultEl = document.getElementById('aiResult');
  const curDesc = document.getElementById('peDesc').value || '';
  const curLink = document.getElementById('peLink').value || '';
  const curName = document.getElementById('peName').value || '';
  const hasAny = r.value || r.brand || r.package || r.datasheet_url || r.extra_info || r.name || r.category_id;
  if (!r.found && !hasAny) {
    resultEl.innerHTML = '<p style="color:var(--text3);font-size:12px">Geen specificaties gevonden. Pas de zoekterm aan of probeer een duidelijkere foto.</p>';
    return;
  }
  resultEl.innerHTML = `
  <div style="display:flex;flex-direction:column;gap:10px">
    ${r.name ? `<label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;font-weight:normal">
      <input type="checkbox" id="aiUseName" ${curName ? '' : 'checked'} style="width:16px;height:16px;margin-top:1px">
      <span><b>Naam:</b> ${esc(r.name)}<br><span style="color:var(--text3)">${curName ? 'vervangt huidige naam: ' + esc(curName) : 'wordt ingevuld als Naam'}</span></span>
    </label>` : ''}
    ${r.category_id ? `<label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;font-weight:normal">
      <input type="checkbox" id="aiUseCategory" checked style="width:16px;height:16px;margin-top:1px">
      <span><b>Categorie:</b> ${esc(r.category_name)}${r.confidence ? ' (' + esc(r.confidence) + ')' : ''}<br><span style="color:var(--text3)">wordt ingesteld als Categorie</span></span>
    </label>` : ''}
    ${r.value ? `<label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;font-weight:normal">
      <input type="checkbox" id="aiUseValue" checked style="width:16px;height:16px;margin-top:1px">
      <span><b>Waarde:</b> ${esc(r.value)}<br><span style="color:var(--text3)">wordt toegevoegd aan Beschrijving</span></span>
    </label>` : ''}
    ${r.brand ? `<label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;font-weight:normal">
      <input type="checkbox" id="aiUseBrand" checked style="width:16px;height:16px;margin-top:1px">
      <span><b>Merk:</b> ${esc(r.brand)}<br><span style="color:var(--text3)">wordt toegevoegd aan Beschrijving</span></span>
    </label>` : ''}
    ${r.package ? `<label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;font-weight:normal">
      <input type="checkbox" id="aiUsePackage" checked style="width:16px;height:16px;margin-top:1px">
      <span><b>Package:</b> ${esc(r.package)}<br><span style="color:var(--text3)">wordt toegevoegd aan Beschrijving</span></span>
    </label>` : ''}
    ${r.datasheet_url ? `<label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;font-weight:normal">
      <input type="checkbox" id="aiUseDatasheet" checked style="width:16px;height:16px;margin-top:1px">
      <span><b>Datasheet:</b> <a href="${esc(r.datasheet_url)}" target="_blank" style="color:var(--acc2)">${esc(r.datasheet_url)}</a><br>
      <span style="color:var(--text3)">${curLink ? 'Product link staat al ingevuld — datasheet gaat naar Notities' : 'wordt ingevuld bij Product link'}</span></span>
    </label>` : ''}
    ${r.extra_info ? `<label style="display:flex;align-items:flex-start;gap:8px;font-size:12px;cursor:pointer;font-weight:normal">
      <input type="checkbox" id="aiUseExtra" checked style="width:16px;height:16px;margin-top:1px">
      <span><b>Overige info:</b> ${esc(r.extra_info)}<br><span style="color:var(--text3)">wordt toegevoegd aan Notities</span></span>
    </label>` : ''}
    <div style="font-size:11px;color:var(--text3);border-top:1px solid var(--border);padding-top:8px">
      Huidige beschrijving: ${curDesc ? esc(curDesc) : '<i>leeg</i>'}
    </div>
  </div>`;
  document.getElementById('aiApplyBtn').style.display = '';
}

function applyAiLookup() {
  if (!_aiLookupResult) return;
  const r = _aiLookupResult;
  if (r.name && document.getElementById('aiUseName')?.checked) {
    document.getElementById('peName').value = r.name;
  }
  if (r.category_id && document.getElementById('aiUseCategory')?.checked) {
    document.getElementById('peCat').value = r.category_id;
  }
  const parts = [];
  if (r.value && document.getElementById('aiUseValue')?.checked) parts.push(`Waarde: ${r.value}`);
  if (r.brand && document.getElementById('aiUseBrand')?.checked) parts.push(`Merk: ${r.brand}`);
  if (r.package && document.getElementById('aiUsePackage')?.checked) parts.push(`Package: ${r.package}`);
  if (parts.length) {
    const descEl = document.getElementById('peDesc');
    const extra = parts.join(', ');
    descEl.value = descEl.value ? `${descEl.value} — ${extra}` : extra;
  }
  if (r.datasheet_url && document.getElementById('aiUseDatasheet')?.checked) {
    const linkEl = document.getElementById('peLink');
    if (!linkEl.value) {
      linkEl.value = r.datasheet_url;
    } else {
      const notesEl = document.getElementById('peNotes');
      const line = `Datasheet (AI): ${r.datasheet_url}`;
      notesEl.value = notesEl.value ? `${notesEl.value}\n${line}` : line;
    }
  }
  if (r.extra_info && document.getElementById('aiUseExtra')?.checked) {
    const notesEl = document.getElementById('peNotes');
    const line = `Specificaties (AI): ${r.extra_info}`;
    notesEl.value = notesEl.value ? `${notesEl.value}\n${line}` : line;
  }
  toast('🤖 AI-suggesties toegepast — controleer en klik daarna op Opslaan');
  closeAiLookup();
}

// ── BULK AI LOOKUP ───────────────────────────────────────────
let _bulkCandidates = [];
let _bulkResults = {};   // id -> lookup result
let _bulkSelected = new Set();

function openBulkAiLookup() {
  _bulkCandidates = parts.filter(p => p.active !== false && !(p.desc || '').includes('Package:'))
    .sort((a, b) => a.name.localeCompare(b.name, 'nl'));
  _bulkSelected = new Set();
  _bulkResults = {};
  document.getElementById('bulkFilter').value = '';
  document.getElementById('bulkProgress').innerHTML = '';
  document.getElementById('bulkResults').innerHTML = '';
  document.getElementById('bulkApplyBtn').style.display = 'none';
  document.getElementById('bulkStartBtn').style.display = '';
  document.getElementById('bulkStartBtn').disabled = false;
  document.getElementById('bulkStartBtn').textContent = '🔍 Start lookup voor geselecteerde';
  renderBulkCandidates();
  document.getElementById('bulkAiOvl').classList.add('open');
}
function closeBulkAiLookup() { document.getElementById('bulkAiOvl').classList.remove('open'); }

function renderBulkCandidates() {
  const q = (document.getElementById('bulkFilter').value || '').toLowerCase();
  const list = _bulkCandidates.filter(p => !q || p.name.toLowerCase().includes(q));
  const el = document.getElementById('bulkCandidateList');
  if (!list.length) {
    el.innerHTML = '<p style="color:var(--text3);font-size:12px;padding:8px;text-align:center">Geen onderdelen gevonden zonder Package-info.</p>';
    return;
  }
  el.innerHTML = list.map(p => `
<label style="display:flex;align-items:center;gap:8px;font-size:12px;padding:3px 4px;cursor:pointer;font-weight:normal">
  <input type="checkbox" data-bulkid="${p.id}" ${_bulkSelected.has(p.id) ? 'checked' : ''} onchange="toggleBulkSel(${p.id}, this.checked)" style="width:15px;height:15px">
  <span>${esc(p.name)}${p.IPN ? ' <span style="color:var(--text3)">(' + esc(p.IPN) + ')</span>' : ''}</span>
</label>`).join('');
}

function toggleBulkSel(id, checked) {
  if (checked) _bulkSelected.add(id); else _bulkSelected.delete(id);
}

function bulkSelectAll(on) {
  const q = (document.getElementById('bulkFilter').value || '').toLowerCase();
  const list = _bulkCandidates.filter(p => !q || p.name.toLowerCase().includes(q));
  list.forEach(p => { if (on) _bulkSelected.add(p.id); else _bulkSelected.delete(p.id); });
  renderBulkCandidates();
}

async function runBulkAiLookup() {
  const ids = Array.from(_bulkSelected);
  if (!ids.length) { toast('⚠ Selecteer eerst onderdelen'); return; }
  const startBtn = document.getElementById('bulkStartBtn');
  const progressEl = document.getElementById('bulkProgress');
  const resultsEl = document.getElementById('bulkResults');
  startBtn.disabled = true;
  resultsEl.innerHTML = '';
  _bulkResults = {};
  for (let i = 0; i < ids.length; i++) {
    const p = _bulkCandidates.find(x => x.id === ids[i]);
    progressEl.textContent = `⏳ Bezig: ${i + 1}/${ids.length} — ${p.name}`;
    try {
      const r = await api('/api/ai/lookup', 'POST', { name: p.name, link: p.link || '' });
      _bulkResults[p.id] = r;
      resultsEl.insertAdjacentHTML('beforeend', `
    <label data-bulkresult="${p.id}" style="display:flex;align-items:flex-start;gap:8px;font-size:11px;border-bottom:1px solid var(--border);padding:4px 0;cursor:pointer;font-weight:normal">
      <input type="checkbox" checked style="width:15px;height:15px;margin-top:1px">
      <span><b>${esc(p.name)}</b><br>
        ${r.value ? 'Waarde: ' + esc(r.value) + ' · ' : ''}${r.brand ? 'Merk: ' + esc(r.brand) + ' · ' : ''}${r.package ? 'Package: ' + esc(r.package) : ''}
        ${!r.value && !r.brand && !r.package && !r.extra_info ? '<span style="color:var(--text3)">— niets gevonden</span>' : ''}
      </span>
    </label>`);
    } catch (e) {
      resultsEl.insertAdjacentHTML('beforeend', `<div style="font-size:11px;color:var(--red);padding:2px 0">⚠ ${esc(p.name)}: ${esc(e.message)}</div>`);
      if (/limiet|quota|rate limit/i.test(e.message)) {
        progressEl.textContent = `⚠ Gestopt: ${e.message}`;
        break;
      }
    }
    if (i < ids.length - 1) await new Promise(res => setTimeout(res, 4500)); // spaar de rate-limit
  }
  progressEl.textContent = `✅ Klaar — ${Object.keys(_bulkResults).length}/${ids.length} onderdelen verwerkt.`;
  startBtn.style.display = 'none';
  if (Object.keys(_bulkResults).length) document.getElementById('bulkApplyBtn').style.display = '';
}

async function applyBulkAiLookup() {
  const rows = document.querySelectorAll('#bulkResults [data-bulkresult]');
  const btn = document.getElementById('bulkApplyBtn');
  btn.disabled = true; btn.textContent = '⏳ Opslaan…';
  let count = 0;
  for (const row of rows) {
    const checked = row.querySelector('input[type=checkbox]').checked;
    const id = parseInt(row.getAttribute('data-bulkresult'));
    const r = _bulkResults[id];
    if (!checked || !r) continue;
    const p = parts.find(x => x.id === id); if (!p) continue;
    const descParts = [];
    if (r.value) descParts.push(`Waarde: ${r.value}`);
    if (r.brand) descParts.push(`Merk: ${r.brand}`);
    if (r.package) descParts.push(`Package: ${r.package}`);
    let desc = p.desc || '';
    if (descParts.length) desc = desc ? `${desc} — ${descParts.join(', ')}` : descParts.join(', ');
    let link = p.link || '';
    let notes = p.notes || '';
    if (r.datasheet_url) {
      if (!link) link = r.datasheet_url;
      else notes = notes ? `${notes}\nDatasheet (AI): ${r.datasheet_url}` : `Datasheet (AI): ${r.datasheet_url}`;
    }
    if (r.extra_info) notes = notes ? `${notes}\nSpecificaties (AI): ${r.extra_info}` : `Specificaties (AI): ${r.extra_info}`;
    try {
      const updated = await api(`/api/parts/${id}`, 'PUT', { ...p, desc, link, notes });
      const i = parts.findIndex(x => x.id === id); if (i >= 0) parts[i] = updated;
      count++;
    } catch (e) { console.warn('Bulk apply fout voor', p.name, e.message); }
  }
  renderSidebar(); renderTable();
  toast(`💾 ${count} onderdelen bijgewerkt`);
  btn.disabled = false; btn.textContent = '✅ Toepassen op geselecteerde';
  closeBulkAiLookup();
}

async function suggestReplacement(partId) {
  const p = parts.find(x => x.id === partId);
  if (!p) return;
  const bodyEl = document.getElementById('replBody');
  bodyEl.innerHTML = `<p style="font-size:12px;color:var(--text2)">⏳ Zoeken naar alternatieven voor <b>${esc(p.name)}</b>…</p>`;
  document.getElementById('replOvl').classList.add('open');
  try {
    const r = await api('/api/ai/suggest-replacement', 'POST', { name: p.name, desc: p.desc || '', IPN: p.IPN || '' });
    if (r.none_found || !r.suggestions.length) {
      bodyEl.innerHTML = `<p style="font-size:12px;color:var(--text3)">Geen bruikbaar alternatief gevonden voor <b>${esc(p.name)}</b> in je huidige voorraad.</p>`;
      return;
    }
    bodyEl.innerHTML = `<p style="font-size:12px;color:var(--text2);margin-bottom:8px">Mogelijke alternatieven voor <b>${esc(p.name)}</b> (op basis van wat je op voorraad hebt):</p>
  <div style="display:flex;flex-direction:column;gap:8px">
    ${r.suggestions.map(s => `
    <div style="border:1px solid var(--border);border-radius:var(--r);padding:8px;font-size:12px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-weight:600;color:var(--text);cursor:pointer" onclick="document.getElementById('replOvl').classList.remove('open');closeProjectsModal();selPart(${s.id})">${esc(s.name)}</span>
        <span style="color:var(--green);font-size:11px">${s.stock}× op voorraad</span>
      </div>
      ${s.IPN ? `<div style="font-size:10px;color:var(--text3)">${esc(s.IPN)}</div>` : ''}
      <div style="color:var(--text2);margin-top:4px">${esc(s.reason)}</div>
    </div>`).join('')}
  </div>
  <p style="font-size:10px;color:var(--text3);margin-top:10px">Controleer altijd zelf of het alternatief elektrisch/mechanisch echt past voordat je het gebruikt. Dit past de BOM niet automatisch aan.</p>`;
  } catch (e) {
    bodyEl.innerHTML = `<p style="font-size:12px;color:var(--red)">⚠ ${esc(e.message)}</p>`;
  }
}

let _partSnapshot = '';

function _snapPart() {
  const fields = ['peName', 'peDesc', 'peIPN', 'peStock', 'peCat', 'peLoc', 'peLink', 'peNotes', 'peMin', 'peImg', 'peExpiry'];
  return fields.map(id => document.getElementById(id)?.value || '').join('|')
    + '|' + (document.getElementById('peActive')?.checked ? '1' : '0')
    + '|' + document.getElementById('suppRows')?.innerHTML
    + '|' + document.getElementById('extraLocRows')?.innerHTML
    + '|' + document.getElementById('tagChips')?.innerHTML;
}

function closePartSafe() {
  const current = _snapPart();
  if (current !== _partSnapshot) {
    if (!confirm('Je hebt wijzigingen gemaakt. Sluiten zonder opslaan?')) return;
  }
  closePart();
}

async function savePart() {
  const name = document.getElementById('peName').value.trim();
  if (!name) { alert('Naam is verplicht'); return; }
  const id = document.getElementById('peId').value;
  // Data validatie
  const catVal = document.getElementById('peCat').value;
  const locVal = document.getElementById('peLoc').value;
  if (!catVal && !confirm('Geen categorie ingesteld. Toch opslaan?')) return;
  if (!locVal && !confirm('Geen locatie ingesteld. Toch opslaan?')) return;
  // Duplicate detection (only for new parts)
  if (!id) {
    const ipn = document.getElementById('peIPN').value.trim();
    const dupName = parts.find(p => p.active !== false && p.name.toLowerCase() === name.toLowerCase());
    const dupIPN = ipn && parts.find(p => p.active !== false && p.IPN && p.IPN.toLowerCase() === ipn.toLowerCase());
    if (dupName && !confirm(`Er bestaat al een onderdeel met de naam "${dupName.name}". Toch toevoegen?`)) return;
    if (dupIPN && !confirm(`Er bestaat al een onderdeel met IPN "${dupIPN.IPN}" (${dupIPN.name}). Toch toevoegen?`)) return;
  }
  const btn = document.getElementById('pSaveBtn');
  btn.disabled = true; btn.innerHTML = '<i class="spin">⟳</i> Opslaan…';

  try {
    const id = document.getElementById('peId').value;
    const imgVal = document.getElementById('peImg').value;
    const imgOld = document.getElementById('peImgOld').value;
    const imgFile = document.getElementById('imgFile').files[0];

    let imgUrl = imgOld || '';

    if (imgFile) {
      // New file upload
      const fd = new FormData(); fd.append('file', imgFile);
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const j = await r.json();
      imgUrl = j.url;
      // Delete old image if it was an uploaded file (not a shared media url)
      if (imgOld && imgOld.startsWith('/media/')) {
        const oldName = imgOld.split('/').pop();
        await fetch(`/api/upload/${oldName}`, { method: 'DELETE' }).catch(() => { });
      }
    } else if (imgVal && imgVal.startsWith('/media/')) {
      // Picked from existing media — just use the URL directly
      imgUrl = imgVal;
    } else if (imgVal && imgVal.startsWith('data:')) {
      // Base64 from drag-drop — upload it
      const blob = await (await fetch(imgVal)).blob();
      const ext = blob.type.split('/')[1] || 'jpg';
      const fd = new FormData(); fd.append('file', new File([blob], `upload.${ext}`, { type: blob.type }));
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const j = await r.json();
      imgUrl = j.url;
    } else if (!imgVal) {
      // Image cleared
      imgUrl = '';
      if (imgOld && imgOld.startsWith('/media/')) {
        const oldName = imgOld.split('/').pop();
        await fetch(`/api/upload/${oldName}`, { method: 'DELETE' }).catch(() => { });
      }
    }

    let autoIPN = document.getElementById('peIPN').value.trim();
    if (!autoIPN) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I confusion
      const rand = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      autoIPN = `HZB-${rand}`;
      document.getElementById('peIPN').value = autoIPN;
    }
    const data = { name, desc: document.getElementById('peDesc').value.trim(), IPN: autoIPN, stock: parseInt(document.getElementById('peStock').value) || 0, catId: parseInt(document.getElementById('peCat').value) || null, locId: parseInt(document.getElementById('peLoc').value) || null, link: document.getElementById('peLink').value.trim(), notes: document.getElementById('peNotes').value.trim(), minStock: parseInt(document.getElementById('peMin').value) || 0, active: document.getElementById('peActive').checked, img: imgUrl, suppliers: getSuppRowsData(), extraLocs: getExtraLocs(), tags: getTags(), expiryDate: document.getElementById('peExpiry').value || '' };

    if (id) {
      const updated = await api(`/api/parts/${id}`, 'PUT', data);
      const i = parts.findIndex(p => p.id === parseInt(id)); if (i >= 0) parts[i] = updated;
    } else {
      const created = await api('/api/parts', 'POST', data);
      parts.push(created);
    }
    closePart(); renderSidebar(); renderTable(); toast(id ? 'Opgeslagen' : 'Onderdeel toegevoegd');
  } catch (e) { toast('⚠ Fout: ' + e.message); }
  finally { btn.disabled = false; btn.textContent = 'Opslaan'; }
}

async function delPart(id) {
  const p = parts.find(x => x.id === id); if (!p || !confirm(`Verwijder "${p.name}"?`)) return;
  const idx = parts.indexOf(p);
  parts.splice(idx, 1);
  _pendingDel.add(id);
  if (selId === id) closeDet();
  renderSidebar(); renderTable();
  armUndo(`"${_shortName(p)}" verwijderd`, {
    meta: { kind: 'delete', id },
    undo: () => {
      _pendingDel.delete(id);
      parts.splice(Math.min(idx, parts.length), 0, p);
      renderSidebar(); renderTable(); toast('↩ Teruggezet');
    },
    expire: () => commitDelete(id, p),
    ms: 8000
  });
}

// ── LOCATIONS ─────────────────────────────────────────────────
function openLocModal() { document.getElementById('lSrch').value = ''; document.getElementById('lForm').style.display = 'none'; renderLocs(); fillLocParent(); document.getElementById('lOvl').classList.add('open'); }
function closeLocModal() { document.getElementById('lOvl').classList.remove('open'); fillSels(); }

function renderLocs() {
  const q = (document.getElementById('lSrch').value || '').toLowerCase();
  const all = LOCS;
  const entries = Object.entries(all).filter(([, n]) => !q || n.toLowerCase().includes(q)).sort((a, b) => a[1].localeCompare(b[1], 'nl'));
  if (!entries.length) { document.getElementById('lList').innerHTML = '<div style="text-align:center;padding:28px;color:var(--text3);font-size:13px">Geen locaties</div>'; return; }
  document.getElementById('lList').innerHTML = entries.map(([id, name]) => {
    const isCustom = customLocs[id] !== undefined;
    const uses = parts.filter(p => String(p.locId) === String(id)).length;
    return `<div class="lrow" id="lrow-${id}">
  <span class="lname" id="lname-${id}">${esc(name)}</span>
  ${uses ? `<span style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace">${uses}×</span>` : ''}
  <button class="abtn" onclick="inlineEditLoc('${id}')" style="font-size:11px">✏</button>
  ${isCustom ? `<button class="abtn del" onclick="deleteLoc('${id}')" style="font-size:11px">✕</button>` : ''}
</div>`;
  }).join('');
}

function fillLocParent() {
  const all = LOCS;
  document.getElementById('lParent').innerHTML = '<option value="">— geen (root) —</option>' + Object.entries(all).sort((a, b) => a[1].localeCompare(b[1], 'nl')).map(([id, n]) => `<option value="${id}">${esc(n)}</option>`).join('');
}

function inlineEditLoc(id) {
  const nameEl = document.getElementById('lname-' + id);
  if (!nameEl) return;
  const current = LOCS[id] || '';
  const shortName = current.includes('/') ? current.split('/').pop() : current;
  nameEl.outerHTML = `<input class="lname-edit" id="ledit-${id}" value="${esc(shortName)}" onkeydown="if(event.key==='Enter')saveInlineLoc('${id}');if(event.key==='Escape')renderLocs();" onblur="saveInlineLoc('${id}')">`;
  setTimeout(() => document.getElementById('ledit-' + id)?.select(), 50);
}

async function saveInlineLoc(id) {
  const input = document.getElementById('ledit-' + id);
  if (!input) return;
  const newShort = input.value.trim();
  if (!newShort) { renderLocs(); return; }
  const current = LOCS[id] || '';
  // Preserve parent prefix if any
  const prefix = current.includes('/') ? current.substring(0, current.lastIndexOf('/') + 1) : '';
  const newName = prefix + newShort;
  try {
    const r = await api('/api/locations/rename', 'POST', { id, name: newName });
    customLocs[id] = r.name;
    LOCS[id] = r.name;
    renderLocs();
    fillSels();
    toast(`✓ Hernoemd naar "${newShort}"`);
  } catch (e) { toast('⚠ ' + e.message); renderLocs(); }
}
function openAddLoc() { document.getElementById('lFTitle').textContent = 'Nieuwe locatie'; document.getElementById('lEditId').value = ''; document.getElementById('lName').value = ''; document.getElementById('lParent').value = ''; document.getElementById('lForm').style.display = ''; setTimeout(() => document.getElementById('lName').focus(), 50); }
function openEditLoc(id) { document.getElementById('lFTitle').textContent = 'Locatie bewerken'; document.getElementById('lEditId').value = id; document.getElementById('lName').value = LOCS[id] || ''; document.getElementById('lParent').value = ''; document.getElementById('lForm').style.display = ''; setTimeout(() => document.getElementById('lName').focus(), 50); }
function cancelLF() { document.getElementById('lForm').style.display = 'none'; }

async function saveLoc() {
  const name = document.getElementById('lName').value.trim(); if (!name) { alert('Naam is verplicht'); return; }
  const btn = document.getElementById('lSaveBtn'); btn.disabled = true;
  try {
    const editId = document.getElementById('lEditId').value;
    const parent = document.getElementById('lParent').value;
    if (editId) {
      const r = await api(`/api/locations/${editId}`, 'PUT', { name });
      customLocs[editId] = r.name; LOCS[editId] = r.name;
    } else {
      const r = await api('/api/locations', 'POST', { name, parent });
      customLocs[r.id] = r.name; LOCS[r.id] = r.name;
    }
    cancelLF(); fillLocParent(); renderLocs(); toast(editId ? 'Locatie bijgewerkt' : `"${name}" toegevoegd`);
  } catch (e) { toast('⚠ Fout: ' + e.message); }
  finally { btn.disabled = false; }
}

async function deleteLoc(id) {
  const name = LOCS[id];
  const uses = parts.filter(p => String(p.locId) === String(id)).length;
  const msg = uses > 0 ? `"${name}" wordt gebruikt door ${uses} onderdeel(en). Toch verwijderen?` : `Verwijder locatie "${name}"?`;
  if (!confirm(msg)) return;
  await api(`/api/locations/${id}`, 'DELETE');
  if (uses > 0) parts.forEach(p => { if (String(p.locId) === String(id)) p.locId = null; });
  delete customLocs[id]; delete LOCS[id];
  renderLocs(); fillLocParent(); renderTable(); toast('Locatie verwijderd');
}

// ── MELDINGEN (header) ────────────────────────────────────────
function alertCounts() {
  const active = parts.filter(p => p.active !== false);
  const low = active.filter(p => p.minStock > 0 && (p.stock || 0) < p.minStock).length;
  const exp = parts.filter(p => {
    if (!p.active || !p.expiryDate) return false;
    const st = getExpiryStatus(p.expiryDate);
    return st === 'expired' || st === 'critical' || st === 'warning';
  }).length;
  const sug = (window._suggestions || []).length;
  const upd = window._update && window._update.available ? 1 : 0;
  const zero = active.filter(p => (p.stock || 0) === 0).length;
  return { low, exp, sug, zero, upd };
}
function updateAlertCenter() {
  const c = alertCounts();
  const total = c.low + c.exp + c.sug + c.upd;
  const el = document.getElementById('alertCount');
  if (!el) return;
  el.hidden = total === 0;
  el.textContent = total > 99 ? '99+' : total;
  document.getElementById('alertBtn').title = total ? `${total} melding${total === 1 ? '' : 'en'}` : 'Geen meldingen';
  if (!document.getElementById('alertPop').hidden) renderAlertPop();
}
function renderAlertPop() {
  const c = alertCounts();
  const row = (key, ic, label, n, cls) =>
    `<button class="alert-row ${cls}" onclick="alertGo('${key}')"><span class="ic">${ic}</span><span class="lbl">${label}</span><span class="n">${n}</span></button>`;
  let h = '';
  if (c.low) h += row('low', '⚠', 'Lage voorraad', c.low, 'is-red');
  if (c.exp) h += row('exp', '⏰', 'Verloopt binnenkort', c.exp, 'is-orange');
  if (c.sug) h += row('sug', '💡', 'Suggesties', c.sug, 'is-green');
  if (c.upd) h += row('upd', '⬆', 'Nieuwe versie ' + window._update.latest, 1, 'is-green');
  if (!h) h = '<div class="alert-empty">Alles in orde ✓</div>';
  h += '<div class="alert-sep"></div>';
  h += row('zero', '∅', window._zeroStockMode ? 'Lege vakken (filter aan)' : 'Lege vakken tonen', c.zero, window._zeroStockMode ? 'is-on' : '');
  document.getElementById('alertPop').innerHTML = h;
}
function toggleAlerts(e) {
  if (e) e.stopPropagation();
  const pop = document.getElementById('alertPop');
  const open = pop.hidden;
  closeMoreMenu();
  if (open) renderAlertPop();
  pop.hidden = !open;
  document.getElementById('alertBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
}
function closeAlerts() {
  const pop = document.getElementById('alertPop');
  if (pop) pop.hidden = true;
  document.getElementById('alertBtn')?.setAttribute('aria-expanded', 'false');
}
function alertGo(key) {
  closeAlerts();
  if (key === 'low') showLowStock();
  else if (key === 'exp') showExpiryList();
  else if (key === 'sug') openSuggestions();
  else if (key === 'zero') toggleZeroStock();
  else if (key === 'upd') openAdmin('upd');
}
async function loadUpdateInfo() {
  try { window._update = await (await fetch('/api/update')).json(); updateAlertCenter(); } catch (e) { }
}

// ── MENU (één definitie voor desktop-dropdown én mobiel menu-blad) ──
// ctx: 'm' = alleen mobiel, 'd' = alleen desktop, weglaten = overal
const MENU = [
  { id: 'ov', t: 'Overzichten', ctx: 'm', items: [
    ['📊', 'Dashboard', 'openDashboard()'], ['📋', 'Bestellen', 'openOrderList()'],
    ['📜', 'Geschiedenis', 'openHistModal()'], ['📦', 'Archief', 'toggleArchived()']] },
  { id: 'beheer', t: 'Beheer', items: [
    ['🗄', 'Kasten', 'openKastModal()'], ['📍', 'Locaties', 'openLocModal()'], ['📷', 'Scanner (camera)', 'openScanOvl()', 'd'],
    ['🩺', 'Beheer & gezondheid', 'openAdmin()'], ['🗂', 'Categorieën', 'openCatManager()'], ['🏪', 'Leveranciers', 'openSuppModal()'],
    ['🖼', 'Media', 'openMediaModal()'], ['🔗', 'Projecten / BOM', 'openProjectsModal()'],
    ['📦', 'Inkooporders', 'openOrdersModal()']] },
  { id: 'print', t: 'Afdrukken & export', items: [
    ['🏷', 'Labels printen', 'openPrintModal()'], ['📋', 'Pakbon', 'openPackingSlip()'],
    ['📦', 'Verpakkingsteller', 'openPackagingCounter()'], ['📤', 'Exporteren', 'openExport()'],
    ['📊', 'Excel export', 'exportExcel()']] },
  { id: 'data', t: 'Gegevens', items: [
    ['📜', 'Geschiedenis', 'openHistModal()', 'd'], ['📥', 'Bulk voorraad import (CSV)', 'bulkStockImportCSV()', 'd'],
    ['🤖', 'Bulk AI-lookup', 'openBulkAiLookup()'], ['💾', 'Backup downloaden', 'downloadBackup()']] },
  { id: 'inst', t: 'Instellingen', items: [
    ['⚙', 'Kolommen instellen', 'openColSettings()', 'd'], ['🔄', 'Auto-refresh', 'openRefreshSettings()'],
    ['📡', 'Webhook / HA push', 'openWebhookSettings()'], ['🔗', 'Links & deep-links', 'openLinksPanel()'],
    ['🔒', 'Alleen-lezen', 'toggleReadOnly()', '', 'js-readonly'], ['🌐', 'Language / Taal', 'toggleLang()'], ['❓', 'Help & sneltoetsen', 'openHelp()']] },
];
function mmOpenId() { try { return localStorage.getItem('hb_menu_open') || 'beheer'; } catch (e) { return 'beheer'; } }
function buildMenus() {
  const open = mmOpenId();
  const html = (sheet) =>
    (sheet ? '<div class="mm-grip"></div>' : '') +
    '<div class="mm-top"><input class="mm-search" type="search" placeholder="Zoek in menu…" autocomplete="off" oninput="mmFilter(this)">' +
    (sheet ? '<button class="mm-close" onclick="closeMoreMenu()" aria-label="Sluiten">✕</button>' : '') + '</div>' +
    MENU.map(g => `<div class="mm-group${g.ctx ? ' ctx-' + g.ctx : ''}${g.id === open ? ' open' : ''}" data-g="${g.id}">` +
      `<button class="mm-ghead" onclick="mmToggle('${g.id}')"><span>${g.t}</span><span class="mm-chev">›</span></button>` +
      '<div class="mm-items">' + g.items.map(it =>
        `<div class="mm-item${it[3] ? ' ctx-' + it[3] : ''}${it[4] ? ' ' + it[4] : ''}" role="button" tabindex="0" data-l="${it[1].toLowerCase()}" onclick="${it[2]};closeMoreMenu()">` +
        `<span class="ic">${it[0]}</span><span class="mm-lbl">${it[1]}</span></div>`).join('') +
      '</div></div>').join('') +
    '<div class="mm-empty" hidden>Niets gevonden</div>';
  document.getElementById('moreMenuDesktop').innerHTML = html(false);
  document.getElementById('moreSheetPanel').innerHTML = html(true);
  applyReadOnly();
}
function mmToggle(id) {
  const open = mmOpenId() === id ? '' : id;
  try { localStorage.setItem('hb_menu_open', open || '-'); } catch (e) { }
  document.querySelectorAll('.mm-group').forEach(g => g.classList.toggle('open', g.dataset.g === open));
}
function mmFilter(input) {
  const root = input.closest('.mm');
  const q = input.value.trim().toLowerCase();
  const mobile = window.innerWidth <= 640;
  let any = false;
  root.classList.toggle('mm-searching', !!q);
  root.querySelectorAll('.mm-group').forEach(g => {
    let hits = 0;
    g.querySelectorAll('.mm-item').forEach(it => {
      const ctxOk = !(mobile ? it.classList.contains('ctx-d') : it.classList.contains('ctx-m'));
      const match = ctxOk && (!q || it.dataset.l.includes(q));
      it.classList.toggle('mm-no', !match);
      if (match) hits++;
    });
    const gCtxOk = !(mobile ? g.classList.contains('ctx-d') : g.classList.contains('ctx-m'));
    g.classList.toggle('mm-no', !q ? false : (!hits || !gCtxOk));
    if (q && hits && gCtxOk) any = true;
  });
  root.querySelector('.mm-empty').hidden = !q || any;
}
function toggleMoreMenu() {
  closeAlerts();
  const isMobile = window.innerWidth <= 640;
  const el = document.getElementById(isMobile ? 'moreSheet' : 'moreMenuDesktop');
  const showing = el.style.display === 'block';
  closeMoreMenu();
  if (!showing) el.style.display = 'block';
}
function closeMoreMenu() {
  document.getElementById('moreMenuDesktop').style.display = 'none';
  document.getElementById('moreSheet').style.display = 'none';
  document.querySelectorAll('.mm-search').forEach(i => { if (i.value) { i.value = ''; mmFilter(i); } });
}
document.addEventListener('click', e => {
  if (!document.getElementById('moreMenuWrap')?.contains(e.target)) {
    document.getElementById('moreMenuDesktop').style.display = 'none';
  }
  if (!document.getElementById('alertWrap')?.contains(e.target)) closeAlerts();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAlerts(); });

// ── DASHBOARD ─────────────────────────────────────────────────
function openDashboard() {
  renderDashboard();
  document.getElementById('dashOvl').classList.add('open');
}
function closeDashboard() { document.getElementById('dashOvl').classList.remove('open'); }

let _dashTab = 'overzicht';
let _dashCollapsed = {};

function switchDashTab(tab) {
  _dashTab = tab;
  document.querySelectorAll('.dash-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('dtab-' + tab)?.classList.add('active');
  renderDashBody();
}

function toggleDashSection(key) {
  _dashCollapsed[key] = !_dashCollapsed[key];
  renderDashBody();
}

function dashSection(key, title, content) {
  const collapsed = _dashCollapsed[key];
  return '<div class="dash-section">'
    + '<div class="dash-section-hdr" onclick="toggleDashSection(\'' + key + '\')">'
    + '<span>' + title + '</span>'
    + '<span style="font-size:14px;font-weight:400;color:var(--text3)">' + (collapsed ? '▸' : '▾') + '</span>'
    + '</div>'
    + (collapsed ? '' : '<div class="dash-section-body">' + content + '</div>')
    + '</div>';
}

async function renderDashboard() {
  const active = parts.filter(p => p.active !== false);
  const withStock = active.filter(p => p.stock > 0);
  const lowStock = active.filter(p => p.minStock > 0 && (p.stock || 0) < p.minStock);
  const noLoc = active.filter(p => !p.locId);
  const totalStock = active.reduce((s, p) => s + (p.stock || 0), 0);
  let totalValue = 0;
  active.forEach(p => {
    const prices = (p.suppliers || []).map(s => s.price).filter(Boolean);
    const price = prices.length ? Math.min(...prices) : 0;
    totalValue += price * (p.stock || 0);
  });
  const catCounts = {}, catStock = {};
  active.forEach(p => { if (p.catId) { catCounts[p.catId] = (catCounts[p.catId] || 0) + 1; catStock[p.catId] = (catStock[p.catId] || 0) + (p.stock || 0); } });
  const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const maxCat = topCats[0]?.[1] || 1;
  const lowList = lowStock.slice().sort((a, b) => (a.stock || 0) - (b.stock || 0)).slice(0, 10);
  const recent = active.slice().sort((a, b) => b.id - a.id).slice(0, 8);
  const topLocsHtml = buildTopLocations();
  let usageHtml = '<p style="color:var(--text3);font-size:12px">Nog geen verbruiksdata.</p>';
  let weeklyHtml = '';
  try {
    const hist = await api('/api/history');
    window._cachedHist = hist;
    if (hist.length >= 2) {
      const consumed = {};
      hist.forEach(h => { if (h.delta < 0) consumed[h.partId] = (consumed[h.partId] || 0) + Math.abs(h.delta); });
      const topConsumed = Object.entries(consumed).sort((a, b) => b[1] - a[1]).slice(0, 8);
      const maxC = topConsumed[0]?.[1] || 1;
      const firstTs = new Date(hist[hist.length - 1].ts);
      const daysSince = Math.max(1, Math.ceil((new Date() - firstTs) / (1000 * 86400)));
      if (topConsumed.length) {
        usageHtml = '<div style="font-size:11px;color:var(--text3);margin-bottom:8px">' + hist.length + ' wijzigingen over ' + daysSince + ' dagen</div>'
          + topConsumed.map(([pid, n]) => {
            const p = parts.find(x => x.id === parseInt(pid));
            if (!p) return '';
            return '<div class="dash-bar-row" style="cursor:pointer" onclick="closeDashboard();selPart(' + pid + ')">'
              + '<div class="dash-bar-label" title="' + esc(p.name) + '">' + esc(p.name) + '</div>'
              + '<div class="dash-bar-track"><div class="dash-bar-fill" style="width:' + Math.round(n / maxC * 100) + '%;background:var(--acc2)"></div></div>'
              + '<div class="dash-bar-count" style="color:var(--acc2)">' + n + '</div>'
              + '</div>';
          }).join('');
      }
      weeklyHtml = buildWeeklyActivity(hist.slice().reverse());
    }
  } catch (e) { }

  // Store all computed data for tab rendering
  window._dashData = {
    active, withStock, lowStock, noLoc, totalStock, totalValue,
    topCats, maxCat, catStock, lowList, recent, topLocsHtml, usageHtml, weeklyHtml
  };
  renderDashBody();
}

function renderDashBody() {
  const d = window._dashData;
  if (!d) return;
  const { active, withStock, lowStock, noLoc, totalStock, totalValue,
    topCats, maxCat, catStock, lowList, recent, topLocsHtml, usageHtml, weeklyHtml } = d;

  let html = '';

  if (_dashTab === 'overzicht') {
    // Stats kaarten
    html += `<div class="dash-grid" style="margin-bottom:14px">
  <div class="dash-card"><div class="dc-val">${active.length}</div><div class="dc-lbl">Onderdelen</div></div>
  <div class="dash-card"><div class="dc-val">${withStock.length}</div><div class="dc-lbl">Op voorraad</div><div class="dc-sub">${active.length - withStock.length} leeg</div></div>
  <div class="dash-card"><div class="dc-val" style="color:var(--acc2)">${totalStock.toLocaleString(HB_LOCALE)}</div><div class="dc-lbl">Totaal stuks</div></div>
  <div class="dash-card"><div class="dc-val" style="color:var(--red)">${lowStock.length}</div><div class="dc-lbl">Onder minimum</div></div>
  <div class="dash-card"><div class="dc-val" style="color:var(--green)">€${totalValue.toFixed(2)}</div><div class="dc-lbl">Voorraadwaarde</div></div>
  <div class="dash-card"><div class="dc-val">${noLoc.length}</div><div class="dc-lbl">Zonder locatie</div></div>
</div>`;
    html += dashSection('topcats', '📦 Top categorieën',
      topCats.map(([id, n]) => {
        const cid = parseInt(id);
        return '<div class="dash-bar-row"><div class="dash-bar-label">' + esc(cat(cid)) + '</div>'
          + '<div class="dash-bar-track"><div class="dash-bar-fill" style="width:' + Math.round(n / maxCat * 100) + '%"></div></div>'
          + '<div class="dash-bar-count">' + n + ' <span style="font-size:10px;color:var(--text3)">(' + (catStock[id] || 0) + ')</span></div></div>';
      }).join(''));
    html += dashSection('recent', '🆕 Recent toegevoegd',
      '<div style="display:flex;flex-wrap:wrap;gap:6px">'
      + recent.map(p => '<span onclick="closeDashboard();selPart(' + p.id + ')" style="background:var(--surf2);border:1px solid var(--border);border-radius:4px;padding:4px 8px;font-size:11px;color:var(--text2);cursor:pointer">' + esc(p.name) + '</span>').join('')
      + '</div>');
  }

  if (_dashTab === 'voorraad') {
    html += dashSection('lowstock', '⚠ Lage voorraad',
      lowList.length
        ? lowList.map(p => '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer" onclick="closeDashboard();selPart(' + p.id + ')">'
          + '<span style="font-family:\'JetBrains Mono\',monospace;color:var(--red);font-weight:700;width:28px;text-align:right">' + (p.stock || 0) + '</span>'
          + '<span style="color:var(--text3);font-size:10px">/</span>'
          + '<span style="font-family:\'JetBrains Mono\',monospace;color:var(--text3);width:28px">' + p.minStock + '</span>'
          + '<span style="color:var(--text);flex:1">' + esc(p.name) + '</span>'
          + '</div>').join('')
        : '<p style="color:var(--green);font-size:12px">✓ Alles op voorraad</p>');
    if (topLocsHtml) html += dashSection('locs', '🏆 Meest gebruikte locaties', topLocsHtml);
  }

  if (_dashTab === 'projecten') {
    const allBuilds = [];
    projects.forEach(proj => {
      (proj.buildHistory || []).forEach(h => {
        allBuilds.push({ ...h, projName: proj.name, projVersion: proj.version || '', sellPrice: proj.sellPrice || 0, projId: proj.id });
      });
    });
    allBuilds.sort((a, b) => b.ts.localeCompare(a.ts));
    const totalBuilds = allBuilds.reduce((s, h) => s + h.qty, 0);
    const totalCost = allBuilds.reduce((s, h) => s + (h.cost || 0), 0);
    const totalRevenue = allBuilds.reduce((s, h) => s + ((h.sellPrice || 0) * h.qty), 0);
    const totalProfit = totalRevenue - totalCost;
    const actief = projects.filter(p => p.status === 'actief').length;
    const klaar = projects.filter(p => p.status === 'klaar').length;
    const totalBomMiss = projects.reduce((s, p) => s + calcBomStatus(p).missing, 0);
    const totalProjCost = projects.reduce((s, p) => s + calcProjectCost(p, 1), 0);
    const kpiItems = [
      { val: projects.length, label: 'Projecten', color: 'var(--acc)' },
      { val: actief, label: 'Actief', color: 'var(--green)' },
      { val: klaar, label: 'Klaar', color: 'var(--acc2)' },
      { val: totalBomMiss > 0 ? totalBomMiss + ' tekort' : 'OK', label: 'BOM status', color: totalBomMiss > 0 ? 'var(--red)' : 'var(--green)' },
      { val: totalBuilds, label: 'Gebouwd', color: 'var(--acc)' },
      ...(totalProfit > 0 ? [{ val: '\u20ac' + totalProfit.toFixed(0), label: 'Totale winst', color: 'var(--green)' }] : []),
      ...(totalProjCost > 0 ? [{ val: '\u20ac' + totalProjCost.toFixed(0), label: 'Portfolio inkoop', color: 'var(--acc2)' }] : []),
    ];
    html += dashSection('projkpi', 'Overzicht',
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px">'
      + kpiItems.map(k => '<div style="background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);padding:12px;text-align:center">'
        + '<div style="font-size:20px;font-weight:700;color:' + k.color + '">' + k.val + '</div>'
        + '<div style="font-size:11px;color:var(--text2);margin-top:2px">' + k.label + '</div></div>').join('')
      + '</div>');

    if (allBuilds.length > 0) {
      const monthMap = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        monthMap[key] = { qty: 0, cost: 0, revenue: 0 };
      }
      allBuilds.forEach(h => {
        const d = new Date(h.ts); const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        if (monthMap[key]) { monthMap[key].qty += h.qty; monthMap[key].cost += h.cost || 0; monthMap[key].revenue += (h.sellPrice || 0) * h.qty; }
      });
      const months = Object.entries(monthMap);
      const maxQty = Math.max(...months.map(([, v]) => v.qty), 1);
      const W = 540, H = 80, pad = 4, bw = Math.floor((W - pad * 2) / months.length) - 2;
      const bars = months.map(([key, v], i) => {
        const x = pad + i * ((W - pad * 2) / months.length), bh = Math.max(2, Math.round((v.qty / maxQty) * (H - 20))), y = H - bh - 4;
        const fill = v.qty > 0 ? (v.revenue > v.cost && v.cost > 0 ? 'var(--green)' : 'var(--acc2)') : 'var(--border)';
        return '<rect x="' + x + '" y="' + y + '" width="' + bw + '" height="' + bh + '" rx="2" fill="' + fill + '"/>'
          + (v.qty > 0 ? '<text x="' + (x + bw / 2) + '" y="' + (y - 2) + '" text-anchor="middle" font-size="8" fill="var(--text2)">' + v.qty + '</text>' : '')
          + '<text x="' + (x + bw / 2) + '" y="' + H + '" text-anchor="middle" font-size="8" fill="var(--text3)">' + key.slice(5) + '</text>';
      }).join('');
      html += dashSection('projchart', 'Builds per maand',
        '<svg width="100%" viewBox="0 0 ' + W + ' ' + (H + 4) + '" style="overflow:visible;max-width:100%">' + bars + '</svg>');
    }

    const today2 = new Date(); today2.setHours(0, 0, 0, 0);
    const dlProjs = projects.filter(p => p.deadline && p.status === 'actief')
      .map(p => ({ ...p, days: Math.round((new Date(p.deadline) - today2) / 864e5) }))
      .filter(p => p.days <= 30).sort((a, b) => a.days - b.days);
    if (dlProjs.length) {
      html += dashSection('projdeadlines', 'Deadlines (30 dagen)', dlProjs.map(p => {
        const color = p.days < 0 ? 'var(--red)' : p.days <= 7 ? 'var(--orange)' : 'var(--acc)';
        const label = p.days < 0 ? Math.abs(p.days) + 'd over' : p.days === 0 ? 'Vandaag' : p.days + 'd resterend';
        return '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer" onclick="closeDashboard();openProjectsModal();openProjectDetail(' + p.id + ')">'
          + '<span style="color:' + color + ';font-weight:700;min-width:100px">' + label + '</span>'
          + '<span style="flex:1;font-weight:600">' + esc(p.name) + (p.version ? ' <span style="color:var(--acc2);font-size:11px">' + esc(p.version) + '</span>' : '') + '</span>'
          + '<span style="color:var(--text3);font-size:11px">' + new Date(p.deadline).toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short' }) + '</span></div>';
      }).join(''));
    }

    const shortProjs = projects.filter(p => calcBomStatus(p).missing > 0 && p.status !== 'klaar');
    if (shortProjs.length) {
      html += dashSection('projshortage', 'BOM tekorten', shortProjs.map(proj => {
        const s = calcBomStatus(proj), pct = proj.items?.length > 0 ? Math.round((s.ok / proj.items.length) * 100) : 0;
        const miss = (proj.items || []).filter(item => { const p = parts.find(x => x.id === item.partId); return p && (p.stock || 0) < item.qty; });
        return '<div style="padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="closeDashboard();openProjectsModal();openProjectDetail(' + proj.id + ')">'
          + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">'
          + '<span style="font-weight:600;font-size:12px;flex:1">' + esc(proj.name) + (proj.version ? ' <span style="color:var(--acc2);font-size:11px">' + esc(proj.version) + '</span>' : '') + '</span>'
          + '<span style="color:var(--red);font-size:11px;font-weight:700">' + s.missing + ' tekort</span>'
          + '<span style="color:var(--text3);font-size:11px">' + pct + '% compleet</span></div>'
          + '<div style="width:100%;height:4px;background:var(--border);border-radius:2px;overflow:hidden;margin-bottom:5px"><div style="height:100%;width:' + pct + '%;background:' + (pct < 50 ? 'var(--red)' : 'var(--orange)') + '"></div></div>'
          + '<div style="display:flex;flex-wrap:wrap;gap:4px">'
          + miss.slice(0, 5).map(item => { const p = parts.find(x => x.id === item.partId); if (!p) return ''; return '<span style="font-size:10px;background:rgba(224,92,92,.12);color:var(--red);border:1px solid rgba(224,92,92,.2);border-radius:4px;padding:1px 6px">' + esc(p.name) + ' (-' + (item.qty - (p.stock || 0)) + ')</span>'; }).join('')
          + (miss.length > 5 ? '<span style="font-size:10px;color:var(--text3)">+' + (miss.length - 5) + ' meer</span>' : '')
          + '</div></div>';
      }).join(''));
    }

    const projCards = projects.map(proj => {
      const totalB = (proj.buildHistory || []).reduce((s, h) => s + h.qty, 0), lastB = proj.buildHistory?.slice(-1)[0];
      const cu = calcProjectCost(proj, 1), sell = proj.sellPrice || 0, profit = sell > 0 && cu > 0 ? sell - cu : 0;
      const pPct = cu > 0 && sell > 0 ? Math.round((profit / cu) * 100) : 0;
      const bom = calcBomStatus(proj), bt = proj.items?.length || 0, bPct = bt > 0 ? Math.round((bom.ok / bt) * 100) : 0;
      const sc = proj.status === 'actief' ? 'var(--green)' : proj.status === 'klaar' ? 'var(--acc2)' : 'var(--text3)';
      return '<div style="background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);padding:12px;cursor:pointer" onclick="closeDashboard();openProjectsModal();openProjectDetail(' + proj.id + ')">'
        + '<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:8px">'
        + '<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px">' + esc(proj.name) + (proj.version ? ' <span style="font-size:11px;color:var(--acc)">' + esc(proj.version) + '</span>' : '') + '</div>'
        + (proj.desc ? '<div style="font-size:11px;color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(proj.desc) + '</div>' : '') + '</div>'
        + '<span style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:8px;background:rgba(77,184,132,.1);color:' + sc + '">' + proj.status + '</span></div>'
        + (bt > 0 ? '<div style="margin-bottom:7px"><div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:3px"><span>BOM</span><span style="color:' + (bom.missing > 0 ? 'var(--orange)' : 'var(--green)') + '">' + bPct + '%</span></div>'
          + '<div style="width:100%;height:4px;background:var(--border);border-radius:2px;overflow:hidden"><div style="height:100%;width:' + bPct + '%;background:' + (bom.missing > 0 ? 'var(--orange)' : 'var(--green)') + '"></div></div></div>' : '')
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px">'
        + '<div style="color:var(--text3)">' + bt + ' onderdelen' + (bom.missing > 0 ? ' <span style="color:var(--red)">&bull; ' + bom.missing + ' tekort</span>' : bt > 0 ? ' <span style="color:var(--green)">&bull; OK</span>' : '') + '</div>'
        + '<div style="text-align:right;color:var(--text3)">' + (totalB > 0 ? '<b style="color:var(--acc)">' + totalB + 'x</b> gebouwd' : 'Nog niet gebouwd') + '</div>'
        + (cu > 0 ? '<div style="color:var(--acc2)">inkoop \u20ac' + cu.toFixed(2) + '</div>' : '<div></div>')
        + (sell > 0 ? '<div style="text-align:right;color:' + (profit > 0 ? 'var(--green)' : 'var(--text2)') + '">verkoop \u20ac' + sell.toFixed(2) + (profit > 0 ? ' (+' + pPct + '%)' : '') + '</div>' : '<div></div>')
        + (lastB ? '<div style="color:var(--text3);font-size:10px">' + new Date(lastB.ts).toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' }) + '</div>' : '<div></div>')
        + (proj.deadline ? '<div style="text-align:right;font-size:10px;color:var(--text3)">' + new Date(proj.deadline).toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short' }) + '</div>' : '<div></div>')
        + '</div></div>';
    }).join('');
    html += dashSection('projcards', 'Alle projecten',
      '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px">'
      + (projCards || '<p style="color:var(--text3);font-size:12px">Geen projecten.</p>') + '</div>');

    const buildRows = allBuilds.length
      ? '<div style="font-size:11px;color:var(--text2);margin-bottom:8px;display:flex;gap:12px;flex-wrap:wrap">'
      + '<span>Totaal <b style="color:var(--text)">' + totalBuilds + ' stuks</b></span>'
      + (totalCost > 0 ? '<span>Inkoop <b style="color:var(--acc2)">\u20ac' + totalCost.toFixed(2) + '</b></span>' : '')
      + (totalRevenue > 0 ? '<span>Omzet <b>\u20ac' + totalRevenue.toFixed(2) + '</b></span>' : '')
      + (totalProfit > 0 ? '<span>Winst <b style="color:var(--green)">\u20ac' + totalProfit.toFixed(2) + '</b></span>' : '')
      + '</div>'
      + allBuilds.map(h => {
        const rev = (h.sellPrice || 0) * h.qty, prof = rev > 0 && h.cost > 0 ? rev - h.cost : 0;
        return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer" onclick="closeDashboard();openProjectsModal();openProjectDetail(' + (h.projId || 0) + ')">'
          + '<span style="font-size:11px;color:var(--text3);min-width:75px">' + new Date(h.ts).toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' }) + '</span>'
          + '<span style="color:var(--acc);font-weight:700;min-width:28px">' + h.qty + 'x</span>'
          + '<span style="color:var(--text);flex:1">' + esc(h.projName) + (h.projVersion ? ' <span style="color:var(--acc2);font-size:11px">' + esc(h.projVersion) + '</span>' : '') + '</span>'
          + (h.note ? '<span style="color:var(--text2);font-size:11px">' + esc(h.note) + '</span>' : '')
          + (h.cost > 0 ? '<span style="color:var(--acc2);font-size:11px">\u20ac' + h.cost.toFixed(2) + '</span>' : '')
          + (prof > 0 ? '<span style="color:var(--green);font-size:11px;font-weight:600">+\u20ac' + prof.toFixed(2) + '</span>' : '')
          + '</div>';
      }).join('')
      : '<p style="color:var(--text3);font-size:12px">Nog geen builds.</p>';
    html += dashSection('buildhistory', 'Bouw history', buildRows);
  }

  if (_dashTab === 'activiteit') {
    html += dashSection('usage', '📈 Verbruikspatronen', usageHtml);
    if (weeklyHtml) html += dashSection('weekly', '📅 Activiteit per week', weeklyHtml);
  }

  document.getElementById('dashBody').innerHTML = html;
}

// ── ORDER LIST ─────────────────────────────────────────────────
function openOrderList() {
  renderOrderList();
  document.getElementById('orderOvl').classList.add('open');
}
function closeOrderList() { document.getElementById('orderOvl').classList.remove('open'); }

function renderOrderList() {
  const low = parts.filter(p => p.active !== false && p.minStock > 0 && (p.stock || 0) < p.minStock)
    .sort((a, b) => ((a.stock || 0) - a.minStock) - ((b.stock || 0) - b.minStock));
  document.getElementById('orderCount').textContent = `${low.length} onderdelen`;
  if (!low.length) {
    document.getElementById('orderBody').innerHTML = '<div class="empty"><div class="big">✅</div><p>Alles op voorraad!</p></div>';
    return;
  }
  // Group by supplier
  const bySuppId = {};
  low.forEach(p => {
    const suppEntries = p.suppliers?.length ? p.suppliers : [{ suppId: null }];
    suppEntries.forEach(se => {
      const k = se.suppId || '_none';
      if (!bySuppId[k]) bySuppId[k] = [];
      bySuppId[k].push({ p, se });
    });
  });

  let html = '';
  Object.entries(bySuppId).forEach(([suppId, items]) => {
    const s = suppId !== '_none' ? suppById(parseInt(suppId)) : null;
    html += `<div style="border-bottom:2px solid var(--border)">
  <div style="padding:8px 16px;background:var(--surf2);display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;color:var(--text)">
    ${s ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${esc(s.color || '#888')}"></span>` : ''}
    ${s ? esc(s.name) : 'Geen leverancier'}
    ${s?.url ? `<a href="${esc(s.url)}" target="_blank" style="font-size:10px;color:var(--acc2);font-weight:400">↗ ${esc(s.url.replace('https://', ''))}</a>` : ''}
  </div>`;
    items.forEach(({ p, se }) => {
      const need = p.minStock - (p.stock || 0);
      html += `<div style="display:grid;grid-template-columns:1fr 60px 70px 80px 60px;gap:8px;align-items:center;padding:8px 16px;border-bottom:1px solid var(--border);font-size:12px">
    <div>
      <div style="font-weight:600;color:var(--text)">${esc(p.name)}</div>
      ${se.sku ? `<div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace">${esc(se.sku)}</div>` : ''}
    </div>
    <div style="text-align:right;font-family:'JetBrains Mono',monospace;color:var(--red)">${p.stock || 0}/${p.minStock}</div>
    <div style="text-align:right;font-family:'JetBrains Mono',monospace;color:var(--acc)">+${need} nodig</div>
    <div style="text-align:right;font-family:'JetBrains Mono',monospace;color:var(--text2)">${se.price ? `€${se.price.toFixed(2)}<span style="font-size:10px;color:var(--text3)"> p/st</span><br><span style="color:var(--green);font-size:11px">€${(se.price * need).toFixed(2)} totaal</span>` : '—'}</div>
    <div style="text-align:right">${se.link || p.link ? `<a href="${esc(se.link || p.link)}" target="_blank" class="abtn" style="font-size:10px">🔗 Bestel</a>` : ''}</div>
  </div>`;
    });
    html += '</div>';
  });
  document.getElementById('orderBody').innerHTML = html;
}

function printOrderList() {
  window.print();
}

function exportOrderCSV() {
  const low = parts.filter(p => p.active !== false && p.minStock > 0 && (p.stock || 0) < p.minStock)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!low.length) { toast('Niets te bestellen'); return; }
  const rows = [['Naam', 'IPN', 'SKU', 'Leverancier', 'Nodig', 'Prijs/st', 'Totaal', 'BestelLink']];
  low.forEach(p => {
    const ses = p.suppliers?.length ? p.suppliers : [{}];
    ses.forEach(se => {
      const supp = se.suppId ? suppById(se.suppId) : null;
      const need = p.minStock - (p.stock || 0);
      const tot = se.price ? (se.price * need).toFixed(2) : '';
      rows.push([p.name, p.IPN || '', se.sku || '', supp?.name || '', need, se.price ? se.price.toFixed(2) : '', tot, se.link || p.link || '']);
    });
  });
  const csv = rows.map(r => r.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'bestellijst-' + new Date().toISOString().slice(0, 10) + '.csv';
  a.click();
  toast('CSV gedownload');
}

// ── EXPORT ─────────────────────────────────────────────────────
function openExport() {
  updateExportPreview();
  document.getElementById('exportOvl').classList.add('open');
}
function closeExport() { document.getElementById('exportOvl').classList.remove('open'); }

document.addEventListener('change', e => {
  if (e.target.closest('#exportCols') || e.target.id === 'exportWhat' || e.target.id === 'exportFmt') updateExportPreview();
});

function getExportParts() {
  const what = document.getElementById('exportWhat')?.value || 'all';
  if (what === 'filtered') return filtered();
  if (what === 'low') return parts.filter(p => p.active !== false && (p.stock || 0) < 5);
  if (what === 'order') return parts.filter(p => p.active !== false && p.minStock > 0 && (p.stock || 0) < p.minStock);
  return parts.filter(p => p.active !== false);
}

function getExportCols() {
  return Array.from(document.querySelectorAll('#exportCols input:checked')).map(i => i.value);
}

function partToRow(p, cols) {
  return cols.map(c => {
    if (c === 'name') return p.name || '';
    if (c === 'desc') return p.desc || '';
    if (c === 'IPN') return p.IPN || '';
    if (c === 'stock') return p.stock || 0;
    if (c === 'minStock') return p.minStock || 0;
    if (c === 'category') return cat(p.catId);
    if (c === 'location') return loc(p.locId);
    if (c === 'link') return p.link || '';
    if (c === 'notes') return p.notes || '';
    if (c === 'suppliers') return (p.suppliers || []).map(s => suppById(s.suppId)?.name || '').filter(Boolean).join(', ');
    if (c === 'price') {
      const prices = (p.suppliers || []).map(s => s.price).filter(Boolean);
      return prices.length ? Math.min(...prices) : '';
    }
    return '';
  });
}

function updateExportPreview() {
  const cols = getExportCols();
  const list = getExportParts().slice(0, 3);
  const fmt = document.getElementById('exportFmt')?.value || 'csv';
  if (fmt === 'csv') {
    const rows = [cols, ...list.map(p => partToRow(p, cols))];
    document.getElementById('exportPreview').textContent = rows.map(r => r.map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',')).join('\n');
  } else {
    document.getElementById('exportPreview').textContent = JSON.stringify(list.slice(0, 1), null, 2).substring(0, 200) + '…';
  }
}

function doExport() {
  const cols = getExportCols();
  const list = getExportParts();
  const fmt = document.getElementById('exportFmt').value;
  const now = new Date().toISOString().slice(0, 10);
  let content, mime, filename;

  if (fmt === 'csv') {
    const rows = [cols, ...list.map(p => partToRow(p, cols))];
    content = '\uFEFF' + rows.map(r => r.map(v => {
      const s = String(v == null ? '' : v);
      return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')).join('\r\n');
    mime = 'text/csv;charset=utf-8';
    filename = `inventaris_${now}.csv`;
  } else {
    content = JSON.stringify({ exported: now, parts: list }, null, 2);
    mime = 'application/json';
    filename = `inventaris_${now}.json`;
  }

  const blob = new Blob([content], { type: mime });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(`✓ ${filename} gedownload (${list.length} onderdelen)`);
  closeExport();
}

// ── ARCHIEF ────────────────────────────────────────────────
function toggleArchived() {
  _showArchived = !_showArchived;
  const btn = document.getElementById('archiveToggleBtn');
  btn.style.background = _showArchived ? 'var(--acc)' : '';
  btn.style.color = _showArchived ? '#000' : '';
  btn.textContent = _showArchived ? '📦 Archief ✓' : '📦 Archief';
  renderSidebar(); renderTable();
  if (_showArchived) toast(`📦 ${parts.filter(p => p.active === false).length} gearchiveerde onderdelen zichtbaar`);
}

// ── VASTZETTEN (PINNEN) ───────────────────────────────────────
function togglePin(id) {
  if (_pinned.has(id)) _pinned.delete(id);
  else _pinned.add(id);
  localStorage.setItem('hb_pinned', JSON.stringify([..._pinned]));
  renderTable();
  toast(_pinned.has(id) ? '📌 Vastgezet' : 'Losgemaakt');
}

// ── INLINE VOORRAAD AANPASSING ────────────────────────────────
function inlineStockEdit(e, id) {
  e.stopPropagation();
  const span = e.target;
  const p = parts.find(x => x.id === id); if (!p) return;
  const input = document.createElement('input');
  input.type = 'number'; input.className = 'inline-stock';
  input.value = p.stock || 0; input.min = 0;
  span.replaceWith(input);
  input.focus(); input.select();
  async function commit() {
    const v = parseInt(input.value);
    if (!isNaN(v) && v >= 0 && v !== (p.stock || 0)) {
      const before = p.stock || 0;
      const r = await api(`/api/parts/${id}/stock`, 'PATCH', { set: v });
      p.stock = r.stock;
      undoStock(p, before);
    }
    renderTable();
  }
  input.addEventListener('blur', commit);
  input.addEventListener('keydown', e2 => {
    if (e2.key === 'Enter') input.blur();
    if (e2.key === 'Escape') { renderTable(); }
    e2.stopPropagation();
  });
}

// ── SPARKLINE VOORRAAD ────────────────────────────────────────
function drawSparkline(history, partId) {
  const entries = history.filter(h => h.partId === partId).slice(-50);
  if (entries.length < 2) return '<div style="font-size:11px;color:var(--text3);padding:8px 0">Nog geen historische data</div>';
  const vals = entries.map(h => h.to);
  const min = Math.min(...vals, 0), max = Math.max(...vals, 1);
  const range = max - min || 1;
  const W = 480, H = 80, padX = 32, padY = 8;
  const pts = vals.map((v, i) => {
    const x = padX + (i / (vals.length - 1)) * (W - padX * 2);
    const y = H - padY - (v - min) / range * (H - padY * 2);
    return [x, y];
  });
  const last = vals[vals.length - 1];
  const col = last === 0 ? 'var(--text3)' : last < 5 ? 'var(--red)' : last <= 10 ? 'var(--orange)' : 'var(--green)';
  // Area fill path
  const areaPath = `M${pts[0][0]},${H - padY} ` + pts.map(([x, y]) => `L${x},${y}`).join(' ') + ` L${pts[pts.length - 1][0]},${H - padY} Z`;
  // Y-axis labels
  const yLabels = [min, Math.round((min + max) / 2), max].map((v, i) => {
    const y = H - padY - (v - min) / range * (H - padY * 2);
    return `<text x="${padX - 4}" y="${y + 3}" font-size="8" fill="var(--text3)" text-anchor="end">${v}</text>
<line x1="${padX}" y1="${y}" x2="${W - padX}" y2="${y}" stroke="var(--border)" stroke-width="0.5" stroke-dasharray="3,3"/>`;
  }).join('');
  // Inkoop markers (delta > 0)
  const inkMarkers = entries.map((h, i) => h.delta > 0
    ? `<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="3.5" fill="var(--green)" stroke="var(--bg)" stroke-width="1"><title>+${h.delta} inkoop • ${new Date(h.ts).toLocaleDateString(HB_LOCALE)}: ${h.to} st</title></circle>`
    : `<circle cx="${pts[i][0]}" cy="${pts[i][1]}" r="2" fill="${col}" opacity="0.6"><title>${h.delta > 0 ? '+' : ''}${h.delta} • ${new Date(h.ts).toLocaleDateString(HB_LOCALE)}: ${h.to} st</title></circle>`
  ).join('');
  const dateFirst = new Date(entries[0].ts).toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short' });
  const dateLast = new Date(entries[entries.length - 1].ts).toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short' });
  return `<div style="position:relative">
  <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:80px;overflow:visible">
${yLabels}
<path d="${areaPath}" fill="${col}" opacity="0.08"/>
<polyline points="${pts.map(([x, y]) => x + ',' + y).join(' ')}" fill="none" stroke="${col}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
${inkMarkers}
<text x="${padX}" y="${H + 10}" font-size="8" fill="var(--text3)">${dateFirst}</text>
<text x="${W - padX}" y="${H + 10}" font-size="8" fill="var(--text3)" text-anchor="end">${dateLast}</text>
  </svg>
  <div style="font-size:10px;color:var(--text3);margin-top:4px;display:flex;gap:12px">
<span>${entries.length} mutaties</span>
<span style="color:var(--green)">&#11044; inkoop</span>
<span>Huidig: <b style="color:${col}">${last} st</b></span>
<span>Min: ${min} | Max: ${max}</span>
  </div>
</div>`;
}

// ── DATASHEET ZOEKEN ─────────────────────────────────────────
async function searchDatasheets() {
  const q = document.getElementById('dsQuery').value.trim();
  if (!q) return;
  const el = document.getElementById('dsResults');
  el.innerHTML = '<div style="font-size:12px;color:var(--text3)"><i class="spin">⟳</i> Zoeken…</div>';

  // Build search links for multiple sources
  const encoded = encodeURIComponent(q);
  const sources = [
    { name: 'Octopart', url: `https://octopart.com/search?q=${encoded}&currency=EUR`, desc: 'Grootste componentendatabase' },
    { name: 'Datasheet.live', url: `https://www.datasheets.com/search.aspx?query=${encoded}`, desc: 'Directe PDF links' },
    { name: 'AllDatasheet', url: `https://www.alldatasheet.com/view.jsp?Searchword=${encoded}`, desc: 'Gratis datasheets' },
    { name: 'component905', url: `https://componentsearchengine.com/search.aspx?q=${encoded}`, desc: '+ footprints & 3D models' },
    { name: 'SparkFun', url: `https://www.sparkfun.com/search/results?term=${encoded}`, desc: 'Modules & breakouts' },
  ];

  // Also try to fetch from a CORS-friendly source
  // Use component.cloud / alldatasheet via a simple URL approach
  el.innerHTML = `
<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Klik om te openen in een nieuw venster:</div>
<div style="display:flex;flex-direction:column;gap:5px">
  ${sources.map(s => `
    <a href="${esc(s.url)}" target="_blank" style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--bg);border:1px solid var(--border);border-radius:4px;text-decoration:none;transition:border-color .15s" onmouseover="this.style.borderColor='var(--acc2)'" onmouseout="this.style.borderColor='var(--border)'">
      <span style="font-size:13px;font-weight:600;color:var(--acc2)">${esc(s.name)}</span>
      <span style="font-size:11px;color:var(--text3);flex:1">${esc(s.desc)}</span>
      <span style="font-size:11px;color:var(--text3)">↗</span>
    </a>`).join('')}
</div>
<div style="margin-top:10px;padding:8px 10px;background:var(--surf2);border-radius:4px;font-size:11px;color:var(--text2)">
  💡 Vond je de datasheet? Download de PDF en upload hem via de knop hieronder.
</div>`;
}

// ── MEDIA BROWSER ─────────────────────────────────────────────
let _mediaFiles = [], _mediaFilter = 'all', _mediaDetFile = null;

async function openMediaModal() {
  document.getElementById('mediaOvl').classList.add('open');
  await loadMedia();
}
function closeMediaModal() { document.getElementById('mediaOvl').classList.remove('open'); }

async function loadMedia() {
  document.getElementById('mediaGrid').innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:30px;color:var(--text3)"><i class="spin">⟳</i> Laden…</div>';
  try {
    _mediaFiles = await api('/api/media');
    renderMediaGrid();
  } catch (e) { document.getElementById('mediaGrid').innerHTML = '<p style="color:var(--red)">Fout: ' + esc(e.message) + '</p>'; }
}

const LARGE_THRESHOLD = 500 * 1024; // 500KB

function setMediaFilter(f) {
  _mediaFilter = f;
  ['all', 'img', 'pdf', 'orphan', 'large'].forEach(t => document.getElementById('mftab-' + t)?.classList.toggle('active', t === f));
  document.getElementById('bulkResizeBtn').style.display = f === 'large' ? '' : 'none';
  renderMediaGrid();
}

function formatBytes(b) {
  if (b < 1024) return b + 'B';
  if (b < 1048576) return (b / 1024).toFixed(1) + 'KB';
  return (b / 1048576).toFixed(1) + 'MB';
}

function renderMediaGrid() {
  const imgs = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  let list = _mediaFiles;
  if (_mediaFilter === 'img') list = list.filter(f => imgs.includes(f.ext));
  else if (_mediaFilter === 'pdf') list = list.filter(f => f.ext === '.pdf');
  else if (_mediaFilter === 'orphan') list = list.filter(f => !f.used_by?.length);
  else if (_mediaFilter === 'large') list = list.filter(f => imgs.includes(f.ext) && f.size > LARGE_THRESHOLD);

  const total = _mediaFiles.length;
  const totalSize = _mediaFiles.reduce((s, f) => s + f.size, 0);
  const largeCount = _mediaFiles.filter(f => imgs.includes(f.ext) && f.size > LARGE_THRESHOLD).length;
  document.getElementById('mediaStat').textContent =
    `${total} bestanden • ${formatBytes(totalSize)}` +
    (largeCount > 0 ? ` • <span style="color:var(--orange)">${largeCount} te groot</span>` : '');
  document.getElementById('mediaStat').innerHTML = document.getElementById('mediaStat').textContent;

  // Update large tab label
  const largeTab = document.getElementById('mftab-large');
  if (largeTab) largeTab.textContent = `📦 Te groot${largeCount > 0 ? ` (${largeCount})` : ''}`;

  if (!list.length) {
    document.getElementById('mediaGrid').innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text3)">${_mediaFilter === 'large' ? '✅ Geen grote bestanden gevonden' : 'Geen bestanden gevonden'}</div>`;
    return;
  }

  const isImg = f => imgs.includes(f.ext);
  document.getElementById('mediaGrid').innerHTML = list.map(f => {
    const isLarge = f.size > LARGE_THRESHOLD;
    const sizeColor = f.size > 1024 * 1024 ? 'var(--red)' : isLarge ? 'var(--orange)' : 'var(--text3)';
    const dimStr = f.width && f.height ? `${f.width}×${f.height}` : '';
    return `<div class="media-item${!f.used_by?.length ? ' orphan' : ''}" onclick="openMediaDet('${esc(f.name)}')">
  ${isImg(f)
        ? `<img class="mi-thumb" src="${esc(f.url)}" loading="lazy">`
        : `<div class="mi-pdf">📄</div>`}
  <div class="mi-info">
    <div class="mi-name" title="${esc(f.name)}">${esc(f.name)}</div>
    <div class="mi-size" style="color:${sizeColor}">${isLarge ? '⚠ ' : ''}${formatBytes(f.size)}${dimStr ? ` • ${dimStr}` : ''}</div>
    ${f.used_by?.length
        ? `<div class="mi-used">✓ ${f.used_by[0].name}${f.used_by.length > 1 ? ` +${f.used_by.length - 1}` : ''}</div>`
        : `<div class="mi-orphan">⚠ Niet gebruikt</div>`}
  </div>
</div>`;
  }).join('');
}

function openMediaDet(name) {
  _mediaDetFile = _mediaFiles.find(f => f.name === name);
  if (!_mediaDetFile) return;
  const f = _mediaDetFile;
  const imgs = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  document.getElementById('mediaDetTitle').textContent = f.name;
  // Preview
  document.getElementById('mediaDetPreview').innerHTML = imgs.includes(f.ext)
    ? `<img src="${esc(f.url)}" style="max-width:100%;max-height:200px;border-radius:var(--r);border:1px solid var(--border)">`
    : `<div style="font-size:48px;padding:20px">📄</div>`;
  // Info
  const usedBy = f.used_by?.length
    ? f.used_by.map(p => `<a onclick="closeMediaModal();closeMediaDet();selPart(${p.id})" style="color:var(--acc2);cursor:pointer">${esc(p.name)}</a>`).join(', ')
    : '<span style="color:var(--orange)">Niet gebruikt</span>';
  document.getElementById('mediaDetInfo').innerHTML = `
<div class="dr"><span class="dl">Bestandsnaam</span><span class="dv" style="font-size:11px">${esc(f.name)}</span></div>
<div class="dr"><span class="dl">Grootte</span><span class="dv">${formatBytes(f.size)}</span></div>
${f.width && f.height ? `<div class="dr"><span class="dl">Afmetingen</span><span class="dv">${f.width}×${f.height}px</span></div>` : ''}
<div class="dr"><span class="dl">Gebruikt door</span><span class="dv">${usedBy}</span></div>`;
  // Show/hide resize for images only
  document.getElementById('mediaDetResize').style.display = imgs.includes(f.ext) ? '' : 'none';
  document.getElementById('mediaDetOvl').classList.add('open');
}
function closeMediaDet() { document.getElementById('mediaDetOvl').classList.remove('open'); }

async function doResize() {
  if (!_mediaDetFile) return;
  const maxSize = parseInt(document.getElementById('resizeSize').value);
  const btn = document.getElementById('resizeBtn');
  btn.disabled = true; btn.textContent = '⟳ Bezig…';
  try {
    const r = await api('/api/media/resize', 'POST', { filename: _mediaDetFile.name, maxSize });
    if (r.ok) {
      if (r.already_small) {
        toast(`ℹ ${r.message}`);
      } else {
        const saved = _mediaDetFile.size - r.size;
        toast(r.message || `✓ ${r.width}×${r.height}px — ${formatBytes(r.size)}${saved > 0 ? ` (${formatBytes(saved)} bespaard)` : ''}`);
        _mediaDetFile.size = r.size;
        _mediaDetFile.width = r.width;
        _mediaDetFile.height = r.height;
      }
      await loadMedia();
      closeMediaDet();
    } else {
      toast('⚠ ' + r.error);
    }
  } catch (e) { toast('⚠ Fout: ' + e.message); }
  finally { btn.disabled = false; btn.textContent = '⚙ Verkleinen'; }
}

async function bulkResize() {
  const imgs = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const large = _mediaFiles.filter(f => imgs.includes(f.ext) && f.size > LARGE_THRESHOLD);
  if (!large.length) { toast('Geen grote afbeeldingen gevonden'); return; }
  if (!confirm(`${large.length} afbeelding${large.length === 1 ? '' : 'en'} comprimeren/verkleinen naar max 800px?\n\nBestanden boven 500KB worden geoptimaliseerd.\nDit overschrijft de originelen.`)) return;

  const btn = document.getElementById('bulkResizeBtn');
  btn.disabled = true;
  let done = 0, failed = 0, savedBytes = 0;
  for (const f of large) {
    btn.textContent = `⚙ ${done + 1}/${large.length}…`;
    try {
      const r = await api('/api/media/resize', 'POST', { filename: f.name, maxSize: 800 });
      if (r.ok) {
        const before = f.size;
        if (r.size) savedBytes += Math.max(0, before - r.size);
      } else {
        failed++;
      }
    } catch (e) { failed++; }
    done++;
  }
  btn.disabled = false;
  btn.textContent = '⚙ Alles verkleinen';
  const msg = savedBytes > 1024
    ? `✓ ${done} bestanden verwerkt — ${formatBytes(savedBytes)} bespaard`
    : `✓ ${done} bestanden verwerkt`;
  toast(failed > 0 ? msg + ` (${failed} mislukt)` : msg);
  await loadMedia();
}

async function deleteMediaFile() {
  if (!_mediaDetFile) return;
  const f = _mediaDetFile;
  const inUse = f.used_by?.length > 0;
  const msg = inUse
    ? `"${f.name}" wordt gebruikt door ${f.used_by.map(p => p.name).join(', ')}. Toch verwijderen?\n\nHet onderdeel verliest zijn afbeelding.`
    : `Verwijder "${f.name}"?`;
  if (!confirm(msg)) return;
  await api(`/api/upload/${encodeURIComponent(f.name)}?force=1`, 'DELETE');
  // If used by a part, clear its img field
  if (inUse) {
    for (const u of f.used_by) {
      const p = parts.find(x => x.id === u.id);
      if (p && p.img && p.img.endsWith(f.name)) {
        const updated = await api(`/api/parts/${p.id}`, 'PUT', { ...p, img: '' });
        const i = parts.findIndex(x => x.id === p.id); if (i >= 0) parts[i] = updated;
      }
    }
    renderTable();
  }
  toast(`🗑 ${f.name} verwijderd`);
  closeMediaDet();
  await loadMedia();
}

async function deleteOrphans() {
  const pre = await api('/api/media/orphans');
  if (!pre.count) { toast(pre.skipped_recent.length ? `Niets te verwijderen (${pre.skipped_recent.length} recent geüpload, wacht ${pre.grace_min} min)` : 'Geen ongebruikte bestanden'); return; }
  const list = pre.files.slice(0, 15).map(f => '• ' + f.name + ' (' + formatSize(f.size) + ')').join('\n') + (pre.count > 15 ? `\n… en ${pre.count - 15} meer` : '');
  if (!confirm(`${pre.count} ongebruikte bestanden (${formatSize(pre.size)}) verwijderen?\n\n${list}`)) return;
  const r = await api('/api/media/orphans', 'DELETE');
  toast(`🗑 ${r.count} bestand${r.count === 1 ? '' : 'en'} verwijderd`);
  await loadMedia();
}

// ── KAST / LOCATION BROWSER ──────────────────────────────────
const KAST_ROOTS = [
  { id: 1, name: 'Kast 0', icon: '🗄', children: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { id: 11, name: 'Kast 1', icon: '🗄', children: [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44] },
  { id: 45, name: 'Kast 2', icon: '🗄', children: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 146] },
  { id: 78, name: 'Kast 3', icon: '🗄', children: [79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 145, 147] },
  { id: 110, name: 'Kast 4', icon: '🗄', children: [111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140] },
  { id: 141, name: 'Kast 6', icon: '🗄', children: [142, 143, 144] },
  { id: 152, name: 'Hok', icon: '🏠', children: [153, 154, 155, 156, 157] },
  { id: 148, name: 'Huis', icon: '🏡', children: [149, 150, 158] },
  { id: 151, name: 'Inpak materiaal', icon: '📦', children: [] },
];

let _kastHistory = []; // stack for back navigation

function openKastModal() {
  _kastHistory = [];
  kastShowRoot();
  document.getElementById('kastOvl').classList.add('open');
}
function closeKastModal() {
  document.getElementById('kastOvl').classList.remove('open');
}
function kastGoBack() {
  if (_kastHistory.length === 0) { kastShowRoot(); return; }
  const prev = _kastHistory.pop();
  if (prev.type === 'root') kastShowRoot();
  else if (prev.type === 'kast') kastShowKast(prev.id, false);
}

function kastShowRoot() {
  _kastHistory = [];
  _kastPrintId = null;
  document.getElementById('kastPrintBtn').style.display = 'none';
  document.getElementById('kastBack').style.display = 'none';
  document.getElementById('kastTitle').textContent = '🗄 Kasten & Vakken';
  document.getElementById('kastBreadcrumb').style.display = 'none';
  document.getElementById('kastRootView').style.display = '';
  document.getElementById('kastVakView').style.display = 'none';
  document.getElementById('kastPartsView').style.display = 'none';

  // Build root kast grid — including custom locations as extra "kast"
  const allRoots = [...KAST_ROOTS];
  // Add custom root locations (those without a slash in name)
  Object.entries(customLocs).forEach(([id, name]) => {
    if (!name.includes('/')) allRoots.push({ id: parseInt(id) || id, name, icon: '📍', children: [] });
  });

  const grid = document.createElement('div');
  grid.className = 'kast-grid';
  allRoots.forEach(k => {
    // Count parts in this kast (root + all children)
    const allIds = [k.id, ...k.children];
    // Also include custom child locs
    Object.entries(customLocs).forEach(([cid, cname]) => {
      if (cname.startsWith(k.name + '/')) allIds.push(parseInt(cid) || cid);
    });
    const count = parts.filter(p => p.active !== false && allIds.some(lid => String(p.locId) === String(lid))).length;
    const card = document.createElement('div');
    card.className = 'kast-card' + (count > 0 ? ' has-parts' : '');
    card.innerHTML = `<div class="kc-icon">${k.icon}</div><div class="kc-name">${esc(k.name)}</div><div class="kc-count">${count > 0 ? count + ' onderdelen' : 'leeg'}</div>`;
    card.onclick = () => kastShowKast(k.id);
    grid.appendChild(card);
  });
  document.getElementById('kastRootView').innerHTML = '';
  document.getElementById('kastRootView').appendChild(grid);
}

function kastShowKast(kastId, pushHistory = true) {
  if (pushHistory) _kastHistory.push({ type: 'root' });
  _kastPrintId = kastId;
  document.getElementById('kastPrintBtn').style.display = '';
  const kastDef = KAST_ROOTS.find(k => k.id === kastId) || { id: kastId, name: LOCS[kastId] || kastId, icon: '📍', children: [] };

  // Also include custom children
  const allChildren = [...kastDef.children];
  Object.entries(LOCS).forEach(([cid, cname]) => {
    if (cname.startsWith(kastDef.name + '/') && !allChildren.includes(parseInt(cid))) {
      allChildren.push(parseInt(cid) || cid);
    }
  });

  // Parts directly in the kast (no sub-location)
  const directParts = parts.filter(p => p.active !== false && String(p.locId) === String(kastId));

  document.getElementById('kastBack').style.display = '';
  document.getElementById('kastTitle').textContent = kastDef.icon + ' ' + kastDef.name;
  document.getElementById('kastBreadcrumb').style.display = '';
  document.getElementById('kastBreadLoc').textContent = kastDef.name;
  document.getElementById('kastBreadSep').textContent = ' › ';
  document.getElementById('kastRootView').style.display = 'none';
  document.getElementById('kastVakView').style.display = '';
  document.getElementById('kastPartsView').style.display = 'none';

  const container = document.getElementById('kastVakView');
  container.innerHTML = '';

  // If kast has vakken
  if (allChildren.length > 0) {
    // Header count
    const totalInKast = parts.filter(p => p.active !== false && (String(p.locId) === String(kastId) || allChildren.some(c => String(p.locId) === String(c)))).length;
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-size:12px;color:var(--text2);margin-bottom:10px';
    hdr.textContent = `${allChildren.length} vakken • ${totalInKast} onderdelen totaal`;
    container.appendChild(hdr);

    const grid = document.createElement('div');
    grid.className = 'vak-grid';
    allChildren.sort((a, b) => (LOCS[a] || '').localeCompare(LOCS[b] || '', 'nl')).forEach(vakId => {
      const vakName = LOCS[vakId] || String(vakId);
      const shortName = vakName.includes('/') ? vakName.split('/').pop() : vakName;
      const count = parts.filter(p => p.active !== false && String(p.locId) === String(vakId)).length;
      const card = document.createElement('div');
      card.className = 'vak-card ' + (count > 0 ? 'filled' : 'empty');
      card.innerHTML = `<div class="vc-name">${esc(shortName)}</div><div class="vc-count">${count > 0 ? count + '×' : 'leeg'}</div>`;
      card.onclick = () => kastShowVak(vakId, kastId);
      // Drop target for drag
      card.addEventListener('dragover', e => { e.preventDefault(); card.classList.add('drag-over'); });
      card.addEventListener('dragleave', () => card.classList.remove('drag-over'));
      card.addEventListener('drop', async e => {
        e.preventDefault(); card.classList.remove('drag-over');
        if (_dragPartId === null) return;
        const p = parts.find(x => x.id === _dragPartId); if (!p) return;
        const updated = await api(`/api/parts/${_dragPartId}`, 'PUT', { ...p, locId: parseInt(vakId) || vakId });
        const i = parts.findIndex(x => x.id === _dragPartId); if (i >= 0) parts[i] = updated;
        renderTable();
        toast(`✓ ${p.name} → ${esc(shortName)}`);
        // Refresh kast view
        kastShowKast(kastId, false);
      });
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  // Direct parts (no sub-vak)
  if (directParts.length > 0) {
    const hdr = document.createElement('div');
    hdr.style.cssText = 'font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin:' + (allChildren.length > 0 ? '14px' : '0') + 'px 0 8px';
    hdr.textContent = 'Direct in ' + kastDef.name;
    container.appendChild(hdr);
    container.appendChild(buildPartsList(directParts));
  }

  if (allChildren.length === 0 && directParts.length === 0) {
    container.innerHTML = '<div class="empty"><div class="big">📭</div><p>Geen onderdelen in deze locatie</p></div>';
  }
}

function kastShowVak(vakId, parentKastId) {
  _kastHistory.push({ type: 'kast', id: parentKastId });
  const vakName = LOCS[vakId] || String(vakId);
  const shortName = vakName.includes('/') ? vakName.split('/').pop() : vakName;
  const vakParts = parts.filter(p => p.active !== false && String(p.locId) === String(vakId));

  document.getElementById('kastBack').style.display = '';
  document.getElementById('kastTitle').textContent = '📦 ' + shortName;
  const kastDef = KAST_ROOTS.find(k => k.id === parentKastId) || { name: LOCS[parentKastId] || '' };
  document.getElementById('kastBreadLoc').textContent = kastDef.name + ' › ' + shortName;
  document.getElementById('kastVakView').style.display = 'none';
  document.getElementById('kastPartsView').style.display = '';

  const container = document.getElementById('kastPartsView');
  container.innerHTML = '';

  // Header with vak name edit button
  const hdr = document.createElement('div');
  hdr.style.cssText = 'font-size:12px;color:var(--text2);margin-bottom:10px;display:flex;align-items:center;justify-content:space-between';
  hdr.innerHTML = `<span>${vakParts.length} ${vakParts.length === 1 ? 'onderdeel' : 'onderdelen'} in ${esc(shortName)}</span>
<button class="abtn" onclick="inlineEditLocInKast('${vakId}')" style="font-size:11px">✏ Naam</button>`;
  container.appendChild(hdr);

  if (!vakParts.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.innerHTML = '<div class="big">📭</div><p>Dit vak is leeg</p>';
    container.appendChild(empty);
  } else {
    container.appendChild(buildPartsList(vakParts, vakId, parentKastId));
  }
}

// Inline rename a vak from inside the kastPartsView
async function inlineEditLocInKast(vakId) {
  const vakName = LOCS[vakId] || String(vakId);
  const shortName = vakName.includes('/') ? vakName.split('/').pop() : vakName;
  const newShort = prompt('Nieuwe naam voor dit vak:', shortName);
  if (!newShort || newShort === shortName) return;
  const prefix = vakName.includes('/') ? vakName.substring(0, vakName.lastIndexOf('/') + 1) : '';
  const newName = prefix + newShort.trim();
  const r = await api('/api/locations/rename', 'POST', { id: vakId, name: newName });
  customLocs[vakId] = r.name; LOCS[vakId] = r.name;
  toast(`✓ Hernoemd naar "${newShort}"`);
  fillSels();
  // Refresh view
  const prev = _kastHistory[_kastHistory.length - 1];
  kastShowVak(vakId, prev?.id);
}

// Move part to a different location
async function movePart(partId, currentVakId, parentKastId) {
  const kastDef = KAST_ROOTS.find(k => k.id === parentKastId) || { id: parentKastId, name: LOCS[parentKastId] || '', children: [] };
  const allChildren = [...kastDef.children];
  Object.entries(LOCS).forEach(([cid, cname]) => {
    if (cname.startsWith(kastDef.name + '/') && !allChildren.includes(parseInt(cid))) allChildren.push(parseInt(cid) || cid);
  });
  // Also add all other locations as options
  const allLocs = Object.entries(LOCS).sort((a, b) => a[1].localeCompare(b[1], 'nl'));
  const p = parts.find(x => x.id === partId);
  if (!p) return;

  // Build a quick select dialog
  const sel = document.createElement('select');
  sel.style.cssText = 'width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:"JetBrains Mono",monospace;font-size:13px;padding:8px 10px;outline:none;margin-bottom:10px';
  sel.innerHTML = '<option value="">— geen locatie —</option>' + allLocs.map(([id, name]) => `<option value="${id}" ${String(id) === String(currentVakId) ? 'selected' : ''}>${esc(name)}</option>`).join('');

  const dlg = document.createElement('div');
  dlg.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:500;display:flex;align-items:center;justify-content:center';
  dlg.innerHTML = `<div style="background:var(--surf);border:1px solid var(--border);border-radius:10px;padding:20px;width:360px;max-width:95vw">
<div style="font-size:14px;font-weight:700;margin-bottom:4px">${esc(p.name)}</div>
<div style="font-size:12px;color:var(--text2);margin-bottom:12px">Verplaats naar locatie:</div>
<div id="moveDlgSel"></div>
<div style="display:flex;gap:8px;justify-content:flex-end">
  <button class="btn sec" id="moveDlgCancel" style="font-size:12px">Annuleer</button>
  <button class="btn" id="moveDlgOk" style="font-size:12px">Verplaatsen</button>
</div>
  </div>`;
  document.body.appendChild(dlg);
  document.getElementById('moveDlgSel').appendChild(sel);
  document.getElementById('moveDlgCancel').onclick = () => dlg.remove();
  document.getElementById('moveDlgOk').onclick = async () => {
    const newLocId = sel.value ? parseInt(sel.value) || sel.value : null;
    const updated = await api(`/api/parts/${partId}`, 'PUT', { ...p, locId: newLocId });
    const i = parts.findIndex(x => x.id === partId); if (i >= 0) parts[i] = updated;
    dlg.remove();
    renderTable();
    toast(`✓ ${p.name} verplaatst naar ${newLocId ? LOCS[newLocId] : 'geen locatie'}`);
    // Refresh vak view
    kastShowVak(currentVakId, parentKastId);
  };
}

let _dragPartId = null, _dragFromVak = null, _dragFromKast = null;

function buildPartsList(list, vakId = null, parentKastId = null) {
  const wrap = document.createElement('div');
  list.sort((a, b) => a.name.localeCompare(b.name, 'nl')).forEach(p => {
    const q = p.stock || 0, qc = qClass(q, p.minStock);
    const row = document.createElement('div');
    row.className = 'kast-part-row';
    row.draggable = !!vakId;
    row.innerHTML = `
  ${p.img ? `<img class="kpr-img" src="${esc(p.img)}">` : `<div class="kpr-ph">📦</div>`}
  <div style="flex:1;min-width:0">
    <div class="kpr-name">${esc(p.name)}</div>
    <div class="kpr-sub">${esc(p.IPN || p.desc || '')}</div>
  </div>
  <span class="kpr-qty ${qc}">${q}</span>
  ${vakId ? `<button class="kpr-move" onclick="event.stopPropagation();movePart(${p.id},'${vakId}',${parentKastId})" title="Verplaatsen">⇄</button>` : ''}`;
    row.onclick = (e) => { if (e.target.classList.contains('kpr-move')) return; closeKastModal(); selPart(p.id); };
    // Drag events
    if (vakId) {
      row.addEventListener('dragstart', e => {
        _dragPartId = p.id; _dragFromVak = vakId; _dragFromKast = parentKastId;
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      row.addEventListener('dragend', () => row.classList.remove('dragging'));
    }
    wrap.appendChild(row);
  });
  return wrap;
}

// ── QR LABEL PRINTING ────────────────────────────────────────
// Uses qrcodegen library (pure JS, no dependencies)
const QR_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
let _qrLoaded = false;
let _selectedLabels = new Set();
let _printParts = [];

function loadQRLib() {
  return new Promise((res, rej) => {
    if (_qrLoaded) { res(); return; }
    // Use a simple QR generation via a canvas-based approach
    // We'll use the QR code API from a data URL generator
    _qrLoaded = true; res();
  });
}

// Simple QR code generator using canvas + fetch to a QR API
// Works offline via a tiny inline QR lib
function makeQR(text, canvas, size) {
  // Use Google Charts QR API as primary (needs internet)
  // Fallback: draw text placeholder
  const ctx = canvas.getContext('2d');
  canvas.width = size; canvas.height = size;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => { ctx.drawImage(img, 0, 0, size, size); };
  img.onerror = () => {
    // Fallback: draw simple grid pattern as placeholder
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#000';
    ctx.font = `${Math.floor(size / 8)}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('QR', size / 2, size / 2 + 4);
  };
  img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=0`;
}

function getLabelText(p) {
  const content = document.getElementById('labelContent')?.value || 'url';
  if (content === 'url') return getAppBaseUrl() + '?part=' + p.id;
  if (content === 'ipn') return p.IPN || p.name;
  if (content === 'id') return String(p.id);
  return p.name;
}

function openPrintModal(singleId = null, bulkIds = null) {
  _selectedLabels = new Set();
  if (bulkIds) {
    document.getElementById('labelSelection').value = 'selected';
    window._bulkPrintIds = bulkIds;
  } else {
    document.getElementById('labelSelection').value = singleId ? 'single' : 'all';
    window._bulkPrintIds = null;
  }
  window._singlePrintId = singleId;
  renderLabelPreview();
  document.getElementById('printOvl').classList.add('open');
}

function printSingle(id) {
  openPrintModal(id);
}

function showPartQr(id) {
  const p = parts.find(x => x.id === id); if (!p) return;
  const url = getAppBaseUrl() + '?part=' + p.id;
  const urlIpn = p.IPN ? getAppBaseUrl() + '?part=' + encodeURIComponent(p.IPN) : '';
  document.getElementById('partQrOvl')?.remove();
  const ovl = document.createElement('div');
  ovl.id = 'partQrOvl';
  ovl.className = 'overlay open';
  ovl.style.zIndex = '600';
  ovl.innerHTML = `<div class="modal" style="width:340px;text-align:center">
    <div class="mhdr">
      <h3>QR &mdash; ${esc(p.name)}</h3>
      <button class="xcls" onclick="document.getElementById('partQrOvl').remove()">&#10005;</button>
    </div>
    <div class="mbdy" style="padding:16px 20px;display:flex;flex-direction:column;align-items:center;gap:12px">
      <div id="partQrCanvas" style="background:#fff;padding:10px;border-radius:8px;display:inline-block"></div>
      <div style="font-size:11px;color:var(--text3);word-break:break-all">${esc(url)}</div>
      ${p.IPN ? '<div style="font-size:11px;color:var(--text3)">of via IPN: <b>' + esc(p.IPN) + '</b></div>' : ''}
      <div style="font-size:12px;color:var(--text2);text-align:left;width:100%;padding:8px 10px;background:var(--surf2);border-radius:6px;border:1px solid var(--border)">
        <div><b>${esc(p.name)}</b></div>
        <div style="color:var(--text3);font-size:11px">${esc(p.desc || '')}</div>
        <div style="color:var(--text3);font-size:11px;margin-top:3px">Locatie: ${esc(loc(p.locId))} &bull; Voorraad: ${p.stock || 0} st</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn sec" onclick="navigator.clipboard?.writeText('${esc(url)}').then(()=>toast('URL gekopieerd'))" style="font-size:11px">&#128203; Kopieer URL</button>
        <button class="btn sec" onclick="partQrDownload()" style="font-size:11px">&#11015; PNG</button>
      </div>
    </div>
  </div>`;
  ovl.addEventListener('click', e => { if (e.target === ovl) ovl.remove(); });
  document.body.appendChild(ovl);
  setTimeout(() => {
    try {
      new QRCode(document.getElementById('partQrCanvas'), {
        text: url, width: 190, height: 190,
        colorDark: '#111318', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      document.getElementById('partQrCanvas').innerHTML = '<div style="color:var(--red);padding:14px">QR mislukt</div>';
    }
  }, 50);
}

function partQrDownload() {
  const canvas = document.querySelector('#partQrCanvas canvas');
  if (!canvas) { toast('Geen QR canvas'); return; }
  const a = document.createElement('a');
  a.download = 'part-qr.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}

function closePrintModal() {
  document.getElementById('printOvl').classList.remove('open');
}

function getPrintParts() {
  const sel = document.getElementById('labelSelection').value;
  if (sel === 'single' && window._singlePrintId) {
    return parts.filter(p => p.id === window._singlePrintId);
  }
  if (sel === 'filtered') return filtered();
  if (sel === 'selected') {
    const ids = window._bulkPrintIds || getSelectedIds();
    return ids.length ? parts.filter(p => ids.includes(p.id)) : filtered();
  }
  return parts.filter(p => p.active !== false);
}

function renderLabelPreview() {
  const size = document.getElementById('labelSize').value;
  const printParts = getPrintParts();
  _printParts = printParts;
  const preview = document.getElementById('labelPreview');
  document.getElementById('labelCount').textContent = `${printParts.length} labels`;

  preview.innerHTML = printParts.map((p, i) => `
<div class="label-card size-${size} ${_selectedLabels.has(p.id) ? 'sel' : ''}" onclick="toggleLabel(${p.id})" id="lcard-${p.id}">
  <canvas id="qrc-${p.id}" style="display:block"></canvas>
  <div class="label-name">${esc(p.name)}</div>
  ${p.IPN ? `<div class="label-sub">${esc(p.IPN)}</div>` : ''}
  <span class="label-check">✓</span>
</div>`).join('');

  // Generate QR codes
  const qrSize = size === 'small' ? 40 : size === 'medium' ? 56 : 80;
  printParts.forEach(p => {
    const canvas = document.getElementById('qrc-' + p.id);
    if (canvas) makeQR(getLabelText(p), canvas, qrSize);
  });
}

function toggleLabel(id) {
  if (_selectedLabels.has(id)) _selectedLabels.delete(id);
  else _selectedLabels.add(id);
  document.getElementById('lcard-' + id)?.classList.toggle('sel', _selectedLabels.has(id));
}

function printLabels() {
  const size = document.getElementById('labelSize').value;
  // Use selected labels if any, otherwise all preview labels
  const toPrint = _selectedLabels.size > 0
    ? _printParts.filter(p => _selectedLabels.has(p.id))
    : _printParts;

  if (!toPrint.length) { toast('Geen labels geselecteerd'); return; }

  const qrSize = size === 'small' ? 80 : size === 'medium' ? 120 : 160;
  const grid = document.getElementById('printGrid');

  // Build print page
  grid.innerHTML = toPrint.map(p => `
<div class="plabel size-${size}">
  <canvas id="pqr-${p.id}" style="display:block"></canvas>
  <div class="pname">${esc(p.name)}</div>
  ${p.IPN ? `<div class="psub">${esc(p.IPN)}</div>` : ''}
  ${loc(p.locId) !== '—' ? `<div class="psub">${esc(loc(p.locId))}</div>` : ''}
</div>`).join('');

  // Show print page
  document.getElementById('printPage').style.display = 'block';

  // Generate QR codes on print page
  let loaded = 0;
  toPrint.forEach(p => {
    const canvas = document.getElementById('pqr-' + p.id);
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      canvas.width = qrSize; canvas.height = qrSize;
      ctx.drawImage(img, 0, 0, qrSize, qrSize);
      loaded++;
      if (loaded === toPrint.length) setTimeout(() => window.print(), 300);
    };
    img.onerror = () => { loaded++; if (loaded === toPrint.length) setTimeout(() => window.print(), 300); };
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(getLabelText(p))}&format=png&margin=2`;
  });

  closePrintModal();
}

function closePrintPage() {
  document.getElementById('printPage').style.display = 'none';
}

// ── SUPPLIERS ─────────────────────────────────────────────────
function suppById(id) { return suppliers.find(s => s.id === parseInt(id) || String(s.id) === String(id)); }

function openSuppModal() {
  renderSuppList();
  document.getElementById('suppOvl').classList.add('open');
}
function closeSuppModal() { document.getElementById('suppOvl').classList.remove('open'); }

function renderSuppList() {
  if (!suppliers.length) { document.getElementById('suppList').innerHTML = '<p style="text-align:center;padding:20px;color:var(--text3)">Geen leveranciers</p>'; return; }
  document.getElementById('suppList').innerHTML = suppliers.map(s => `
<div class="supp-row">
  <div class="supp-dot" style="background:${esc(s.color || '#888')}"></div>
  <div style="flex:1;min-width:0">
    <div class="supp-name">${esc(s.name)}</div>
    ${s.url ? `<div class="supp-url">${esc(s.url)}</div>` : ''}
  </div>
  <button class="abtn" onclick="openEditSupp(${s.id})" style="font-size:11px">✏</button>
  <button class="abtn del" onclick="deleteSupp(${s.id})" style="font-size:11px">✕</button>
</div>`).join('');
}

function openAddSupp() {
  document.getElementById('suppFormTitle').textContent = 'Nieuwe leverancier';
  document.getElementById('suppEditId').value = '';
  document.getElementById('suppName').value = '';
  document.getElementById('suppUrl').value = '';
  document.getElementById('suppColor').value = '#888888';
  document.getElementById('suppColorHex').value = '#888888';
  document.getElementById('suppForm').style.display = '';
  setTimeout(() => document.getElementById('suppName').focus(), 50);
}
function openEditSupp(id) {
  const s = suppById(id); if (!s) return;
  document.getElementById('suppFormTitle').textContent = 'Leverancier bewerken';
  document.getElementById('suppEditId').value = id;
  document.getElementById('suppName').value = s.name;
  document.getElementById('suppUrl').value = s.url || '';
  document.getElementById('suppColor').value = s.color || '#888888';
  document.getElementById('suppColorHex').value = s.color || '#888888';
  document.getElementById('suppForm').style.display = '';
  setTimeout(() => document.getElementById('suppName').focus(), 50);
}
function cancelSuppForm() { document.getElementById('suppForm').style.display = 'none'; }

async function saveSupp() {
  const name = document.getElementById('suppName').value.trim();
  if (!name) { alert('Naam is verplicht'); return; }
  const btn = document.getElementById('suppSaveBtn'); btn.disabled = true;
  try {
    const editId = document.getElementById('suppEditId').value;
    const body = { name, url: document.getElementById('suppUrl').value.trim(), color: document.getElementById('suppColor').value };
    let s;
    if (editId) { s = await api(`/api/suppliers/${editId}`, 'PUT', body); const i = suppliers.findIndex(x => String(x.id) === String(editId)); if (i >= 0) suppliers[i] = s; else suppliers.push(s); }
    else { s = await api('/api/suppliers', 'POST', body); suppliers.push(s); }
    cancelSuppForm(); renderSuppList(); fillSuppSelects();
    toast(editId ? `✓ ${name} bijgewerkt` : `✓ ${name} toegevoegd`);
  } catch (e) { toast('⚠ ' + e.message); }
  finally { btn.disabled = false; }
}

async function deleteSupp(id) {
  const s = suppById(id); if (!s || !confirm(`Verwijder "${s.name}"?`)) return;
  await api(`/api/suppliers/${id}`, 'DELETE');
  suppliers = suppliers.filter(x => x.id !== id);
  // Remove from parts in memory
  parts.forEach(p => { p.suppliers = (p.suppliers || []).filter(x => x.suppId !== id); });
  renderSuppList(); renderTable(); toast('Leverancier verwijderd');
}

// ── SUPPLIER ROWS IN PART MODAL ───────────────────────────────
function fillSuppSelects() {
  // Rebuild all supplier dropdowns in the part modal
  document.querySelectorAll('.psupp-sel').forEach(sel => {
    const cur = sel.value;
    sel.innerHTML = '<option value="">— kies leverancier —</option>' +
      suppliers.map(s => `<option value="${s.id}" ${String(s.id) === String(cur) ? 'selected' : ''}>${esc(s.name)}</option>`).join('');
    sel.value = cur;
  });
}

function addSuppRow(data = {}) {
  const rowId = 'sr' + Date.now();
  const s = data.suppId ? suppById(data.suppId) : null;
  const row = document.createElement('div');
  row.className = 'psupp-row'; row.id = rowId;
  row.style.cssText = 'display:flex;flex-direction:column;gap:4px;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);padding:8px 10px;position:relative';
  row.innerHTML = `
<div style="display:flex;gap:6px;align-items:center">
  <div class="supp-dot" id="dot-${rowId}" style="background:${esc(s?.color || '#888')};flex-shrink:0"></div>
  <select class="psupp-sel" onchange="updateSuppDot('${rowId}',this)" style="flex:1">
    <option value="">— kies leverancier —</option>
    ${suppliers.map(su => `<option value="${su.id}" ${su.id === data.suppId ? 'selected' : ''}>${esc(su.name)}</option>`).join('')}
  </select>
  <button type="button" onclick="this.closest('.psupp-row').remove()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:0;line-height:1;flex-shrink:0">✕</button>
</div>
<div style="display:flex;gap:6px">
  <input type="text" placeholder="Artikelnr." value="${esc(data.sku || '')}" title="Artikelnummer" style="flex:1;min-width:0">
  <input type="number" placeholder="€ Prijs" value="${data.price || ''}" step="0.01" min="0" title="Prijs in euro" style="width:80px">
</div>
<div style="display:flex;gap:6px;align-items:center">
  <input type="url" class="supp-link" placeholder="https://... productlink" value="${esc(data.link || '')}" style="flex:1;min-width:0;font-size:11px" title="Directe productlink bij deze leverancier">
  ${data.link ? `<a href="${esc(data.link)}" target="_blank" class="supp-linkbtn" style="font-size:11px;color:var(--acc2);white-space:nowrap;text-decoration:none">↗ Open</a>` : '<span class="supp-linkbtn" style="display:none"></span>'}
</div>`;
  // Update open link button live
  row.querySelector('.supp-link').addEventListener('input', function () {
    const btn = row.querySelector('.supp-linkbtn');
    if (this.value.startsWith('http')) {
      btn.style.display = ''; btn.href = this.value; btn.textContent = '↗ Open';
    } else { btn.style.display = 'none'; }
  });
  document.getElementById('suppRows').appendChild(row);
}

function updateSuppDot(rowId, sel) {
  const s = suppById(parseInt(sel.value));
  document.getElementById('dot-' + rowId).style.background = s?.color || '#888';
  // Auto-fill supplier link if supplier has a default URL
  const suppLink = { '1': 'https://opencircuit.nl', '2': 'https://aliexpress.com', '3': 'https://reichelt.com', '7': 'https://mouser.com', '8': 'https://farnell.com', '9': 'https://digikey.com' };
  const row = sel.closest('.psupp-row');
  const linkInput = row?.querySelector('.supp-link');
  if (linkInput && !linkInput.value && suppLink[sel.value]) linkInput.placeholder = suppLink[sel.value] + '/...';
}

function getSuppRowsData() {
  return Array.from(document.querySelectorAll('.psupp-row')).map(row => {
    const selEl = row.querySelector('.psupp-sel');
    const inputs = row.querySelectorAll('input');
    const skuEl = inputs[0], priceEl = inputs[1], linkEl = inputs[2];
    const suppId = parseInt(selEl?.value) || null;
    if (!suppId) return null;
    return { suppId, sku: skuEl?.value.trim() || '', price: parseFloat(priceEl?.value) || null, link: linkEl?.value.trim() || '' };
  }).filter(Boolean);
}

function loadSuppRows(suppData = []) {
  document.getElementById('suppRows').innerHTML = '';
  (suppData || []).forEach(d => addSuppRow(d));
}

// ── INKOOPORDERS ─────────────────────────────────────────────
let orders = [], _currentOrder = null;

function fmtDate(d) {
  if (!d) return '—';
  const dt = new Date(d);
  return dt.toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysUntil(d) {
  if (!d) return null;
  const diff = Math.ceil((new Date(d) - new Date()) / (1000 * 86400));
  return diff;
}

async function openOrdersModal() {
  orders = await api('/api/orders');
  _currentOrder = null;
  document.getElementById('ordersBack').style.display = 'none';
  document.getElementById('ordersNewBtn').style.display = '';
  document.getElementById('ordersTitle').textContent = '📦 Inkooporders';
  document.getElementById('ordersFilter').style.display = '';
  document.getElementById('ordersListView').style.display = '';
  document.getElementById('ordersDetailView').style.display = 'none';
  document.getElementById('ordersOvl').classList.add('open');
  renderOrdersList();
}
function closeOrdersModal() { document.getElementById('ordersOvl').classList.remove('open'); }

function ordersGoBack() {
  _currentOrder = null;
  document.getElementById('ordersBack').style.display = 'none';
  document.getElementById('ordersNewBtn').style.display = '';
  document.getElementById('ordersTitle').textContent = '📦 Inkooporders';
  document.getElementById('ordersFilter').style.display = '';
  document.getElementById('ordersListView').style.display = '';
  document.getElementById('ordersDetailView').style.display = 'none';
  renderOrdersList();
}

function renderOrdersList() {
  const filter = document.getElementById('ordersFilter').value;
  let list = [...orders].sort((a, b) => b.id - a.id);
  if (filter === 'open') list = list.filter(o => o.status === 'besteld' || o.status === 'onderweg');
  if (filter === 'ontvangen') list = list.filter(o => o.status === 'ontvangen');

  if (!list.length) {
    document.getElementById('ordersListView').innerHTML = '<div class="empty" style="padding:50px"><div class="big">📦</div><p>Geen orders gevonden.</p></div>';
    return;
  }

  document.getElementById('ordersListView').innerHTML = list.map(o => {
    const s = suppById(o.suppId);
    const totalItems = o.items?.length || 0;
    const totalQty = (o.items || []).reduce((sum, i) => sum + (i.qty || 0), 0);
    const totalVal = (o.items || []).reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);
    const days = daysUntil(o.expectedDate);
    const daysStr = days === null ? '' : days < 0 ? `<span style="color:var(--red)">${Math.abs(days)}d te laat</span>` : days === 0 ? `<span style="color:var(--orange)">Vandaag</span>` : `<span style="color:var(--text3)">over ${days}d</span>`;

    return `<div class="order-card" onclick="openOrderDetail(${o.id})">
  <div style="text-align:center">
    ${s ? `<div style="width:10px;height:10px;border-radius:50%;background:${esc(s.color || '#888')};margin:0 auto 4px"></div>` : ''}
    <div style="font-size:10px;color:var(--text3);">#${o.id}</div>
  </div>
  <div style="min-width:0">
    <div style="font-weight:700;color:var(--text)">${s ? esc(s.name) : 'Onbekende leverancier'}${o.reference ? ` <span style="font-size:11px;color:var(--text3);font-family:'JetBrains Mono',monospace">${esc(o.reference)}</span>` : ''}</div>
    <div style="font-size:11px;color:var(--text2);margin-top:2px">${totalItems} artikelen • ${totalQty} stuks${totalVal > 0 ? ` • €${totalVal.toFixed(2)}` : ''}</div>
    <div style="font-size:11px;color:var(--text3);margin-top:1px">Besteld: ${fmtDate(o.orderDate)}${o.expectedDate ? ` · Verwacht: ${fmtDate(o.expectedDate)} ${daysStr}` : ''}</div>
  </div>
  <span class="order-status ${esc(o.status)}">${esc(o.status)}</span>
  <div style="display:flex;gap:4px;align-items:center">
    ${o.tracking ? renderTrackingBadge(o) : ''}
    <button class="abtn" onclick="event.stopPropagation();openEditOrder(${o.id})" style="font-size:11px">✏</button>
    <button class="abtn del" onclick="event.stopPropagation();deleteOrder(${o.id})" style="font-size:11px">✕</button>
  </div>
</div>`;
  }).join('');
}

function openOrderDetail(id) {
  _currentOrder = orders.find(o => o.id === id); if (!_currentOrder) return;
  const o = _currentOrder;
  const s = suppById(o.suppId);

  document.getElementById('ordersBack').style.display = '';
  document.getElementById('ordersNewBtn').style.display = 'none';
  document.getElementById('ordersFilter').style.display = 'none';
  document.getElementById('ordersTitle').textContent = `📦 Order #${o.id}`;
  document.getElementById('ordersListView').style.display = 'none';
  document.getElementById('ordersDetailView').style.display = '';

  const totalVal = (o.items || []).reduce((sum, i) => sum + (i.price || 0) * (i.qty || 0), 0);

  let html = `
<div style="padding:12px 16px;background:var(--surf2);border-bottom:1px solid var(--border);display:flex;flex-wrap:wrap;gap:16px;font-size:12px">
  <span><b>Leverancier:</b> ${s ? `<span style="color:${esc(s.color || 'var(--text)')}">${esc(s.name)}</span>` : '—'}</span>
  <span><b>Status:</b> <span class="order-status ${esc(o.status)}" style="display:inline">${esc(o.status)}</span></span>
  <span><b>Besteld:</b> ${fmtDate(o.orderDate)}</span>
  ${o.expectedDate ? `<span><b>Verwacht:</b> ${fmtDate(o.expectedDate)}</span>` : ''}
  ${o.reference ? `<span><b>Ref:</b> <span style="font-family:'JetBrains Mono',monospace">${esc(o.reference)}</span></span>` : ''}
  ${o.tracking ? `<span>${renderTrackingBadge(o)}</span>` : ''}
  ${totalVal > 0 ? `<span><b>Totaal:</b> <span style="color:var(--green)">€${totalVal.toFixed(2)}</span></span>` : ''}
</div>
${o.notes ? `<div style="padding:8px 16px;font-size:12px;color:var(--text2);border-bottom:1px solid var(--border)">${esc(o.notes)}</div>` : ''}
<!-- Items table -->
<div style="display:grid;grid-template-columns:1fr 60px 80px 80px;gap:8px;padding:6px 16px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border)">
  <div>Onderdeel</div><div style="text-align:right">Aantal</div><div style="text-align:right">Prijs/st</div><div style="text-align:right">Totaal</div>
</div>`;

  (o.items || []).forEach(item => {
    const p = parts.find(x => x.id === item.partId);
    const lineTotal = (item.price || 0) * (item.qty || 0);
    html += `<div style="display:grid;grid-template-columns:1fr 60px 80px 80px;gap:8px;padding:8px 16px;border-bottom:1px solid var(--border);font-size:12px;cursor:pointer" onclick="closeOrdersModal();selPart(${item.partId})">
  <div><div style="font-weight:500;color:var(--text)">${p ? esc(p.name) : `#${item.partId}`}</div>${p?.IPN ? `<div style="font-size:10px;color:var(--text3);font-family:'JetBrains Mono',monospace">${esc(p.IPN)}</div>` : ''}</div>
  <div style="text-align:right;font-family:'JetBrains Mono',monospace;color:var(--text)">${item.qty}</div>
  <div style="text-align:right;font-family:'JetBrains Mono',monospace;color:var(--text2)">${item.price ? `€${item.price.toFixed(2)}` : '—'}</div>
  <div style="text-align:right;font-family:'JetBrains Mono',monospace;color:var(--green)">${lineTotal > 0 ? `€${lineTotal.toFixed(2)}` : '—'}</div>
</div>`;
  });

  // Receive button if not yet received
  if (o.status !== 'ontvangen' && o.status !== 'geannuleerd') {
    html += `<div style="padding:12px 16px;border-top:1px solid var(--border)">
  <button class="btn" onclick="receiveOrder(${o.id})" style="width:100%;font-size:13px">📬 Ontvangen — stock toevoegen</button>
</div>`;
  }

  document.getElementById('ordersDetailView').innerHTML = html;
}

async function receiveOrder(id) {
  const o = orders.find(x => x.id === id); if (!o) return;
  const totalQty = (o.items || []).reduce((s, i) => s + (i.qty || 0), 0);
  if (!confirm(`Order #${id} ontvangen? ${totalQty} stuks worden aan de voorraad toegevoegd.`)) return;
  const updated = await api(`/api/orders/${id}/receive`, 'POST', { items: o.items });
  const i = orders.findIndex(x => x.id === id); if (i >= 0) orders[i] = updated;
  // Update parts in memory
  for (const item of o.items || []) {
    const p = parts.find(x => x.id === item.partId);
    if (p) p.stock = (p.stock || 0) + item.qty;
  }
  renderTable();
  openOrderDetail(id);
  toast(`✓ Order #${id} ontvangen — voorraad bijgewerkt`);
}

async function deleteOrder(id) {
  const o = orders.find(x => x.id === id);
  if (!o || !confirm(`Verwijder order #${id}?`)) return;
  await api(`/api/orders/${id}`, 'DELETE');
  orders = orders.filter(x => x.id !== id);
  renderOrdersList();
  toast('Order verwijderd');
}

// ── ORDER EDIT FORM ───────────────────────────────────────────
function fillOrderSuppSelect() {
  document.getElementById('oeSuppId').innerHTML = '<option value="">— geen leverancier —</option>' +
    suppliers.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
}

function addOrderItem(data = {}) {
  const row = document.createElement('div');
  row.className = 'oe-item-row';
  row.innerHTML = `
<select>
  <option value="">— onderdeel —</option>
  ${parts.filter(p => p.active !== false).sort((a, b) => a.name.localeCompare(b.name, 'nl')).map(p => `<option value="${p.id}" ${p.id === data.partId ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}
</select>
<input type="number" placeholder="Aantal" value="${data.qty || 1}" min="1">
<input type="number" placeholder="€ prijs/st" value="${data.price || ''}" step="0.01" min="0">
<button type="button" onclick="this.closest('.oe-item-row').remove()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:0">✕</button>`;
  document.getElementById('orderItemRows').appendChild(row);
}

function getOrderItems() {
  return Array.from(document.querySelectorAll('.oe-item-row')).map(row => {
    const [sel, qty, price] = row.querySelectorAll('select,input');
    const partId = parseInt(sel.value) || null;
    if (!partId) return null;
    return { partId, qty: parseInt(qty.value) || 1, price: parseFloat(price.value) || null };
  }).filter(Boolean);
}

function openAddOrder() {
  fillOrderSuppSelect();
  document.getElementById('orderEditTitle').textContent = 'Nieuwe inkooporder';
  document.getElementById('oeId').value = '';
  document.getElementById('oeSuppId').value = '';
  document.getElementById('oeStatus').value = 'besteld';
  document.getElementById('oeOrderDate').value = new Date().toISOString().slice(0, 10);
  document.getElementById('oeExpectedDate').value = '';
  document.getElementById('oeReference').value = '';
  document.getElementById('oeTracking').value = '';
  document.getElementById('oeNotes').value = '';
  document.getElementById('orderItemRows').innerHTML = '';
  addOrderItem();
  document.getElementById('orderEditOvl').classList.add('open');
}

function openEditOrder(id) {
  const o = orders.find(x => x.id === id); if (!o) return;
  fillOrderSuppSelect();
  document.getElementById('orderEditTitle').textContent = `Order #${id} bewerken`;
  document.getElementById('oeId').value = id;
  document.getElementById('oeSuppId').value = o.suppId || '';
  document.getElementById('oeStatus').value = o.status || 'besteld';
  document.getElementById('oeOrderDate').value = o.orderDate || '';
  document.getElementById('oeExpectedDate').value = o.expectedDate || '';
  document.getElementById('oeReference').value = o.reference || '';
  document.getElementById('oeTracking').value = o.tracking || '';
  document.getElementById('oeNotes').value = o.notes || '';
  document.getElementById('orderItemRows').innerHTML = '';
  (o.items || []).forEach(item => addOrderItem(item));
  if (!(o.items?.length)) addOrderItem();
  document.getElementById('orderEditOvl').classList.add('open');
}

function closeOrderEdit() { document.getElementById('orderEditOvl').classList.remove('open'); }

async function saveOrder() {
  const id = document.getElementById('oeId').value;
  const items = getOrderItems();
  const body = {
    suppId: parseInt(document.getElementById('oeSuppId').value) || null,
    status: document.getElementById('oeStatus').value,
    orderDate: document.getElementById('oeOrderDate').value,
    expectedDate: document.getElementById('oeExpectedDate').value,
    reference: document.getElementById('oeReference').value.trim(),
    tracking: document.getElementById('oeTracking').value.trim(),
    notes: document.getElementById('oeNotes').value.trim(),
    items,
  };
  if (id) {
    const o = orders.find(x => x.id === parseInt(id));
    const updated = await api(`/api/orders/${id}`, 'PUT', { ...o, ...body });
    const i = orders.findIndex(x => x.id === parseInt(id)); if (i >= 0) orders[i] = updated;
    toast('Order bijgewerkt');
  } else {
    const created = await api('/api/orders', 'POST', body);
    orders.push(created);
    toast(`Order #${created.id} aangemaakt`);
  }
  closeOrderEdit();
  renderOrdersList();
}

// ── PROJECTEN / BOM ───────────────────────────────────────────
let projects = [], _currentProject = null;

async function loadProjects() {
  projects = await api('/api/projects');
}

function openProjectsModal() {
  _currentProject = null;
  document.getElementById('projOvl').classList.add('open');
  document.getElementById('projBack').style.display = 'none';
  document.getElementById('projNewBtn').style.display = '';
  document.getElementById('projTitle').textContent = '🔗 Projecten';
  document.getElementById('projListView').style.display = '';
  document.getElementById('projDetailView').style.display = 'none';
  renderProjectList();
}
function closeProjectsModal() { document.getElementById('projOvl').classList.remove('open'); }

function projGoBack() {
  _currentProject = null;
  document.getElementById('projBack').style.display = 'none';
  document.getElementById('projNewBtn').style.display = '';
  document.getElementById('projTitle').textContent = '🔗 Projecten';
  document.getElementById('projListView').style.display = '';
  document.getElementById('projDetailView').style.display = 'none';
  renderProjectList();
}

function renderProjectList() {
  if (!projects.length) {
    document.getElementById('projListView').innerHTML = '<div class="empty" style="padding:50px"><div class="big">🔗</div><p>Nog geen projecten.<br>Maak een project aan en voeg onderdelen toe.</p></div>';
    return;
  }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  document.getElementById('projListView').innerHTML = projects.map(p => {
    const ready = calcBomStatus(p);
    const total = p.items?.length || 0;
    // Deadline check
    let deadlineHtml = '', dlClass = '';
    if (p.deadline) {
      const dl = new Date(p.deadline);
      const days = Math.round((dl - today) / (1000 * 60 * 60 * 24));
      if (days < 0) { dlClass = ' deadline-over'; deadlineHtml = `<span style="color:var(--red);font-size:11px">⚠ ${Math.abs(days)}d over deadline</span>`; }
      else if (days <= 7) { dlClass = ' deadline-warn'; deadlineHtml = `<span style="color:var(--orange);font-size:11px">⏰ ${days}d</span>`; }
      else { deadlineHtml = `<span style="color:var(--text3);font-size:11px">📅 ${dl.toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short' })}</span>`; }
    }
    // Cost
    const cost = calcProjectCost(p);
    const sellPrice = p.sellPrice || 0;
    const profit = sellPrice > 0 && cost > 0 ? sellPrice - cost : 0;
    const costHtml = cost > 0 ? '<span style="color:var(--acc2);font-size:11px">inkoop €' + cost.toFixed(2) + '</span>' : '';
    // Tags
    const tagsHtml = (p.tags || []).map(t => `<span class="proj-tag">${esc(t)}</span>`).join('');
    // Builds
    const builds = (p.buildHistory || []).length;
    const buildsHtml = builds > 0 ? `<span style="color:var(--text3);font-size:11px">🔨 ${builds}×</span>` : '';
    const bomPct = total > 0 ? Math.round((ready.ok / total) * 100) : 0;
    const bomBar = total > 0 ? `<div style="width:80px;height:4px;background:var(--border);border-radius:2px;overflow:hidden;flex-shrink:0"><div style="height:100%;width:${bomPct}%;background:${ready.missing > 0 ? 'var(--orange)' : 'var(--green)'};transition:width .3s"></div></div>` : '';
    const createdHtml = p.created ? `<span style="color:var(--text3);font-size:11px">${new Date(p.created).toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })}</span>` : '';
    return `<div class="proj-card${dlClass}" onclick="openProjectDetail(${p.id})">
  <div style="flex:1;min-width:0">
    <div style="font-weight:700;font-size:14px;color:var(--text);margin-bottom:2px">
      ${esc(p.name)}${p.version ? ` <span style="font-size:11px;color:var(--acc);font-weight:600">${esc(p.version)}</span>` : ''}
    </div>
    ${p.desc ? `<div style="font-size:12px;color:var(--text2);margin-bottom:4px">${esc(p.desc)}</div>` : ''}
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:3px">
      ${bomBar}
      <span style="font-size:11px;color:var(--text3)">${total} onderdelen${ready.missing > 0 ? ` &bull; <span style="color:var(--red)">${ready.missing} tekort</span>` : total > 0 ? ' &bull; <span style="color:var(--green)">compleet</span>' : ''}</span>
      ${costHtml}${profit > 0 ? '<span style="color:var(--green);font-size:11px">winst &euro;' + profit.toFixed(2) + '</span>' : ''}${deadlineHtml}${buildsHtml}${tagsHtml}
    </div>
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px">
      ${createdHtml}
      ${(p.sellPrice || 0) > 0 ? `<span style="color:var(--text3);font-size:11px">verkoop &euro;${p.sellPrice.toFixed(2)}/st</span>` : ''}
      ${(p.buildQty || 0) > 1 ? `<span style="color:var(--text3);font-size:11px">${p.buildQty}&times; batch</span>` : ''}
    </div>
  </div>
  <span class="proj-status ${esc(p.status)}">${esc(p.status)}</span>
  <button class="abtn" onclick="event.stopPropagation();showProjectQr(${p.id})" title="QR">QR</button>
  <button class="abtn" onclick="event.stopPropagation();duplicateProject(${p.id})" title="Dupliceer">+</button>
  <button class="abtn" onclick="event.stopPropagation();openEditProject(${p.id})">edit</button>
  <button class="abtn del" onclick="event.stopPropagation();deleteProject(${p.id})">x</button>
</div>`;
  }).join('');
}

function calcBomStatus(project) {
  let missing = 0, ok = 0;
  (project.items || []).forEach(item => {
    const p = parts.find(x => x.id === item.partId);
    if (!p) return;
    if ((p.stock || 0) >= item.qty) ok++;
    else missing++;
  });
  return { missing, ok };
}

function openProjectDetail(id) {
  _currentProject = projects.find(p => p.id === id);
  if (!_currentProject) return;
  document.getElementById('projBack').style.display = '';
  document.getElementById('projNewBtn').style.display = 'none';
  document.getElementById('projTitle').textContent = '🔗 ' + _currentProject.name;
  document.getElementById('projListView').style.display = 'none';
  document.getElementById('projDetailView').style.display = '';
  renderProjectDetail();
}

function calcProjectCost(proj, qty = 1) {
  const margin = (proj.margin || 0) / 100;
  let total = 0;
  (proj.items || []).forEach(item => {
    const p = parts.find(x => x.id === item.partId);
    if (!p) return;
    const prices = (p.suppliers || []).map(s => s.price).filter(Boolean);
    const price = prices.length ? Math.min(...prices) : 0;
    total += price * item.qty * qty;
  });
  // Arbeidskosten: uurtarief × uren per stuk × aantal
  const arbeid = (proj.uurtarief || 0) * (proj.urenPerSt || 0) * qty;
  return total * (1 + margin) + arbeid;
}

function calcArbeidskosten(proj, qty = 1) {
  return (proj.uurtarief || 0) * (proj.urenPerSt || 0) * qty;
}

function renderProjectDetail() {
  const proj = _currentProject;
  const items = proj.items || [];
  const status = calcBomStatus(proj);
  const buildQty = proj.buildQty || 1;
  const cost = calcProjectCost(proj, buildQty);
  const costPerUnit = calcProjectCost(proj, 1);
  const sellPrice = proj.sellPrice || 0;
  const profitPerUnit = sellPrice > 0 && costPerUnit > 0 ? sellPrice - costPerUnit : 0;
  const profitTotal = profitPerUnit * buildQty;
  const profitPct = costPerUnit > 0 && sellPrice > 0 ? Math.round((profitPerUnit / costPerUnit) * 100) : 0;

  // Deadline warning
  let deadlineWarn = '';
  if (proj.deadline) {
    const dl = new Date(proj.deadline);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const days = Math.round((dl - today) / (1000 * 60 * 60 * 24));
    if (days < 0) deadlineWarn = `<span style="color:var(--red)">⚠ ${Math.abs(days)} dagen over deadline!</span>`;
    else if (days <= 7) deadlineWarn = `<span style="color:var(--orange)">⏰ Deadline over ${days} dagen</span>`;
  }

  let html = `
<!-- Header info -->
<div style="padding:10px 16px;background:var(--surf2);border-bottom:1px solid var(--border);display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:12px">
  <span style="color:var(--text2)">${items.length} onderdelen</span>
  <span style="color:var(--green)">✓ ${status.ok} OK</span>
  ${status.missing > 0 ? `<span style="color:var(--red)">✗ ${status.missing} tekort</span>` : ''}
  ${costPerUnit > 0 ? '<span style="color:var(--acc2)">inkoop €' + costPerUnit.toFixed(2) + '/st</span>' : ''}
  ${sellPrice > 0 ? '<span style="color:var(--text2)">verkoop €' + sellPrice.toFixed(2) + '/st</span>' : ''}
  ${profitPerUnit > 0 ? '<span style="color:var(--green);font-weight:600">winst €' + profitPerUnit.toFixed(2) + '/st (' + profitPct + '%)</span>' : ''}
  ${deadlineWarn}
  ${proj.created ? `<span style="color:var(--text3);font-size:11px">${new Date(proj.created).toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })}</span>` : ''}
  ${(proj.tags || []).map(t => `<span class="proj-tag">${esc(t)}</span>`).join('')}
  <div style="margin-left:auto;display:flex;gap:6px;align-items:center">
    <input type="number" id="buildQtyInp" value="${buildQty}" min="1" style="width:52px;background:var(--surf);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;padding:3px 6px;text-align:center;outline:none" onchange="updateBuildQty(this.value)" title="Aantal te bouwen">
    <span style="color:var(--text3);font-size:11px">stuks</span>
    ${cost > 0 ? '<span style="color:var(--acc2);font-size:12px">inkoop &euro;' + cost.toFixed(2) + '</span>' : ''}
    ${(proj.uurtarief > 0 && proj.urenPerSt > 0) ? '<span style="color:var(--text3);font-size:11px">arbeid &euro;' + calcArbeidskosten(proj, buildQty).toFixed(2) + '</span>' : ''}
    ${profitTotal > 0 ? '<span style="color:var(--green);font-size:12px;font-weight:600">winst &euro;' + profitTotal.toFixed(2) + '</span>' : ''}
    <button class="btn sec" onclick="showProjectQr(${proj.id})" style="font-size:11px;padding:5px 10px">QR</button>
    <button class="btn sec" onclick="exportBomCSV()" style="font-size:11px;padding:5px 10px">⬇ BOM</button>
    <button class="btn sec" onclick="importBomCSV()" style="font-size:11px;padding:5px 10px">⬆ BOM</button>
    <button class="btn sec" onclick="openRevisieModal()" style="font-size:11px;padding:5px 10px">⑂ Revisie</button>
    <button class="btn" onclick="buildProject()" style="font-size:11px;padding:5px 10px">Bouwen</button>
  </div>
</div>
<!-- Add part row -->
<div style="padding:10px 16px;border-bottom:1px solid var(--border);display:flex;gap:8px;align-items:center">
  <select id="bomPartSel" style="flex:1;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px;padding:6px 8px;outline:none">
    <option value="">+ Onderdeel toevoegen...</option>
    ${parts.filter(p => p.active !== false).sort((a, b) => a.name.localeCompare(b.name, 'nl')).map(p => `<option value="${p.id}">${esc(p.name)}${p.IPN ? ' (' + p.IPN + ')' : ''}</option>`).join('')}
  </select>
  <input type="number" id="bomQtySel" value="1" min="1" style="width:60px;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px;padding:6px 8px;outline:none">
  <button class="btn" onclick="addBomItem()" style="font-size:12px;padding:6px 12px">+ Toevoegen</button>
</div>
<!-- BOM table header -->
<div class="bom-row" style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);cursor:default">
  <div>Onderdeel</div><div style="text-align:right">Nodig</div><div style="text-align:right">Voorraad</div><div style="text-align:right">Prijs p/st</div><div></div>
</div>`;

  if (!items.length) {
    html += '<div style="text-align:center;padding:30px;color:var(--text3);font-size:12px">Nog geen onderdelen. Voeg ze toe hierboven.</div>';
  } else {
    items.forEach((item, i) => {
      const p = parts.find(x => x.id === item.partId);
      if (!p) { html += `<div class="bom-row"><div style="color:var(--text3)">Onderdeel #${item.partId} niet gevonden</div><div></div><div></div><div></div><div><button class="abtn del" onclick="removeBomItem(${i})">✕</button></div></div>`; return; }
      const stock = p.stock || 0;
      const need = item.qty * buildQty;
      const ok = stock >= need;
      const partial = stock > 0 && stock < need;
      const prices = (p.suppliers || []).map(s => s.price).filter(Boolean);
      const price = prices.length ? Math.min(...prices) : 0;
      html += `<div class="bom-row">
    <div style="cursor:pointer;color:var(--text);font-weight:500" onclick="closeProjectsModal();selPart(${p.id})">${esc(p.name)}<br><span style="font-size:10px;color:var(--text3)">${esc(p.IPN || '')}</span></div>
    <div style="text-align:right;font-family:'JetBrains Mono',monospace">${buildQty > 1 ? `${item.qty}×${buildQty}=<b>${need}</b>` : item.qty}</div>
    <div style="text-align:right;font-family:'JetBrains Mono',monospace;color:${ok ? 'var(--green)' : partial ? 'var(--orange)' : 'var(--red)'}">${stock}</div>
    <div style="text-align:right;font-size:11px;color:var(--text3)">${price > 0 ? '€' + price.toFixed(2) : '—'}</div>
    <div style="display:flex;gap:4px;justify-content:flex-end">${!ok ? `<button class="abtn" title="AI-vervanging zoeken" onclick="suggestReplacement(${p.id})">🤖</button>` : ''}<button class="abtn del" onclick="removeBomItem(${i})">✕</button></div>
  </div>`;
    });
  }

  // Build history
  const history = proj.buildHistory || [];
  if (history.length) {
    html += `<div style="padding:10px 16px 4px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text2);border-top:2px solid var(--border);margin-top:8px">🔨 Bouw history</div>`;
    html += history.map((h, idx) => ({ h, idx })).reverse().map(({ h, idx }) => `
  <div class="build-row">
    <span style="color:var(--text2);font-family:'JetBrains Mono',monospace;font-size:11px">${new Date(h.ts).toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
    <span style="color:var(--acc);font-weight:700">${h.qty}×</span>
    <span style="color:var(--text3);font-size:11px">${esc(h.note || '')}</span>
    ${h.cost > 0 ? `<span style="color:var(--green);font-size:11px">€${h.cost.toFixed(2)}</span>` : ''}
    <span style="margin-left:auto;display:flex;gap:2px">
      <button class="abtn" title="Bewerken" onclick="editBuildEntry(${idx})">✎</button>
      <button class="abtn del" title="Verwijderen" onclick="removeBuildEntry(${idx})">✕</button>
    </span>
  </div>`).join('');
    const totalBuilt = history.reduce((s, h) => s + h.qty, 0);
    html += `<div style="padding:8px 16px;font-size:12px;color:var(--text2);border-top:1px solid var(--border)">Totaal gebouwd: <b style="color:var(--text)">${totalBuilt} stuks</b></div>`;
  }

  // Revisies sectie
  const relatedRevs = projects.filter(p => p.name === _currentProject.name && p.id !== _currentProject.id);
  if (relatedRevs.length > 0) {
    html += '<div style="border-top:2px solid var(--border);padding:10px 16px;font-size:11px;font-weight:700;color:var(--text2);letter-spacing:.06em;text-transform:uppercase">Andere revisies</div>';
    html += renderRevisions(_currentProject);
  }

  document.getElementById('projDetailView').innerHTML = html;
}

async function addBomItem() {
  const partId = parseInt(document.getElementById('bomPartSel').value);
  const qty = parseInt(document.getElementById('bomQtySel').value) || 1;
  if (!partId) return;
  const proj = _currentProject;
  // Check if already in BOM
  const existing = proj.items?.find(i => i.partId === partId);
  if (existing) { existing.qty += qty; }
  else { proj.items = (proj.items || []); proj.items.push({ partId, qty, notes: '' }); }
  await api(`/api/projects/${proj.id}`, 'PUT', proj);
  const i = projects.findIndex(p => p.id === proj.id); if (i >= 0) projects[i] = proj;
  document.getElementById('bomPartSel').value = '';
  renderProjectDetail();
  toast(`✓ Toegevoegd aan BOM`);
}

async function removeBomItem(idx) {
  const proj = _currentProject;
  proj.items.splice(idx, 1);
  await api(`/api/projects/${proj.id}`, 'PUT', proj);
  const i = projects.findIndex(p => p.id === proj.id); if (i >= 0) projects[i] = proj;
  renderProjectDetail();
}

let _editBuildIdx = null;

function editBuildEntry(idx) {
  const proj = _currentProject;
  const h = proj.buildHistory[idx];
  if (!h) return;
  _editBuildIdx = idx;
  const d = new Date(h.ts);
  document.getElementById('beDate').value = d.toISOString().slice(0, 10);
  document.getElementById('beQty').value = h.qty;
  document.getElementById('beNote').value = h.note || '';
  document.getElementById('beCost').value = h.cost || '';
  document.getElementById('beOvl').classList.add('open');
}

async function saveBuildEntry() {
  const proj = _currentProject;
  const h = proj.buildHistory[_editBuildIdx];
  if (!h) return;
  const dateVal = document.getElementById('beDate').value;
  const qty = Math.max(1, parseInt(document.getElementById('beQty').value) || 1);
  if (dateVal) {
    const existing = new Date(h.ts);
    const nd = new Date(dateVal);
    nd.setHours(existing.getHours(), existing.getMinutes(), existing.getSeconds());
    h.ts = nd.toISOString();
  }
  h.qty = qty;
  h.note = document.getElementById('beNote').value.trim();
  h.cost = parseFloat(document.getElementById('beCost').value) || 0;
  await api(`/api/projects/${proj.id}`, 'PUT', proj);
  const i = projects.findIndex(p => p.id === proj.id); if (i >= 0) projects[i] = proj;
  document.getElementById('beOvl').classList.remove('open');
  renderProjectDetail();
  toast('✓ Bouw bijgewerkt');
}

async function removeBuildEntry(idx) {
  const proj = _currentProject;
  if (!confirm('Deze bouw-registratie verwijderen? Dit past het totaal aantal gebouwd en de winstanalyse aan, maar boekt de voorraad NIET automatisch terug.')) return;
  proj.buildHistory.splice(idx, 1);
  await api(`/api/projects/${proj.id}`, 'PUT', proj);
  const i = projects.findIndex(p => p.id === proj.id); if (i >= 0) projects[i] = proj;
  renderProjectDetail();
  toast('✓ Bouw-registratie verwijderd');
}

function updateBuildQty(val) {
  const proj = _currentProject;
  proj.buildQty = Math.max(1, parseInt(val) || 1);
  renderProjectDetail();
}

async function buildProject() {
  const proj = _currentProject;
  const items = proj.items || [];
  const buildQty = proj.buildQty || 1;
  const missing = items.filter(item => {
    const p = parts.find(x => x.id === item.partId);
    return !p || (p.stock || 0) < item.qty * buildQty;
  });
  const confirmMsg = missing.length
    ? `Niet genoeg voorraad voor: ${missing.map(i => parts.find(x => x.id === i.partId)?.name || '#' + i.partId).join(', ')}.
Toch doorgaan?`
    : `Stock aftrekken voor ${buildQty}\u00d7 "${proj.name}"?`;
  if (!confirm(confirmMsg)) return;

  const note = prompt('Notitie (optioneel, bv. "klant X", "test batch"):', '') ?? '';

  for (const item of items) {
    const p = parts.find(x => x.id === item.partId);
    if (!p) continue;
    const deduct = Math.min(item.qty * buildQty, p.stock || 0);
    if (deduct === 0) continue;
    const r = await api('/api/parts/' + p.id + '/stock', 'PATCH', { delta: -deduct, note: 'Bouwen: ' + proj.name + (note ? ' \u2014 ' + note : '') });
    p.stock = r.stock;
    checkAndNotifyLowStock(p);
  }

  const cost = calcProjectCost(proj, buildQty);
  proj.buildHistory = proj.buildHistory || [];
  const buildEntry = { ts: new Date().toISOString(), qty: buildQty, note, cost: parseFloat(cost.toFixed(2)) };
  proj.buildHistory.push(buildEntry);
  await api('/api/projects/' + proj.id, 'PUT', proj);
  const i = projects.findIndex(x => x.id === proj.id); if (i >= 0) projects[i] = proj;

  renderTable();
  renderProjectDetail();
  toast('\u2713 ' + buildQty + '\u00d7 "' + proj.name + '" gebouwd');

  // Telegram notificatie bij build
  fireTelegram('build', {
    name: proj.name, version: proj.version || '', qty: buildQty,
    note, cost: cost.toFixed(2), sellPrice: proj.sellPrice || 0
  });

  if (confirm('Pakbon genereren?')) printPakbon(proj, buildEntry);
}

function printPakbon(proj, buildEntry) {
  const qty = buildEntry.qty || 1;
  const ts = new Date(buildEntry.ts);
  const nr = 'PB-' + proj.id + '-' + ts.getFullYear() + ('0' + (ts.getMonth() + 1)).slice(-2) + ('0' + ts.getDate()).slice(-2) + '-' + String(Math.floor(Math.random() * 9000) + 1000);
  const dateStr = ts.toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
  const cost = buildEntry.cost || 0;
  const sell = (proj.sellPrice || 0) * qty;
  const rows = (proj.items || []).map(item => {
    const p = parts.find(x => x.id === item.partId);
    if (!p) return '';
    const total = item.qty * qty;
    const supp = (p.suppliers || []).filter(s => s.price > 0).sort((a, b) => a.price - b.price)[0];
    const priceStr = supp?.price ? '\u20ac' + supp.price.toFixed(2) : '\u2014';
    return '<tr><td>' + esc(p.IPN || '\u2014') + '</td><td>' + esc(p.name) + '</td>'
      + '<td style="text-align:right">' + item.qty + '</td>'
      + '<td style="text-align:right">' + qty + '</td>'
      + '<td style="text-align:right"><b>' + total + '</b></td>'
      + '<td style="text-align:right">' + priceStr + '</td>'
      + '<td>' + (p.locId ? (LOCS[p.locId] || '') : '') + '</td></tr>';
  }).join('');

  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write('<!DOCTYPE html><html lang="nl"><head>'
    + '<meta charset="UTF-8"><title>Pakbon ' + nr + '</title>'
    + '<style>'
    + '* { box-sizing:border-box; margin:0; padding:0 }'
    + 'body { font-family:Arial,sans-serif; font-size:11pt; margin:20mm; color:#111 }'
    + 'h1 { font-size:22pt; font-weight:700; margin-bottom:4px }'
    + '.sub { font-size:10pt; color:#555; margin-bottom:24px }'
    + '.header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:20px }'
    + '.meta { font-size:10pt; line-height:1.7 }'
    + '.meta b { display:inline-block; min-width:90px }'
    + 'table { width:100%; border-collapse:collapse; margin-top:16px; font-size:10pt }'
    + 'th { background:#f0f0f0; border-bottom:2px solid #999; padding:6px 8px; text-align:left; font-size:9pt }'
    + 'td { border-bottom:1px solid #e0e0e0; padding:5px 8px; vertical-align:middle }'
    + 'tr:last-child td { border-bottom:2px solid #999 }'
    + '.totals { margin-top:14px; text-align:right; font-size:10pt; line-height:1.8 }'
    + '.note { margin-top:20px; padding:10px 14px; background:#fafafa; border:1px solid #ddd; border-radius:4px; font-size:10pt }'
    + '.footer { margin-top:30px; padding-top:10px; border-top:1px solid #ccc; font-size:9pt; color:#888; display:flex; justify-content:space-between }'
    + '@media print { body { margin:15mm } .noprint { display:none !important } }'
    + '<' + '/style><' + '/head><body>'
    + '<div class="header"><div>'
    + '<h1>Pakbon</h1>'
    + '<div class="sub">' + esc(proj.name) + (proj.version ? ' ' + esc(proj.version) : '') + '</div>'
    + '</div><div class="meta">'
    + '<div><b>Pakbon nr:</b> ' + nr + '</div>'
    + '<div><b>Datum:</b> ' + dateStr + '</div>'
    + '<div><b>Aantal:</b> ' + qty + '\u00d7</div>'
    + (buildEntry.note ? '<div><b>Notitie:</b> ' + esc(buildEntry.note) + '</div>' : '')
    + '</div></div>'
    + '<table><thead><tr>'
    + '<th>IPN</th><th>Onderdeel</th>'
    + '<th style="text-align:right">Per st</th>'
    + '<th style="text-align:right">Builds</th>'
    + '<th style="text-align:right">Totaal</th>'
    + '<th style="text-align:right">Prijs/st</th>'
    + '<th>Locatie</th>'
    + '</tr></thead><tbody>' + rows + '</tbody></table>'
    + '<div class="totals">'
    + (cost > 0 ? '<div>Inkoopkosten: <b>\u20ac' + cost.toFixed(2) + '</b></div>' : '')
    + (sell > 0 ? '<div>Verkoopwaarde: <b>\u20ac' + sell.toFixed(2) + '</b></div>' : '')
    + (cost > 0 && sell > 0 ? '<div>Marge: <b>\u20ac' + (sell - cost).toFixed(2) + ' (' + Math.round((sell - cost) / cost * 100) + '%)</b></div>' : '')
    + '</div>'
    + (buildEntry.note ? '<div class="note"><b>Notitie:</b> ' + esc(buildEntry.note) + '</div>' : '')
    + '<div class="footer"><span>HuizeBruin Inventaris &mdash; ' + esc(proj.name) + '</span><span>' + nr + '</span></div>'
    + '<br><br>'
    + '<button class="noprint" onclick="window.print()" style="padding:8px 20px;font-size:11pt;cursor:pointer;border:1px solid #333;border-radius:4px;background:#fff">\uD83D\uDDA8 Afdrukken / PDF opslaan</button>'
    + '<' + '/body><' + '/html>');
  win.document.close();
}

let _projTags = [];

function toggleProjTag(tag) {
  const idx = _projTags.indexOf(tag);
  if (idx >= 0) _projTags.splice(idx, 1);
  else _projTags.push(tag);
  renderProjTagButtons();
}

const PROJ_TAGS = ['prototype', 'productie', 'klant', 'eigen gebruik', 'reparatie', 'test'];

function renderProjTagButtons() {
  const wrap = document.getElementById('projTagsWrap');
  if (!wrap) return;
  wrap.innerHTML = PROJ_TAGS.map(t => {
    const active = _projTags.includes(t);
    const bg = active ? 'var(--acc2)' : 'var(--surf2)';
    const col = active ? '#fff' : 'var(--text2)';
    const bdr = active ? 'var(--acc2)' : 'var(--border)';
    return '<button type="button" onclick="toggleProjTag(\'' + t + '\')" class="proj-tag-btn" data-tag="' + t + '" style="font-size:11px;padding:4px 10px;border-radius:10px;border:1px solid ' + bdr + ';background:' + bg + ';color:' + col + ';cursor:pointer;transition:all .15s">' + t + '</button>';
  }).join('');
}

function openAddProject() {
  _projTags = [];
  document.getElementById('projEditTitle').textContent = 'Nieuw project';
  document.getElementById('projEditId').value = '';
  document.getElementById('projEditName').value = '';
  document.getElementById('projEditVersion').value = '';
  document.getElementById('projEditDesc').value = '';
  document.getElementById('projEditStatus').value = 'actief';
  document.getElementById('projEditDeadline').value = '';
  document.getElementById('projEditMargin').value = '0';
  document.getElementById('projEditMarginPct').value = '0';
  document.getElementById('projEditSellPrice').value = '';
  document.getElementById('projEditQty').value = '1';
  renderProjTagButtons();
  document.getElementById('projEditOvl').classList.add('open');
  setTimeout(() => document.getElementById('projEditName').focus(), 80);
}

function openEditProject(id) {
  const p = projects.find(x => x.id === id); if (!p) return;
  _projTags = [...(p.tags || [])];
  document.getElementById('projEditTitle').textContent = 'Project bewerken';
  document.getElementById('projEditId').value = id;
  document.getElementById('projEditName').value = p.name;
  document.getElementById('projEditVersion').value = p.version || '';
  document.getElementById('projEditDesc').value = p.desc || '';
  document.getElementById('projEditStatus').value = p.status || 'actief';
  document.getElementById('projEditDeadline').value = p.deadline || '';
  document.getElementById('projEditMargin').value = p.margin || 0;
  document.getElementById('projEditMarginPct').value = p.marginPct || 0;
  document.getElementById('projEditSellPrice').value = p.sellPrice || '';
  document.getElementById('projEditQty').value = p.buildQty || 1;
  document.getElementById('projEditUurloon').value = p.uurtarief || '';
  document.getElementById('projEditUren').value = p.urenPerSt || '';
  renderProjTagButtons();
  document.getElementById('projEditOvl').classList.add('open');
  setTimeout(() => document.getElementById('projEditName').focus(), 80);
}
function closeProjEdit() { document.getElementById('projEditOvl').classList.remove('open'); }

async function saveProject() {
  const name = document.getElementById('projEditName').value.trim();
  if (!name) { alert('Naam is verplicht'); return; }
  const id = document.getElementById('projEditId').value;
  const body = {
    name,
    version: document.getElementById('projEditVersion').value.trim(),
    desc: document.getElementById('projEditDesc').value.trim(),
    status: document.getElementById('projEditStatus').value,
    deadline: document.getElementById('projEditDeadline').value || '',
    margin: parseFloat(document.getElementById('projEditMarginPct').value) || 0,
    sellPrice: parseFloat(document.getElementById('projEditSellPrice').value) || 0,
    buildQty: parseInt(document.getElementById('projEditQty').value) || 1,
    uurtarief: parseFloat(document.getElementById('projEditUurloon').value) || 0,
    urenPerSt: parseFloat(document.getElementById('projEditUren').value) || 0,
    tags: [..._projTags],
  };
  if (id) {
    const p = projects.find(x => x.id === parseInt(id));
    const updated = await api('/api/projects/' + id, 'PUT', { ...p, ...body });
    const i = projects.findIndex(x => x.id === parseInt(id)); if (i >= 0) projects[i] = { ...p, ...body };
  } else {
    const created = await api('/api/projects', 'POST', body);
    projects.push(created);
  }
  closeProjEdit();
  renderProjectList();
  toast(id ? 'Project bijgewerkt' : 'Project aangemaakt');
}

function openRevisieModal() {
  const proj = _currentProject; if (!proj) return;
  // Suggest next version number
  const allVersions = projects
    .filter(p => p.name === proj.name)
    .map(p => p.version || '')
    .filter(Boolean);
  // Determine next version suggestion
  const versionMatch = (proj.version || 'v1').match(/v?(\d+)/i);
  const nextNum = versionMatch ? parseInt(versionMatch[1]) + 1 : 2;
  const suggested = 'v' + nextNum;

  const wrap = document.createElement('div');
  wrap.innerHTML = `
    <div style="font-size:12px;color:var(--text2);margin-bottom:12px">
      Maakt een kopie van <b>${esc(proj.name)}</b> met een nieuwe versie.<br>
      De BOM wordt gekopieerd, buildhistorie start leeg.
    </div>
    <div class="field" style="margin-bottom:10px">
      <label>Nieuwe versienaam</label>
      <input id="_revVerInp" type="text" value="${esc(suggested)}"
        style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:13px;padding:8px 10px;outline:none">
    </div>
    <div class="field" style="margin-bottom:0">
      <label>Omschrijving wijzigingen (optioneel)</label>
      <input id="_revDescInp" type="text" placeholder="bv. PCB v2 met verbeterde voeding"
        style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:13px;padding:8px 10px;outline:none">
    </div>
    ${allVersions.length ? '<div style="margin-top:10px;font-size:11px;color:var(--text3)">Bestaande versies: ' + allVersions.map(v => '<b>' + esc(v) + '</b>').join(', ') + '</div>' : ''}`;

  const dlg = _bulkDialog('⑂ Nieuwe revisie aanmaken', wrap, async () => {
    const newVer = document.getElementById('_revVerInp').value.trim();
    if (!newVer) { toast('Vul een versienaam in'); return; }
    const newDesc = document.getElementById('_revDescInp').value.trim();
    const copy = {
      name: proj.name,
      version: newVer,
      desc: newDesc || proj.desc || '',
      status: 'actief',
      deadline: proj.deadline || '',
      sellPrice: proj.sellPrice || 0,
      buildQty: proj.buildQty || 1,
      uurtarief: proj.uurtarief || 0,
      urenPerSt: proj.urenPerSt || 0,
      tags: [...(proj.tags || [])],
      items: JSON.parse(JSON.stringify(proj.items || [])),
    };
    const created = await api('/api/projects', 'POST', copy);
    projects.push(created);
    renderProjectList();
    // Open the new revision
    _currentProject = created;
    document.getElementById('projListView').style.display = 'none';
    document.getElementById('projDetailView').style.display = '';
    renderProjectDetail();
    toast('✓ Revisie ' + newVer + ' aangemaakt met ' + copy.items.length + ' BOM onderdelen');
  });
  document.body.appendChild(dlg);
  setTimeout(() => document.getElementById('_revVerInp')?.select(), 100);
}

// Toon gerelateerde revisies in project detail
function renderRevisions(proj) {
  const related = projects.filter(p => p.name === proj.name && p.id !== proj.id)
    .sort((a, b) => (b.version || '').localeCompare(a.version || ''));
  if (!related.length) return '<div style="padding:16px;color:var(--text3);font-size:12px">Geen andere revisies gevonden voor "' + esc(proj.name) + '".</div>';
  return '<div style="padding:10px 16px">'
    + related.map(r => {
      const totalB = (r.buildHistory || []).reduce((s, h) => s + h.qty, 0);
      const cost = calcProjectCost(r, 1);
      const bom = r.items?.length || 0;
      return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="openProjectDetail(' + r.id + ')">'
        + '<div style="flex:1">'
        + '<div style="font-weight:600;font-size:13px">' + esc(r.version || '(geen versie)') + ' <span style="font-size:11px;color:var(--text2)">· ' + esc(r.status) + '</span></div>'
        + (r.desc ? '<div style="font-size:11px;color:var(--text3);margin-top:1px">' + esc(r.desc) + '</div>' : '')
        + '</div>'
        + '<span style="font-size:11px;color:var(--text3)">' + bom + ' onderdelen</span>'
        + (cost > 0 ? '<span style="font-size:11px;color:var(--acc2)">€' + cost.toFixed(2) + '/st</span>' : '')
        + (totalB > 0 ? '<span style="font-size:11px;color:var(--acc)">' + totalB + '× gebouwd</span>' : '')
        + '<span style="font-size:11px;color:var(--acc2);font-weight:600">→ open</span>'
        + '</div>';
    }).join('')
    + '</div>';
}

async function duplicateProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p) return;
  const copy = {
    name: p.name + ' (kopie)',
    desc: p.desc || '',
    status: 'actief',
    items: JSON.parse(JSON.stringify(p.items || [])),
  };
  try {
    const created = await api('/api/projects', 'POST', copy);
    projects.push(created);
    renderProjectList();
    toast('⧉ Project gedupliceerd');
  } catch (e) { toast('❌ Fout bij dupliceren'); }
}

async function deleteProject(id) {
  const p = projects.find(x => x.id === id);
  if (!p || !confirm(`Verwijder project "${p.name}"?`)) return;
  await api(`/api/projects/${id}`, 'DELETE');
  projects = projects.filter(x => x.id !== id);
  renderProjectList();
  toast('Project verwijderd');
}

function showProjectQr(id) {
  const proj = projects.find(p => p.id === id);
  if (!proj) return;
  const cost = calcProjectCost(proj, 1);
  // Primaire QR: directe URL naar dit project
  const url = getAppBaseUrl() + '?project=' + proj.id;
  const infoLines = [
    proj.name + (proj.version ? ' ' + proj.version : ''),
    proj.desc || '',
    'Status: ' + proj.status,
    proj.items?.length ? proj.items.length + ' onderdelen' : '',
    cost > 0 ? 'Inkoop: \u20ac' + cost.toFixed(2) : '',
  ].filter(Boolean).join(' | ');
  document.getElementById('projQrOvl')?.remove();
  const ovl = document.createElement('div');
  ovl.id = 'projQrOvl';
  ovl.className = 'overlay open';
  ovl.style.zIndex = '600';
  ovl.innerHTML = `
    <div class="modal" style="width:360px;text-align:center">
      <div class="mhdr"><h3>QR &mdash; ${esc(proj.name)}${proj.version ? ' <span style="color:var(--acc);font-size:11px">' + esc(proj.version) + '</span>' : ''}</h3>
        <button class="xcls" onclick="document.getElementById('projQrOvl').remove()">&#10005;</button>
      </div>
      <div class="mbdy" style="padding:16px 20px;display:flex;flex-direction:column;align-items:center;gap:12px">
        <div id="projQrCanvas" style="background:#fff;padding:10px;border-radius:8px;display:inline-block"></div>
        <div style="font-size:11px;color:var(--text3);word-break:break-all">${esc(url)}</div>
        <div style="font-size:11px;color:var(--text2);text-align:left;width:100%;padding:8px 10px;background:var(--surf2);border-radius:6px;border:1px solid var(--border)">${esc(infoLines)}</div>
        <div style="display:flex;gap:8px">
          <button class="btn sec" onclick="navigator.clipboard?.writeText('${esc(url)}').then(()=>toast('URL gekopieerd'))" style="font-size:11px">&#128203; Kopieer URL</button>
          <button class="btn sec" onclick="projQrDownload()" style="font-size:11px">&#11015; PNG</button>
        </div>
      </div>
    </div>`;
  ovl.addEventListener('click', e => { if (e.target === ovl) ovl.remove(); });
  document.body.appendChild(ovl);
  setTimeout(() => {
    try {
      new QRCode(document.getElementById('projQrCanvas'), {
        text: url, width: 200, height: 200,
        colorDark: '#111318', colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      document.getElementById('projQrCanvas').innerHTML = '<div style="color:var(--red);padding:16px">QR genereren mislukt</div>';
    }
  }, 50);
}

function projQrDownload() {
  const canvas = document.querySelector('#projQrCanvas canvas');
  if (!canvas) { toast('Geen QR canvas'); return; }
  const a = document.createElement('a');
  a.download = 'project-qr.png';
  a.href = canvas.toDataURL('image/png');
  a.click();
}

// ── BOM EXPORT / IMPORT ──────────────────────────────────────
function exportBomCSV() {
  const proj = _currentProject; if (!proj) return;
  const rows = [['IPN', 'Naam', 'Beschrijving', 'Categorie', 'Locatie', 'Aantal', 'Prijs/st', 'Totaal', 'Leverancier', 'SKU', 'Link']];
  (proj.items || []).forEach(item => {
    const p = parts.find(x => x.id === item.partId);
    if (!p) return;
    const supp = (p.suppliers || []).filter(s => s.price > 0).sort((a, b) => a.price - b.price)[0];
    const sn = supp ? suppById(supp.suppId) : null;
    rows.push([
      p.IPN || '', p.name, p.desc || '', cat(p.catId), loc(p.locId),
      item.qty,
      supp?.price?.toFixed(4) || '',
      supp ? (supp.price * item.qty).toFixed(2) : '',
      sn?.name || '', supp?.sku || '', supp?.link || p.link || ''
    ]);
  });
  const csv = rows.map(r => r.map(c => '"' + String(c ?? '').replace(/"/g, '""') + '"').join(',')).join('');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = (proj.name + (proj.version ? '-' + proj.version : '') + '-BOM.csv').replace(/\s+/g, '-');
  a.click();
  toast('BOM geëxporteerd');
}

function importBomCSV() {
  const proj = _currentProject; if (!proj) return;
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.csv';
  inp.onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split('').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { toast('CSV leeg of ongeldig'); return; }
    // Parse header
    const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
    const ipnCol = header.findIndex(h => h.includes('ipn'));
    const nameCol = header.findIndex(h => h === 'naam' || h === 'name');
    const qtyCol = header.findIndex(h => h.includes('aantal') || h === 'qty' || h === 'quantity');
    if (qtyCol < 0) { toast('Geen "Aantal" kolom gevonden in CSV'); return; }

    let added = 0, notFound = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].match(/("(?:[^"]|"")*"|[^,]*)/g)
        .map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim());
      const qty = parseInt(cols[qtyCol]);
      if (!qty || qty < 1) continue;
      // Find part by IPN first, then name
      let p = null;
      if (ipnCol >= 0 && cols[ipnCol]) p = parts.find(x => x.IPN === cols[ipnCol]);
      if (!p && nameCol >= 0 && cols[nameCol]) p = parts.find(x => x.name === cols[nameCol]);
      if (!p) { notFound.push(cols[ipnCol] || cols[nameCol] || `rij ${i + 1}`); continue; }
      // Add or update in BOM
      const existing = (proj.items || []).find(x => x.partId === p.id);
      if (existing) existing.qty = qty;
      else { proj.items = proj.items || []; proj.items.push({ partId: p.id, qty }); }
      added++;
    }
    await api('/api/projects/' + proj.id, 'PUT', proj);
    const i = projects.findIndex(x => x.id === proj.id); if (i >= 0) projects[i] = proj;
    renderProjectDetail();
    let msg = added + ' onderdelen in BOM gezet';
    if (notFound.length) msg += ' | Niet gevonden: ' + notFound.slice(0, 3).join(', ') + (notFound.length > 3 ? '...' : '');
    toast(msg);
  };
  inp.click();
}

// ── WINSTANALYSE ──────────────────────────────────────────────
function openWinstAnalyse() {
  // Bereken per project
  const projData = projects.map(proj => {
    const builds = proj.buildHistory || [];
    const totalBuilt = builds.reduce((s, h) => s + h.qty, 0);
    const totalCost = builds.reduce((s, h) => s + (h.cost || 0), 0);
    const sell = proj.sellPrice || 0;
    const totalRev = sell * totalBuilt;
    const profit = totalRev - totalCost;
    return { name: proj.name + (proj.version ? ' ' + proj.version : ''), totalBuilt, totalCost, totalRev, profit, sell };
  }).filter(p => p.totalBuilt > 0).sort((a, b) => b.profit - a.profit);

  const totalCost = projData.reduce((s, p) => s + p.totalCost, 0);
  const totalRev = projData.reduce((s, p) => s + p.totalRev, 0);
  const totalProfit = totalRev - totalCost;

  // Jaaroverzicht: per jaar geïnvesteerd/omzet/winst + arbeidsuren
  const yearMap = {};
  projects.forEach(proj => {
    (proj.buildHistory || []).forEach(h => {
      const year = new Date(h.ts).getFullYear();
      if (!yearMap[year]) yearMap[year] = { cost: 0, rev: 0, hours: 0 };
      yearMap[year].cost += (h.cost || 0);
      yearMap[year].rev += (proj.sellPrice || 0) * h.qty;
      yearMap[year].hours += (proj.urenPerSt || 0) * h.qty;
    });
  });
  const years = Object.keys(yearMap).map(Number).sort((a, b) => b - a);

  // SVG bar chart
  const maxVal = Math.max(...projData.map(p => Math.max(p.totalCost, p.totalRev)), 1);
  const barH = 20, gap = 8, W = 500;
  const bars = projData.map((p, i) => {
    const y = i * (barH * 2 + gap);
    const costW = Math.round((p.totalCost / maxVal) * (W - 100));
    const revW = Math.round((p.totalRev / maxVal) * (W - 100));
    return `<g transform="translate(0,${y})">
      <text x="0" y="${barH - 4}" font-size="10" fill="var(--text2)">${esc(p.name.slice(0, 22))}</text>
      <rect x="0" y="${barH + 2}" width="${costW}" height="${barH - 4}" rx="2" fill="var(--acc2)" opacity=".8"/>
      <text x="${costW + 4}" y="${barH + barH - 4}" font-size="9" fill="var(--text3)">€${p.totalCost.toFixed(0)}</text>
      <rect x="${costW + 40}" y="${barH + 2}" width="${Math.max(0, revW - costW)}" height="${barH - 4}" rx="2" fill="var(--green)" opacity=".8"/>
      ${p.profit > 0 ? `<text x="${revW + 44}" y="${barH + barH - 4}" font-size="9" fill="var(--green)">+€${p.profit.toFixed(0)}</text>` : ''}
    </g>`;
  }).join('');

  const svgH = projData.length * (barH * 2 + gap) + 20;

  const ovl = document.createElement('div');
  ovl.className = 'overlay open';
  ovl.style.zIndex = '600';
  ovl.innerHTML = `<div class="modal" style="width:640px;max-height:88vh">
    <div class="mhdr"><h3>📊 Winstanalyse</h3><button class="xcls" onclick="this.closest('.overlay').remove()">✕</button></div>
    <div class="mbdy" style="padding:0;overflow-y:auto">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border)">
        <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:var(--acc2)">€${totalCost.toFixed(2)}</div><div style="font-size:11px;color:var(--text2)">Totale inkoop</div></div>
        <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:var(--text)">€${totalRev.toFixed(2)}</div><div style="font-size:11px;color:var(--text2)">Totale omzet</div></div>
        <div style="text-align:center"><div style="font-size:20px;font-weight:700;color:var(--green)">€${totalProfit.toFixed(2)}</div><div style="font-size:11px;color:var(--text2)">Totale winst</div></div>
      </div>
      ${projData.length === 0 ? '<p style="padding:20px;color:var(--text3)">Nog geen builds met verkoopprijs.</p>' : `
      <div style="padding:14px 16px">
        <div style="display:flex;gap:14px;margin-bottom:10px;font-size:11px">
          <span><span style="display:inline-block;width:10px;height:10px;background:var(--acc2);border-radius:2px;margin-right:4px"></span>Inkoop</span>
          <span><span style="display:inline-block;width:10px;height:10px;background:var(--green);border-radius:2px;margin-right:4px"></span>Winst</span>
        </div>
        <svg width="100%" viewBox="0 0 ${W} ${svgH}" style="overflow:visible;max-width:100%">${bars}</svg>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead><tr style="background:var(--surf2)">
          <th style="padding:7px 12px;text-align:left;color:var(--text2);font-size:10px">Project</th>
          <th style="padding:7px 8px;text-align:right;color:var(--text2);font-size:10px">Gebouwd</th>
          <th style="padding:7px 8px;text-align:right;color:var(--text2);font-size:10px">Inkoop</th>
          <th style="padding:7px 8px;text-align:right;color:var(--text2);font-size:10px">Omzet</th>
          <th style="padding:7px 8px;text-align:right;color:var(--text2);font-size:10px">Winst</th>
          <th style="padding:7px 8px;text-align:right;color:var(--text2);font-size:10px">Marge</th>
        </tr></thead>
        <tbody>${projData.map((p, i) => `<tr style="border-bottom:1px solid var(--border);${i % 2 === 0 ? '' : 'background:var(--surf2)'}">
          <td style="padding:7px 12px;color:var(--text)">${esc(p.name)}</td>
          <td style="padding:7px 8px;text-align:right;color:var(--acc)">${p.totalBuilt}×</td>
          <td style="padding:7px 8px;text-align:right;color:var(--acc2)">€${p.totalCost.toFixed(2)}</td>
          <td style="padding:7px 8px;text-align:right">€${p.totalRev.toFixed(2)}</td>
          <td style="padding:7px 8px;text-align:right;color:${p.profit > 0 ? 'var(--green)' : 'var(--red)'}">€${p.profit.toFixed(2)}</td>
          <td style="padding:7px 8px;text-align:right;color:${p.profit > 0 ? 'var(--green)' : 'var(--text3)'}">
            ${p.totalCost > 0 ? Math.round((p.profit / p.totalCost) * 100) + '%' : '—'}
          </td>
        </tr>`).join('')}</tbody>
      </table>`}
      ${years.length > 0 ? `
      <div style="padding:14px 16px;border-top:2px solid var(--border)">
        <div style="font-size:11px;font-weight:700;color:var(--text2);letter-spacing:.06em;text-transform:uppercase;margin-bottom:8px">📅 Jaaroverzicht</div>
        <table style="width:100%;border-collapse:collapse;font-size:12px">
          <thead><tr style="background:var(--surf2)">
            <th style="padding:6px 10px;text-align:left;color:var(--text2);font-size:10px">Jaar</th>
            <th style="padding:6px 8px;text-align:right;color:var(--text2);font-size:10px">Geïnvesteerd</th>
            <th style="padding:6px 8px;text-align:right;color:var(--text2);font-size:10px">Omzet</th>
            <th style="padding:6px 8px;text-align:right;color:var(--text2);font-size:10px">Winst</th>
            <th style="padding:6px 8px;text-align:right;color:var(--text2);font-size:10px">Uren</th>
            <th style="padding:6px 8px;text-align:right;color:var(--text2);font-size:10px">€/uur</th>
          </tr></thead>
          <tbody>${years.map((y, i) => {
    const d = yearMap[y];
    const profit = d.rev - d.cost;
    const perHour = d.hours > 0 ? profit / d.hours : null;
    return `<tr style="border-bottom:1px solid var(--border);${i % 2 === 0 ? '' : 'background:var(--surf2)'}">
            <td style="padding:6px 10px;color:var(--text);font-weight:600">${y}</td>
            <td style="padding:6px 8px;text-align:right;color:var(--acc2)">€${d.cost.toFixed(2)}</td>
            <td style="padding:6px 8px;text-align:right">€${d.rev.toFixed(2)}</td>
            <td style="padding:6px 8px;text-align:right;color:${profit > 0 ? 'var(--green)' : 'var(--red)'}">€${profit.toFixed(2)}</td>
            <td style="padding:6px 8px;text-align:right;color:var(--text3)">${d.hours.toFixed(1)}u</td>
            <td style="padding:6px 8px;text-align:right;color:${perHour === null ? 'var(--text3)' : perHour > 0 ? 'var(--green)' : 'var(--red)'}">${perHour === null ? '—' : '€' + perHour.toFixed(2)}</td>
          </tr>`;
  }).join('')}</tbody>
        </table>
      </div>` : ''}
    </div>
    <div class="mftr"><button class="btn sec" onclick="this.closest('.overlay').remove()">Sluiten</button></div>
  </div>`;
  ovl.addEventListener('click', e => { if (e.target === ovl) ovl.remove(); });
  document.body.appendChild(ovl);
}

// ── GESCHIEDENIS ─────────────────────────────────────────────
function fmtTs(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return 'Zojuist';
  if (diff < 3600) return `${Math.floor(diff / 60)} min geleden`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} uur geleden`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} dag${Math.floor(diff / 86400) === 1 ? '' : 'en'} geleden`;
  return d.toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtDelta(delta) {
  if (delta > 0) return `<span style="color:var(--green)">+${delta}</span>`;
  if (delta < 0) return `<span style="color:var(--red)">${delta}</span>`;
  return `<span style="color:var(--text3)">=${delta}</span>`;
}

function histRowHtml(h) {
  const supp = h.suppId ? suppById(h.suppId) : null;
  const suppDot = supp ? `<span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${esc(supp.color || '#888')};margin-right:3px"></span>${esc(supp.name)}` : '';
  const priceHtml = h.price_paid > 0 && h.delta > 0
    ? `<div style="display:flex;align-items:center;gap:6px;margin-top:2px;flex-wrap:wrap">
        ${suppDot ? `<span style="font-size:10px;color:var(--text3)">${suppDot}</span>` : ''}
        <span style="font-size:11px;color:var(--green);font-weight:600">&euro;${h.price_paid.toFixed(2)}/st</span>
        <span style="font-size:10px;color:var(--text3)">totaal &euro;${(h.price_paid * h.delta).toFixed(2)}</span>
       </div>`
    : '';
  const noteHtml = h.note ? `<div style="font-size:10px;color:var(--text3);margin-top:1px">${esc(h.note)}</div>` : '';
  return `<div style="padding:8px 16px;border-bottom:1px solid var(--border);font-size:12px">
<div style="display:grid;grid-template-columns:1fr 80px 100px 80px;gap:8px;align-items:start">
  <div style="color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;font-weight:500" onclick="closeHistModal();selPart(${h.partId})">${esc(h.partName)}</div>
  <div style="text-align:right;font-family:'JetBrains Mono',monospace">${fmtDelta(h.delta)}</div>
  <div style="text-align:right;font-family:'JetBrains Mono',monospace;color:var(--text2)">${h.from} → ${h.to}</div>
  <div style="text-align:right;font-size:10px;color:var(--text3)">${fmtTs(h.ts)}</div>
</div>
${priceHtml}${noteHtml}
  </div>`;
}

// History tab in detail panel
async function loadHistTab() {
  if (!selId) return;
  const el = document.getElementById('histList');
  el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text3);font-size:12px"><i class="spin">⟳</i> Laden…</div>';
  try {
    const hist = await api(`/api/history?partId=${selId}`);
    if (!hist.length) {
      el.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text3);font-size:12px">Nog geen voorraadwijzigingen</div>';
      return;
    }
    // Sparkline at top
    const sparkHtml = `<div style="padding:12px 16px;border-bottom:1px solid var(--border)">
  <div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:6px">Voorraad over tijd</div>
  ${drawSparkline(hist.slice().reverse(), selId)}
</div>`;
    // Totale inkoopwaarde berekenen
    const totalSpend = hist.filter(h => h.delta > 0 && h.price_paid > 0)
      .reduce((s, h) => s + (h.price_paid * h.delta), 0);
    const spendHtml = totalSpend > 0
      ? `<div style="padding:8px 16px;font-size:11px;color:var(--text2);border-bottom:1px solid var(--border);display:flex;gap:12px;flex-wrap:wrap">
          <span>Totaal betaald: <b style="color:var(--green)">&euro;${totalSpend.toFixed(2)}</b></span>
          <span style="color:var(--text3)">(${hist.filter(h => h.delta > 0 && h.price_paid > 0).length} inkopen met prijs)</span>
         </div>` : '';
    el.innerHTML = sparkHtml + spendHtml + `
  <div style="display:grid;grid-template-columns:1fr 80px 100px 80px;gap:8px;padding:6px 16px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border)">
    <div>Mutatie / Prijs</div><div style="text-align:right">Wijziging</div><div style="text-align:right">Van → Naar</div><div style="text-align:right">Wanneer</div>
  </div>
  ${hist.map(histRowHtml).join('')}`;
  } catch (e) {
    el.innerHTML = `<div style="padding:16px;color:var(--red);font-size:12px">⚠ ${esc(e.message)}</div>`;
  }
}

// Global history modal
let _histAll = [];
async function openHistModal() {
  document.getElementById('histSrch').value = '';
  document.getElementById('histModalList').innerHTML = '<div style="text-align:center;padding:30px;color:var(--text3)"><i class="spin">⟳</i> Laden…</div>';
  document.getElementById('histOvl').classList.add('open');
  try {
    _histAll = await api('/api/history');
    renderHistModal();
  } catch (e) {
    document.getElementById('histModalList').innerHTML = `<div style="padding:16px;color:var(--red);font-size:12px">⚠ ${esc(e.message)}</div>`;
  }
}
function closeHistModal() { document.getElementById('histOvl').classList.remove('open'); }

function renderHistModal() {
  const q = (document.getElementById('histSrch').value || '').toLowerCase();
  const list = q ? _histAll.filter(h => h.partName.toLowerCase().includes(q)) : _histAll;
  if (!list.length) {
    document.getElementById('histModalList').innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3);font-size:13px">Geen resultaten</div>';
    return;
  }
  document.getElementById('histModalList').innerHTML = `
<div style="display:grid;grid-template-columns:1fr 80px 100px 80px;gap:8px;padding:6px 16px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);border-bottom:1px solid var(--border);position:sticky;top:0;background:var(--surf)">
  <div>Onderdeel</div><div style="text-align:right">Wijziging</div><div style="text-align:right">Van → Naar</div><div style="text-align:right">Wanneer</div>
</div>
${list.map(histRowHtml).join('')}`;
}

// ── ZOEKGESCHIEDENIS ─────────────────────────────────────────
let _searchHistory = JSON.parse(localStorage.getItem('hb_srch_hist') || '[]');

function addSearchHistory(q) {
  if (!q || q.length < 2) return;
  _searchHistory = _searchHistory.filter(x => x !== q);
  _searchHistory.unshift(q);
  if (_searchHistory.length > 8) _searchHistory = _searchHistory.slice(0, 8);
  localStorage.setItem('hb_srch_hist', JSON.stringify(_searchHistory));
}

function showSearchHistory() {
  const el = document.getElementById('srchHistory');
  const inp = document.getElementById('srch');
  if (!_searchHistory.length) { el.style.display = 'none'; return; }
  const q = inp.value.toLowerCase();
  const filtered = q ? _searchHistory.filter(h => h.toLowerCase().includes(q)) : _searchHistory;
  if (!filtered.length) { el.style.display = 'none'; return; }
  // Position under search bar
  const rect = inp.getBoundingClientRect();
  el.style.top = (rect.bottom + 2) + 'px';
  el.style.left = rect.left + 'px';
  el.style.width = rect.width + 'px';
  el.innerHTML = filtered.map(h => `
<div style="padding:7px 12px;font-size:12px;color:var(--text2);cursor:pointer;display:flex;align-items:center;gap:8px;transition:background .1s"
  onmouseover="this.style.background='var(--surf2)'" onmouseout="this.style.background=''"
  onclick="pickSearchHistory('${esc(h)}')">
  <span style="color:var(--text3);font-size:11px">🕐</span>
  <span style="flex:1">${esc(h)}</span>
  <span onclick="event.stopPropagation();removeSearchHistory('${esc(h)}')" style="color:var(--text3);font-size:11px;padding:2px 4px">✕</span>
</div>`).join('');
  el.style.display = '';
}

function pickSearchHistory(q) {
  document.getElementById('srch').value = q;
  document.getElementById('srchHistory').style.display = 'none';
  srch = q; window._lowStockMode = false; catF = null;
  document.getElementById('vTitle').textContent = `Zoekresultaten: "${q}"`;
  renderSidebar(); renderTable();
}

function removeSearchHistory(q) {
  _searchHistory = _searchHistory.filter(x => x !== q);
  localStorage.setItem('hb_srch_hist', JSON.stringify(_searchHistory));
  showSearchHistory();
}

// ── GERELATEERDE ONDERDELEN ───────────────────────────────────
function renderRelatedParts() {
  if (!selId) return;
  const p = parts.find(x => x.id === selId); if (!p) return;
  const el = document.getElementById('relatedBody');
  const related = p.related || [];

  // Auto-suggest: same category, same location
  const suggestions = parts.filter(x =>
    x.id !== selId && x.active !== false &&
    !related.includes(x.id) &&
    (x.catId === p.catId || x.locId === p.locId)
  ).slice(0, 6);

  let html = '';

  // Manually linked
  if (related.length) {
    html += `<div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text2);margin-bottom:8px">Gekoppeld</div>`;
    html += related.map(rid => {
      const rp = parts.find(x => x.id === rid);
      if (!rp) return '';
      const q = rp.stock || 0;
      return `<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="selPart(${rid})">
    ${rp.img ? `<img src="${esc(rp.img)}" style="width:28px;height:28px;border-radius:4px;object-fit:cover;flex-shrink:0">` : `<div style="width:28px;height:28px;border-radius:4px;background:var(--surf2);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0">📦</div>`}
    <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;color:var(--text)">${esc(rp.name)}</div><div style="font-size:10px;color:var(--text3)">${esc(cat(rp.catId))}</div></div>
    <span class="${qClass(q, rp.minStock)}" style="font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700">${q}</span>
    <button class="abtn del" onclick="event.stopPropagation();unlinkRelated(${rid})" style="font-size:10px" title="Ontkoppelen">✕</button>
  </div>`;
    }).join('');
  }

  // Add link
  html += `<div style="margin:${related.length ? '12px' : '0'} 0 10px;display:flex;gap:6px">
<select id="relSel" style="flex:1;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px;padding:5px 8px;outline:none">
  <option value="">+ Onderdeel koppelen...</option>
  ${parts.filter(x => x.id !== selId && x.active !== false && !related.includes(x.id)).sort((a, b) => a.name.localeCompare(b.name, 'nl')).map(x => `<option value="${x.id}">${esc(x.name)}</option>`).join('')}
</select>
<button class="btn" onclick="linkRelated()" style="font-size:12px;padding:5px 10px">Koppel</button>
  </div>`;

  // Suggestions
  if (suggestions.length) {
    html += `<div style="font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text2);margin:8px 0 6px">Suggesties (zelfde locatie/categorie)</div>`;
    html += suggestions.map(sp => `
  <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">
    <div style="flex:1;min-width:0;cursor:pointer" onclick="selPart(${sp.id})"><div style="font-size:12px;color:var(--text2)">${esc(sp.name)}</div></div>
    <button class="abtn" onclick="quickLinkRelated(${sp.id})" style="font-size:10px">+ Koppel</button>
  </div>`).join('');
  }

  el.innerHTML = html || '<div style="text-align:center;padding:20px;color:var(--text3);font-size:12px">Geen gerelateerde onderdelen</div>';
}

async function linkRelated() {
  const sel = document.getElementById('relSel');
  const rid = parseInt(sel.value); if (!rid) return;
  await _addRelated(rid);
  renderRelatedParts();
}
async function quickLinkRelated(rid) { await _addRelated(rid); renderRelatedParts(); }

async function _addRelated(rid) {
  const p = parts.find(x => x.id === selId); if (!p) return;
  const related = [...new Set([...(p.related || []), rid])];
  const updated = await api(`/api/parts/${selId}`, 'PUT', { ...p, related });
  const i = parts.findIndex(x => x.id === selId); if (i >= 0) parts[i] = updated;
  toast('Gekoppeld');
}

async function unlinkRelated(rid) {
  const p = parts.find(x => x.id === selId); if (!p) return;
  const related = (p.related || []).filter(x => x !== rid);
  const updated = await api(`/api/parts/${selId}`, 'PUT', { ...p, related });
  const i = parts.findIndex(x => x.id === selId); if (i >= 0) parts[i] = updated;
  renderRelatedParts();
  toast('Ontkoppeld');
}

// Show related in info tab too
function relatedInlineHtml(p) {
  const related = (p.related || []).map(rid => parts.find(x => x.id === rid)).filter(Boolean);
  if (!related.length) return '';
  return `<div class="dr"><span class="dl">Gerelateerd</span><span class="dv" style="font-family:'Inter',sans-serif">
${related.map(rp => `<span onclick="selPart(${rp.id})" style="cursor:pointer;color:var(--acc2);display:inline-block;margin-right:4px">${esc(rp.name)}</span>`).join('')}
  </span></div>`;
}

// ── LOCATIE OVERZICHT PRINTEN ─────────────────────────────────
let _kastPrintId = null;

function printLocOverview() {
  // Build print page with current kast contents
  const kastId = _kastPrintId;
  if (!kastId) return;
  const kastDef = KAST_ROOTS.find(k => k.id === kastId) || { name: LOCS[kastId] || 'Locatie', children: [] };
  const allChildren = [...kastDef.children];
  Object.entries(LOCS).forEach(([cid, cname]) => {
    if (cname.startsWith(kastDef.name + '/') && !allChildren.includes(parseInt(cid))) allChildren.push(parseInt(cid) || cid);
  });

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>${kastDef.name} — Overzicht</title>
  <style>
body{font-family:Arial,sans-serif;font-size:11pt;margin:15mm}
h1{font-size:16pt;margin-bottom:4px}
.sub{color:#666;font-size:10pt;margin-bottom:12px}
.vak{margin-bottom:12px;break-inside:avoid}
.vak-title{font-weight:bold;font-size:11pt;background:#f5f5f5;padding:3px 8px;border-left:3px solid #f0c040}
.part-row{display:flex;padding:2px 8px;border-bottom:1px solid #eee;font-size:10pt}
.part-name{flex:1}
.part-ipn{color:#888;width:100px}
.part-qty{width:40px;text-align:right;font-weight:bold}
.empty{color:#aaa;font-style:italic;padding:2px 8px;font-size:10pt}
@media print{body{margin:10mm}}
  ${'</'}style>${'</'}head><body>
  <h1>${kastDef.icon || '📦'} ${kastDef.name}</h1>
  <div class="sub">Geprint op ${new Date().toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'long', year: 'numeric' })}</div>`);

  allChildren.sort((a, b) => (LOCS[a] || '').localeCompare(LOCS[b] || '', 'nl')).forEach(vakId => {
    const vakName = LOCS[vakId] || String(vakId);
    const shortName = vakName.includes('/') ? vakName.split('/').pop() : vakName;
    const vakParts = parts.filter(p => p.active !== false && String(p.locId) === String(vakId)).sort((a, b) => a.name.localeCompare(b.name, 'nl'));
    win.document.write(`<div class="vak"><div class="vak-title">${shortName}</div>`);
    if (vakParts.length) {
      vakParts.forEach(p => {
        win.document.write(`<div class="part-row"><span class="part-name">${p.name}</span><span class="part-ipn">${p.IPN || ''}</span><span class="part-qty">${p.stock || 0}</span></div>`);
      });
    } else {
      win.document.write('<div class="empty">leeg</div>');
    }
    win.document.write('</div>');
  });
  win.document.write('<' + '/body><' + '/html>');
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ── SLIMME SUGGESTIES ─────────────────────────────────────────
function checkSmartSuggestions() {
  const suggestions = [];
  // Only suggest parts without location (max 5, don't overwhelm)
  const noLoc = parts.filter(p => p.active !== false && !p.locId).slice(0, 5);
  noLoc.forEach(p => suggestions.push({ type: 'noloc', part: p, msg: `"${p.name}" heeft geen locatie` }));

  if (suggestions.length) {
    const btn = document.getElementById('suggestBtn');
    const badge = document.getElementById('suggestBadge');
    if (btn) { btn.style.display = ''; }
    if (badge) { badge.textContent = `💡 ${suggestions.length}`; }
  }
  window._suggestions = suggestions;
  updateAlertCenter();
}

function openSuggestions() {
  if (!window._suggestions?.length) return;
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.innerHTML = `<div class="modal" style="width:480px">
<div class="mhdr"><h3>💡 Suggesties</h3><button class="xcls" onclick="this.closest('.overlay').remove()">✕</button></div>
<div class="mbdy">
  ${window._suggestions.map(s => `<div style="padding:10px 0;border-bottom:1px solid var(--border);font-size:12px">
    <div style="color:var(--text);margin-bottom:4px">${esc(s.msg)}</div>
    <div style="display:flex;gap:6px">
      <button class="abtn" onclick="this.closest('.overlay').remove();selPart(${s.part.id})" style="font-size:11px">Bekijk</button>
      ${s.type === 'inactive' ? `<button class="abtn" onclick="archivePart(${s.part.id},this)" style="font-size:11px">Archiveer</button>` : ''}
      ${s.type === 'noloc' ? `<button class="abtn" onclick="this.closest('.overlay').remove();openEdit(${s.part.id})" style="font-size:11px">Locatie instellen</button>` : ''}
    </div>
  </div>`).join('')}
</div>
  </div>`;
  document.body.appendChild(modal);
}

async function unarchivePart(id) {
  const p = parts.find(x => x.id === id); if (!p) return;
  const updated = await api(`/api/parts/${id}`, 'PUT', { ...p, active: true });
  const i = parts.findIndex(x => x.id === id); if (i >= 0) parts[i] = updated;
  renderTable(); renderSidebar();
  selPart(id);
  toast(`✓ "${p.name}" hersteld`);
}

async function archivePart(id, btn) {
  const p = parts.find(x => x.id === id); if (!p) return;
  await api(`/api/parts/${id}`, 'PUT', { ...p, active: false });
  p.active = false;
  btn.closest('.overlay').remove();
  renderTable(); renderSidebar();
  toast(`"${p.name}" gearchiveerd`);
}

// ── AUTO REFRESH ──────────────────────────────────────────────
let _refreshInterval = parseInt(localStorage.getItem('hb_refresh') || '0');
let _refreshTimer = null;

function setAutoRefresh(minutes) {
  _refreshInterval = parseInt(minutes) || 0;
  localStorage.setItem('hb_refresh', _refreshInterval);
  clearInterval(_refreshTimer);
  if (_refreshInterval > 0) {
    _refreshTimer = setInterval(async () => {
      await loadAll();
      renderSidebar();
      renderTable();
      toast('🔄 Vernieuwd');
    }, _refreshInterval * 60 * 1000);
    toast('🔄 Auto-refresh: elke ' + _refreshInterval + ' minuten');
  } else {
    toast('Auto-refresh uitgeschakeld');
  }
}

function openRefreshSettings() {
  const opts = [0, 1, 2, 5, 10, 15, 30];
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.innerHTML = `<div class="modal" style="width:320px">
<div class="mhdr"><h3>🔄 Auto-refresh</h3><button class="xcls" onclick="this.closest('.overlay').remove()">✕</button></div>
<div class="mbdy">
  <div class="field">
    <label>Vernieuwen elke</label>
    <select id="refreshSel" style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:13px;padding:7px 10px;outline:none">
      <option value="0" ${_refreshInterval === 0 ? 'selected' : ''}>Uitgeschakeld</option>
      <option value="1" ${_refreshInterval === 1 ? 'selected' : ''}>1 minuut</option>
      <option value="2" ${_refreshInterval === 2 ? 'selected' : ''}>2 minuten</option>
      <option value="5" ${_refreshInterval === 5 ? 'selected' : ''}>5 minuten (aanbevolen)</option>
      <option value="10" ${_refreshInterval === 10 ? 'selected' : ''}>10 minuten</option>
      <option value="15" ${_refreshInterval === 15 ? 'selected' : ''}>15 minuten</option>
      <option value="30" ${_refreshInterval === 30 ? 'selected' : ''}>30 minuten</option>
    </select>
  </div>
  <div style="font-size:11px;color:var(--text2);padding:0 0 4px">
    Hiermee worden de gegevens automatisch opgehaald van de server — handig als je de app op meerdere apparaten gebruikt.
  </div>
</div>
<div class="mftr">
  <button class="btn sec" onclick="this.closest('.overlay').remove()">Annuleer</button>
  <button class="btn" onclick="setAutoRefresh(document.getElementById('refreshSel').value);this.closest('.overlay').remove()">Opslaan</button>
</div>
  </div>`;
  document.body.appendChild(modal);
}

// ── ALLEEN-LEZEN MODUS ────────────────────────────────────────
let _readOnly = localStorage.getItem('hb_readonly') === '1';

function toggleReadOnly() {
  _readOnly = !_readOnly;
  localStorage.setItem('hb_readonly', _readOnly ? '1' : '0');
  applyReadOnly();
  toast(_readOnly ? '🔒 Alleen-lezen modus aan' : '🔓 Bewerken weer mogelijk');
}

function applyReadOnly() {
  document.body.classList.toggle('readonly', _readOnly);
  document.querySelectorAll('.js-readonly .mm-lbl').forEach(el => {
    el.textContent = _readOnly ? 'Bewerken inschakelen' : 'Alleen-lezen';
  });
  document.querySelectorAll('.js-readonly .ic').forEach(el => { el.textContent = _readOnly ? '🔓' : '🔒'; });
}

// ── PAKBON GENERATOR ──────────────────────────────────────────
function openPackingSlip() {
  // Pick from projects or manual
  const projOpts = projects.map(p => `<option value="proj-${p.id}">${esc(p.name)}</option>`).join('');
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'packSlipOvl';
  modal.innerHTML = `<div class="modal" style="width:480px">
<div class="mhdr"><h3>📋 Pakbon genereren</h3><button class="xcls" onclick="this.closest('.overlay').remove()">✕</button></div>
<div class="mbdy">
  <div class="field"><label>Gebaseerd op</label>
    <select id="packSource">
      <option value="">— handmatig —</option>
      ${projOpts}
    </select>
  </div>
  <div class="field"><label>Ontvanger</label><input type="text" id="packTo" placeholder="Naam / adres"></div>
  <div class="field"><label>Referentie</label><input type="text" id="packRef" placeholder="Ordernummer of omschrijving"></div>
  <div class="field"><label>Notitie</label><input type="text" id="packNote" placeholder="Optionele notitie"></div>
</div>
<div class="mftr">
  <button class="btn sec" onclick="this.closest('.overlay').remove()">Annuleer</button>
  <button class="btn" onclick="generatePackingSlip()">📋 Genereren</button>
</div>
  </div>`;
  document.body.appendChild(modal);
}

function generatePackingSlip() {
  const source = document.getElementById('packSource').value;
  const to = document.getElementById('packTo').value;
  const ref = document.getElementById('packRef').value;
  const note = document.getElementById('packNote').value;
  const date = new Date().toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });

  let items = [];
  if (source.startsWith('proj-')) {
    const projId = parseInt(source.replace('proj-', ''));
    const proj = projects.find(p => p.id === projId);
    if (proj) items = (proj.items || []).map(item => {
      const p = parts.find(x => x.id === item.partId);
      return { name: p?.name || '#' + item.partId, ipn: p?.IPN || '', qty: item.qty, loc: loc(p?.locId) };
    });
  }

  document.querySelector('#packSlipOvl')?.remove();

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head><title>Pakbon ${ref || date}</title>
  <style>
body{font-family:Arial,sans-serif;font-size:11pt;margin:15mm;color:#000}
.hdr{display:flex;justify-content:space-between;margin-bottom:16px;padding-bottom:12px;border-bottom:2px solid #000}
.logo{font-size:18pt;font-weight:bold}
.logo span{font-weight:normal;color:#666}
.meta{text-align:right;font-size:10pt;color:#444}
.to{margin-bottom:16px;font-size:11pt}
table{width:100%;border-collapse:collapse;margin-top:8px}
th{background:#f5f5f5;padding:6px 10px;text-align:left;font-size:10pt;border-bottom:2px solid #ccc}
td{padding:6px 10px;border-bottom:1px solid #eee;font-size:10pt}
.qty{text-align:right;font-weight:bold}
.footer{margin-top:20px;font-size:9pt;color:#888;border-top:1px solid #eee;padding-top:8px}
@media print{body{margin:8mm}}
  ${'</'}style>${'</'}head><body>
  <div class="hdr">
<div><div class="logo">HuizeBruin <span>Inventaris</span></div><div style="font-size:10pt;color:#666">huizebruin.nl</div></div>
<div class="meta"><b>PAKBON</b><br>${date}${ref ? `<br>Ref: ${ref}` : ''}</div>
  </div>
  ${to ? `<div class="to"><b>Aan:</b><br>${to.replace(/\n/g, '<br>')}</div>` : ''}
  <table>
<thead><tr><th>Onderdeel</th><th>IPN</th><th>Locatie</th><th class="qty">Aantal</th></tr></thead>
<tbody>
${items.length
      ? items.map(i => `<tr><td>${i.name}</td><td style="color:#888;font-family:monospace">${i.ipn}</td><td style="color:#666">${i.loc}</td><td class="qty">${i.qty}</td></tr>`).join('')
      : '<tr><td colspan="4" style="color:#aaa;text-align:center;padding:20px">Voeg onderdelen toe via een project</td></tr>'
    }
</tbody>
  </table>
  ${note ? `<div style="margin-top:12px;padding:8px 10px;background:#f9f9f9;font-size:10pt;color:#555">Notitie: ${note}</div>` : ''}
  <div class="footer">Gegenereerd door HuizeBruin Inventaris • ${date}</div>
  ${'</'}body>${'</'}html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ── VERPAKKINGSMATERIAAL TELLER ───────────────────────────────
function openPackagingCounter() {
  // Find parts in verpakkingsmateriaal category (270-275) or with specific keywords
  const packParts = parts.filter(p =>
    p.active !== false && (
      [270, 271, 272, 273, 274, 275].includes(p.catId) ||
      ['envelop', 'bubble', 'mailer', 'tape', 'zak', 'bag'].some(k => p.name.toLowerCase().includes(k))
    )
  ).sort((a, b) => a.name.localeCompare(b.name, 'nl'));

  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.innerHTML = `<div class="modal" style="width:420px">
<div class="mhdr"><h3>📦 Verpakkingsmateriaal</h3><button class="xcls" onclick="this.closest('.overlay').remove()">✕</button></div>
<div class="mbdy" style="padding:0">
  ${packParts.length ? packParts.map(p => {
    const q = p.stock || 0, qc = qClass(q, p.minStock);
    return `<div style="display:flex;align-items:center;gap:10px;padding:10px 16px;border-bottom:1px solid var(--border)">
      <div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--text)">${esc(p.name)}</div><div style="font-size:11px;color:var(--text3)">${esc(loc(p.locId))}</div></div>
      <button onclick="quickAdj(${p.id},-1,this)" style="background:var(--surf2);border:1px solid var(--border);border-radius:4px;width:32px;height:32px;font-size:18px;cursor:pointer;color:var(--text2)">−</button>
      <span id="pkq-${p.id}" class="${qc}" style="font-family:'JetBrains Mono',monospace;font-size:18px;font-weight:700;min-width:32px;text-align:center">${q}</span>
      <button onclick="quickAdj(${p.id},1,this)" style="background:var(--surf2);border:1px solid var(--border);border-radius:4px;width:32px;height:32px;font-size:18px;cursor:pointer;color:var(--text2)">+</button>
    </div>`;
  }).join('') : `<div style="text-align:center;padding:30px;color:var(--text3);font-size:12px">Geen verpakkingsmateriaal gevonden.<br>Voeg onderdelen toe aan categorie "Verbruiksartikelen".</div>`}
</div>
  </div>`;
  document.body.appendChild(modal);
}

async function quickAdj(id, delta, btn) {
  const p = parts.find(x => x.id === id); if (!p) return;
  btn.disabled = true;
  const r = await api(`/api/parts/${id}/stock`, 'PATCH', { delta });
  p.stock = r.stock;
  const el = document.getElementById('pkq-' + id);
  if (el) { el.textContent = r.stock; el.className = qClass(r.stock, p.minStock); }
  btn.disabled = false;
}

// ── MEEST GEBRUIKTE LOCATIES (voor dashboard) ─────────────────
function buildTopLocations() {
  const locCounts = {};
  parts.filter(p => p.active !== false && p.locId).forEach(p => {
    locCounts[p.locId] = (locCounts[p.locId] || 0) + 1;
  });
  const top = Object.entries(locCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!top.length) return '';
  const max = top[0][1];
  return top.map(([id, n]) => `
<div class="dash-bar-row">
  <div class="dash-bar-label">${esc(loc(parseInt(id) || id))}</div>
  <div class="dash-bar-track"><div class="dash-bar-fill" style="width:${Math.round(n / max * 100)}%;background:var(--acc2)"></div></div>
  <div class="dash-bar-count" style="color:var(--acc2)">${n}</div>
</div>`).join('');
}

// ── WEKELIJKSE ACTIVITEIT (voor dashboard) ────────────────────
function buildWeeklyActivity(history) {
  // Group by week
  const weeks = {};
  history.forEach(h => {
    const d = new Date(h.ts);
    const mon = new Date(d); mon.setDate(d.getDate() - d.getDay() + 1);
    const key = mon.toISOString().slice(0, 10);
    if (!weeks[key]) weeks[key] = { in: 0, out: 0, label: mon.toLocaleDateString(HB_LOCALE, { day: 'numeric', month: 'short' }) };
    if (h.delta > 0) weeks[key].in += h.delta;
    else weeks[key].out += Math.abs(h.delta);
  });
  const sorted = Object.entries(weeks).sort((a, b) => a[0].localeCompare(b[0])).slice(-8);
  if (sorted.length < 2) return '<p style="color:var(--text3);font-size:12px">Nog niet genoeg data (minimaal 2 weken).</p>';
  const maxVal = Math.max(...sorted.map(([, v]) => Math.max(v.in, v.out)), 1);
  const W = 100 / sorted.length;
  return `<div style="display:flex;align-items:flex-end;gap:2px;height:80px;margin-bottom:4px">
${sorted.map(([, v]) => `
  <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:1px;height:100%;justify-content:flex-end">
    <div style="width:45%;background:var(--green);border-radius:2px 2px 0 0" title="+${v.in}" style2="height:${Math.round(v.in / maxVal * 72)}px"></div>
    <div style="width:45%;background:var(--orange);border-radius:2px 2px 0 0" title="-${v.out}"></div>
  </div>`).join('')}
  </div>
  <div style="display:flex;gap:2px">
${sorted.map(([, v]) => `<div style="flex:1;font-size:9px;color:var(--text3);text-align:center;overflow:hidden;text-overflow:ellipsis">${v.label}</div>`).join('')}
  </div>
  <div style="display:flex;gap:12px;margin-top:6px;font-size:11px">
<span style="color:var(--green)">▬ Ingeboekt</span>
<span style="color:var(--orange)">▬ Uitgenomen</span>
  </div>`;
}

// ── SCAN MODUS ────────────────────────────────────────────────
let _scanMode = 'find'; // 'find' | 'in' | 'out'

function setScanMode(mode) {
  _scanMode = mode;
  ['find', 'in', 'out'].forEach(m => {
    const cap = m.charAt(0).toUpperCase() + m.slice(1);
    const old = document.getElementById('scanMode' + cap);
    if (old) { old.style.background = m === mode ? 'var(--acc)' : 'none'; old.style.color = m === mode ? '#000' : 'var(--text2)'; }
    const nw = document.getElementById('sqMode' + cap);
    if (nw) { nw.classList.toggle('on', m === mode); nw.setAttribute('aria-pressed', m === mode ? 'true' : 'false'); }
  });
  const descs = { find: 'Scan om een onderdeel te zoeken en te openen.', in: 'Scan om +1 in te boeken. Meerdere scans achter elkaar mogelijk.', out: 'Scan om −1 uit te boeken. Meerdere scans achter elkaar mogelijk.' };
  ['scanModeDesc', 'sqDesc'].forEach(id => { const d = document.getElementById(id); if (d) d.textContent = descs[mode]; });
}

async function handleScanResult(val, manual) {
  if (_scanBusy) return;
  _scanBusy = true;
  try {
    stopScan();
    const u = scanUI(), resultEl = scanEl(u, 'result');
    resultEl.textContent = 'Gescand: ' + val;
    resultEl.style.display = '';
    const v = val.trim().toLowerCase();
    const match = parts.find(p => (p.IPN && p.IPN.toLowerCase() === v) || p.name.toLowerCase() === v || String(p.id) === v);
    // Een QR met vaste link (…?part=12) werkt ook
    const m2 = !match && /[?&]part=(\d+)/.exec(val);
    const hit = match || (m2 ? parts.find(p => p.id === +m2[1]) : null);

    if (!hit) {
      resultEl.innerHTML = `Gescand: <b>${esc(val)}</b><br><span style="color:var(--text3)">Geen onderdeel gevonden.</span>`;
      if (!u.ovl) toast('Geen onderdeel gevonden: ' + val);
      if (u.ovl && !manual) setTimeout(startScan, 1200);
      return;
    }

    if (_scanMode === 'find') {
      toast(`✓ Gevonden: ${hit.name}`);
      if (u.ovl) closeScanOvl();
      setTimeout(() => selPart(hit.id), 300);
    } else {
      const delta = _scanMode === 'in' ? 1 : -1;
      const r = await api(`/api/parts/${hit.id}/stock`, 'PATCH', { delta });
      hit.stock = r.stock;
      const log = scanEl(u, 'log');
      const entry = document.createElement('div');
      entry.textContent = `${_scanMode === 'in' ? '✓ +1' : '✓ −1'} ${hit.name} → ${r.stock}`;
      entry.style.cssText = 'padding:2px 0;border-bottom:1px solid var(--border)';
      log?.prepend(entry);
      if (!u.ovl) toast(`${_scanMode === 'in' ? '+1' : '-1'} ${hit.name} (${r.stock})`);
      renderTable();
      if (typeof paintQty === 'function') paintQty(hit);
      // Blijf scannen
      setTimeout(() => { if (!u.ovl || document.getElementById('scanOvl').classList.contains('open')) startScan(); }, 800);
    }
  } finally { _scanBusy = false; }
}

// ── BULK LABELS PRINTEN ───────────────────────────────────────
function bulkPrintLabels() {
  const ids = getSelectedIds();
  if (!ids.length) { toast('Geen onderdelen geselecteerd'); return; }
  openPrintModal(null, ids);
}

// ── EXCEL EXPORT ──────────────────────────────────────────────
function exportExcel() {
  const active = parts.filter(p => p.active !== false);
  // Build CSV with Excel-compatible BOM
  const headers = ['ID', 'Naam', 'Beschrijving', 'IPN', 'Categorie', 'Locatie', 'Voorraad', 'Min. voorraad', 'Prijs p/st', 'Leverancier', 'Tags', 'Link'];
  const rows = active.map(p => {
    const prices = (p.suppliers || []).map(s => s.price).filter(Boolean);
    const price = prices.length ? Math.min(...prices) : '';
    const supp = (p.suppliers || []).map(s => suppById(s.suppId)?.name || '').filter(Boolean).join(', ');
    const tags = (p.tags || []).join(', ');
    return [p.id, p.name, p.desc || '', p.IPN || '', cat(p.catId), loc(p.locId), p.stock || 0, p.minStock || 0, price, supp, tags, p.link || '']
      .map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });
  const csv = '\uFEFF' + headers.map(h => `"${h}"`).join(',') + '\n' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `hb-inventaris-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast(`📊 ${active.length} onderdelen geëxporteerd`);
}

// ── BROWSER NOTIFICATIES ──────────────────────────────────────
let _notifEnabled = localStorage.getItem('hb_notif') === '1';

async function requestNotifPermission() {
  if (!('Notification' in window)) { toast('Browser ondersteunt geen notificaties'); return; }
  const perm = await Notification.requestPermission();
  _notifEnabled = perm === 'granted';
  localStorage.setItem('hb_notif', _notifEnabled ? '1' : '0');
  toast(_notifEnabled ? '🔔 Notificaties ingeschakeld' : 'Notificaties geweigerd');
}

function sendLowStockNotif(part) {
  if (!_notifEnabled || Notification.permission !== 'granted') return;
  new Notification('⚠ Lage voorraad — HuizeBruin', {
    body: `${part.name}: nog ${part.stock} (min. ${part.minStock})`,
    icon: '/favicon-32.png',
    tag: 'low-stock-' + part.id,
  });
}

// Centrale check: roep dit aan na ELKE stock-mutatie (adjust, set, build, bulk import)
function checkAndNotifyLowStock(p) {
  if (p && p.minStock > 0 && (p.stock || 0) < p.minStock) {
    fireWebhook('low_stock', { id: p.id, name: p.name, stock: p.stock, minStock: p.minStock, locId: p.locId });
    sendLowStockNotif(p);
  }
}

function checkLowStockNotifs() {
  if (!_notifEnabled) return;
  parts.filter(p => p.active !== false && p.minStock > 0 && (p.stock || 0) < p.minStock)
    .slice(0, 3) // max 3 tegelijk
    .forEach(p => sendLowStockNotif(p));
}

// ── BULK LABELS (update openPrintModal to accept ids) ─────────
function getSelectedIds() {
  return Array.from(document.querySelectorAll('.row-cb:checked')).map(cb => parseInt(cb.dataset.id));
}

function updateBulkBar() {
  const ids = getSelectedIds();
  const bar = document.getElementById('bulkBar');
  bar.style.display = ids.length ? 'flex' : 'none';
  document.getElementById('bulkCount').textContent = ids.length;
}

function toggleSelectAll(cb) {
  document.querySelectorAll('.row-cb').forEach(c => c.checked = cb.checked);
  updateBulkBar();
}

function clearSelection() {
  document.querySelectorAll('.row-cb').forEach(c => c.checked = false);
  const sa = document.getElementById('selectAll'); if (sa) sa.checked = false;
  updateBulkBar();
}

async function bulkSetLocation() {
  const ids = getSelectedIds(); if (!ids.length) return;
  const allLocs = Object.entries(LOCS).sort((a, b) => a[1].localeCompare(b[1], 'nl'));
  const sel = document.createElement('select');
  sel.style.cssText = 'width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:"JetBrains Mono",monospace;font-size:13px;padding:8px 10px;outline:none;margin-bottom:10px';
  sel.innerHTML = '<option value="">— geen locatie —</option>' + allLocs.map(([id, n]) => `<option value="${id}">${esc(n)}</option>`).join('');
  const dlg = _bulkDialog(`📍 Locatie wijzigen voor ${ids.length} onderdelen`, sel, async () => {
    const locId = sel.value ? parseInt(sel.value) || sel.value : null;
    for (const id of ids) {
      const p = parts.find(x => x.id === id); if (!p) continue;
      const updated = await api(`/api/parts/${id}`, 'PUT', { ...p, locId });
      const i = parts.findIndex(x => x.id === id); if (i >= 0) parts[i] = updated;
    }
    clearSelection(); renderTable(); toast(`✓ Locatie gewijzigd voor ${ids.length} onderdelen`);
  });
  document.body.appendChild(dlg);
}

async function bulkSetCategory() {
  const ids = getSelectedIds(); if (!ids.length) return;
  const sel = document.createElement('select');
  sel.style.cssText = 'width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:"JetBrains Mono",monospace;font-size:13px;padding:8px 10px;outline:none;margin-bottom:10px';
  sel.innerHTML = '<option value="">— geen categorie —</option>' + Object.entries(CATS).sort((a, b) => a[1].localeCompare(b[1], 'nl')).map(([id, n]) => `<option value="${id}">${esc(n)}</option>`).join('');
  const dlg = _bulkDialog(`🏷 Categorie wijzigen voor ${ids.length} onderdelen`, sel, async () => {
    const catId = parseInt(sel.value) || null;
    for (const id of ids) {
      const p = parts.find(x => x.id === id); if (!p) continue;
      const updated = await api(`/api/parts/${id}`, 'PUT', { ...p, catId });
      const i = parts.findIndex(x => x.id === id); if (i >= 0) parts[i] = updated;
    }
    clearSelection(); renderTable(); renderSidebar(); toast(`✓ Categorie gewijzigd voor ${ids.length} onderdelen`);
  });
  document.body.appendChild(dlg);
}

async function bulkAdjStock() {
  const ids = getSelectedIds(); if (!ids.length) return;
  const inp = document.createElement('input');
  inp.type = 'number'; inp.placeholder = 'bv. +5 of -3 of =10';
  inp.style.cssText = 'width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:"JetBrains Mono",monospace;font-size:14px;padding:8px 10px;outline:none;margin-bottom:10px';
  const note = document.createElement('div');
  note.style.cssText = 'font-size:11px;color:var(--text3);margin-bottom:10px';
  note.textContent = 'Gebruik + of − voor relatief (bv. -2), of een getal voor absoluut instellen';
  const wrap = document.createDocumentFragment(); wrap.appendChild(note); wrap.appendChild(inp);
  const dlg = _bulkDialog(`🔢 Voorraad aanpassen voor ${ids.length} onderdelen`, wrap, async () => {
    const v = inp.value.trim();
    if (!v) return;
    for (const id of ids) {
      if (v.startsWith('+')) await api(`/api/parts/${id}/stock`, 'PATCH', { delta: parseInt(v) });
      else if (v.startsWith('-')) await api(`/api/parts/${id}/stock`, 'PATCH', { delta: parseInt(v) });
      else await api(`/api/parts/${id}/stock`, 'PATCH', { set: parseInt(v) });
      const p = parts.find(x => x.id === id);
    }
    await loadAll(); clearSelection(); renderTable(); toast(`✓ Voorraad aangepast voor ${ids.length} onderdelen`);
  });
  document.body.appendChild(dlg);
}

async function bulkAddTag() {
  const ids = getSelectedIds(); if (!ids.length) return;
  const allTags = getAllTags();
  const wrap = document.createElement('div');
  wrap.innerHTML = `<div style="margin-bottom:8px;font-size:12px;color:var(--text2)">Nieuwe tag of kies bestaande:</div>
    <input id="_bulkTagInp" type="text" placeholder="tag naam..." list="_bulkTagList"
      style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:13px;padding:7px 10px;outline:none;margin-bottom:6px">
    <datalist id="_bulkTagList">${allTags.map(t => `<option value="${esc(t)}">`).join('')}</datalist>`;
  const dlg = _bulkDialog(`🏷 Tag toevoegen aan ${ids.length} onderdelen`, wrap, async () => {
    const tag = document.getElementById('_bulkTagInp').value.trim();
    if (!tag) return;
    for (const id of ids) {
      const p = parts.find(x => x.id === id); if (!p) continue;
      const tags = [...new Set([...(p.tags || []), tag])];
      const updated = await api(`/api/parts/${id}`, 'PUT', { ...p, tags });
      const i = parts.findIndex(x => x.id === id); if (i >= 0) parts[i] = updated;
    }
    clearSelection(); renderTable(); toast(`✓ Tag "${tag}" toegevoegd aan ${ids.length} onderdelen`);
  });
  document.body.appendChild(dlg);
}

async function bulkRemoveTag() {
  const ids = getSelectedIds(); if (!ids.length) return;
  const tagsInSel = new Set();
  ids.forEach(id => { const p = parts.find(x => x.id === id); (p?.tags || []).forEach(t => tagsInSel.add(t)); });
  if (!tagsInSel.size) { toast('Geen tags gevonden bij selectie'); return; }
  const sel = document.createElement('select');
  sel.style.cssText = 'width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:13px;padding:8px 10px;outline:none;margin-bottom:10px';
  sel.innerHTML = '<option value="">— kies tag —</option>' + [...tagsInSel].sort().map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
  const dlg = _bulkDialog(`🏷 Tag verwijderen van ${ids.length} onderdelen`, sel, async () => {
    const tag = sel.value; if (!tag) return;
    for (const id of ids) {
      const p = parts.find(x => x.id === id); if (!p) continue;
      const tags = (p.tags || []).filter(t => t !== tag);
      const updated = await api(`/api/parts/${id}`, 'PUT', { ...p, tags });
      const i = parts.findIndex(x => x.id === id); if (i >= 0) parts[i] = updated;
    }
    clearSelection(); renderTable(); toast(`✓ Tag "${sel.value}" verwijderd`);
  });
  document.body.appendChild(dlg);
}

async function bulkArchive() {
  const ids = getSelectedIds(); if (!ids.length) return;
  if (!confirm(`${ids.length} onderdelen archiveren?`)) return;
  for (const id of ids) {
    const p = parts.find(x => x.id === id); if (!p) continue;
    const updated = await api(`/api/parts/${id}`, 'PUT', { ...p, active: false });
    const i = parts.findIndex(x => x.id === id); if (i >= 0) parts[i] = updated;
  }
  clearSelection(); renderTable(); renderSidebar(); toast(`📦 ${ids.length} onderdelen gearchiveerd`);
}

async function bulkDelete() {
  const ids = getSelectedIds(); if (!ids.length) return;
  if (!confirm(`${ids.length} onderdelen permanent verwijderen?`)) return;
  for (const id of ids) {
    await api(`/api/parts/${id}`, 'DELETE');
    const i = parts.findIndex(x => x.id === id); if (i >= 0) parts.splice(i, 1);
  }
  clearSelection(); renderTable(); renderSidebar(); toast(`🗑 ${ids.length} onderdelen verwijderd`);
}

function _bulkDialog(title, content, onOk) {
  const dlg = document.createElement('div');
  dlg.className = 'overlay open';
  dlg.innerHTML = `<div class="modal" style="width:400px">
<div class="mhdr"><h3>${esc(title)}</h3><button class="xcls" onclick="this.closest('.overlay').remove()">✕</button></div>
<div class="mbdy" id="_bulkContent"></div>
<div class="mftr">
  <button class="btn sec" onclick="this.closest('.overlay').remove()">Annuleer</button>
  <button class="btn" id="_bulkOk">Toepassen</button>
</div>
  </div>`;
  if (content.nodeType) dlg.querySelector('#_bulkContent').appendChild(content);
  else dlg.querySelector('#_bulkContent').appendChild(content);
  dlg.querySelector('#_bulkOk').onclick = async () => { await onOk(); dlg.remove(); };
  return dlg;
}

// ── EXTRA LOCATIES ────────────────────────────────────────────
function addExtraLocRow(locId = '') {
  const row = document.createElement('div');
  row.style.cssText = 'display:flex;gap:6px;align-items:center';
  const sel = document.createElement('select');
  sel.style.cssText = 'flex:1;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);font-family:"JetBrains Mono",monospace;font-size:12px;padding:5px 8px;outline:none';
  sel.innerHTML = '<option value="">— locatie —</option>' + Object.entries(LOCS).sort((a, b) => a[1].localeCompare(b[1], 'nl')).map(([id, n]) => `<option value="${id}" ${String(id) === String(locId) ? 'selected' : ''}>${esc(n)}</option>`).join('');
  const del = document.createElement('button');
  del.type = 'button'; del.textContent = '✕'; del.style.cssText = 'background:none;border:1px solid var(--border);border-radius:4px;color:var(--text3);cursor:pointer;padding:4px 8px;font-size:12px';
  del.onclick = () => row.remove();
  row.appendChild(sel); row.appendChild(del);
  document.getElementById('extraLocRows').appendChild(row);
}

function getExtraLocs() {
  return Array.from(document.querySelectorAll('#extraLocRows select')).map(s => s.value ? parseInt(s.value) || s.value : null).filter(Boolean);
}

function loadExtraLocs(locs = []) {
  document.getElementById('extraLocRows').innerHTML = '';
  locs.forEach(id => addExtraLocRow(id));
}

// ── WEBHOOK ───────────────────────────────────────────────────
let _webhookUrl = localStorage.getItem('hb_webhook') || '';
let _webhookEvents = JSON.parse(localStorage.getItem('hb_webhook_events') || '["low_stock"]');
let _tgToken = localStorage.getItem('hb_tg_token') || '';
let _tgChatId = localStorage.getItem('hb_tg_chatid') || '';
let _tgFromServer = false;
let _tgEvents = JSON.parse(localStorage.getItem('hb_tg_events') || '["low_stock","expiry"]');

async function loadServerConfig() {
  try {
    const cfg = await api('/api/config');
    if (cfg.telegram_from_server) {
      _tgToken = cfg.telegram_token;
      _tgChatId = cfg.telegram_chat_id;
      _tgFromServer = true;
    }
  } catch (e) { console.warn('Kon serverconfig niet laden:', e.message); }
}

function openWebhookSettings() {
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.innerHTML = `<div class="modal" style="width:540px;max-height:90vh">
<div class="mhdr"><h3>📡 Meldingen instellen</h3><button class="xcls" onclick="this.closest('.overlay').remove()">✕</button></div>
<div class="mbdy" style="padding:0;overflow-y:auto;max-height:calc(90vh - 120px)">

  <!-- TELEGRAM SECTIE -->
  <div style="padding:16px 20px;border-bottom:2px solid var(--border)">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <span style="font-size:18px">✈️</span>
      <b style="font-size:14px;color:var(--text)">Telegram</b>
      <span style="font-size:11px;color:var(--text3);margin-left:4px">(aanbevolen)</span>
    </div>
    <div class="field" style="margin-bottom:10px">
      <label>Bot Token</label>
      <input type="text" id="tgToken" value="${esc(_tgToken)}" placeholder="123456789:ABCdef..." ${_tgFromServer ? 'disabled' : ''} style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px;padding:7px 10px;outline:none${_tgFromServer ? ';opacity:.6' : ''}">
    </div>
    <div class="field" style="margin-bottom:10px">
      <label>Chat ID</label>
      <div style="display:flex;gap:6px">
        <input type="text" id="tgChatId" value="${esc(_tgChatId)}" placeholder="Jouw chat_id..." ${_tgFromServer ? 'disabled' : ''} style="flex:1;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px;padding:7px 10px;outline:none${_tgFromServer ? ';opacity:.6' : ''}">
        ${_tgFromServer ? '' : '<button class="btn sec" onclick="fetchTgChatId()" style="font-size:11px;white-space:nowrap">🔍 Ophalen</button>'}
      </div>
    </div>
    ${_tgFromServer ? `<div style="font-size:11px;color:var(--green);background:rgba(76,175,80,.1);border-radius:var(--r);padding:6px 10px;margin-bottom:10px">✅ Ingesteld via server (.env) — geldt automatisch voor alle apparaten/browsers. Wijzig dit in <code>TELEGRAM_BOT_TOKEN</code>/<code>TELEGRAM_CHAT_ID</code> op de NAS.</div>` : ''}
    <div class="field" style="margin-bottom:10px">
      <label>Stuur melding bij</label>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${[
      ['low_stock', '⚠️ Voorraad onder minimum'],
      ['expiry', '⏰ Verloopdatum binnen 7 dagen'],
      ['stock_change', '🔢 Elke voorraadwijziging'],
      ['build', '🔨 Build voltooid'],
    ].map(([k, l]) => `<label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;text-transform:none;letter-spacing:0">
          <input type="checkbox" class="tg-evt" value="${k}" ${_tgEvents.includes(k) ? 'checked' : ''} style="width:auto"> ${l}
        </label>`).join('')}
      </div>
    </div>
    <div style="background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;font-size:11px;color:var(--text2);margin-bottom:10px">
      <b style="color:var(--text)">Instellen in 2 stappen:</b><br>
      1. Zoek <b>@BotFather</b> in Telegram → <code style="color:var(--acc2)">/newbot</code> → kopieer de token<br>
      2. Stuur een berichtje naar je bot → klik "🔍 Ophalen" voor je Chat ID
    </div>
    <button class="btn sec" onclick="testTelegram()" style="font-size:12px;width:100%">✈️ Stuur testbericht</button>
  </div>

  <!-- WEBHOOK SECTIE -->
  <div style="padding:16px 20px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
      <span style="font-size:18px">📡</span>
      <b style="font-size:14px;color:var(--text)">Webhook</b>
      <span style="font-size:11px;color:var(--text3);margin-left:4px">(Home Assistant / Node-RED)</span>
    </div>
    <div class="field" style="margin-bottom:10px">
      <label>Webhook URL</label>
      <input type="text" id="whUrl" value="${esc(_webhookUrl)}" placeholder="https://homeassistant.local/api/webhook/hb-inventaris" style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-family:'JetBrains Mono',monospace;font-size:12px;padding:7px 10px;outline:none">
    </div>
    <div class="field" style="margin-bottom:10px">
      <label>Triggers</label>
      <div style="display:flex;flex-direction:column;gap:5px">
        ${[
      ['low_stock', '⚠ Voorraad onder minimum'],
      ['stock_change', '🔢 Elke voorraadwijziging'],
      ['part_added', '➕ Nieuw onderdeel toegevoegd'],
    ].map(([k, l]) => `<label style="display:flex;align-items:center;gap:8px;font-size:12px;cursor:pointer;text-transform:none;letter-spacing:0">
          <input type="checkbox" class="wh-evt" value="${k}" ${_webhookEvents.includes(k) ? 'checked' : ''} style="width:auto"> ${l}
        </label>`).join('')}
      </div>
    </div>
    <button class="btn sec" onclick="testWebhook(document.getElementById('whUrl').value)" style="font-size:12px;width:100%">📡 Stuur testbericht naar HA</button>
  </div>

</div>
<div class="mftr">
  <button class="btn sec" onclick="this.closest('.overlay').remove()">Annuleer</button>
  <button class="btn" onclick="saveNotifSettings(this.closest('.overlay'))">Opslaan</button>
</div>
  </div>`;
  document.body.appendChild(modal);
}

async function fetchTgChatId() {
  const token = document.getElementById('tgToken')?.value.trim();
  if (!token) { toast('Vul eerst een Bot Token in'); return; }
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/getUpdates`);
    const j = await r.json();
    const msg = j.result?.find(u => u.message || u.channel_post);
    const chatId = msg?.message?.chat?.id || msg?.channel_post?.chat?.id;
    if (chatId) {
      document.getElementById('tgChatId').value = chatId;
      toast(`✓ Chat ID gevonden: ${chatId}`);
    } else {
      toast('Nog geen berichten gevonden. Stuur eerst een bericht naar je bot.');
    }
  } catch (e) { toast('⚠ Fout: ' + e.message); }
}

async function testTelegram() {
  const token = document.getElementById('tgToken')?.value.trim();
  const chatId = document.getElementById('tgChatId')?.value.trim();
  if (!token || !chatId) { toast('Vul token én chat ID in'); return; }
  const ok = await sendTelegram(token, chatId, '✅ Test van HuizeBruin Inventaris — meldingen werken!');
  toast(ok ? '✈️ Testbericht verstuurd!' : '⚠ Verzenden mislukt — controleer token en chat ID');
}

async function sendTelegram(token, chatId, text) {
  if (!token || !chatId) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' })
    });
    const j = await r.json();
    return j.ok;
  } catch (e) { console.warn('Telegram fout:', e.message); return false; }
}

async function fireTelegram(event, data) {
  if (!_tgToken || !_tgChatId || !_tgEvents.includes(event)) return;
  let text = '';
  if (event === 'low_stock') {
    text = `⚠️ <b>Lage voorraad</b>\n${data.name}: nog <b>${data.stock}</b> stuks (min. ${data.minStock})`;
    if (data.locId) text += `\n📍 ${loc(data.locId)}`;
  } else if (event === 'expiry') {
    const days = Math.round((new Date(data.expiryDate) - new Date()) / (1000 * 86400));
    text = `⏰ <b>Bijna verlopen</b>\n${data.name}`;
    if (days < 0) text += ` is <b>verlopen</b>!`;
    else if (days === 0) text += ` verloopt <b>vandaag</b>!`;
    else text += ` verloopt over <b>${days} dagen</b> (${data.expiryDate})`;
    if (data.locId) text += `\n📍 ${loc(data.locId)}`;
  } else if (event === 'stock_change') {
    text = `🔢 <b>Voorraad gewijzigd</b>\n${data.name}: ${data.delta > 0 ? '+' : ''}${data.delta} → <b>${data.stock}</b>`;
  } else if (event === 'build') {
    text = `🔨 <b>Build voltooid</b>\n${data.qty}× ${data.name}${data.version ? ' ' + data.version : ''}`;
    if (data.note) text += `\nNotitie: ${data.note}`;
    if (data.cost > 0) text += `\nInkoop: €${data.cost}`;
    if (data.sellPrice > 0) text += `  |  Verkoop: €${(data.sellPrice * data.qty).toFixed(2)}`;
  }
  if (text) await sendTelegram(_tgToken, _tgChatId, text);
}

function saveNotifSettings(modal) {
  if (!_tgFromServer) {
    _tgToken = modal.querySelector('#tgToken').value.trim();
    _tgChatId = modal.querySelector('#tgChatId').value.trim();
    localStorage.setItem('hb_tg_token', _tgToken);
    localStorage.setItem('hb_tg_chatid', _tgChatId);
  }
  _tgEvents = Array.from(modal.querySelectorAll('.tg-evt:checked')).map(c => c.value);
  _webhookUrl = modal.querySelector('#whUrl').value.trim();
  _webhookEvents = Array.from(modal.querySelectorAll('.wh-evt:checked')).map(c => c.value);
  localStorage.setItem('hb_tg_events', JSON.stringify(_tgEvents));
  localStorage.setItem('hb_webhook', _webhookUrl);
  localStorage.setItem('hb_webhook_events', JSON.stringify(_webhookEvents));
  modal.remove();
  toast('✓ Meldingen instellingen opgeslagen');
}

function saveWebhookSettings(modal) { saveNotifSettings(modal); }

async function fireWebhook(event, data) {
  if (_webhookUrl && _webhookEvents.includes(event)) {
    try {
      await fetch(_webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event, part: data, timestamp: new Date().toISOString() })
      });
    } catch (e) { console.warn('Webhook failed:', e.message); }
  }
  await fireTelegram(event, data);
}

async function testWebhook(url) {
  if (!url) { toast('Vul eerst een URL in'); return; }
  try {
    await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ event: 'test', message: 'HuizeBruin Inventaris webhook test', timestamp: new Date().toISOString() }) });
    toast('📡 Testbericht verzonden');
  } catch (e) { toast('⚠ Fout: ' + e.message); }
}

// Controleer verloopdatums bij opstarten en stuur Telegram indien nodig
function checkExpiryNotifications() {
  if (!_tgToken || !_tgChatId || !_tgEvents.includes('expiry')) return;
  const key = 'hb_expiry_notif_' + new Date().toISOString().slice(0, 10);
  if (localStorage.getItem(key)) return; // al verstuurd vandaag
  const expiring = parts.filter(p => {
    if (!p.active || !p.expiryDate) return false;
    const s = getExpiryStatus(p.expiryDate);
    return s === 'expired' || s === 'critical';
  });
  if (expiring.length) {
    expiring.forEach(p => fireTelegram('expiry', { ...p }));
    localStorage.setItem(key, '1');
  }
}

// ── TAGS ──────────────────────────────────────────────────────
let _currentTags = [];

function getAllTags() {
  const all = new Set();
  parts.forEach(p => (p.tags || []).forEach(t => all.add(t)));
  return [...all].sort();
}

function renderTagChips() {
  const chips = document.getElementById('tagChips');
  if (!chips) return;
  chips.innerHTML = _currentTags.map((t, i) => `
<span style="display:inline-flex;align-items:center;gap:3px;background:var(--acc);color:#000;border-radius:10px;padding:2px 8px;font-size:11px;font-weight:600">
  ${esc(t)}
  <span onclick="removeTag(${i})" style="cursor:pointer;font-size:13px;line-height:1;margin-left:1px">×</span>
</span>`).join('');
}

function removeTag(i) {
  _currentTags.splice(i, 1);
  renderTagChips();
}

function addTag(val) {
  const t = val.trim().toLowerCase().replace(/[,;]/g, '');
  if (!t || _currentTags.includes(t)) return;
  _currentTags.push(t);
  renderTagChips();
  document.getElementById('tagEntry').value = '';
  document.getElementById('tagSuggest').style.display = 'none';
}

function initTagInput() {
  const inp = document.getElementById('tagEntry');
  if (!inp) return;
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(inp.value); }
    if (e.key === 'Backspace' && !inp.value && _currentTags.length) { _currentTags.pop(); renderTagChips(); }
    e.stopPropagation();
  });
  inp.addEventListener('input', () => {
    const q = inp.value.toLowerCase();
    if (!q) { document.getElementById('tagSuggest').style.display = 'none'; return; }
    const sug = getAllTags().filter(t => t.includes(q) && !_currentTags.includes(t)).slice(0, 6);
    const el = document.getElementById('tagSuggest');
    if (!sug.length) { el.style.display = 'none'; return; }
    el.innerHTML = sug.map(t => `<div style="padding:6px 12px;font-size:12px;cursor:pointer;color:var(--text2)" onmousedown="event.preventDefault();addTag('${esc(t)}')" onmouseover="this.style.background='var(--surf2)'" onmouseout="this.style.background=''">${esc(t)}</div>`).join('');
    el.style.display = '';
  });
  inp.addEventListener('blur', () => setTimeout(() => document.getElementById('tagSuggest').style.display = 'none', 150));
}

function loadTags(tags = []) {
  _currentTags = [...tags];
  renderTagChips();
  setTimeout(initTagInput, 50);
}

function getTags() { return [..._currentTags]; }

// Show tags in detail panel
function tagsHtml(p) {
  if (!(p.tags || []).length) return '';
  return `<div class="dr"><span class="dl">Tags</span><span class="dv" style="font-family:'Inter',sans-serif;display:flex;flex-wrap:wrap;gap:3px">
${p.tags.map(t => `<span onclick="filterByTag('${esc(t)}')" style="background:var(--acc);color:#000;border-radius:10px;padding:1px 7px;font-size:10px;font-weight:600;cursor:pointer">${esc(t)}</span>`).join('')}
  </span></div>`;
}

function filterByTag(tag) {
  closeDet();
  srch = '#' + tag;
  document.getElementById('srch').value = srch;
  document.getElementById('vTitle').textContent = `Tag: ${tag}`;
  renderSidebar(); renderTable();
}

// ── CATEGORIEËN BEHEER ───────────────────────────────────────
let _dbCats = [];

async function openCatManager() {
  _dbCats = await api('/api/categories');
  _renderCatManager();
}

function _renderCatManager() {
  document.getElementById('catMgrOvl')?.remove();
  const parents = _dbCats.filter(c => !c.parent).sort((a, b) => a.sort - b.sort);
  const ovl = document.createElement('div');
  ovl.id = 'catMgrOvl';
  ovl.className = 'overlay open';
  ovl.style.zIndex = '500';

  const rows = parents.map(p => {
    const children = _dbCats.filter(c => c.parent === p.id).sort((a, b) => a.sort - b.sort);
    const childRows = children.map(c => `
      <div style="display:flex;align-items:center;gap:8px;padding:5px 8px 5px 28px;border-bottom:1px solid var(--border);font-size:12px" id="catrow-${c.id}">
        <span style="flex:1;color:var(--text2)">${esc(c.name)}</span>
        <span style="font-size:10px;color:var(--text3)">${parts.filter(x => x.catId === c.id).length} onderdelen</span>
        <button class="abtn" onclick="editCat(${c.id})" style="font-size:11px">✏</button>
        <button class="abtn del" onclick="deleteCat(${c.id})" style="font-size:11px">✕</button>
      </div>`).join('');
    return `<div style="border-bottom:1px solid var(--border)">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 8px;background:var(--surf2);font-size:13px;font-weight:600" id="catrow-${p.id}">
        <span style="flex:1;color:var(--text)">${esc(p.icon || '')} ${esc(p.name)}</span>
        <span style="font-size:10px;color:var(--text3)">${children.length} sub</span>
        <button class="abtn" onclick="addSubCat(${p.id})" style="font-size:11px" title="Subcategorie toevoegen">+sub</button>
        <button class="abtn" onclick="editCat(${p.id})" style="font-size:11px">✏</button>
        <button class="abtn del" onclick="deleteCat(${p.id})" style="font-size:11px">✕</button>
      </div>
      ${childRows}
    </div>`;
  }).join('');

  ovl.innerHTML = `<div class="modal" style="width:560px;max-height:88vh">
    <div class="mhdr">
      <h3>🗂 Categorieën beheren</h3>
      <div style="display:flex;gap:8px">
        <button class="btn sec" onclick="addParentCat()" style="font-size:12px">+ Hoofdcategorie</button>
        <button class="xcls" onclick="document.getElementById('catMgrOvl').remove()">✕</button>
      </div>
    </div>
    <div class="mbdy" style="padding:0;overflow-y:auto;max-height:70vh">
      ${rows || '<div style="padding:20px;color:var(--text3)">Geen categorieën gevonden.</div>'}
    </div>
    <div class="mftr" style="font-size:11px;color:var(--text3)">
      Wijzigingen zijn direct zichtbaar na opslaan. Herlaad de pagina voor de sidebar.
    </div>
  </div>`;
  ovl.addEventListener('click', e => { if (e.target === ovl) ovl.remove(); });
  document.body.appendChild(ovl);
}

function addParentCat() {
  _catEditDialog(null, null, async (name, icon) => {
    const created = await api('/api/categories', 'POST', { name, icon, parent: null, sort: _dbCats.filter(c => !c.parent).length });
    _dbCats.push(created);
    CATS[created.id] = (icon ? icon + ' ' : '') + name;
    TREE.push({ id: created.id, lbl: CATS[created.id], ch: [] });
    renderSidebar();
    _renderCatManager();
    toast('Hoofdcategorie "' + name + '" aangemaakt');
  });
}

function addSubCat(parentId) {
  _catEditDialog(null, parentId, async (name, icon) => {
    const created = await api('/api/categories', 'POST', { name, icon, parent: parentId, sort: _dbCats.filter(c => c.parent === parentId).length });
    _dbCats.push(created);
    CATS[created.id] = name;
    const treeParent = TREE.find(t => t.id === parentId);
    if (treeParent) treeParent.ch.push(created.id);
    renderSidebar();
    _renderCatManager();
    toast('Subcategorie "' + name + '" aangemaakt');
  });
}

function editCat(id) {
  const cat = _dbCats.find(c => c.id === id);
  if (!cat) return;
  _catEditDialog(cat, cat.parent, async (name, icon) => {
    await api('/api/categories/' + id, 'PUT', { name, icon, sort: cat.sort });
    cat.name = name; cat.icon = icon;
    CATS[id] = (icon ? icon + ' ' : '') + name;
    const tp = TREE.find(t => t.id === id);
    if (tp) tp.lbl = CATS[id];
    renderSidebar(); renderTable();
    _renderCatManager();
    toast('Categorie bijgewerkt');
  });
}

async function deleteCat(id) {
  const cat = _dbCats.find(c => c.id === id);
  if (!cat) return;
  const inUse = parts.filter(p => p.catId === id).length;
  if (inUse > 0) { toast(inUse + ' onderdelen gebruiken deze categorie — verwijderen niet mogelijk'); return; }
  const children = _dbCats.filter(c => c.parent === id).length;
  if (children > 0) { toast('Verwijder eerst de ' + children + ' subcategorieën'); return; }
  if (!confirm('Categorie "' + cat.name + '" verwijderen?')) return;
  try {
    await api('/api/categories/' + id, 'DELETE');
    _dbCats = _dbCats.filter(c => c.id !== id);
    delete CATS[id];
    TREE.forEach(t => { t.ch = t.ch.filter(c => c !== id); });
    TREE.splice(TREE.findIndex(t => t.id === id), 1);
    renderSidebar(); renderTable();
    _renderCatManager();
    toast('Categorie verwijderd');
  } catch (e) { toast('Fout: ' + e.message); }
}

function _catEditDialog(existing, parentId, onSave) {
  const parent = parentId ? _dbCats.find(c => c.id === parentId) : null;
  const wrap = document.createElement('div');
  wrap.innerHTML = `
    ${parent ? '<div style="font-size:12px;color:var(--text2);margin-bottom:10px">Subcategorie van: <b>' + esc(parent.name) + '</b></div>' : ''}
    <div class="field" style="margin-bottom:10px">
      <label>Naam</label>
      <input id="_catNameInp" type="text" value="${esc(existing?.name || '')}" placeholder="bv. Weerstanden SMD"
        style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:13px;padding:8px 10px;outline:none">
    </div>
    ${!parentId ? '<div class="field" style="margin-bottom:0"><label>Icoon (emoji)</label><input id="_catIconInp" type="text" value="' + esc(existing?.icon || '') + '" placeholder="bv. 🔌" style="width:80px;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:16px;padding:8px 10px;outline:none;text-align:center"></div>' : '<input id="_catIconInp" type="hidden" value="">'}`;
  const title = existing ? '✏ Categorie bewerken' : (parentId ? '+ Subcategorie toevoegen' : '+ Hoofdcategorie toevoegen');
  const dlg = _bulkDialog(title, wrap, async () => {
    const name = document.getElementById('_catNameInp').value.trim();
    const icon = document.getElementById('_catIconInp').value.trim();
    if (!name) { toast('Vul een naam in'); return; }
    await onSave(name, icon);
  });
  document.body.appendChild(dlg);
  setTimeout(() => document.getElementById('_catNameInp')?.focus(), 100);
}

// ── DEEP LINK ─────────────────────────────────────────────────
function handleDeepLink() {
  const params = new URLSearchParams(window.location.search);
  const p = params.get;
  const partId = params.get('part');
  const projId = params.get('project');
  const open = params.get('open');      // open=dashboard|orders|suppliers|kasten|locs|media|stats|history|archive
  const dashTab = params.get('tab');       // tab=activiteit|projecten|stock|leveranciers
  const catId = params.get('cat');       // cat=202 → filter op categorie
  const locId = params.get('loc');       // loc=3 → filter op locatie
  const q = params.get('q');         // q=zoekterm → zoeken

  if (q) {
    srch = q;
    document.getElementById('srch').value = q;
    renderSidebar(); renderTable();
  }
  if (catId) {
    catF = parseInt(catId);
    renderSidebar(); renderTable();
  }
  if (locId) {
    srch = '#loc:' + locId;
    renderSidebar(); renderTable();
  }
  if (partId) {
    const found = parts.find(x => x.id === parseInt(partId) || x.IPN === partId);
    if (found) selPart(found.id);
  }
  if (projId) {
    openProjectsModal();
    setTimeout(() => openProjectDetail(parseInt(projId)), 150);
  }
  if (open) {
    const map = {
      'dashboard': () => openDashboard(dashTab || 'activiteit'),
      'orders': () => openOrderList(),
      'suppliers': () => openSuppModal(),
      'kasten': () => openKastModal(),
      'locs': () => openLocModal(),
      'media': () => openMediaModal(),
      'history': () => openHistModal(),
      'archive': () => { window._showArchived = true; renderTable(); },
      'projects': () => openProjectsModal(),
      'categories': () => openCatManager(),
      'stats': () => { const s = document.querySelector('a[href*=stats]'); if (s) s.click(); },
    };
    const fn = map[open];
    if (fn) setTimeout(fn, 200);
  }
}

// Kopieer een deep-link naar klembord
function copyDeepLink(params = {}) {
  const url = new URL(getAppBaseUrl());
  Object.entries(params).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, v); });
  navigator.clipboard?.writeText(url.toString())
    .then(() => toast('🔗 Link gekopieerd'))
    .catch(() => toast(url.toString()));
  return url.toString();
}

function getAppBaseUrl() {
  return window.location.origin + window.location.pathname.replace(/\/+$/, '');
}

// Links overzicht panel
function openLinksPanel() {
  const base = getAppBaseUrl();
  const mkLink = (label, params, desc) => {
    const url = new URL(base);
    Object.entries(params).forEach(([k, v]) => { if (v != null) url.searchParams.set(k, String(v)); });
    const href = url.toString();
    const hrefEsc = href.replace(/'/g, "\'");
    return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border)">'
      + '<div style="flex:1;min-width:0">'
      + '<div style="font-size:12px;font-weight:600;color:var(--text)">' + esc(label) + '</div>'
      + (desc ? '<div style="font-size:10px;color:var(--text3)">' + esc(desc) + '</div>' : '')
      + '<div style="font-size:10px;color:var(--acc2);word-break:break-all;margin-top:1px">' + esc(href) + '</div>'
      + '</div>'
      + '<button class="abtn" onclick="navigator.clipboard?.writeText(\'' + hrefEsc + '\').then(()=>toast(\'Gekopieerd!\'))" title="Kopieer" style="flex-shrink:0;font-size:13px">📋</button>'
      + '<a href="' + href + '" target="_blank" class="abtn" style="text-decoration:none;flex-shrink:0;font-size:13px" title="Open">↗</a>'
      + '</div>';
  };

  // Generate useful links
  const sections = [
    {
      title: '🏠 Hoofdpagina',
      links: [
        mkLink('Alle onderdelen', {}, 'Hoofdpagina'),
        mkLink('Dashboard — Activiteit', { open: 'dashboard', tab: 'activiteit' }, ''),
        mkLink('Dashboard — Projecten', { open: 'dashboard', tab: 'projecten' }, ''),
        mkLink('Dashboard — Stock', { open: 'dashboard', tab: 'stock' }, ''),
        mkLink('Bestellijst', { open: 'orders' }, 'Onderdelen onder minimum'),
        mkLink('Geschiedenis', { open: 'history' }, 'Alle voorraadmutaties'),
        mkLink('Archief', { open: 'archive' }, 'Gearchiveerde onderdelen'),
      ]
    },
    {
      title: '🔧 Beheer',
      links: [
        mkLink('Projecten / BOM', { open: 'projects' }, ''),
        mkLink('Leveranciers', { open: 'suppliers' }, ''),
        mkLink('Kasten & Vakken', { open: 'kasten' }, ''),
        mkLink('Locaties beheren', { open: 'locs' }, ''),
        mkLink('Categorieën beheren', { open: 'categories' }, ''),
        mkLink('Media bibliotheek', { open: 'media' }, ''),
      ]
    },
    ...(selId ? [{
      title: '🔗 Huidig onderdeel',
      links: [
        mkLink('Direct naar: ' + (parts.find(p => p.id === selId)?.name || 'onderdeel'), { part: selId }, 'Link naar dit onderdeel'),
        ...(parts.find(p => p.id === selId)?.IPN ? [mkLink('Via IPN: ' + parts.find(p => p.id === selId).IPN, { part: parts.find(p => p.id === selId).IPN }, 'Stabielere link via IPN')] : []),
      ]
    }] : []),
    {
      title: '🔍 Zoekopdrachten',
      links: [
        ...Object.entries(CATS).filter(([, v]) => v && !['🔌', '⚡', '💡', '📡', '🛠️', '📦', '🖨️', '🧩', '🗃️'].some(e => v.startsWith(e))).slice(0, 6).map(([k, v]) =>
          mkLink('Categorie: ' + v, { cat: k }, '')),
        mkLink('Zoek: "pcb"', { q: 'pcb' }, 'Voorbeeld zoekopdracht'),
      ]
    },
  ];

  const ovl = document.createElement('div');
  ovl.className = 'overlay open';
  ovl.style.zIndex = '600';
  ovl.innerHTML = `<div class="modal" style="width:600px;max-height:88vh">
    <div class="mhdr"><h3>🔗 Links & Deep-links</h3>
      <button class="xcls" onclick="this.closest('.overlay').remove()">✕</button>
    </div>
    <div class="mbdy" style="padding:0;overflow-y:auto">
      ${sections.map(s => `
        <div style="padding:10px 16px 4px;background:var(--surf2);border-bottom:1px solid var(--border);font-size:11px;font-weight:700;color:var(--text2);letter-spacing:.06em">${s.title}</div>
        <div style="padding:4px 16px 8px">${s.links.join('')}</div>
      `).join('')}
      <div style="padding:12px 16px;font-size:11px;color:var(--text3)">
        Tip: bookmarks maken in de browser → direct naar elke pagina in de inventaris.
      </div>
    </div>
  </div>`;
  ovl.addEventListener('click', e => { if (e.target === ovl) ovl.remove(); });
  document.body.appendChild(ovl);
}

// ── HOVER PREVIEW ────────────────────────────────────────────
let _hovTimer = null, _hovEl = null;

function showHoverPreview(e, id) {
  hideHoverPreview();
  _hovTimer = setTimeout(() => {
    const p = parts.find(x => x.id === id);
    if (!p || selId === id) return;
    const bestPrice = (p.suppliers || []).filter(s => s.price > 0).sort((a, b) => a.price - b.price)[0];
    const card = document.createElement('div');
    card.id = '_hoverCard';
    card.style.cssText = 'position:fixed;z-index:9999;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);padding:10px 12px;width:220px;box-shadow:0 4px 20px rgba(0,0,0,.4);pointer-events:none;font-size:12px';
    card.innerHTML =
      (p.img ? `<img src="${esc(p.img)}" style="width:100%;max-height:80px;object-fit:contain;border-radius:4px;margin-bottom:8px;background:var(--surf)">` : '') +
      `<div style="font-weight:700;color:var(--text);margin-bottom:2px">${esc(p.name)}</div>` +
      (p.desc ? `<div style="color:var(--text2);font-size:11px;margin-bottom:6px">${esc(p.desc)}</div>` : '') +
      `<div style="display:flex;gap:8px;flex-wrap:wrap;font-size:11px">` +
      `<span style="color:var(--text3)">📍 ${esc(loc(p.locId))}</span>` +
      `<span style="color:${(p.stock || 0) === 0 ? 'var(--red)' : (p.stock || 0) < 5 ? 'var(--orange)' : 'var(--green)'}">${p.stock || 0} st</span>` +
      (bestPrice ? `<span style="color:var(--acc2)">€${bestPrice.price.toFixed(2)}/st</span>` : '') +
      `</div>` +
      ((p.tags || []).length ? `<div style="margin-top:6px;display:flex;gap:3px;flex-wrap:wrap">${p.tags.map(t => `<span style="background:var(--acc);color:#000;border-radius:8px;padding:1px 6px;font-size:10px">${esc(t)}</span>`).join('')}</div>` : '');
    document.body.appendChild(card);
    _hovEl = card;
    _posHoverCard(e);
  }, 400);
}

function _posHoverCard(e) {
  const card = document.getElementById('_hoverCard');
  if (!card) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  let x = e.clientX + 14, y = e.clientY + 14;
  if (x + 230 > vw) x = e.clientX - 234;
  if (y + 180 > vh) y = e.clientY - 180;
  card.style.left = x + 'px';
  card.style.top = y + 'px';
}

function hideHoverPreview() {
  clearTimeout(_hovTimer);
  document.getElementById('_hoverCard')?.remove();
  _hovEl = null;
}

// ── KOLOMMEN AANPASSEN ────────────────────────────────────────
const COL_DEFS = [
  { key: 'img', label: 'Foto', cls: 'tdi', default: true },
  { key: 'name', label: 'Naam', cls: 'tdn', default: true },
  { key: 'IPN', label: 'IPN', cls: 'tdipn', default: false },
  { key: 'cat', label: 'Categorie', cls: 'tdcat', default: false },
  { key: 'loc', label: 'Locatie', cls: 'tdloc', default: true },
  { key: 'price', label: 'Prijs', cls: 'tdprice', default: false },
  { key: 'stock', label: 'Voorraad', cls: 'tdq', default: true },
  { key: 'modified', label: 'Gewijzigd', cls: 'tdmod', default: false },
];
let _colVis = JSON.parse(localStorage.getItem('hb_col_vis') || 'null') ||
  Object.fromEntries(COL_DEFS.map(c => [c.key, c.default]));

function saveColVis() { localStorage.setItem('hb_col_vis', JSON.stringify(_colVis)); applyColVis(); }

function applyColVis() {
  const styleEl = document.getElementById('_colVisStyle') || (() => {
    const el = document.createElement('style'); el.id = '_colVisStyle'; document.head.appendChild(el); return el;
  })();
  styleEl.textContent = COL_DEFS.filter(c => !_colVis[c.key])
    .map(c => `.${c.cls}, th[data-col="${c.key}"] { display:none !important }`)
    .join('');
  let dense = false; try { dense = localStorage.getItem('hb_dense') === '1'; } catch (e) { }
  document.body.classList.toggle('dense', dense);
}
function resetColVis(btn) {
  _colVis = Object.fromEntries(COL_DEFS.map(c => [c.key, c.default]));
  saveColVis();
  btn.closest('.overlay')?.remove();
  openColSettings();
  renderTable();
}

function openColSettings() {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:4px 0';
  wrap.innerHTML = COL_DEFS.map(c => `
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;padding:4px 0">
      <input type="checkbox" ${_colVis[c.key] ? 'checked' : ''} onchange="_colVis['${c.key}']=this.checked;saveColVis()"
        style="width:15px;height:15px;cursor:pointer">
      <span style="color:var(--text)">${c.label}</span>
    </label>`).join('') + `
    <label style="grid-column:1/-1;display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;padding:6px 0;border-top:1px solid var(--border)">
      <input type="checkbox" ${document.body.classList.contains('dense') ? 'checked' : ''}
        onchange="try{localStorage.setItem('hb_dense',this.checked?'1':'0')}catch(e){};applyColVis()" style="width:15px;height:15px;cursor:pointer">
      <span style="color:var(--text)">Compacte regels</span>
    </label>
    <button class="btn sec" style="grid-column:1/-1" onclick="resetColVis(this)">Standaardweergave herstellen</button>`;
  const dlg = _bulkDialog('⚙ Kolommen instellen', wrap, () => { });
  // Change OK to Sluiten
  const okBtn = dlg.querySelector('.btn:not(.sec)');
  if (okBtn) { okBtn.textContent = 'Sluiten'; okBtn.onclick = () => dlg.remove(); }
  document.body.appendChild(dlg);
}

// ── BULK STOCK IMPORT CSV ─────────────────────────────────────
function bulkStockImportCSV() {
  const inp = document.createElement('input');
  inp.type = 'file'; inp.accept = '.csv';
  inp.onchange = async e => {
    const file = e.target.files[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) { toast('CSV leeg of ongeldig'); return; }
    const header = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim().toLowerCase());
    const ipnCol = header.findIndex(h => h === 'ipn');
    const nameCol = header.findIndex(h => h === 'naam' || h === 'name');
    const deltaCol = header.findIndex(h => ['delta', 'wijziging', 'change'].includes(h));
    const setCol = header.findIndex(h => ['stock', 'voorraad', 'set'].includes(h));
    const noteCol = header.findIndex(h => ['notitie', 'note', 'opmerking'].includes(h));
    if (ipnCol < 0 && nameCol < 0) { toast('Geen IPN of Naam kolom gevonden'); return; }
    if (deltaCol < 0 && setCol < 0) { toast('Geen Delta of Stock kolom gevonden'); return; }

    let ok = 0, skip = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].match(/("(?:[^"]|"")*"|[^,]*)/g)
        ?.map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"').trim()) || [];
      let p = null;
      if (ipnCol >= 0 && cols[ipnCol]) p = parts.find(x => x.IPN === cols[ipnCol]);
      if (!p && nameCol >= 0 && cols[nameCol]) p = parts.find(x => x.name === cols[nameCol]);
      if (!p) { skip.push(cols[ipnCol] || cols[nameCol] || 'rij ' + (i + 1)); continue; }
      const note = noteCol >= 0 ? cols[noteCol] : 'Bulk CSV import';
      const payload = { note };
      if (deltaCol >= 0 && cols[deltaCol] !== '') payload.delta = parseInt(cols[deltaCol]) || 0;
      else if (setCol >= 0 && cols[setCol] !== '') payload.set = Math.max(0, parseInt(cols[setCol]) || 0);
      else continue;
      const r = await api('/api/parts/' + p.id + '/stock', 'PATCH', payload);
      const idx = parts.findIndex(x => x.id === p.id);
      if (idx >= 0) { parts[idx].stock = r.stock; checkAndNotifyLowStock(parts[idx]); }
      ok++;
    }
    renderTable();
    let msg = ok + ' onderdelen bijgewerkt';
    if (skip.length) msg += ' | Niet gevonden: ' + skip.slice(0, 3).join(', ') + (skip.length > 3 ? ' +' + (skip.length - 3) : '');
    toast(msg);
  };
  inp.click();
}

// ── GEAVANCEERD ZOEKEN ────────────────────────────────────────
let _advFilter = {};

function openAdvSearch() {
  const allTags = getAllTags();
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'advSearchOvl';
  modal.innerHTML = `<div class="modal" style="width:480px">
<div class="mhdr"><h3>🔍 Geavanceerd zoeken</h3><button class="xcls" onclick="this.closest('.overlay').remove()">✕</button></div>
<div class="mbdy">
  <div class="frow">
    <div class="field"><label>Categorie</label>
      <select id="afCat" style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:12px;padding:6px 8px;outline:none">
        <option value="">Alle categorieën</option>
        ${Object.entries(CATS).sort((a, b) => a[1].localeCompare(b[1], 'nl')).map(([id, n]) => `<option value="${id}" ${String(_advFilter.catId) === String(id) ? 'selected' : ''}>${esc(n)}</option>`).join('')}
      </select>
    </div>
    <div class="field"><label>Locatie</label>
      <select id="afLoc" style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:12px;padding:6px 8px;outline:none">
        <option value="">Alle locaties</option>
        ${Object.entries(LOCS).sort((a, b) => a[1].localeCompare(b[1], 'nl')).map(([id, n]) => `<option value="${id}" ${String(_advFilter.locId) === String(id) ? 'selected' : ''}>${esc(n)}</option>`).join('')}
      </select>
    </div>
  </div>
  <div class="frow">
    <div class="field"><label>Voorraad min</label><input type="number" id="afStockMin" value="${_advFilter.stockMin ?? ''}" min="0" placeholder="0"></div>
    <div class="field"><label>Voorraad max</label><input type="number" id="afStockMax" value="${_advFilter.stockMax ?? ''}" min="0" placeholder="∞"></div>
  </div>
  <div class="field"><label>Leverancier</label>
    <select id="afSupp" style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:12px;padding:6px 8px;outline:none">
      <option value="">Alle leveranciers</option>
      ${suppliers.map(s => `<option value="${s.id}" ${_advFilter.suppId === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
    </select>
  </div>
  ${allTags.length ? `<div class="field"><label>Tag</label>
    <select id="afTag" style="width:100%;background:var(--surf2);border:1px solid var(--border);border-radius:var(--r);color:var(--text);font-size:12px;padding:6px 8px;outline:none">
      <option value="">Alle tags</option>
      ${allTags.map(t => `<option value="${t}" ${_advFilter.tag === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}
    </select>
  </div>`: ''}
  <div class="field"><label style="text-transform:none;letter-spacing:0;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px"><input type="checkbox" id="afLowStock" ${_advFilter.lowStock ? 'checked' : ''} style="width:auto"> Alleen lage voorraad</label></div>
  <div class="field"><label style="text-transform:none;letter-spacing:0;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:6px"><input type="checkbox" id="afNoLoc" ${_advFilter.noLoc ? 'checked' : ''} style="width:auto"> Zonder locatie</label></div>
</div>
<div class="mftr" style="gap:8px">
  <button class="btn sec" onclick="clearAdvSearch();this.closest('.overlay').remove()">Wissen</button>
  <button class="btn sec" onclick="this.closest('.overlay').remove()">Annuleer</button>
  <button class="btn" onclick="applyAdvSearch()">Zoeken</button>
</div>
  </div>`;
  document.body.appendChild(modal);
}

function applyAdvSearch() {
  _advFilter = {
    catId: document.getElementById('afCat')?.value || '',
    locId: document.getElementById('afLoc')?.value || '',
    stockMin: document.getElementById('afStockMin')?.value !== '' ? parseInt(document.getElementById('afStockMin').value) : null,
    stockMax: document.getElementById('afStockMax')?.value !== '' ? parseInt(document.getElementById('afStockMax').value) : null,
    suppId: document.getElementById('afSupp')?.value ? parseInt(document.getElementById('afSupp').value) : null,
    tag: document.getElementById('afTag')?.value || '',
    lowStock: document.getElementById('afLowStock')?.checked || false,
    noLoc: document.getElementById('afNoLoc')?.checked || false,
  };
  document.getElementById('advSearchOvl')?.remove();
  const activeCount = Object.values(_advFilter).filter(v => v !== '' && v !== null && v !== false).length;
  const btn = document.getElementById('advSearchBtn');
  if (btn) { btn.style.color = activeCount ? 'var(--acc)' : 'var(--text3)'; btn.textContent = activeCount ? `⚙${activeCount}` : '⚙'; }
  window._lowStockMode = false; catF = null;
  document.getElementById('vTitle').textContent = `Gefilterd (${activeCount} filter${activeCount === 1 ? '' : 's'})`;
  renderTable(); renderSidebar();
}

function clearAdvSearch() {
  _advFilter = {};
  const btn = document.getElementById('advSearchBtn');
  if (btn) { btn.style.color = 'var(--text3)'; btn.textContent = '⚙'; }
  document.getElementById('vTitle').textContent = 'Alle onderdelen';
  renderTable(); renderSidebar();
}

// ── PAKKETJES TRACKER ─────────────────────────────────────────
function openTracking() {
  const url = document.getElementById('oeTracking')?.value?.trim();
  if (!url) { toast('Geen track & trace URL ingevuld'); return; }
  const fullUrl = url.startsWith('http') ? url : `https://www.postnl.nl/tracktrace/?B=${url}`;
  window.open(fullUrl, '_blank');
}

function renderTrackingBadge(order) {
  if (!order.tracking) return '';
  const url = order.tracking.startsWith('http') ? order.tracking : `https://www.postnl.nl/tracktrace/?B=${order.tracking}`;
  return `<a href="${esc(url)}" target="_blank" onclick="event.stopPropagation()" style="font-size:11px;color:var(--acc2);text-decoration:none;white-space:nowrap">📦 Track</a>`;
}

// ── TOAST ─────────────────────────────────────────────────────
let _tt;
function toast(m) { const e = document.getElementById('toast'); e.textContent = m; e.classList.add('show'); clearTimeout(_tt); _tt = setTimeout(() => e.classList.remove('show'), 2400); }

// ── HELP / CHANGELOG ─────────────────────────────────────────
const CHANGELOG = [
  {
    ver: 'v3.8.0', date: '2026-10', items: [
      '📱 Beter op telefoon en tablet — categorieën bereikbaar, detail past op het scherm, rekening met notch en home-indicator',
      '🔔 Eén meldingen-knop — vervangt de losse badges (lage voorraad, verloopt, suggesties, leeg)',
      '🗂 Opgeschoond menu — inklapbare groepen, zoekveld, dubbele items weg',
      '➕ Voorraad direct in de rij — −/+ met statusbalk t.o.v. het minimum (ook op telefoon)',
      '🏷 Snelfilters — lage voorraad, leeg, zonder locatie, vastgezet, verloopt',
      '⋯ Acties per rij achter één menu, en een compactere bulk-balk met Meer-menu',
      '▦ Standaard drie kolommen (naam, locatie, voorraad) — rest via Kolommen instellen, met compacte regels',
      '🛠 Kolomkoppen en cellen verdwijnen nu samen bij prijs en gewijzigd',
      '↩ Ongedaan maken — na een voorraadwijziging of verwijderen verschijnt een melding (ook Ctrl+Z); verwijderen gaat pas echt door als de melding verdwijnt',
      '▤ Detailpaneel opgeschoond — acties bovenin (Bewerk, Label, QR, ⋯), IPN/categorie/locatie als labels, voorraad met statusbalk, inkoopprijs pas uitklappen als je bijboekt',
      '📷 Scanner in de balk onderin — direct camera, zoeken of +1/−1 inboeken; code typen of USB-scanner kan ook',
      '👆 Swipe op kaarten (telefoon) — naar links voor Bewerk en Meer',
      '🔎 Zoekwoorden worden gemarkeerd in naam, omschrijving en IPN',
      '♿ Toegankelijkheid — toetsenbord op rijen/kaarten/tabs, focus in en terug bij vensters, zichtbare focusrand, minder animatie op verzoek',
      '🧱 Code opgesplitst — HTML (app.html), logica (app.js) en stijl (app.css) staan nu in aparte bestanden',
      '⚡ Grote inventarissen — de lijst toont eerst 300 onderdelen en laadt de rest via Toon meer; zoeken blijft vlot bij duizenden onderdelen',
    ]
  },
  {
    ver: 'v3.7.0', date: '2026-04', items: [
      '⏰ Verloopdatum op onderdelen — badge in tabel, waarschuwing in detail, ⏰-knop in header',
      '✏ Inline notitie bewerken — direct in het detailpaneel, geen modal nodig',
      '✈️ Telegram meldingen — lage voorraad + verloopdatum via bot, instellen via 📡 menu',
      '🔍 Fuzzy zoeken — "10k res" vindt "10K Ohm Resistor", op relevantie gesorteerd',
      '∅ Lege voorraad filter — knop in header of toets Z',
      '📷 Camera-knop bij foto — direct schieten via webcam/camera',
      '📬 Herbestelvoorstel — per leverancier, kopieer tekst (toets R)',
      '⌨ F2 snelle scanner — zwevend invoerveld voor USB barcodescanner',
    ]
  },
  {
    ver: 'v3.5.0', date: '2026-03', items: [
      '🗄 SQLite database — crash-safe, WAL mode, automatische migratie vanuit JSON',
      '🔍 Foto vergroten — klik op foto in detail voor lightbox, hover voor preview',
      '🔐 Aparte login en logout pagina',
      '📧 Magic link inloggen via e-mail (SMTP instelbaar via .env)',
      '🔒 Onthoud mij 30 dagen checkbox bij inloggen',
      '💾 Backup nu als .db bestand — atomisch en betrouwbaar',
    ]
  },
  {
    ver: 'v3.4.0', date: '2026-03', items: [
      '📝 Notitie icoontje in lijst — hover voor preview',
      '📅 Sorteer op laatste wijziging — nieuwe kolom in tabel',
      '📊 Stuks per categorie in dashboard',
      '🔄 Auto-refresh — instelbaar interval via menu',
      '⚠ Bevestiging bij sluiten als formulier gewijzigd is',
    ]
  },
  {
    ver: 'v3.3.0', date: '2026-03', items: [
      '🏷 Auto IPN genereren — HZB-XXXX formaat als leeg',
      '🔗 Productlink per leverancier — direct naar productpagina',
      '💰 Prijs overal correct als stukprijs',
      '📋 Bestellijst toont totaalprijs per regel',
    ]
  },
  {
    ver: 'v3.2.0', date: '2026-03', items: [
      '💾 Auto-backup — dagelijks om middernacht, laatste 7 bewaard op NAS',
      '⚠ Data validatie — waarschuwing bij opslaan zonder categorie of locatie',
      '💡 Suggesties — alleen nog onderdelen zonder locatie',
      '📋 Changelog toegevoegd aan help-scherm',
    ]
  },
  {
    ver: 'v3.1.0', date: '2026-03', items: [
      '📱 Barcode scannen — drie modi: zoeken, +1 inboeken, −1 uitboeken',
      '🖨 Bulk labels printen — selecteer rijen → labels printen',
      '📊 Excel/CSV export met alle velden inclusief tags',
      '📡 Webhook verbeterd — kant-en-klare Home Assistant YAML erbij',
    ]
  },
  {
    ver: 'v3.0.0', date: '2026-03', items: [
      '🏷 Tags — vrije labels per onderdeel, filter via #tag in zoekbalk',
      '🔍 Geavanceerd zoeken — filter op categorie, locatie, leverancier, voorraad, tag',
      '📦 Pakketjes tracker — track & trace URL per inkooporder',
    ]
  },
  {
    ver: 'v2.9.0', date: '2026-03', items: [
      '☑ Bulk selecteren — locatie/categorie/voorraad/archief/labels tegelijk',
      '🌡 Meerdere locaties per onderdeel',
      '📡 Webhook — Home Assistant / Node-RED koppeling',
    ]
  },
  {
    ver: 'v2.8.0', date: '2026-03', items: [
      '💰 Prijs kolom in tabel (sorteerbaar)',
      '💡 Slimme suggesties badge in header',
      '📦 Verpakkingsteller',
      '📋 Pakbon generator',
      '🔒 Alleen-lezen modus',
    ]
  },
  {
    ver: 'v2.7.0', date: '2026-03', items: [
      '🔍 Zoekgeschiedenis dropdown',
      '🔗 Gerelateerde onderdelen koppelen',
      '🖨 Locatie overzicht printen vanuit kastbrowser',
      '📅 Activiteit per week in dashboard',
    ]
  },
  {
    ver: 'v2.6.0', date: '2026-03', items: [
      '🌐 Datasheet zoeken — links naar Octopart, AllDatasheet etc.',
      '📈 Verbruikspatronen in dashboard',
    ]
  },
  {
    ver: 'v2.5.0', date: '2026-03', items: [
      '📌 Vastgezette onderdelen bovenaan lijst',
      '🔢 Inline voorraad aanpassen in tabel',
      '📊 Sparkline grafiek in Log tab',
    ]
  },
  {
    ver: 'v2.4.0', date: '2026-03', items: [
      '☀️/🌙 Licht/donker thema',
      '💾 Backup knop',
      '📐 Foto automatisch verkleinen bij upload',
      '⚠ Duplicate detectie bij nieuw onderdeel',
      '⧉ Kopieer knop in detailpaneel',
      '⌨ Sneltoetsen uitgebreid',
    ]
  },
  {
    ver: 'v2.3.0', date: '2026-03', items: [
      '📦 Archief — onderdelen archiveren',
      '🗄 Kastbrowser met drag & drop',
      '🖼 Mediabeheer met verkleinen',
      '🏪 Leveranciersbeheer',
      '📦 Inkooporders',
      '🔗 Projecten / BOM',
      '🏷 Labels printen met QR-codes',
      '📷 Barcode/QR scanner',
    ]
  },
  {
    ver: 'v2.2.0', date: '2026-03', items: [
      '📍 Locatiebeheer — locaties hernoemen en beheren',
      '📜 Voorraadgeschiedenis per onderdeel',
      '📊 Dashboard met statistieken en voorraadwaarde',
    ]
  },
  {
    ver: 'v2.1.0', date: '2026-03', items: [
      '🏪 Leveranciers per onderdeel met SKU en prijs',
      '📋 Bestellijst — onderdelen onder minimumvoorraad',
      '📤 Export naar CSV/JSON',
    ]
  },
  {
    ver: 'v2.0.0', date: '2026-03', items: [
      '🔄 Migratie van InvenTree naar eigen systeem',
      '📦 Nieuw categorie-systeem (200+ categorieën)',
      '🖼 Afbeeldingen uploaden en beheren',
      '📎 Datasheets (PDF) per onderdeel',
      '🗺 Locaties per onderdeel',
    ]
  },
  {
    ver: 'v1.x en ouder', date: '2026-02', items: [
      '🚀 Eerste versie — import vanuit InvenTree PostgreSQL dump',
      '📋 Basislijst van onderdelen met naam, IPN, voorraad',
      '🌐 Flask server + single-page app opzet',
      '🐳 Docker container op Synology NAS',
    ]
  },
];

function showHelpTab(tab) {
  document.getElementById('helpPaneHelp').style.display = tab === 'help' ? '' : 'none';
  document.getElementById('helpPaneChangelog').style.display = tab === 'changelog' ? '' : 'none';
  document.getElementById('helpTabHelp').style.background = tab === 'help' ? 'var(--surf2)' : '';
  document.getElementById('helpTabChangelog').style.background = tab === 'changelog' ? 'var(--surf2)' : '';
  if (tab === 'changelog') renderChangelog();
}

function renderChangelog() {
  const el = document.getElementById('changelogContent');
  el.innerHTML = CHANGELOG.map((v, idx) => {
    const isOld = v.ver.includes('1.x');
    return `<div style="margin-bottom:18px${idx > 0 ? ';padding-top:14px;border-top:1px solid var(--border)' : ''}">
  <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:6px">
    <span style="font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:${idx === 0 ? 'var(--acc)' : 'var(--acc2)'}">${esc(v.ver)}</span>
    <span style="font-size:11px;color:var(--text2)">${esc(v.date)}</span>
    ${idx === 0 ? '<span style="background:var(--acc);color:#000;border-radius:8px;font-size:10px;font-weight:700;padding:1px 7px">huidig</span>' : ''}
  </div>
  <div style="display:flex;flex-direction:column;gap:3px">
    ${v.items.map(i => `<div style="font-size:12px;color:var(--text);padding:2px 0 2px 4px;border-left:2px solid var(--border)">${esc(i)}</div>`).join('')}
  </div>
</div>`;
  }).join('');
}

function openHelp(tab = 'help') {
  document.getElementById('helpVer').textContent = document.querySelector('.ver')?.textContent || '';
  document.getElementById('helpOvl').classList.add('open');
  showHelpTab(tab);
}
function openLightbox(src) {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML = `<img src="${esc(src)}" alt="">`;
  lb.onclick = () => lb.remove();
  document.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { lb.remove(); document.removeEventListener('keydown', esc); } });
  document.body.appendChild(lb);
}

function closeHelp() { document.getElementById('helpOvl').classList.remove('open'); }

// ── THEMA ─────────────────────────────────────────────────────
function toggleTheme() {
  const light = document.body.classList.toggle('light');
  localStorage.setItem('hb_theme', light ? 'light' : 'dark');
  document.getElementById('themeBtn').textContent = light ? '🌙' : '☀️';
}
(() => {
  if (localStorage.getItem('hb_theme') === 'light') {
    document.body.classList.add('light');
    document.getElementById('themeBtn').textContent = '🌙';
  }
})();

// ── BACKUP ────────────────────────────────────────────────────
async function downloadBackup() {
  // Build modal with current + server backups
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.innerHTML = `<div class="modal" style="width:400px">
<div class="mhdr"><h3>💾 Backup</h3><button class="xcls" onclick="this.closest('.overlay').remove()">✕</button></div>
<div class="mbdy" style="padding:0">
  <!-- Actuele backup -->
  <div style="padding:10px 16px;border-bottom:1px solid var(--border)">
    <div style="font-size:11px;color:var(--text3);margin-bottom:6px">Actuele data</div>
    <button class="btn" onclick="doDownloadNow();this.closest('.overlay').remove()" style="width:100%;font-size:12px">↓ Download huidige backup</button>
  </div>
  <!-- Server backups -->
  <div id="backupList" style="padding:8px 16px;font-size:12px;color:var(--text3)"><i class="spin">⟳</i> Laden…</div>
</div>
  </div>`;
  document.body.appendChild(modal);

  // Load server backups
  try {
    const backups = await api('/api/backups');
    const el = document.getElementById('backupList');
    if (!el) return;
    if (!backups.length) {
      el.innerHTML = '<div style="color:var(--text3);font-size:12px">Nog geen automatische backups.<br><span style="font-size:11px">Dagelijks om middernacht aangemaakt.</span></div>';
      return;
    }
    el.innerHTML = `<div style="font-size:11px;color:var(--text3);margin-bottom:8px">Automatische backups (laatste 7)</div>` +
      backups.map(b => `<div style="display:flex;align-items:center;padding:7px 0;border-bottom:1px solid var(--border);gap:10px">
    <span style="font-family:'JetBrains Mono',monospace;font-size:12px;flex:1">${esc(b.date)}</span>
    <span style="font-size:11px;color:var(--text3)">${formatSize(b.size)}</span>
    <a href="/api/backups/${esc(b.name)}" download style="font-size:12px;color:var(--acc2);text-decoration:none;font-weight:600">↓</a>
  </div>`).join('');
  } catch (e) {
    const el = document.getElementById('backupList');
    if (el) el.innerHTML = '<div style="color:var(--text3);font-size:12px">Geen backups gevonden.</div>';
  }
}

async function doDownloadNow() {
  const data = await api('/api/data');
  const now = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `hb-inventaris-backup-${now}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  toast('💾 Backup opgeslagen');
}

// ── ONDERDEEL DUPLICEREN ──────────────────────────────────────
function duplicatePart(id) {
  const p = parts.find(x => x.id === id); if (!p) return;
  fillSels();
  document.getElementById('pTitle').textContent = 'Onderdeel dupliceren';
  document.getElementById('peId').value = ''; // new part
  document.getElementById('peName').value = p.name + ' (kopie)';
  document.getElementById('peDesc').value = p.desc || '';
  document.getElementById('peIPN').value = '';
  document.getElementById('peStock').value = 0;
  document.getElementById('peCat').value = p.catId || '';
  document.getElementById('peLoc').value = p.locId || '';
  document.getElementById('peLink').value = p.link || '';
  document.getElementById('peNotes').value = p.notes || '';
  document.getElementById('peMin').value = p.minStock || 0;
  document.getElementById('peActive').checked = true;
  document.getElementById('peImg').value = p.img || '';
  document.getElementById('peImgOld').value = '';
  setImgPreview(p.img || '');
  document.getElementById('imgFile').value = '';
  loadSuppRows(p.suppliers || []);
  document.getElementById('pOvl').classList.add('open');
  setTimeout(() => { document.getElementById('peName').focus(); _partSnapshot = _snapPart(); }, 100);
}

// ── RECENT BEKEKEN ────────────────────────────────────────────
let _recentIds = JSON.parse(localStorage.getItem('hb_recent') || '[]');

function addRecent(id) {
  _recentIds = _recentIds.filter(x => x !== id);
  _recentIds.unshift(id);
  if (_recentIds.length > 5) _recentIds = _recentIds.slice(0, 5);
  localStorage.setItem('hb_recent', JSON.stringify(_recentIds));
  renderRecent();
}

function renderRecent() {
  const recent = _recentIds.map(id => parts.find(p => p.id === id)).filter(Boolean);
  const el = document.getElementById('recentBar');
  if (!el) return;
  if (!recent.length) { el.style.display = 'none'; return; }
  el.style.display = '';
  el.innerHTML = '<span style="font-size:10px;color:var(--text3);margin-right:6px;flex-shrink:0">Recent:</span>' +
    recent.map(p => `<button onclick="selPart(${p.id})" style="background:var(--surf2);border:1px solid var(--border);border-radius:4px;color:var(--text2);font-size:11px;padding:2px 8px;cursor:pointer;white-space:nowrap;transition:all .15s" onmouseover="this.style.borderColor='var(--acc);this.style.color='var(--acc)'" onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text2)'">${esc(p.name)}</button>`).join('');
}

// ── SNELTOETSEN ───────────────────────────────────────────────
document.getElementById('srch').addEventListener('input', e => {
  window._lowStockMode = false;
  srch = e.target.value;
  // When searching, show all results (don't filter by category)
  document.getElementById('vTitle').textContent = srch
    ? `Zoeken in alle onderdelen: "${srch}"`
    : (catF !== null ? (CATS[catF] || 'Categorie') : 'Alle onderdelen');
  clearTimeout(window._srchT);
  const go = () => {
    renderSidebar(); renderTable();
    if (srch.trim()) { const n = (window._lastBase || []).length; document.getElementById('vTitle').textContent = `Zoeken in alle onderdelen: "${srch}" · ${n} ${n === 1 ? 'resultaat' : 'resultaten'}`; }
  };
  if (parts.length > 500) window._srchT = setTimeout(go, 120); else go();
  showSearchHistory();
});
document.getElementById('srch').addEventListener('focus', showSearchHistory);
document.getElementById('srch').addEventListener('blur', () => setTimeout(() => document.getElementById('srchHistory').style.display = 'none', 150));
document.getElementById('srch').addEventListener('keydown', e => {
  if (e.key === 'Enter' && srch.trim()) {
    addSearchHistory(srch.trim());
    const res = filtered();
    if (res.length === 1) { selPart(res[0].id); e.target.blur(); }   // één treffer: meteen openen
  }
});
document.addEventListener('keydown', e => {
  if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (e.ctrlKey || e.metaKey || e.altKey) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey && (e.key === 'z' || e.key === 'Z') && _undo) { e.preventDefault(); doUndo(); }
    return;
  }
  if (e.key === '/') { e.preventDefault(); document.getElementById('srch').focus(); }
  if (e.key === 'F2') { e.preventDefault(); openScannerQuick(); }
  if (e.key === 'z' || e.key === 'Z') toggleZeroStock();
  if (e.key === 'r' || e.key === 'R') openReorderModal();
  if (e.key === 'Escape') {
    closeScannerQuick(); closeReorderModal();
    closeDet(); closePart(); closeLocModal(); closeKastModal(); closeMediaModal(); closeMediaDet(); closeMediaPicker(); closeSuppModal(); closeDashboard(); closeOrderList(); closeExport(); closeMoreMenu(); closeHistModal(); closeProjectsModal(); closeProjEdit(); closeOrdersModal(); closeOrderEdit(); closeHelp();
  }
  if (e.key === 'n' || e.key === 'N') openAdd();
  if (e.key === 'b' || e.key === 'B') openOrderList();
  if (e.key === 'd' || e.key === 'D') openDashboard();
  if (e.key === 'e' || e.key === 'E') openExport();
  if (e.key === 'h' || e.key === 'H') openHistModal();
  if (e.key === 'k' || e.key === 'K') openKastModal();
  if (e.key === 'm' || e.key === 'M') openMediaModal();
  if (e.key === 'p' || e.key === 'P') openProjectsModal();
  if (e.key === 'i' || e.key === 'I') openOrdersModal();
  if (e.key === '?') openHelp();
  // Snelkoppelingen als een onderdeel open is
  if (selId) {
    if (e.key === 'f' || e.key === 'F') openEdit(selId);                   // F = bewerk
    if (e.key === 'ArrowUp' || e.key === '+') { e.preventDefault(); adjStock(1); }   // + of pijl omhoog = +1
    if (e.key === 'ArrowDown' || e.key === '-') { e.preventDefault(); adjStock(-1); }  // - of pijl omlaag = -1
    if (e.key === 'l' || e.key === 'L') switchTab('hist');                  // L = log tab
    if (e.key === 'c' || e.key === 'C') { e.preventDefault(); duplicatePart(selId); }  // C = kopieer
  }
});

// ── SWIPE-ACTIES OP KAARTEN (telefoon) ────────────────────────
// Naar links vegen toont 'Bewerk' en 'Meer'. Tik op de kaart sluit hem weer.
(function swipeCards() {
  const W = 132; let st = null, openRow = null;
  const cardOf = row => row.querySelector('.card');
  function setX(row, x, anim) { const c = cardOf(row); c.style.transition = anim ? 'transform .18s ease' : 'none'; c.style.transform = x ? `translateX(${x}px)` : ''; }
  function closeSwipe(except) { if (openRow && openRow !== except) { setX(openRow, 0, true); openRow.classList.remove('sw-open'); openRow = null; } }
  window.closeSwipe = closeSwipe;
  document.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'touch') return;
    const row = e.target.closest?.('.card-row');
    if (!row || e.target.closest('.card-qty, .card-swipe')) { if (!row) closeSwipe(); return; }
    closeSwipe(row);
    st = { row, x: e.clientX, y: e.clientY, base: row === openRow ? -W : 0, lock: false, id: e.pointerId };
  }, true);
  document.addEventListener('pointermove', e => {
    if (!st || e.pointerId !== st.id) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (!st.lock) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy) * 1.6) { st.lock = true; try { st.row.setPointerCapture(e.pointerId); } catch (_) { } }
      else if (Math.abs(dy) > 10) { st = null; return; }   // verticaal scrollen: niets doen
      else return;
    }
    setX(st.row, Math.max(-W, Math.min(0, st.base + dx)), false);
  }, true);
  function end(e) {
    if (!st || e.pointerId !== st.id) return;
    const { row, lock } = st; st = null;
    if (!lock) return;
    window._swipedAt = Date.now();
    const m = new DOMMatrix(getComputedStyle(cardOf(row)).transform), x = m.m41;
    const open = x < -W / 2;
    setX(row, open ? -W : 0, true); row.classList.toggle('sw-open', open); openRow = open ? row : null;
  }
  document.addEventListener('pointerup', end, true);
  document.addEventListener('pointercancel', end, true);
  // Een veeg mag geen 'tik' worden; een tik op een open kaart sluit hem
  document.addEventListener('click', e => {
    const c = e.target.closest?.('.card'); if (!c) return;
    if (Date.now() - (window._swipedAt || 0) < 350) { e.stopPropagation(); e.preventDefault(); return; }
    if (c.parentElement.classList.contains('sw-open')) { e.stopPropagation(); e.preventDefault(); closeSwipe(); }
  }, true);
})();
function swipeDo(e, what, id) {
  e.stopPropagation();
  if (what === 'edit') { closeSwipe(); openEdit(id); }
  else rowMenu(e, id);
}

// ── TOEGANKELIJKHEID ──────────────────────────────────────────
(function a11y() {
  document.querySelectorAll('.xcls:not([aria-label])').forEach(b => b.setAttribute('aria-label', 'Sluiten'));
  const toast = document.getElementById('toast'); if (toast) { toast.setAttribute('role', 'status'); toast.setAttribute('aria-live', 'polite'); }
  // Tabs van het detailpaneel
  const tabs = document.querySelector('.dtabs');
  if (tabs) { tabs.setAttribute('role', 'tablist'); tabs.querySelectorAll('.dtab').forEach(t => { t.setAttribute('role', 'tab'); t.tabIndex = 0; t.setAttribute('aria-selected', t.classList.contains('active') ? 'true' : 'false'); }); }
  // Dialogen: rol, titel, focus erin bij openen en terug bij sluiten, Tab blijft binnen het venster
  const prep = o => {
    const m = o.querySelector('.modal'); if (!m || m.hasAttribute('role')) return;
    m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.tabIndex = -1;
    const h = m.querySelector('h3'); if (h) { h.id = h.id || 'h_' + Math.random().toString(36).slice(2, 8); m.setAttribute('aria-labelledby', h.id); }
  };
  const onOpen = o => { o._ret = document.activeElement; prep(o); setTimeout(() => { const m = o.querySelector('.modal'); if (m && !o.contains(document.activeElement)) m.focus({ preventScroll: true }); }, 30); };
  const onClose = o => { const r = o._ret; o._ret = null; if (r && document.contains(r) && r.focus) r.focus({ preventScroll: true }); };
  const watch = o => {
    if (o._watched) return; o._watched = true; prep(o);
    let was = o.classList.contains('open');
    new MutationObserver(() => { const now = o.classList.contains('open'); if (now && !was) onOpen(o); if (!now && was) onClose(o); was = now; }).observe(o, { attributes: true, attributeFilter: ['class'] });
  };
  document.querySelectorAll('.overlay').forEach(watch);
  new MutationObserver(ms => ms.forEach(m => {
    m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains('overlay')) { watch(n); if (n.classList.contains('open')) onOpen(n); } });
    m.removedNodes.forEach(n => { if (n.nodeType === 1 && n.classList?.contains('overlay') && n._ret) onClose(n); });
  })).observe(document.body, { childList: true });
  document.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      const open = [...document.querySelectorAll('.overlay.open')].pop(); if (!open) return;
      const f = [...open.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')].filter(x => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (!open.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return;
    }
    // Enter/spatie op rij, kaart of tab = tik
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('tbody tr[tabindex], .card[tabindex], .dtab')) { e.preventDefault(); e.target.click(); }
  });
})();

// ── VOORRAAD = 0 FILTER ───────────────────────────────────────
function toggleZeroStock() {
  _chips.zero = !_chips.zero;
  window._zeroStockMode = _chips.zero;
  if (_chips.zero) {
    catF = null; srch = '';
    document.getElementById('srch').value = '';
    document.getElementById('vTitle').textContent = 'Alle onderdelen';
  }
  renderSidebar(); renderTable();
  updateAlertCenter();
}

// ── F2 SNELLE SCANNER ─────────────────────────────────────────
let _scannerQuickEl = null;

function openScannerQuick() {
  if (_scannerQuickEl) { _scannerQuickEl.querySelector('input')?.focus(); return; }
  const div = document.createElement('div');
  div.id = 'scannerQuick';
  div.style.cssText = 'position:fixed;top:64px;right:16px;z-index:600;background:var(--surf);border:2px solid var(--acc);border-radius:var(--r);padding:10px 12px;box-shadow:0 4px 20px rgba(0,0,0,.4);display:flex;gap:8px;align-items:center;animation:su .15s ease';
  div.innerHTML = `<span style="font-size:16px">🔍</span>
<input id="scannerQuickInp" type="text" placeholder="Scan of typ code… (Enter)" autocomplete="off"
  style="background:transparent;border:none;outline:none;color:var(--text);font-family:'JetBrains Mono',monospace;font-size:14px;width:220px">
<button onclick="closeScannerQuick()" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:16px;padding:0 2px">✕</button>`;
  document.body.appendChild(div);
  _scannerQuickEl = div;
  const inp = div.querySelector('input');
  inp.focus();
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = inp.value.trim(); if (!val) return;
      const v = val.toLowerCase();
      const match = parts.find(p => (p.IPN && p.IPN.toLowerCase() === v) || p.name.toLowerCase() === v || String(p.id) === v);
      if (match) { closeScannerQuick(); selPart(match.id); toast(`✓ ${match.name}`); }
      else { toast(`Niet gevonden: ${val}`); inp.select(); }
    }
    if (e.key === 'Escape') closeScannerQuick();
    e.stopPropagation();
  });
  let _t = setTimeout(closeScannerQuick, 30000);
  inp.addEventListener('input', () => { clearTimeout(_t); _t = setTimeout(closeScannerQuick, 30000); });
}

function closeScannerQuick() {
  _scannerQuickEl?.remove();
  _scannerQuickEl = null;
}

// ── HERBESTELVOORSTEL ─────────────────────────────────────────
function openReorderModal() {
  const low = parts.filter(p => p.active !== false && p.minStock > 0 && (p.stock || 0) < p.minStock)
    .sort((a, b) => ((a.stock || 0) - a.minStock) - ((b.stock || 0) - b.minStock));
  const modal = document.createElement('div');
  modal.className = 'overlay open';
  modal.id = 'reorderOvl';
  if (!low.length) {
    modal.innerHTML = `<div class="modal" style="width:440px"><div class="mhdr"><h3>📬 Herbestelvoorstel</h3><button class="xcls" onclick="closeReorderModal()">✕</button></div><div class="mbdy"><div class="empty"><div class="big">✅</div><p>Alles op voorraad!</p></div></div></div>`;
    document.body.appendChild(modal); return;
  }
  const bySuppId = {};
  low.forEach(p => {
    const supps = p.suppliers?.length ? p.suppliers : [{ suppId: null }];
    supps.forEach(se => {
      const k = String(se.suppId || '_none');
      if (!bySuppId[k]) bySuppId[k] = { supp: suppById(se.suppId), items: [] };
      bySuppId[k].items.push({ p, se });
    });
  });
  function buildText() {
    let out = '';
    Object.values(bySuppId).forEach(({ supp, items }) => {
      out += `=== ${supp ? supp.name : 'Geen leverancier'} ===\n`;
      if (supp?.url) out += `${supp.url}\n`;
      out += '\n';
      items.forEach(({ p, se }) => {
        const need = p.minStock - (p.stock || 0);
        out += `• ${p.name}`;
        if (p.IPN) out += ` [${p.IPN}]`;
        if (se.sku) out += ` — art.nr: ${se.sku}`;
        out += ` — aantal: ${need}`;
        if (se.price) out += ` — €${(se.price * need).toFixed(2)} (${need}× €${se.price.toFixed(2)})`;
        if (se.link || p.link) out += `\n  ${se.link || p.link}`;
        out += '\n';
      });
      const total = items.reduce((s, { p, se }) => s + (se.price || 0) * (p.minStock - (p.stock || 0)), 0);
      if (total > 0) out += `Subtotaal: €${total.toFixed(2)}\n`;
      out += '\n';
    });
    return out.trim();
  }
  const suppSections = Object.values(bySuppId).map(({ supp, items }) => {
    const total = items.reduce((s, { p, se }) => s + (se.price || 0) * (p.minStock - (p.stock || 0)), 0);
    return `<div style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--border)">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
    ${supp ? `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${esc(supp.color || '#888')}"></span>` : ''}
    <b style="color:var(--text)">${supp ? esc(supp.name) : 'Geen leverancier'}</b>
    ${supp?.url ? `<a href="${esc(supp.url)}" target="_blank" style="font-size:11px;color:var(--acc2)">↗</a>` : ''}
    ${total > 0 ? `<span style="margin-left:auto;color:var(--green);font-size:12px;font-family:'JetBrains Mono',monospace">€${total.toFixed(2)}</span>` : ''}
  </div>
  ${items.map(({ p, se }) => {
      const need = p.minStock - (p.stock || 0);
      return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;font-size:12px;border-bottom:1px solid var(--border)">
      <span style="flex:1;color:var(--text);font-weight:500">${esc(p.name)}</span>
      ${se.sku ? `<span style="color:var(--text3);font-family:'JetBrains Mono',monospace;font-size:11px">${esc(se.sku)}</span>` : ''}
      <span style="color:var(--acc);font-family:'JetBrains Mono',monospace;font-weight:700">×${need}</span>
      ${se.price ? `<span style="color:var(--text2);font-size:11px">€${(se.price * need).toFixed(2)}</span>` : ''}
      ${se.link || p.link ? `<a href="${esc(se.link || p.link)}" target="_blank" style="font-size:11px;color:var(--acc2);text-decoration:none">🔗</a>` : ''}
    </div>`;
    }).join('')}
</div>`;
  }).join('');
  const grandTotal = low.reduce((s, p) => {
    const prices = (p.suppliers || []).map(x => x.price).filter(Boolean);
    return s + (prices.length ? Math.min(...prices) : 0) * (p.minStock - (p.stock || 0));
  }, 0);
  modal.innerHTML = `<div class="modal" style="width:600px;max-height:88vh">
<div class="mhdr">
  <h3>📬 Herbestelvoorstel — ${low.length} onderdelen</h3>
  <div style="display:flex;gap:6px;align-items:center">
    ${grandTotal > 0 ? `<span style="font-size:12px;color:var(--green);font-family:'JetBrains Mono',monospace">Totaal: €${grandTotal.toFixed(2)}</span>` : ''}
    <button class="btn sec" onclick="copyReorderText()" style="font-size:11px;padding:4px 10px">📋 Kopieer tekst</button>
    <button class="xcls" onclick="closeReorderModal()">✕</button>
  </div>
</div>
<div class="mbdy" style="padding:16px;overflow-y:auto;max-height:calc(88vh - 60px)">
  ${suppSections}
  <textarea id="reorderText" style="width:100%;height:0;opacity:0;position:absolute;pointer-events:none">${esc(buildText())}</textarea>
</div>
  </div>`;
  document.body.appendChild(modal);
}

function closeReorderModal() { document.getElementById('reorderOvl')?.remove(); }

function copyReorderText() {
  const txt = document.getElementById('reorderText')?.value; if (!txt) return;
  navigator.clipboard.writeText(txt).then(() => toast('📋 Tekst gekopieerd!')).catch(() => {
    const ta = document.getElementById('reorderText');
    ta.style.height = '1px'; ta.select(); document.execCommand('copy'); ta.style.height = '0';
    toast('📋 Tekst gekopieerd!');
  });
}

// ── INIT ─────────────────────────────────────────────────────
(async () => {
  buildMenus();
  await Promise.all([loadAll(), loadServerConfig()]);
  loadUpdateInfo();
  applyColVis();
  renderSidebar();
  renderTable();
  renderRecent();
  // Deep-link: ?part=123 of ?project=456
  handleDeepLink();
  applyReadOnly();
  if (_refreshInterval > 0) setAutoRefresh(_refreshInterval);
  setTimeout(() => checkSmartSuggestions(), 2000);
  setTimeout(() => checkLowStockNotifs(), 3500);
  setTimeout(() => checkExpiryNotifications(), 5000);
  // Label option listeners
  ['labelSize', 'labelContent', 'labelSelection'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', renderLabelPreview);
  });
})();
// ── SERVICE WORKER — uitgeschakeld ───────────────────────────
// Verwijder eventuele oude service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
  });
}
