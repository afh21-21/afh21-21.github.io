import { showToast } from './utils.js';

let isEditMode = false;

export function initEditor(getConfig, onConfigUpdated) {
  const trigger = document.getElementById('btn-edit-mode');

  const toggleMode = () => {
    isEditMode = !isEditMode;
    document.body.classList.toggle('edit-mode-active', isEditMode);
    showToast(isEditMode ? 'Edit Mode ON — Click cards to edit or export' : 'Edit Mode OFF');
    renderEditorToolbar(getConfig, onConfigUpdated);
  };

  trigger?.addEventListener('click', toggleMode);
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      toggleMode();
    }
  });
}

function renderEditorToolbar(getConfig, onConfigUpdated) {
  let bar = document.getElementById('editor-bar');
  if (!isEditMode) {
    bar?.remove();
    return;
  }

  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'editor-bar';
    bar.style.cssText = 'position:fixed;bottom:1rem;left:1rem;z-index:180;display:flex;gap:0.5rem;';
    bar.innerHTML = `
      <button id="ed-add" class="btn-secondary bouncy">+ Add Link</button>
      <button id="ed-export" class="btn-primary bouncy">Export config.json</button>
    `;
    document.body.appendChild(bar);

    bar.querySelector('#ed-add').addEventListener('click', () => {
      const title = prompt('Judul Link Baru:');
      const url = prompt('URL Tujuan (https://...):');
      if (!title || !url) return;

      const cfg = getConfig();
      const id = 'link-' + Date.now();
      cfg.links.push({ id, url, icon: 'assets/icons/github.svg', featured: false, category: 'custom' });
      Object.keys(cfg.i18n).forEach((lang) => {
        cfg.i18n[lang].items[id] = { title, subtitle: url };
      });
      onConfigUpdated(cfg);
      showToast('Link ditambahkan!');
    });

    bar.querySelector('#ed-export').addEventListener('click', () => {
      const blob = new Blob([JSON.stringify(getConfig(), null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'config.json';
      a.click();
      showToast('config.json berhasil diunduh!');
    });
  }
}