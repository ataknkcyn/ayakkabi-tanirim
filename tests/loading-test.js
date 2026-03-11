// tests/loading-test.js
// US-007: Loading animation during API call
// Tests run with: node tests/loading-test.js (Node.js ESM, no browser runtime)

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const html     = readFileSync(resolve(ROOT, 'index.html'), 'utf8');
const appJs    = readFileSync(resolve(ROOT, 'app.js'),     'utf8');
const stylesCs = readFileSync(resolve(ROOT, 'styles.css'), 'utf8');

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

console.log('\n=== US-007: Loading Animation Tests ===\n');

/* ----------------------------------------------------------------
   index.html checks
   ---------------------------------------------------------------- */
console.log('-- index.html --');

// 1. #loading-section element exists
assert(html.includes('id="loading-section"'), '#loading-section exists in index.html');

// 2. #loading-section is hidden by default (display:none or style="display:none")
assert(
  /id="loading-section"[^>]*style="display:\s*none"/.test(html) ||
  /style="display:\s*none"[^>]*id="loading-section"/.test(html),
  '#loading-section is hidden by default (style="display:none")'
);

// 3. Spinner element inside #loading-section
assert(html.includes('class="spinner"'), 'Spinner element (.spinner) exists in index.html');

// 4. Turkish loading text
assert(
  html.includes('Ayakkabı analiz ediliyor'),
  'Turkish loading text "Ayakkabı analiz ediliyor..." present in index.html'
);

// 5. #loading-text element
assert(html.includes('id="loading-text"'), '#loading-text element exists in index.html');

/* ----------------------------------------------------------------
   styles.css checks
   ---------------------------------------------------------------- */
console.log('\n-- styles.css --');

// 6. @keyframes spin is defined
assert(stylesCs.includes('@keyframes spin'), '@keyframes spin is defined in styles.css');

// 7. @keyframes pulse is defined
assert(stylesCs.includes('@keyframes pulse'), '@keyframes pulse is defined in styles.css');

// 8. .spinner uses border-top-color: var(--color-accent) or border-top with --color-accent
assert(
  /\.spinner[\s\S]{0,200}border-top-color:\s*var\(--color-accent\)/.test(stylesCs) ||
  /\.spinner[\s\S]{0,200}border-top:\s*[^;]*var\(--color-accent\)/.test(stylesCs),
  '.spinner uses --color-accent for border-top'
);

// 9. .spinner animation uses spin
assert(
  /\.spinner[\s\S]{0,200}animation:[\s\S]{0,100}spin/.test(stylesCs),
  '.spinner has spin animation'
);

// 10. #loading-section has flex layout
assert(
  /#loading-section[\s\S]{0,300}flex-direction:\s*column/.test(stylesCs),
  '#loading-section has flex-direction: column in styles.css'
);

// 11. #loading-text has pulse animation
assert(
  /#loading-text[\s\S]{0,200}animation[\s\S]{0,100}pulse/.test(stylesCs),
  '#loading-text has pulse animation in styles.css'
);

/* ----------------------------------------------------------------
   app.js checks
   ---------------------------------------------------------------- */
console.log('\n-- app.js --');

// 12. showLoading function is defined
assert(appJs.includes('function showLoading()'), 'showLoading() function is defined in app.js');

// 13. hideLoading function is defined
assert(appJs.includes('function hideLoading()'), 'hideLoading() function is defined in app.js');

// 14. showLoading has JSDoc comment
assert(
  /\/\*\*[\s\S]{0,300}function showLoading/.test(appJs),
  'showLoading() has JSDoc comment'
);

// 15. hideLoading has JSDoc comment
assert(
  /\/\*\*[\s\S]{0,300}function hideLoading/.test(appJs),
  'hideLoading() has JSDoc comment'
);

// 16. showLoading called before fetch (before analyzeShoe call)
const analyzeShoeCallIndex = appJs.indexOf('await analyzeShoe(');
const showLoadingCallIndex  = appJs.indexOf('showLoading()');
assert(
  showLoadingCallIndex !== -1 && showLoadingCallIndex < analyzeShoeCallIndex,
  'showLoading() is called before await analyzeShoe()'
);

// 17. hideLoading called in finally block
assert(
  /finally\s*\{[\s\S]{0,200}hideLoading\(\)/.test(appJs),
  'hideLoading() is called in a finally block'
);

// 18. #loading-section is set to display:flex inside showLoading
assert(
  /showLoading[\s\S]{0,500}display.*flex/.test(appJs),
  'showLoading() sets display:flex on #loading-section'
);

// 19. #analyze-btn text changes to Turkish loading text
assert(
  appJs.includes('Analiz ediliyor...'),
  '#analyze-btn text changes to "Analiz ediliyor..." during loading'
);

// 20. analyzeBtn is disabled in showLoading
assert(
  /showLoading[\s\S]{0,500}analyzeBtn\.disabled\s*=\s*true/.test(appJs) ||
  /showLoading[\s\S]{0,500}\.disabled\s*=\s*true/.test(appJs),
  'showLoading() disables #analyze-btn'
);

/* ----------------------------------------------------------------
   Summary
   ---------------------------------------------------------------- */
console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);

if (failed > 0) {
  process.exit(1);
}
