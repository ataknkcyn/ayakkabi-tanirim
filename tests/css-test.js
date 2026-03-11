/**
 * css-test.js — CSS Design System Testleri
 * US-002: Black/white/gold palette ve responsive base
 *
 * Çalıştırma: node tests/css-test.js
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cssPath = resolve(__dirname, '..', 'styles.css');

let css;
try {
  css = readFileSync(cssPath, 'utf8');
} catch (err) {
  console.error(`❌ styles.css okunamadı: ${err.message}`);
  process.exit(1);
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passed++;
  } else {
    console.error(`  ❌ ${message}`);
    failed++;
  }
}

console.log('\n=== CSS Design System Testleri ===\n');

// --- 1. CSS Custom Properties (en az 7 adet) ---
console.log('1. CSS Custom Properties (:root)');

const cssVarMatches = css.match(/--[\w-]+\s*:/g) || [];
const uniqueVars = new Set(cssVarMatches.map(v => v.trim().replace(':', '')));

assert(uniqueVars.size >= 7,
  `En az 7 CSS değişkeni tanımlı (bulunan: ${uniqueVars.size})`);

// --- 2. Beklenen değişkenlerin varlığı ---
console.log('\n2. Zorunlu Renk Değişkenleri');

const requiredVars = [
  '--color-bg',
  '--color-surface',
  '--color-text',
  '--color-text-muted',
  '--color-accent',
  '--color-accent-dark',
  '--color-border',
  '--color-error',
];

for (const varName of requiredVars) {
  assert(css.includes(varName), `${varName} tanımlı`);
}

// --- 3. Amber/gold rengi doğrulaması ---
console.log('\n3. Accent (Altın/Amber) Rengi');

assert(
  css.includes('--color-accent:') && css.includes('#f59e0b'),
  '--color-accent değeri #f59e0b (amber/gold)'
);

assert(
  css.includes('--color-accent-dark:') && css.includes('#d97706'),
  '--color-accent-dark değeri #d97706'
);

// --- 4. Koyu arka plan ---
console.log('\n4. Koyu Arka Plan');

assert(
  css.includes('--color-bg:') && css.includes('#0a0a0a'),
  '--color-bg değeri #0a0a0a (koyu)'
);

// --- 5. Medya sorgusu ---
console.log('\n5. Responsive Medya Sorgusu');

assert(
  css.includes('@media (max-width: 640px)'),
  '@media (max-width: 640px) bloğu mevcut'
);

// --- 6. Tipografi ölçekleri ---
console.log('\n6. Tipografi');

assert(css.includes('font-size: var(--font-size-2xl)') || css.includes('--font-size-2xl:'), 'h1 tipografi ölçeği (--font-size-2xl) tanımlı');
assert(css.includes('--font-size-xl:'), 'h2 tipografi ölçeği (--font-size-xl) tanımlı');
assert(css.includes('--font-size-sm:'), 'Küçük metin ölçeği (--font-size-sm) tanımlı');

// --- 7. CSS Reset ---
console.log('\n7. CSS Reset');

assert(css.includes('box-sizing: border-box'), 'box-sizing: border-box reset mevcut');
assert(css.includes('font-family: var(--font-family)') || css.includes("font-family: system-ui"), 'body font-family tanımlı');

// --- 8. Layout ---
console.log('\n8. Layout');

assert(css.includes('max-width: 900px'), 'max-width: 900px layout kısıtlaması mevcut');
assert(css.includes('margin-left: auto') || css.includes('margin: 0 auto'), 'Merkezi hizalama (auto margin) mevcut');

// --- 9. Animasyon ---
console.log('\n9. Animasyon');

assert(css.includes('@keyframes spin'), '@keyframes spin animasyonu tanımlı');
assert(css.includes('animation:') || css.includes('animation '), 'Spinner animasyonu uygulanmış');

// --- 10. Hata rengi ---
console.log('\n10. Hata Rengi');

assert(
  css.includes('--color-error:') && css.includes('#ef4444'),
  '--color-error değeri #ef4444 (kırmızı)'
);

// --- Özet ---
console.log('\n=== Sonuç ===');
console.log(`Toplam: ${passed + failed} test | ✅ ${passed} geçti | ❌ ${failed} başarısız\n`);

if (failed > 0) {
  process.exit(1);
}
