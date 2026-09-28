(function () {
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

  window.setTimeout(cleanupTestApplications, 1800);
})();
