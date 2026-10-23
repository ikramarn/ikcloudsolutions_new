import { ImageResponse } from 'next/og';
import { siteConfig } from '@/config/site';

const OG_SIZE = { width: 1200, height: 630 } as const;

export interface OgTemplateInput {
  title: string;
  tagline: string;
  /** TTF data for Plus Jakarta Sans ExtraBold. */
  fontData: ArrayBuffer;
}

const CloudMark = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"
      stroke="#67e8f9"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** The 1200x630 social card. Satori needs display:flex on every element with several children. */
export function renderOgCard({ title, tagline, fontData }: OgTemplateInput): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 80px',
        color: '#ffffff',
        fontFamily: 'Plus Jakarta Sans',
        fontWeight: 800,
        backgroundColor: '#07090e',
        backgroundImage:
          'radial-gradient(circle at 85% 10%, rgba(0,242,254,0.28), rgba(7,9,14,0) 55%), linear-gradient(135deg, #07090e, #0c111d)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            borderRadius: 18,
            backgroundColor: '#020617',
            border: '3px solid #22d3ee',
          }}
        >
          <CloudMark size={44} />
        </div>
        <div style={{ display: 'flex', marginLeft: 24, fontSize: 34, letterSpacing: 1 }}>
          <span>IK CLOUD&nbsp;</span>
          <span style={{ color: '#67e8f9' }}>SOLUTIONS</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 76, lineHeight: 1.1, maxWidth: 1000 }}>
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 34,
            color: '#cbd5e1',
            maxWidth: 980,
          }}
        >
          {tagline}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', width: 180, height: 8, backgroundColor: '#00f2fe' }} />
        <div style={{ display: 'flex', fontSize: 26, color: '#94a3b8' }}>
          {siteConfig.address.locality}, Scotland
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [{ name: 'Plus Jakarta Sans', data: fontData, weight: 800, style: 'normal' }],
    },
  );
}
