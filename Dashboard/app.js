const API_URL = 'http://127.0.0.1:8000/api';
const sessionKey = 'flowlist-session-v1';
const session = JSON.parse(localStorage.getItem(sessionKey) || 'null');
const $ = (selector) => document.querySelector(selector);
const dashboard = $('.dashboard');
const overview = dashboard.innerHTML;
const labels = {
  overview: 'Ümumi baxış',
  tasks: 'Tasklar',
  users: 'İstifadəçilər',
  reports: 'Hesabatlar',
};
let dashboardData = null;

function formatDate(date) {
  return new Intl.DateTimeFormat('az-AZ', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(date));
}
function initials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}
function toast(message) {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2200);
}
function taskTable(items) {
  return '<div class="table-wrap"><table><thead><tr><th>Task</th><th>İstifadəçi</th><th>Status</th><th>Tarix</th></tr></thead><tbody>' +
    items.map((task) => {
      const user = task.user || { name: 'Silinmiş istifadəçi' };
      const status = task.completed ? 'Tamamlandı' : 'Aktiv';
      return '<tr><td><div class="task-name"><i></i><span>' + task.title + '</span></div></td><td><div class="user-cell"><b>' + initials(user.name) + '</b><span>' + user.name + '</span></div></td><td><mark class="' + (!task.completed ? 'status-active' : '') + '">' + status + '</mark></td><td class="muted">' + formatDate(task.created_at) + '</td></tr>';
    }).join('') +
    '</tbody></table></div>';
}
function renderStats() {
  if (!dashboardData) return;
  $('#total-users').textContent = dashboardData.total_users;
  $('#total-tasks').textContent = dashboardData.total_tasks;
  $('#completed-tasks').textContent = dashboardData.completed_tasks;
  $('#active-tasks').textContent = dashboardData.active_tasks;
  document.querySelector('.donut strong').textContent = dashboardData.total_tasks;
  document.querySelectorAll('.legend p')[0].querySelector('span').textContent = dashboardData.completed_tasks;
  document.querySelectorAll('.legend p')[1].querySelector('span').textContent = dashboardData.active_tasks;
}
function renderRows() {
  const body = $('#task-rows');
  body.innerHTML = '';
  (dashboardData?.recent_tasks || []).forEach((task) => {
    const row = $('#row-template').content.firstElementChild.cloneNode(true);
    const user = task.user || { name: 'Silinmiş istifadəçi' };
    row.querySelector('.task-name span').textContent = task.title;
    row.querySelector('.user-cell b').textContent = initials(user.name);
    row.querySelector('.user-cell span').textContent = user.name;
    const status = row.querySelector('mark');
    status.textContent = task.completed ? 'Tamamlandı' : 'Aktiv';
    status.classList.toggle('status-active', !task.completed);
    row.querySelector('.muted').textContent = formatDate(task.created_at);
    body.appendChild(row);
  });
}
function renderOverview() {
  dashboard.innerHTML = overview;
  renderStats();
  renderRows();
  $('#view-all').addEventListener('click', () => navigate('tasks'));
  $('#add-user').addEventListener('click', () => toast('İstifadəçi yaratmaq qeydiyyat səhifəsindən edilir.'));
}
function renderTasksPage() {
  const tasks = dashboardData?.recent_tasks || [];
  dashboard.innerHTML = '<section class="welcome"><div><p class="eyebrow">TASK İDARƏETMƏSİ</p><h2>Son tasklar</h2><p>Son əlavə olunan taskların siyahısı.</p></div></section><section class="panel table-panel"><div class="panel-head"><div><h3>Tasklar</h3><p>' + tasks.length + ' task göstərilir</p></div></div>' + taskTable(tasks) + '</section>';
}
function renderUsersPage() {
  const total = dashboardData?.total_users || 0;
  dashboard.innerHTML = '<section class="welcome"><div><p class="eyebrow">İSTİFADƏÇİLƏR</p><h2>İstifadəçi statistikası</h2><p>Platformada ümumilikdə ' + total + ' qeydiyyatdan keçmiş istifadəçi var.</p></div></section><section class="panel"><div class="panel-head"><div><h3>Qeyd</h3><p>İstifadəçilərin tam siyahısı üçün ayrıca admin endpoint-i növbəti mərhələdə əlavə olunacaq.</p></div></div></section>';
}
function renderReportsPage() {
  const data = dashboardData || { total_tasks: 0, completed_tasks: 0, active_tasks: 0, total_users: 0 };
  dashboard.innerHTML = '<section class="welcome"><div><p class="eyebrow">HESABATLAR</p><h2>Task hesabatı</h2><p>Database-dən gələn cari xülasə.</p></div></section><section class="stats"><article class="stat-card"><div class="stat-icon purple">▣</div><div><p>Ümumi task</p><strong>' + data.total_tasks + '</strong></div></article><article class="stat-card"><div class="stat-icon green">✓</div><div><p>Tamamlanan</p><strong>' + data.completed_tasks + '</strong></div></article><article class="stat-card"><div class="stat-icon orange">○</div><div><p>Aktiv</p><strong>' + data.active_tasks + '</strong></div></article><article class="stat-card"><div class="stat-icon blue">♙</div><div><p>İstifadəçi</p><strong>' + data.total_users + '</strong></div></article></section>';
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
async function loadDashboard() {
  if (!session?.token) {
    window.location.href = '/';
    return;
  }
  const response = await fetch(API_URL + '/admin/dashboard', {
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + session.token,
    },
  });
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem(sessionKey);
    window.location.href = '/';
    return;
  }
  if (!response.ok) throw new Error('Dashboard məlumatları yüklənmədi.');
  dashboardData = await response.json();
  navigate(location.hash.slice(1) || 'overview');
}

document.querySelectorAll('.nav-link').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.page)));
$('.brand').addEventListener('click', (event) => { event.preventDefault(); navigate('overview'); });
$('#menu').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
$('#export-button').addEventListener('click', () => toast('Hesabat ixrac üçün hazırlandı.'));
window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
navigate(location.hash.slice(1) || 'overview');
loadDashboard().catch((error) => toast(error.message));
