/* Taalkeuze (Nederlands / English).
 * Nederlands is de brontaal in de code. Staat de taal op Engels, dan vertaalt deze laag alle tekst in de pagina
 * (tekstknopen, placeholder/title/aria-label/alt, alert/confirm/prompt) met het woordenboek in i18n-en.js.
 * Teksten die niet in het woordenboek staan blijven gewoon Nederlands. Gebruikersdata (namen, notities) wordt
 * alleen vertaald als hij exact (of als begin/eind van een lange zin) overeenkomt met een woordenboekregel.
 */
(function () {
  var KEY = 'hb_lang', lang = '';
  try { lang = localStorage.getItem(KEY) || ''; } catch (e) { }
  if (lang !== 'nl' && lang !== 'en') lang = /^nl\b/i.test(navigator.language || '') ? 'nl' : 'en';
  window.HB_LANG = lang;
  window.HB_LOCALE = lang === 'en' ? 'en-GB' : 'nl-NL';
  document.documentElement.lang = lang;
  window.setLang = function (l) { try { localStorage.setItem(KEY, l); } catch (e) { } location.reload(); };
  window.toggleLang = function () { window.setLang(lang === 'en' ? 'nl' : 'en'); };
  window.t = function (s) { return lang === 'en' ? tr(String(s)) : s; };
  if (lang !== 'en') return;

  var D = window.HB_I18N_EN || {};
  var exact = Object.create(null), pats = [], keys = [], cache = Object.create(null);
  var decEl = document.createElement('textarea');
  function dec(s) { if (s.indexOf('&') < 0) return s; decEl.innerHTML = s; return decEl.value; }
  function normKey(s) {
    return dec(s.replace(/\\n/g, ' ').replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\')).replace(/\s+/g, ' ').trim();
  }
  function normVal(s) { return dec(s).replace(/\\n/g, '\n').replace(/\\'/g, "'").replace(/\\"/g, '"'); }
  Object.keys(D).forEach(function (k0) {
    var k = normKey(k0), v = normVal(D[k0]);
    if (!k) return;
    if (/\{\d+\}/.test(k)) {
      var src = k.replace(/[.*+?^$()|[\]\\]/g, '\\$&').replace(/\{(\d+)\}/g, '\u0000$1\u0000');
      var idx = [];
      src = src.replace(/(.?)\u0000(\d+)\u0000/g, function (_, pre, n) { idx.push(+n); return pre + (/[A-Za-zÀ-ÿ]/.test(pre) ? '(.*?)' : '(.+?)'); });
      try { pats.push({ raw: k, re: new RegExp('^' + src + '$', 's'), idx: idx, v: v, len: k.replace(/\{\d+\}/g, '').length }); } catch (e) { }
    } else { exact[k] = v; if (k.length >= 6) keys.push(k); }
  });
  pats.sort(function (a, b) { return b.len - a.len; });
  keys.sort(function (a, b) { return b.length - a.length; });
  var isL = function (c) { return /[A-Za-zÀ-ÿ0-9]/.test(c); };

  function core(s, depth) {
    if (exact[s] !== undefined) return exact[s];
    for (var i = 0; i < pats.length; i++) {
      var m = pats[i].re.exec(s);
      if (m) return pats[i].v.replace(/\{(\d+)\}/g, function (_, n) { var j = pats[i].idx.indexOf(+n); if (j < 0) return ''; var cap = m[j + 1]; return (cap === 'en' || cap === 'n' || cap === 's') && /[a-z]\{\d+\}/.test(pats[i].raw) ? (cap === '' ? '' : 's') : core(cap, depth + 1); });
    }
    if (depth < 3) {
      for (var a = 0; a < keys.length; a++) {   // begin: "<vaste tekst> <rest>"
        var k = keys[a];
        if (s.length > k.length && s.lastIndexOf(k, 0) === 0 && !isL(s.charAt(k.length))) {
          return exact[k] + core(s.slice(k.length), depth + 1);
        }
      }
      for (var b = 0; b < keys.length; b++) {   // eind: "<rest> <vaste tekst>"
        var k2 = keys[b], p = s.length - k2.length - 1;
        if (p >= 0 && s.slice(-k2.length) === k2 && !isL(s.charAt(p))) return core(s.slice(0, p + 1), depth + 1) + exact[k2];
      }
    }
    return s;
  }
  var looseRe = null;
  function loose(s) {   // alleen voor systeemschermen (data-i18n-loose): losse stukken vervangen, niet alleen hele zinnen
    if (!looseRe) {
      var ks = Object.keys(exact).filter(function (k) { return k.length >= 3; }).sort(function (a, b) { return b.length - a.length; })
        .map(function (k) { return k.replace(/[.*+?^$()|[\]\\{}]/g, '\\$&'); });
      looseRe = new RegExp('(^|[^A-Za-zÀ-ÿ])(' + ks.join('|') + ')(?![A-Za-zÀ-ÿ])', 'g');
    }
    return s.replace(looseRe, function (m, pre, k) { return pre + exact[k]; });
  }
  function tr(s) {
    if (!s) return s;
    if (cache[s] !== undefined) return cache[s];
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), c = m[2];
    if (!/[A-Za-zÀ-ÿ]/.test(c)) return (cache[s] = s);
    var cc = c.replace(/\s+/g, ' '), r = core(cc, 0);
    if (r === cc && /^bv\. /.test(cc)) r = 'e.g. ' + core(cc.slice(4), 1);
    if (r !== cc) r = r.replace(/\b(\d+) (part|file|item|location|cabinet|compartment|categor|project|order|supplier|result|notification|piece|backup|row|error|warning|issue|filter|image|day)(ies|s)\b/g, function (x, n, w, suf) { return n === '1' ? n + ' ' + (w === 'categor' ? 'category' : w) : x.replace(/ies$/, 'y'); });
    var out = r === cc ? s : m[1] + r + m[3];
    if (Object.keys(cache).length > 5000) cache = Object.create(null);
    return (cache[s] = out);
  }
  window.hbTr = tr; tr.pats = pats;

  var ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 0 };
  function fixAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var v = el.getAttribute && el.getAttribute(ATTRS[i]);
      if (v) { var t = tr(v); if (t !== v) el.setAttribute(ATTRS[i], t); }
    }
    if (el.tagName === 'INPUT' && /^(button|submit|reset)$/.test(el.type)) { var q = tr(el.value); if (q !== el.value) el.value = q; }
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1 || root.tagName === 'SCRIPT' || root.tagName === 'STYLE') return;
    if (root.closest && root.closest('[data-i18n="off"]')) return;
    fixAttrs(root);
    var w = document.createTreeWalker(root, 5, null), n;
    while ((n = w.nextNode())) {
      if (n.nodeType === 3) fixText(n);
      else if (n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE') fixAttrs(n);
    }
  }
  function fixText(n) {
    var p = n.parentNode;
    if (!p || SKIP[p.tagName] || (p.closest && p.closest('[data-i18n="off"],textarea,script,style'))) return;
    var v = n.nodeValue, t = tr(v);
    if (t === v && p.closest && p.closest('[data-i18n-loose]') && /[a-zà-ÿ]{3}/i.test(v)) t = loose(v);
    if (t !== v) n.nodeValue = t;
  }
  var busy = false;
  var obs = new MutationObserver(function (list) {
    if (busy) return;
    busy = true;
    try {
      for (var i = 0; i < list.length; i++) {
        var m = list[i];
        if (m.type === 'childList') m.addedNodes.forEach(walk);
        else if (m.type === 'characterData') fixText(m.target);
        else if (m.type === 'attributes') fixAttrs(m.target);
      }
    } finally { busy = false; obs.takeRecords(); }
  });
  function start() {
    document.title = tr(document.title);
    walk(document.body);
    obs.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);

  ['alert', 'confirm', 'prompt'].forEach(function (fn) {
    var orig = window[fn].bind(window);
    window[fn] = function (msg, def) { return orig(tr(String(msg == null ? '' : msg)), def); };
  });
})();
