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
   Seçilen Dosya — Modül Düzeyinde Durum
   ============================================================ */

/** Kullanıcının seçtiği veya sürükleyip bıraktığı dosyayı tutar. */
let selectedFile = null;

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

  /* ============================================================
     Sürükle & Bırak / Dosya Seçici
     ============================================================ */

  const dropZone    = document.getElementById('drop-zone');
  const fileInput   = document.getElementById('file-input');
  const selectBtn   = document.getElementById('select-btn');
  const previewSec  = document.getElementById('preview-section');
  const previewImg  = document.getElementById('preview-image');
  const fileNameEl  = document.getElementById('file-name');
  const changeBtn   = document.getElementById('change-btn');
  const errorBox    = document.getElementById('error-box');
  const errorMsg    = document.getElementById('error-message');

  /**
   * Bayt cinsinden dosya boyutunu okunabilir Türkçe formata çevirir.
   * Örn: 2457600 → "2,3 MB"
   *
   * @param {number} bytes - Dosya boyutu (bayt)
   * @returns {string} Okunabilir boyut metni
   */
  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1).replace('.', ',') + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
  }

  /**
   * Seçilen görsel dosyasını önizleme bölümünde gösterir.
   * FileReader ile dosyayı base64'e çevirir, img src'yi günceller,
   * dosya adı ve boyutunu Türkçe formatta yazar ve bölümü görünür yapar.
   *
   * @param {File} file - Önizlenecek görsel dosyası
   */
  function showPreview(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImg.src = e.target.result;
      fileNameEl.textContent = file.name + ' — ' + formatFileSize(file.size);
      previewSec.hidden = false;
    };
    reader.readAsDataURL(file);
  }

  /**
   * Seçilen ya da bırakılan dosyayı işler.
   * Sadece image/* tipini kabul eder; diğer tipler için Türkçe hata gösterir.
   *
   * @param {File} file - İşlenecek dosya
   */
  function handleFile(file) {
    if (!file) return;

    // Yalnızca görsel dosyaları kabul et
    if (!file.type.startsWith('image/')) {
      showError('Lütfen bir görsel dosyası seçin');
      return;
    }

    selectedFile = file;
    showPreview(file);
  }

  // --- Değiştir butonu: seçimi temizle ve önizlemeyi gizle ---
  changeBtn.addEventListener('click', () => {
    selectedFile = null;
    previewImg.src = '';
    fileNameEl.textContent = '';
    previewSec.hidden = true;
  });

  /**
   * Hata mesajını gösterir.
   *
   * @param {string} message - Gösterilecek Türkçe hata mesajı
   */
  function showError(message) {
    errorMsg.textContent = message;
    errorBox.hidden = false;
    // 4 saniye sonra otomatik gizle
    setTimeout(() => {
      errorBox.hidden = true;
    }, 4000);
  }

  // --- Drop Zone: dragover ---
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();               // varsayılan tarayıcı davranışını engelle
    dropZone.classList.add('drag-over');
  });

  // --- Drop Zone: dragleave ---
  dropZone.addEventListener('dragleave', (e) => {
    // Sadece drop-zone'un dışına çıkıldığında kaldır
    if (!dropZone.contains(e.relatedTarget)) {
      dropZone.classList.remove('drag-over');
    }
  });

  // --- Drop Zone: drop ---
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  // --- Drop Zone'a tıklama → dosya seçiciyi aç ---
  dropZone.addEventListener('click', (e) => {
    // Butona tıklandığında çift tetiklemeyi önle
    if (e.target !== selectBtn) {
      fileInput.click();
    }
  });

  // --- Dosya Seç butonu ---
  selectBtn.addEventListener('click', (e) => {
    e.stopPropagation();  // drop zone click'i tekrar tetiklemesin
    fileInput.click();
  });

  // --- Gizli file input değişikliği ---
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    handleFile(file);
    // Aynı dosyanın tekrar seçilebilmesi için değeri sıfırla
    fileInput.value = '';
  });
});
