'use client';
import { useState } from 'react';

const initialTasks = [
  { text: 'Design mockups', agent: 'DesignAgent' },
  { text: 'Write copy', agent: 'ContentBot' },
  { text: 'Develop frontend', agent: 'CodeAgent' },
];

export default function DelegationDemo() {
  const [tasks, setTasks] = useState(initialTasks.map(t => ({ ...t, done: false })));
  const [delegating, setDelegating] = useState(false);

  const completed = tasks.filter(t => t.done).length;
  const progress = Math.round((completed / tasks.length) * 100);

  function toggleTask(i) {
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
  }

  function delegate() {
    setDelegating(true);
    setTimeout(() => setDelegating(false), 1500);
  }

  return (
    <div className="demo-container">
      <input className="demo-input" defaultValue="Build a website landing page" disabled={delegating} style={{ marginBottom: '10px' }} />
      <button className="demo-btn" onClick={delegate}>{delegating ? 'Delegating...' : 'Delegate Task'}</button>
      <div style={{ marginTop: '20px' }}>
        <ul className="task-list">
          {tasks.map((task, i) => (
            <li key={i} className={`task-item${task.done ? ' completed' : ''}`}>
              <div
                className={`task-checkbox${task.done ? ' checked' : ''}`}
                onClick={() => toggleTask(i)}
              />
              <span className="task-text">{task.text}</span>
              <span className="task-agent">{task.agent}</span>
            </li>
          ))}
        </ul>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '10px' }}>
          Overall Progress: <span>{progress}</span>%
        </p>
      </div>
    </div>
  );
}
