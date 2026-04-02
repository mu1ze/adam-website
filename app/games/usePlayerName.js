'use client';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'adam_player_name';

/**
 * Hook for managing player name via localStorage.
 * Shows a prompt modal if no name is stored.
 */
export default function usePlayerName() {
  const [name, setNameState] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNameState(stored);
    } else {
      setShowPrompt(true);
    }
  }, []);

  const setName = useCallback((newName) => {
    const trimmed = newName.trim().substring(0, 16);
    if (trimmed) {
      localStorage.setItem(STORAGE_KEY, trimmed);
      setNameState(trimmed);
      setShowPrompt(false);
    }
  }, []);

  const changeName = useCallback(() => {
    setShowPrompt(true);
  }, []);

  return { name, setName, showPrompt, changeName, mounted };
}
