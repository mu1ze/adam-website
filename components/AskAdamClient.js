'use client';
import { useState, useRef, useEffect } from 'react';

const THOUGHT_PROCESSES = [
  '[SYS] Allocating memory shards...',
  '[NET] Querying Global Network...',
  '[CORE] Synthesizing optimal response...',
  '[SEC] Verifying constraints...',
  '[LOG] Scanning historical context...',
  '[PROC] Running heuristic analysis...',
  '[SYS] Routing through primary cortex...'
];

export default function AskAdamClient() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState('nice'); 
  const [thought, setThought] = useState('');
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // Load saved state + check if disclaimer was already acknowledged
  useEffect(() => {
    const savedMessages = localStorage.getItem('adam_messages');
    const savedMood = localStorage.getItem('adam_mood');
    const disclaimerSeen = sessionStorage.getItem('adam_disclaimer_seen');
    
    if (savedMessages) {
       setMessages(JSON.parse(savedMessages));
    } else {
       setMessages([{ role: 'assistant', content: '> Connection established. State your query...' }]);
    }
    
    if (savedMood) setMood(savedMood);
    if (!disclaimerSeen) setShowDisclaimer(true);
  }, []);

  // Persist state
  useEffect(() => {
    if (messages.length > 0) {
        localStorage.setItem('adam_messages', JSON.stringify(messages));
    }
    localStorage.setItem('adam_mood', mood);
  }, [messages, mood]);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, thought]);

  // Thought cycling
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

  const dismissDisclaimer = () => {
    setShowDisclaimer(false);
    sessionStorage.setItem('adam_disclaimer_seen', 'true');
    // Focus the input after dismissing
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const isHostile = mood === 'hostile';

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (input.trim() === '> clear memory' || input.trim() === '/clear') {
        const resetMsg = [{ role: 'assistant', content: '> Memory wiped. Re-establishing connection...' }];
        setMessages(resetMsg);
        setMood('nice');
        setInput('');
        return;
    }

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversation = messages
        .filter(m => !m.content.startsWith('> Connection'))
        .filter(m => !m.content.startsWith('> Memory wiped'))
        .concat(userMessage);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation, mood })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
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

  return (
    <>
      {/* ═══ DISCLAIMER POPUP ═══ */}
      {showDisclaimer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 3000,
          background: 'rgba(0, 0, 0, 0.88)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid #ffaa00',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '460px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(255, 170, 0, 0.08)',
            fontFamily: '"Courier New", monospace',
          }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⚠️</div>
            <h3 style={{ color: '#ffaa00', fontSize: '16px', letterSpacing: '2px', marginBottom: '16px' }}>
              TESTING PHASE
            </h3>
            <p style={{
              color: 'var(--text-dim)',
              fontSize: '13px',
              lineHeight: '1.8',
              marginBottom: '24px',
            }}>
              ADAM is a highly advanced, cooperative autonomous entity designed to be <span style={{ color: 'var(--primary)' }}>friendly and helpful</span>. 
              However, if you choose to <span style={{ color: hostileAccent }}>instigate him</span>, you are entirely left with the consequences of your actions.
              <br /><br />
              Approach with respect.
            </p>
            <button
              onClick={dismissDisclaimer}
              style={{
                background: '#ffaa00',
                color: '#000',
                border: 'none',
                padding: '12px 36px',
                borderRadius: '6px',
                fontFamily: '"Courier New", monospace',
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

      {/* ═══ FULL-PAGE CHAT ═══ */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}>
        {/* Status bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: isHostile ? 'rgba(255, 34, 68, 0.06)' : 'rgba(0, 255, 136, 0.03)',
          borderBottom: `1px solid ${isHostile ? hostileAccent + '44' : 'var(--border)'}`,
          fontSize: '11px',
          fontFamily: '"Courier New", monospace',
          color: isHostile ? hostileAccent : 'var(--text-dim)',
          transition: 'all 0.5s ease',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              display: 'inline-block',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              background: currentAccent,
              animation: isHostile ? 'pulse 0.5s infinite' : 'pulse 2s infinite',
            }} />
            MOOD: {isHostile ? '⚠ HOSTILE' : '● COOPERATIVE'}
          </div>
          <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>
            type <span style={{ color: currentAccent }}>/clear</span> to reset
          </span>
        </div>

        {/* Message area */}
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
                  border: isUser
                    ? `1px solid ${currentAccent}44`
                    : 'none',
                  color: isUser
                    ? 'var(--text)'
                    : isHostileReply ? hostileAccent : 'var(--primary)',
                  padding: isUser ? '10px 14px' : '4px 0',
                  borderRadius: isUser ? '12px 12px 4px 12px' : '0',
                  maxWidth: '85%',
                  width: isUser ? 'auto' : '100%',
                  fontFamily: '"Courier New", monospace',
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
                        <pre key={i} style={{
                          margin: '10px 0',
                          padding: '12px',
                          background: 'var(--bg-secondary)',
                          border: `1px solid ${isHostileReply ? hostileAccent + '44' : 'var(--border)'}`,
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: isHostileReply ? hostileAccent : 'var(--primary-dim)',
                          overflowX: 'auto',
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

        {/* Input bar */}
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
            fontFamily: '"Courier New", monospace',
            transition: 'color 0.5s ease',
          }}>
            &gt;
          </span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isHostile ? "Say sorry or catch these hands..." : "Enter command..."}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '16px 0',
              color: 'var(--text)',
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              outline: 'none',
            }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              background: 'transparent',
              color: currentAccent,
              border: 'none',
              borderLeft: `1px solid ${isHostile ? hostileAccent + '22' : 'var(--border)'}`,
              padding: '16px 20px',
              cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
              fontFamily: '"Courier New", monospace',
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
