// js/app.js
// Вся логика, рендер и стили — в одном файле. Работает без модулей и без сервера.
(function(){
    // --- Стили (инжектим) ---
    const CSS = `
:root{--bg:#0f1724;--card:#0b1220;--muted:#9aa6b2;--accent:#b3512f}
html,body{height:100%;margin:0;background:var(--bg);color:#e6eef6;font-family:Inter, system-ui, sans-serif}
header{padding:12px 16px;display:flex;align-items:center;gap:12px}
nav a{color:var(--muted);margin-right:10px;text-decoration:none}
#app{max-width:1100px;margin:20px auto;padding:0 16px}
.btn{padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:var(--muted);cursor:pointer}
.card{background:var(--card);padding:12px;border-radius:10px}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.thumb{position:relative;padding-top:60%;border-radius:8px;overflow:hidden;background:#071125}
.thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.muted-small{color:var(--muted);font-size:13px}
a{color:inherit}
`;
    const styleEl = document.createElement('style');
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    // --- Утилиты ---
    const $ = sel => document.querySelector(sel);
    const escapeHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // --- Проверка данных ---
    if(!window.DATA){
        console.error('DATA not found. Добавьте js/data.js перед app.js');
        if(window.document && document.getElementById('app')){
            document.getElementById('app').innerHTML = '<div style="padding:12px;color:#f88">Ошибка: данные не найдены. Подключите <code>js/data.js</code>.</div>';
        }
        return;
    }
    const DATA = window.DATA;

    // --- Рендер shell (header + basic nav) ---
    function renderShell(){
        // если header уже есть — не вставляем повторно
        if(!document.getElementById('spa-header')){
            const header = document.createElement('header');
            header.id = 'spa-header';
            header.innerHTML = `
        <div style="font-weight:700">Война в Афганистане — SPA</div>
        <nav style="margin-left:18px">
          <a href="#home">Главная</a>
          <a href="#timeline">Хронология</a>
          <a href="#gallery">Галерея</a>
          <a href="#articles">Статьи</a>
          <a href="#teams">Команды</a>
        </nav>
        <div style="margin-left:auto">
          <input id="globalSearch" placeholder="Поиск...">
        </div>
      `;
            const appEl = document.getElementById('app');
            document.body.insertBefore(header, appEl);
        }
    }

    // --- Modal (lightbox) с клавиатурой ---
    let modalRoot = null;
    let modalImageIndex = -1;
    function openModal(html, opts = {}) {
        closeModal(); // закроем старый, если есть
        modalRoot = document.createElement('div');
        Object.assign(modalRoot.style, {position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(2,6,23,0.7)',zIndex:9999});
        const box = document.createElement('div');
        Object.assign(box.style, {maxWidth:'920px',width:'92%',background:'#081223',padding:'18px',borderRadius:'12px',maxHeight:'90vh',overflow:'auto'});
        box.innerHTML = html;
        const closeWrap = document.createElement('div');
        closeWrap.style.textAlign = 'right';
        closeWrap.style.marginTop = '12px';
        closeWrap.innerHTML = `<button class="btn" data-close>Закрыть</button>`;
        closeWrap.querySelector('[data-close]').addEventListener('click', closeModal);
        box.appendChild(closeWrap);
        modalRoot.appendChild(box);
        modalRoot.addEventListener('click', e => { if(e.target === modalRoot) closeModal(); });
        document.body.appendChild(modalRoot);

        // клавиатура для навигации по картинкам
        function onKey(e){
            if(!modalRoot) return;
            if(e.key === 'Escape') closeModal();
            if(e.key === 'ArrowRight') showNextImage();
            if(e.key === 'ArrowLeft') showPrevImage();
        }
        document.addEventListener('keydown', onKey);
        modalRoot._onKey = onKey;
    }
    function closeModal(){
        if(!modalRoot) return;
        document.removeEventListener('keydown', modalRoot._onKey);
        document.body.removeChild(modalRoot);
        modalRoot = null;
        modalImageIndex = -1;
    }
    function showImageAtIndex(i){
        if(i < 0 || i >= DATA.gallery.length) return;
        modalImageIndex = i;
        const img = DATA.gallery[i];
        openModal(`<h3>${escapeHtml(img.title || '')}</h3><div style="text-align:center"><img src="${img.src}" alt="${escapeHtml(img.title||'')}" style="max-width:100%;max-height:70vh"></div>`);
    }
    function showNextImage(){ if(modalImageIndex < 0) return; showImageAtIndex((modalImageIndex + 1) % DATA.gallery.length); }
    function showPrevImage(){ if(modalImageIndex < 0) return; showImageAtIndex((modalImageIndex - 1 + DATA.gallery.length) % DATA.gallery.length); }

    // --- Рендеры экранов ---
    const app = document.getElementById('app') || (function(){ const d = document.createElement('div'); d.id='app'; document.body.appendChild(d); return d; })();

    function renderHome(){
        app.innerHTML = '';
        const sect = document.createElement('section');
        sect.innerHTML = `
      <h1>Война в Афганистане — краткий путеводитель</h1>
      <p class="muted-small">Интерактивная SPA на чистом JS — хроника, галерея, статьи, команды.</p>
      <div style="display:flex;gap:8px;margin-top:12px">
        <button class="btn" data-nav="#timeline">Хронология</button>
        <button class="btn" data-nav="#gallery">Галерея</button>
      </div>
    `;
        app.appendChild(sect);
        sect.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', e => { location.hash = e.currentTarget.dataset.nav; }));
    }

    function renderTimeline(){
        app.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<h2>Хронология</h2>`;
        const card = document.createElement('div'); card.className = 'card';
        DATA.timeline.slice().sort((a,b)=>a.year-b.year).forEach(ev => {
            const row = document.createElement('div');
            row.style.padding = '10px';
            row.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
            row.innerHTML = `<strong>${escapeHtml(String(ev.year))} — ${escapeHtml(ev.title)}</strong><div class="muted-small">${escapeHtml(ev.detail)}</div>`;
            row.addEventListener('click', ()=> openModal(`<h3>${escapeHtml(ev.title)} — ${ev.year}</h3><p>${escapeHtml(ev.detail)}</p>`));
            card.appendChild(row);
        });
        wrapper.appendChild(card);
        app.appendChild(wrapper);
    }

    function renderGallery(){
        app.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<h2>Галерея</h2>`;
        const card = document.createElement('div'); card.className = 'card';
        const grid = document.createElement('div'); grid.className = 'gallery';

        DATA.gallery.forEach((img, idx) => {
            const a = document.createElement('a');
            a.className = 'thumb';
            a.href = '#';
            a.dataset.idx = String(idx);
            const im = document.createElement('img');
            im.src = img.src;
            im.alt = img.title || '';
            a.appendChild(im);
            a.addEventListener('click', function(e){
                e.preventDefault();
                modalImageIndex = idx;
                openModal(`<h3>${escapeHtml(img.title || '')}</h3><div style="text-align:center"><img src="${img.src}" alt="${escapeHtml(img.title||'')}" style="max-width:100%;max-height:70vh"></div>`);
            });
            grid.appendChild(a);
        });

        card.appendChild(grid);
        wrapper.appendChild(card);
        app.appendChild(wrapper);

        // навигация клавишами тоже поддерживается: при открытом модале можно использовать ← → Esc
        // для удобства — добавим клики по картинке в модале на next/prev если нажать по сторонам (простой UX)
    }

    function renderArticles(){
        app.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<h2>Статьи</h2>`;
        const card = document.createElement('div'); card.className = 'card';
        DATA.articles.forEach(a => {
            const d = document.createElement('div');
            d.style.padding = '10px';
            d.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
            d.innerHTML = `<strong>${escapeHtml(a.title)}</strong><div class="muted-small">${escapeHtml(a.body)}</div><div style="margin-top:6px"><button class="btn" data-id="${a.id}">Открыть</button></div>`;
            d.querySelector('button').addEventListener('click', ()=> openModal(`<h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.body)}</p>`));
            card.appendChild(d);
        });
        wrapper.appendChild(card);
        app.appendChild(wrapper);
    }

    function renderTeams(){
        app.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `<h2>Команды</h2>`;
        const grid = document.createElement('div'); grid.style.display='grid'; grid.style.gap='8px';
        DATA.teams.forEach(t => {
            const tile = document.createElement('div');
            tile.className = 'card';
            tile.innerHTML = `<strong>${escapeHtml(t.name)}</strong><div class="muted-small">Лидер: ${escapeHtml(t.leader)}</div><div style="margin-top:6px">Репо: ${t.repo ? `<a href="${escapeHtml(t.repo)}" target="_blank">${escapeHtml(t.repo)}</a>` : '— не задано —'}</div>`;
            grid.appendChild(tile);
        });
        wrapper.appendChild(grid);
        app.appendChild(wrapper);
    }

    // --- Поиск ---
    function initSearch(){
        const input = document.getElementById('globalSearch');
        if(!input) return;
        input.addEventListener('keydown', e => {
            if(e.key !== 'Enter') return;
            const q = e.target.value.trim().toLowerCase();
            if(!q) return;
            const hits = [];
            DATA.articles.forEach(a => { if(a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q)) hits.push({type:'article', item:a}); });
            DATA.timeline.forEach(t => { if(t.title.toLowerCase().includes(q) || t.detail.toLowerCase().includes(q)) hits.push({type:'timeline', item:t}); });
            if(hits.length === 0) { openModal(`<h3>Ничего не найдено</h3><p>По запросу ${escapeHtml(q)} нет результатов.</p>`); return; }
            const html = hits.map(h => `<div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.03)"><strong>${escapeHtml(h.item.title || h.item.year)}</strong><div class="muted-small">${escapeHtml(h.item.detail || h.item.body || '')}</div></div>`).join('');
            openModal(html);
        });
    }

    // --- Router ---
    const routes = {
        '': renderHome,
        '#home': renderHome,
        '#timeline': renderTimeline,
        '#gallery': renderGallery,
        '#articles': renderArticles,
        '#teams': renderTeams
    };
    function router(){
        const hash = location.hash || '#home';
        const handler = routes[hash] || renderHome;
        handler();
    }

    // --- Инициализация ---
    document.addEventListener('DOMContentLoaded', () => {
        try{
            renderShell();
            initSearch();
            window.addEventListener('hashchange', router);
            router();
        }catch(err){
            console.error('SPA init error:', err);
            app.innerHTML = '<div style="padding:12px;color:#f88">Ошибка загрузки приложения — смотрите консоль.</div>';
        }
    });

    // Экспорт для консоли/дебага (необязательно)
    window.__spa = { openModal, closeModal, showImageAtIndex };

})();
