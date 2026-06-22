import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { getTrendingBundle } from '@/lib/trendingCache';

export async function GET(request) {
  const rl = await rateLimit(request, { limit: 30, windowMs: 60_000, keyPrefix: 'trending' });
  if (rl) return rl;

  try {
    const bundle = await getTrendingBundle();
    return NextResponse.json({
      success: true,
      dayKey: bundle.dayKey,
      trending: {
        names: bundle.names,
        memeOfTheDay: bundle.memeOfTheDay,
        vibe: bundle.vibe,
        crossover: bundle.crossover,
        rawTitles: bundle.rawTitles,
      },
      difficulty: bundle.difficulty,
      usedFallback: bundle.usedFallback,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e?.message || 'trending-fetch-failed' }, { status: 500 });
  }
}
