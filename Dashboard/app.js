const tasks = [
  { title: 'Mobil tətbiq dizaynını tamamla', user: 'Aysel Məmmədova', initials: 'AM', status: 'Tamamlandı', date: '2 sentyabr' },
  { title: 'API sənədlərini yenilə', user: 'Elvin Əliyev', initials: 'EƏ', status: 'Aktiv', date: '2 sentyabr' },
  { title: 'Həftəlik hesabatı hazırla', user: 'Nigar Həsənli', initials: 'NH', status: 'Tamamlandı', date: '1 sentyabr' },
  { title: 'Yeni onboarding mətnləri', user: 'Murad İsmayılov', initials: 'Mİ', status: 'Aktiv', date: '1 sentyabr' },
];
const $ = (selector) => document.querySelector(selector);
function renderRows() {
  const body = $('#task-rows'); body.innerHTML = '';
  tasks.forEach((task) => {
    const row = $('#row-template').content.firstElementChild.cloneNode(true);
    row.querySelector('.task-name span').textContent = task.title;
    row.querySelector('.user-cell b').textContent = task.initials;
    row.querySelector('.user-cell span').textContent = task.user;
    const status = row.querySelector('mark'); status.textContent = task.status;
    status.classList.toggle('status-active', task.status === 'Aktiv');
    row.querySelector('.muted').textContent = task.date;
    body.appendChild(row);
  });
}
function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 2200); }
document.querySelectorAll('.nav-link').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.nav-link').forEach((item) => item.classList.toggle('active', item === button));
  const labels = { overview: 'Ümumi baxış', tasks: 'Tasklar', users: 'İstifadəçilər', reports: 'Hesabatlar' };
  $('#page-title').textContent = labels[button.dataset.page]; document.querySelector('.sidebar').classList.remove('open');
  toast(`${labels[button.dataset.page]} bölməsi seçildi.`);
}));
$('#menu').addEventListener('click', () => $('.sidebar').classList.toggle('open'));
$('#export-button').addEventListener('click', () => toast('Hesabat ixrac üçün hazırlandı.'));
$('#add-user').addEventListener('click', () => toast('Yeni istifadəçi əlavə etmə formu açılacaq.'));
$('#view-all').addEventListener('click', () => { document.querySelector('[data-page="tasks"]').click(); });
renderRows();
