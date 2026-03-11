/**
 * results-test.js — US-008: Results card display with shoe recognition details
 *
 * Bu test dosyası:
 *   - index.html içinde tüm 5 sonuç alanı ID'sinin varlığını
 *   - #result-section'ın başlangıçta gizli olduğunu
 *   - .result-card'ın altın üst kenarlık CSS'ine sahip olduğunu
 *   - displayResults fonksiyonunun app.js içinde tanımlı olduğunu
 *   - scrollIntoView çağrısının app.js içinde mevcut olduğunu
 *   - 'Yeni Analiz' butonunun varlığını
 * doğrular.
 *
 * Çalıştır: node tests/results-test.js
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// Dosyaları oku
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
const js   = readFileSync(join(ROOT, 'app.js'), 'utf8');
const css  = readFileSync(join(ROOT, 'styles.css'), 'utf8');

let passed = 0;
let failed = 0;

/**
 * Basit assertion fonksiyonu.
 * @param {string} label - Test açıklaması
 * @param {boolean} condition - Doğru olması gereken koşul
 */
function assert(label, condition) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

/* ============================================================
   1. index.html — Yapısal Kontroller
   ============================================================ */
console.log('\n[index.html] Yapısal kontroller:');

// #result-section mevcut ve style="display:none" ile gizli
assert(
  '#result-section mevcut',
  html.includes('id="result-section"')
);
assert(
  '#result-section başlangıçta style="display:none" ile gizli',
  /id="result-section"[^>]*style="display:none"/.test(html) ||
  /style="display:none"[^>]*id="result-section"/.test(html)
);

// Tüm 5 alan ID'si mevcut
assert('id="result-marka" mevcut',       html.includes('id="result-marka"'));
assert('id="result-model" mevcut',       html.includes('id="result-model"'));
assert('id="result-renk" mevcut',        html.includes('id="result-renk"'));
assert('id="result-tip" mevcut',         html.includes('id="result-tip"'));
assert('id="result-fiyatAraligi" mevcut', html.includes('id="result-fiyatAraligi"'));

// Heading 'Analiz Sonuçları'
assert(
  'Sonuç kartı "Analiz Sonuçları" başlığı içeriyor',
  html.includes('Analiz Sonuçları')
);

// İkonlar
assert('Marka ikonu 🏷️ mevcut',                  html.includes('🏷️'));
assert('Model ikonu 👟 mevcut',                   html.includes('👟'));
assert('Renk ikonu 🎨 mevcut',                    html.includes('🎨'));
assert('Tip ikonu 📋 mevcut',                     html.includes('📋'));
assert('Fiyat ikonu 💰 mevcut',                   html.includes('💰'));

// 'Yeni Analiz' butonu
assert(
  '"Yeni Analiz" butonu mevcut',
  html.includes('Yeni Analiz')
);
assert(
  '"Yeni Analiz" butonunun id="new-analysis-btn" var',
  html.includes('id="new-analysis-btn"')
);

// .result-card sınıfı
assert(
  'class="result-card" kullanılmış',
  html.includes('class="result-card"')
);

/* ============================================================
   2. app.js — Fonksiyon Kontrolleri
   ============================================================ */
console.log('\n[app.js] Fonksiyon kontrolleri:');

// displayResults fonksiyonu tanımlı
assert(
  'displayResults fonksiyonu tanımlı',
  /function displayResults\s*\(/.test(js)
);

// JSDoc yorum bloğu var
assert(
  'displayResults JSDoc yorumu var (@param)',
  js.includes('@param') && js.includes('displayResults')
);

// Her alan doldurulmuş
assert('result-marka getElementById ile güncelleniyor',
  js.includes("getElementById('result-marka')")
);
assert('result-model getElementById ile güncelleniyor',
  js.includes("getElementById('result-model')")
);
assert('result-renk getElementById ile güncelleniyor',
  js.includes("getElementById('result-renk')")
);
assert('result-tip getElementById ile güncelleniyor',
  js.includes("getElementById('result-tip')")
);
assert('result-fiyatAraligi getElementById ile güncelleniyor',
  js.includes("getElementById('result-fiyatAraligi')")
);

// result-section display:block yapılıyor
assert(
  'displayResults içinde result-section style.display = "block"',
  /resultSection\.style\.display\s*=\s*['"]block['"]/.test(js)
);

// scrollIntoView çağrısı var
assert(
  'scrollIntoView çağrısı mevcut',
  js.includes('scrollIntoView')
);

// displayResults app.js içinde çağrılıyor (analyzeBtn handler'da)
assert(
  'displayResults() çağrısı mevcut (sonuçları göstermek için)',
  js.includes('displayResults(result)') || js.includes('displayResults(data)')
);

// new-analysis-btn handler var
assert(
  '"new-analysis-btn" handler tanımlı',
  js.includes('new-analysis-btn') || js.includes('newAnalysisBtn')
);

/* ============================================================
   3. styles.css — CSS Kontrolleri
   ============================================================ */
console.log('\n[styles.css] CSS kontrolleri:');

// .result-card sınıfı tanımlı
assert('.result-card CSS kuralı var', css.includes('.result-card'));

// Altın üst kenarlık: border-top: 4px solid
assert(
  '.result-card altın üst kenarlık (border-top 4px solid) var',
  /\.result-card[\s\S]{0,300}border-top:\s*4px\s+solid/.test(css)
);

// border-radius: 12px
assert(
  '.result-card border-radius: 12px içeriyor',
  /\.result-card[\s\S]{0,300}border-radius:\s*12px/.test(css)
);

// padding: 24px
assert(
  '.result-card padding: 24px içeriyor',
  /\.result-card[\s\S]{0,300}padding:\s*24px/.test(css)
);

// .result-label ve .result-value sınıfları
assert('.result-label CSS kuralı var', css.includes('.result-label'));
assert('.result-value CSS kuralı var', css.includes('.result-value'));

/* ============================================================
   Özet
   ============================================================ */
console.log(`\n${'─'.repeat(50)}`);
console.log(`Toplam: ${passed + failed} | Geçti: ${passed} | Başarısız: ${failed}`);

if (failed > 0) {
  console.error(`\n❌ ${failed} test başarısız!`);
  process.exit(1);
} else {
  console.log(`\n✅ Tüm testler geçti!`);
  process.exit(0);
}
