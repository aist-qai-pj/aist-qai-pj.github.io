(function(){
  "use strict";

  const dataEl = document.getElementById("results-data");
  if(!dataEl) return;

  let payload;
  try { payload = JSON.parse(dataEl.textContent || "{}"); } catch(e){ return; }
  const items = Array.isArray(payload.items) ? payload.items : [];

  const cardsEl = document.getElementById("cards");
  const countEl = document.getElementById("count");
  const qEl = document.getElementById("q");
  const statusEl = document.getElementById("status");
  const funderEl = document.getElementById("funder");
  const tabBtns = Array.from(document.querySelectorAll("[data-filter-cat]"));

  let state = { cat: "all", q: "", status: "all", funder: "all" };

  const norm = (s) => (s || "").toString().toLowerCase();

  function matches(it){
    if(state.cat !== "all" && it.category !== state.cat) return false;
    if(state.status !== "all" && it.status !== state.status) return false;
    if(state.funder !== "all" && it.funder !== state.funder) return false;

    const q = norm(state.q).trim();
    if(!q) return true;

    const hay = [
      it.title, it.summary,
      Array.isArray(it.tags) ? it.tags.join(" ") : ""
    ].map(norm).join(" ");
    return hay.includes(q);
  }

  function escapeHtml(str){
    return (str ?? "").toString()
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function cardHtml(it, idx){
    const tags = (it.tags || []).slice(0,4).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("");
    const badge = (idx+1).toString().padStart(2,"0");
    return `
      <a class="card" href="${it.url}">
        <div class="thumb" aria-hidden="true">
          <div class="thumb-badge">${badge}</div>
        </div>
        <div class="card-body">
          <div class="card-meta">
            <span class="meta-pill">カテゴリ：${escapeHtml(it.categoryLabel || "")}</span>
            <span class="meta-pill">ステータス：${escapeHtml(it.status || "")}</span>
            <span class="meta-pill">実施体制：${escapeHtml(it.funder || "")}</span>
          </div>
          <h2 class="card-title">${escapeHtml(it.title || "")}</h2>
          <p class="card-summary">${escapeHtml(it.summary || "")}</p>
          <div class="tag-row">${tags}</div>
          <div class="card-cta">詳細を見る →</div>
        </div>
      </a>
    `;
  }

  function render(){
    const filtered = items.filter(matches);
    if(countEl) countEl.textContent = String(filtered.length);

    if(!cardsEl) return;
    if(filtered.length === 0){
      cardsEl.innerHTML = `<div class="empty">該当する項目がありません。条件を変更してください。</div>`;
      return;
    }
    cardsEl.innerHTML = filtered.map(cardHtml).join("");
  }

  function setActiveTab(){
    tabBtns.forEach(btn => {
      const v = btn.getAttribute("data-filter-cat");
      btn.classList.toggle("is-active", v === state.cat);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      state.cat = btn.getAttribute("data-filter-cat") || "all";
      setActiveTab();
      render();
    });
  });

  if(qEl){
    qEl.addEventListener("input", () => {
      state.q = qEl.value || "";
      render();
    });
  }
  if(statusEl){
    statusEl.addEventListener("change", () => {
      state.status = statusEl.value || "all";
      render();
    });
  }
  if(funderEl){
    funderEl.addEventListener("change", () => {
      state.funder = funderEl.value || "all";
      render();
    });
  }

  setActiveTab();
  render();
})();