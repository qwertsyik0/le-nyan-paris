(() => {
  function removeByTitle(list, titles) {
    if (!Array.isArray(list)) return;
    for (let index = list.length - 1; index >= 0; index -= 1) {
      const title = String(list[index]?.title || '');
      if (titles.includes(title)) list.splice(index, 1);
    }
  }

  function revokeMarriageDecree() {
    try {
      if (typeof decrees !== 'undefined') {
        removeByTitle(decrees, ['О брачных союзах']);
      }

      if (typeof newsItems !== 'undefined') {
        removeByTitle(newsItems, ['Браки теперь только с разрешения императора']);
      }

      if (typeof renderDecrees === 'function') renderDecrees();
      if (typeof renderNews === 'function') renderNews();
    } catch (error) {
      console.warn('marriage revocation skipped', error);
    }
  }

  revokeMarriageDecree();
  setTimeout(revokeMarriageDecree, 300);
  setTimeout(revokeMarriageDecree, 1200);
})();
