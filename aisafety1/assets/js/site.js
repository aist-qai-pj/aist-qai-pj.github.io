(function () {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* =========================
   * Header / Nav
   * ========================= */
  const header = $('.site-header');
  const nav = $('#site-nav');
  const toggle = $('.nav-toggle');
  const backdrop = $('.nav-backdrop');

  function setHeaderH() {
    const h = header ? header.getBoundingClientRect().height : 68;
    document.documentElement.style.setProperty('--headerH', Math.round(h) + 'px');
  }
  setHeaderH();
  window.addEventListener('resize', setHeaderH, { passive: true });

  function openNav() {
    document.body.classList.add('nav-open');
    nav && nav.classList.add('is-open');
    toggle && toggle.setAttribute('aria-expanded', 'true');
  }
  function closeNav() {
    document.body.classList.remove('nav-open');
    nav && nav.classList.remove('is-open');
    toggle && toggle.setAttribute('aria-expanded', 'false');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.contains('is-open');
      isOpen ? closeNav() : openNav();
    });
  }
  if (backdrop) backdrop.addEventListener('click', closeNav);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });

  // Close on nav click (mobile)
  if (nav) {
    $$('.nav-link', nav).forEach((a) => {
      a.addEventListener('click', () => {
        if (window.matchMedia('(max-width: 860px)').matches) closeNav();
      });
    });
  }

  // Root-relative links that also work on file://
  const root = document.documentElement.getAttribute('data-root') || './';
  $$('.nav-link[data-href]').forEach((a) => {
    const h = a.getAttribute('data-href');
    if (!h) return;
    a.setAttribute('href', root + h);
  });

  // Active link (based on current path)
  const section = (() => {
    const p = location.pathname.replace(/\\/g, '/');

    // results配下（/results/ /results/2025/ など全部を results 扱い）
    if (p.includes('/results/')) return 'results';

    if (p.includes('/about/')) return 'about';
    if (p.includes('/contact/')) return 'contact';

    return 'home';
  })();

  $$('.nav-link').forEach(a => {
    const key = a.getAttribute('data-active');
    if (key && key === section) a.classList.add('is-active');
  });
  /* =========================
   * Home Hero Reveal (ONE PATH)
   * 目的:
   *  - hero内の .reveal-item を「ふわっ」と出す
   *  - is-inview を付ける対象:
   *      .hero .js-hero-reveal
   *      .hero .hero-bottom-head
   * ========================= */
  document.addEventListener('DOMContentLoaded', () => {
    // CSS側の「準備状態」トリガ
    document.body.classList.add('reveal-ready');

    const heroBlock = document.querySelector('.hero .js-hero-reveal');
    const bottomHead = document.querySelector('.hero .hero-bottom-head');

    // ここで付与する class は「コンテナ側」に付ける（子の .reveal-item はCSSで制御）
    requestAnimationFrame(() => {
      if (heroBlock) heroBlock.classList.add('is-inview');
      if (bottomHead) bottomHead.classList.add('is-inview');
    });
  });
})();
// ===== Home hero reveals (only) =====
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // HOME 判定（index.html の body に page-home を付ける前提）
  if (!document.body.classList.contains('page-home')) return;

  // circles pop を出す
  document.body.classList.add('circles-in');

  // 文字を「隠して→出す」準備
  document.body.classList.add('reveal-ready');

  const heroCopy = document.querySelector('.hero .js-hero-reveal');
  const bottomHead = document.querySelector('.hero .hero-bottom-head');

  // 次フレームで付与（transition を確実に効かせる）
  requestAnimationFrame(() => {
    if (heroCopy) heroCopy.classList.add('is-inview');
    if (bottomHead) bottomHead.classList.add('is-inview');
  });
});
// ===== Home: type-in (H1/H2 only) =====
document.addEventListener('DOMContentLoaded', () => {
  if (!document.body.classList.contains('page-home')) return;

  // 次フレームで付与（CSS transition/animation が確実に効く）
  requestAnimationFrame(() => {
    document.body.classList.add('type-in');
  });
});
// ===== Footer: copyright (footer.js) =====
(function () {
  // Load footer.js next to site.js so we don't have to touch every HTML file.
  const scripts = Array.from(document.scripts || []);
  const site = document.currentScript || scripts.find(s => (s.src || '').includes('/assets/js/site.js')) || scripts[scripts.length - 1];
  const src = (site && site.src) ? site.src : '';
  const base = src.replace(/site\.js(\?.*)?$/,'');
  if (!base) return;

  const footerSrc = base + 'footer.js';
  if (scripts.some(s => (s.src || '') === footerSrc)) return;

  const s = document.createElement('script');
  s.src = footerSrc;
  s.defer = true;
  document.head.appendChild(s);
})();
(() => {
  'use strict';

  const dlg = document.getElementById('rd-overview');
  if (!dlg) return;

  const canDialog = typeof dlg.showModal === 'function';

  function openDialog(){
    if (canDialog) {
      // すでに開いていたら何もしない
      if (!dlg.open) dlg.showModal();
    } else {
      // 古いブラウザ向け（念のため）
      dlg.setAttribute('open', '');
    }
  }

  function closeDialog(){
    if (canDialog) {
      if (dlg.open) dlg.close();
    } else {
      dlg.removeAttribute('open');
    }
  }

  // クリック（委譲）
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-modal-open="rd-overview"]');
    if (openBtn) {
      e.preventDefault();
      openDialog();
      return;
    }

    const closeBtn = e.target.closest('[data-modal-close]');
    if (closeBtn && (closeBtn.closest('#rd-overview') || closeBtn.closest('.rd-modal'))) {
      e.preventDefault();
      closeDialog();
      return;
    }
  });

  // dialogの外側クリックで閉じる（Chrome等）
  dlg.addEventListener('click', (e) => {
    if (!canDialog) return;

    const rect = dlg.getBoundingClientRect();
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top  && e.clientY <= rect.bottom;

    if (!inside) closeDialog();
  });

  // ESC（cancel）を明示的に close（標準でも閉じるが安全のため）
  dlg.addEventListener('cancel', () => {
    closeDialog();
  });
})();
