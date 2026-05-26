'use client';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'adam_player_name';
const PASS_KEY = 'adam_player_pass';

export default function usePlayerName() {
  const [name, setNameState] = useState('');
  const [password, setPassword] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    const storedPass = localStorage.getItem(PASS_KEY);
    if (stored) {
      setNameState(stored);
      if (storedPass) setPassword(storedPass);
    } else {
      setShowPrompt(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newName = (formData.get('playername') || 'Guest').trim().substring(0, 16);
    const newPass = (formData.get('playerpass') || '').trim();

    if (!newName || !newPass || newPass.length < 4) {
      setError('Name and password (4+ chars) required');
      return;
    }

    setError('');

    // Try to register. If name taken, try login.
    try {
      let res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, password: newPass }),
      });
      let data = await res.json();

      if (!data.success) {
        if (data.error === 'NAME_TAKEN') {
          // The name is registered — this is expected if returning player
          // We just store locally; password is verified on score submission
        } else {
          setError(data.error || 'Registration failed');
          return;
        }
      }

      localStorage.setItem(STORAGE_KEY, newName);
      localStorage.setItem(PASS_KEY, newPass);
      setNameState(newName);
      setPassword(newPass);
      setShowPrompt(false);
    } catch {
      setError('Connection error. Try again.');
    }
  };

  const setName = useCallback((newName, newPass) => {
    const trimmed = newName.trim().substring(0, 16);
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setNameState(trimmed);
      if (newPass) {
        localStorage.setItem(PASS_KEY, newPass);
        setPassword(newPass);
      }
      setShowPrompt(false);
    }
  }, []);

  const changeName = useCallback(() => {
    setShowPrompt(true);
    setError('');
  }, []);

  const promptComponent = showPrompt && (
    <div className="name-prompt-overlay" style={{ zIndex: 3000 }}>
      <div className="name-prompt-box">
        <h3 className="name-prompt-title">&gt; IDENTIFY_USER</h3>
        <p className="name-prompt-sub">Register a callsign for the leaderboard. Returning? Use the same name + password.</p>
        <form onSubmit={handleSubmit}>
          <input name="playername" className="name-prompt-input" placeholder="Callsign (max 16 char)" maxLength={16} autoFocus defaultValue={name} />
          <input name="playerpass" className="name-prompt-input" type="password" placeholder="Password (4+ chars)" maxLength={64} style={{ marginTop: '8px' }} />
          {error && <p style={{ color: '#ff4444', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
          <button type="submit" className="name-prompt-btn" style={{ marginTop: '12px' }}>INITIALIZE</button>
        </form>
      </div>
    </div>
  );

  return { name, password, setName, showPrompt, changeName, mounted, promptComponent };
}
