const API_URL = 'http://127.0.0.1:8000/api';
const $ = (selector) => document.querySelector(selector);
const sessionKey = 'flowlist-session-v1';
const filters = ['all', 'active', 'completed'];
let mode = 'login';
let filter = 'all';
let tasks = [];
let session = read(sessionKey, null);

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function currentUser() { return session?.user || null; }
function formatDate(date) { return new Intl.DateTimeFormat('az-AZ', { day: 'numeric', month: 'short' }).format(new Date(date)); }
function showToast(text) {
  const toast = $('#toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}
async function request(path, options = {}) {
  const headers = {
    Accept: 'application/json',
    ...options.headers,
  };
  if (session?.token) headers.Authorization = 'Bearer ' + session.token;
  const response = await fetch(API_URL + path, { ...options, headers });
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) throw new Error(data?.message || 'Sorğu yerinə yetirilmədi.');
  return data;
}
function showAuth() {
  $('#auth-view').classList.remove('hidden');
  $('#app-view').classList.add('hidden');
  $('#email').focus();
}
async function showApp() {
  const user = currentUser();
  if (!user) return logout();
  $('#auth-view').classList.add('hidden');
  $('#app-view').classList.remove('hidden');
  $('#user-name').textContent = user.name;
  $('#user-email').textContent = user.email;
  $('#avatar').textContent = user.name.charAt(0).toUpperCase();
  applyHashFilter();
  try {
    tasks = await request('/todos');
    renderTasks();
  } catch (error) {
    logout();
    showToast(error.message);
  }
}
function setMode(nextMode) {
  mode = nextMode;
  const register = mode === 'register';
  $('#name-field').classList.toggle('hidden', !register);
  $('#name').required = register;
  $('#password').autocomplete = register ? 'new-password' : 'current-password';
  $('#auth-title').textContent = register ? 'Yeni hesab yarat' : 'Hesabına daxil ol';
  $('#auth-subtitle').textContent = register ? 'Task-larını planlamağa indi başla.' : 'Task-larını görmək üçün giriş et.';
  $('#auth-submit').innerHTML = register ? 'Hesab yarat <span>→</span>' : 'Daxil ol <span>→</span>';
  $('#switch-copy').textContent = register ? 'Artıq hesabın var?' : 'Hesabın yoxdur?';
  $('#switch-auth').textContent = register ? 'Daxil ol' : 'Qeydiyyatdan keç';
  $('#auth-message').textContent = '';
}
function setFilter(nextFilter, updateHash = true) {
  filter = filters.includes(nextFilter) ? nextFilter : 'all';
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.filter === filter));
  if (updateHash && location.hash !== '#' + filter) history.replaceState(null, '', '#' + filter);
  $('.sidebar').classList.remove('open');
  renderTasks();
}
function applyHashFilter() {
  const nextFilter = location.hash.slice(1);
  filter = filters.includes(nextFilter) ? nextFilter : 'all';
  if (!filters.includes(nextFilter)) history.replaceState(null, '', '#all');
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.filter === filter));
}
function renderTasks() {
  if (!currentUser() || $('#app-view').classList.contains('hidden')) return;
  const visible = filter === 'all' ? tasks : tasks.filter((task) => filter === 'completed' ? task.completed : !task.completed);
  const titles = { all: 'Bütün tasklar', active: 'Aktiv tasklar', completed: 'Tamamlanan tasklar' };
  $('#page-title').textContent = titles[filter];
  $('#list-title').textContent = titles[filter];
  $('#count-all').textContent = tasks.length;
  $('#count-active').textContent = tasks.filter((task) => !task.completed).length;
  $('#count-completed').textContent = tasks.filter((task) => task.completed).length;
  $('#task-summary').textContent = visible.length + ' task';
  const percent = tasks.length ? Math.round(tasks.filter((task) => task.completed).length / tasks.length * 100) : 0;
  $('#progress-ring').textContent = percent + '%';
  $('#progress-ring').style.setProperty('--progress', percent + '%');
  const list = $('#task-list');
  list.replaceChildren();
  $('#empty-state').classList.toggle('hidden', visible.length !== 0);
  visible.forEach((task) => {
    const node = $('#task-template').content.firstElementChild.cloneNode(true);
    node.classList.toggle('completed', task.completed);
    node.querySelector('.task-text p').textContent = task.title;
    node.querySelector('.task-text small').textContent = 'Əlavə edildi: ' + formatDate(task.created_at);
    node.querySelector('.check-button').addEventListener('click', () => updateTask(task, { completed: !task.completed }));
    node.querySelector('.edit-button').addEventListener('click', () => editTask(task));
    node.querySelector('.delete-button').addEventListener('click', () => deleteTask(task));
    list.appendChild(node);
  });
}
async function updateTask(task, changes) {
  try {
    const updated = await request('/todos/' + task.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    tasks = tasks.map((item) => item.id === updated.id ? updated : item);
    renderTasks();
    showToast('Task yeniləndi.');
  } catch (error) { showToast(error.message); }
}
function editTask(task) {
  const title = prompt('Task mətnini redaktə et:', task.title);
  if (title === null || !title.trim()) return;
  updateTask(task, { title: title.trim() });
}
async function deleteTask(task) {
  if (!confirm('“' + task.title + '” silinsin?')) return;
  try {
    await request('/todos/' + task.id, { method: 'DELETE' });
    tasks = tasks.filter((item) => item.id !== task.id);
    renderTasks();
    showToast('Task silindi.');
  } catch (error) { showToast(error.message); }
}
async function logout() {
  const token = session?.token;
  if (token) {
    try { await request('/logout', { method: 'POST' }); } catch {}
  }
  localStorage.removeItem(sessionKey);
  session = null;
  tasks = [];
  setMode('login');
  showAuth();
}

$('#switch-auth').addEventListener('click', () => setMode(mode === 'login' ? 'register' : 'login'));
$('#toggle-password').addEventListener('click', () => {
  const password = $('#password');
  password.type = password.type === 'password' ? 'text' : 'password';
});
$('#auth-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = $('#email').value.trim().toLowerCase();
  const password = $('#password').value;
  const name = $('#name').value.trim();
  const message = $('#auth-message');
  if (!email || password.length < 4 || (mode === 'register' && !name)) {
    message.textContent = 'Zəhmət olmasa bütün sahələri düzgün doldurun.';
    return;
  }
  const register = mode === 'register';
  try {
    const result = await request(register ? '/register' : '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(register ? { name, email, password } : { email, password }),
    });
    session = { user: result.user, token: result.token };
    localStorage.setItem(sessionKey, JSON.stringify(session));
    await showApp();
    showToast(register ? 'Hesabın uğurla yaradıldı!' : 'Xoş gəldin!');
  } catch (error) {
    message.textContent = error.message;
  }
});
$('#add-task-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = $('#new-task');
  const title = input.value.trim();
  if (!title) return;
  try {
    const task = await request('/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, completed: false }),
    });
    tasks.unshift(task);
    input.value = '';
    renderTasks();
    showToast('Yeni task əlavə edildi.');
  } catch (error) { showToast(error.message); }
});
document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.filter)));
document.querySelectorAll('.brand').forEach((brand) => brand.addEventListener('click', (event) => { event.preventDefault(); setFilter('all'); }));
$('#logout').addEventListener('click', logout);
$('#menu-button').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
window.addEventListener('hashchange', () => { applyHashFilter(); renderTasks(); });
$('#today-label').textContent = new Intl.DateTimeFormat('az-AZ', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
session && currentUser() ? showApp() : showAuth();
