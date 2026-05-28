'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Lazy-load all interactive demos
const SearchDemo = dynamic(() => import('@/components/demos/SearchDemo'), { ssr: false });
const ContentGeneratorDemo = dynamic(() => import('@/components/demos/ContentGeneratorDemo'), { ssr: false });
const ActivityGraph = dynamic(() => import('@/components/demos/ActivityGraph'), { ssr: false });
const FlowDiagram = dynamic(() => import('@/components/demos/FlowDiagram'), { ssr: false });
const DataAnalyzerDemo = dynamic(() => import('@/components/demos/DataAnalyzerDemo'), { ssr: false });
const DelegationDemo = dynamic(() => import('@/components/demos/DelegationDemo'), { ssr: false });
const MonitoringDemo = dynamic(() => import('@/components/demos/MonitoringDemo'), { ssr: false });
const WebAutomationDemo = dynamic(() => import('@/components/demos/WebAutomationDemo'), { ssr: false });
const FileManagerDemo = dynamic(() => import('@/components/demos/FileManagerDemo'), { ssr: false });

const weeklyData = [
  { label: 'Mon', value: 60 }, { label: 'Tue', value: 80 }, { label: 'Wed', value: 45 },
  { label: 'Thu', value: 90 }, { label: 'Fri', value: 70 }, { label: 'Sat', value: 30 }, { label: 'Sun', value: 50 },
];
const contentData = [
  { label: 'Mon', value: 65 }, { label: 'Tue', value: 80 }, { label: 'Wed', value: 55 },
  { label: 'Thu', value: 90 }, { label: 'Fri', value: 70 }, { label: 'Sat', value: 40 }, { label: 'Sun', value: 50 },
];

export default function SkillDetailClient({ slug }) {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (slug === 'research') {
    return (
      <>
        <div className="detail-section reveal reveal-delay-1">
          <h2>// Live Demo: Research Search</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '15px' }}>Try the research module! Type a query and see results appear.</p>
          <SearchDemo />
        </div>
        <div className="detail-section reveal reveal-delay-2">
          <h2>// Research Process Flow</h2>
          <FlowDiagram />
        </div>
        <div className="detail-section reveal reveal-delay-3">
          <h2>// Research Activity</h2>
          <ActivityGraph data={weeklyData} title="Queries Processed (Last 7 Days)" />
        </div>
      </>
    );
  }

  if (slug === 'content') {
    return (
      <>
        <div className="detail-section reveal reveal-delay-1">
          <h2>// Live Demo: Content Generator</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: '15px' }}>Select a content type and enter a topic to see the generator in action.</p>
          <ContentGeneratorDemo />
        </div>
        <div className="detail-section reveal">
          <h2>// Content Output Stats</h2>
          <ActivityGraph data={contentData} title="Content Generated This Week" />
        </div>
      </>
    );
  }

  if (slug === 'code') {
    return (
      <div className="detail-section">
        <h2>// Animated Code Snippet</h2>
        <div className="code-animation-container">
          <pre className="animated-code visible">
            <span className="token-keyword">def</span>{' '}
            <span className="token-function">calculate_fibonacci</span>(n):{'\n'}
            {'    '}<span className="token-comment"># Calculates the nth Fibonacci number recursively</span>{'\n'}
            {'    '}<span className="token-keyword">if</span> n {'<='} <span className="token-number">1</span>:{'\n'}
            {'        '}<span className="token-keyword">return</span> n{'\n'}
            {'    '}<span className="token-keyword">else</span>:{'\n'}
            {'        '}<span className="token-keyword">return</span>{' '}
            <span className="token-function">calculate_fibonacci</span>(n-1) +{' '}
            <span className="token-function">calculate_fibonacci</span>(n-2)
          </pre>
        </div>
      </div>
    );
  }

  if (slug === 'data') {
    return (
      <div className="detail-section reveal">
        <h2>// Live Demo: Data Analyzer</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '15px' }}>Click &quot;Analyze&quot; to process sample sales data and generate insights.</p>
        <DataAnalyzerDemo />
      </div>
    );
  }

  if (slug === 'delegation') {
    return (
      <div className="detail-section reveal">
        <h2>// Live Demo: Task Delegator</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '15px' }}>Enter a task and ADAM will break it down and delegate to agents.</p>
        <DelegationDemo />
      </div>
    );
  }

  if (slug === 'monitoring') {
    return (
      <div className="detail-section reveal">
        <h2>// Live Demo: System Monitor</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '15px' }}>Real-time system metrics. Click &quot;Refresh&quot; to update.</p>
        <MonitoringDemo />
      </div>
    );
  }

  if (slug === 'web') {
    return (
      <div className="detail-section reveal">
        <h2>// Live Demo: Form Automation</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '15px' }}>Watch ADAM automate a contact form step by step.</p>
        <WebAutomationDemo />
      </div>
    );
  }

  if (slug === 'files') {
    return (
      <div className="detail-section reveal">
        <h2>// Live Demo: File Manager</h2>
        <p style={{ color: 'var(--text-dim)', marginBottom: '15px' }}>Click on files to preview content. Use buttons to simulate file operations.</p>
        <FileManagerDemo />
      </div>
    );
  }

  return null;
}
