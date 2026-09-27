const acceptedRoles = [
  { username: '@Qwertsyiks', name: 'Наполеон Бонапарт', role: 'Император', group: 'двор', note: 'власть и указы' },
  { username: '@NnKakoyToGlorpovich', name: 'Жак Дьюмонт', role: 'бармен в салуне «Золотой конь»', group: 'город', note: 'салун, городские разговоры' },
  { username: '@ad_15_03', name: 'Алисия Фрелицкая', role: 'комендант Имперской тюрьмы', group: 'полиция', note: 'тюрьма и порядок' },
  { username: '@CopiaCardinal', name: 'Корцо Вайнберг', role: 'священник', group: 'церковь', note: 'церковь, исповеди, связи' },
  { username: '@Leya_666', name: 'Лея Фимилова', role: 'санитар', group: 'медицина', note: 'лекарская помощь' },
  { username: '@PIXEL_ARE_YOU_OKAY', name: 'Лука Нортвест', role: 'младший жандарм', group: 'полиция', note: 'жандармерия, улицы' },
  { username: '@cladkayavata3_3', name: 'Миа Кане', role: 'первый председатель Императорского суда Парижа', group: 'суд', note: 'судебный порядок, разбирательства' },
  { username: '@SalamSister', name: 'Луиза Дюпон', role: 'почтальон', group: 'город', note: 'письма и доставка' },
  { username: '@ewq1k', name: 'Лона Камия', role: 'помощник главного врача', group: 'медицина', note: 'больница и врачи' },
  { username: '@bib_if', name: 'Леви Франце', role: 'уличный музыкант', group: 'город', note: 'улицы и площади' },
  { username: '@Ceniora_vanil', name: 'Айрис Вест', role: 'мелкий информатор', group: 'подполье', note: 'слухи, мелкие сведения' },
  { username: '@rosws', name: 'Реми Де Голль', role: 'уличный воришка', group: 'подполье', note: 'воровство и тайные связи' },
  { username: '@Luka_vo1d', name: 'Лука Каферов', role: 'наемный исполнитель подполья', group: 'подполье', note: 'долги, тайные поручения, подпольные связи' },
  { username: '@sofiyusheva', name: 'Долорес Салье', role: 'почтальон дворца', group: 'двор', note: 'дворцовые письма' },
  { username: '@floriannq', name: 'Жак Джонаш', role: 'барабанщик роты', group: 'армия', note: 'гарнизон и армия' },
  { username: '@Ilovekapebebra', name: 'Жан Дюпон', role: 'посыльный суда', group: 'суд', note: 'поручения суда' },
  { username: '@lloysh', name: 'Лошш Де Анри', role: 'газетный переписчик', group: 'пресса', note: 'заметки без камер' },
  { username: '@Lelelewonk', name: 'Риввира Лакировна', role: 'помощница газетного издателя', group: 'пресса', note: 'газета и редакция' },
  { username: '@tvorog_t', name: 'Аврора Дайан', role: 'придворная музыкантка', group: 'двор', note: 'театр, музыка, двор' },
  { username: '@k4r11_xD', name: 'Лина Дюран', role: 'художница-миниатюристка', group: 'город', note: 'портреты для медальонов' },
  { username: '@LimeksVins', name: 'Влад Святой', role: 'приходской священник', group: 'церковь', note: 'принят с правом уточнения фамилии' },
  { username: '@catminl1', name: 'Элис Шнайдер', role: 'мелкая воровка', group: 'подполье', note: 'стартовая роль в городском подполье' },
  { username: '@l1messs7', name: 'Павел Ломоносов', role: 'рядовой солдат гарнизона', group: 'армия', note: 'гарнизонная служба' },
  { username: '@Inf2cted', name: 'Дерек Шварц', role: 'рыбак-торговец', group: 'рынок', note: 'рыба, рынок, городская торговля' },
  { username: '@Mimilset', name: 'Сана Шнайдер', role: 'помощница при городской канцелярии', group: 'суд', note: 'бумаги, прошения, поручения канцелярии' },
  { username: '@zumiexx', name: 'Лолита Францевна', role: 'посыльная при больнице', group: 'медицина', note: 'записки, поручения, помощь лекарям' },
  { username: '@Loli_rose3', name: 'Клара Синк', role: 'поставщица при городском рынке', group: 'рынок', note: 'снабжение, торговля, городские закупки' },
  { username: '@Mommytil', name: 'Кирианинна Француа', role: 'помощница при судебной канцелярии', group: 'суд', note: 'прошения, повестки, протоколы' }
];

const decrees = [
  {
    date: '27 сентября 1808',
    title: 'О ночном порядке',
    text: 'После наступления ночи жандармерия имеет право остановить человека на улице и спросить имя, занятие и причину выхода.'
  },
  {
    date: '27 сентября 1808',
    title: 'О чистоте городских улиц',
    text: 'Бросать окурки и мусор на улицах запрещено. Нарушителя могут задержать и передать городскому надзору.'
  },
  {
    date: '27 сентября 1808',
    title: 'О дворцовом приеме',
    text: 'Дворец принимает посетителей только по делу, с понятной причиной и уважением к порядку.'
  },
  {
    date: '27 сентября 1808',
    title: 'О назначении Мии Кане',
    text: 'Мия Кане, ранее состоявшая при суде судебным писарем, возвышается до звания первого председателя Императорского суда Парижа. Ей поручается надзор за судебным порядком, разбирательствами и работой судебной канцелярии.'
  }
];

const newsItems = [
  {
    date: '27 сентября 1808',
    type: 'указ',
    title: 'Ночной порядок вступил в силу',
    text: 'На улицах стало больше проверок. Без причины лучше не ходить по городу после темноты.'
  },
  {
    date: '27 сентября 1808',
    type: 'слух',
    title: 'Младшего жандарма вывели из дворца',
    text: 'В городе обсуждают резкий прием во дворце и поведение представителя полиции.'
  },
  {
    date: '27 сентября 1808',
    type: 'газета',
    title: 'Редакция собирает городские заметки',
    text: 'Газетчики ищут сведения о суде, рынке, салонах и новых лицах в Париже.'
  },
  {
    date: '27 сентября 1808',
    type: 'газета',
    title: 'Париж фонтанирует слухами',
    text: 'Автор статьи: Риввира Лакировна. Mon Dieu, Париж сегодня просто фонтанирует слухами. Говорят, прием во дворце был не просто приемом. Одни шепчут, что император искал полезных людей. Другие уверяют, что проверял верность. Третьи говорят тише: кого-то ждет повышение, кого-то поручение, а кого-то подозрение. В издательство поступили сведения от анонимных источников. Первое: будто младшего жандарма выгнали из кабинета императора за дерзость. Курение у дворца, толкотня среди гостей, брошенные окурки. Oh la la, смельчак. После указа о чистоте города вопрос становится особенно любопытным. Второе: будто мелкий информатор слишком часто держится возле жандармерии. И шепчут, что она — вражеский разведчик. Стоит ли доверять этой информации? Где дым — там либо пожар, либо чей-то заказ.'
  },
  {
    date: '27 сентября 1808',
    type: 'слух',
    title: 'Шепот о ночной встрече',
    text: 'По Парижу пошел слух, что этой ночью в одном из салунов видели странную встречу: двое мужчин говорили слишком тихо, прятали какие-то бумаги и упоминали министерство полиции, Фуше и крамольные листки. Говорят, один был похож на газетного переписчика, а второй быстро ушел под дождем. Правда это или обычная пьяная болтовня, пока неизвестно.'
  },
  {
    date: '27 сентября 1808',
    type: 'дело',
    title: 'Суд требует доказательств',
    text: 'Слухи не считаются приговором. Для решения нужны свидетели, протоколы и осмотр места.'
  },
  {
    date: '27 сентября 1808',
    type: 'дело',
    title: 'Луке Нортвесту объявлен выговор',
    text: 'Суд частично принял обжалование: новый указ о порядке при дворце не применяется к событиям 26 сентября. При этом толкание дам, курение и брошенные окурки признаны нарушением служебной дисциплины и дворцового порядка. Дело передано как дисциплинарное, младшему жандарму объявлен выговор.'
  },
  {
    date: '27 сентября 1808',
    type: 'указ',
    title: 'Мия Кане назначена первым председателем суда',
    text: 'По императорскому распоряжению Мия Кане возвышена из судебных писарей до первого председателя Императорского суда Парижа. Суд, жандармерия, городская стража и канцелярия обязаны признавать ее новый чин.'
  },
  {
    date: '27 сентября 1808',
    type: 'объявление',
    title: 'Открыт набор на префекта полиции Парижа',
    text: 'По распоряжению императора Наполеона в Париже открывается назначение на должность префекта полиции Парижа. Желающие могут явиться в императорский дворец для личного собеседования с императором.'
  },
  {
    date: '27 сентября 1808',
    type: 'дело',
    title: 'Происшествие в мокром переулке',
    text: 'После ливня на одной из ближайших улиц раздался громкий выстрел. Звук могли услышать у кафе, лавок, под навесами и на соседних улицах. В переулке нашли молодую горожанку с тяжелым ранением. Человек в темной одежде скрылся в боковой улице. Свидетели могли заметить только фигуру, быстрый шаг и направление побега.'
  }
];

const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.1 }
);

for (const item of revealItems) {
  observer.observe(item);
}

const links = document.querySelectorAll('a[href^="#"]');
for (const link of links) {
  link.addEventListener('click', (event) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function renderDecrees() {
  const list = document.querySelector('#decree-list');
  if (!list) return;

  list.innerHTML = decrees.map((item) => `
    <article class="doc-item">
      <header><span>${item.date}</span><span>канцелярия</span></header>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join('');
}

function renderRoles() {
  const tbody = document.querySelector('#role-table-body');
  const count = document.querySelector('#role-count');
  const searchInput = document.querySelector('#role-search');
  const filterInput = document.querySelector('#role-filter');
  if (!tbody || !count || !searchInput || !filterInput) return;

  const search = searchInput.value.trim().toLowerCase();
  const filter = filterInput.value;

  const filtered = acceptedRoles.filter((item) => {
    const text = `${item.username} ${item.name} ${item.role} ${item.group} ${item.note}`.toLowerCase();
    const matchesSearch = !search || text.includes(search);
    const matchesFilter = filter === 'all' || item.group === filter;
    return matchesSearch && matchesFilter;
  });

  count.textContent = `записей: ${filtered.length}`;
  tbody.innerHTML = filtered.map((item) => `
    <tr>
      <td><span class="user-tag">${item.username}</span></td>
      <td>${item.name}</td>
      <td>${item.role}</td>
      <td>${item.group}</td>
      <td>${item.note}</td>
    </tr>
  `).join('');
}

function renderNews(type = 'all') {
  const list = document.querySelector('#news-list');
  if (!list) return;

  const filtered = type === 'all' ? newsItems : newsItems.filter((item) => item.type === type);

  list.innerHTML = filtered.map((item) => `
    <article class="news-item">
      <header><span>${item.date}</span><span class="news-meta">${item.type}</span></header>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </article>
  `).join('');
}

const roleSearch = document.querySelector('#role-search');
const roleFilter = document.querySelector('#role-filter');
if (roleSearch) roleSearch.addEventListener('input', renderRoles);
if (roleFilter) roleFilter.addEventListener('change', renderRoles);

const newsButtons = document.querySelectorAll('[data-news-filter]');
for (const button of newsButtons) {
  button.addEventListener('click', () => {
    for (const current of newsButtons) current.classList.remove('is-active');
    button.classList.add('is-active');
    renderNews(button.dataset.newsFilter || 'all');
  });
}

renderDecrees();
renderRoles();
renderNews();