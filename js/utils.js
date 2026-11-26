export function showToast(message, duration = 2400) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove('hidden');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.add('hidden');
  }, duration);
}

export async function copyToClipboard(text, successMsg) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg);
  } catch {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    showToast(successMsg);
  }
}

export function attachImageFallback(imgEl, fallbackSrc) {
  if (!imgEl) return;
  imgEl.addEventListener('error', () => {
    if (imgEl.src !== fallbackSrc) {
      imgEl.src = fallbackSrc;
    }
  }, { once: true });
}

export function triggerClickGuard(btnEl, delay = 320, callback) {
  if (!btnEl || btnEl.classList.contains('is-loading')) return;
  btnEl.classList.add('is-loading');
  const label = btnEl.querySelector('.btn-label');
  const spinner = btnEl.querySelector('.btn-spinner');
  if (spinner) spinner.classList.remove('hidden');
  if (label) label.style.opacity = '0.7';

  setTimeout(() => {
    btnEl.classList.remove('is-loading');
    if (spinner) spinner.classList.add('hidden');
    if (label) label.style.opacity = '1';
    if (typeof callback === 'function') callback();
  }, delay);
}