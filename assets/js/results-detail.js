/* Results detail page (reads ?y=2025&id=R2025-001) */
(function(){
  'use strict';
  const $ = (sel, root=document) => root.querySelector(sel);

  const box = document.getElementById('detail');
  const back = document.getElementById('back-link');
  const dataEl = document.getElementById('results-all');
  if (!box || !dataEl) return;

  let all;
  try { all = JSON.parse(dataEl.textContent || '{}'); } catch(e){ all = {}; }

  const params = new URLSearchParams(location.search);
  const y = params.get('y') || '2025';
  const id = params.get('id') || '';

  const items = Array.isArray(all[y]) ? all[y] : [];
  const item = items.find(x => String(x.id) === String(id));

  if (back) {
    back.setAttribute('href', `../results/${encodeURIComponent(y)}/index.html`);
    back.textContent = `研究開発成果（${y}）`;
  }

  function esc(str){
    return String(str||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
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

  if (!item){
    box.innerHTML = `
      <h1 class="page-title" style="margin:0 0 10px 0;">項目が見つかりません</h1>
      <p class="muted">URLの指定（y / id）をご確認ください。</p>
    `;
    return;
  }

  const tags = (item.tags||[]).map(t=>`<span class="chip">${esc(t)}</span>`).join('');

  box.innerHTML = `
    <h1 class="page-title" style="margin:0 0 10px 0;">${esc(item.title)}</h1>
    <div class="chips" style="margin-bottom:12px;">
      <span class="pill">${esc(labelCat(item.category))}</span>
      <span class="pill pill--sub">${esc(labelStatus(item.status))}</span>
      <span class="pill pill--sub">${esc(item.sponsor||'')}</span>
      <span class="pill pill--sub">${esc(y)}年度</span>
    </div>
    <p style="margin:0 0 14px 0; color: var(--muted); line-height:1.8;">${esc(item.summary)}</p>
    <div class="chips">${tags}</div>
    <hr style="border:none;border-top:1px solid var(--border);margin:16px 0;"/>
    <p class="muted" style="margin:0;">ここは「詳細の出し方（個別ページ）」の枠組み確認用です。本文・画像・関連リンク等は後で差し替えできます。</p>
  `;
})();
