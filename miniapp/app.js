(() => {
  function load(src, afterLoad) {
    const script = document.createElement("script");
    script.src = src;
    script.onload = afterLoad || null;
    document.body.appendChild(script);
    return script;
  }

  const guard = document.createElement("script");
  guard.src = "./access_guard.js?v=20260930-leya-access-2";
  guard.onload = () => {
    if (window.__accessRestricted) return;
    const base = document.createElement("script");
    base.src = "./app_base.js?v=20260928-hard-admin-2";
    base.onload = () => {
      if (window.__accessRestricted) return;
      load("./admin_ext.js?v=20260928-admin-workflow-2", () => {
        if (window.__accessRestricted) return;
        load("./hard_admin.js?v=20260928-hard-admin-2");
        load("./warnings.js?v=20260928-warnings-group-2");
      });
    };
    document.currentScript.after(base);
  };
  document.currentScript.after(guard);
})();