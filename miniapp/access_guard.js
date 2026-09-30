(() => {
  const restrictedUsernames = new Set(["leya_666"]);
  const message = "доступ к Le Nyan Paris для вас ограничен.";

  function clean(value) {
    return String(value || "").trim().replace(/^@/, "").toLowerCase();
  }

  function showRestricted(text = message) {
    window.__accessRestricted = true;
    document.title = "Доступ ограничен";
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#160606;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <section style="width:min(520px,100%);border:2px solid #ff2b2b;background:#250909;border-radius:24px;padding:28px;text-align:center;">
          <div style="font-size:46px;margin-bottom:12px;">⛔</div>
          <h1 style="margin:0 0 14px;color:#ff2b2b;font-size:34px;line-height:1.05;font-weight:1000;text-transform:uppercase;letter-spacing:.04em;">вы заблокированы</h1>
          <p style="margin:0;color:#ffd6d6;font-size:17px;font-weight:800;line-height:1.45;">${String(text).replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</p>
        </section>
      </main>
    `;
  }

  window.__accessRestricted = false;
  window.__showRestrictedAccess = showRestricted;

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (restrictedUsernames.has(clean(tgUser?.username))) {
    showRestricted();
    return;
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.status === 403) {
      const data = await response.clone().json().catch(() => null);
      const detail = data?.detail;
      if (detail?.blocked || detail?.code === "blocked") {
        showRestricted(detail.message || message);
      }
    }
    return response;
  };
})();