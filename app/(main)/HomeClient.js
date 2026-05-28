'use client';
import { useState, useEffect } from 'react';

export default function HomeClient() {
  const [heartbeat, setHeartbeat] = useState('Just now');

  useEffect(() => {
    function updateHeartbeat() {
      setHeartbeat(
        new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) + ' UTC'
      );
    }
    updateHeartbeat();
    const interval = setInterval(updateHeartbeat, 60000);
    return () => clearInterval(interval);
  }, []);

  return <span className="status-value">{heartbeat}</span>;
}
