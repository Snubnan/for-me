(() => {
  const WHITELIST = [
    'Niki last',
  ];

  const getUserName = () => {
    const el = document.querySelector('.login span[class*="text-om-neutral-500"]');
    return el ? el.textContent.trim() : null;
  };

  const runWhitelistAction = (name) => {
    // системне сповіщення через Node.js/Electron
    const { Notification } = require('electron');
    const n = new Notification({
      title: 'OM Tools',
      body: `✅ все працює! (${name})`
    });
    n.show();
  };

  const check = () => {
    const name = getUserName();
    if (!name) return;
    if (!WHITELIST.some(w => w.toLowerCase() === name.toLowerCase())) return;
    runWhitelistAction(name);
  };

  check();
  new MutationObserver(() => check())
    .observe(document.body || document.documentElement, { childList: true, subtree: true });
})();
