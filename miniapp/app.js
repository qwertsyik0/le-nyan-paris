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
const adminLettersMessage = document.getElementById("admin-letters-message");
const adminLettersList = document.getElementById("admin-letters-list");
const adminLetterFilter = document.getElementById("admin-letter-filter");
const refreshAdminLettersButton = document.getElementById("refresh-admin-letters");

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

function setPill(element, text, type = "muted") {
  if (!element) return;
  element.textContent = text;
  element.className = `pill ${type}`.trim();
}

function setFormMessage(text, type = "") {
  formMessage.textContent = text || "";
  formMessage.className = `message ${type}`.trim();
}

function setAdminMessage(text, type = "") {
  adminMessage.textContent = text || "";
  adminMessage.className = `message ${type}`.trim();
}

function setLettersMessage(text, type = "") {
  lettersMessage.textContent = text || "";
  lettersMessage.className = `message ${type}`.trim();
}

function setAdminLettersMessage(text, type = "") {
  adminLettersMessage.textContent = text || "";
  adminLettersMessage.className = `message ${type}`.trim();
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

function characterName(application) {
  if (!application) return "—";
  return `${application.character_first_name || ""} ${application.character_last_name || ""}`.trim() || "—";
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
  if (!application) return;
  for (const element of form.elements) {
    if (!element.name || !(element.name in application)) continue;
    element.value = application[element.name] ?? "";
  }
}

function renderStatus(application) {
  currentApplication = application;
  const label = statusLabel(application?.status);
  const type = statusType(application?.status);

  homeStatus.textContent = label;
  homeRole.textContent = assignedRole(application);
  statusText.textContent = label;
  setPill(formStatus, label, type);

  if (!application) {
    statusDetails.innerHTML = `
      <div><b>анкета</b><span>пока не отправлена</span></div>
      <div><b>действие</b><span>перейдите в раздел «анкета» и заполните форму</span></div>
    `;
    statusComment.textContent = "";
    submitButton.disabled = false;
    return;
  }

  statusDetails.innerHTML = `
    <div><b>персонаж</b><span>${escapeHtml(characterName(application))}</span></div>
    <div><b>раздел</b><span>${escapeHtml(application.affiliation || "—")}</span></div>
    <div><b>желаемая роль</b><span>${escapeHtml(application.role_preference || "—")}</span></div>
    <div><b>назначенная роль</b><span>${escapeHtml(assignedRole(application))}</span></div>
  `;

  const commentParts = [];
  if (application.owner_comment) commentParts.push(application.owner_comment);
  if (application.status === "pending") commentParts.push("анкета уже ушла администрации. дождитесь решения.");
  if (application.status === "accepted") commentParts.push("вы приняты. ссылка на чат была отправлена отдельным сообщением после принятия.");
  if (application.status === "needs_changes") commentParts.push("откройте раздел анкеты, исправьте данные и отправьте заново.");
  if (application.status === "rejected") commentParts.push("анкета отклонена. при необходимости уточните причину у администрации.");
  statusComment.textContent = commentParts.filter(Boolean).join("\n\n");

  submitButton.disabled = application.status === "accepted";
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

function renderLetters(rows = []) {
  homeLettersCount.textContent = String(rows.length);
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
      <span class="pill ${letterStatusType(letter.status)}">${escapeHtml(letterStatusLabel(letter.status))}</span>
      <p>${escapeHtml(letter.body || "").replaceAll("\n", "<br>")}</p>
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
    submitButton.disabled = true;
    return;
  }

  try {
    const data = await api("/api/me", { initData });
    currentUser = data.user;
    isAdmin = Boolean(data.is_admin);
    if (data.links) Object.assign(links, data.links);

    setPill(connectionPill, currentUser?.username ? `@${currentUser.username}` : `ID ${currentUser?.id}`, "ok");
    adminTabButton.classList.toggle("hidden", !isAdmin);
    homeLettersCount.textContent = String(data.unread_letters ?? 0);

    renderStatus(data.application);
    fillForm(data.application);
    loadLetters();
    if (isAdmin) {
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
    homeLettersCount.textContent = String(data.letters?.length ?? 0);
    setLettersMessage(data.letters?.length ? "письма загружены" : "пока писем нет", data.letters?.length ? "ok" : "");
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
      <p><code>/app ${escapeHtml(row.id)}</code></p>
    </div>
  `).join("");
}

function renderAdminLetters(rows = []) {
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
        <span class="pill ${letterStatusType(letter.status)}">${escapeHtml(letterStatusLabel(letter.status))}</span>
      </div>
      <p>${escapeHtml(letter.body || "").replaceAll("\n", "<br>")}</p>
      <label class="inline-field">
        <span>сменить статус</span>
        <select class="admin-letter-status" data-letter-id="${escapeHtml(letter.id)}">
          ${Object.entries(LETTER_STATUS_LABELS).map(([value, label]) => `
            <option value="${escapeHtml(value)}" ${letter.status === value ? "selected" : ""}>${escapeHtml(label)}</option>
          `).join("")}
        </select>
      </label>
      <p><code>/letterstatus ${escapeHtml(letter.id)} ${escapeHtml(letter.status || "new")}</code></p>
    </article>
  `).join("");
}

async function loadAdminOverview() {
  if (!isAdmin || !initData) return;
  setAdminMessage("обновляю...");
  try {
    const data = await api("/api/admin/overview", { initData });
    adminPendingCount.textContent = String(data.pending_count ?? data.pending?.length ?? 0);
    adminAcceptedCount.textContent = String(data.accepted_count ?? data.accepted?.length ?? 0);
    adminLettersCount.textContent = String(data.letters_count ?? data.letters?.length ?? 0);
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
  const status = adminLetterFilter?.value || "all";
  setAdminLettersMessage("обновляю письма...");
  try {
    const data = await api("/api/admin/letters", { initData, status });
    renderAdminLetters(data.letters || []);
    adminLettersCount.textContent = String(data.letters?.length ?? 0);
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

form.addEventListener("submit", async (event) => {
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

loadMe();
