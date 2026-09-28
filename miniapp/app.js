(() => {
  const base = document.createElement("script");
  base.src = "./app_base.js?v=20260928-admin-base";
  base.onload = () => {
    const ext = document.createElement("script");
    ext.src = "./admin_ext.js?v=20260928-admin-workflow";
    ext.onload = () => {
      const warnings = document.createElement("script");
      warnings.src = "./warnings.js?v=20260928-warnings-group-1";
      document.body.appendChild(warnings);
    };
    document.body.appendChild(ext);
  };
  document.currentScript.after(base);
})();