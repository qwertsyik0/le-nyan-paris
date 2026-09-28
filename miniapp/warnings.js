(() => {
  function loadHardAdmin() {
    if (document.getElementById("hard-admin-main-script")) return;
    const script = document.createElement("script");
    script.id = "hard-admin-main-script";
    script.src = "./hard_admin.js?v=20260928-hard-admin-2";
    document.body.appendChild(script);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", loadHardAdmin);
  else loadHardAdmin();
  setTimeout(loadHardAdmin, 700);
  setTimeout(loadHardAdmin, 2000);
})();
