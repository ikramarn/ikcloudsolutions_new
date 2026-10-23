// Lighthouse scores for the production build, mobile emulation, three runs per page, median per
// category. Prints a table, lists the failing audits for any category below target and exits 1 when
// a target is missed.
//
// The script starts nothing but the browser. Start the site first:
//   npm run build
//   npm run start -- -p 3100
// then run `npm run lighthouse` (needs `npx playwright install chromium`, already needed for e2e).
//
// Exit codes: 0 all targets met, 1 a target was missed, 2 the site is not running.
import { chromium } from '@playwright/test';
import lighthouse from 'lighthouse';

const BASE_URL = 'http://localhost:3100';
const PATHS = ['/', '/ai-agents'];
const RUNS = 3;
const DEBUG_PORT = 9222;
const CATEGORIES = ['performance', 'accessibility', 'best-practices', 'seo'];
const TARGETS = { performance: 90, accessibility: 90, 'best-practices': 95, seo: 95 };

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

async function isUp(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    return response.ok;
  } catch {
    return false;
  }
}

function score(lhr, category) {
  return Math.round((lhr.categories[category]?.score ?? 0) * 100);
}

/** Audits that cost points in a category (score below 1 and part of the score). */
function failingAudits(lhr, category) {
  const refs = lhr.categories[category]?.auditRefs ?? [];
  return refs
    .map((ref) => ({ ref, audit: lhr.audits[ref.id] }))
    .filter(
      ({ ref, audit }) =>
        ref.weight > 0 &&
        audit &&
        audit.score !== null &&
        audit.score < 1 &&
        audit.scoreDisplayMode !== 'notApplicable',
    )
    .map(({ audit }) => `${audit.id}: ${audit.title} (score ${Math.round(audit.score * 100)})`);
}

if (!(await isUp(`${BASE_URL}/`))) {
  console.error(
    `Nothing is answering at ${BASE_URL}/. Run "npm run build" and "npm run start -- -p 3100" first.`,
  );
  process.exit(2);
}

let failed = false;
const browser = await chromium.launch({ args: [`--remote-debugging-port=${DEBUG_PORT}`] });
try {
  const rows = [];
  for (const path of PATHS) {
    const runs = [];
    for (let run = 1; run <= RUNS; run += 1) {
      const result = await lighthouse(`${BASE_URL}${path}`, {
        port: DEBUG_PORT,
        output: 'json',
        logLevel: 'error',
        onlyCategories: CATEGORIES,
        formFactor: 'mobile',
      });
      if (!result) throw new Error(`Lighthouse returned no result for ${path}`);
      runs.push(result.lhr);
    }
    const medians = Object.fromEntries(
      CATEGORIES.map((category) => [category, median(runs.map((lhr) => score(lhr, category)))]),
    );
    rows.push({ path, medians, runs });
  }

  console.log(`\nLighthouse (mobile, median of ${RUNS} runs) against ${BASE_URL}\n`);
  console.log(['Page'.padEnd(14), ...CATEGORIES.map((category) => category.padEnd(15))].join(' '));
  for (const { path, medians } of rows) {
    console.log(
      [path.padEnd(14), ...CATEGORIES.map((category) => String(medians[category]).padEnd(15))].join(
        ' ',
      ),
    );
  }
  console.log(
    `\nTargets: ${CATEGORIES.map((category) => `${category} >= ${TARGETS[category]}`).join(', ')}`,
  );

  for (const { path, medians, runs } of rows) {
    for (const category of CATEGORIES) {
      if (medians[category] >= TARGETS[category]) continue;
      failed = true;
      console.log(`\n${path}: ${category} is ${medians[category]} (target ${TARGETS[category]})`);
      // Show the audits from the weakest run for that category.
      const weakest = [...runs].sort((a, b) => score(a, category) - score(b, category))[0];
      for (const line of failingAudits(weakest, category)) console.log(`  - ${line}`);
    }
  }
  if (!failed) console.log('\nAll targets met.');
} finally {
  await browser.close();
}

process.exit(failed ? 1 : 0);
