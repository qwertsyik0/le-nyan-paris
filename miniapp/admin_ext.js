(() => {
  const API_BASE_EXT = "https://le-nyan-paris-bot.onrender.com";
  const tgExt = window.Telegram?.WebApp;
  const initDataExt = tgExt?.initData || "";

  const statuses = {
    accepted: "принять",
    needs_changes: "правки",
    rejected: "отклонить",
  };
  const letterTypes = {
    letter: "письмо",
    summons: "повестка",
    task: "задание",
    rumor: "слух",
    warning: "предупреждение",
  };

  function html(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function dateText(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function callApi(path, payload = {}) {
    const response = await fetch(`${API_BASE_EXT}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: initDataExt, ...payload }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.detail || "ошибка запроса");
    return data;
  }

  function setText(id, text, type = "") {
    const element = document.getElementById(id);
    if (!element) return;
    element.textContent = text || "";
    element.className = `message ${type}`.trim();
  }

  function injectStyle() {
    if (document.getElementById("admin-ext-style")) return;
    const style = document.createElement("style");
    style.id = "admin-ext-style";
    style.textContent = `
      .admin-ext-grid { display: grid; gap: 12px; }
      .admin-ext-actions { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
      .admin-ext-box { border: 1px solid var(--line); background: rgba(255,255,255,.44); border-radius: 18px; padding: 12px; display: grid; gap: 8px; }
      .admin-ext-list { display: grid; gap: 10px; margin-top: 12px; }
      .admin-ext-list .item { border: 1px solid var(--line); background: rgba(255,255,255,.48); border-radius: 18px; padding: 12px; display: grid; gap: 6px; }
      .admin-ext-list .item b { color: var(--ink); }
      .admin-ext-list .item p { white-space: pre-wrap; }
      .admin-ext-mini { font-size: 12px; color: var(--muted); }
      .admin-ext-actions .primary, .admin-ext-actions .ghost { width: 100%; }
      @media (max-width: 640px) { .admin-ext-actions { grid-template-columns: 1fr; } }
    `;
    document.head.appendChild(style);
  }

  function mount() {
    injectStyle();
    const admin = document.getElementById("tab-admin");
    if (!admin || document.getElementById("admin-ext-panel")) return;

    admin.insertAdjacentHTML("beforeend", `
      <article id="admin-ext-panel" class="card admin-ext-grid">
        <div class="section-head">
          <div>
            <p class="eyebrow">расширенное управление</p>
            <h3>анкеты, игроки, заметки, шаблоны и журнал</h3>
          </div>
          <button id="admin-ext-refresh" type="button" class="small">обновить</button>
        </div>
        <div id="admin-ext-message" class="message"></div>

        <section class="admin-ext-box">
          <h3>решение по анкете</h3>
          <div class="grid two">
            <label><span>ID анкеты</span><input id="admin-app-id" inputmode="numeric" placeholder="например, 12"></label>
            <label><span>решение</span><select id="admin-app-status">
              <option value="accepted">принять</option>
              <option value="needs_changes">отправить на правки</option>
              <option value="rejected">отклонить</option>
            </select></label>
          </div>
          <label><span>назначенная роль <small>для принятия</small></span><input id="admin-app-role" placeholder="например, посыльная при больнице"></label>
          <label><span>комментарий игроку</span><textarea id="admin-app-comment" rows="3" placeholder="что написать игроку"></textarea></label>
          <button id="admin-app-submit" type="button" class="primary wide">сохранить решение</button>
        </section>

        <section class="admin-ext-box">
          <h3>карточка игрока</h3>
          <div class="grid two">
            <label><span>username / Telegram ID</span><input id="admin-player-query" placeholder="@username или ID"></label>
            <button id="admin-player-load" type="button" class="primary">открыть карточку</button>
          </div>
          <div id="admin-player-card" class="admin-ext-list empty">карточка не открыта</div>
        </section>

        <section class="admin-ext-box">
          <h3>внутренние заметки</h3>
          <label><span>заметка к открытому игроку</span><textarea id="admin-note-body" rows="3" placeholder="видно только администрации"></textarea></label>
          <button id="admin-note-add" type="button" class="ghost wide">добавить заметку</button>
        </section>

        <section class="admin-ext-box">
          <h3>отправка письма</h3>
          <div class="grid two">
            <label><span>получатель</span><input id="admin-letter-target" placeholder="@username или ID"></label>
            <label><span>тип</span><select id="admin-letter-type">
              ${Object.entries(letterTypes).map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}
            </select></label>
          </div>
          <label><span>заголовок</span><input id="admin-letter-title" placeholder="письмо из канцелярии"></label>
          <label><span>текст</span><textarea id="admin-letter-body" rows="5" placeholder="текст письма"></textarea></label>
          <div class="admin-ext-actions">
            <button id="admin-letter-send" type="button" class="primary">отправить письмо</button>
            <button id="admin-template-save" type="button" class="ghost">сохранить как шаблон</button>
          </div>
          <label><span>название шаблона</span><input id="admin-template-name" placeholder="например, повестка в суд"></label>
        </section>

        <section class="admin-ext-box">
          <div class="section-head">
            <h3>шаблоны писем</h3>
            <button id="admin-templates-load" type="button" class="small">обновить</button>
          </div>
          <div id="admin-templates-list" class="admin-ext-list empty">шаблоны не загружены</div>
        </section>

        <section class="admin-ext-box">
          <div class="section-head">
            <h3>журнал действий</h3>
            <button id="admin-logs-load" type="button" class="small">обновить</button>
          </div>
          <div id="admin-logs-list" class="admin-ext-list empty">журнал не загружен</div>
        </section>
      </article>
    `);

    wire();
  }

  let currentPlayerIdentifier = "";

  function renderPlayer(data) {
    const root = document.getElementById("admin-player-card");
    if (!root) return;
    const player = data.player || {};
    const app = data.application;
    const notes = data.notes || [];
    const letters = data.letters || [];
    const logs = data.logs || [];
    root.className = "admin-ext-list";
    root.innerHTML = `
      <div class="item">
        <b>${html(player.username || "без username")} | ${html(player.telegram_id || "")}</b>
        <p>имя Telegram: ${html([player.first_name, player.last_name].filter(Boolean).join(" ") || "—")}</p>
        <p class="admin-ext-mini">регистрация: ${html(dateText(player.created_at) || "—")}</p>
      </div>
      <div class="item">
        <b>анкета</b>
        ${app ? `
          <p>статус: ${html(app.status)}</p>
          <p>персонаж: ${html(app.character_name || "—")}</p>
          <p>роль: ${html(app.assigned_role || app.role_preference || "—")}</p>
          <p>раздел: ${html(app.affiliation || "—")}</p>
          <p class="admin-ext-mini">ID анкеты: ${html(app.id)}</p>
        ` : `<p>анкеты нет</p>`}
      </div>
      <div class="item">
        <b>заметки администрации</b>
        ${notes.length ? notes.map((note) => `<p>• ${html(note.body)}<br><span class="admin-ext-mini">${html(dateText(note.created_at))}</span></p>`).join("") : `<p>заметок нет</p>`}
      </div>
      <div class="item">
        <b>письма игрока</b>
        ${letters.length ? letters.slice(0, 8).map((letter) => `<p>#${html(letter.id)} ${html(letter.type_label || letter.type || "письмо")} • ${html(letter.status_label || letter.status)}<br>${html(letter.title || "без заголовка")}</p>`).join("") : `<p>писем нет</p>`}
      </div>
      <div class="item">
        <b>последние действия</b>
        ${logs.length ? logs.slice(0, 8).map((log) => `<p>${html(log.action)}<br><span class="admin-ext-mini">${html(dateText(log.created_at))}</span></p>`).join("") : `<p>действий нет</p>`}
      </div>
    `;
  }

  function renderTemplates(rows = []) {
    const root = document.getElementById("admin-templates-list");
    if (!root) return;
    if (!rows.length) {
      root.className = "admin-ext-list empty";
      root.textContent = "шаблонов нет";
      return;
    }
    root.className = "admin-ext-list";
    root.innerHTML = rows.map((template) => `
      <div class="item">
        <b>${html(template.name)}</b>
        <p>${html(template.title || "")}</p>
        <p class="admin-ext-mini">тип: ${html(letterTypes[template.letter_type] || template.letter_type)}</p>
        <div class="admin-ext-actions">
          <button type="button" class="small admin-template-use" data-template='${html(JSON.stringify(template))}'>вставить</button>
          <button type="button" class="small admin-template-send" data-template-id="${html(template.id)}">отправить по шаблону</button>
        </div>
      </div>
    `).join("");
  }

  function renderLogs(rows = []) {
    const root = document.getElementById("admin-logs-list");
    if (!root) return;
    if (!rows.length) {
      root.className = "admin-ext-list empty";
      root.textContent = "журнал пуст";
      return;
    }
    root.className = "admin-ext-list";
    root.innerHTML = rows.slice(0, 40).map((log) => `
      <div class="item">
        <b>${html(log.action)}</b>
        <p>цель: ${html(log.target_type || "—")} ${html(log.target_id || log.target_telegram_id || "")}</p>
        <p class="admin-ext-mini">${html(dateText(log.created_at))}</p>
      </div>
    `).join("");
  }

  async function loadPlayer(identifier = null) {
    const query = (identifier || document.getElementById("admin-player-query")?.value || "").trim();
    if (!query) return setText("admin-ext-message", "укажи username или ID игрока", "error");
    currentPlayerIdentifier = query;
    setText("admin-ext-message", "загружаю карточку...");
    try {
      const data = await callApi("/api/admin/player/full", { identifier: query });
      renderPlayer(data);
      setText("admin-ext-message", "карточка загружена", "ok");
    } catch (error) {
      setText("admin-ext-message", error.message, "error");
    }
  }

  async function decideApplication() {
    const applicationId = document.getElementById("admin-app-id")?.value?.trim();
    const status = document.getElementById("admin-app-status")?.value;
    const assignedRole = document.getElementById("admin-app-role")?.value?.trim();
    const comment = document.getElementById("admin-app-comment")?.value?.trim();
    if (!applicationId) return setText("admin-ext-message", "укажи ID анкеты", "error");
    setText("admin-ext-message", "сохраняю решение...");
    try {
      const data = await callApi("/api/admin/applications/decision", {
        application_id: Number(applicationId),
        status,
        assigned_role: assignedRole,
        comment,
      });
      setText("admin-ext-message", data.notify_ok ? "решение сохранено и игрок уведомлен" : "решение сохранено, но уведомление не отправилось", data.notify_ok ? "ok" : "error");
      await loadLogs();
    } catch (error) {
      setText("admin-ext-message", error.message, "error");
    }
  }

  async function addNote() {
    const body = document.getElementById("admin-note-body")?.value?.trim();
    if (!currentPlayerIdentifier) return setText("admin-ext-message", "сначала открой карточку игрока", "error");
    if (!body) return setText("admin-ext-message", "заметка пустая", "error");
    try {
      const data = await callApi("/api/admin/notes/add", { identifier: currentPlayerIdentifier, body });
      document.getElementById("admin-note-body").value = "";
      renderPlayer(data);
      setText("admin-ext-message", "заметка добавлена", "ok");
      await loadLogs();
    } catch (error) {
      setText("admin-ext-message", error.message, "error");
    }
  }

  async function sendLetter() {
    const target = document.getElementById("admin-letter-target")?.value?.trim();
    const letter_type = document.getElementById("admin-letter-type")?.value;
    const title = document.getElementById("admin-letter-title")?.value?.trim();
    const body = document.getElementById("admin-letter-body")?.value?.trim();
    if (!target || !body) return setText("admin-ext-message", "укажи получателя и текст письма", "error");
    try {
      const data = await callApi("/api/admin/letters/send", { target, letter_type, title, body });
      setText("admin-ext-message", data.notify_ok ? "письмо отправлено" : "письмо сохранено, но уведомление не отправилось", data.notify_ok ? "ok" : "error");
      await loadLogs();
    } catch (error) {
      setText("admin-ext-message", error.message, "error");
    }
  }

  async function loadTemplates() {
    try {
      const data = await callApi("/api/admin/templates");
      renderTemplates(data.templates || []);
    } catch (error) {
      setText("admin-ext-message", error.message, "error");
    }
  }

  async function saveTemplate() {
    const name = document.getElementById("admin-template-name")?.value?.trim();
    const letter_type = document.getElementById("admin-letter-type")?.value;
    const title = document.getElementById("admin-letter-title")?.value?.trim();
    const body = document.getElementById("admin-letter-body")?.value?.trim();
    if (!name || !body) return setText("admin-ext-message", "для шаблона нужно название и текст", "error");
    try {
      await callApi("/api/admin/templates/save", { name, letter_type, title, body });
      setText("admin-ext-message", "шаблон сохранен", "ok");
      await loadTemplates();
      await loadLogs();
    } catch (error) {
      setText("admin-ext-message", error.message, "error");
    }
  }

  async function sendTemplate(templateId) {
    const target = document.getElementById("admin-letter-target")?.value?.trim();
    if (!target) return setText("admin-ext-message", "укажи получателя письма", "error");
    try {
      const data = await callApi("/api/admin/letters/send-template", { target, template_id: Number(templateId) });
      setText("admin-ext-message", data.notify_ok ? "шаблон отправлен" : "письмо сохранено, но уведомление не отправилось", data.notify_ok ? "ok" : "error");
      await loadLogs();
    } catch (error) {
      setText("admin-ext-message", error.message, "error");
    }
  }

  async function loadLogs() {
    try {
      const data = await callApi("/api/admin/logs");
      renderLogs(data.logs || []);
    } catch (error) {
      setText("admin-ext-message", error.message, "error");
    }
  }

  function wire() {
    document.getElementById("admin-app-submit")?.addEventListener("click", decideApplication);
    document.getElementById("admin-player-load")?.addEventListener("click", () => loadPlayer());
    document.getElementById("admin-note-add")?.addEventListener("click", addNote);
    document.getElementById("admin-letter-send")?.addEventListener("click", sendLetter);
    document.getElementById("admin-template-save")?.addEventListener("click", saveTemplate);
    document.getElementById("admin-templates-load")?.addEventListener("click", loadTemplates);
    document.getElementById("admin-logs-load")?.addEventListener("click", loadLogs);
    document.getElementById("admin-ext-refresh")?.addEventListener("click", () => {
      loadTemplates();
      loadLogs();
      if (currentPlayerIdentifier) loadPlayer(currentPlayerIdentifier);
    });
    document.getElementById("admin-templates-list")?.addEventListener("click", (event) => {
      const use = event.target.closest(".admin-template-use");
      const send = event.target.closest(".admin-template-send");
      if (use) {
        const template = JSON.parse(use.dataset.template || "{}");
        document.getElementById("admin-letter-type").value = template.letter_type || "letter";
        document.getElementById("admin-letter-title").value = template.title || "";
        document.getElementById("admin-letter-body").value = template.body || "";
        document.getElementById("admin-template-name").value = template.name || "";
      }
      if (send) sendTemplate(send.dataset.templateId);
    });

    setTimeout(() => {
      loadTemplates();
      loadLogs();
    }, 900);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
  setTimeout(mount, 1200);
})();
