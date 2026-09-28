(() => {
  const API_BASE = "https://le-nyan-paris-bot.onrender.com";
  const tg = window.Telegram?.WebApp;
  const initData = tg?.initData || "";

  const warningTypeLabels = {
    oral: "устное замечание",
    remark: "замечание",
    warning: "предупреждение",
    reprimand: "выговор",
  };

  const groupLetterTypes = {
    letter: "письмо",
    summons: "повестка",
    task: "задание",
    rumor: "слух",
    warning: "предупреждение",
  };

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function dateText(value) {
    if (!value) return "дата не указана";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function post(path, payload = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData, ...payload }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "ошибка запроса");
    return data;
  }

  function setMessage(id, text, type = "") {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = text || "";
    element.className = `message ${type}`.trim();
  }

  function injectStyle() {
    if (document.getElementById("warnings-ext-style")) return;
    const style = document.createElement("style");
    style.id = "warnings-ext-style";
    style.textContent = `
      .warnings-card{border:1px solid rgba(135,50,39,.22);background:rgba(255,238,231,.68);border-radius:20px;padding:14px;display:grid;gap:12px}.warnings-card header{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.warnings-title{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8b2f26;font-weight:800}.warnings-card strong{display:block;margin-top:4px}.warnings-list{display:grid;gap:10px}.warnings-list.hidden{display:none}.warning-entry{border:1px solid rgba(135,50,39,.16);background:rgba(255,255,255,.58);border-radius:16px;padding:12px;display:grid;gap:6px}.warning-entry header{display:flex;justify-content:space-between;gap:10px}.warning-entry p{white-space:pre-wrap}.warning-meta{font-size:12px;color:var(--muted)}.warning-admin-form{display:grid;gap:10px}.warning-admin-form input,.warning-admin-form select,.warning-admin-form textarea{width:100%;box-sizing:border-box;border:1px solid var(--line);background:rgba(255,255,255,.62);border-radius:14px;padding:10px;color:inherit}.warning-admin-form textarea{min-height:110px}.warning-admin-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:640px){.warning-admin-row{grid-template-columns:1fr}.warnings-card header{display:grid}}
    `;
    document.head.appendChild(style);
  }

  function warningListHtml(warnings) {
    if (!warnings.length) {
      return `<div class="warning-entry">активных предупреждений нет.</div>`;
    }
    return warnings.map((item) => `
      <div class="warning-entry">
        <header>
          <b>${esc(item.type_label || warningTypeLabels[item.type] || "предупреждение")}</b>
          <span class="warning-meta">${esc(dateText(item.created_at))}</span>
        </header>
        <p>${esc(item.reason || "без причины")}</p>
        <span class="warning-meta">выдал: ${esc(item.admin || "администрация")}</span>
      </div>
    `).join("");
  }

  async function loadWarnings() {
    const cards = document.querySelectorAll("[data-warnings-card]");
    if (!cards.length || !initData) return;
    try {
      const data = await post("/api/warnings");
      const warnings = Array.isArray(data.warnings) ? data.warnings : [];
      for (const card of cards) {
        const count = warnings.length;
        card.innerHTML = `
          <header>
            <div>
              <span class="warnings-title">ПРЕДУПРЕЖДЕНИЯ</span>
              <strong>${count ? `активных записей: ${count}` : "активных записей нет"}</strong>
            </div>
            <button class="small" type="button" data-warnings-toggle>посмотреть</button>
          </header>
          <div class="warnings-list hidden">${warningListHtml(warnings)}</div>
        `;
      }
    } catch (error) {
      for (const card of cards) {
        card.innerHTML = `
          <header><div><span class="warnings-title">ПРЕДУПРЕЖДЕНИЯ</span><strong>не удалось загрузить</strong></div></header>
          <div class="warning-entry">${esc(error.message)}</div>
        `;
      }
    }
  }

  function injectPlayerWarnings() {
    const home = document.getElementById("tab-home");
    if (home && !document.getElementById("home-warnings-card")) {
      const card = document.createElement("section");
      card.id = "home-warnings-card";
      card.className = "warnings-card";
      card.setAttribute("data-warnings-card", "1");
      card.innerHTML = `<header><div><span class="warnings-title">ПРЕДУПРЕЖДЕНИЯ</span><strong>загрузка...</strong></div></header>`;
      const quick = home.querySelector(".card h3")?.closest(".card");
      if (quick) home.insertBefore(card, quick);
      else home.appendChild(card);
    }

    const status = document.getElementById("tab-status");
    if (status && !document.getElementById("status-warnings-card")) {
      const card = document.createElement("article");
      card.id = "status-warnings-card";
      card.className = "warnings-card";
      card.setAttribute("data-warnings-card", "1");
      card.innerHTML = `<header><div><span class="warnings-title">ПРЕДУПРЕЖДЕНИЯ</span><strong>загрузка...</strong></div></header>`;
      status.appendChild(card);
    }
  }

  function injectAdminWarnings() {
    const admin = document.getElementById("tab-admin");
    if (!admin || document.getElementById("admin-warnings-panel")) return;
    admin.insertAdjacentHTML("beforeend", `
      <article class="card" id="admin-group-letters-panel">
        <p class="eyebrow">массовые письма</p>
        <h2>рассылка по разделам</h2>
        <div class="warning-admin-form">
          <div class="warning-admin-row">
            <select id="group-letter-target">
              <option value="all">всем</option>
              <option value="двор">двор</option>
              <option value="суд">суд</option>
              <option value="полиция">полиция</option>
              <option value="армия">армия</option>
              <option value="пресса">пресса</option>
              <option value="медицина">медицина</option>
              <option value="церковь">церковь</option>
              <option value="город">город</option>
              <option value="подполье">подполье</option>
              <option value="рынок">рынок</option>
            </select>
            <select id="group-letter-type">
              ${Object.entries(groupLetterTypes).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
            </select>
          </div>
          <input id="group-letter-title" placeholder="заголовок">
          <textarea id="group-letter-body" placeholder="текст письма"></textarea>
          <button id="group-letter-send" class="primary wide" type="button">отправить</button>
          <div id="group-letter-message" class="message"></div>
        </div>
      </article>

      <article class="card" id="admin-warnings-panel">
        <p class="eyebrow">дисциплина</p>
        <h2>предупреждения игрокам</h2>
        <div class="warning-admin-form">
          <div class="warning-admin-row">
            <input id="warning-target" placeholder="@username или Telegram ID">
            <select id="warning-type">
              <option value="oral">устное замечание</option>
              <option value="remark">замечание</option>
              <option value="warning">предупреждение</option>
              <option value="reprimand">выговор</option>
            </select>
          </div>
          <textarea id="warning-reason" placeholder="причина: что нарушил, когда и что было проигнорировано"></textarea>
          <button id="warning-send" class="primary wide" type="button">выдать предупреждение</button>
          <div id="warning-message" class="message"></div>
        </div>
      </article>
    `);

    document.getElementById("group-letter-send")?.addEventListener("click", sendGroupLetter);
    document.getElementById("warning-send")?.addEventListener("click", sendWarning);
  }

  async function sendGroupLetter() {
    const target = document.getElementById("group-letter-target")?.value || "all";
    const letterType = document.getElementById("group-letter-type")?.value || "letter";
    const title = document.getElementById("group-letter-title")?.value.trim() || "";
    const body = document.getElementById("group-letter-body")?.value.trim() || "";
    if (!body) {
      setMessage("group-letter-message", "укажи текст рассылки", "error");
      return;
    }
    setMessage("group-letter-message", "отправляю...");
    try {
      const data = await post("/api/admin/letters/group", {
        target_group: target,
        letter_type: letterType,
        title,
        body,
      });
      setMessage("group-letter-message", `готово: создано ${data.letters_created || 0}, уведомлено ${data.notified || 0}, ошибок ${data.notify_failed || 0}`, "ok");
      const bodyField = document.getElementById("group-letter-body");
      if (bodyField) bodyField.value = "";
    } catch (error) {
      setMessage("group-letter-message", error.message, "error");
    }
  }

  async function sendWarning() {
    const target = document.getElementById("warning-target")?.value.trim() || "";
    const warningType = document.getElementById("warning-type")?.value || "warning";
    const reason = document.getElementById("warning-reason")?.value.trim() || "";
    if (!target || !reason) {
      setMessage("warning-message", "укажи игрока и причину", "error");
      return;
    }
    setMessage("warning-message", "выдаю...");
    try {
      const data = await post("/api/admin/warnings/create", {
        target,
        warning_type: warningType,
        reason,
      });
      setMessage("warning-message", `готово: ${data.warning?.type_label || "предупреждение"} для ${data.target || target}${data.notify_ok ? "" : " | уведомление не отправилось"}`, "ok");
      const reasonField = document.getElementById("warning-reason");
      if (reasonField) reasonField.value = "";
    } catch (error) {
      setMessage("warning-message", error.message, "error");
    }
  }

  function init() {
    injectStyle();
    injectPlayerWarnings();
    injectAdminWarnings();
    loadWarnings();
  }

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest?.("[data-warnings-toggle]");
    if (toggle) {
      toggle.closest(".warnings-card")?.querySelector(".warnings-list")?.classList.toggle("hidden");
    }
    const tab = event.target.closest?.('[data-tab="home"], [data-tab="status"], [data-tab="admin"]');
    if (tab) setTimeout(init, 250);
  });

  setTimeout(init, 300);
  setTimeout(init, 1200);
  setTimeout(init, 2500);
})();
