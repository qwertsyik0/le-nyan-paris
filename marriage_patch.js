(() => {
  function hasTitle(list, title) {
    return Array.isArray(list) && list.some((item) => item && item.title === title);
  }

  function addFirst(list, entry) {
    if (!Array.isArray(list) || hasTitle(list, entry.title)) return;
    list.unshift(entry);
  }

  function applyMarriagePatch() {
    try {
      if (typeof decrees !== 'undefined') {
        addFirst(decrees, {
          date: '29 сентября 1808',
          title: 'О брачных союзах',
          text: 'С этого дня ни один брак в Париже не может быть заключен без личного разрешения императора. Священники, чиновники, писари и свидетели не имеют права утверждать брачный союз без императорского согласия. Лица, желающие вступить в брак, обязаны подать прошение в канцелярию с именами, положением, причиной союза и поручителями.'
        });
      }

      if (typeof newsItems !== 'undefined') {
        addFirst(newsItems, {
          date: '29 сентября 1808',
          type: 'указ',
          title: 'Браки теперь только с разрешения императора',
          text: 'Императорская канцелярия объявила новый брачный порядок. Тайные браки, подложные записи, скрытые помолвки и попытки обойти указ будут считаться нарушением императорской воли.'
        });
      }

      if (typeof renderDecrees === 'function') renderDecrees();
      if (typeof renderNews === 'function') renderNews();
    } catch (error) {
      console.warn('marriage patch skipped', error);
    }
  }

  applyMarriagePatch();
  setTimeout(applyMarriagePatch, 300);
  setTimeout(applyMarriagePatch, 1200);
})();
