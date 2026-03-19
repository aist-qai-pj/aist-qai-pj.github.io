(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);

  // ===== header height -> CSS var =====
  const header = $('.site-header');
  const setHeaderH = () => {
    const h = header ? header.getBoundingClientRect().height : 0;
    document.documentElement.style.setProperty('--headerH', `${Math.round(h)}px`);
  };
  window.addEventListener('load', setHeaderH, { passive: true });
  window.addEventListener('resize', setHeaderH, { passive: true });

  // ===== mobile nav toggle (if exists) =====
  const navToggle = $('.nav-toggle');
  const nav = $('.site-nav');
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', nav.classList.contains('is-open') ? 'true' : 'false');
    });
  }

  // ===== smooth scroll (same-page anchors) =====
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;

    const id = a.getAttribute('href');
    if (!id || id === '#') return;

    const target = document.getElementById(id.slice(1));
    if (!target) return;

    e.preventDefault();
    const y = target.getBoundingClientRect().top + window.pageYOffset - (parseInt(getComputedStyle(document.documentElement).getPropertyValue('--headerH')) || 0) - 8;
    window.scrollTo({ top: y, behavior: 'smooth' });

    // close mobile nav after click
    if (nav && nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
  }, { passive: false });
})();
(() => {
  const root = document.documentElement;
  let mx=0,my=0, tx=0,ty=0;

  window.addEventListener('pointermove', (e) => {
    const x = (e.clientX / innerWidth  - 0.5);
    const y = (e.clientY / innerHeight - 0.5);
    tx = x * 16; ty = y * 10;
  }, { passive: true });

  function raf(){
    mx += (tx - mx) * 0.08;
    my += (ty - my) * 0.08;
    root.style.setProperty('--mx', mx.toFixed(2) + 'px');
    root.style.setProperty('--my', my.toFixed(2) + 'px');
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
})();
// ===== Hero text reveal =====
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  requestAnimationFrame(() => {
    hero.classList.add("reveal-in");
  });
});// ===== Circles pop reveal (on view) =====
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  const grid = document.querySelector(".grid3");
  if (!hero || !grid) return;

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        hero.classList.add("circles-in");
        io.disconnect();
        break;
      }
    }
  }, { threshold: 0.25 });

  io.observe(grid);
});
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("vanta-rings");
  if (!el || !window.VANTA) return;

  // 既に生成済みなら破棄して作り直し（リロード/SPA対策）
  if (el.__vanta) {
    el.__vanta.destroy();
    el.__vanta = null;
  }

  el.__vanta = VANTA.RINGS({
    el,
    mouseControls: true,
    touchControls: true,
    gyroControls: false,

    // 軽め設定（重いなら更に下げる）
    scale: 1.0,
    scaleMobile: 1.0,

    // 色（ここを好みに）
    backgroundColor: 0x000000, // 背景は実際は透過っぽく見せたいので暗め
    color: 0x2dd4bf,
  });

  // 背景を透明っぽくしたい場合：canvasの背景を消す
  //（Vantaの仕様で完全透明は難しいので、暗色+上にシミで馴染ませるのが安定）
});