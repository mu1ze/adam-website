'use client';
import { useState } from 'react';

const automationSteps = [
  {
    step: 1, action: 'Navigating to example.com/contact...', url: 'example.com/contact',
    content: <p style={{ color: 'var(--text-dim)' }}>Loading page...</p>,
  },
  {
    step: 2, action: 'Filling name field: "John Doe"', url: 'example.com/contact',
    content: (
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-dim)' }}>Name</label>
        <input type="text" value="John Doe" readOnly style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--primary)', borderRadius: '4px', color: 'var(--primary)', fontFamily: 'inherit' }} />
      </div>
    ),
  },
  {
    step: 3, action: 'Filling email field: "john@example.com"', url: 'example.com/contact',
    content: (
      <>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-dim)' }}>Name</label>
          <input type="text" value="John Doe" readOnly style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--primary)', borderRadius: '4px', color: 'var(--primary)', fontFamily: 'inherit' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-dim)' }}>Email</label>
          <input type="email" value="john@example.com" readOnly style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--primary)', borderRadius: '4px', color: 'var(--primary)', fontFamily: 'inherit' }} />
        </div>
      </>
    ),
  },
  {
    step: 4, action: 'Submitting form...', url: 'example.com/contact',
    content: (
      <>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-dim)' }}>Name</label>
          <input type="text" value="John Doe" readOnly style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--primary)', borderRadius: '4px', color: 'var(--primary)', fontFamily: 'inherit' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-dim)' }}>Email</label>
          <input type="email" value="john@example.com" readOnly style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', fontFamily: 'inherit' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: 'var(--text-dim)' }}>Message</label>
          <textarea readOnly rows={3} style={{ width: '100%', padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '4px', color: 'var(--text)', fontFamily: 'inherit' }}>
            Hello, I would like to get in touch!
          </textarea>
        </div>
        <button style={{ background: 'var(--primary)', color: 'var(--bg)', border: 'none', padding: '12px 24px', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>Submit</button>
      </>
    ),
  },
];

const formStepLabels = ['Navigate', 'Fill Name', 'Fill Email', 'Submit'];

export default function WebAutomationDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [logs, setLogs] = useState([{ text: 'Waiting to start automation...', type: 'pending' }]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  function runAutomation() {
    if (done) {
      setCurrentStep(0);
      setLogs([{ text: 'Waiting to start automation...', type: 'pending' }]);
      setDone(false);
      return;
    }

    setRunning(true);
    const step = automationSteps[currentStep];
    setLogs(prev => [...prev, { text: '✓ ' + step.action, type: 'success' }]);
    setCurrentStep(prev => prev + 1);

    setTimeout(() => {
      setRunning(false);
      if (currentStep + 1 >= automationSteps.length) setDone(true);
    }, 800);
  }

  const activeStepIndex = done ? automationSteps.length - 1 : currentStep;
  const displayContent = done
    ? automationSteps[automationSteps.length - 1].content
    : currentStep > 0
    ? automationSteps[currentStep - 1].content
    : <p style={{ color: 'var(--text-dim)' }}>Form will appear here...</p>;

  return (
    <div className="demo-container">
      <div className="form-steps">
        {formStepLabels.map((label, i) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className={`form-step${i < activeStepIndex ? ' completed' : ''}${i === activeStepIndex && !done ? ' active' : ''}`}>
              <div className="form-step-number">{i + 1}</div>
              <div className="form-step-label">{label}</div>
            </div>
            {i < formStepLabels.length - 1 && <div className="form-arrow">→</div>}
          </div>
        ))}
      </div>

      <div className="browser-mockup">
        <div className="browser-header">
          <div className="browser-dot red" />
          <div className="browser-dot yellow" />
          <div className="browser-dot green" />
          <div className="browser-url">
            {currentStep > 0 ? automationSteps[Math.min(currentStep - 1, automationSteps.length - 1)].url : 'example.com/contact'}
          </div>
        </div>
        <div className="browser-content">{displayContent}</div>
      </div>

      <button
        className="demo-btn"
        id="runAutomation"
        onClick={runAutomation}
        disabled={running}
      >
        {done ? '↻ Restart' : running ? 'Running...' : currentStep === 0 ? '▶ Run Automation' : '▶ Continue'}
      </button>

      <div className="automation-log">
        {logs.map((log, i) => (
          <div key={i} className={`log-line ${log.type}`}>{log.text}</div>
        ))}
      </div>
    </div>
  );
}
