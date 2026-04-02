'use client';
import { useState, useRef, useEffect } from 'react';

const initialTasks = [
  { text: 'Design mockups', agent: 'DesignAgent', done: true },
  { text: 'Write copy', agent: 'ContentBot', done: true },
  { text: 'Develop frontend', agent: 'CodeAgent', done: false },
];

const mockAgents = ['DesignAgent', 'ContentBot', 'CodeAgent', 'ResearchBot', 'DataAnalyzer', 'DevOpsOp'];

export default function DelegationDemo() {
  const [tasks, setTasks] = useState(initialTasks);
  const [delegating, setDelegating] = useState(false);
  const [inputValue, setInputValue] = useState('Build a website landing page');
  const [log, setLog] = useState([]);

  const completed = tasks.filter(t => t.done).length;
  const progress = tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100);

  function toggleTask(i) {
    if (delegating) return; // Disable clicking while delegating
    setTasks(prev => prev.map((t, idx) => idx === i ? { ...t, done: !t.done } : t));
  }

  function handleDelegate(e) {
    e.preventDefault();
    if (!inputValue.trim() || delegating) return;

    setDelegating(true);
    setTasks([]);
    setLog([{ text: `Analyzing task: "${inputValue}"...`, type: 'info' }]);

    // Simulated Breakdown logic
    const words = inputValue.split(' ').filter(w => w.length > 3);
    const subtaskCount = Math.max(2, Math.min(5, Math.floor(Math.random() * 3) + 3)); // 3 to 5 subtasks

    let generatedTasks = [];

    setTimeout(() => {
      setLog(prev => [...prev, { text: `> Creating breakdown plan using PlannerBot...`, type: '' }]);
      
      let step = 0;
      const interval = setInterval(() => {
        if (step < subtaskCount) {
           const actionStr = ['Draft', 'Review', 'Execute', 'Analyze', 'Compile'][step % 5];
           const targetStr = words[step % words.length] || 'deliverable';
           const newTask = { text: `${actionStr} phase for ${targetStr}`, agent: mockAgents[Math.floor(Math.random() * mockAgents.length)], done: false };
           
           generatedTasks.push(newTask);
           setTasks([...generatedTasks]); // Update state
           setLog(prev => [...prev, { text: `Assigned: ${newTask.text} -> ${newTask.agent}`, type: 'success' }]);
           
           step++;
        } else {
           clearInterval(interval);
           setLog(prev => [...prev, { text: `Delegation complete. Awaiting execution.`, type: 'info' }]);
           setDelegating(false);
        }
      }, 600); // add one task every 600ms

    }, 800);
  }

  return (
    <div className="demo-container">
      <form onSubmit={handleDelegate} style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input 
          className="demo-input" 
          value={inputValue} 
          onChange={(e) => setInputValue(e.target.value)} 
          disabled={delegating} 
          placeholder="Enter a complex task to delegate..."
          style={{ marginBottom: '0', flex: 1 }} 
        />
        <button type="submit" className="demo-btn" disabled={delegating}>
          {delegating ? 'Delegating...' : 'Delegate'}
        </button>
      </form>
      
      <div style={{ marginTop: '20px' }}>
        {tasks.length > 0 && (
          <ul className="task-list">
            {tasks.map((task, i) => (
              <li key={i} className={`task-item${task.done ? ' completed' : ''} ${delegating ? 'count-animate' : ''}`}>
                <div
                  className={`task-checkbox${task.done ? ' checked' : ''}`}
                  onClick={() => toggleTask(i)}
                  style={{ cursor: delegating ? 'not-allowed' : 'pointer' }}
                />
                <span className="task-text">{task.text}</span>
                <span className="task-agent">{task.agent}</span>
              </li>
            ))}
          </ul>
        )}
        
        {tasks.length > 0 && !delegating && (
           <>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p style={{ color: 'var(--text-dim)', fontSize: '12px', marginTop: '10px' }}>
                Overall Progress: <span>{progress}</span>%
              </p>
           </>
        )}

        {log.length > 0 && (
            <div className="action-log" style={{ marginTop: '15px' }}>
                {log.map((entry, i) => (
                    <div key={i} className={`log-entry${entry.type ? ' ' + entry.type : ''}`}>{entry.text}</div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
