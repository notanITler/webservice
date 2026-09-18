import { existsSync, readFileSync } from 'node:fs';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(resolve(root, path), 'utf8');
const checkedFiles = [
  'src/pages/index.astro',
  'src/pages/impressum.astro',
  'src/pages/datenschutz.astro',
  'src/layouts/BaseLayout.astro',
  'src/components/Header.astro',
  'src/components/Faq.astro',
  'src/components/Icon.astro',
  'src/components/PriceCard.astro',
];

const sources = new Map(checkedFiles.map((path) => [path, read(path)]));
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

// Resolve every relative import, including Astro's extension-less CSS handling.
for (const [path, source] of sources) {
  for (const match of source.matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
    const candidate = resolve(root, dirname(path), match[1]);
    assert(
      existsSync(candidate) || (!extname(candidate) && existsSync(`${candidate}.astro`)),
      `${path}: import not found: ${match[1]}`,
    );
  }
}

const index = sources.get('src/pages/index.astro');
const header = sources.get('src/components/Header.astro');
const ids = new Set([...index.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
const navigation = `${index}\n${header}`;
for (const match of navigation.matchAll(/href="#([^"]+)"/g)) {
  assert(ids.has(match[1]), `Navigation target does not exist: #${match[1]}`);
}

const allSource = [...sources.values()].join('\n');
const trackingPatterns = [
  /googletagmanager/i,
  /google-analytics/i,
  /analytics\.js/i,
  /facebook\.net/i,
  /hotjar/i,
  /plausible\.io/i,
];
for (const pattern of trackingPatterns) {
  assert(!pattern.test(allSource), `Possible tracking integration found: ${pattern}`);
}

assert(index.includes('[Nachname]'), 'The surname placeholder must remain explicit.');
assert(index.includes('david@[domain].de'), 'The email placeholder must remain explicit.');
assert(
  sources.get('src/pages/impressum.astro').includes('Platzhalter – vor Veröffentlichung ersetzen'),
  'The legal notice must identify its placeholder content.',
);
assert(
  sources.get('src/pages/datenschutz.astro').includes('Platzhalter – vor Veröffentlichung rechtlich prüfen und ersetzen'),
  'The privacy notice must identify its placeholder content.',
);
assert(read('astro.config.mjs').includes("output: 'static'"), 'Astro output must remain static.');

const wrangler = JSON.parse(read('wrangler.jsonc'));
assert(wrangler.name === 'gehrke-webservice', 'Wrangler project name is missing or unexpected.');
assert(wrangler.assets?.directory === './dist', 'Wrangler assets directory must be ./dist.');
assert(!('main' in wrangler), 'A Worker main entry is not needed for this static website.');
assert(/^\d{4}-\d{2}-\d{2}$/.test(wrangler.compatibility_date), 'Wrangler compatibility_date is invalid.');

const packageJson = JSON.parse(read('package.json'));
assert(
  packageJson.scripts?.deploy === 'npm run build && wrangler deploy',
  'Deploy must build the Astro site before running Wrangler.',
);
assert(
  packageJson.scripts?.preview === 'npm run build && wrangler dev',
  'Preview must build the Astro site before running Wrangler.',
);

if (failures.length) {
  console.error(`Verification failed:\n- ${failures.join('\n- ')}`);
  process.exit(1);
}

console.log(`Verification passed: ${checkedFiles.length} source files, navigation, placeholders, imports, tracking, static output and Workers assets config checked.`);
