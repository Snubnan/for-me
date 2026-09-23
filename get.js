/* ══════════════════════════════════════════════════════════════
   OM Tools — sidebar side (loaded by monScript from sidebar.html)

   Reads the logged-in name out of the sidebar and, when it is in the
   whitelist, publishes it through the OS clipboard as

       OM-ACCESS:<name>

   Every page tab (monScript) reads that once and unlocks its ELEMENT
   BUFFER section. Tabs of an anti-detect browser are isolated from each
   other — the system clipboard is the only channel between them.

   Note: this is a convenience lock, not real protection. Anything that
   runs in the browser can be read and edited by whoever runs it.
   ══════════════════════════════════════════════════════════════ */
(() => {
  const VERSION = 1;

  /* keep this list in sync with OM_WHITELIST in monScript */
  const WHITELIST = [
    'danil danil',
    'Niki last',
  ];

  const NAME_SEL   = '.login span[class*="text-om-neutral-500"]';
  const ACCESS_TAG = 'OM-ACCESS:';
  const POLL_MS    = 1500;

  if (window.__omAccess && window.__omAccess.version === VERSION) {
    window.__omAccess.rescan();
    return;
  }
  try { if (window.__omAccess && window.__omAccess.uninstall) window.__omAccess.uninstall(); } catch(e){}

  const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
  const key  = (s) => norm(s).toLowerCase();
  const allowed = new Set(WHITELIST.map(key));

  const getUserNames = () => {
    const els = document.querySelectorAll(NAME_SEL);
    return [...els].map(el => norm(el.textContent)).filter(Boolean);
  };

  /* ── tiny badge in the corner of the sidebar ── */
  let badge = null, label = null, timer = null;
  const CSS = `
    #__om_access__ {
      position: fixed; right: 10px; bottom: 10px; z-index: 2147483647;
      display: none; align-items: center; gap: 8px;
      padding: 7px 11px; border-radius: 7px;
      background: #0d1117; border: 1px solid #4ade80;
      box-shadow: 0 6px 24px rgba(0,0,0,0.7);
      font-family: 'Courier New', Courier, monospace; font-size: 11px;
      color: #4ade80; cursor: pointer; user-select: none;
      transition: background 0.12s, border-color 0.12s;
    }
    #__om_access__:hover { background: #111820; border-color: #86efac; }
    #__om_access__ .om-ac-i { font-size: 13px; line-height: 1; }
    #__om_access__ .om-ac-n { color: #c9d1d9; font-weight: 700; }
    #__om_access__.om-ac-done { border-color: #e6a817; color: #e6a817; }
    #__om_access__.om-ac-done .om-ac-n { color: #f5c842; }
  `;

  const injectCSS = () => {
    if (document.getElementById('__om_access_css__')) return;
    const s = document.createElement('style');
    s.id = '__om_access_css__';
    s.textContent = CSS;
    document.documentElement.appendChild(s);
  };

  const ensureBadge = () => {
    if (badge && badge.isConnected) return badge;
    injectCSS();
    badge = document.createElement('div');
    badge.id = '__om_access__';
    const ic = document.createElement('span'); ic.className = 'om-ac-i'; ic.textContent = '⚿';
    label = document.createElement('span'); label.className = 'om-ac-n';
    const hint = document.createElement('span'); hint.textContent = 'copy access';
    badge.appendChild(ic); badge.appendChild(label); badge.appendChild(hint);
    badge.addEventListener('click', () => { if (badge.__name) copyAccess(badge.__name, false); });
    document.documentElement.appendChild(badge);
    return badge;
  };

  /* ── clipboard write (async API first, execCommand as the fallback) ── */
  const copyAccess = async (name, quiet) => {
    const txt = ACCESS_TAG + name;
    let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; } catch(e){}
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = txt;
        ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
        document.documentElement.appendChild(ta);
        ta.select(); ta.setSelectionRange(0, txt.length);
        ok = document.execCommand('copy');
        ta.remove();
      } catch(e){}
    }
    const b = ensureBadge();
    if (ok) {
      b.classList.add('om-ac-done');
      b.lastChild.textContent = 'copied — paste in the tab';
      console.log('[OM Access] clipboard <- ' + txt);
    } else if (!quiet) {
      b.classList.remove('om-ac-done');
      b.lastChild.textContent = 'click me to copy';
    }
    return ok;
  };

  /* ── whitelist watcher ── */
  const notified = new Set();

  const runWhitelistAction = (name) => {
    const b = ensureBadge();
    b.__name = name;
    label.textContent = name;
    b.classList.remove('om-ac-done');
    b.lastChild.textContent = 'copy access';
    b.style.display = 'flex';
    /* one silent attempt; browsers may want a real click, hence the badge */
    copyAccess(name, true).then(ok => {
      if (ok) return;
      const once = () => { document.removeEventListener('click', once, true); copyAccess(name, true); };
      document.addEventListener('click', once, true);
    });
  };

  const rescan = () => {
    const names = getUserNames();
    let any = false;
    for (const n of names) {
      if (!allowed.has(key(n))) continue;
      any = true;
      if (notified.has(key(n))) continue;
      notified.add(key(n));
      runWhitelistAction(n);
    }
    if (!any && badge && !badge.__name) badge.style.display = 'none';
    return names;
  };

  const start = () => {
    rescan();
    if (timer) clearInterval(timer);
    timer = setInterval(rescan, POLL_MS);
  };

  const uninstall = () => {
    if (timer) { clearInterval(timer); timer = null; }
    if (badge) { badge.remove(); badge = null; }
    const c = document.getElementById('__om_access_css__'); if (c) c.remove();
    window.__omAccess = null;
    return { ok: true };
  };

  window.__omAccess = {
    version: VERSION,
    rescan, uninstall,
    names: getUserNames,
    copy: copyAccess,
    whitelist: WHITELIST,
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();

  console.log('[OM Access] sidebar watcher v' + VERSION + ' ready');
})();
