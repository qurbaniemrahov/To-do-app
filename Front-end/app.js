const $ = (selector) => document.querySelector(selector);
const usersKey = 'flowlist-users-v1';
const sessionKey = 'flowlist-session-v1';
const filters = ['all', 'active', 'completed'];
let mode = 'login';
let filter = 'all';
let session = read(sessionKey, null);

function read(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function users() { return read(usersKey, []); }
function saveUsers(data) { localStorage.setItem(usersKey, JSON.stringify(data)); }
function currentUser() { return users().find((user) => user.id === session?.id); }
function formatDate(date) { return new Intl.DateTimeFormat('az-AZ', { day: 'numeric', month: 'short' }).format(new Date(date)); }
function showToast(text) {
  const toast = $('#toast');
  toast.textContent = text;
  toast.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => toast.classList.remove('show'), 2200);
}
function showAuth() {
  $('#auth-view').classList.remove('hidden');
  $('#app-view').classList.add('hidden');
  $('#email').focus();
}
function showApp() {
  const user = currentUser();
  if (!user) return logout();
  $('#auth-view').classList.add('hidden');
  $('#app-view').classList.remove('hidden');
  $('#user-name').textContent = user.name;
  $('#user-email').textContent = user.email;
  $('#avatar').textContent = user.name.charAt(0).toUpperCase();
  applyHashFilter();
  renderTasks();
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
  (register ? $('#name') : $('#email')).focus();
}
function updateUser(transform) {
  const data = users();
  const index = data.findIndex((user) => user.id === session?.id);
  if (index < 0) return logout();
  transform(data[index]);
  saveUsers(data);
}
function setFilter(nextFilter, updateHash = true) {
  filter = filters.includes(nextFilter) ? nextFilter : 'all';
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.filter === filter));
  if (updateHash && location.hash !== '#' + filter) history.replaceState(null, '', '#' + filter);
  document.querySelector('.sidebar').classList.remove('open');
  renderTasks();
}
function applyHashFilter() {
  const nextFilter = location.hash.slice(1);
  filter = filters.includes(nextFilter) ? nextFilter : 'all';
  if (!filters.includes(nextFilter)) history.replaceState(null, '', '#all');
  document.querySelectorAll('.nav-item').forEach((button) => button.classList.toggle('active', button.dataset.filter === filter));
}
function renderTasks() {
  const user = currentUser();
  if (!user || $('#app-view').classList.contains('hidden')) return;
  const tasks = user.tasks || [];
  const visible = filter === 'all' ? tasks : tasks.filter((task) => filter === 'completed' ? task.completed : !task.completed);
  const titles = { all: 'Bütün tasklar', active: 'Aktiv tasklar', completed: 'Tamamlanan tasklar' };
  $('#page-title').textContent = titles[filter];
  $('#list-title').textContent = titles[filter];
  $('#count-all').textContent = tasks.length;
  $('#count-active').textContent = tasks.filter((task) => !task.completed).length;
  $('#count-completed').textContent = tasks.filter((task) => task.completed).length;
  $('#task-summary').textContent = visible.length + ' task';
  const complete = tasks.length ? Math.round(tasks.filter((task) => task.completed).length / tasks.length * 100) : 0;
  $('#progress-ring').textContent = complete + '%';
  $('#progress-ring').style.setProperty('--progress', complete + '%');
  const list = $('#task-list');
  list.replaceChildren();
  $('#empty-state').classList.toggle('hidden', visible.length !== 0);
  visible.forEach((task) => {
    const node = $('#task-template').content.firstElementChild.cloneNode(true);
    node.dataset.id = task.id;
    node.classList.toggle('completed', task.completed);
    node.querySelector('.task-text p').textContent = task.text;
    node.querySelector('.task-text small').textContent = 'Əlavə edildi: ' + formatDate(task.createdAt);
    const check = node.querySelector('.check-button');
    check.setAttribute('aria-label', task.completed ? 'Taskı aktiv et' : 'Taskı tamamla');
    check.addEventListener('click', () => {
      updateUser((activeUser) => { activeUser.tasks.find((item) => item.id === task.id).completed = !task.completed; });
      renderTasks();
      showToast(task.completed ? 'Task aktiv edildi.' : 'Task tamamlandı.');
    });
    node.querySelector('.edit-button').addEventListener('click', () => editTask(task));
    node.querySelector('.delete-button').addEventListener('click', () => {
      if (!confirm('“' + task.text + '” silinsin?')) return;
      updateUser((activeUser) => { activeUser.tasks = activeUser.tasks.filter((item) => item.id !== task.id); });
      renderTasks();
      showToast('Task silindi.');
    });
    list.appendChild(node);
  });
}
function editTask(task) {
  const next = prompt('Task mətnini redaktə et:', task.text);
  if (next === null) return;
  const text = next.trim();
  if (!text) return showToast('Task mətni boş ola bilməz.');
  updateUser((user) => { user.tasks.find((item) => item.id === task.id).text = text; });
  renderTasks();
  showToast('Task yeniləndi.');
}
function logout() {
  localStorage.removeItem(sessionKey);
  session = null;
  setMode('login');
  showAuth();
}

$('#switch-auth').addEventListener('click', () => setMode(mode === 'login' ? 'register' : 'login'));
$('#toggle-password').addEventListener('click', () => {
  const password = $('#password');
  password.type = password.type === 'password' ? 'text' : 'password';
});
$('#auth-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = $('#email').value.trim().toLowerCase();
  const password = $('#password').value;
  const name = $('#name').value.trim();
  const message = $('#auth-message');
  if (!email || password.length < 4 || (mode === 'register' && !name)) {
    message.textContent = 'Zəhmət olmasa bütün sahələri düzgün doldurun.';
    return;
  }
  const data = users();
  const found = data.find((user) => user.email === email);
  if (mode === 'register') {
    if (found) { message.textContent = 'Bu e-poçtla artıq hesab var.'; return; }
    const user = { id: crypto.randomUUID(), name, email, password, tasks: [] };
    data.push(user); saveUsers(data);
    session = { id: user.id }; localStorage.setItem(sessionKey, JSON.stringify(session));
    showApp(); showToast('Hesabın uğurla yaradıldı!');
  } else {
    if (!found || found.password !== password) { message.textContent = 'E-poçt və ya şifrə yanlışdır.'; return; }
    session = { id: found.id }; localStorage.setItem(sessionKey, JSON.stringify(session));
    showApp();
  }
});
$('#add-task-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const input = $('#new-task');
  const text = input.value.trim();
  if (!text) return;
  updateUser((user) => user.tasks.unshift({ id: crypto.randomUUID(), text, completed: false, createdAt: new Date().toISOString() }));
  input.value = ''; renderTasks(); input.focus(); showToast('Yeni task əlavə edildi.');
});
document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.filter)));
document.querySelectorAll('.brand').forEach((brand) => brand.addEventListener('click', (event) => { event.preventDefault(); setFilter('all'); }));
$('#logout').addEventListener('click', logout);
$('#menu-button').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
window.addEventListener('hashchange', () => { applyHashFilter(); renderTasks(); });
$('#today-label').textContent = new Intl.DateTimeFormat('az-AZ', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
session && currentUser() ? showApp() : showAuth();
