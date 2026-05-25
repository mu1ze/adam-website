export default function GameStructuredData({ name, description, url }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name,
    description,
    url,
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web',
    playMode: 'SinglePlayer',
    gamePlatform: 'Web browser',
    producer: {
      '@type': 'Organization',
      name: 'ADAM OS',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
