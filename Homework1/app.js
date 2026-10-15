const themeBtn = document.querySelector('#theme-btn');
const root = document.documentElement;

function applyTheme(theme) {
  root.dataset.theme = theme;
  const isDark = theme === 'dark';
  themeBtn.setAttribute('aria-pressed', String(isDark));
  themeBtn.textContent = isDark ? 'Light mode' : 'Dark mode';
}

function loadTheme() {
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
  } catch (e) { /* storage unavailable */ }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

themeBtn.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
});

applyTheme(loadTheme());
