// Footer: centralized copyright
document.addEventListener('DOMContentLoaded', () => {
  const year = new Date().getFullYear();
  const text = `© ${year} National Institute of Advanced Industrial Science and Technology`;

  document.querySelectorAll('.footer-copy, .footer-text').forEach((el) => {
    const t = (el.textContent || '').trim();

    // footer-copy is always copyright.
    if (el.classList.contains('footer-copy')) {
      el.textContent = text;
      return;
    }

    // footer-text is sometimes used for other info; replace only when it is a copyright line.
    if (t.startsWith('©') || t.includes('AI Safety Enhancement')) {
      el.textContent = text;
    }
  });
});
