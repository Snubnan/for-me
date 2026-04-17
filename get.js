(() => {
  const WHITELIST = [
    '[SFS SWAP] Emilia {team Danya}',
    'nikita 1',
  ];

  const getUserNames = () => {
    const els = document.querySelectorAll('.login span[class*="text-om-neutral-500"]');
    return [...els].map(el => el.textContent.trim()).filter(Boolean);
  };

  const notified = new Set();

  const runWhitelistAction = (name) => {
  const { exec } = require('child_process');
  const msg = `whitelist match: ${name}`;
  //exec(`powershell -Command "New-BurntToastNotification -Text 'OM Tools', '${msg}'"`, (err) => {
    if (err) {
      exec(`powershell -Command "[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms'); [System.Windows.Forms.MessageBox]::Show('${msg}', 'OM Tools')"`);
    }
  });

  // відкрити рік рол в браузере
  exec('"C:\\Program Files (x86)\\Steam\\steam.exe" -applaunch 570');
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
