import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const EXPECTED = [
  'RESEND_API_KEY',
  'LEAD_TO_EMAIL',
  'LEAD_FROM_EMAIL',
  'TURNSTILE_SECRET_KEY',
  'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_APP_URL',
] as const;

const lines = fs
  .readFileSync(path.join(root, '.env.example'), 'utf8')
  .split(/\r?\n/)
  .filter((line) => line.trim() !== '' && !line.trim().startsWith('#'));

describe('.env.example', () => {
  it('lists exactly the seven variable names, in order', () => {
    expect(lines.map((line) => line.split('=')[0])).toEqual([...EXPECTED]);
  });

  it('has no values, so no secret can be committed through it', () => {
    for (const line of lines) {
      expect(line, line).toMatch(/^[A-Z][A-Z0-9_]*=$/);
    }
  });

  it('is not ignored by git (names only, safe to commit)', () => {
    const gitignore = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
    expect(gitignore).toMatch(/^!\.env\.example$/m);
  });
});
