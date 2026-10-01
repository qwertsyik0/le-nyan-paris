(() => {
  const inactiveExcludedUsernames = new Set([
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

  const messages = {
    inactive_excluded: {
      title: "Вы исключены",
      heading: "вы исключены",
      message: "вы исключены из Le Nyan Paris за бездействие. доступ к Mini App, боту, анкетам, письмам и участию в проекте закрыт.",
    },
    blocked: {
      title: "Доступ ограничен",
      heading: "вы заблокированы",
      message: "доступ к Le Nyan Paris для вас ограничен.",
    },
  };

  function clean(value) {
    return String(value || "").trim().replace(/^@/, "").toLowerCase();
  }

  function safeText(value) {
    return String(value || "").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  function showRestricted(detail = messages.blocked) {
    const title = detail.title || messages.blocked.title;
    const heading = detail.heading || detail.title || messages.blocked.heading;
    const text = detail.message || messages.blocked.message;

    window.__accessRestricted = true;
    document.title = title;
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#160606;color:#fff;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
        <section style="width:min(520px,100%);border:2px solid #ff2b2b;background:#250909;border-radius:24px;padding:28px;text-align:center;box-shadow:0 20px 80px rgba(0,0,0,.35);">
          <div style="font-size:46px;margin-bottom:12px;">⛔</div>
          <h1 style="margin:0 0 14px;color:#ff2b2b;font-size:34px;line-height:1.05;font-weight:1000;text-transform:uppercase;letter-spacing:.04em;">${safeText(heading)}</h1>
          <p style="margin:0;color:#ffd6d6;font-size:17px;font-weight:800;line-height:1.45;">${safeText(text)}</p>
        </section>
      </main>
    `;
  }

  window.__accessRestricted = false;
  window.__showRestrictedAccess = showRestricted;

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (inactiveExcludedUsernames.has(clean(tgUser?.username))) {
    showRestricted(messages.inactive_excluded);
    return;
  }

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    if (response.status === 403) {
      const data = await response.clone().json().catch(() => null);
      const detail = data?.detail;
      if (detail?.blocked || detail?.code === "blocked" || detail?.code === "inactive_excluded") {
        showRestricted(detail);
      }
    }
    return response;
  };
})();
