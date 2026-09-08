<!doctype html>
<html lang="az">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Flowlist — Tasklarını idarə et</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="{{ asset('style.css') }}" />
    <link rel="stylesheet" href="{{ asset('overrides.css') }}" />
  </head>
  <body>
    <main>
      <section class="auth-view" id="auth-view">
        <div class="hero-panel">
          <a class="brand" href="#"><span class="brand-mark">✓</span> Flowlist</a>
          <div class="hero-copy">
            <p class="eyebrow">SADƏ • FOKUSLU • SƏNİN</p>
            <h1>Günün planı<br />nəzarətində.</h1>
            <p>Tapşırıqlarını bir yerdə topla, irəliləyişini izlə və diqqətini vacib işlərə yönəlt.</p>
          </div>
          <div class="hero-card">
            <span class="mini-check">✓</span>
            <div><strong>Bu gün 3 işi bitirdin</strong><small>Əla davam edirsən!</small></div>
            <span class="sparkles">✦</span>
          </div>
        </div>

        <div class="auth-panel">
          <div class="auth-box">
            <div class="mobile-brand brand"><span class="brand-mark">✓</span> Flowlist</div>
            <div class="auth-heading">
              <p class="eyebrow">XOŞ GƏLMİSƏN</p>
              <h2 id="auth-title">Hesabına daxil ol</h2>
              <p id="auth-subtitle">Task-larını görmək üçün giriş et.</p>
            </div>
            <form id="auth-form" novalidate>
              <label id="name-field" class="field hidden">Adın
                <input id="name" type="text" placeholder="Məsələn, Ad" autocomplete="name" />
              </label>
              <label class="field">E-poçt ünvanı
                <input id="email" type="email" placeholder="name@example.com" autocomplete="email" required />
              </label>
              <label class="field">Şifrə
                <span class="password-wrap"><input id="password" type="password" placeholder="Ən az 4 simvol" autocomplete="current-password" required /><button id="toggle-password" type="button" aria-label="Şifrəni göstər">⌁</button></span>
              </label>
              <p class="form-message" id="auth-message" role="alert"></p>
              <button class="primary-button" id="auth-submit" type="submit">Daxil ol <span>→</span></button>
            </form>
            <p class="switch-auth"><span id="switch-copy">Hesabın yoxdur?</span> <button id="switch-auth" type="button">Qeydiyyatdan keç</button></p>
            <p class="demo-note">Yoxlamaq üçün yeni hesab yarada bilərsiniz.</p>
          </div>
        </div>
      </section>

      <section class="app-view hidden" id="app-view">
        <aside class="sidebar">
          <a class="brand" href="#"><span class="brand-mark">✓</span> Flowlist</a>
          <nav class="filters" aria-label="Tapşırıq filtrləri">
            <button class="nav-item active" data-filter="all"><span>▦</span> Bütün tasklar <b id="count-all">0</b></button>
            <button class="nav-item" data-filter="active"><span>○</span> Aktiv <b id="count-active">0</b></button>
            <button class="nav-item" data-filter="completed"><span>✓</span> Tamamlanan <b id="count-completed">0</b></button>
          </nav>
          <div class="sidebar-bottom"><div class="profile"><div class="avatar" id="avatar">A</div><div><strong id="user-name">İstifadəçi</strong><small id="user-email"></small></div></div><button class="logout" id="logout" type="button">Çıxış et <span>↗</span></button></div>
        </aside>

        <section class="dashboard">
          <header class="topbar"><button class="menu-button" id="menu-button" aria-label="Menyu">☰</button><div><p id="today-label" class="date-label"></p><h1 id="page-title">Bütün tasklar</h1></div><div class="progress-badge"><span class="progress-ring" id="progress-ring">0%</span><span>günün<br />irəliləyişi</span></div></header>
          <div class="content">
            <form class="add-task" id="add-task-form">
              <input id="new-task" type="text" maxlength="120" placeholder="Yeni task əlavə et..." aria-label="Yeni task" required />
              <button type="submit" aria-label="Task əlavə et">+</button>
            </form>
            <div class="list-heading"><h2 id="list-title">Bütün tasklar</h2><span id="task-summary">0 task</span></div>
            <div class="task-list" id="task-list"></div>
            <div class="empty-state hidden" id="empty-state"><div>☼</div><h3>Burada hələ task yoxdur</h3><p>Yuxarıdakı sahədən ilk taskını əlavə et.</p></div>
          </div>
        </section>
      </section>
    </main>
    <template id="task-template"><article class="task-item"><button class="check-button" type="button" aria-label="Tamamlandı olaraq qeyd et"></button><div class="task-text"><p></p><small></small></div><div class="task-actions"><button class="edit-button" type="button" aria-label="Redaktə et">✎</button><button class="delete-button" type="button" aria-label="Sil">⌫</button></div></article></template>
    <div class="toast" id="toast"></div>
    <script src="{{ asset('app.js') }}"></script>
  </body>
</html>
