const $ = (s) => document.querySelector(s);
const dbKey = 'flowlist-users-v1';
const sessionKey = 'flowlist-session-v1';
let mode = 'login';
let filter = 'all';
let session = JSON.parse(localStorage.getItem(sessionKey) || 'null');

function users() { return JSON.parse(localStorage.getItem(dbKey) || '[]'); }
function saveUsers(data) { localStorage.setItem(dbKey, JSON.stringify(data)); }
function currentUser() { return users().find((u) => u.id === session?.id); }
function escapeHTML(value) { const div = document.createElement('div'); div.textContent = value; return div.innerHTML; }
function formatDate(date) { return new Intl.DateTimeFormat('az-AZ', { day: 'numeric', month: 'short' }).format(new Date(date)); }
function showToast(text) { const t = $('#toast'); t.textContent = text; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); }

function showAuth() { $('#auth-view').classList.remove('hidden'); $('#app-view').classList.add('hidden'); }
function showApp() {
  const user = currentUser();
  if (!user) return logout();
  $('#auth-view').classList.add('hidden'); $('#app-view').classList.remove('hidden');
  $('#user-name').textContent = user.name; $('#user-email').textContent = user.email; $('#avatar').textContent = user.name[0].toUpperCase();
  renderTasks();
}
function setMode(next) {
  mode = next; const register = mode === 'register';
  $('#name-field').classList.toggle('hidden', !register); $('#auth-title').textContent = register ? 'Yeni hesab yarat' : 'Hesabına daxil ol';
  $('#auth-subtitle').textContent = register ? 'Task-larını planlamağa indi başla.' : 'Task-larını görmək üçün giriş et.';
  $('#auth-submit').innerHTML = register ? 'Hesab yarat <span>→</span>' : 'Daxil ol <span>→</span>';
  $('#switch-copy').textContent = register ? 'Artıq hesabın var?' : 'Hesabın yoxdur?'; $('#switch-auth').textContent = register ? 'Daxil ol' : 'Qeydiyyatdan keç'; $('#auth-message').textContent = '';
}
$('#switch-auth').addEventListener('click', () => setMode(mode === 'login' ? 'register' : 'login'));
$('#toggle-password').addEventListener('click', () => { const input = $('#password'); input.type = input.type === 'password' ? 'text' : 'password'; });
$('#auth-form').addEventListener('submit', (e) => {
  e.preventDefault(); const email = $('#email').value.trim().toLowerCase(); const password = $('#password').value; const name = $('#name').value.trim(); const message = $('#auth-message');
  if (!email || password.length < 4 || (mode === 'register' && !name)) { message.textContent = 'Zəhmət olmasa bütün sahələri düzgün doldurun.'; return; }
  const data = users(); const found = data.find((u) => u.email === email);
  if (mode === 'register') { if (found) { message.textContent = 'Bu e-poçtla artıq hesab var.'; return; } const user = { id: crypto.randomUUID(), name, email, password, tasks: [] }; data.push(user); saveUsers(data); session = { id: user.id }; localStorage.setItem(sessionKey, JSON.stringify(session)); showApp(); showToast('Hesabın uğurla yaradıldı!'); }
  else { if (!found || found.password !== password) { message.textContent = 'E-poçt və ya şifrə yanlışdır.'; return; } session = { id: found.id }; localStorage.setItem(sessionKey, JSON.stringify(session)); showApp(); }
});
function updateUser(transform) { const data = users(); const index = data.findIndex((u) => u.id === session.id); if (index < 0) return; transform(data[index]); saveUsers(data); }
function renderTasks() {
  const user = currentUser(); if (!user) return; const tasks = user.tasks || []; const visible = filter === 'all' ? tasks : tasks.filter((t) => filter === 'completed' ? t.completed : !t.completed);
  const titles = { all: 'Bütün tasklar', active: 'Aktiv tasklar', completed: 'Tamamlanan tasklar' }; $('#page-title').textContent = titles[filter]; $('#list-title').textContent = titles[filter];
  $('#count-all').textContent = tasks.length; $('#count-active').textContent = tasks.filter((t) => !t.completed).length; $('#count-completed').textContent = tasks.filter((t) => t.completed).length;
  $('#task-summary').textContent = `${visible.length} task`; const percent = tasks.length ? Math.round(tasks.filter((t) => t.completed).length / tasks.length * 100) : 0; $('#progress-ring').textContent = `${percent}%`; $('#progress-ring').style.setProperty('--progress', `${percent}%`);
  const list = $('#task-list'); list.innerHTML = ''; $('#empty-state').classList.toggle('hidden', visible.length !== 0);
  visible.forEach((task) => { const node = $('#task-template').content.firstElementChild.cloneNode(true); node.dataset.id = task.id; node.classList.toggle('completed', task.completed); node.querySelector('.task-text p').textContent = task.text; node.querySelector('.task-text small').textContent = `Əlavə edildi: ${formatDate(task.createdAt)}`; node.querySelector('.check-button').addEventListener('click', () => { updateUser((u) => { const t = u.tasks.find((x) => x.id === task.id); t.completed = !t.completed; }); renderTasks(); }); node.querySelector('.edit-button').addEventListener('click', () => editTask(task)); node.querySelector('.delete-button').addEventListener('click', () => { updateUser((u) => { u.tasks = u.tasks.filter((x) => x.id !== task.id); }); renderTasks(); showToast('Task silindi.'); }); list.appendChild(node); });
}
function editTask(task) { const next = prompt('Task mətnini redaktə et:', task.text); if (next === null) return; const text = next.trim(); if (!text) return showToast('Task mətni boş ola bilməz.'); updateUser((u) => { u.tasks.find((x) => x.id === task.id).text = text; }); renderTasks(); showToast('Task yeniləndi.'); }
$('#add-task-form').addEventListener('submit', (e) => { e.preventDefault(); const input = $('#new-task'); const text = input.value.trim(); if (!text) return; updateUser((u) => u.tasks.unshift({ id: crypto.randomUUID(), text, completed: false, createdAt: new Date().toISOString() })); input.value = ''; renderTasks(); showToast('Yeni task əlavə edildi.'); });
document.querySelectorAll('.nav-item').forEach((button) => button.addEventListener('click', () => { filter = button.dataset.filter; document.querySelectorAll('.nav-item').forEach((b) => b.classList.toggle('active', b === button)); document.querySelector('.sidebar')?.classList.remove('open'); renderTasks(); }));
$('#logout').addEventListener('click', () => { localStorage.removeItem(sessionKey); session = null; showAuth(); setMode('login'); });
$('#menu-button').addEventListener('click', () => document.querySelector('.sidebar').classList.toggle('open'));
$('#today-label').textContent = new Intl.DateTimeFormat('az-AZ', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
session ? showApp() : showAuth();
