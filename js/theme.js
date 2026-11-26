const STORAGE_KEY = 'flynner_theme';

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY) || 'imperial';
  applyTheme(saved);

  const btnTheme = document.getElementById('btn-theme');
  const popover = document.getElementById('theme-popover');

  btnTheme?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('lang-popover')?.classList.add('hidden');
    popover?.classList.toggle('hidden');
  });

  document.querySelectorAll('[data-set-theme]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const chosen = btn.dataset.setTheme;
      applyTheme(chosen);
      popover?.classList.add('hidden');
    });
  });

  document.addEventListener('click', () => popover?.classList.add('hidden'));
}

export function applyTheme(themeName) {
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem(STORAGE_KEY, themeName);

  document.querySelectorAll('[data-set-theme]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.setTheme === themeName);
  });
}