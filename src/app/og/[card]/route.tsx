import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { OG_CARD_IDS, isOgCardId, ogCards, resolveOgTagline } from '@/content/og';
import { renderOgCard } from '@/lib/og/template';

// Each card is rendered once at build time and served as a static PNG at /og/<card>.
export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return OG_CARD_IDS.map((card) => ({ card }));
}

async function loadFont(): Promise<ArrayBuffer> {
  const file = await readFile(
    join(process.cwd(), 'src', 'assets', 'fonts', 'PlusJakartaSans-ExtraBold.ttf'),
  );
  return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
}

export async function GET(_request: Request, context: { params: Promise<{ card: string }> }) {
  const { card } = await context.params;
  if (!isOgCardId(card)) return new Response('Not found', { status: 404 });
  const definition = ogCards[card];
  return renderOgCard({
    title: definition.title,
    tagline: resolveOgTagline(definition),
    fontData: await loadFont(),
  });
}
