import AchievementsClient from './AchievementsClient';

export const metadata = {
  title: 'Badge Vault — ADAM OS',
  description: 'Earn badges by playing arcade games and reaching milestones. Search any player to see their collection.',
  openGraph: {
    title: 'Badge Vault — ADAM OS',
    description: 'Earn badges by playing arcade games and reaching milestones.',
  },
  twitter: {
    title: 'Badge Vault — ADAM OS',
    description: 'Earn badges by playing arcade games and reaching milestones.',
  },
};

export default function AchievementsPage() {
  return <AchievementsClient />;
}
