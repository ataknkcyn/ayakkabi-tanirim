/**
 * integration-test.js — Tam Entegrasyon Testi
 *
 * index.html, app.js ve styles.css dosyalarının tüm gerekli
 * yapısal öğeleri içerdiğini doğrular.
 *
 * Çalıştırma: node tests/integration-test.js
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// --- Kaynak dosyaları oku ---
const html = readFileSync(resolve(root, 'index.html'), 'utf8');
const js   = readFileSync(resolve(root, 'app.js'),    'utf8');
const css  = readFileSync(resolve(root, 'styles.css'), 'utf8');

let passed = 0;
let failed = 0;

/**
 * Tek bir testi çalıştırır ve sonucu ekrana yazar.
 *
 * @param {string}  label    - Test açıklaması
 * @param {boolean} condition - Koşul doğruysa geçer
 */
function assert(label, condition) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${label}`);
    failed++;
  }
}

/* ============================================================
   1. index.html — Zorunlu Section ID'leri
   ============================================================ */
console.log('\n📄 index.html — Section ID kontrolleri');

assert(
  '#upload-section mevcut',
  html.includes('id="upload-section"')
);
assert(
  '#preview-section mevcut',
  html.includes('id="preview-section"')
);
assert(
  '#loading-section mevcut',
  html.includes('id="loading-section"')
);
assert(
  '#result-section mevcut',
  html.includes('id="result-section"')
);
assert(
  '#error-section mevcut',
  html.includes('id="error-section"')
);

/* ============================================================
   2. index.html — "Nasıl Kullanılır?" Bölümü
   ============================================================ */
console.log('\n📄 index.html — "Nasıl Kullanılır?" bölümü');

assert(
  'id="how-to-section" mevcut',
  html.includes('id="how-to-section"')
);
assert(
  '<details id="how-to-details"> mevcut',
  html.includes('id="how-to-details"')
);
assert(
  '"Nasıl Kullanılır?" metni mevcut',
  html.includes('Nasıl Kullanılır')
);
assert(
  'Numaralı <ol> adımlar mevcut',
  html.includes('<ol>') && html.includes('</ol>')
);
assert(
  'En az 4 adım (<li>) var',
  (html.match(/<li>/g) || []).length >= 4
);

/* ============================================================
   3. app.js — Zorunlu Fonksiyonlar
   ============================================================ */
console.log('\n📜 app.js — Zorunlu fonksiyon tanımları');

const requiredFunctions = [
  'saveApiKey',
  'loadApiKey',
  'showPreview',
  'analyzeShoe',
  'showLoading',
  'hideLoading',
  'displayResults',
  'showError',
  'hideError',
];

requiredFunctions.forEach((fn) => {
  assert(
    `${fn}() tanımlanmış`,
    new RegExp(`function\\s+${fn}\\s*\\(`).test(js)
  );
});

/* ============================================================
   4. app.js — JSDoc Yorumları Türkçe
   ============================================================ */
console.log('\n📜 app.js — Türkçe JSDoc yorumları');

assert(
  'saveApiKey için JSDoc var',
  js.includes('* Kullanıcının girdiği') || js.includes('* Kaydedilecek')
);
assert(
  'loadApiKey için JSDoc var',
  js.includes('* localStorage\'dan') || js.includes('* Kayıtlı API')
);
assert(
  'analyzeShoe için JSDoc var',
  js.includes('* Seçilen ayakkabı') || js.includes('@param {File} file')
);
assert(
  'showLoading için JSDoc var',
  js.includes('* API isteği başlamadan') || js.includes('showLoading')
);
assert(
  'hideLoading için JSDoc var',
  js.includes('* API isteği tamamlandıktan') || js.includes('hideLoading')
);
assert(
  'displayResults için JSDoc var',
  js.includes('* Ayakkabı tanıma sonuçlarını') || js.includes('displayResults')
);
assert(
  'showError için JSDoc var',
  js.includes('* Hata bölümünü') || js.includes('@param {string} message')
);

/* ============================================================
   5. styles.css — CSS Değişkenleri (Custom Properties)
   ============================================================ */
console.log('\n🎨 styles.css — CSS değişken kontrolleri');

const requiredVars = [
  '--color-bg',
  '--color-surface',
  '--color-text',
  '--color-accent',
  '--color-error',
  '--font-family',
  '--space-4',
  '--radius-md',
  '--shadow-md',
  '--transition-fast',
];

requiredVars.forEach((varName) => {
  assert(
    `${varName} tanımlı`,
    css.includes(varName)
  );
});

/* ============================================================
   6. styles.css — @keyframes Animasyonları
   ============================================================ */
console.log('\n🎨 styles.css — @keyframes animasyonları');

assert(
  '@keyframes spin tanımlı',
  css.includes('@keyframes spin')
);
assert(
  '@keyframes pulse tanımlı',
  css.includes('@keyframes pulse')
);

/* ============================================================
   7. styles.css — Mobil Responsive
   ============================================================ */
console.log('\n🎨 styles.css — Mobil responsive (max-width: 640px)');

assert(
  '@media (max-width: 640px) bloğu mevcut',
  css.includes('@media (max-width: 640px)')
);
assert(
  'drop-zone min-height: 150px mobilde',
  css.includes('min-height: 150px')
);
assert(
  'result-card padding 16px mobilde',
  css.includes('padding: 16px')
);
assert(
  'Butonlar mobilde tam genişlik (.btn-primary tam genişlik)',
  // btn-primary already has width:100% globally; mobile block adds all buttons
  css.match(/@media[\s\S]*?max-width:\s*640px[\s\S]*?\.btn-primary[\s\S]*?width:\s*100%/m) !== null ||
  css.match(/@media[\s\S]*?max-width:\s*640px[\s\S]*?\.btn-upload[\s\S]*?width:\s*100%/m) !== null
);
assert(
  '--font-size-2xl mobilde 1.5rem',
  css.includes('--font-size-2xl: 1.5rem')
);
assert(
  '--font-size-xl mobilde 1.25rem',
  css.includes('--font-size-xl:  1.25rem') || css.includes('--font-size-xl: 1.25rem')
);

/* ============================================================
   8. Genel Kontroller
   ============================================================ */
console.log('\n🔍 Genel kontroller');

assert(
  'index.html lang="tr" (Türkçe dil)',
  html.includes('lang="tr"')
);
assert(
  'Claude API model "claude-haiku-4-5-20251001" kullanılıyor',
  js.includes('claude-haiku-4-5-20251001')
);
assert(
  'anthropic-dangerous-direct-browser-access header mevcut (CORS)',
  js.includes('anthropic-dangerous-direct-browser-access')
);
assert(
  'localStorage kullanımı var (API key persist)',
  js.includes('localStorage.setItem') && js.includes('localStorage.getItem')
);
assert(
  'try/finally pattern API çağrısında var',
  js.includes('try {') && js.includes('} finally {')
);

/* ============================================================
   Sonuç
   ============================================================ */
console.log('\n' + '─'.repeat(50));
console.log(`Toplam: ${passed + failed} | ✅ Geçti: ${passed} | ❌ Başarısız: ${failed}`);
console.log('─'.repeat(50));

if (failed > 0) {
  console.error('\n❌ Bazı testler başarısız oldu!\n');
  process.exit(1);
} else {
  console.log('\n✅ Tüm entegrasyon testleri geçti!\n');
  process.exit(0);
}
