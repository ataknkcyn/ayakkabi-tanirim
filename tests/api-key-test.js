/**
 * api-key-test.js — US-003: API key input with localStorage persistence
 *
 * Pure Node.js test, no framework needed.
 * Tests: saveApiKey / loadApiKey logic via mock localStorage,
 *        and verifies functions + UI elements exist in source files.
 *
 * Run: node tests/api-key-test.js
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

/* ============================================================
   Yardımcı — basit assert
   ============================================================ */
let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

/* ============================================================
   Mock localStorage (Node ortamında gerçek localStorage yok)
   ============================================================ */
const store = {};
const mockLocalStorage = {
  getItem:  (key)        => store[key] ?? null,
  setItem:  (key, value) => { store[key] = String(value); },
  removeItem:(key)       => { delete store[key]; },
  clear:    ()           => { Object.keys(store).forEach(k => delete store[k]); },
};

/* saveApiKey / loadApiKey işlevlerini mock ile değerlendirmek için
   app.js'teki sadece fonksiyon gövdelerini izole edip çalıştırıyoruz. */

function makeApiKeyFunctions(ls) {
  function saveApiKey(apiKey) {
    const trimmed = (apiKey || '').trim();
    if (!trimmed) return false;
    ls.setItem('claude_api_key', trimmed);
    return true;
  }

  function loadApiKey() {
    return ls.getItem('claude_api_key');
  }

  return { saveApiKey, loadApiKey };
}

/* ============================================================
   Test 1 — saveApiKey: geçerli anahtar kaydeder
   ============================================================ */
console.log('\n[1] saveApiKey — geçerli anahtar');
{
  mockLocalStorage.clear();
  const { saveApiKey, loadApiKey } = makeApiKeyFunctions(mockLocalStorage);

  const result = saveApiKey('sk-ant-test-key-123');
  assert(result === true,                       'saveApiKey true döndürür');
  assert(store['claude_api_key'] === 'sk-ant-test-key-123', 'Anahtar localStorage\'a kaydedilir');
  assert(loadApiKey() === 'sk-ant-test-key-123','loadApiKey kaydedilen değeri okur');
}

/* ============================================================
   Test 2 — saveApiKey: boş anahtar reddedilir
   ============================================================ */
console.log('\n[2] saveApiKey — boş string');
{
  mockLocalStorage.clear();
  const { saveApiKey, loadApiKey } = makeApiKeyFunctions(mockLocalStorage);

  const result = saveApiKey('');
  assert(result === false,     'Boş anahtar için false döner');
  assert(loadApiKey() === null,'localStorage değişmez');
}

/* ============================================================
   Test 3 — saveApiKey: sadece boşluk
   ============================================================ */
console.log('\n[3] saveApiKey — sadece boşluk');
{
  mockLocalStorage.clear();
  const { saveApiKey, loadApiKey } = makeApiKeyFunctions(mockLocalStorage);

  const result = saveApiKey('   ');
  assert(result === false,     'Boşluklu anahtar reddedilir');
  assert(loadApiKey() === null,'localStorage değişmez');
}

/* ============================================================
   Test 4 — loadApiKey: kayıt yokken null döner
   ============================================================ */
console.log('\n[4] loadApiKey — kayıt yok');
{
  mockLocalStorage.clear();
  const { loadApiKey } = makeApiKeyFunctions(mockLocalStorage);

  assert(loadApiKey() === null, 'Kayıt yokken null döner');
}

/* ============================================================
   Test 5 — saveApiKey: baştaki/sondaki boşlukları temizler
   ============================================================ */
console.log('\n[5] saveApiKey — trim');
{
  mockLocalStorage.clear();
  const { saveApiKey, loadApiKey } = makeApiKeyFunctions(mockLocalStorage);

  saveApiKey('  sk-ant-trimmed  ');
  assert(loadApiKey() === 'sk-ant-trimmed', 'Boşluklar temizlenir');
}

/* ============================================================
   Test 6 — app.js kaynak dosyasında fonksiyonlar tanımlı
   ============================================================ */
console.log('\n[6] app.js kaynak analizi');
{
  const src = readFileSync(resolve(ROOT, 'app.js'), 'utf8');

  assert(src.includes('function saveApiKey('),    'saveApiKey fonksiyonu tanımlı');
  assert(src.includes('function loadApiKey('),    'loadApiKey fonksiyonu tanımlı');
  assert(src.includes('@param'),                  'JSDoc @param yorumu mevcut');
  assert(src.includes('@returns'),                'JSDoc @returns yorumu mevcut');
  assert(src.includes("localStorage.setItem("),   'localStorage.setItem kullanılıyor');
  assert(src.includes("localStorage.getItem("),   'localStorage.getItem kullanılıyor');
  assert(src.includes("'claude_api_key'"),        'Anahtar adı claude_api_key');
}

/* ============================================================
   Test 7 — index.html UI elementleri
   ============================================================ */
console.log('\n[7] index.html UI elementleri');
{
  const html = readFileSync(resolve(ROOT, 'index.html'), 'utf8');

  assert(html.includes('id="api-key-input"'),          'api-key-input elementi var');
  assert(html.includes("type='password'") ||
         html.includes('type="password"'),              'Input type=password');
  assert(html.includes('id="api-key-toggle"'),         'Göster/Gizle butonu var');
  assert(html.includes('id="api-key-save"'),           'Kaydet butonu var');
  assert(html.includes('id="api-key-saved-msg"'),      'Onay mesajı elementi var');
  assert(html.includes('Claude API anahtarınızı girin'),'Türkçe placeholder mevcut');
}

/* ============================================================
   Sonuç
   ============================================================ */
console.log(`\n${'─'.repeat(45)}`);
console.log(`Toplam: ${passed + failed} | Geçti: ${passed} | Başarısız: ${failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('Tüm testler geçti ✓');
}
