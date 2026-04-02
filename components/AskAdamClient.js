'use client';
import { useState, useRef, useEffect } from 'react';

export default function AskAdamClient() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '> Connection established. State your query...' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mood, setMood] = useState('nice'); // 'nice' | 'hostile' | 'cooling'
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const isHostile = mood === 'hostile';

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversation = messages
        .filter(m => !m.content.startsWith('> Connection established'))
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

  // Visual styles based on mood
  const hostileAccent = '#ff2244';
  const niceAccent = 'var(--primary)';
  const currentAccent = isHostile ? hostileAccent : niceAccent;

  const containerBorder = isHostile
    ? `1px solid ${hostileAccent}`
    : '1px solid var(--border)';

  const containerShadow = isHostile
    ? `0 0 30px rgba(255, 34, 68, 0.15), inset 0 0 60px rgba(255, 34, 68, 0.05)`
    : 'none';

  return (
    <div className="detail-section">
      {/* Mood indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '10px',
        fontSize: '12px',
        fontFamily: '"Courier New", monospace',
        transition: 'color 0.5s ease',
        color: isHostile ? hostileAccent : 'var(--text-dim)',
      }}>
        <span style={{
          display: 'inline-block',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: currentAccent,
          animation: isHostile ? 'pulse 0.5s infinite' : 'pulse 2s infinite',
          transition: 'background 0.5s ease',
        }} />
        MOOD: {isHostile ? '⚠ HOSTILE — apologize to restore normal mode' : '● COOPERATIVE'}
      </div>

      {/* Chat container */}
      <div
        ref={scrollRef}
        style={{
          background: isHostile ? '#0a0000' : '#000',
          border: containerBorder,
          borderRadius: '8px',
          padding: '20px',
          minHeight: '400px',
          maxHeight: '500px',
          overflowY: 'auto',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          boxShadow: containerShadow,
          transition: 'all 0.5s ease',
        }}
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          const isHostileReply = !isUser && isHostile;

          return (
            <div
              key={idx}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                background: isUser
                  ? (isHostile ? 'rgba(255, 34, 68, 0.1)' : 'rgba(0, 255, 136, 0.1)')
                  : 'transparent',
                border: isUser
                  ? `1px solid ${currentAccent}`
                  : 'none',
                color: isUser
                  ? '#e0e0e0'
                  : isHostileReply ? hostileAccent : 'var(--primary)',
                padding: '10px 15px',
                borderRadius: '8px',
                maxWidth: '80%',
                fontFamily: 'inherit',
                fontSize: '14px',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                transition: 'color 0.3s ease, border-color 0.3s ease, background 0.3s ease',
              }}
            >
              {msg.content}
            </div>
          );
        })}

        {isLoading && (
          <div style={{
            alignSelf: 'flex-start',
            color: isHostile ? hostileAccent : 'var(--primary-dim)',
          }}>
            &gt; {isHostile ? 'Preparing roast' : 'Processing'}<span className="cursor-blink"></span>
          </div>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isHostile ? "> Say sorry or catch these hands..." : "> Enter command or question..."}
          style={{
            flex: 1,
            background: isHostile ? '#0a0000' : '#000',
            border: `1px solid ${isHostile ? hostileAccent + '66' : 'var(--border)'}`,
            padding: '15px',
            borderRadius: '4px',
            color: '#e0e0e0',
            fontFamily: 'inherit',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.5s ease',
          }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            background: currentAccent,
            color: isHostile ? '#fff' : 'var(--bg)',
            border: 'none',
            padding: '0 25px',
            borderRadius: '4px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontWeight: 'bold',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            transition: 'all 0.3s ease',
          }}
        >
          {isHostile ? '🔥' : 'SEND'}
        </button>
      </form>
    </div>
  );
}
