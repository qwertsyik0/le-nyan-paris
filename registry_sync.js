(() => {
  const API_URL = 'https://le-nyan-paris-bot.onrender.com/api/public/accepted';

  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase().replace(/^@/, '');
  }

  async function syncRegistryFromBot() {
    if (!Array.isArray(acceptedRoles) || typeof renderRoles !== 'function') return;
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      if (!data.ok || !Array.isArray(data.roles)) return;

      const byUsername = new Map(acceptedRoles.map((item) => [normalizeUsername(item.username), item]));
      for (const role of data.roles) {
        const key = normalizeUsername(role.username);
        if (!key || key === 'без username') continue;
        if (!byUsername.has(key)) {
          const item = {
            username: role.username,
            name: role.name || 'без имени',
            role: role.role || 'роль не указана',
            group: role.group || 'город',
            note: role.note || role.role || 'принят через бота'
          };
          acceptedRoles.push(item);
          byUsername.set(key, item);
        }
      }
      renderRoles();
    } catch (error) {
      console.warn('registry sync skipped', error);
    }
  }

  syncRegistryFromBot();
})();
