import { serializeJsonLd } from '@/lib/seo/jsonld';

/** Renders structured data. `<` is escaped in serializeJsonLd to prevent script-tag breakout. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
