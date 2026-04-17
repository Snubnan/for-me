(() => {
  const WHITELIST = [
    'Niki last',
    'John doe',
  ];

  const getUserNames = () => {
    const els = document.querySelectorAll('.login span[class*="text-om-neutral-500"]');
    return [...els].map(el => el.textContent.trim()).filter(Boolean);
  };

  const notified = new Set();

  const runWhitelistAction = (name) => {
    const { Notification } = require('electron');
    const n = new Notification({
      title: 'OM Tools',
      body: `✅ все працює! (${name})`
    });
    n.show();
  };

  const check = () => {
    const names = getUserNames();
    for (const name of names) {
      if (notified.has(name.toLowerCase())) continue;
      if (WHITELIST.some(w => w.toLowerCase() === name.toLowerCase())) {
        console.log('[OM Tools] whitelist match:', name);
        notified.add(name.toLowerCase());
        runWhitelistAction(name);
      }
    }
  };

  check();
  new MutationObserver(() => check())
    .observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
