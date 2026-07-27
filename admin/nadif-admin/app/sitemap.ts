import type { MetadataRoute } from 'next';
import { SITE_INFO } from './lib/site-info';

// Public pages only — /admin and /login are excluded (see robots.ts).
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_INFO.siteUrl, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_INFO.siteUrl}/support`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_INFO.siteUrl}/privacy-policy`, lastModified, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${SITE_INFO.siteUrl}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${SITE_INFO.siteUrl}/delete-account`, lastModified, changeFrequency: 'yearly', priority: 0.7 },
  ];
}
