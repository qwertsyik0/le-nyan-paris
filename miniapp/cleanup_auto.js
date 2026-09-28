(function () {
  function loadHardAdminFallback() {
    try {
      if (document.getElementById("hard-admin-fallback-script")) return;
      const script = document.createElement("script");
      script.id = "hard-admin-fallback-script";
      script.src = "./hard_admin.js?v=20260928-hard-admin-2";
      document.body.appendChild(script);
    } catch (error) {
      console.warn("hard admin fallback skipped", error);
    }
  }

  async function cleanupTestApplications() {
    try {
      if (!initData || sessionStorage.getItem("paris-test-cleanup-done")) return;
      sessionStorage.setItem("paris-test-cleanup-done", "1");

      const response = await fetch(`${API_BASE}/api/admin/cleanup/test-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      if (!response.ok) return;
      const data = await response.json().catch(() => ({}));
      if (data.deleted_count > 0) {
        console.log("test applications deleted", data.deleted);
        if (typeof loadAdminOverview === "function") loadAdminOverview();
      }
    } catch (error) {
      console.warn("test application cleanup skipped", error);
    }
  }

  window.setTimeout(loadHardAdminFallback, 300);
  window.setTimeout(loadHardAdminFallback, 1600);
  window.setTimeout(cleanupTestApplications, 1800);
})();
