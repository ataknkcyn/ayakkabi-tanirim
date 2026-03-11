// tests/error-test.js — US-009: Turkish error handling
// Kaynak dosyaları string olarak okur, regex ile doğrular — browser runtime gerektirmez

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const appJs    = readFileSync(resolve(ROOT, 'app.js'),    'utf8');
const indexHtml = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const stylesCss = readFileSync(resolve(ROOT, 'styles.css'), 'utf8');

let passed = 0;
let failed = 0;

/**
 * Test assertion helper.
 * @param {string} name
 * @param {boolean} condition
 */
function assert(name, condition) {
  if (condition) {
    console.log(`  ✅  ${name}`);
    passed++;
  } else {
    console.error(`  ❌  ${name}`);
    failed++;
  }
}

console.log('\n── US-009: Turkish Error Handling ──\n');

// ── 1. HTML structure ──────────────────────────────────────────

console.log('HTML — #error-section structure:');

assert(
  '#error-section exists in index.html',
  indexHtml.includes('id="error-section"')
);

assert(
  '#error-section is hidden by default (display:none)',
  /id="error-section"[^>]*style="display:none"/.test(indexHtml) ||
  /style="display:none"[^>]*id="error-section"/.test(indexHtml)
);

assert(
  '#error-message element exists inside #error-section',
  (() => {
    // Check that #error-message appears after #error-section opening tag
    const secIdx = indexHtml.indexOf('id="error-section"');
    const msgIdx = indexHtml.indexOf('id="error-message"');
    // Also verify #error-message is inside the section (before </section>)
    const closeSec = indexHtml.indexOf('</section>', secIdx);
    return secIdx !== -1 && msgIdx !== -1 && msgIdx > secIdx && msgIdx < closeSec;
  })()
);

assert(
  'Dismiss button exists in #error-section',
  (() => {
    const secIdx = indexHtml.indexOf('id="error-section"');
    const closeSec = indexHtml.indexOf('</section>', secIdx);
    const sectionHtml = indexHtml.slice(secIdx, closeSec);
    return /id="error-dismiss-btn"/.test(sectionHtml) || /error-dismiss/.test(sectionHtml);
  })()
);

assert(
  'Dismiss button calls hideError()',
  (() => {
    const secIdx = indexHtml.indexOf('id="error-section"');
    const closeSec = indexHtml.indexOf('</section>', secIdx);
    const sectionHtml = indexHtml.slice(secIdx, closeSec);
    return sectionHtml.includes('hideError()');
  })()
);

// ── 2. CSS — error card styles ─────────────────────────────────

console.log('\nCSS — error card styling:');

assert(
  '#error-section or .error-card defined in styles.css',
  stylesCss.includes('#error-section') || stylesCss.includes('.error-card')
);

assert(
  'Error card uses --color-error variable for border',
  (() => {
    // Look for border property using --color-error near error-card or error-section
    const hasErrorBorder = /border[^;]*var\(--color-error\)/.test(stylesCss);
    return hasErrorBorder;
  })()
);

assert(
  'border-radius applied to error card',
  (() => {
    // Check styles around error-card or error-section contain border-radius
    const idx = stylesCss.indexOf('.error-card');
    if (idx === -1) return false;
    const block = stylesCss.slice(idx, stylesCss.indexOf('}', idx));
    return block.includes('border-radius');
  })()
);

// ── 3. app.js — showError / hideError functions ────────────────

console.log('\napp.js — showError / hideError:');

assert(
  'showError function is defined',
  /function showError\s*\(/.test(appJs)
);

assert(
  'hideError function is defined',
  /function hideError\s*\(/.test(appJs)
);

assert(
  'showError has JSDoc comment',
  (() => {
    const idx = appJs.indexOf('function showError(');
    if (idx === -1) return false;
    const before = appJs.slice(Math.max(0, idx - 300), idx);
    return before.includes('@param') && before.includes('* ');
  })()
);

assert(
  'hideError has JSDoc comment',
  (() => {
    const idx = appJs.indexOf('function hideError(');
    if (idx === -1) return false;
    const before = appJs.slice(Math.max(0, idx - 300), idx);
    return before.includes('* ');
  })()
);

assert(
  'showError references #error-section',
  (() => {
    const idx = appJs.indexOf('function showError(');
    if (idx === -1) return false;
    const body = appJs.slice(idx, appJs.indexOf('\n}', idx) + 2);
    return body.includes('error-section');
  })()
);

assert(
  'hideError references #error-section',
  (() => {
    const idx = appJs.indexOf('function hideError(');
    if (idx === -1) return false;
    const body = appJs.slice(idx, appJs.indexOf('\n}', idx) + 2);
    return body.includes('error-section');
  })()
);

// ── 4. Turkish error message strings ──────────────────────────

console.log('\napp.js — Turkish error message strings:');

const turkishMessages = [
  {
    name: 'ERR_NO_FILE — no file selected',
    text: 'Lütfen önce bir ayakkabı fotoğrafı seçin.',
  },
  {
    name: 'ERR_NO_API_KEY — no API key',
    text: 'Lütfen Claude API anahtarınızı girin.',
  },
  {
    name: 'ERR_UNAUTHORIZED — HTTP 401',
    text: 'API anahtarı geçersiz',
  },
  {
    name: 'ERR_RATE_LIMIT — HTTP 429',
    text: 'İstek limiti aşıldı',
  },
  {
    name: 'ERR_SERVER — HTTP 500+',
    text: 'Claude API geçici bir hata döndürdü',
  },
  {
    name: 'ERR_NETWORK — fetch failure',
    text: 'Ağ bağlantısı hatası',
  },
  {
    name: 'ERR_JSON — JSON parse error',
    text: 'Yanıt işlenirken hata oluştu',
  },
];

turkishMessages.forEach(({ name, text }) => {
  assert(`"${text}" defined in app.js`, appJs.includes(text));
});

const distinctCount = turkishMessages.filter(({ text }) => appJs.includes(text)).length;
assert(
  `At least 6 distinct Turkish error message strings defined (found ${distinctCount})`,
  distinctCount >= 6
);

// ── 5. HTTP 401 mapping ────────────────────────────────────────

console.log('\napp.js — HTTP error code mapping:');

assert(
  'HTTP 401 maps to ERR_UNAUTHORIZED (API anahtarı geçersiz...)',
  (() => {
    // Look for pattern: err.status === 401 followed by ERR_UNAUTHORIZED or the message text
    return /401[\s\S]{0,200}API anahtarı geçersiz/.test(appJs) ||
           /err\.status === 401[\s\S]{0,100}ERR_UNAUTHORIZED/.test(appJs);
  })()
);

assert(
  'HTTP 429 maps to ERR_RATE_LIMIT',
  (() => {
    return /429[\s\S]{0,200}İstek limiti aşıldı/.test(appJs) ||
           /err\.status === 429[\s\S]{0,100}ERR_RATE_LIMIT/.test(appJs);
  })()
);

assert(
  'HTTP 500+ maps to ERR_SERVER',
  (() => {
    return />=\s*500[\s\S]{0,200}Claude API geçici/.test(appJs) ||
           /err\.status >= 500[\s\S]{0,100}ERR_SERVER/.test(appJs);
  })()
);

// ── 6. showError called in catch block ────────────────────────

console.log('\napp.js — error flow integration:');

assert(
  'showError called in catch block',
  (() => {
    const catchIdx = appJs.indexOf('} catch (err)');
    if (catchIdx === -1) return false;
    const catchBlock = appJs.slice(catchIdx, appJs.indexOf('} finally', catchIdx));
    return catchBlock.includes('showError(');
  })()
);

assert(
  'hideError called when starting new analysis',
  appJs.includes('hideError()')
);

// ── Summary ───────────────────────────────────────────────────

console.log(`\n── Results: ${passed} passed, ${failed} failed ──\n`);

if (failed > 0) {
  process.exit(1);
}
