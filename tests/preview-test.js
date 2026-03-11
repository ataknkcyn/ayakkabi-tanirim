// tests/preview-test.js — US-005: Image preview display after file selection
// Statik kaynak dosyalarını string olarak okuyup regex ile doğrular.
// Node.js ESM — `node tests/preview-test.js` ile çalıştırılır.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const html = readFileSync(join(root, 'index.html'), 'utf8');
const js   = readFileSync(join(root, 'app.js'), 'utf8');
const css  = readFileSync(join(root, 'styles.css'), 'utf8');

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

console.log('\n📸 US-005: Image preview display tests\n');

// --- HTML: #preview-section var ve başlangıçta gizli ---
assert(
  /id=["']preview-section["']/.test(html),
  '#preview-section exists in index.html'
);
assert(
  /<div[^>]+id=["']preview-section["'][^>]*hidden/.test(html) ||
  /<div[^>]*hidden[^>]*id=["']preview-section["']/.test(html),
  '#preview-section is hidden by default (hidden attribute)'
);

// --- HTML: #preview-image img elementi ---
assert(
  /id=["']preview-image["']/.test(html),
  '<img id="preview-image"> exists in index.html'
);
assert(
  /<img[^>]+id=["']preview-image["']/.test(html),
  'preview-image is an <img> element'
);
assert(
  /alt=["']Seçilen ayakkabı fotoğrafı["']/.test(html),
  'preview-image has proper Turkish alt text'
);

// --- HTML: #file-name elementi ---
assert(
  /id=["']file-name["']/.test(html),
  '<p id="file-name"> exists in index.html'
);

// --- HTML: #change-btn (Değiştir) butonu ---
assert(
  /id=["']change-btn["']/.test(html),
  '#change-btn exists in index.html'
);
assert(
  /Değiştir/.test(html),
  '"Değiştir" text is in index.html'
);

// --- JS: showPreview fonksiyonu tanımlanmış ---
assert(
  /function showPreview\(/.test(js),
  'showPreview() function is defined in app.js'
);

// --- JS: showPreview JSDoc yorumu var ---
assert(
  /\/\*\*[\s\S]*?showPreview/.test(js),
  'showPreview has a JSDoc comment in app.js'
);

// --- JS: FileReader.readAsDataURL kullanılıyor ---
assert(
  /readAsDataURL/.test(js),
  'FileReader.readAsDataURL is used in app.js'
);

// --- JS: previewSec.hidden = false ayarlanıyor ---
assert(
  /previewSec\.hidden\s*=\s*false/.test(js),
  'previewSec.hidden = false is set to show preview'
);

// --- JS: Değiştir butonu selectedFile temizliyor ---
assert(
  /selectedFile\s*=\s*null/.test(js),
  'selectedFile is cleared (set to null) on change'
);
assert(
  /previewSec\.hidden\s*=\s*true/.test(js),
  'previewSec.hidden = true is set to hide preview on change'
);

// --- JS: formatFileSize veya dosya boyutu gösterimi ---
assert(
  /formatFileSize|file\.size|\.size/.test(js),
  'File size is displayed (formatFileSize or file.size used)'
);
assert(
  /file\.name/.test(js),
  'File name is displayed (file.name used)'
);

// --- CSS: object-fit: contain ---
assert(
  /object-fit:\s*contain/.test(css),
  'CSS uses object-fit: contain for preview image'
);

// --- CSS: max-height 400px ---
assert(
  /max-height:\s*400px/.test(css),
  'CSS uses max-height: 400px for preview image'
);

// --- CSS: max-width: 100% ---
assert(
  /#preview-image[\s\S]*?max-width:\s*100%/.test(css) ||
  /max-width:\s*100%[\s\S]*?#preview-image/.test(css),
  'CSS uses max-width: 100% for preview image'
);

// --- Özet ---
console.log(`\n📊 Sonuç: ${passed} geçti, ${failed} başarısız\n`);

if (failed > 0) {
  process.exit(1);
}
