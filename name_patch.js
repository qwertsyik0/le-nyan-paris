(() => {
  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase().replace(/^@/, '');
  }

  function applyNamePatch() {
    try {
      if (typeof acceptedRoles === 'undefined' || !Array.isArray(acceptedRoles)) return;
      const kiraEntry = acceptedRoles.find((item) => normalizeUsername(item.username) === 'mommytil');
      if (!kiraEntry) return;
      kiraEntry.name = 'Кира';
      if (typeof renderRoles === 'function') renderRoles();
    } catch (error) {
      console.warn('name patch skipped', error);
    }
  }

  applyNamePatch();
  setTimeout(applyNamePatch, 300);
  setTimeout(applyNamePatch, 1200);
})();
