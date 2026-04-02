/**
 * Multilingual text data for PreText arcade games.
 * Characters from each language are used to form game shapes.
 */

export const LANGUAGES = [
  {
    name: 'English',
    color: '#00ff88',
    glow: 'rgba(0, 255, 136, 0.6)',
    chars: ['A', 'D', 'A', 'M', 'G', 'O', 'P', 'L', 'A', 'Y'],
    paddle: ['|', '|', '|', '|', '|'],
    ball: '●',
    snake: '█',
    food: '◆',
    wall: '▓',
    head: '◉',
    numerals: ['0','1','2','3','4','5','6','7','8','9'],
  },
  {
    name: '日本語',
    color: '#ff6b9d',
    glow: 'rgba(255, 107, 157, 0.6)',
    chars: ['力', '技', '速', '勝', '遊', '戦', '闘', '魂', '光', '夢'],
    paddle: ['力', '技', '速', '勝', '闘'],
    ball: '球',
    snake: '蛇',
    food: '食',
    wall: '壁',
    head: '龍',
    numerals: ['〇','一','二','三','四','五','六','七','八','九'],
  },
  {
    name: 'العربية',
    color: '#ffd700',
    glow: 'rgba(255, 215, 0, 0.6)',
    chars: ['ق', 'و', 'ة', 'ل', 'ع', 'ب', 'ح', 'ر', 'ك', 'ن'],
    paddle: ['ق', 'و', 'ة', 'ل', 'ع'],
    ball: 'كرة',
    snake: 'أفعى',
    food: 'طعم',
    wall: 'جدر',
    head: 'رأس',
    numerals: ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'],
  },
  {
    name: '한국어',
    color: '#00bfff',
    glow: 'rgba(0, 191, 255, 0.6)',
    chars: ['게', '임', '승', '리', '전', '투', '힘', '빛', '꿈', '별'],
    paddle: ['게', '임', '승', '리', '전'],
    ball: '공',
    snake: '뱀',
    food: '음',
    wall: '벽',
    head: '용',
    numerals: ['영','일','이','삼','사','오','육','칠','팔','구'],
  },
  {
    name: 'हिंदी',
    color: '#ff8c42',
    glow: 'rgba(255, 140, 66, 0.6)',
    chars: ['ख', 'े', 'ल', 'ज', 'ी', 'त', 'श', 'क्ति', 'ग', 'ति'],
    paddle: ['ख', 'े', 'ल', 'ज', 'ी'],
    ball: 'गेंद',
    snake: 'साँप',
    food: 'खा',
    wall: 'दीवर',
    head: 'सिर',
    numerals: ['०','१','२','३','४','५','६','७','८','९'],
  },
  {
    name: '中文',
    color: '#ff4444',
    glow: 'rgba(255, 68, 68, 0.6)',
    chars: ['游', '戏', '赢', '功', '打', '战', '拳', '光', '梦', '星'],
    paddle: ['游', '戏', '赢', '功', '打'],
    ball: '球',
    snake: '蛇',
    food: '果',
    wall: '墙',
    head: '龙',
    numerals: ['零','一','二','三','四','五','六','七','八','九'],
  },
  {
    name: 'Русский',
    color: '#9b59b6',
    glow: 'rgba(155, 89, 182, 0.6)',
    chars: ['И', 'Г', 'Р', 'А', 'П', 'О', 'Б', 'Е', 'Д', 'А'],
    paddle: ['И', 'Г', 'Р', 'А', 'П'],
    ball: 'М',
    snake: 'З',
    food: 'Е',
    wall: 'С',
    head: 'Д',
    numerals: ['0','1','2','3','4','5','6','7','8','9'],
  },
  {
    name: 'Emoji',
    color: '#ffffff',
    glow: 'rgba(255, 255, 255, 0.6)',
    chars: ['🎮', '🕹️', '👾', '🎯', '⚡', '🔥', '💎', '🚀', '⭐', '🏆'],
    paddle: ['🎮', '🕹️', '👾', '🎯', '⚡'],
    ball: '🔴',
    snake: '🟩',
    food: '🍎',
    wall: '🧱',
    head: '🐍',
    numerals: ['0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣'],
  },
];

/** Cycle interval in ms for language rotation */
export const CYCLE_MS = 2500;

/**
 * Get the current language index based on time.
 * @param {number} [now] - Timestamp in ms (defaults to Date.now())
 * @returns {number} Language index
 */
export function getLanguageIndex(now) {
  const t = now ?? Date.now();
  return Math.floor(t / CYCLE_MS) % LANGUAGES.length;
}

/**
 * Get the current language object.
 */
export function getCurrentLanguage(now) {
  return LANGUAGES[getLanguageIndex(now)];
}

/**
 * Get a character from the current language's chars array,
 * wrapping around by position index.
 */
export function getRotatingChar(positionIndex, now) {
  const lang = getCurrentLanguage(now);
  return lang.chars[positionIndex % lang.chars.length];
}

/**
 * Get the color for a given language index.
 */
export function getLanguageColor(langIndex) {
  return LANGUAGES[langIndex % LANGUAGES.length].color;
}

/**
 * Interpolate between two colors for smooth transitions.
 */
export function lerpColor(colorA, colorB, t) {
  const parseHex = (c) => {
    const hex = c.replace('#', '');
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parseHex(colorA);
  const [r2, g2, b2] = parseHex(colorB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Get smoothly transitioning color based on time.
 */
export function getSmoothColor(now) {
  const t = now ?? Date.now();
  const progress = (t % CYCLE_MS) / CYCLE_MS;
  const idx = Math.floor(t / CYCLE_MS) % LANGUAGES.length;
  const nextIdx = (idx + 1) % LANGUAGES.length;
  // Smooth in the last 20% of each cycle
  if (progress > 0.8) {
    const fade = (progress - 0.8) / 0.2;
    return lerpColor(LANGUAGES[idx].color, LANGUAGES[nextIdx].color, fade);
  }
  return LANGUAGES[idx].color;
}
