import { NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { getTrendingBundle } from '@/lib/trendingCache';

export async function GET(request) {
  const rl = rateLimit(request, { limit: 30, windowMs: 60_000, keyPrefix: 'trending' });
  if (rl) return rl;

  try {
    const bundle = await getTrendingBundle();
    return NextResponse.json({
      success: true,
      dayKey: bundle.dayKey,
      trending: {
        topics: bundle.topics,
        memeOfTheDay: bundle.memeOfTheDay,
        headline: bundle.headline,
        controversialFigure: bundle.controversialFigure,
      },
      difficulty: bundle.difficulty,
      usedFallback: bundle.usedFallback,
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: e?.message || 'trending-fetch-failed' }, { status: 500 });
  }
}
