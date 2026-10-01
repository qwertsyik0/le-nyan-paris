(() => {
  const API_URL = 'https://le-nyan-paris-bot.onrender.com/api/public/accepted';
  const EXCLUDED_USERNAMES = new Set([
    'limeksvins',
    'leya_666',
    'luka_vo1d',
    'communityr34',
    'tvorog_t',
    'mimilset',
    'salamsister',
    'ilovekapebebra',
    'sofiysheva',
    'sofiyusheva'
  ]);

  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase().replace(/^@/, '');
  }

  function isOldLukaRecord(role) {
    const key = normalizeUsername(role?.username);
    const name = String(role?.name || '').toLowerCase();
    const job = String(role?.role || '').toLowerCase();
    return key === 'pixel_are_you_okay' && (name.includes('лука нортвест') || job.includes('жандарм'));
  }

  function isExcludedRole(role) {
    return EXCLUDED_USERNAMES.has(normalizeUsername(role?.username));
  }

  function removeExcludedRoles() {
    if (!Array.isArray(acceptedRoles)) return;
    for (let index = acceptedRoles.length - 1; index >= 0; index -= 1) {
      if (isOldLukaRecord(acceptedRoles[index]) || isExcludedRole(acceptedRoles[index])) {
        acceptedRoles.splice(index, 1);
      }
    }
  }

  async function syncRegistryFromBot() {
    if (!Array.isArray(acceptedRoles) || typeof renderRoles !== 'function') return;
    removeExcludedRoles();
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) {
        renderRoles();
        return;
      }
      const data = await response.json();
      if (!data.ok || !Array.isArray(data.roles)) {
        renderRoles();
        return;
      }

      const byUsername = new Map(acceptedRoles.map((item) => [normalizeUsername(item.username), item]));
      for (const role of data.roles) {
        if (isOldLukaRecord(role) || isExcludedRole(role)) continue;
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
      removeExcludedRoles();
      renderRoles();
    } catch (error) {
      removeExcludedRoles();
      renderRoles();
      console.warn('registry sync skipped', error);
    }
  }

  syncRegistryFromBot();
})();