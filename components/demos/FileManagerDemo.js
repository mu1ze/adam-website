'use client';
import { useState, useCallback } from 'react';

const initialFiles = [
  { name: 'README.md', icon: '📄', size: '2.4 KB', content: '# My Project\n\nA sample project demonstrating file management capabilities.\n\n## Features\n- File listing\n- Content preview\n- Git operations' },
  { name: 'config.json', icon: '⚙️', size: '512 B', content: '{\n  "name": "my-project",\n  "version": "1.0.0",\n  "settings": {\n    "theme": "dark",\n    "debug": false\n  }\n}' },
  { name: 'index.html', icon: '🌐', size: '1.8 KB', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Welcome</h1>\n</body>\n</html>' },
  { name: 'script.js', icon: '📜', size: '4.2 KB', content: "// Main application script\n\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('App initialized');\n});" },
  { name: 'styles.css', icon: '🎨', size: '3.1 KB', content: '/* Main stylesheet */\n\nbody {\n  font-family: system-ui, sans-serif;\n  background: #0a0a0a;\n  color: #e0e0e0;\n}' },
];

export default function FileManagerDemo() {
  const [files, setFiles] = useState(initialFiles);
  const [selectedName, setSelectedName] = useState(null);
  const [logs, setLogs] = useState([{ text: '> File system initialized. Initial commit.', type: 'info', time: new Date().toLocaleTimeString() }]);
  const [unstaged, setUnstaged] = useState(new Set()); // tracking modified files

  const selectedFile = files.find(f => f.name === selectedName);

  const addLog = useCallback((msg, type) => {
    setLogs(prev => {
        const timestamp = new Date().toLocaleTimeString();
        return [{ text: `[${timestamp}] > ${msg}`, type }, ...prev].slice(0, 8);
    });
  }, []);

  function handleSelect(name) {
    setSelectedName(name);
  }

  function createFile() {
    const defaultName = `new_file_${Date.now()}.txt`;
    const newFile = { name: defaultName, icon: '📄', size: '0 B', content: '' };
    setFiles([newFile, ...files]);
    setSelectedName(defaultName);
    
    const newUnstaged = new Set(unstaged);
    newUnstaged.add(defaultName);
    setUnstaged(newUnstaged);

    addLog(`Created new file ${defaultName}`, 'success');
  }

  function deleteFile(name, e) {
    if (e) e.stopPropagation();
    setFiles(prev => prev.filter(f => f.name !== name));
    if (selectedName === name) setSelectedName(null);
    
    // Add to unstaged as a deletion (tracked loosely for demo purposes by removing it later on commit)
    const newUnstaged = new Set(unstaged);
    newUnstaged.add(`Deleted ${name}`);
    setUnstaged(newUnstaged);
    
    addLog(`Deleted ${name}`, '');
  }

  function handleContentChange(e) {
    if (!selectedFile) return;
    const newContent = e.target.value;
    
    setFiles(prev => prev.map(f => f.name === selectedName ? { ...f, content: newContent, size: `${Math.max(1, Math.round(newContent.length / 1024 * 10) / 10)} KB` } : f));
    
    const newUnstaged = new Set(unstaged);
    newUnstaged.add(selectedName);
    setUnstaged(newUnstaged);
  }

  function commitChanges() {
    if (unstaged.size === 0) {
      addLog('No changes to commit (working tree clean).', 'info');
      return;
    }

    addLog(`Committing ${unstaged.size} changes...`, 'info');
    
    setTimeout(() => {
        // Mock git log
        const changedArray = Array.from(unstaged);
        changedArray.forEach(ch => {
            if (ch.startsWith('Deleted')) {
                 addLog(`[GIT] rm ${ch.replace('Deleted ', '')}`, '');
            } else {
                 addLog(`[GIT] + modified ${ch}`, 'success');
            }
        });
        
        addLog(`Commit complete: "Update application files" [${Math.random().toString(16).substring(2, 9)}]`, 'info');
        setUnstaged(new Set());
    }, 600);
  }

  return (
    <div className="demo-container">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button className="demo-btn" onClick={createFile}>+ New File</button>
        <button className="demo-btn" onClick={commitChanges} style={{ background: unstaged.size > 0 ? '#ffbd2e' : 'var(--bg-secondary)', color: unstaged.size > 0 ? '#000' : 'var(--text)' }}>
             ✓ Commit ({unstaged.size} pending)
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
          <div className="file-tree" style={{ margin: 0, height: '350px', overflowY: 'auto' }}>
            {files.length === 0 ? <p style={{ color: 'var(--text-dim)', textAlign: 'center', marginTop: '20px' }}>Directory empty.</p> : null}
            {files.map((file, i) => (
              <div
                key={file.name}
                className={`file-item${selectedName === file.name ? ' selected' : ''}`}
                onClick={() => handleSelect(file.name)}
                style={{ marginLeft: 0, paddingLeft: '10px', display: 'flex', alignItems: 'center' }}
              >
                <span className="file-icon">{file.icon}</span>
                <span className="file-name" style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {file.name} {unstaged.has(file.name) ? <span style={{ color: '#ffbd2e' }}>*</span> : null}
                </span>
                <button 
                  onClick={(e) => deleteFile(file.name, e)}
                  style={{ background: 'none', border: 'none', color: '#ff5f57', cursor: 'pointer', padding: '0 5px' }}
                  title="Delete File"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="file-preview" style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div className="file-preview-header">
                  <span className="file-preview-title">
                      {selectedFile ? `${selectedFile.name} (${selectedFile.size})`  : 'Select a file to edit'}
                  </span>
                </div>
                {selectedFile ? (
                    <textarea 
                        className="demo-textarea" 
                        value={selectedFile.content}
                        onChange={handleContentChange}
                        style={{ flex: 1, height: '100%', border: 'none', background: 'transparent', resize: 'none', padding: 0 }}
                    />
                ) : (
                    <div className="file-preview-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        Workspace empty. Click a file on the left or create a new one.
                    </div>
                )}
              </div>
          </div>
      </div>

      <div style={{ marginTop: '20px' }}>
          <h3 style={{ color: 'var(--primary)', fontSize: '14px', marginBottom: '10px' }}>Terminal Output</h3>
          <div className="action-log" style={{ margin: 0, height: '150px' }}>
            {logs.map((log, i) => (
              <div key={i} className={`log-entry${log.type ? ' ' + log.type : ''}`}>
                  {log.text}
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
