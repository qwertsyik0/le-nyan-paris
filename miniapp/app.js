const API_BASE = "https://le-nyan-paris-bot.onrender.com";
const tg = window.Telegram?.WebApp;
const initData = tg?.initData || "";

const links = {
  citySheet: "https://qwertsyik0.github.io/le-nyan-paris/",
};

const LETTER_STATUS_LABELS = {
  new: "новое",
  read: "прочитано",
  in_work: "в работе",
  closed: "закрыто",
  hidden: "скрыто",
};

const LETTER_TYPE_LABELS = {
  letter: "письмо",
  summons: "повестка",
  task: "задание",
  rumor: "слух",
  warning: "предупреждение",
};

const LETTER_TYPE_ICONS = {
  letter: "📜",
  summons: "⚖️",
  task: "🕯",
  rumor: "📰",
  warning: "⚠️",
};

let currentUser = null;
let currentApplication = null;
let isAdmin = false;
let lettersLoaded = false;

const form = document.getElementById("application-form");
const submitButton = document.getElementById("submit-button");
const formMessage = document.getElementById("form-message");
const connectionPill = document.getElementById("connection-pill");
const formStatus = document.getElementById("form-status");
const homeStatus = document.getElementById("home-status");
const homeRole = document.getElementById("home-role");
const homeLettersCount = document.getElementById("home-letters-count");
const statusText = document.getElementById("status-text");
const statusDetails = document.getElementById("status-details");
const statusComment = document.getElementById("status-comment");
const lettersMessage = document.getElementById("letters-message");
const lettersList = document.getElementById("letters-list");
const refreshLettersButton = document.getElementById("refresh-letters");
const adminTabButton = document.getElementById("admin-tab-button");
const refreshAdminButton = document.getElementById("refresh-admin");
const adminMessage = document.getElementById("admin-message");
const adminPendingCount = document.getElementById("admin-pending-count");
const adminAcceptedCount = document.getElementById("admin-accepted-count");
const adminLettersCount = document.getElementById("admin-letters-count");
const adminPendingList = document.getElementById("admin-pending-list");
const adminAcceptedList = document.getElementById("admin-accepted-list");
let adminLettersMessage = document.getElementById("admin-letters-message");
let adminLettersList = document.getElementById("admin-letters-list");
let adminLetterFilter = document.getElementById("admin-letter-filter");
let refreshAdminLettersButton = document.getElementById("refresh-admin-letters");
let adminSendLetterForm = null;
let adminSendLetterMessage = null;
let adminPlayerQuery = null;
let adminPlayerLoadButton = null;
let adminPlayerCard = null;


tg?.ready();
tg?.expand();

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function injectAdminStyles() {
  if (document.getElementById("admin-extra-style")) return;
  const style = document.createElement("style");
  style.id = "admin-extra-style";
  style.textContent = `
    .admin-actions-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
    .admin-form { display: grid; gap: 12px; }
    .admin-form .grid { margin-top: 0; }
    .admin-player-card { display: grid; gap: 12px; }
    .admin-player-head { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
    .admin-player-block { border: 1px solid var(--line); background: rgba(255,255,255,.44); border-radius: 18px; padding: 13px; }
    .admin-player-block h4 { margin: 0 0 8px; font-size: 16px; }
    .mini-details { display: grid; gap: 7px; }
    .mini-details div { display: grid; grid-template-columns: 140px 1fr; gap: 8px; }
    .mini-details b { color: var(--ink); }
    .letter-type-badge { display: inline-flex; align-items: center; gap: 5px; border-radius: 999px; padding: 6px 9px; background: rgba(143,48,38,.1); color: var(--accent-dark); font-weight: 850; font-size: 12px; }
    .admin-letter-item .letter-type-badge, .letter-item .letter-type-badge { margin-right: 6px; }
    .inline-actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 10px; }
    .inline-actions .small { min-width: 0; }
    @media (max-width: 640px) { .mini-details div { grid-template-columns: 1fr; } .admin-player-head { display: grid; } }
  `;
  document.head.appendChild(style);
}

function ensureAdminTools() {
  const adminScreen = document.getElementById("tab-admin");
  if (!adminScreen) return;
  injectAdminStyles();

  if (!document.getElementById("admin-send-letter-card")) {
    adminScreen.insertAdjacentHTML("beforeend", `
      <article id="admin-send-letter-card" class="card">
        <div class="section-head">
          <div>
            <p class="eyebrow">канцелярская почта</p>
            <h3>отправить письмо</h3>
          </div>
        </div>
        <form id="admin-send-letter-form" class="admin-form">
          <div class="grid two">
            <label>
              <span>получатель</span>
              <input name="target" required placeholder="@username или Telegram ID">
            </label>
            <label>
              <span>тип</span>
              <select name="letter_type">
                <option value="letter">📜 письмо</option>
                <option value="summons">⚖️ повестка</option>
                <option value="task">🕯 задание</option>
                <option value="rumor">📰 слух</option>
                <option value="warning">⚠️ предупреждение</option>
              </select>
            </label>
          </div>
          <label>
            <span>заголовок</span>
            <input name="title" maxlength="120" placeholder="например, вызов в суд">
          </label>
          <label>
            <span>текст письма</span>
            <textarea name="body" required maxlength="3500" rows="6" placeholder="текст, который получит игрок"></textarea>
          </label>
          <button class="primary wide" type="submit">отправить письмо</button>
          <div id="admin-send-letter-message" class="message"></div>
        </form>
      </article>
    `);
  }

  if (!document.getElementById("admin-player-card-shell")) {
    adminScreen.insertAdjacentHTML("beforeend", `
      <article id="admin-player-card-shell" class="card">
        <div class="section-head">
          <div>
            <p class="eyebrow">досье участника</p>
            <h3>карточка игрока</h3>
          </div>
        </div>
        <div class="grid two">
          <label>
            <span>игрок</span>
            <input id="admin-player-query" placeholder="@username или Telegram ID">
          </label>
          <div style="display:grid;align-content:end">
            <button id="admin-player-load" class="small" type="button">открыть карточку</button>
          </div>
        </div>
        <div id="admin-player-card" class="admin-player-card"></div>
      </article>
    `);
  }

  adminLettersMessage = document.getElementById("admin-letters-message") || adminLettersMessage;
  adminLettersList = document.getElementById("admin-letters-list") || adminLettersList;
  adminLetterFilter = document.getElementById("admin-letter-filter") || adminLetterFilter;
  refreshAdminLettersButton = document.getElementById("refresh-admin-letters") || refreshAdminLettersButton;
  adminSendLetterForm = document.getElementById("admin-send-letter-form");
  adminSendLetterMessage = document.getElementById("admin-send-letter-message");
  adminPlayerQuery = document.getElementById("admin-player-query");
  adminPlayerLoadButton = document.getElementById("admin-player-load");
  adminPlayerCard = document.getElementById("admin-player-card");

  if (adminSendLetterForm && !adminSendLetterForm.dataset.bound) {
    adminSendLetterForm.dataset.bound = "1";
    adminSendLetterForm.addEventListener("submit", sendAdminLetter);
  }
  if (adminPlayerLoadButton && !adminPlayerLoadButton.dataset.bound) {
    adminPlayerLoadButton.dataset.bound = "1";
    adminPlayerLoadButton.addEventListener("click", () => loadAdminPlayer(adminPlayerQuery?.value));
  }
}

function setPill(element, text, type = "muted") {
  if (!element) return;
  element.textContent = text;
  element.className = `pill ${type}`.trim();
}

function setFormMessage(text, type = "") {
  if (!formMessage) return;
  formMessage.textContent = text || "";
  formMessage.className = `message ${type}`.trim();
}

function setAdminMessage(text, type = "") {
  if (!adminMessage) return;
  adminMessage.textContent = text || "";
  adminMessage.className = `message ${type}`.trim();
}

function setLettersMessage(text, type = "") {
  if (!lettersMessage) return;
  lettersMessage.textContent = text || "";
  lettersMessage.className = `message ${type}`.trim();
}

function setAdminLettersMessage(text, type = "") {
  if (!adminLettersMessage) return;
  adminLettersMessage.textContent = text || "";
  adminLettersMessage.className = `message ${type}`.trim();
}

function setAdminSendLetterMessage(text, type = "") {
  if (!adminSendLetterMessage) return;
  adminSendLetterMessage.textContent = text || "";
  adminSendLetterMessage.className = `message ${type}`.trim();
}

function statusLabel(status) {
  const labels = {
    pending: "на рассмотрении",
    accepted: "принята",
    rejected: "отклонена",
    needs_changes: "нужны правки",
  };
  return labels[status] || status || "нет анкеты";
}

function statusType(status) {
  if (status === "accepted") return "ok";
  if (status === "needs_changes") return "warn";
  if (status === "rejected") return "bad";
  if (status === "pending") return "warn";
  return "muted";
}

function letterStatusLabel(status) {
  return LETTER_STATUS_LABELS[status] || status || "—";
}

function letterStatusType(status) {
  if (status === "new") return "warn";
  if (status === "read") return "ok";
  if (status === "in_work") return "warn";
  if (status === "closed") return "ok";
  if (status === "hidden") return "bad";
  return "muted";
}

function letterTypeLabel(type) {
  return LETTER_TYPE_LABELS[type] || type || "письмо";
}

function letterTypeIcon(type) {
  return LETTER_TYPE_ICONS[type] || "📜";
}

function characterName(application) {
  if (!application) return "—";
  return `${application.character_first_name || ""} ${application.character_last_name || ""}`.trim() || application.character_name || "—";
}

function assignedRole(application) {
  if (!application) return "роль появится после принятия";
  return application.assigned_role || application.owner_comment || application.role_preference || "роль пока не назначена";
}

function openTab(name) {
  document.querySelectorAll(".tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === name);
  });
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.toggle("active", screen.id === `tab-${name}`);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (name === "admin" && isAdmin) {
    ensureAdminTools();
    loadAdminOverview();
    loadAdminLetters();
  }
  if (name === "letters") loadLetters();
}

function openLink(name) {
  const url = links[name];
  if (!url) return;
  tg?.openLink?.(url);
}

function fillForm(application) {
  if (!application || !form) return;
  for (const element of form.elements) {
    if (!element.name || !(element.name in application)) continue;
    element.value = application[element.name] ?? "";
  }
}

function renderStatus(application) {
  currentApplication = application;
  const label = statusLabel(application?.status);
  const type = statusType(application?.status);

  if (homeStatus) homeStatus.textContent = label;
  if (homeRole) homeRole.textContent = assignedRole(application);
  if (statusText) statusText.textContent = label;
  setPill(formStatus, label, type);

  if (!application) {
    if (statusDetails) {
      statusDetails.innerHTML = `
        <div><b>анкета</b><span>пока не отправлена</span></div>
        <div><b>действие</b><span>перейдите в раздел «анкета» и заполните форму</span></div>
      `;
    }
    if (statusComment) statusComment.textContent = "";
    if (submitButton) submitButton.disabled = false;
    return;
  }

  if (statusDetails) {
    statusDetails.innerHTML = `
      <div><b>персонаж</b><span>${escapeHtml(characterName(application))}</span></div>
      <div><b>раздел</b><span>${escapeHtml(application.affiliation || "—")}</span></div>
      <div><b>желаемая роль</b><span>${escapeHtml(application.role_preference || "—")}</span></div>
      <div><b>назначенная роль</b><span>${escapeHtml(assignedRole(application))}</span></div>
    `;
  }

  const commentParts = [];
  if (application.owner_comment) commentParts.push(application.owner_comment);
  if (application.status === "pending") commentParts.push("анкета уже ушла администрации. дождитесь решения.");
  if (application.status === "accepted") commentParts.push("вы приняты. ссылка на чат была отправлена отдельным сообщением после принятия.");
  if (application.status === "needs_changes") commentParts.push("откройте раздел анкеты, исправьте данные и отправьте заново.");
  if (application.status === "rejected") commentParts.push("анкета отклонена. при необходимости уточните причину у администрации.");
  if (statusComment) statusComment.textContent = commentParts.filter(Boolean).join("\n\n");

  if (submitButton) submitButton.disabled = application.status === "accepted";
  if (application.status === "accepted") {
    setFormMessage("анкета уже принята. если нужно что-то изменить, напишите администрации.", "ok");
  }
}

function formatDate(value) {
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

function letterBodyHtml(body) {
  return escapeHtml(body || "").replaceAll("\n", "<br>");
}

function letterBadges(letter) {
  return `
    <span class="letter-type-badge">${escapeHtml(letterTypeIcon(letter.type))} ${escapeHtml(letterTypeLabel(letter.type))}</span>
    <span class="pill ${letterStatusType(letter.status)}">${escapeHtml(letterStatusLabel(letter.status))}</span>
  `;
}

function renderLetters(rows = []) {
  if (homeLettersCount) homeLettersCount.textContent = String(rows.length);
  if (!lettersList) return;
  if (!rows.length) {
    lettersList.className = "letter-list empty";
    lettersList.textContent = "пока писем нет";
    return;
  }

  lettersList.className = "letter-list";
  lettersList.innerHTML = rows.map((letter) => `
    <article class="letter-item">
      <div class="letter-top">
        <b>${escapeHtml(letter.title || "письмо из канцелярии")}</b>
        <span>${escapeHtml(formatDate(letter.created_at))}</span>
      </div>
      <div class="inline-actions">${letterBadges(letter)}</div>
      <p>${letterBodyHtml(letter.body)}</p>
    </article>
  `).join("");
}

async function api(path, payload) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "ошибка запроса");
  }
  return data;
}

async function loadMe() {
  if (!initData) {
    setPill(connectionPill, "не Telegram", "bad");
    setFormMessage("откройте Mini App через Telegram-бота, иначе Telegram не передаст данные входа", "error");
    if (submitButton) submitButton.disabled = true;
    return;
  }

  try {
    const data = await api("/api/me", { initData });
    currentUser = data.user;
    isAdmin = Boolean(data.is_admin);
    if (data.links) Object.assign(links, data.links);

    setPill(connectionPill, currentUser?.username ? `@${currentUser.username}` : `ID ${currentUser?.id}`, "ok");
    adminTabButton?.classList.toggle("hidden", !isAdmin);
    if (homeLettersCount) homeLettersCount.textContent = String(data.unread_letters ?? 0);

    renderStatus(data.application);
    fillForm(data.application);
    loadLetters();
    if (isAdmin) {
      ensureAdminTools();
      loadAdminOverview();
      loadAdminLetters();
    }
  } catch (error) {
    setPill(connectionPill, "ожидаем сервер", "warn");
    setFormMessage("сервер просыпается. подождите несколько секунд и откройте раздел еще раз.", "error");
    setLettersMessage("сервер просыпается. письма загрузятся позже.", "error");
  }
}

async function loadLetters() {
  if (!initData) return;
  setLettersMessage("загружаю письма...");
  try {
    const data = await api("/api/letters", { initData });
    renderLetters(data.letters || []);
    if (homeLettersCount) homeLettersCount.textContent = String(data.letters?.length ?? 0);
    setLettersMessage(data.letters?.length ? "письма загружены, новые отмечены как прочитанные" : "пока писем нет", data.letters?.length ? "ok" : "");
    lettersLoaded = true;
  } catch (error) {
    setLettersMessage("сервер просыпается или временно недоступен", "error");
  }
}

function collectForm() {
  const formData = new FormData(form);
  return Object.fromEntries(formData.entries());
}

function renderAdminList(element, rows, emptyText) {
  if (!element) return;
  if (!rows?.length) {
    element.className = "admin-list empty";
    element.textContent = emptyText;
    return;
  }
  element.className = "admin-list";
  element.innerHTML = rows.map((row) => `
    <div class="admin-item">
      <b>#${escapeHtml(row.id)} — ${escapeHtml(row.character_name || "без имени")}</b>
      <p>игрок: ${escapeHtml(row.username || "без username")}</p>
      <p>роль: ${escapeHtml(row.assigned_role || row.role_preference || "—")}</p>
      <p>раздел: ${escapeHtml(row.affiliation || "—")}</p>
      <div class="admin-actions-row">
        <button type="button" class="small" data-player-card="${escapeHtml(row.telegram_id || row.username || "")}">карточка</button>
        <span><code>/app ${escapeHtml(row.id)}</code></span>
      </div>
    </div>
  `).join("");
}

function renderAdminLetters(rows = []) {
  if (!adminLettersList) return;
  if (!rows?.length) {
    adminLettersList.className = "admin-letter-list empty";
    adminLettersList.textContent = "писем с таким фильтром нет";
    return;
  }

  adminLettersList.className = "admin-letter-list";
  adminLettersList.innerHTML = rows.map((letter) => `
    <article class="admin-letter-item" data-letter-id="${escapeHtml(letter.id)}">
      <div class="letter-top">
        <b>#${escapeHtml(letter.id)} — ${escapeHtml(letter.title || "письмо из канцелярии")}</b>
        <span>${escapeHtml(formatDate(letter.created_at))}</span>
      </div>
      <div class="letter-meta">
        <span>игрок: ${escapeHtml(letter.username || letter.telegram_id || "без username")}</span>
        <span>персонаж: ${escapeHtml(letter.character_name || "—")}</span>
      </div>
      <div class="inline-actions">${letterBadges(letter)}</div>
      <p>${letterBodyHtml(letter.body)}</p>
      <label class="inline-field">
        <span>сменить статус</span>
        <select class="admin-letter-status" data-letter-id="${escapeHtml(letter.id)}">
          ${Object.entries(LETTER_STATUS_LABELS).map(([value, label]) => `
            <option value="${escapeHtml(value)}" ${letter.status === value ? "selected" : ""}>${escapeHtml(label)}</option>
          `).join("")}
        </select>
      </label>
      <div class="admin-actions-row">
        <button type="button" class="small" data-player-card="${escapeHtml(letter.telegram_id || letter.username || "")}">карточка игрока</button>
        <span><code>/letterstatus ${escapeHtml(letter.id)} ${escapeHtml(letter.status || "new")}</code></span>
      </div>
    </article>
  `).join("");
}

async function loadAdminOverview() {
  if (!isAdmin || !initData) return;
  ensureAdminTools();
  setAdminMessage("обновляю...");
  try {
    const data = await api("/api/admin/overview", { initData });
    if (adminPendingCount) adminPendingCount.textContent = String(data.pending_count ?? data.pending?.length ?? 0);
    if (adminAcceptedCount) adminAcceptedCount.textContent = String(data.accepted_count ?? data.accepted?.length ?? 0);
    if (adminLettersCount) adminLettersCount.textContent = String(data.letters_count ?? data.letters?.length ?? 0);
    renderAdminList(adminPendingList, data.pending, "новых анкет нет");
    renderAdminList(adminAcceptedList, data.accepted, "принятых анкет пока нет");
    if (data.letters) renderAdminLetters(data.letters);
    setAdminMessage("данные обновлены", "ok");
  } catch (error) {
    setAdminMessage("сервер просыпается или временно недоступен", "error");
  }
}

async function loadAdminLetters() {
  if (!isAdmin || !initData) return;
  ensureAdminTools();
  const status = adminLetterFilter?.value || "all";
  setAdminLettersMessage("обновляю письма...");
  try {
    const data = await api("/api/admin/letters", { initData, status });
    renderAdminLetters(data.letters || []);
    if (adminLettersCount) adminLettersCount.textContent = String(data.letters?.length ?? 0);
    setAdminLettersMessage(data.letters?.length ? "письма обновлены" : "писем с таким фильтром нет", data.letters?.length ? "ok" : "");
  } catch (error) {
    setAdminLettersMessage("сервер просыпается или временно недоступен", "error");
  }
}

async function changeLetterStatus(letterId, status) {
  if (!isAdmin || !initData || !letterId || !status) return;
  setAdminLettersMessage(`меняю статус письма #${letterId}...`);
  try {
    await api("/api/admin/letters/status", {
      initData,
      letter_id: Number(letterId),
      status,
    });
    setAdminLettersMessage(`статус письма #${letterId} обновлен`, "ok");
    await loadAdminLetters();
  } catch (error) {
    setAdminLettersMessage(error.message || "не удалось изменить статус", "error");
  }
}

async function sendAdminLetter(event) {
  event.preventDefault();
  if (!isAdmin || !initData || !adminSendLetterForm) return;
  const formData = new FormData(adminSendLetterForm);
  const payload = Object.fromEntries(formData.entries());
  setAdminSendLetterMessage("отправляю письмо...");
  try {
    const data = await api("/api/admin/letters/send", {
      initData,
      target: payload.target,
      letter_type: payload.letter_type,
      title: payload.title,
      body: payload.body,
    });
    setAdminSendLetterMessage(data.notify_ok ? "письмо отправлено и сохранено" : "письмо сохранено, но уведомление не доставлено", data.notify_ok ? "ok" : "error");
    adminSendLetterForm.reset();
    await loadAdminLetters();
    if (data.letter?.telegram_id) await loadAdminPlayer(String(data.letter.telegram_id), false);
  } catch (error) {
    setAdminSendLetterMessage(error.message || "не удалось отправить письмо", "error");
  }
}

function renderAdminPlayer(data) {
  if (!adminPlayerCard) return;
  const player = data.player || {};
  const app = data.application;
  const letters = data.letters || [];
  const userTitle = player.username || `ID ${player.telegram_id || "—"}`;
  const appHtml = app ? `
    <div class="mini-details">
      <div><b>персонаж</b><span>${escapeHtml(app.character_name || "—")}</span></div>
      <div><b>статус</b><span>${escapeHtml(statusLabel(app.status))}</span></div>
      <div><b>роль</b><span>${escapeHtml(app.assigned_role || app.role_preference || "—")}</span></div>
      <div><b>раздел</b><span>${escapeHtml(app.affiliation || "—")}</span></div>
      <div><b>возраст</b><span>${escapeHtml(app.character_age || "—")}</span></div>
      <div><b>комментарий</b><span>${escapeHtml(app.owner_comment || app.applicant_comment || "—")}</span></div>
    </div>
  ` : `<p>анкеты нет</p>`;

  const lettersHtml = letters.length ? letters.map((letter) => `
    <article class="admin-letter-item">
      <div class="letter-top">
        <b>#${escapeHtml(letter.id)} — ${escapeHtml(letter.title || "письмо")}</b>
        <span>${escapeHtml(formatDate(letter.created_at))}</span>
      </div>
      <div class="inline-actions">${letterBadges(letter)}</div>
      <p>${letterBodyHtml(letter.body)}</p>
    </article>
  `).join("") : `<p>писем нет</p>`;

  adminPlayerCard.innerHTML = `
    <div class="admin-player-head">
      <div>
        <p class="eyebrow">карточка игрока</p>
        <h3>${escapeHtml(userTitle)}</h3>
      </div>
      <span class="pill ok">${escapeHtml(String(player.telegram_id || "—"))}</span>
    </div>
    <section class="admin-player-block">
      <h4>профиль</h4>
      <div class="mini-details">
        <div><b>username</b><span>${escapeHtml(player.username || "—")}</span></div>
        <div><b>имя Telegram</b><span>${escapeHtml([player.first_name, player.last_name].filter(Boolean).join(" ") || "—")}</span></div>
        <div><b>язык</b><span>${escapeHtml(player.language_code || "—")}</span></div>
      </div>
    </section>
    <section class="admin-player-block">
      <h4>анкета</h4>
      ${appHtml}
    </section>
    <section class="admin-player-block">
      <h4>письма игрока</h4>
      <div class="admin-letter-list">${lettersHtml}</div>
    </section>
  `;
}

async function loadAdminPlayer(identifier, showMessage = true) {
  if (!isAdmin || !initData) return;
  ensureAdminTools();
  const cleanIdentifier = String(identifier || "").trim();
  if (!cleanIdentifier) {
    if (adminPlayerCard) adminPlayerCard.innerHTML = `<p class="message error">укажите @username или Telegram ID</p>`;
    return;
  }
  if (adminPlayerQuery) adminPlayerQuery.value = cleanIdentifier;
  if (showMessage && adminPlayerCard) adminPlayerCard.innerHTML = `<p class="message">загружаю карточку...</p>`;
  try {
    const data = await api("/api/admin/player", { initData, identifier: cleanIdentifier });
    renderAdminPlayer(data);
  } catch (error) {
    if (adminPlayerCard) adminPlayerCard.innerHTML = `<p class="message error">${escapeHtml(error.message || "не удалось открыть карточку")}</p>`;
  }
}

form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!initData) {
    setFormMessage("нет данных Telegram. откройте Mini App через бота", "error");
    return;
  }
  submitButton.disabled = true;
  setFormMessage("отправляем анкету...");
  try {
    const data = await api("/api/applications", {
      initData,
      application: collectForm(),
    });
    renderStatus(data.application);
    setFormMessage("анкета отправлена. администрация получила ее в боте.", "ok");
    tg?.HapticFeedback?.notificationOccurred?.("success");
    openTab("status");
  } catch (error) {
    setFormMessage(error.message, "error");
    tg?.HapticFeedback?.notificationOccurred?.("error");
  } finally {
    if (currentApplication?.status !== "accepted") submitButton.disabled = false;
  }
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => openTab(button.dataset.tab));
});

document.querySelectorAll("[data-open-tab]").forEach((button) => {
  button.addEventListener("click", () => openTab(button.dataset.openTab));
});

document.querySelectorAll("[data-open-link]").forEach((button) => {
  button.addEventListener("click", () => openLink(button.dataset.openLink));
});

refreshAdminButton?.addEventListener("click", () => {
  loadAdminOverview();
  loadAdminLetters();
});

refreshLettersButton?.addEventListener("click", () => {
  lettersLoaded = false;
  loadLetters();
});

refreshAdminLettersButton?.addEventListener("click", loadAdminLetters);
adminLetterFilter?.addEventListener("change", loadAdminLetters);

adminLettersList?.addEventListener("change", (event) => {
  const target = event.target;
  if (!target?.classList?.contains("admin-letter-status")) return;
  changeLetterStatus(target.dataset.letterId, target.value);
});

adminLettersList?.addEventListener("click", (event) => {
  const button = event.target?.closest?.("[data-player-card]");
  if (!button) return;
  loadAdminPlayer(button.dataset.playerCard);
});

adminPendingList?.addEventListener("click", (event) => {
  const button = event.target?.closest?.("[data-player-card]");
  if (!button) return;
  loadAdminPlayer(button.dataset.playerCard);
});

adminAcceptedList?.addEventListener("click", (event) => {
  const button = event.target?.closest?.("[data-player-card]");
  if (!button) return;
  loadAdminPlayer(button.dataset.playerCard);
});

ensureAdminTools();
loadMe();
