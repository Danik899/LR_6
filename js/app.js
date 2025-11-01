// js/app.js
// Генерация DOM, маршрутизация, поиск, лайтбокс — всё в этом файле.
// Предназначено для работы без сервера (подходит для file://).

(function(){
    // ---- стили (инжект) ----
    const CSS = `
:root{--bg:#0f1724;--card:#0b1220;--muted:#9aa6b2;--accent:#b3512f}
html,body{height:100%;margin:0;background:var(--bg);color:#e6eef6;font-family:Inter, system-ui, sans-serif}
#app{max-width:1100px;margin:20px auto;padding:16px}
header{display:flex;align-items:center;gap:12px;padding:12px 16px}
nav a{color:var(--muted);margin-right:10px;text-decoration:none}
.btn{padding:6px 10px;border-radius:8px;border:1px solid rgba(255,255,255,0.04);background:transparent;color:var(--muted);cursor:pointer}
.card{background:#0b1220;padding:12px;border-radius:10px}
.gallery{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.thumb{position:relative;padding-top:60%;border-radius:8px;overflow:hidden;background:#071125}
.thumb img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.muted-small{color:var(--muted);font-size:13px}
h1,h2{margin:8px 0}
`;
    const style = document.createElement('style');
    style.textContent = CSS;
    document.head.appendChild(style);

    // ---- utils ----
    const $ = s => document.querySelector(s);
    const escapeHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

    // ---- validate DATA ----
    if(!window.DATA){
        console.error('DATA not found. Ensure js/data.js is loaded before js/app.js');
        const appFail = document.getElementById('app');
        if(appFail) appFail.innerHTML = '<div style="padding:12px;color:#f88">Ошибка: данные приложения не найдены (js/data.js).</div>';
        return;
    }
    const DATA = window.DATA;

    // ---- app container ----
    const app = document.getElementById('app') || (function(){ const d = document.createElement('div'); d.id='app'; document.body.appendChild(d); return d; })();

    // ---- render header/nav ----
    function renderHeader(){
        if(document.getElementById('spa-header')) return; // уже есть
        const header = document.createElement('header');
        header.id = 'spa-header';
        header.innerHTML = `
      <div style="font-weight:700">Война в Афганистане — SPA</div>
      <nav style="margin-left:18px">
        <a href="#home">Главная</a>
        <a href="#timeline">Хронология</a>
        <a href="#gallery">Галерея</a>
        <a href="#articles">Статьи</a>
      </nav>
      <div style="margin-left:auto">
        <input id="globalSearch" placeholder="Поиск..." />
      </div>
    `;
        document.body.insertBefore(header, app);
    }

    // ---- modal / lightbox ----
    let modalRoot = null;
    let modalOnKey = null;
    function openModal(html){
        closeModal();
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
        modalOnKey = function(e){
            if(e.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', modalOnKey);
    }
    function closeModal(){
        if(!modalRoot) return;
        document.removeEventListener('keydown', modalOnKey);
        document.body.removeChild(modalRoot);
        modalRoot = null;
        modalOnKey = null;
    }

    // ---- renderers ----

    // Detailed main page content about the war in Afghanistan
    function renderHome(){
        app.innerHTML = '';
        const sec = document.createElement('section');

        sec.innerHTML = `
      <h1>Война в Афганистане (1979–1989) — обзор</h1>

      <div class="card" style="margin-top:12px">
        <h2>Краткий обзор</h2>
        <p class="muted-small">Война в Афганистане (часто упоминается как советско-афганский конфликт в 1979–1989 гг.) — вооружённый конфликт, который начался после ввода советских войск в Демократическую Республику Афганистан. Конфликт длился около десяти лет и включал регулярные военные действия, партизанскую войну, международную поддержку различных сторон и серьёзные гуманитарные последствия для представителей гражданского населения.</p>
      </div>

      <div class="card" style="margin-top:12px">
        <h2>Причины и предыстория</h2>
        <ul class="muted-small">
          <li>Политическая нестабильность в Афганистане в 1970-е годы, перевороты и смена власти.</li>
          <li>Идеологическое противостояние и борьба за влияние в регионе в рамках холодной войны.</li>
          <li>Внутреннее сопротивление против проводимых реформ и режима, что привело к росту партизанских движений.</li>
        </ul>
      </div>

      <div class="card" style="margin-top:12px">
        <h2>Ход конфликта — ключевые этапы</h2>
        <ol class="muted-small">
          <li><strong>Ввод войск (1979)</strong> — начало интервенции и развёртывание контингента.</li>
          <li><strong>Партизанская война</strong> — широкомасштабное сопротивление со стороны моджахедов, засадная тактика, секретная поддержка извне.</li>
          <li><strong>Эскалация и международный контекст</strong> — поставки оружия, политическое давление и рост гуманитарных проблем.</li>
          <li><strong>Дипломатия и вывод (1988–1989)</strong> — Женевские соглашения, последовавший вывод войск и окончание официального участия иностранного контингента.</li>
        </ol>
      </div>

      <div class="card" style="margin-top:12px">
        <h2>Последствия и влияние</h2>
        <p class="muted-small">Конфликт привёл к большим человеческим потерям, масштабным перемещениям беженцев и разрушениям инфраструктуры. Последствия отразились как в Афганистане (политические изменения, гражданская война), так и в странах-участницах и международной политике в целом.</p>
      </div>

      <div class="card" style="margin-top:12px">
        <h2>Почему это важно изучать</h2>
        <p class="muted-small">Изучение конфликта помогает понять влияние внешнего вмешательства, роль геополитики, особенности современного партизанского противостояния, а также долгосрочные социально-экономические и гуманитарные последствия войн.</p>
      </div>

      <div class="card" style="margin-top:12px">
        <h2>Где читать дальше</h2>
        <ul class="muted-small">
          <li>Исторические обзоры и научные работы по советско-афганской войне.</li>
          <li>Документы и мемуары участников событий, архивные материалы.</li>
          <li>Аналитика по последствиям конфликта для региона и международных отношений.</li>
        </ul>
      </div>

      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn" data-nav="#timeline">Перейти к хронологии</button>
        <button class="btn" data-nav="#gallery">Открыть галерею</button>
        <button class="btn" data-nav="#articles">Статьи</button>
      </div>
    `;

        app.appendChild(sec);

        // nav buttons
        sec.querySelectorAll('[data-nav]').forEach(b => b.addEventListener('click', e => { location.hash = e.currentTarget.dataset.nav; }));
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
            a.href = img.src;
            const im = document.createElement('img');
            im.src = img.src;
            im.alt = img.title || '';
            a.appendChild(im);
            a.addEventListener('click', function(e){
                e.preventDefault();
                openModal(`<h3>${escapeHtml(img.title || '')}</h3><div style="text-align:center"><img src="${img.src}" alt="${escapeHtml(img.title||'')}" style="max-width:100%;max-height:70vh"></div>`);
            });
            grid.appendChild(a);
        });
        card.appendChild(grid);
        wrapper.appendChild(card);
        app.appendChild(wrapper);
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

    // ---- search ----
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

    // ---- router ----
    const routes = {
        '': renderHome,
        '#home': renderHome,
        '#timeline': renderTimeline,
        '#gallery': renderGallery,
        '#articles': renderArticles
    };
    function router(){
        const hash = location.hash || '#home';
        const handler = routes[hash] || renderHome;
        handler();
    }

    document.addEventListener('DOMContentLoaded', () => {
        try{
            renderHeader();
            initSearch();
            window.addEventListener('hashchange', router);
            router();
        }catch(err){
            console.error('SPA init error:', err);
            app.innerHTML = '<div style="padding:12px;color:#f88">Ошибка загрузки приложения — смотрите консоль.</div>';
        }
    });

    window.__spa = { openModal, closeModal };

})();
