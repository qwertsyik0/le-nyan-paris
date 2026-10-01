(() => {
  const guard = document.createElement("script");
  guard.src = "./access_guard.js?v=20261001-restore-tvorog-1";
  guard.onload = () => {
    if (window.__accessRestricted) return;

    const base = document.createElement("script");
    base.src = "./app_base.js?v=20260928-hard-admin-2";
    base.onload = () => {
      if (window.__accessRestricted) return;

      const admin = document.createElement("script");
      admin.src = "./admin_ext.js?v=20260928-admin-workflow-2";
      admin.onload = () => {
        if (window.__accessRestricted) return;

        const hardAdmin = document.createElement("script");
        hardAdmin.src = "./hard_admin.js?v=20260928-hard-admin-2";
        document.body.appendChild(hardAdmin);

        const warnings = document.createElement("script");
        warnings.src = "./warnings.js?v=20260928-warnings-group-2";
        document.body.appendChild(warnings);
      };
      document.body.appendChild(admin);
    };
    document.body.appendChild(base);
  };
  document.body.appendChild(guard);
})();
