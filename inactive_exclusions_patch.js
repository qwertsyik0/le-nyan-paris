(() => {
  const excludedUsernames = new Set([
    "limeksvins",
    "leya_666",
    "luka_vo1d",
    "communityr34",
    "tvorog_t",
    "mimilset",
    "salamsister",
    "ilovekapebebra",
    "sofiysheva",
    "sofiyusheva",
    "pixel_are_you_okay",
  ]);

  function clean(value) {
    return String(value || "").trim().replace(/^@/, "").toLowerCase();
  }

  function removeInactiveRoles() {
    if (!Array.isArray(window.acceptedRoles)) return;
    window.acceptedRoles = window.acceptedRoles.filter((role) => !excludedUsernames.has(clean(role.username)));
    if (typeof window.renderRoles === "function") window.renderRoles();
  }

  removeInactiveRoles();
  window.removeInactiveRoles = removeInactiveRoles;
})();
