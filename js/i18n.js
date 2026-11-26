const LANG_KEY = 'flynner_lang';

export function initI18n(onLanguageChange) {
  const savedLang = localStorage.getItem(LANG_KEY) || 'en-US';
  setActiveButton(savedLang);

  const btnLang = document.getElementById('btn-lang');
  const popover = document.getElementById('lang-popover');

  btnLang?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('theme-popover')?.classList.add('hidden');
    popover?.classList.toggle('hidden');
  });

  document.querySelectorAll('[data-set-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.setLang;
      localStorage.setItem(LANG_KEY, lang);
      setActiveButton(lang);
      popover?.classList.add('hidden');
      if (typeof onLanguageChange === 'function') onLanguageChange(lang);
    });
  });

  document.addEventListener('click', () => popover?.classList.add('hidden'));
  return savedLang;
}

function setActiveButton(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-set-lang]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.setLang === lang);
  });
}