'use client';
import { useState } from 'react';

const mockContent = {
  email: {
    title: "Professional Email Draft",
    body: `Subject: Boosting Team Productivity with AI Assistants

Hi Team,

I wanted to share some exciting developments in AI technology that could significantly enhance our workflow. Recent studies show that AI assistants can boost individual productivity by up to 40%.

Key Benefits:
• Automated research and summarization
• Smart email drafting and responses
• Code review and debugging assistance

I'd like to schedule a demo next week. Let me know your availability.

Best regards`,
  },
  blog: {
    title: "Blog Post Draft",
    body: `# The Future of Work: How AI Assistants are Transforming Productivity

*Published March 2026*

The workplace is evolving rapidly, and AI assistants are at the forefront of this transformation...

## Key Takeaways

1. **Increased Efficiency**: Tasks that once took hours now take minutes
2. **Better Work-Life Balance**: Less overtime, more meaningful work
3. **Continuous Learning**: AI adapts to your specific needs and preferences

*Stay tuned for Part 2, where we dive into implementation strategies...*`,
  },
  product: {
    title: "Product Description",
    body: `## AI Assistant Pro

**Transform your workflow with intelligent automation.**

AI Assistant Pro is the ultimate digital companion for professionals who value efficiency:

✓ Draft emails in seconds
✓ Research topics comprehensively
✓ Write code with confidence
✓ Stay organized and on-track

*Join thousands of satisfied users. Start your free trial today.*`,
  },
};

export default function ContentGeneratorDemo() {
  const [type, setType] = useState('email');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  function generate() {
    setLoading(true);
    setPreview(null);
    setTimeout(() => {
      setPreview(mockContent[type]);
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="demo-container">
      <div className="demo-tabs">
        {['email', 'blog', 'product'].map(t => (
          <button
            key={t}
            className={`demo-tab${type === t ? ' active' : ''}`}
            onClick={() => setType(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>
      <textarea
        className="demo-textarea"
        defaultValue="AI assistants improving productivity"
        readOnly
      />
      <button className="demo-btn" onClick={generate} style={{ marginTop: '10px' }}>
        Generate Content
      </button>
      <div className="demo-preview">
        {loading && (
          <>
            <div className="demo-preview-title">Generating...</div>
            <div style={{ color: 'var(--primary)' }}>✍️ Writing your content...</div>
          </>
        )}
        {!loading && !preview && (
          <>
            <div className="demo-preview-title">Generated Content</div>
            <div style={{ color: 'var(--text-dim)' }}>Your content will appear here...</div>
          </>
        )}
        {preview && !loading && (
          <>
            <div className="demo-preview-title">{preview.title}</div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '13px' }}>{preview.body}</div>
          </>
        )}
      </div>
    </div>
  );
}
