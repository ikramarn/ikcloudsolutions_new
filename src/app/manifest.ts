import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

// Not an installable app: display stays "browser". The manifest only supplies names and colours.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: 'IK Cloud',
    description: siteConfig.tagline,
    start_url: '/',
    display: 'browser',
    background_color: '#07090e',
    theme_color: '#07090e',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
