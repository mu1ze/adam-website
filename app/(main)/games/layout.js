const SITE_URL = process.env.SITE_URL || 'https://adam.dvlli.com';

export const metadata = {
  title: 'Games — ADAM OS',
  description: 'Play arcade classics — Pong, Snake, Tetris, Space Invaders, Flappy Bird, and 2048. Track scores, earn achievements, and compete on the leaderboard.',
  openGraph: {
    title: 'Games — ADAM OS',
    description: 'Play arcade classics — Pong, Snake, Tetris, Space Invaders, Flappy Bird, and 2048.',
    images: [{ url: `${SITE_URL}/api/og?title=Games`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Games — ADAM OS',
    description: 'Play arcade classics — Pong, Snake, Tetris, Space Invaders, Flappy Bird, and 2048.',
    images: [`${SITE_URL}/api/og?title=Games`],
  },
};

export default function GamesLayout({ children }) {
  return <>{children}</>;
}
