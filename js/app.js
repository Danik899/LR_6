import { DATA } from './data.js'


// ---- Простая утилита ----
const $ = sel => document.querySelector(sel)
const escapeHtml = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')


// ---- Рендереры ----
const app = $('#app')


function renderHome(){
    app.innerHTML = `
<section>
<h1>Война в Афганистане — краткий путеводитель</h1>
<p>Интерактивная SPA на чистом JS — хроника, галерея, статьи, команды.</p>
<div style="display:flex;gap:8px;margin-top:12px">
<button class="btn" data-nav="#timeline">Хронология</button>
<button class="btn" data-nav="#gallery">Галерея</button>
</div>
</section>
`
    app.querySelectorAll('[data-nav]').forEach(b=>b.addEventListener('click', e=> location.hash = e.currentTarget.dataset.nav))
}


function renderTimeline(){
    const items = DATA.timeline.sort((a,b)=>a.year-b.year).map(ev=>`
<div style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.03);">
<strong>${escapeHtml(ev.year.toString())} — ${escapeHtml(ev.title)}</strong>
<div style="color:var(--muted);font-size:13px">${escapeHtml(ev.detail)}</div>
</div>
`).join('')
    app.innerHTML = `<h2>Хронология</h2><div style="background:var(--card);padding:12px;border-radius:8px">${items}</div>`
}


function renderGallery(){
    const grid = DATA.gallery.map(img=>`
<a href="#" style="display:block;width:100%;padding-top:60%;position:relative;overflow:hidden;border-radius:8px;margin-bottom:8px;" data-src="${img.src}">
<img alt="${escapeHtml(img.title)}" src="${img.src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">
</a>
`).join('')
    app.innerHTML = `<h2>Галерея</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">${grid}</div>`
// lightbox
    app.querySelectorAll('a[data-src]').forEach(a=>a.addEventListener('click', e=>{
        e.preventDefault(); openModal(`<img src='${a.dataset.src}' style='max-width:100%'>`)
    }))
}


function renderArticles(){
    const list = DATA.articles.map(a=>`
<div style="padding:10px;border-bottom:1px solid rgba(255,255,255,0.03)">
<strong>${escapeHtml(a.title)}</strong>
<div style="color:var(--muted);font-size:13px">${escapeHtml(a.body)}</div>
<div style="margin-top:6px"><button class="btn" data-id="${a.id}">Открыть</button></div>
</div>
`).join('')
    app.innerHTML = `<h2>Статьи</h2><div style="background:var(--card);padding:12px;border-radius:8px">${list}</div>`
    app.querySelectorAll('button[data-id]').forEach(b=>b.addEventListener('click', e=>{
        const id = Number(e.currentTarget.dataset.id)
        const art = DATA.articles.find(x=>x.id===id)
        if(art) openModal(`<h3>${escapeHtml(art.title)}</h3><p>${escapeHtml(art.body)}</p>`)
    }))
}


function renderTeams(){