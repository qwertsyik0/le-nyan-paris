(() => {
  const base = document.createElement("script");
  base.src = "./app_base.js?v=20260928-admin-base";
  base.onload = () => {
    const ext = document.createElement("script");
    ext.src = "./admin_ext.js?v=20260928-admin-workflow";
    document.body.appendChild(ext);
  };
  document.currentScript.after(base);
})();
