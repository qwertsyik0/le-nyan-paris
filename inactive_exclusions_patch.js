(() => {
  const excludedUsernames = new Set([
    "limeksvins",
    "leya_666",
    "luka_vo1d",
    "communityr34",
    "mimilset",
    "salamsister",
    "ilovekapebebra",
    "sofiysheva",
    "sofiyusheva",
    "pixel_are_you_okay",
    "loli_rose3",
  ]);

  function clean(value) {
    return String(value || "").trim().replace(/^@/, "").toLowerCase();
  }

  function removeInactiveRoles() {
    if (typeof acceptedRoles === "undefined" || !Array.isArray(acceptedRoles)) return;

    for (let index = acceptedRoles.length - 1; index >= 0; index -= 1) {
      if (excludedUsernames.has(clean(acceptedRoles[index]?.username))) {
        acceptedRoles.splice(index, 1);
      }
    }

    if (typeof renderRoles === "function") renderRoles();
  }

  removeInactiveRoles();
  window.removeInactiveRoles = removeInactiveRoles;
})();
