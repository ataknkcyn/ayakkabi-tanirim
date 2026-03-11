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
   Claude API — Ayakkabı Tanıma
   ============================================================ */

/**
 * Seçilen ayakkabı görselini Claude API'ye göndererek tanıma yapar.
 *
 * Görseli base64'e çevirir, Claude Haiku modeline vision isteği gönderir,
 * dönen JSON'u parse ederek yapılandırılmış sonuç döner.
 *
 * @param {File} file - Analiz edilecek görsel dosyası (image/*)
 * @param {string} apiKey - Anthropic Claude API anahtarı
 * @returns {Promise<{marka: string, model: string, renk: string, tip: string, fiyatAraligi: string}>}
 */
async function analyzeShoe(file, apiKey) {
  // 1. Dosyayı base64'e çevir
  const base64Data = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // "data:image/jpeg;base64,XXXX" formatından sadece XXXX kısmını al
      const dataUrl = e.target.result;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Dosya okunamadı'));
    reader.readAsDataURL(file);
  });

  // 2. Medya tipini belirle (desteklenen tipler: jpeg, png, webp, gif)
  const mediaType = file.type || 'image/jpeg';

  // 3. Claude API isteği oluştur
  const requestBody = {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: `Sen bir ayakkabı tanıma uzmanısın. Kullanıcının gönderdiği ayakkabı fotoğrafını analiz et ve aşağıdaki bilgileri JSON formatında döndür:
{
  "marka": "Ayakkabının markası (bilinmiyorsa 'Bilinmiyor')",
  "model": "Ayakkabının model adı (bilinmiyorsa 'Bilinmiyor')",
  "renk": "Ayakkabının rengi veya renk kombinasyonu",
  "tip": "Ayakkabı tipi (spor/günlük/resmi/bot/sandalet/diğer)",
  "fiyatAraligi": "Türkiye'deki tahmini fiyat aralığı (örn: '500-1000 TL')"
}

Sadece JSON döndür, başka metin ekleme.`,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: base64Data,
            },
          },
          {
            type: 'text',
            text: 'Bu ayakkabıyı tanımla ve bilgileri JSON formatında döndür.',
          },
        ],
      },
    ],
  };

  // 4. API isteğini gönder
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  // 5. HTTP hatalarını kontrol et — hata nesnesine status kodu ekle
  if (!response.ok) {
    const apiErr = new Error(`HTTP ${response.status}`);
    apiErr.status = response.status;
    throw apiErr;
  }

  // 6. Yanıtı parse et
  const data = await response.json();
  const rawText = data.content[0].text;

  // JSON bloğu içinde olabilir (```json ... ``` gibi)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    const jsonErr = new Error('API yanıtı geçerli JSON içermiyor');
    jsonErr.isJsonError = true;
    throw jsonErr;
  }

  let result;
  try {
    result = JSON.parse(jsonMatch[0]);
  } catch (_) {
    const parseErr = new Error('JSON parse hatası');
    parseErr.isJsonError = true;
    throw parseErr;
  }

  // 7. Yapılandırılmış sonucu döndür
  return {
    marka: result.marka || 'Bilinmiyor',
    model: result.model || 'Bilinmiyor',
    renk: result.renk || 'Bilinmiyor',
    tip: result.tip || 'Bilinmiyor',
    fiyatAraligi: result.fiyatAraligi || 'Bilinmiyor',
  };
}

/* ============================================================
   Hata Mesajı Sabitleri — Türkçe hata metinleri
   ============================================================ */

/** Dosya seçilmeden analiz yapılmaya çalışıldığında gösterilir. */
const ERR_NO_FILE    = 'Lütfen önce bir ayakkabı fotoğrafı seçin.';

/** API anahtarı girilmeden analiz yapılmaya çalışıldığında gösterilir. */
const ERR_NO_API_KEY = 'Lütfen Claude API anahtarınızı girin.';

/** HTTP 401 — geçersiz veya süresi dolmuş API anahtarı. */
const ERR_UNAUTHORIZED = 'API anahtarı geçersiz. Lütfen doğru anahtarı girin.';

/** HTTP 429 — istek limiti (rate limit) aşıldı. */
const ERR_RATE_LIMIT = 'İstek limiti aşıldı. Lütfen birkaç dakika bekleyin.';

/** HTTP 500+ — Claude API tarafındaki geçici sunucu hatası. */
const ERR_SERVER = 'Claude API geçici bir hata döndürdü. Lütfen tekrar deneyin.';

/** Ağ bağlantısı hatası — fetch isteği gönderilemedi. */
const ERR_NETWORK = 'Ağ bağlantısı hatası. İnternet bağlantınızı kontrol edin.';

/** JSON parse hatası — API yanıtı işlenemedi. */
const ERR_JSON = 'Yanıt işlenirken hata oluştu. Lütfen tekrar deneyin.';

/* ============================================================
   Hata Gösterimi — showError / hideError
   ============================================================ */

/**
 * Hata bölümünü (#error-section) gösterir ve mesajı yazar.
 * Sayfayı hata kartına kaydırır.
 *
 * @param {string} message - Gösterilecek Türkçe hata mesajı
 */
function showError(message) {
  const errorSection = document.getElementById('error-section');
  const errorMessage = document.getElementById('error-message');

  if (errorMessage) errorMessage.textContent = message;
  if (errorSection) {
    errorSection.style.display = 'flex';
    errorSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Hata bölümünü (#error-section) gizler.
 */
function hideError() {
  const errorSection = document.getElementById('error-section');
  if (errorSection) errorSection.style.display = 'none';
}

/* ============================================================
   Yükleme Animasyonu — showLoading / hideLoading
   ============================================================ */

/**
 * API isteği başlamadan önce yükleme animasyonunu gösterir.
 * - #loading-section'ı display:flex yapar
 * - #result-section'ı gizler
 * - #analyze-btn'i devre dışı bırakır ve metnini günceller
 */
function showLoading() {
  const loadingSection = document.getElementById('loading-section');
  const resultSection  = document.getElementById('result-section');
  const analyzeBtn     = document.getElementById('analyze-btn');

  if (loadingSection) loadingSection.style.display = 'flex';
  if (resultSection)  resultSection.style.display = 'none';
  if (analyzeBtn) {
    analyzeBtn.disabled    = true;
    analyzeBtn.textContent = 'Analiz ediliyor...';
  }
}

/**
 * API isteği tamamlandıktan sonra yükleme animasyonunu gizler.
 * - #loading-section'ı display:none yapar
 * - #analyze-btn'i yeniden etkinleştirir ve metnini geri yükler
 */
function hideLoading() {
  const loadingSection = document.getElementById('loading-section');
  const analyzeBtn     = document.getElementById('analyze-btn');

  if (loadingSection) loadingSection.style.display = 'none';
  if (analyzeBtn) {
    analyzeBtn.disabled    = false;
    analyzeBtn.textContent = '🔍 Analiz Et';
  }
}

/* ============================================================
   Sonuç Gösterimi — displayResults
   ============================================================ */

/**
 * Ayakkabı tanıma sonuçlarını sonuç kartında görüntüler.
 *
 * analyzeShoe() fonksiyonundan dönen veriyi alıp ilgili HTML
 * öğelerine yazar, #result-section'ı görünür yapar ve sayfayı
 * smooth scroll ile sonuç kartına kaydırır.
 *
 * @param {{marka: string, model: string, renk: string, tip: string, fiyatAraligi: string}} data
 *   analyzeShoe() fonksiyonundan dönen ayakkabı bilgileri nesnesi
 */
function displayResults(data) {
  // Her alanı ilgili span'a yaz (boşsa 'Bilinmiyor' göster)
  document.getElementById('result-marka').textContent      = data.marka      || 'Bilinmiyor';
  document.getElementById('result-model').textContent      = data.model      || 'Bilinmiyor';
  document.getElementById('result-renk').textContent       = data.renk       || 'Bilinmiyor';
  document.getElementById('result-tip').textContent        = data.tip        || 'Bilinmiyor';
  document.getElementById('result-fiyatAraligi').textContent = data.fiyatAraligi || 'Bilinmiyor';

  // #result-section'ı göster (style.display ile — [hidden] attribute yerine)
  const resultSection = document.getElementById('result-section');
  resultSection.style.display = 'block';

  // Sonuç kartına smooth scroll
  resultSection.scrollIntoView({ behavior: 'smooth' });
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

  const dropZone      = document.getElementById('drop-zone');
  const fileInput     = document.getElementById('file-input');
  const selectBtn     = document.getElementById('select-btn');
  const previewSec    = document.getElementById('preview-section');
  const previewImg    = document.getElementById('preview-image');
  const fileNameEl    = document.getElementById('file-name');
  const changeBtn     = document.getElementById('change-btn');
  const analyzeBtn    = document.getElementById('analyze-btn');
  const resultSection   = document.getElementById('result-section');
  const newAnalysisBtn  = document.getElementById('new-analysis-btn');

  /**
   * Analiz Et butonunu etkinleştirme/devre dışı bırakma durumunu günceller.
   * Hem selectedFile hem de API anahtarı dolu olduğunda etkinleştirir.
   */
  function updateAnalyzeBtn() {
    const hasFile = !!selectedFile;
    const hasKey  = !!(apiKeyInput.value || '').trim();
    analyzeBtn.disabled = !(hasFile && hasKey);
  }

  // API anahtarı değiştiğinde butonu güncelle
  apiKeyInput.addEventListener('input', updateAnalyzeBtn);

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
    updateAnalyzeBtn();
  }

  // --- Değiştir butonu: seçimi temizle ve önizlemeyi gizle ---
  changeBtn.addEventListener('click', () => {
    selectedFile = null;
    previewImg.src = '';
    fileNameEl.textContent = '';
    previewSec.hidden = true;
    updateAnalyzeBtn();
  });

  // --- Analiz Et butonu ---
  analyzeBtn.addEventListener('click', async () => {
    // Dosya seçilmediyse Türkçe hata göster
    if (!selectedFile) {
      showError(ERR_NO_FILE);
      return;
    }
    const apiKey = (apiKeyInput.value || '').trim();
    // API anahtarı yoksa Türkçe hata göster
    if (!apiKey) {
      showError(ERR_NO_API_KEY);
      return;
    }

    // Önceki hata mesajını gizle
    hideError();

    // Yükleme animasyonunu başlat (result-section gizlenir)
    showLoading();

    try {
      const result = await analyzeShoe(selectedFile, apiKey);
      // Sonuçları göster (displayResults result-section'ı açar ve scroll yapar)
      displayResults(result);
    } catch (err) {
      // HTTP durum koduna veya hata türüne göre Türkçe mesaj seç
      let errorMessage;
      if (err.status === 401) {
        errorMessage = ERR_UNAUTHORIZED;
      } else if (err.status === 429) {
        errorMessage = ERR_RATE_LIMIT;
      } else if (err.status >= 500) {
        errorMessage = ERR_SERVER;
      } else if (err instanceof TypeError) {
        // fetch() ağ hatası TypeError fırlatır
        errorMessage = ERR_NETWORK;
      } else if (err.isJsonError || err instanceof SyntaxError) {
        errorMessage = ERR_JSON;
      } else {
        errorMessage = err.message || 'Bilinmeyen bir hata oluştu.';
      }
      showError(errorMessage);
    } finally {
      // Her durumda yükleme animasyonunu gizle
      hideLoading();
    }
  });

  // --- Yeni Analiz butonu: formu tamamen sıfırla ---
  if (newAnalysisBtn) {
    newAnalysisBtn.addEventListener('click', () => {
      // Seçili dosyayı temizle
      selectedFile = null;
      // Sonuç bölümünü gizle
      resultSection.style.display = 'none';
      // Hata bölümünü gizle
      hideError();
      // Önizlemeyi gizle ve sıfırla
      previewImg.src = '';
      fileNameEl.textContent = '';
      previewSec.hidden = true;
      // Analiz butonunu güncelle
      updateAnalyzeBtn();
    });
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
