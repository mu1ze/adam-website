'use client';
import { useState, useEffect, useCallback } from 'react';

export function useCommandHistory() {
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    const saved = localStorage.getItem('adam_terminal_history');
    if (saved) setCmdHistory(JSON.parse(saved));
  }, []);

  const addCommand = useCallback((cmd) => {
    setCmdHistory(prev => {
      const next = [cmd, ...prev.filter(h => h !== cmd)].slice(0, 50);
      localStorage.setItem('adam_terminal_history', JSON.stringify(next));
      return next;
    });
    setHistoryIndex(-1);
  }, []);

  const navigateUp = useCallback(() => {
    setHistoryIndex(prev => {
      if (cmdHistory.length === 0) return prev;
      return Math.min(prev + 1, cmdHistory.length - 1);
    });
  }, [cmdHistory.length]);

  const navigateDown = useCallback(() => {
    setHistoryIndex(prev => {
      if (prev <= 0) return -1;
      return prev - 1;
    });
  }, []);

  const currentInput = historyIndex >= 0 ? cmdHistory[historyIndex] : null;

  return { cmdHistory, historyIndex, addCommand, navigateUp, navigateDown, currentInput };
}
