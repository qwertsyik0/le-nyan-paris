(() => {
  function normalizeUsername(value) {
    return String(value || '').trim().toLowerCase().replace(/^@/, '');
  }

  function applyCharacterPatches() {
    try {
      if (typeof acceptedRoles === 'undefined' || !Array.isArray(acceptedRoles)) return;

      const kiraEntry = acceptedRoles.find((item) => normalizeUsername(item.username) === 'mommytil');
      if (kiraEntry) {
        kiraEntry.name = 'Кира';
      }

      const derekEntry = acceptedRoles.find((item) => normalizeUsername(item.username) === 'inf2cted');
      if (derekEntry) {
        derekEntry.name = 'Дерек Шварц';
        derekEntry.role = 'рядовой солдат императорской армии';
        derekEntry.group = 'армия';
        derekEntry.note = 'строевая служба, гарнизон и воинский учет';
      }

      if (typeof renderRoles === 'function') renderRoles();
    } catch (error) {
      console.warn('character patches skipped', error);
    }
  }

  applyCharacterPatches();
  setTimeout(applyCharacterPatches, 300);
  setTimeout(applyCharacterPatches, 1200);
})();
