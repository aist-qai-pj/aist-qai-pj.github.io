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

  // TOP/Results の hash を tab に統一
  const HASH_TO_TAB = {
    '#tech': 'base',
    '#life': 'applied',
    '#genai': 'guide',
    '#base': 'base',
    '#applied': 'applied',
    '#guide': 'guide'
  };

  function setActiveTab(tab){
    state.tab = tab || 'all';
    tabs.forEach(b=>{
      const on = (b.getAttribute('data-tab') || 'all') === state.tab;
      b.classList.toggle('is-active', on);
      if (b.getAttribute('role') === 'tab') {
        b.setAttribute('aria-selected', on ? 'true' : 'false');
      }
    });
  }

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

  function escapeHtml(str){
    return String(str||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  // ===== ここが変更点：準備中化 + リンク無効化 =====

  function isPendingItem(item){
    // JSONに「（PPT案より）」が残っていても準備中扱いにする
    const s = String(item.summary || '');
    if (!s) return true;
    if (s.indexOf('PPT案より') !== -1) return true;
    if (s.indexOf('（PPT案より）') !== -1) return true;
    if (s.indexOf('準備中') !== -1) return true;
    return false;
  }

  function cardHtml(item){
    const tags = (item.tags||[]).slice(0,4).map(t=>`<span class="chip">${escapeHtml(t)}</span>`).join('');

    const pending = isPendingItem(item);
    const summaryText = pending ? '準備中' : (item.summary || '');

    // pending の場合は a をやめる（リンク停止＝コメントアウト相当）
    const Tag = pending ? 'div' : 'a';

    const href = `${root}results/detail.html?y=${encodeURIComponent(year)}&id=${encodeURIComponent(item.id)}`;
    const hrefAttr = pending ? '' : ` href="${href}"`;

    // 見た目のため、準備中は黄色バッジ表示（CSSは .catalog-card-text.is-pending を使う）
    const summaryClass = pending ? 'catalog-card-text is-pending' : 'catalog-card-text';

    // アクセシビリティ：div時もカードであることを示す
    const a11y = pending
      ? ` role="group" aria-label="${escapeHtml(item.title || '項目')}" aria-disabled="true"`
      : '';

    return `
      <${Tag} class="catalog-card${pending ? ' is-disabled' : ''}"${hrefAttr}${a11y}>
        <div class="catalog-card-top">
          <div class="thumb" aria-hidden="true"></div>
          <div class="meta">
            <span class="pill">${escapeHtml(labelCat(item.category))}</span>
            <span class="pill pill--sub">${escapeHtml(labelStatus(item.status))}</span>
            <span class="pill pill--sub">${escapeHtml(item.sponsor||'')}</span>
          </div>
        </div>
        <h3 class="catalog-card-title">${escapeHtml(item.title||'')}</h3>
        <p class="${summaryClass}">${escapeHtml(summaryText)}</p>
        <div class="chips">${tags}</div>
      </${Tag}>
    `;
  }

  function render(){
    const filtered = items.filter(matches);
    if (countEl) countEl.textContent = `${filtered.length}件`;

    if (!filtered.length){
      listEl.innerHTML = `<div class="empty">該当する項目がありません。条件を変更してください。</div>`;
      return;
    }
    listEl.innerHTML = filtered.map(cardHtml).join('');
  }

  function syncFromHash(){
    const h = (location.hash || '').toLowerCase();
    const tab = HASH_TO_TAB[h];
    if (!tab) return;
    setActiveTab(tab);
    render();
  }

  // Events
  tabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      setActiveTab(btn.getAttribute('data-tab') || 'all');

      // update hash (without jumping)
      const t = state.tab;
      const hash = t === 'base' ? '#base' : t === 'applied' ? '#applied' : t === 'guide' ? '#guide' : '';
      if (hash) {
        history.replaceState(null, '', location.pathname + location.search + hash);
      } else {
        history.replaceState(null, '', location.pathname + location.search);
      }

      render();
    });
  });

  if (qEl) qEl.addEventListener('input', ()=>{ state.q = qEl.value || ''; render(); });
  if (statusEl) statusEl.addEventListener('change', ()=>{ state.status = statusEl.value || ''; render(); });
  if (sponsorEl) sponsorEl.addEventListener('change', ()=>{ state.sponsor = sponsorEl.value || ''; render(); });
  if (resetEl) resetEl.addEventListener('click', ()=>{
    setActiveTab('all');
    state.q=''; state.status=''; state.sponsor='';
    if (qEl) qEl.value='';
    if (statusEl) statusEl.value='';
    if (sponsorEl) sponsorEl.value='';
    history.replaceState(null, '', location.pathname + location.search);
    render();
  });

  // init
  syncFromHash();
  render();
  window.addEventListener('hashchange', syncFromHash);
})();