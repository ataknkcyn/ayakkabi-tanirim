/**
 * tests/upload-test.js — US-004: Drag & Drop Upload Zone
 *
 * Parses app.js and index.html to assert that:
 *  - dragover, dragleave, drop event listeners are registered on #drop-zone
 *  - selectedFile variable is declared at module level
 *  - #drop-zone element exists in index.html with Turkish upload instructions
 *  - Hidden file input with accept="image/*" exists
 *
 * Node.js ESM — run with: node tests/upload-test.js
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const appJs    = readFileSync(resolve(root, 'app.js'), 'utf-8');
const indexHtml = readFileSync(resolve(root, 'index.html'), 'utf-8');

let passed = 0;
let failed = 0;

/**
 * Basit assertion yardımcısı.
 * @param {string} label - Test adı
 * @param {boolean} condition - Beklenen koşul
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
   app.js Testleri
   ============================================================ */
console.log('\n📋 app.js — Drag & Drop Event Listeners\n');

assert(
  'dragover event listener is registered on #drop-zone',
  /dropZone\.addEventListener\(['"]dragover['"]/.test(appJs)
);

assert(
  'dragleave event listener is registered on #drop-zone',
  /dropZone\.addEventListener\(['"]dragleave['"]/.test(appJs)
);

assert(
  'drop event listener is registered on #drop-zone',
  /dropZone\.addEventListener\(['"]drop['"]/.test(appJs)
);

assert(
  'selectedFile variable is declared at module level',
  /^let selectedFile\s*=/m.test(appJs)
);

assert(
  'selectedFile is assigned when a file is handled (selectedFile = file)',
  /selectedFile\s*=\s*file/.test(appJs)
);

assert(
  'Non-image file error message is Turkish: Lütfen bir görsel dosyası seçin',
  appJs.includes('Lütfen bir görsel dosyası seçin')
);

assert(
  'file type check uses startsWith("image/")',
  /file\.type\.startsWith\(['"]image\/['"]\)/.test(appJs)
);

assert(
  'file input change event listener is registered',
  /fileInput\.addEventListener\(['"]change['"]/.test(appJs)
);

assert(
  'handleFile function is defined',
  /function handleFile\s*\(/.test(appJs)
);

/* ============================================================
   index.html Testleri
   ============================================================ */
console.log('\n📋 index.html — Drop Zone Structure\n');

assert(
  '#drop-zone element exists',
  /id=["']drop-zone["']/.test(indexHtml)
);

assert(
  'Turkish upload instructions present: Ayakkabı fotoğrafını buraya sürükle veya',
  indexHtml.includes('Ayakkabı fotoğrafını buraya sürükle veya')
);

assert(
  'Hidden file input with id="file-input" exists',
  /id=["']file-input["']/.test(indexHtml)
);

assert(
  'File input has accept="image/*"',
  /accept=["']image\/\*["']/.test(indexHtml)
);

assert(
  'File input is hidden',
  /id=["']file-input["'][^>]*hidden|hidden[^>]*id=["']file-input["']/.test(indexHtml)
);

assert(
  'Dosya Seç button exists',
  /Dosya Seç/.test(indexHtml)
);

assert(
  '#preview-section exists',
  /id=["']preview-section["']/.test(indexHtml)
);

/* ============================================================
   styles.css Testleri
   ============================================================ */
console.log('\n📋 styles.css — Drop Zone Styling\n');

const stylesCss = readFileSync(resolve(root, 'styles.css'), 'utf-8');

assert(
  '#drop-zone has dashed border',
  /#drop-zone\s*\{[^}]*border[^}]*dashed/.test(stylesCss.replace(/\n/g, ' '))
);

assert(
  '.drag-over class is defined in CSS',
  /\.drag-over/.test(stylesCss)
);

assert(
  '.drag-over uses --color-accent for border',
  /drag-over[^}]*--color-accent|--color-accent[^}]*drag-over/.test(stylesCss.replace(/\n/g, ' '))
);

/* ============================================================
   Sonuç
   ============================================================ */
console.log(`\n${'─'.repeat(50)}`);
console.log(`Sonuç: ${passed} geçti, ${failed} başarısız\n`);

if (failed > 0) {
  process.exit(1);
}
