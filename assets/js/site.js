(function(){
  'use strict';

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const header = $('.site-header');
  const nav = $('#site-nav');
  const toggle = $('.nav-toggle');
  const backdrop = $('.nav-backdrop');

  function setHeaderH(){
    const h = header ? header.getBoundingClientRect().height : 68;
    document.documentElement.style.setProperty('--headerH', Math.round(h) + 'px');
  }
  setHeaderH();
  window.addEventListener('resize', setHeaderH, {passive:true});

  function openNav(){
    document.body.classList.add('nav-open');
    nav && nav.classList.add('is-open');
    toggle && toggle.setAttribute('aria-expanded','true');
  }
  function closeNav(){
    document.body.classList.remove('nav-open');
    nav && nav.classList.remove('is-open');
    toggle && toggle.setAttribute('aria-expanded','false');
  }

  if (toggle && nav){
    toggle.addEventListener('click', ()=>{
      const isOpen = nav.classList.contains('is-open');
      isOpen ? closeNav() : openNav();
    });
  }
  if (backdrop){
    backdrop.addEventListener('click', closeNav);
  }
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeNav();
  });

  // Close on nav click (mobile)
  if (nav){
    $$('.nav-link', nav).forEach(a=>{
      a.addEventListener('click', ()=>{
        if (window.matchMedia('(max-width: 860px)').matches) closeNav();
      });
    });
  }

  // Root-relative links that also work on file://
  // Each HTML sets <html data-root="./"> (or ../, ../../) and each nav link has data-href="about/index.html" etc.
  const root = document.documentElement.getAttribute('data-root') || './';
  $$('.nav-link[data-href]').forEach(a=>{
    const h = a.getAttribute('data-href');
    if (!h) return;
    a.setAttribute('href', root + h);
  });

  // Active link (based on current section)
  const section = (()=>{
    const p = location.pathname;
    if (p.includes('/results/')) return 'results';
    if (p.includes('/about/')) return 'about';
    if (p.includes('/goals/')) return 'goals';
    if (p.includes('/contact/')) return 'contact';
    return 'home';
  })();
  $$('.nav-link').forEach(a=>{
    const key = a.getAttribute('data-active');
    if (key && key === section) a.classList.add('is-active');
  });
})();
