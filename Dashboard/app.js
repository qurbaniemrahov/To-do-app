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

async function apiRequest(path) {
  const response = await fetch(API_URL + path, {
    headers: { Accept: 'application/json', Authorization: 'Bearer ' + session.token },
  });
  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem(sessionKey);
    window.location.href = '/';
    throw new Error('Sessiya bitib.');
  }
  if (!response.ok) throw new Error('Məlumat yüklənmədi.');
  return response;
}

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
  $('#sidebar-total-tasks').textContent = dashboardData.total_tasks;
  $('#sidebar-total-users').textContent = dashboardData.total_users;
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
async function renderTasksPage() {
  const result = await (await apiRequest('/admin/tasks?per_page=100')).json();
  const tasks = result.data || [];
  dashboard.innerHTML = '<section class="welcome"><div><p class="eyebrow">TASK İDARƏETMƏSİ</p><h2>Son tasklar</h2><p>Son əlavə olunan taskların siyahısı.</p></div></section><section class="panel table-panel"><div class="panel-head"><div><h3>Tasklar</h3><p>' + tasks.length + ' task göstərilir</p></div></div>' + taskTable(tasks) + '</section>';
}
async function renderUsersPage() {
  const result = await (await apiRequest('/admin/users?per_page=100')).json();
  const rows = (result.data || []).map((user) => '<tr><td><div class="user-cell"><b>' + initials(user.name) + '</b><span>' + user.name + '</span></div></td><td>' + user.email + '</td><td>' + user.role + '</td><td>' + user.todos_count + '</td><td>' + user.completed_todos_count + '</td></tr>').join('');
  dashboard.innerHTML = '<section class="welcome"><div><p class="eyebrow">İSTİFADƏÇİLƏR</p><h2>İstifadəçi statistikası</h2><p>Platformada ümumilikdə ' + result.total + ' istifadəçi var.</p></div></section><section class="panel table-panel"><div class="table-wrap"><table><thead><tr><th>İstifadəçi</th><th>E-poçt</th><th>Rol</th><th>Task</th><th>Tamamlanan</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>';
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
  if (target === 'tasks') renderTasksPage().catch((error) => toast(error.message));
  if (target === 'users') renderUsersPage().catch((error) => toast(error.message));
  if (target === 'reports') renderReportsPage();
}
async function loadDashboard() {
  if (!session?.token) {
    window.location.href = '/';
    return;
  }
  const response = await apiRequest('/admin/dashboard');
  if (!response.ok) throw new Error('Dashboard məlumatları yüklənmədi.');
  dashboardData = await response.json();
  $('#sidebar-total-tasks').textContent = dashboardData.total_tasks;
  $('#sidebar-total-users').textContent = dashboardData.total_users;
  navigate(location.hash.slice(1) || 'overview');
}

document.querySelectorAll('.nav-link').forEach((button) => button.addEventListener('click', () => navigate(button.dataset.page)));
$('.brand').addEventListener('click', (event) => { event.preventDefault(); navigate('overview'); });
$('#menu').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
$('#export-button').addEventListener('click', async () => {
  try {
    const blob = await (await apiRequest('/admin/reports/export')).blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'flowlist-hesabat.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  } catch (error) {
    toast(error.message);
  }
});
navigate(location.hash.slice(1) || 'overview');
loadDashboard().catch((error) => toast(error.message));
