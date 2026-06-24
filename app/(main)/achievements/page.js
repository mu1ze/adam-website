import AchievementsClient from './AchievementsClient';

export const metadata = {
  title: 'Badge Vault — ADAM OS',
  description: 'Earn badges by playing arcade games and reaching milestones. Search any player to see their collection.',
  openGraph: {
    title: 'Badge Vault — ADAM OS',
    description: 'Earn badges by playing arcade games and reaching milestones.',
    images: [{ url: '/api/og?title=Badge+Vault&subtitle=ADAM+OS', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Badge Vault — ADAM OS',
    description: 'Earn badges by playing arcade games and reaching milestones.',
    images: ['/api/og?title=Badge+Vault&subtitle=ADAM+OS'],
  },
};

export default function AchievementsPage() {
  return <AchievementsClient />;
}
