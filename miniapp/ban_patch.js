(() => {
  const INACTIVE_EXCLUDED_USERNAMES = new Set([
    "limeksvins",
    "leya_666",
    "luka_vo1d",
    "communityr34",
    "mimilset",
    "salamsister",
    "ilovekapebebra",
    "sofiysheva",
    "sofiyusheva",
    "pixel_are_you_okay",
  ]);

  const MESSAGES = {
    inactive_excluded: {
      title: "вы исключены",
      message: "вы исключены из L’Empire des Ombres за бездействие. доступ к боту, Mini App, анкетам, письмам и участию в проекте закрыт.",
    },
    blocked: {
      title: "заблокированы",
      message: "доступ к L’Empire des Ombres для вас ограничен.",
    },
  };

  function installEmpireBranding() {
    document.title = "L’Empire des Ombres";
    const title = document.querySelector(".topbar h1");
    if (title) title.textContent = "L’Empire des Ombres";
    const eyebrow = document.querySelector(".topbar .eyebrow");
    if (eyebrow) eyebrow.textContent = "канцелярия теней";
    const heroEyebrow = document.querySelector(".hero .eyebrow");
    if (heroEyebrow) heroEyebrow.textContent = "Париж, 1808 · империя теней";
    const heroTitle = document.querySelector(".hero h2");
    if (heroTitle) heroTitle.textContent = "кабинет участника";
    const heroText = document.querySelector(".hero p");
    if (heroText) heroText.textContent = "здесь можно подать анкету, проверить статус, получить письма канцелярии и войти в темный Париж L’Empire des Ombres.";

    for (const node of document.querySelectorAll("body *")) {
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE && child.nodeValue.includes("Le Nyan Paris")) {
          child.nodeValue = child.nodeValue.replaceAll("Le Nyan Paris", "L’Empire des Ombres");
        }
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installEmpireBranding, { once: true });
  } else {
    installEmpireBranding();
  }

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
    document.documentElement.style.background = "#050407";
    document.body.innerHTML = `
      <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at top,#4a101a,#050407 62%);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f5ead6;">
        <section style="width:min(560px,100%);border:2px solid rgba(216,181,106,.55);border-radius:28px;background:rgba(18,16,23,.92);box-shadow:0 24px 80px rgba(0,0,0,.55);padding:30px;text-align:center;">
          <div style="font-size:54px;line-height:1;margin-bottom:14px;">🕯</div>
          <h1 style="margin:0 0 14px;font-size:34px;letter-spacing:.08em;text-transform:uppercase;color:#d8b56a;font-weight:1000;">${escapeHtml(title)}</h1>
          <p style="margin:0;font-size:17px;line-height:1.55;font-weight:800;color:#f5ead6;">${escapeHtml(message)}</p>
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
