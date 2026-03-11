// app.js — Ayakkabı Tanıma Uygulaması
// Vanilla JavaScript, build araçsız — index.html içinden yüklenir

/* ============================================================
   API Anahtarı — localStorage Yönetimi
   ============================================================ */

/**
 * Kullanıcının girdiği Claude API anahtarını localStorage'a kaydeder.
 * Input boşsa kaydetmez ve false döner.
 *
 * @param {string} apiKey - Kaydedilecek API anahtarı
 * @returns {boolean} Başarılıysa true, boş anahtar geçilirse false
 */
function saveApiKey(apiKey) {
  const trimmed = (apiKey || '').trim();
  if (!trimmed) return false;
  localStorage.setItem('claude_api_key', trimmed);
  return true;
}

/**
 * localStorage'dan kayıtlı Claude API anahtarını yükler.
 * Kayıt yoksa null döner.
 *
 * @returns {string|null} Kayıtlı API anahtarı veya null
 */
function loadApiKey() {
  return localStorage.getItem('claude_api_key');
}

/* ============================================================
   DOM Hazır — Başlangıç Kurulumu
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const apiKeyInput      = document.getElementById('api-key-input');
  const apiKeyToggle     = document.getElementById('api-key-toggle');
  const apiKeySaveBtn    = document.getElementById('api-key-save');
  const apiKeySavedMsg   = document.getElementById('api-key-saved-msg');

  // --- Sayfa yüklenince kayıtlı anahtarı doldur ---
  const savedKey = loadApiKey();
  if (savedKey) {
    apiKeyInput.value = savedKey;
    showSavedMessage();
  }

  // --- Göster / Gizle toggle ---
  apiKeyToggle.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    apiKeyToggle.textContent = isPassword ? 'Gizle' : 'Göster';
  });

  // --- Kaydet butonu ---
  apiKeySaveBtn.addEventListener('click', () => {
    const success = saveApiKey(apiKeyInput.value);
    if (success) {
      showSavedMessage();
    } else {
      // Boş input — kısa süre uyarı ver
      apiKeyInput.focus();
      apiKeyInput.style.borderColor = 'var(--color-error)';
      setTimeout(() => {
        apiKeyInput.style.borderColor = '';
      }, 1500);
    }
  });

  /**
   * Onay mesajını gösterir ve 3 saniye sonra gizler.
   * @private
   */
  function showSavedMessage() {
    apiKeySavedMsg.hidden = false;
    clearTimeout(showSavedMessage._timer);
    showSavedMessage._timer = setTimeout(() => {
      apiKeySavedMsg.hidden = true;
    }, 3000);
  }
});
