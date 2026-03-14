/* Results catalog (search + filters) */
(function(){
  'use strict';

  function $(sel, root){ return (root||document).querySelector(sel); }
  function $$(sel, root){ return Array.from((root||document).querySelectorAll(sel)); }

  const dataEl = document.getElementById('results-data');
  const listEl = document.getElementById('results-list');
  if (!dataEl || !listEl) return;

  let data;
  try { data = JSON.parse(dataEl.textContent || '{}'); } catch(e){ return; }
  const items = Array.isArray(data.items) ? data.items : [];
  const year  = data.year || '';

  const root = document.documentElement.getAttribute('data-root') || './';

  const state = {
    tab: 'all',
    q: '',
    status: '',
    sponsor: ''
  };

  const qEl = $('#q');
  const statusEl = $('#status');
  const sponsorEl = $('#sponsor');
  const countEl = $('#count');
  const resetEl = $('#reset');
  const tabs = $$('.tab[data-tab]');

  function norm(s){ return String(s||'').toLowerCase(); }

  function matches(item){
    if (state.tab !== 'all' && item.category !== state.tab) return false;
    if (state.status && item.status !== state.status) return false;
    if (state.sponsor && item.sponsor !== state.sponsor) return false;

    if (state.q){
      const q = norm(state.q);
      const blob = [item.title, item.summary, (item.tags||[]).join(' ')].map(norm).join(' | ');
      if (!blob.includes(q)) return false;
    }
    return true;
  }

  function labelStatus(v){
    if (v === 'ongoing') return '進行中';
    if (v === 'done') return '完了';
    return v || '';
  }
  function labelCat(v){
    if (v === 'base') return '①基盤';
    if (v === 'applied') return '②応用';
    if (v === 'guide') return '③ガイドライン・標準化';
    return v || '';
  }

  function cardHtml(item){
    const tags = (item.tags||[]).slice(0,4).map(t=>`<span class="chip">${escapeHtml(t)}</span>`).join('');
    const href = `${root}results/detail.html?y=${encodeURIComponent(year)}&id=${encodeURIComponent(item.id)}`;
    return `
      <a class="catalog-card" href="${href}">
        <div class="catalog-card-top">
          <div class="thumb" aria-hidden="true"></div>
          <div class="meta">
            <span class="pill">${escapeHtml(labelCat(item.category))}</span>
            <span class="pill pill--sub">${escapeHtml(labelStatus(item.status))}</span>
            <span class="pill pill--sub">${escapeHtml(item.sponsor||'')}</span>
          </div>
        </div>
        <h3 class="catalog-card-title">${escapeHtml(item.title||'')}</h3>
        <p class="catalog-card-text">${escapeHtml(item.summary||'')}</p>
        <div class="chips">${tags}</div>
      </a>
    `;
  }

  function escapeHtml(str){
    return String(str||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function render(){
    const filtered = items.filter(matches);
    listEl.innerHTML = filtered.map(cardHtml).join('');
    if (countEl) countEl.textContent = `${filtered.length}件`;
    if (!filtered.length){
      listEl.innerHTML = `<div class="empty">該当する項目がありません。条件を変更してください。</div>`;
    }
  }

  // Events
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      tabs.forEach(b=>b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.tab = btn.getAttribute('data-tab') || 'all';
      render();
    });
  });

  if (qEl) qEl.addEventListener('input', ()=>{ state.q = qEl.value || ''; render(); });
  if (statusEl) statusEl.addEventListener('change', ()=>{ state.status = statusEl.value || ''; render(); });
  if (sponsorEl) sponsorEl.addEventListener('change', ()=>{ state.sponsor = sponsorEl.value || ''; render(); });
  if (resetEl) resetEl.addEventListener('click', ()=>{
    state.tab = 'all'; state.q=''; state.status=''; state.sponsor='';
    tabs.forEach(b=>b.classList.remove('is-active'));
    const first = tabs.find(b=>b.getAttribute('data-tab')==='all');
    if (first) first.classList.add('is-active');
    if (qEl) qEl.value='';
    if (statusEl) statusEl.value='';
    if (sponsorEl) sponsorEl.value='';
    render();
  });

  render();
})();
