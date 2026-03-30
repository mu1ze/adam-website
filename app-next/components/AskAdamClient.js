'use client';
import { useState, useRef, useEffect } from 'react';

export default function AskAdamClient() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '> Connection established. State your query...' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send only the actual conversation history, excluding our fake init message
      const conversation = messages
        .filter(m => !m.content.startsWith('> Connection established'))
        .concat(userMessage);

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, data.reply]);
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

  return (
    <div className="detail-section">
      <div 
        ref={scrollRef} 
        style={{
          background: '#000',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '20px',
          minHeight: '400px',
          maxHeight: '500px',
          overflowY: 'auto',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
              border: msg.role === 'user' ? '1px solid var(--primary)' : 'none',
              color: msg.role === 'user' ? 'var(--text)' : 'var(--primary)',
              padding: '10px 15px',
              borderRadius: '8px',
              maxWidth: '80%',
              fontFamily: 'inherit',
              fontSize: '14px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}
          >
            {msg.content}
          </div>
        ))}

        {isLoading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--primary-dim)' }}>
            &gt; Processing<span className="cursor-blink"></span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="> Enter command or question..."
          style={{
            flex: 1,
            background: '#000',
            border: '1px solid var(--border)',
            padding: '15px',
            borderRadius: '4px',
            color: 'var(--text)',
            fontFamily: 'inherit',
            fontSize: '14px',
            outline: 'none',
          }}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          style={{
            background: 'var(--primary)',
            color: 'var(--bg)',
            border: 'none',
            padding: '0 25px',
            borderRadius: '4px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            fontWeight: 'bold',
            opacity: isLoading || !input.trim() ? 0.5 : 1,
            transition: 'all 0.2s'
          }}
        >
          SEND
        </button>
      </form>
    </div>
  );
}
