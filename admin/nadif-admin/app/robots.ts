import type { MetadataRoute } from 'next';
import { SITE_INFO } from './lib/site-info';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // The admin back office and its login page must stay out of search results.
      disallow: ['/admin', '/login'],
    },
    sitemap: `${SITE_INFO.siteUrl}/sitemap.xml`,
  };
}
