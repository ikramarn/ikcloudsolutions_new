import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function listFiles(relativeDir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(path.join(root, relativeDir), { withFileTypes: true })) {
    const relative = path.posix.join(relativeDir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(relative));
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(relative);
  }
  return out;
}

describe('server-only boundary', () => {
  it('stubs server-only for tests with an empty export', () => {
    const stub = path.join(root, 'tests/stubs/server-only.ts');
    expect(fs.existsSync(stub)).toBe(true);
    expect(fs.readFileSync(stub, 'utf8').trim()).toBe('export {};');
  });

  it('aliases server-only to the stub in the Vitest config', () => {
    const config = fs.readFileSync(path.join(root, 'vitest.config.ts'), 'utf8');
    expect(config).toMatch(
      /'server-only':\s*path\.resolve\(root, 'tests\/stubs\/server-only\.ts'\)/,
    );
  });

  it("starts every file under src/lib/server with import 'server-only'", () => {
    const files = listFiles('src/lib/server');
    expect(files.length).toBeGreaterThan(10);
    const missing = files.filter((file) => {
      const firstCode = fs
        .readFileSync(path.join(root, file), 'utf8')
        .split(/\r?\n/)
        .find((line) => line.trim() !== '' && !line.trim().startsWith('//'));
      return firstCode?.trim() !== "import 'server-only';";
    });
    expect(missing).toEqual([]);
  });

  it('does not import src/lib/server from client components', () => {
    const offenders = listFiles('src')
      .filter((file) => !file.startsWith('src/lib/server/') && !file.startsWith('src/app/api/'))
      .filter((file) =>
        /from\s+['"]@\/lib\/server\//.test(fs.readFileSync(path.join(root, file), 'utf8')),
      );
    expect(offenders).toEqual([]);
  });
});
