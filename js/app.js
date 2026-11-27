import { initTheme } from './theme.js';
import { initI18n } from './i18n.js';
import { copyToClipboard, attachImageFallback, triggerClickGuard } from './utils.js';

let appConfig = null;
let currentLang = 'en-US';
let selectedLink = null;

async function bootstrap() {
  initTheme();
  currentLang = initI18n((newLang) => {
    currentLang = newLang;
    renderAll();
  });

  setupVsCodePet();

  const themeObserver = new MutationObserver(() => syncGithubCards());
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
  });

  try {
    const res = await fetch(`data/config.json?v=${Date.now()}`);
    appConfig = await res.json();
    renderAll();
    setupModalEvents();
    setupQrModal();
  } catch (err) {
    console.error('Gagal memuat config.json:', err);
  }
}

function renderAll() {
  if (!appConfig) return;
  const dict = appConfig.i18n[currentLang] || appConfig.i18n['en-US'];

  // Profile Info
  const avatar = document.getElementById('profile-avatar');
  avatar.src = appConfig.profile.avatar;
  attachImageFallback(avatar, appConfig.profile.fallbackAvatar);

  document.getElementById('profile-name').textContent = appConfig.profile.name;
  document.getElementById('profile-alias').textContent = appConfig.profile.alias;
  document.getElementById('profile-bio').textContent = dict.bio;
  document.getElementById('profile-bio').classList.remove('skeleton-text');

  document.getElementById('status-emoji').textContent = appConfig.profile.status.emoji;
  document.getElementById('status-text').textContent = dict.statusText;
  document.getElementById('status-text').classList.remove('skeleton-text');

  document.getElementById('section-links-title').textContent = dict.sectionLinks;
  document.getElementById('section-github-title').textContent = dict.sectionGithub;

  // Social Icons
  const socialRow = document.getElementById('social-row');
  socialRow.innerHTML = appConfig.socials.map((s) => `
    <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-btn bouncy" title="${s.label}" aria-label="${s.label}">
      <img src="${s.icon}" alt="${s.label}" width="20" height="20">
    </a>
  `).join('');

  // Linktree Cards
  const linksContainer = document.getElementById('links-container');
  linksContainer.innerHTML = appConfig.links.map((item) => {
    const meta = dict.items[item.id] || { title: item.id, subtitle: item.url };
    return `
      <div class="link-card bouncy ${item.featured ? 'featured' : ''}" data-link-id="${item.id}">
        <div class="link-icon">
          <img src="${item.icon}" alt="" width="22" height="22">
        </div>
        <div class="link-info">
          <div class="link-title">${meta.title}</div>
          <div class="link-subtitle">${meta.subtitle}</div>
        </div>
        <button class="link-more-btn bouncy" data-preview-id="${item.id}" aria-label="Preview Link">•••</button>
      </div>
    `;
  }).join('');

  // Event Listener yang responsif untuk desktop & mobile
  linksContainer.querySelectorAll('.link-card').forEach((card) => {
    const id = card.dataset.linkId;
    
    // Klik pada card secara keseluruhan
    card.addEventListener('click', (e) => {
      triggerClickGuard(card, 220, () => openPreviewModal(id));
    });

    // Klik spesifik pada tombol '•••'
    const moreBtn = card.querySelector('.link-more-btn');
    if (moreBtn) {
      moreBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Mencegah konflik event bubbling
        triggerClickGuard(moreBtn, 220, () => openPreviewModal(id));
      });
    }
  });

  syncGithubCards();
}

function syncGithubCards() {
  if (!appConfig) return;
  const user = appConfig.profile.githubUsername;
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'imperial';
  const variant = currentTheme === 'apple' ? 'light' : 'dark';
  const today = new Date().toISOString().slice(0, 10);
  const base = `https://raw.githubusercontent.com/${user}/${user}/main/assets`;

  const targets = [
    { id: 'gh-about-img', file: `about-${variant}.svg` },
    { id: 'gh-stack-img', file: `stack-${variant}.svg` },
    { id: 'gh-stats-img', file: `stats-${variant}.svg` }
  ];

  targets.forEach(({ id, file }) => {
    const img = document.getElementById(id);
    if (img) img.src = `${base}/${file}?d=${today}`;
  });
}

function setupVsCodePet() {
  document.addEventListener('mousemove', (e) => {
    const pet = document.getElementById('vscode-pet');
    if (!pet) return;
    
    const rect = pet.getBoundingClientRect();
    const petX = rect.left + rect.width / 2;
    const petY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(e.clientY - petY, e.clientX - petX);
    const distance = Math.min(2, Math.hypot(e.clientX - petX, e.clientY - petY) / 50);
    
    const moveX = Math.cos(angle) * distance;
    const moveY = Math.sin(angle) * distance;
    
    const pupils = document.querySelectorAll('.pet-pupil');
    pupils.forEach(pupil => {
      pupil.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });
}

function openPreviewModal(linkId) {
  const linkObj = appConfig.links.find((l) => l.id === linkId);
  if (!linkObj) return;
  selectedLink = linkObj;

  const dict = appConfig.i18n[currentLang] || appConfig.i18n['en-US'];
  const meta = dict.items[linkId] || { title: linkId, subtitle: linkObj.url };

  document.getElementById('modal-icon').innerHTML = `<img src="${linkObj.icon}" alt="" width="26" height="26">`;
  document.getElementById('modal-title').textContent = meta.title;
  document.getElementById('modal-subtitle').textContent = meta.subtitle;
  document.getElementById('modal-url').textContent = linkObj.url;
  
  const copyBtn = document.getElementById('modal-copy');
  const goBtn = document.getElementById('modal-go');
  if (copyBtn) copyBtn.textContent = dict.previewCopy || 'Copy Link';
  if (goBtn) goBtn.textContent = dict.previewOpen || 'Continue to Link';
  if (goBtn) goBtn.href = linkObj.url;

  document.getElementById('link-modal').style.display = 'grid';
}

function setupQrModal() {
  const btnQr = document.getElementById('btn-qr');
  const qrModal = document.getElementById('qr-modal');
  const qrClose = document.getElementById('qr-close');
  const qrImg = document.getElementById('qr-image');
  const qrCopy = document.getElementById('qr-copy-url');

  btnQr?.addEventListener('click', () => {
    const profileUrl = window.location.origin + window.location.pathname;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(profileUrl)}`;
    qrModal.classList.remove('hidden');
  });

  qrClose?.addEventListener('click', () => qrModal.classList.add('hidden'));
  qrModal?.addEventListener('click', (e) => {
    if (e.target === qrModal) qrModal.classList.add('hidden');
  });

  qrCopy?.addEventListener('click', () => {
    const dict = appConfig.i18n[currentLang] || appConfig.i18n['en-US'];
    copyToClipboard(window.location.href, dict.copiedToast);
  });
}

function setupModalEvents() {
  const modal = document.getElementById('link-modal');
  const closeBtn = document.getElementById('modal-close');
  const copyBtn = document.getElementById('modal-copy');
  const openBtn = document.getElementById('modal-go');

  closeBtn?.addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  copyBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!selectedLink) return;
    const dict = appConfig.i18n[currentLang] || appConfig.i18n['en-US'];
    copyToClipboard(selectedLink.url, dict.copiedToast);
  });

  openBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (!selectedLink) return;
    triggerClickGuard(openBtn, 350, () => {
      window.open(selectedLink.url, '_blank', 'noopener,noreferrer');
      modal.style.display = 'none';
    });
  });
}

bootstrap();
