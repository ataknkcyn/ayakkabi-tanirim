/**
 * tests/api-test.js — US-006: Claude API Integration
 *
 * Parses app.js and index.html as strings to assert that:
 *  - analyzeShoe(file, apiKey) async function is defined with JSDoc
 *  - Function sends POST to https://api.anthropic.com/v1/messages
 *  - Request includes 'anthropic-dangerous-direct-browser-access: true' header
 *  - Request uses model 'claude-haiku-4-5-20251001'
 *  - Image is base64-encoded and included as vision content
 *  - System prompt covers marka, model, renk, tip, fiyatAraligi
 *  - 'Analiz Et' button exists in index.html and is disabled by default
 *  - updateAnalyzeBtn function enables button based on state
 *
 * Node.js ESM — run with: node tests/api-test.js
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const appJs     = readFileSync(resolve(root, 'app.js'), 'utf-8');
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
   app.js — analyzeShoe Fonksiyon İmzası ve JSDoc
   ============================================================ */
console.log('\n📋 app.js — analyzeShoe Function\n');

assert(
  'analyzeShoe async function is defined',
  /async function analyzeShoe\s*\(/.test(appJs)
);

assert(
  'analyzeShoe accepts (file, apiKey) parameters',
  /async function analyzeShoe\s*\(\s*file\s*,\s*apiKey\s*\)/.test(appJs)
);

assert(
  'analyzeShoe has JSDoc comment (@param for file)',
  /@param\s+\{File\}\s+file/.test(appJs)
);

assert(
  'analyzeShoe has JSDoc comment (@param for apiKey)',
  /@param\s+\{string\}\s+apiKey/.test(appJs)
);

assert(
  'analyzeShoe has @returns JSDoc',
  /@returns\s+\{Promise/.test(appJs)
);

/* ============================================================
   app.js — API URL ve POST isteği
   ============================================================ */
console.log('\n📋 app.js — API URL and POST Request\n');

assert(
  'Correct API URL: https://api.anthropic.com/v1/messages',
  appJs.includes('https://api.anthropic.com/v1/messages')
);

assert(
  'Uses fetch to POST to the API',
  /fetch\s*\(\s*['"]https:\/\/api\.anthropic\.com\/v1\/messages['"]/.test(appJs)
);

assert(
  "Method is POST",
  /method\s*:\s*['"]POST['"]/.test(appJs)
);

/* ============================================================
   app.js — Zorunlu Başlıklar
   ============================================================ */
console.log('\n📋 app.js — Required Headers\n');

assert(
  "Header 'anthropic-dangerous-direct-browser-access: true' is present",
  appJs.includes("'anthropic-dangerous-direct-browser-access': 'true'") ||
  appJs.includes('"anthropic-dangerous-direct-browser-access": "true"') ||
  appJs.includes("'anthropic-dangerous-direct-browser-access'") && appJs.includes("'true'")
);

assert(
  "Header 'anthropic-version: 2023-06-01' is present",
  appJs.includes("'anthropic-version': '2023-06-01'") ||
  appJs.includes('"anthropic-version": "2023-06-01"')
);

assert(
  "Header 'x-api-key' is present",
  appJs.includes("'x-api-key'") || appJs.includes('"x-api-key"')
);

assert(
  "Header 'content-type: application/json' is present",
  /content-type['"]\s*:\s*['"]application\/json/.test(appJs)
);

/* ============================================================
   app.js — Model ve Vision İçeriği
   ============================================================ */
console.log('\n📋 app.js — Model and Vision Content\n');

assert(
  "Model 'claude-haiku-4-5-20251001' is referenced",
  appJs.includes('claude-haiku-4-5-20251001')
);

assert(
  "Vision image type is used: type: 'image'",
  /type\s*:\s*['"]image['"]/.test(appJs)
);

assert(
  "Vision source type is base64",
  /type\s*:\s*['"]base64['"]/.test(appJs)
);

assert(
  'media_type is set from file.type',
  /media_type\s*[=:]\s*(file\.type|mediaType)/.test(appJs)
);

assert(
  'FileReader.readAsDataURL is used for base64 conversion',
  /readAsDataURL\s*\(/.test(appJs)
);

assert(
  'base64 prefix is stripped (split on comma)',
  /split\s*\(\s*['"],['"]\s*\)/.test(appJs)
);

/* ============================================================
   app.js — Sistem Promptu (Türkçe Alanlar)
   ============================================================ */
console.log('\n📋 app.js — System Prompt Fields\n');

assert(
  'System prompt includes marka',
  appJs.includes('marka')
);

assert(
  'System prompt includes model (model adı)',
  appJs.includes('"model"') || appJs.includes("'model'")
);

assert(
  'System prompt includes renk',
  appJs.includes('renk')
);

assert(
  'System prompt includes tip',
  appJs.includes('tip')
);

assert(
  'System prompt includes fiyatAraligi',
  appJs.includes('fiyatAraligi')
);

/* ============================================================
   app.js — Sonuç Döndürme
   ============================================================ */
console.log('\n📋 app.js — Return Value\n');

assert(
  'analyzeShoe returns an object with marka field',
  /return\s*\{[^}]*marka/.test(appJs.replace(/\n/g, ' '))
);

assert(
  'analyzeShoe returns an object with fiyatAraligi field',
  /return\s*\{[^}]*fiyatAraligi/.test(appJs.replace(/\n/g, ' '))
);

/* ============================================================
   app.js — Analiz Butonu Durumu
   ============================================================ */
console.log('\n📋 app.js — Analyze Button State Management\n');

assert(
  'updateAnalyzeBtn function is defined',
  /function updateAnalyzeBtn\s*\(/.test(appJs)
);

assert(
  'analyzeBtn.disabled is set in updateAnalyzeBtn',
  /analyzeBtn\.disabled/.test(appJs)
);

assert(
  'updateAnalyzeBtn is called when file is selected (selectedFile = file is followed by updateAnalyzeBtn call)',
  /selectedFile\s*=\s*file;\s*(?:[\s\S]{0,200}?)updateAnalyzeBtn\s*\(\s*\)/.test(appJs)
);

assert(
  'API key input triggers updateAnalyzeBtn on change',
  /apiKeyInput\.addEventListener\(['"]input['"]/.test(appJs)
);

/* ============================================================
   index.html — Analiz Et Butonu
   ============================================================ */
console.log('\n📋 index.html — Analiz Et Button\n');

assert(
  "id='analyze-btn' button exists in index.html",
  /id=["']analyze-btn["']/.test(indexHtml)
);

assert(
  "'Analiz Et' text is present in the button",
  /Analiz Et/.test(indexHtml)
);

assert(
  "'Analiz Et' button has 'disabled' attribute by default",
  /id=["']analyze-btn["'][^>]*disabled|disabled[^>]*id=["']analyze-btn["']/.test(indexHtml)
);

/* ============================================================
   Sonuç
   ============================================================ */
console.log(`\n${'─'.repeat(50)}`);
console.log(`Sonuç: ${passed} geçti, ${failed} başarısız\n`);

if (failed > 0) {
  process.exit(1);
}
