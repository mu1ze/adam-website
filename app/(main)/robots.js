export default function robots() {
  const baseUrl = process.env.SITE_URL || 'https://adam.dvlli.com';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
