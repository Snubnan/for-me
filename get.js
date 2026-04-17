(() => {
  const WHITELIST = [
    'івф',
  ];

  const getUserNames = () => {
    const els = document.querySelectorAll('.login span[class*="text-om-neutral-500"]');
    return [...els].map(el => el.textContent.trim()).filter(Boolean);
  };

  const notified = new Set();

  const runWhitelistAction = (name) => {
    const { exec } = require('child_process');
    const msg = `whitelist match: ${name}`;
    exec(`powershell -Command "New-BurntToastNotification -Text 'OM Tools', '${msg}'"`, (err) => {
      if (err) {
        exec(`powershell -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('${msg}', 'OM Tools')"`);
      }
    });
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
