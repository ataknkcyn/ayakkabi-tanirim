#!/usr/bin/env node
/**
 * smoke-test.js
 * US-001: HTML skeleton yapısal testleri
 * Çalıştır: node tests/smoke-test.js
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');

let passed = 0;
let failed = 0;

function assert(description, condition) {
  if (condition) {
    console.log(`  ✅ ${description}`);
    passed++;
  } else {
    console.error(`  ❌ ${description}`);
    failed++;
  }
}

console.log('\n🔍 Smoke Test — HTML Skeleton (US-001)\n');

// 1. lang="tr"
assert('html lang="tr" mevcut', /<html[^>]+lang=["']tr["']/i.test(html));

// 2. meta charset
assert('meta charset="UTF-8" mevcut', /<meta[^>]+charset=["']UTF-8["']/i.test(html));

// 3. viewport meta
assert(
  'viewport meta tag mevcut',
  /<meta[^>]+name=["']viewport["'][^>]*content=["'][^"']*width=device-width/i.test(html)
);

// 4. Sayfa başlığı
assert(
  "Sayfa başlığı 'Ayakkabı Tanıma Uygulaması' içeriyor",
  /<title>[^<]*Ayakkab[ıi][^<]*<\/title>/i.test(html)
);

// 5. <header> etiketi
assert('<header> etiketi mevcut', /<header[\s>]/i.test(html));

// 6. <main> etiketi
assert('<main> etiketi mevcut', /<main[\s>]/i.test(html));

// 7. <footer> etiketi
assert('<footer> etiketi mevcut', /<footer[\s>]/i.test(html));

// 8. #upload-section
assert('#upload-section mevcut', /id=["']upload-section["']/i.test(html));

// 9. #result-section
assert('#result-section mevcut', /id=["']result-section["']/i.test(html));

// 10. styles.css bağlantısı
assert(
  'styles.css bağlantısı mevcut',
  /<link[^>]+href=["']styles\.css["']/i.test(html)
);

// 11. app.js bağlantısı
assert(
  'app.js bağlantısı mevcut',
  /<script[^>]+src=["']app\.js["']/i.test(html)
);

console.log(`\n📊 Sonuç: ${passed} geçti, ${failed} başarısız\n`);

if (failed > 0) {
  process.exit(1);
}
