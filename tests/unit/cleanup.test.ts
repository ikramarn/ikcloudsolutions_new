import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// FR-G1: nothing from the old Vite and PHP site may remain in the repository.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SKIP = new Set(['node_modules', '.git', '.worktrees', 'coverage', 'playwright-report']);

function walk(dir: string, into: string[] = []): string[] {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    // Generated output (.next, .next-turnstile, test-results) is not part of the source tree.
    if (SKIP.has(entry.name) || entry.name.startsWith('.next') || entry.name === 'test-results') {
      continue;
    }
    const relative = path.posix.join(dir, entry.name);
    if (entry.isDirectory()) walk(relative, into);
    else into.push(relative);
  }
  return into;
}

const exists = (relative: string) => fs.existsSync(path.join(root, relative));

describe('legacy cleanup (FR-G1)', () => {
  it('has no legacy directory', () => {
    expect(exists('legacy')).toBe(false);
  });

  it.each([
    'vite.config.js',
    'index.html',
    'src/App.css',
    'src/App.jsx',
    'src/main.jsx',
    'src/index.css',
    'public/icons.svg',
    'public/contact.php',
    'public/.htaccess',
    '.oxlintrc.json',
  ])('does not contain %s', (file) => {
    expect(exists(file)).toBe(false);
  });

  it('keeps only the fonts under src/assets', () => {
    const assets = walk('src/assets').filter((file) => !file.startsWith('src/assets/fonts/'));
    expect(assets).toEqual([]);
  });

  it('contains no PHP, .htaccess or JSX files anywhere', () => {
    const offenders = walk('.').filter(
      (file) => /\.(php|jsx)$/i.test(file) || path.posix.basename(file) === '.htaccess',
    );
    expect(offenders).toEqual([]);
  });

  it('no longer references the legacy tree in tooling config', () => {
    for (const config of [
      'eslint.config.mjs',
      '.prettierignore',
      'knip.json',
      'tsconfig.json',
      'next.config.ts',
    ]) {
      expect(fs.readFileSync(path.join(root, config), 'utf8'), config).not.toMatch(/\blegacy\b/);
    }
  });
});
