'use client';
import { useState, useEffect, useCallback } from 'react';

export function usePluginConnections() {
  const [connections, setConnections] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('adam_terminal_connections');
    if (saved) setConnections(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (Object.keys(connections).length > 0) {
      localStorage.setItem('adam_terminal_connections', JSON.stringify(connections));
    }
  }, [connections]);

  const connect = useCallback((slug, connectedAt) => {
    setConnections(prev => ({ ...prev, [slug]: { connectedAt } }));
  }, []);

  const disconnect = useCallback((slug) => {
    setConnections(prev => {
      const next = { ...prev };
      delete next[slug];
      localStorage.setItem('adam_terminal_connections', JSON.stringify(next));
      return next;
    });
  }, []);

  return { connections, connect, disconnect };
}
