'use client';
import { useState, useEffect, useCallback } from 'react';

const NAME_KEY = 'adam_player_name';
const DEVICE_KEY = 'adam_device_id';

function generateId() {
  // Fallback UUID generator for browsers without crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function getOrCreateDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : generateId());
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export default function usePlayerName() {
  const [name, setName] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    const id = getOrCreateDeviceId();
    setDeviceId(id);

    const stored = localStorage.getItem(NAME_KEY);
    if (stored) {
      setName(stored);
      // Verify against server so name stays bound to this device
      fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: stored, deviceId: id }),
      }).then(res => res.json()).then(data => {
        if (data.success) {
          setName(data.name || stored);
        } else if (data.error === 'NAME_TAKEN') {
          setName('');
          setShowPrompt(true);
          setError('Your previous callsign is registered to another device. Pick a new one.');
        }
      }).catch(() => {});
    } else {
      setShowPrompt(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newName = (formData.get('playername') || 'Guest').trim().substring(0, 16);

    if (!newName) {
      setError('Name required');
      return;
    }

    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, deviceId }),
      });
      const data = await res.json();

      if (!data.success) {
        const messages = {
          'NAME_TAKEN': 'Callsign already registered. Try another.',
          'Name and device ID required': 'Name is required.',
        };
        setError(messages[data.error] || data.error || 'Registration failed');
        return;
      }

      localStorage.setItem(NAME_KEY, newName);
      setName(newName);
      setShowPrompt(false);
    } catch {
      setError('Connection error. Try again.');
    }
  };

  const changeName = useCallback(() => {
    setShowPrompt(true);
    setError('');
  }, []);

  const promptComponent = showPrompt && (
    <div className="name-prompt-overlay" style={{ zIndex: 3000 }}>
      <div className="name-prompt-box">
        <h3 className="name-prompt-title">&gt; IDENTIFY_USER</h3>
        <p className="name-prompt-sub">Register a callsign for the leaderboard.</p>
        <form onSubmit={handleSubmit}>
          <input name="playername" className="name-prompt-input" placeholder="Callsign (max 16 char)" maxLength={16} autoFocus defaultValue={name} />
          {error && <p style={{ color: 'var(--error)', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
          <button type="submit" className="name-prompt-btn" style={{ marginTop: '12px' }}>INITIALIZE</button>
        </form>
      </div>
    </div>
  );

  return { name, deviceId, showPrompt, changeName, mounted, promptComponent };
}
