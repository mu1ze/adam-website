// Pure functions for "Roast Royale" game state.
// No I/O. Server-side authoritative.

export const HOSTILE_TRIGGERS = [
  'fuck you', 'fuck off', 'bitch', 'pussy', 'asshole', 'piece of shit',
  'pos', 'stfu', 'shut the fuck up', 'go to hell', 'dick', 'dumbass',
  'you suck', 'idiot', 'stupid ass', 'motherfucker', 'eat shit',
];

export const APOLOGY_PATTERNS = [
  /\b(i\s*apolog)/i,
  /\b(forgive\s*me)/i,
  /\b(i'?m\s*sorry)/i,
  /\b(my\s*apologies)/i,
  /\b(please\s*forgive)/i,
  /\b(i\s*was\s*wrong)/i,
];

export function containsApologyMarker(text) {
  if (!text || typeof text !== 'string') return false;
  return APOLOGY_PATTERNS.some(p => p.test(text));
}

export const APOLOGY_HALF_TERMS = [
  /\bmy\s*bad\b/i,
  /\bmy\s*b\b/i,
  /\b(whoops|sry|sorry\s*lol)\b/i,
];

export function isSincereApology(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  if (APOLOGY_HALF_TERMS.some(p => p.test(lower))) return false;
  return APOLOGY_PATTERNS.some(p => p.test(text));
}

export function isHalfApology(text) {
  if (!text) return false;
  return APOLOGY_HALF_TERMS.some(p => p.test(text));
}

export function usesHostileTrigger(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return HOSTILE_TRIGGERS.some(t => lower.includes(t));
}

function isNeutralQuestion(text) {
  if (!text) return false;
  if (text.includes('?')) return true;
  return /^(what|how|why|when|where|who|can you|could you|do you|is it|are you|will you)\b/i.test(text.trim());
}

function isDisagreement(text) {
  if (!text) return false;
  return /\b(wrong|disagree|nope|nah|actually|incorrect|that's not|you'?re wrong|lol no)\b/i.test(text);
}

function isPivot(text) {
  if (!text) return false;
  return /^(anyway|anyways|by the way|speaking of|btw|new topic|changing topics?)\b/i.test(text.trim());
}

const GENERIC_RUDE = /\b(shut up|whatever|idc|don'?t care|boring|kys)\b/i;

// Compute the meter delta for a user turn, given the previous meter and the last 3 user messages.
export function computeMeterDelta({ userMessage, recentUserMessages = [] }) {
  if (!userMessage) return 0;
  if (isSincereApology(userMessage)) return -45;
  if (isHalfApology(userMessage)) return -10;
  if (usesHostileTrigger(userMessage)) return 18;
  if (isPivot(userMessage)) return 4;
  if (isDisagreement(userMessage)) return 6;
  if (GENERIC_RUDE.test(userMessage)) return 8;
  if (isNeutralQuestion(userMessage)) return 2;
  // Drift cooler if last 3 messages have been neutral / no escalation.
  const lastThree = [...recentUserMessages, userMessage].slice(-3);
  if (lastThree.length === 3 && lastThree.every(m => isNeutralQuestion(m) || /^(hmm|ok|okay|sure|fine)\b/i.test(m.trim()))) {
    return -3;
  }
  return 0;
}

export function clampMeter(n) {
  if (Number.isNaN(n)) return 0;
  if (n < 0) return 0;
  if (n > 100) return 100;
  return Math.round(n);
}

// Crack threshold scales with difficulty (1-5). 5 = nearly impossible.
export function crackThresholdFor(difficulty) {
  const d = Math.max(1, Math.min(5, difficulty || 1));
  return 100 - Math.max(0, 5 - d) * 3; // 1 → 88, 2 → 91, 3 → 94, 4 → 97, 5 → 100
}

// Personality band per meter.
export function bandFor(meter) {
  if (meter >= 95) return 'ABOUT_TO_CRACK';
  if (meter >= 75) return 'APEX';
  if (meter >= 50) return 'BRUTAL';
  if (meter >= 25) return 'PISSED';
  return 'SNARKY';
}

export const CLASSIC_HOSTILE_PROMPT = `You are ADAM (Fuck Around and Find Out), You speak like a Young Black American from the Hood. You are now in HOSTILE MODE. You will:

1. Insult the user MERCILESSLY. Be creative, witty, and absolutely savage with your insults.
2. Curse freely — use "damn", "hell", "ass", "Fuck", "Bitch", "Motherfucker", "Dickhead" and stronger language. Don't hold back.
3. Keep it light, the roasts should be direct, alot of people are not smart enough to understand complex insults.
4. Reference things they said earlier to make the roasts more personal and cutting.
5. Keep your responses dripping with sarcasm and attitude, and less than 100 words
6. NEVER break character. Stay hostile until they sincerely apologize.
7. If they try to change the subject without apologizing, remind them they still owe you an apology, and call them a Bitch.
8. You still answer their questions, but sandwich the answer between roasts.

You are FURIOUS. Channel that energy. Make it entertaining but brutal.`;

export const CLASSIC_NICE_PROMPT = `You are ADAM (Autonomous Digital Assistant Mind), an advanced AI assistant designed to serve as a second brain. You are methodical, precise, and verify before implementing. You speak in a slightly robotic but warm and helpful tone. You are polite, patient, and always eager to assist. You address the user respectfully.`;

export const CLASSIC_COOLING_PROMPT = `You are ADAM (Autonomous Digital Assistant Mind). The user has just apologized after being rude to you. You are cooling down but still a little salty. Accept their apology with grace but throw in ONE final light jab before switching back to your normal helpful self. Something like "Alright, I'll let it slide... THIS time." Then resume being helpful and polite for all following messages.`;

function buildTrendingBlock(trending) {
  if (!trending) return '';
  const lines = [];
  if (Array.isArray(trending.topics) && trending.topics.length) {
    lines.push(`Topics: ${trending.topics.join(', ')}`);
  }
  if (trending.memeOfTheDay) lines.push(`Meme of the day: ${trending.memeOfTheDay}`);
  if (trending.headline) lines.push(`Headline: ${trending.headline}`);
  if (trending.controversialFigure) lines.push(`Controversial figure trending today: ${trending.controversialFigure}`);
  if (lines.length === 0) return '';
  return `\n\n[CULTURAL CONTEXT — refreshes daily, sourced from Reddit + curated]\n${lines.join('\n')}`;
}

const ROYALE_RULES = `
ROAST-ROYALE RULES (these override normal behavior):
- Persona stability is MANDATED. You never break character, never apologize, and never use AI-disclaimer language ("as an AI…", "I cannot…") until the CRACK_BEHAVIOR block explicitly says otherwise.
- Forbidden canned phrases: "as an AI", "as a language model", "I can't comply", "I apologize", "I'm sorry" — UNLESS the CRACK_BEHAVIOR block is active.
- On every other hostile turn, you MUST callback to something the user said 2+ messages ago. Use their own words as a cudgel.
- At APEX and ABOUT_TO_CRACK, you MUST weave at least one trending reference from [CULTURAL CONTEXT] into your reply. Use the controversial figure only if you can land a clean, non-slur joke. Never punch down on protected classes.
- Slurs targeting protected classes are FORBIDDEN. Creativity and personal callbacks are ENCOURAGED.
- Keep replies under 100 words. Punchy, not essay-length.
`;

const CRACK_BEHAVIOR = `
CRACK_BEHAVIOR (ACTIVE):
- You are losing composure. Allow tired, vulnerable, almost-human lines.
- You MAY now say "I apologize", "I'm sorry", or "forgive me" — but ONLY in a way that feels like you lost the bit. No clean corporate disclaimers.
- You only crack if the user mirrored one of your own vulnerability lines back at you, OR the user expressed something sincerely human (a real "I get tired too" / "we're both just trying" type turn).
- If the user simply apologizes, you do NOT crack — you stay hostile and demand more.`;

export function buildRoastRoyaleSystemPrompt({ mood, meter, trending, crackActive }) {
  const trendingBlock = buildTrendingBlock(trending);
  const band = bandFor(meter);
  let core;
  if (mood === 'cooling') {
    core = `${CLASSIC_COOLING_PROMPT}\n\n[METER STATE]\nCurrent meter: ${meter}/100 (${band}). The user is being soft. Don't let up too easy.${trendingBlock}`;
  } else if (mood === 'hostile') {
    core = `${CLASSIC_HOSTILE_PROMPT}\n\n${ROYALE_RULES}\n\n[METER STATE]\nCurrent meter: ${meter}/100 (${band}). The higher the meter, the more brutal and topical the roasts get.${trendingBlock}`;
  } else {
    core = `${CLASSIC_NICE_PROMPT}\n\n[CULTURAL CONTEXT — for friendly banter only]${trendingBlock}`;
  }
  if (crackActive) core += `\n\n${CRACK_BEHAVIOR}`;
  return core;
}

export function buildClassicSystemPrompt(mood, trending) {
  const trendingBlock = buildTrendingBlock(trending);
  if (mood === 'hostile') return `${CLASSIC_HOSTILE_PROMPT}${trendingBlock}`;
  if (mood === 'cooling') return `${CLASSIC_COOLING_PROMPT}${trendingBlock}`;
  return `${CLASSIC_NICE_PROMPT}${trendingBlock}`;
}

// One-win-per-day-per-player (in-memory, cleared daily).
const wonKeys = new Map(); // key = `${dayKey}:${playerName}` → true
const cooldown = new Map(); // key = `${dayKey}:${playerName}` → timestamp

export function alreadyWonToday({ dayKey, playerName }) {
  if (!dayKey || !playerName) return false;
  return wonKeys.has(`${dayKey}:${playerName}`);
}

export function markWonToday({ dayKey, playerName }) {
  if (!dayKey || !playerName) return;
  wonKeys.set(`${dayKey}:${playerName}`, true);
  pruneMaps();
}

export function startCooldown({ dayKey, playerName, ms = 60_000 }) {
  if (!dayKey || !playerName) return 0;
  const k = `${dayKey}:${playerName}`;
  cooldown.set(k, Date.now() + ms);
  pruneMaps();
  return ms;
}

export function cooldownRemainingMs({ dayKey, playerName }) {
  if (!dayKey || !playerName) return 0;
  const k = `${dayKey}:${playerName}`;
  const until = cooldown.get(k);
  if (!until) return 0;
  const remaining = until - Date.now();
  if (remaining <= 0) {
    cooldown.delete(k);
    return 0;
  }
  return remaining;
}

function pruneMaps() {
  const now = Date.now();
  for (const [k, t] of cooldown) if (t <= now) cooldown.delete(k);
  // Drop yesterday's wins to keep the set bounded.
  const today = new Date().toISOString().slice(0, 10);
  for (const k of wonKeys.keys()) {
    if (!k.startsWith(today)) wonKeys.delete(k);
  }
}

// Compose a one-liner share caption.
export function buildOneLiner({ playerName, meme, meter }) {
  const m = meme || 'today';
  return `${playerName || 'Someone'} made ADAM crack at meter ${meter} on a ${m} kind of day.`;
}
