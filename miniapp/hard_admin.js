(() => {
  const API_BASE_HARD = "https://le-nyan-paris-bot.onrender.com";
  const tgHard = window.Telegram?.WebApp;
  const initDataHard = tgHard?.initData || "";

  function esc(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function apiHard(path, payload = {}) {
    if (!initDataHard) throw new Error("открой mini app именно через Telegram-бота");
    const response = await fetch(`${API_BASE_HARD}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: initDataHard, ...payload }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "ошибка запроса");
    return data;
  }

  function setMsg(id, text, type = "") {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text || "";
    el.className = `message ${type}`.trim();
  }

  function formatDate(value) {
    if (!value) return "дата не указана";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString("ru-RU", { dateStyle: "short", timeStyle: "short" });
  }

  function injectHardStyle() {
    if (document.getElementById("hard-admin-style")) return;
    const style = document.createElement("style");
    style.id = "hard-admin-style";
    style.textContent = `
      .hard-panel{display:grid;gap:12px}.hard-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}.hard-panel input,.hard-panel select,.hard-panel textarea{width:100%;box-sizing:border-box;border-radius:12px;border:1px solid var(--line,rgba(88,62,33,.18));padding:10px;background:rgba(255,255,255,.72);color:inherit}.hard-panel textarea{min-height:110px}.hard-warning-card{border:1px solid rgba(132,42,32,.22);background:rgba(255,238,231,.62)}.hard-warning-list{display:grid;gap:10px;margin-top:10px}.hard-warning-list.hidden{display:none}.hard-warning-item{border:1px solid rgba(132,42,32,.16);border-radius:14px;padding:12px;background:rgba(255,255,255,.56)}.hard-warning-item p{white-space:pre-wrap}.hard-muted{font-size:12px;opacity:.72}.hard-mini{font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#8b2f26;font-weight:800}@media(max-width:640px){.hard-row{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function mountWarningsForPlayer() {
    const statusScreen = document.getElementById("tab-status");
    if (!statusScreen || document.getElementById("hard-player-warnings")) return;
    statusScreen.insertAdjacentHTML("beforeend", `
      <article id="hard-player-warnings" class="card hard-warning-card">
        <div class="section-head">
          <div>
            <p class="eyebrow">дисциплина</p>
            <h2>ПРЕДУПРЕЖДЕНИЯ</h2>
            <p id="hard-warning-summary">загрузка...</p>
          </div>
          <button id="hard-warning-toggle" type="button" class="small">посмотреть</button>
        </div>
        <div id="hard-warning-list" class="hard-warning-list hidden"></div>
      </article>
    `);
    document.getElementById("hard-warning-toggle")?.addEventListener("click", () => {
      document.getElementById("hard-warning-list")?.classList.toggle("hidden");
    });
    loadPlayerWarnings();
  }

  async function loadPlayerWarnings() {
    const summary = document.getElementById("hard-warning-summary");
    const list = document.getElementById("hard-warning-list");
    if (!summary || !list) return;
    try {
      const data = await apiHard("/api/warnings");
      const rows = Array.isArray(data.warnings) ? data.warnings : [];
      summary.textContent = rows.length ? `активных записей: ${rows.length}` : "активных записей нет";
      list.innerHTML = rows.length ? rows.map((item) => `
        <div class="hard-warning-item">
          <b>${esc(item.type_label || item.type || "предупреждение")}</b>
          <p>${esc(item.reason || "без причины")}</p>
          <div class="hard-muted">выдал: ${esc(item.admin || "администрация")} • ${esc(formatDate(item.created_at))}</div>
        </div>
      `).join("") : `<div class="hard-warning-item">предупреждений нет.</div>`;
    } catch (error) {
      summary.textContent = "предупреждения временно не загрузились";
      list.innerHTML = `<div class="hard-warning-item">${esc(error.message)}</div>`;
    }
  }

  function mountAdminHardPanels() {
    const admin = document.getElementById("tab-admin");
    if (!admin || document.getElementById("hard-admin-panels")) return;
    admin.insertAdjacentHTML("beforeend", `
      <article id="hard-admin-panels" class="card hard-panel">
        <p class="eyebrow">прямое управление</p>
        <h2>рассылка по разделам</h2>
        <div class="hard-row">
          <label><span>кому</span><select id="hard-group-target"><option value="all">всем</option><option>двор</option><option>суд</option><option>полиция</option><option>армия</option><option>пресса</option><option>медицина</option><option>церковь</option><option>город</option><option>подполье</option><option>рынок</option></select></label>
          <label><span>тип</span><select id="hard-group-type"><option value="letter">письмо</option><option value="summons">повестка</option><option value="task">задание</option><option value="rumor">слух</option><option value="warning">предупреждение</option></select></label>
        </div>
        <input id="hard-group-title" placeholder="заголовок">
        <textarea id="hard-group-body" placeholder="текст рассылки"></textarea>
        <button id="hard-group-send" class="primary wide" type="button">отправить по разделу</button>
        <div id="hard-group-message" class="message"></div>
      </article>

      <article id="hard-warning-admin-card" class="card hard-panel hard-warning-card">
        <p class="eyebrow">дисциплина</p>
        <h2>предупреждения игрокам</h2>
        <div class="hard-row">
          <label><span>игрок</span><input id="hard-warning-target" placeholder="@username или Telegram ID"></label>
          <label><span>тип</span><select id="hard-warning-type"><option value="oral">устное замечание</option><option value="remark">замечание</option><option value="warning">предупреждение</option><option value="reprimand">выговор</option></select></label>
        </div>
        <textarea id="hard-warning-reason" placeholder="причина: что нарушил, когда и после каких замечаний"></textarea>
        <button id="hard-warning-send" class="primary wide" type="button">выдать предупреждение</button>
        <div id="hard-warning-admin-message" class="message"></div>
      </article>
    `);
    document.getElementById("hard-group-send")?.addEventListener("click", sendGroupLetterHard);
    document.getElementById("hard-warning-send")?.addEventListener("click", sendWarningHard);
  }

  async function sendGroupLetterHard() {
    const payload = {
      target_group: document.getElementById("hard-group-target")?.value || "all",
      letter_type: document.getElementById("hard-group-type")?.value || "letter",
      title: document.getElementById("hard-group-title")?.value.trim() || "письмо из канцелярии",
      body: document.getElementById("hard-group-body")?.value.trim() || "",
    };
    if (!payload.body) return setMsg("hard-group-message", "укажи текст рассылки", "error");
    setMsg("hard-group-message", "отправляю...");
    try {
      const data = await apiHard("/api/admin/letters/group", payload);
      setMsg("hard-group-message", `готово: создано ${data.letters_created ?? 0}, уведомлено ${data.notified ?? 0}, ошибок ${data.notify_failed ?? 0}`, "ok");
      const body = document.getElementById("hard-group-body");
      if (body) body.value = "";
    } catch (error) {
      setMsg("hard-group-message", error.message, "error");
    }
  }

  async function sendWarningHard() {
    const target = document.getElementById("hard-warning-target")?.value.trim() || "";
    const warning_type = document.getElementById("hard-warning-type")?.value || "warning";
    const reason = document.getElementById("hard-warning-reason")?.value.trim() || "";
    if (!target || !reason) return setMsg("hard-warning-admin-message", "укажи игрока и причину", "error");
    setMsg("hard-warning-admin-message", "выдаю...");
    try {
      const data = await apiHard("/api/admin/warnings/create", { target, warning_type, reason });
      setMsg("hard-warning-admin-message", `готово: ${data.warning?.type_label || "предупреждение"} для ${data.target || target}${data.notify_ok ? "" : " | уведомление не отправилось"}`, "ok");
      const reasonField = document.getElementById("hard-warning-reason");
      if (reasonField) reasonField.value = "";
    } catch (error) {
      setMsg("hard-warning-admin-message", error.message, "error");
    }
  }

  function mountHardAdmin() {
    injectHardStyle();
    mountWarningsForPlayer();
    mountAdminHardPanels();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mountHardAdmin);
  else mountHardAdmin();
  setTimeout(mountHardAdmin, 500);
  setTimeout(mountHardAdmin, 1500);
  setTimeout(mountHardAdmin, 3000);
})();
