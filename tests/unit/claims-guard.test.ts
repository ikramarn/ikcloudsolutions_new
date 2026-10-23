import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pricingConfig, type PricingConfig } from '@/config/pricing';
import { derivableFigures, extractGuardableText, underivableFigures } from './claims-guard.html';
import { STRICT_ALLOWLIST } from './claims-guard.config';
import { RULES, type GuardRule } from './claims-guard.rules';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// ---------------------------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------------------------

interface SourceFile {
  path: string;
  content: string;
}

interface Violation {
  ruleId: string;
  path: string;
  line: number;
  snippet: string;
}

function globToRegExp(glob: string): RegExp {
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

function matchesAny(filePath: string, globs: readonly string[]): boolean {
  return globs.some((glob) => globToRegExp(glob).test(filePath));
}

/** Applies the rules that cover `scope` to (path, content) pairs. */
function findViolations(
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

const SKIP_DIRS = new Set(['node_modules', '.next', '.git', '.worktrees', 'legacy', 'coverage']);
const TEXT_EXT = new Set([
  '.ts',
  '.tsx',
  '.js',
  '.mjs',
  '.cjs',
  '.css',
  '.mdx',
  '.md',
  '.json',
  '.txt',
  '.xml',
  '.html',
  '.svg',
  '.webmanifest',
  '.yml',
  '.yaml',
]);

function walk(relativeDir: string, into: string[] = []): string[] {
  const absolute = path.join(root, relativeDir);
  if (!fs.existsSync(absolute)) return into;
  for (const entry of fs.readdirSync(absolute, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(path.posix.join(relativeDir, entry.name), into);
    } else {
      into.push(path.posix.join(relativeDir, entry.name));
    }
  }
  return into;
}

function readTextFiles(paths: readonly string[]): SourceFile[] {
  return paths
    .filter((file) => TEXT_EXT.has(path.extname(file).toLowerCase()))
    .map((file) => ({ path: file, content: fs.readFileSync(path.join(root, file), 'utf8') }));
}

/** src/**, public text files, docs/** and README.md. legacy/** is excluded by walk(). */
function sourceFiles(): SourceFile[] {
  const paths = [...walk('src'), ...walk('public'), ...walk('docs')];
  if (fs.existsSync(path.join(root, 'README.md'))) paths.push('README.md');
  return readTextFiles(paths);
}

function findDeadAllows(rules: readonly GuardRule[], existing: readonly string[]): string[] {
  const dead: string[] = [];
  for (const rule of rules) {
    for (const glob of rule.allow) {
      if (glob.startsWith('tests/')) continue;
      const matcher = globToRegExp(glob);
      if (!existing.some((file) => matcher.test(file))) dead.push(`${rule.id}: ${glob}`);
    }
  }
  return dead;
}

/** Warns while the allow-list is not strict; fails once it is. */
function checkDeadAllows(
  dead: readonly string[],
  strict: boolean,
  warn: (message: string) => void,
): void {
  if (dead.length === 0) return;
  const message = `claims-guard: allow-list entries match no file: ${dead.join(', ')}`;
  if (strict) throw new Error(message);
  warn(message);
}

function findUnverifiedImports(files: readonly SourceFile[]): string[] {
  const pattern = /(?:\bfrom\s*|\bimport\s*\(?\s*|\brequire\s*\(\s*)['"][^'"]*_unverified-content/;
  return files.filter((file) => pattern.test(file.content)).map((file) => file.path);
}

// ---------------------------------------------------------------------------------------------
// Self-test: every rule matches its known-bad fixture and none matches the known-good ones.
// ---------------------------------------------------------------------------------------------

const KNOWN_BAD: readonly (readonly [ruleId: string, fixture: string])[] = [
  ['proto-logos', 'APEX DYNAMICS'],
  ['proto-logos', 'KINETIX LABS'],
  ['proto-logos', 'HYPERION'],
  ['proto-logos', 'VEKTOR CORE'],
  ['proto-logos', 'LUMINA TECH'],
  ['legacy-people', 'Marcus Vance'],
  ['legacy-people', 'Elena Rostova'],
  ['legacy-people', 'David MacLeod'],
  ['legacy-people', 'Aisha Rahman'],
  ['legacy-people', 'Priya Menon'],
  ['latency-claims', '24ms'],
  ['latency-claims', '28ms'],
  ['latency-claims', '21ms'],
  ['latency-claims', '380ms'],
  ['latency-claims', 'Zero Latency'],
  ['uptime-and-volume', '99.98%'],
  ['uptime-and-volume', '4.8M+'],
  ['uptime-and-volume', 'PCI-Level 1'],
  ['usd', '$299.00 USD'],
  ['card-input', 'autocomplete="cc-number"'],
  ['auth-remnants', '<input type="password"'],
  ['auth-remnants', 'DEFAULT_ACCOUNTS'],
  ['auth-remnants', 'ikram@ikcloudsolutions.com'],
  ['uk-only', 'Dubai'],
  ['trust-claims', 'Trusted by'],
  ['price-literals', '£79 a month'],
  ['pence-and-allowance-literals', '20p per minute'],
  ['pence-and-allowance-literals', '200 voice minutes'],
  ['pence-and-allowance-literals', '10% off'],
  ['vat-phrases', 'plus VAT'],
  ['vat-phrases', '+ VAT'],
];

const KNOWN_GOOD: readonly (readonly [path: string, fixture: string])[] = [
  ['src/app/globals.css', 'transition: opacity 150ms ease'],
  ['src/example.tsx', 'Voice minutes'],
  ['src/example.tsx', 'Hyperlink'],
  ['src/example.tsx', 'const delayMs = 400;'],
  ['src/example.tsx', 'Indian ink and a pointless pointer'],
  [
    'src/example.tsx',
    'We offer guidance, not a guarantee-free zone'.replace('guarantee-free', 'plan'),
  ],
  ['src/example.tsx', 'const money = price.toFixed(2)'],
];

// usd and uk-only are case-sensitive on purpose; price-literals has no letters to fold.
const CASE_SENSITIVE = new Set(['usd', 'uk-only', 'price-literals']);

describe('claims-guard self-test', () => {
  it('has a known-bad fixture for every rule', () => {
    const covered = new Set(KNOWN_BAD.map(([id]) => id));
    expect(RULES.filter((rule) => !covered.has(rule.id)).map((rule) => rule.id)).toEqual([]);
  });

  it.each(KNOWN_BAD)('rule %s matches its known-bad fixture: %s', (ruleId, fixture) => {
    const rule = RULES.find((candidate) => candidate.id === ruleId);
    expect(rule, `rule ${ruleId} exists`).toBeDefined();
    expect(rule!.re.test(fixture)).toBe(true);
    // Through the real pipeline at a path that is on no allow-list.
    const hits = findViolations([{ path: 'src/example.tsx', content: fixture }]);
    expect(hits.map((hit) => hit.ruleId)).toContain(ruleId);
  });

  it.each(KNOWN_GOOD)('no rule matches the known-good fixture in %s: %s', (file, fixture) => {
    expect(findViolations([{ path: file, content: fixture }])).toEqual([]);
  });

  it('honours allow-lists and excluded extensions', () => {
    const archive = findViolations([
      { path: 'src/data/_unverified-content.ts', content: 'APEX DYNAMICS 24ms $299' },
    ]);
    expect(archive).toEqual([]);
    expect(findViolations([{ path: 'src/lib/money.ts', content: 'Starter is £79 + VAT' }])).toEqual(
      [],
    );
    expect(findViolations([{ path: 'src/lib/pricing/index.ts', content: 'returns £79' }])).toEqual(
      [],
    );
    expect(findViolations([{ path: 'src/x.css', content: 'transition: all 24ms' }])).toEqual([]);
    expect(findViolations([{ path: 'src/x.tsx', content: 'transition: all 24ms' }])).not.toEqual(
      [],
    );
  });

  it('reports the line and snippet of a violation', () => {
    const [hit] = findViolations([{ path: 'src/a.ts', content: 'ok\nTrusted by everyone' }]);
    expect(hit).toMatchObject({ ruleId: 'trust-claims', path: 'src/a.ts', line: 2 });
  });

  it('keeps every rule case-insensitive except the proper-noun rules', () => {
    for (const rule of RULES) {
      if (CASE_SENSITIVE.has(rule.id)) expect(rule.re.flags).not.toContain('i');
      else expect(rule.re.flags).toContain('i');
      expect(rule.re.flags).not.toContain('g');
    }
  });
});

// ---------------------------------------------------------------------------------------------
// Built-HTML text extraction (amendment A2)
// ---------------------------------------------------------------------------------------------

describe('extractGuardableText', () => {
  const page = (body: string, head = '') =>
    `<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`;

  it('drops RSC flight data and the usd rule does not match what is left', () => {
    const html = page(
      [
        '<p>Hello there</p>',
        '<script>self.__next_f.push([1,"1:\\"$Sreact.fragment\\"\\n"])</script>',
        '<script>self.__next_f.push([1,"$1"])</script>',
        '<script>self.__next_f.push([1,"$L2"])</script>',
        '<script>self.__next_f.push([1,"$undefined"])</script>',
      ].join(''),
    );
    const text = extractGuardableText(html);
    expect(text).toBe('Hello there');
    expect(text).not.toMatch(/\$1|\$L2|\$undefined|Sreact/);
    const usd = RULES.find((rule) => rule.id === 'usd')!;
    expect(usd.re.test(text)).toBe(false);
  });

  it('drops bare flight pushes that are not inside a script tag', () => {
    const text = extractGuardableText(
      'Visible self.__next_f.push([1,"1:\\"$Sreact.fragment\\"\\n"]) text',
    );
    expect(text).toBe('Visible text');
  });

  it('still catches a visible $299', () => {
    const text = extractGuardableText(page('<p>Only $299 a month</p>'));
    const usd = RULES.find((rule) => rule.id === 'usd')!;
    expect(usd.re.test(text)).toBe(true);
    const hits = findViolations([{ path: 'page.html', content: text }], RULES, 'built-html');
    expect(hits.map((hit) => hit.ruleId)).toContain('usd');
  });

  it('keeps title, meta content and JSON-LD strings', () => {
    const text = extractGuardableText(
      page(
        '<h1>Heading</h1>',
        [
          '<title>Page &amp; Title</title>',
          '<meta name="description" content="A description with 99.99% claims">',
          "<meta property='og:title' content='OG title'>",
          '<script type="application/ld+json">{"@type":"Offer","name":"Starter","price":"79.00","nested":{"text":"Nested answer"}}</script>',
        ].join(''),
      ),
    );
    expect(text).toContain('Page & Title');
    expect(text).toContain('A description with 99.99% claims');
    expect(text).toContain('OG title');
    expect(text).toContain('Starter');
    expect(text).toContain('Nested answer');
    expect(text).toContain('Heading');
  });

  it('drops styles, noscript, comments and non-JSON-LD scripts', () => {
    const text = extractGuardableText(
      page(
        '<style>.a{transition:all 24ms}</style><noscript>No JS 380ms</noscript><!-- 28ms --><script>var x = "21ms";</script><p>Real text</p>',
      ),
    );
    expect(text).toBe('Real text');
  });

  it('survives malformed JSON-LD without hiding visible text', () => {
    const text = extractGuardableText(
      page('<script type="application/ld+json">{oops</script><p>Visible</p>'),
    );
    expect(text).toContain('Visible');
  });
});

describe('derivable figures (pence-and-allowance-literals in built HTML)', () => {
  const rule = RULES.find((candidate) => candidate.id === 'pence-and-allowance-literals')!;
  const withMode = (mode: 'exclusive' | 'inclusive'): PricingConfig => ({
    ...pricingConfig,
    vat: { mode, ratePercent: 20 },
  });

  it('contains allowances, overage forms and the annual discount only', () => {
    const figures = derivableFigures(pricingConfig);
    for (const expected of ['200', '1000', '500', '5000', '1200', '12000', '20', '2', '10']) {
      expect(figures.has(expected), expected).toBe(true);
    }
    for (const unexpected of ['250', '79', '5', '24']) {
      expect(figures.has(unexpected), unexpected).toBe(false);
    }
  });

  it('follows the VAT mode for overage rates', () => {
    expect(derivableFigures(withMode('inclusive')).has('24')).toBe(true);
    expect(derivableFigures(withMode('exclusive')).has('24')).toBe(false);
  });

  it('accepts figures the pricing page legitimately prints', () => {
    const text =
      'Starter includes 200 voice minutes and 1,000 AI WhatsApp replies. Extra minutes cost 20p per minute. Save 10% off.';
    expect(underivableFigures(text, rule.re)).toEqual([]);
  });

  it('flags a hand-edited allowance or rate', () => {
    expect(underivableFigures('Now with 250 voice minutes', rule.re)).toEqual([
      '250 voice minutes',
    ]);
    expect(underivableFigures('Only 15p per minute', rule.re)).toEqual(['15p per minute']);
    expect(underivableFigures('Save 25% off', rule.re)).toEqual(['25% off']);
  });
});

// ---------------------------------------------------------------------------------------------
// The real scans
// ---------------------------------------------------------------------------------------------

describe('claims-guard source scan', () => {
  it('finds no violations in src, public text files, docs and README', () => {
    const violations = findViolations(sourceFiles());
    expect(violations.map((v) => `${v.ruleId} ${v.path}:${v.line} ${v.snippet}`)).toEqual([]);
  });

  it('does not scan legacy/**', () => {
    expect(walk('.').some((file) => file.startsWith('legacy/'))).toBe(false);
  });
});

describe('claims-guard dead allow-list entries', () => {
  const synthetic: GuardRule = {
    id: 'synthetic',
    re: /x/,
    scope: 'source',
    allow: ['src/exists.ts', 'src/missing.ts', 'tests/**'],
    why: 'test',
  };

  it('finds globs that match no file and ignores tests/** globs', () => {
    expect(findDeadAllows([synthetic], ['src/exists.ts'])).toEqual(['synthetic: src/missing.ts']);
  });

  it('only warns while STRICT_ALLOWLIST is false and fails when it is true', () => {
    const warn = vi.fn();
    checkDeadAllows(['synthetic: src/missing.ts'], false, warn);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(() => checkDeadAllows(['synthetic: src/missing.ts'], true, warn)).toThrow(
      /match no file/,
    );
    expect(() => checkDeadAllows([], true, warn)).not.toThrow();
  });

  it('checks the real rules (non-blocking until STRICT_ALLOWLIST is true)', () => {
    const existing = [...walk('src'), ...walk('public'), ...walk('docs'), ...walk('tests')];
    if (fs.existsSync(path.join(root, 'README.md'))) existing.push('README.md');
    checkDeadAllows(findDeadAllows(RULES, existing), STRICT_ALLOWLIST, (message) =>
      console.warn(message),
    );
  });
});

describe('_unverified-content isolation', () => {
  it('flags an import of the archive', () => {
    const bad: SourceFile[] = [
      { path: 'a.ts', content: "import { removedContent } from '@/data/_unverified-content';" },
      { path: 'b.ts', content: "const m = await import('../data/_unverified-content');" },
      { path: 'c.ts', content: "import x from './ok';" },
    ];
    expect(findUnverifiedImports(bad)).toEqual(['a.ts', 'b.ts']);
  });

  it('is not imported by any module', () => {
    const files = readTextFiles([...walk('src'), ...walk('tests')]).filter(
      (file) => !file.path.startsWith('tests/unit/claims-guard'),
    );
    expect(findUnverifiedImports(files)).toEqual([]);
  });
});
