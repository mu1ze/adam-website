import { skills } from '@/data/skills';
import { plugins } from '@/data/plugins';

export default function sitemap() {
  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const today = new Date().toISOString();

  const staticRoutes = [
    { url: '/', lastModified: today, changeFrequency: 'weekly', priority: 1.0 },
    { url: '/skills', lastModified: today, changeFrequency: 'weekly', priority: 0.9 },
    { url: '/plugins', lastModified: today, changeFrequency: 'weekly', priority: 0.9 },
    { url: '/games', lastModified: today, changeFrequency: 'daily', priority: 0.9 },
    { url: '/games/pong', lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
    { url: '/games/snake', lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
    { url: '/games/space-invaders', lastModified: today, changeFrequency: 'weekly', priority: 0.8 },
    { url: '/terminal', lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: '/docs', lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
    { url: '/ask-adam', lastModified: today, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const skillRoutes = skills.map(skill => ({
    url: `/skills/${skill.slug}`,
    lastModified: today,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const pluginRoutes = plugins.map(plugin => ({
    url: `/plugins/${plugin.slug}`,
    lastModified: today,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...skillRoutes, ...pluginRoutes].map(route => ({
    ...route,
    url: `${baseUrl}${route.url}`,
  }));
}
