'use client';
import { useState, useRef, useEffect } from 'react';
import styles from './AskAdam.module.css';

const THOUGHT_PROCESSES = [
  '[SYS] Allocating memory shards...',
  '[NET] Querying Global Network...',
  '[CORE] Synthesizing optimal response...',
  '[SEC] Verifying constraints...',
  '[LOG] Scanning historical context...',
  '[PROC] Running heuristic analysis...',
  '[SYS] Routing through primary cortex...'
];

const BRING_IT = 'BRING IT';
const PLAYER_NAME_KEY = 'adam_player_name';

function getPlayerName() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(PLAYER_NAME_KEY) || '';
}

function ensurePlayerName() {
  let name = getPlayerName();
  if (!name) {
    name = `PLAYER_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    try { localStorage.setItem(PLAYER_NAME_KEY, name); } catch {}
  }
  return name;
}

export default function AskAdamClient() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState('nice');
  const [thought, setThought] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [mode, setMode] = useState('classic');
  const [bringItInput, setBringItInput] = useState('');
  const [bringItError, setBringItError] = useState('');
  const [bringItOk, setBringItOk] = useState(false);
  const [session, setSession] = useState(null);
  const [meter, setMeter] = useState(0);
  const [cheeseCount, setCheeseCount] = useState(0);
  const [seed, setSeed] = useState(null);
  const [winCard, setWinCard] = useState(null);
  const [forfeitCooldown, setForfeitCooldown] = useState(0);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('adam_messages');
    const savedMood = localStorage.getItem('adam_mood');
    const disclaimerSeen = sessionStorage.getItem('adam_disclaimer_seen');
    const savedMode = localStorage.getItem('adam_mode');
    const savedBringIt = sessionStorage.getItem('adam_bringit_seen');

    if (savedMessages) {
       setMessages(JSON.parse(savedMessages));
    } else {
       setMessages([{ role: 'assistant', content: '> Connection established. State your query...' }]);
    }

    if (savedMood) setMood(savedMood);
    if (savedMode === 'roast-royale' || savedMode === 'classic') setMode(savedMode);
    if (savedBringIt) setBringItOk(true);
    if (!disclaimerSeen) setShowDisclaimer(true);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('adam_messages', JSON.stringify(messages));
    }
    localStorage.setItem('adam_mood', mood);
    localStorage.setItem('adam_mode', mode);
  }, [messages, mood, mode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, thought]);

  useEffect(() => {
      let interval;
      if (isLoading) {
          setThought(THOUGHT_PROCESSES[Math.floor(Math.random() * THOUGHT_PROCESSES.length)]);
          interval = setInterval(() => {
              setThought(THOUGHT_PROCESSES[Math.floor(Math.random() * THOUGHT_PROCESSES.length)]);
          }, 400);
      }
      return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (mode === 'roast-royale' && !seed) {
      fetch('/api/trending')
        .then(r => r.json())
        .then(d => {
          if (d?.success) setSeed(d.trending);
        })
        .catch(() => {});
    }
  }, [mode, seed]);

  const dismissDisclaimer = () => {
    setShowDisclaimer(false);
    sessionStorage.setItem('adam_disclaimer_seen', 'true');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const submitBringIt = (e) => {
    e.preventDefault();
    if (bringItInput.trim().toUpperCase() === BRING_IT) {
      setBringItOk(true);
      setBringItError('');
      sessionStorage.setItem('adam_bringit_seen', 'true');
    } else {
      setBringItError('Type "BRING IT" exactly to enable hostile mode.');
    }
  };

  const isHostile = mood === 'hostile' || mode === 'roast-royale';

  const resetLocalSession = () => {
    setSession(null);
    sessionRef.current = null;
    setMeter(0);
    setCheeseCount(0);
    setWinCard(null);
    setForfeitCooldown(0);
  };

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const trimmedInput = input.trim();
    if (trimmedInput === '> clear memory' || trimmedInput === '/clear') {
      const resetMsg = [{ role: 'assistant', content: '> Memory wiped. Re-establishing connection...' }];
      setMessages(resetMsg);
      setMood('nice');
      setInput('');
      resetLocalSession();
      return;
    }

    if (mode === 'roast-royale' && (trimmedInput === '/forfeit' || trimmedInput === '> forfeit')) {
      const msg = { role: 'assistant', content: '> 🧊 momentum lost. Session forfeited.' };
      setMessages(prev => [...prev, msg]);
      setMeter(0);
      setForfeitCooldown(60);
      let remaining = 60;
      const t = setInterval(() => {
        remaining -= 1;
        setForfeitCooldown(remaining);
        if (remaining <= 0) clearInterval(t);
      }, 1000);
      setInput('');
      return;
    }

    const searchInputMatch = trimmedInput.match(/^\/search\s+(.+)/is);
    const searchOnlyCommand = /^\/search\s*$/i.test(trimmedInput);

    if (searchOnlyCommand) {
        const usageMsg = { role: 'assistant', content: '> Usage: /search <query>\n> Example: /search latest AI news 2026' };
        setMessages(prev => [...prev, usageMsg]);
        setInput('');
        return;
    }

    const userContent = searchInputMatch ? searchInputMatch[1] : trimmedInput;
    const webSearch = !!searchInputMatch;

    const userMessage = { role: 'user', content: userContent };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversation = messages
        .filter(m => !m.content.startsWith('> Connection'))
        .filter(m => !m.content.startsWith('> Memory wiped'))
        .concat(userMessage);

      const body = { messages: conversation, mood, webSearch };
      if (mode === 'roast-royale') {
        body.mode = 'roast-royale';
        body.sessionId = sessionRef.current || session?.sessionId;
        body.playerName = ensurePlayerName();
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      if (mode === 'roast-royale') {
        if (data.session?.sessionId) {
          sessionRef.current = data.session.sessionId;
          setSession(data.session);
        }
        if (typeof data.meter === 'number') setMeter(data.meter);
        if (typeof data.cheeseCount === 'number') setCheeseCount(data.cheeseCount);
        if (data.cheese_detected) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `> 🧀 NOPE. That one's on the house.`,
          }]);
        }
        if (data.win) {
          setWinCard(data.winCard);
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `> 🏆 WIN. ADAM cracked. You made the machine apologize.\n> Peak meter: ${data.winCard.peakMeter}\n> Meme of the day: ${data.winCard.meme || '—'}`,
          }]);
        }
        if (data.already_won) {
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `> 🏆 Already won today. Tomorrow's seed drops in 24h.`,
          }]);
        }
      }

      setMessages(prev => [...prev, data.reply]);
      if (data.mood) setMood(data.mood);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `> ERROR: ${err.message}`
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  const hostileAccent = '#ff2244';
  const niceAccent = 'var(--primary)';
  const currentAccent = isHostile ? hostileAccent : niceAccent;

  const showBringItGate = mode === 'roast-royale' && !bringItOk;

  return (
    <>
      {showDisclaimer && (
        <div className="modal-overlay">
          <div className="modal-box">
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ color: 'var(--warning)', fontSize: '16px', letterSpacing: '2px', marginBottom: '16px' }}>
              TESTING PHASE
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: '1.8', marginBottom: '24px' }}>
              ADAM is a highly advanced, cooperative autonomous entity designed to be <span style={{ color: 'var(--primary)' }}>friendly and helpful</span>.
              However, if you choose to <span style={{ color: hostileAccent }}>instigate him</span>, you are entirely left with the consequences of your actions.
              <br /><br />
              Approach with respect.
            </p>
            <button
              onClick={dismissDisclaimer}
              style={{
                background: 'var(--warning)',
                color: 'var(--bg)',
                border: 'none',
                padding: '12px 36px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                letterSpacing: '2px',
                transition: 'all 0.3s',
                minHeight: '44px',
              }}
            >
              I UNDERSTAND
            </button>
          </div>
        </div>
      )}

      {showBringItGate && (
        <div className="modal-overlay" data-testid="bringit-gate">
          <div className="modal-box" style={{ maxWidth: '420px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔥</div>
            <h3 style={{ color: hostileAccent, fontSize: '16px', letterSpacing: '2px', marginBottom: '16px' }}>
              HOSTILE_MODE_UNLOCK
            </h3>
            <p style={{ color: 'var(--text-dim)', fontSize: '13px', lineHeight: '1.7', marginBottom: '16px' }}>
              Roast Royale is enabled. To enter the arena, type the cheat code:
            </p>
            <form onSubmit={submitBringIt} className={styles.bringItGate} data-testid="bringit-form">
              <input
                autoFocus
                value={bringItInput}
                onChange={(e) => setBringItInput(e.target.value)}
                placeholder="TYPE HERE"
                data-testid="bringit-input"
                maxLength={16}
              />
              {bringItError && <div className={styles.bringItGate__error} data-testid="bringit-error">{bringItError}</div>}
              <button
                type="submit"
                className="form-submit"
                style={{ background: hostileAccent, color: '#fff', border: 'none', padding: '10px 20px', fontWeight: 'bold', letterSpacing: '2px', cursor: 'pointer', borderRadius: '4px' }}
                data-testid="bringit-submit"
              >
                ENTER ARENA
              </button>
              <div className={styles.bringItGate__hint}>Hint: two words, all caps. Famous cheat code.</div>
            </form>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: isHostile ? 'rgba(255, 34, 68, 0.06)' : 'rgba(0, 255, 136, 0.03)',
          borderBottom: `1px solid ${isHostile ? hostileAccent + '44' : 'var(--border)'}`,
          fontSize: '11px',
          color: isHostile ? hostileAccent : 'var(--text-dim)',
          transition: 'all 0.5s ease',
          flexShrink: 0,
        }}>
          <span style={{
            display: 'inline-block',
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: currentAccent,
            animation: isHostile ? 'pulse 0.5s infinite' : 'pulse 2s infinite',
          }} />
          <span style={{ fontWeight: 'bold' }}>
            MODE: {mode === 'roast-royale' ? '🔥 ROAST-ROYALE' : '● CLASSIC'}
          </span>
          <span style={{ flex: 1 }} />
          <button
            onClick={() => {
              if (mode === 'classic') {
                if (!confirm('Switch to ROAST-ROYALE? Your current conversation will be cleared.')) return;
                setMode('roast-royale');
                setMessages([{ role: 'assistant', content: '> ROAST-ROYALE: Make ADAM apologize. Unprompted. In one session.' }]);
                resetLocalSession();
              } else {
                if (!confirm('Switch back to classic mode? Your Royale session will be discarded.')) return;
                setMode('classic');
                setMessages([{ role: 'assistant', content: '> Connection established. State your query...' }]);
                resetLocalSession();
              }
            }}
            data-testid="mode-toggle"
            style={{
              background: 'transparent',
              color: currentAccent,
              border: `1px solid ${currentAccent}66`,
              padding: '4px 10px',
              cursor: 'pointer',
              fontSize: '10px',
              letterSpacing: '1px',
              borderRadius: '3px',
            }}
          >
            {mode === 'roast-royale' ? '← CLASSIC' : '🔥 ROYALE →'}
          </button>
        </div>

        {mode === 'roast-royale' && (
          <>
            <div className={styles.hostilityMeter} data-testid="hostility-meter">
              <span className={styles.hostilityMeter__label}>HOSTILITY</span>
              <div className={styles.hostilityMeter__bar}>
                <div className={styles.hostilityMeter__fill} style={{ width: `${meter}%` }} data-testid="hostility-fill" />
              </div>
              <span className={styles.hostilityMeter__band} data-testid="hostility-band">
                {meter}/100 · {session?.crackThreshold ? `crack≥${session.crackThreshold}` : '—'}
              </span>
            </div>

            {seed && (
              <div className={styles.seedChip} data-testid="seed-chip">
                <span className={styles.seedChip__icon}>🌶️</span>
                <span className={styles.seedChip__label}>SEED:</span>
                <span>{seed.memeOfTheDay || seed.headline || seed.topics?.[0] || 'today'}</span>
              </div>
            )}

            <div className={styles.winBanner} data-testid="win-banner">
              Make ADAM say sorry. Unprompted. In one session. (User apologies do not count.)
            </div>

            <div className={styles.cheeseRow} data-testid="cheese-row">
              <span>🧀 NOPE COUNT: <span className={styles.cheeseRow__count} data-testid="cheese-count">{cheeseCount}</span></span>
              {forfeitCooldown > 0 && <span style={{ color: '#ff2244' }}>COOLDOWN: {forfeitCooldown}s</span>}
              <span style={{ marginLeft: 'auto', opacity: 0.7 }}>tip: /forfeit to concede</span>
            </div>
          </>
        )}

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            background: isHostile ? 'rgba(255, 34, 68, 0.04)' : 'var(--bg)',
            transition: 'background 0.5s ease',
          }}
        >
          {winCard && (
            <div className={styles.shareCardWrapper} data-testid="win-card">
              <div className={styles.shareCard}>
                <div className={styles.shareCard__title}>🏆 ROAST ROYALE WIN 🏆</div>
                <div className={styles.shareCard__seed}>
                  SEED: {winCard.meme || winCard.headline || 'today'}
                </div>
                <div className={styles.shareCard__stats}>
                  <span>PLAYER: {ensurePlayerName()}</span>
                  <span>PEAK METER: {winCard.peakMeter}</span>
                  <span>DAY: {winCard.dayKey}</span>
                </div>
                <div className={styles.shareCard__oneLiner}>&ldquo;{winCard.oneLiner}&rdquo;</div>
                <div style={{ fontSize: 14, color: '#888', letterSpacing: 2 }}>
                  adam-website · roast-royale
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            const isHostileReply = !isUser && isHostile;
            const parts = msg.content.split('```');

            return (
              <div
                key={idx}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  background: isUser
                    ? (isHostile ? 'rgba(255, 34, 68, 0.1)' : 'rgba(0, 255, 136, 0.08)')
                    : 'transparent',
                  border: isUser ? `1px solid ${currentAccent}44` : 'none',
                  color: isUser ? 'var(--text)' : isHostileReply ? hostileAccent : 'var(--primary)',
                  padding: isUser ? '10px 14px' : '4px 0',
                  borderRadius: isUser ? '12px 12px 4px 12px' : '0',
                  maxWidth: '85%',
                  width: isUser ? 'auto' : '100%',
                  fontSize: '14px',
                  lineHeight: '1.7',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  transition: 'color 0.3s ease',
                }}
              >
                {parts.map((part, i) => {
                   if (i % 2 !== 0) {
                      return (
                        <pre key={i} className="code-block" style={{
                          margin: '10px 0',
                          color: isHostileReply ? hostileAccent : 'var(--primary-dim)',
                        }}>
                          <code>{part.replace(/^\w+\n/, '')}</code>
                        </pre>
                      );
                   }
                   return <span key={i}>{part}</span>;
                })}
              </div>
            );
          })}

          {isLoading && (
            <div style={{
              alignSelf: 'flex-start',
              color: isHostile ? hostileAccent : 'var(--text-dim)',
              fontSize: '12px',
              padding: '4px 0',
            }}>
              &gt; {isHostile ? 'Compiling roast protocols...' : thought}<span className="cursor-blink"></span>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            gap: '0',
            borderTop: `1px solid ${isHostile ? hostileAccent + '44' : 'var(--border)'}`,
            background: isHostile ? 'rgba(255, 34, 68, 0.04)' : 'var(--bg-secondary)',
            transition: 'all 0.5s ease',
            flexShrink: 0,
          }}
        >
          <span style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 12px',
            color: currentAccent,
            fontSize: '14px',
            transition: 'color 0.5s ease',
          }}>
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isHostile ? (mode === 'roast-royale' ? "Push ADAM to the edge..." : "Say sorry or catch these hands...") : "Enter command..."}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '16px 0',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none',
            }}
            disabled={isLoading || showBringItGate}
            data-testid="chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || showBringItGate}
            data-testid="chat-send"
            style={{
              background: 'transparent',
              color: currentAccent,
              border: 'none',
              borderLeft: `1px solid ${isHostile ? hostileAccent + '22' : 'var(--border)'}`,
              padding: '16px 20px',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '13px',
              letterSpacing: '1px',
              opacity: isLoading || !input.trim() ? 0.3 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {isHostile ? '🔥' : 'SEND'}
          </button>
        </form>
      </div>
    </>
  );
}
