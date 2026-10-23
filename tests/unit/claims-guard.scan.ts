import path from 'node:path';
import { RULES, type GuardRule } from './claims-guard.rules';

// The scanning engine shared by the Vitest source scan (claims-guard.test.ts) and the Playwright
// built-HTML pass (tests/e2e/claims-guard.spec.ts), so both apply the same rules the same way.

export interface SourceFile {
  path: string;
  content: string;
}

export interface Violation {
  ruleId: string;
  path: string;
  line: number;
  snippet: string;
}

export function globToRegExp(glob: string): RegExp {
  let pattern = '';
  for (let i = 0; i < glob.length; i += 1) {
    const char = glob.charAt(i);
    if (char === '*' && glob.charAt(i + 1) === '*') {
      if (glob.charAt(i + 2) === '/') {
        pattern += '(?:.*/)?';
        i += 2;
      } else {
        pattern += '.*';
        i += 1;
      }
    } else if (char === '*') pattern += '[^/]*';
    else if (char === '?') pattern += '[^/]';
    else pattern += char.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${pattern}$`);
}

export function matchesAny(filePath: string, globs: readonly string[]): boolean {
  return globs.some((glob) => globToRegExp(glob).test(filePath));
}

/** Applies the rules that cover `scope` to (path, content) pairs. */
export function findViolations(
  files: readonly SourceFile[],
  rules: readonly GuardRule[] = RULES,
  scope: 'source' | 'built-html' = 'source',
): Violation[] {
  const found: Violation[] = [];
  for (const file of files) {
    const ext = path.extname(file.path).toLowerCase();
    for (const rule of rules) {
      if (rule.scope !== scope && rule.scope !== 'both') continue;
      if (rule.excludeExt?.includes(ext)) continue;
      if (matchesAny(file.path, rule.allow)) continue;
      const lines = file.content.split(/\r?\n/);
      lines.forEach((text, index) => {
        if (rule.re.test(text)) {
          found.push({
            ruleId: rule.id,
            path: file.path,
            line: index + 1,
            snippet: text.trim().slice(0, 120),
          });
        }
      });
    }
  }
  return found;
}
