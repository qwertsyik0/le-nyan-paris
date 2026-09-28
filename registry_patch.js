const loshEntry = acceptedRoles.find((item) => item.username === '@lloysh');
if (loshEntry) loshEntry.name = 'Лош Де Анри';

if (!acceptedRoles.some((item) => item.username === '@Communityr34')) {
  acceptedRoles.push({
    username: '@Communityr34',
    name: 'Габриель Агрест',
    role: 'помощник лекаря при больничной мертвецкой',
    group: 'медицина',
    note: 'мертвецкая, помощь лекарям, подготовка тел'
  });
}

renderRoles();
