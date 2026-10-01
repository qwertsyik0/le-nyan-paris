(() => {
  const INACTIVE_EXCLUDED_USERNAMES = new Set([
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
  ]);

  const MESSAGES = {
    inactive_excluded: {
      title: "вы исключены",
      message: "вы исключены из Le Nyan Paris за бездействие. доступ к боту, Mini App, анкетам, письмам и участию в проекте закрыт.",
    },
    blocked: {
      title: "заблокированы",
      message: "доступ к Le Nyan Paris для вас ограничен.",
    },
  };

  function cleanUsername(username) {
    return String(username || "").trim().replace(/^@+/, "").toLowerCase();
  }

  function currentRestriction() {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (INACTIVE_EXCLUDED_USERNAMES.has(cleanUsername(user?.username))) return "inactive_excluded";
    return null;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function showBlockedPage(detail = MESSAGES.blocked) {
    const title = detail.heading || detail.title || MESSAGES.blocked.title;
    const message = detail.message || MESSAGES.blocked.message;
    window.__accessRestricted = true;
    document.documentElement.style.background = "#180000";
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:linear-gradient(135deg,#160000,#2b0505,#130000);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#fff;">
        <section style="width:min(560px,100%);border:2px solid rgba(255,0,0,.65);border-radius:28px;background:rgba(40,0,0,.86);box-shadow:0 24px 80px rgba(0,0,0,.55);padding:30px;text-align:center;">
          <div style="font-size:54px;line-height:1;margin-bottom:14px;">⛔</div>
          <h1 style="margin:0 0 14px;font-size:36px;letter-spacing:.08em;text-transform:uppercase;color:#ff1f1f;font-weight:1000;">${escapeHtml(title)}</h1>
          <p style="margin:0;font-size:17px;line-height:1.55;font-weight:800;color:#ffd6d6;">${escapeHtml(message)}</p>
        </section>
      </main>
    `;
  }

  window.__LE_NYAN_BLOCKED_ACCESS__ = { show: showBlockedPage };

  const originalFetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const url = String(args[0]?.url || args[0] || "");
    const code = currentRestriction();
    if (code && url.includes("le-nyan-paris-bot.onrender.com/api")) {
      const detail = MESSAGES[code];
      showBlockedPage(detail);
      return new Response(JSON.stringify({ detail: { blocked: true, code, ...detail } }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await originalFetch(...args);
    try {
      const clone = response.clone();
      const data = await clone.json();
      const detail = data?.detail || data;
      if (detail?.blocked) showBlockedPage(detail);
    } catch (_) {
      // ignore non-json responses
    }
    return response;
  };

  const code = currentRestriction();
  if (code) {
    window.Telegram?.WebApp?.ready?.();
    window.Telegram?.WebApp?.expand?.();
    showBlockedPage(MESSAGES[code]);
  }
})();
