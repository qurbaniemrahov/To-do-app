const tasks = [
  { title: 'Mobil tətbiq dizaynını tamamla', user: 'Aysel Məmmədova', initials: 'AM', status: 'Tamamlandı', date: '2 sentyabr' },
  { title: 'API sənədlərini yenilə', user: 'Elvin Əliyev', initials: 'EƏ', status: 'Aktiv', date: '2 sentyabr' },
  { title: 'Həftəlik hesabatı hazırla', user: 'Nigar Həsənli', initials: 'NH', status: 'Tamamlandı', date: '1 sentyabr' },
  { title: 'Yeni onboarding mətnləri', user: 'Murad İsmayılov', initials: 'Mİ', status: 'Aktiv', date: '1 sentyabr' },
];
const users = [
  { name: 'Aysel Məmmədova', email: 'aysel@example.com', tasks: 6 },
  { name: 'Elvin Əliyev', email: 'elvin@example.com', tasks: 4 },
  { name: 'Nigar Həsənli', email: 'nigar@example.com', tasks: 5 },
  { name: 'Murad İsmayılov', email: 'murad@example.com', tasks: 3 },
];
const $ = (selector) => document.querySelector(selector);
const dashboard = $('.dashboard');
const overview = dashboard.innerHTML;
const labels = { overview: 'Ümumi baxış', tasks: 'Tasklar', users: 'İstifadəçilər', reports: 'Hesabatlar' };

function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
}
function taskTable(items) {
  return '<div class="table-wrap"><table><thead><tr><th>Task</th><th>İstifadəçi</th><th>Status</th><th>Tarix</th></tr></thead><tbody>' +
    items.map((task) => '<tr><td><div class="task-name"><i></i><span>' + task.title + '</span></div></td><td><div class="user-cell"><b>' + task.initials + '</b><span>' + task.user + '</span></div></td><td><mark class="' + (task.status === 'Aktiv' ? 'status-active' : '') + '">' + task.status + '</mark></td><td class="muted">' + task.date + '</td></tr>').join('') +
    '</tbody></table></div>';
}
function renderOverview() {
  dashboard.innerHTML = overview;
  renderRows();
  $('#view-all').addEventListener('click', () => navigate('tasks'));
  $('#add-user').addEventListener('click', () => navigate('users'));
}
function renderTasksPage() {
  dashboard.innerHTML = '<section class="welcome"><div><p class="eyebrow">TASK İDARƏETMƏSİ</p><h2>Bütün tasklar</h2><p>Platformadakı taskların siyahısı.</p></div></section><section class="panel table-panel"><div class="panel-head"><div><h3>Tasklar</h3><p>' + tasks.length + ' task göstərilir</p></div></div>' + taskTable(tasks) + '</section>';
}
function renderUsersPage() {
  dashboard.innerHTML = '<section class="welcome"><div><p class="eyebrow">İSTİFADƏÇİLƏR</p><h2>İstifadəçi siyahısı</h2><p>Qeydiyyatdan keçmiş istifadəçilər.</p></div><button id="new-user">+ İstifadəçi əlavə et</button></section><section class="panel table-panel"><div class="table-wrap"><table><thead><tr><th>İstifadəçi</th><th>E-poçt</th><th>Task sayı</th></tr></thead><tbody>' +
    users.map((user) => '<tr><td><div class="user-cell"><b>' + user.name.split(' ').map((part) => part[0]).join('') + '</b><span>' + user.name + '</span></div></td><td class="muted">' + user.email + '</td><td>' + user.tasks + '</td></tr>').join('') +
    '</tbody></table></div></section>';
  $('#new-user').addEventListener('click', () => toast('İstifadəçi əlavəetmə formu backend qoşulduqda açılacaq.'));
}
function renderReportsPage() {
  const completed = tasks.filter((task) => task.status === 'Tamamlandı').length;
  dashboard.innerHTML = '<section class="welcome"><div><p class="eyebrow">HESABATLAR</p><h2>Task hesabatı</h2><p>Hazırkı demo məlumatlarının xülasəsi.</p></div></section><section class="stats"><article class="stat-card"><div class="stat-icon purple">▣</div><div><p>Ümumi task</p><strong>' + tasks.length + '</strong></div></article><article class="stat-card"><div class="stat-icon green">✓</div><div><p>Tamamlanan</p><strong>' + completed + '</strong></div></article><article class="stat-card"><div class="stat-icon orange">○</div><div><p>Aktiv</p><strong>' + (tasks.length - completed) + '</strong></div></article><article class="stat-card"><div class="stat-icon blue">♙</div><div><p>İstifadəçi</p><strong>' + users.length + '</strong></div></article></section><section class="panel"><div class="panel-head"><div><h3>Qeyd</h3><p>Backend admin API-si qoşulduqdan sonra bu rəqəmlər database-dən avtomatik gələcək.</p></div></div></section>';
}
function renderRows() {
  const body = $('#task-rows');
  body.innerHTML = '';
  tasks.forEach((task) => {
    const row = $('#row-template').content.firstElementChild.cloneNode(true);
    row.querySelector('.task-name span').textContent = task.title;
    row.querySelector('.user-cell b').textContent = task.initials;
    row.querySelector('.user-cell span').textContent = task.user;
    const status = row.querySelector('mark');
    status.textContent = task.status;
    status.classList.toggle('status-active', task.status === 'Aktiv');
    row.querySelector('.muted').textContent = task.date;
    body.appendChild(row);
  });
}
function navigate(page) {
  const target = labels[page] ? page : 'overview';
  $('#page-title').textContent = labels[target];
  document.querySelectorAll('.nav-link').forEach((button) => button.classList.toggle('active', button.dataset.page === target));
  $('.sidebar').classList.remove('open');
  history.replaceState(null, '', '#' + target);
  if (target === 'overview') renderOverview();
  if (target === 'tasks') renderTasksPage();
  if (target === 'users') renderUsersPage();
  if (target === 'reports') renderReportsPage();
}
document.querySelectorAll('.nav-link').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.page)));
$('.brand').addEventListener('click', (event) => { event.preventDefault(); navigate('overview'); });
$('#menu').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
$('#export-button').addEventListener('click', () => toast('Hesabat ixrac üçün hazırlandı.'));
window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
navigate(location.hash.slice(1) || 'overview');
