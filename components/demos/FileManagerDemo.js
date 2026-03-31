'use client';
import { useState } from 'react';

const initialFiles = [
  { name: 'README.md', icon: '📄', size: '2.4 KB', content: '# My Project\n\nA sample project demonstrating file management capabilities.\n\n## Features\n- File listing\n- Content preview\n- Git operations' },
  { name: 'config.json', icon: '⚙️', size: '512 B', content: '{\n  "name": "my-project",\n  "version": "1.0.0",\n  "settings": {\n    "theme": "dark",\n    "debug": false\n  }\n}' },
  { name: 'index.html', icon: '🌐', size: '1.8 KB', content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>My Project</title>\n</head>\n<body>\n  <h1>Welcome</h1>\n</body>\n</html>' },
  { name: 'script.js', icon: '📜', size: '4.2 KB', content: "// Main application script\n\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('App initialized');\n});" },
  { name: 'styles.css', icon: '🎨', size: '3.1 KB', content: '/* Main stylesheet */\n\nbody {\n  font-family: system-ui, sans-serif;\n  background: #0a0a0a;\n  color: #e0e0e0;\n}' },
];

export default function FileManagerDemo() {
  const [files, setFiles] = useState(initialFiles);
  const [selected, setSelected] = useState(null);
  const [logs, setLogs] = useState([{ text: 'File system initialized', type: '' }]);

  function addLog(msg, type) {
    setLogs(prev => [...prev, { text: '> ' + msg, type }]);
  }

  function selectFile(file) {
    setSelected(file);
    addLog(`Opened ${file.name}`, 'info');
  }

  function createFile() {
    const newFile = { name: `new_file_${Date.now()}.txt`, icon: '📄', size: '0 B', content: '' };
    setFiles(prev => [...prev, newFile]);
    addLog(`Created ${newFile.name}`, 'success');
  }

  function refreshFiles() {
    addLog('Refreshing file list...', 'info');
    setTimeout(() => addLog('File list up to date', 'success'), 300);
  }

  function commitChanges() {
    if (selected) {
      addLog(`Committing ${selected.name}...`, 'info');
      setTimeout(() => addLog('Changes committed: 1 file', 'success'), 500);
    } else {
      addLog('No file selected to commit', 'info');
    }
  }

  return (
    <div className="demo-container">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button className="demo-btn" onClick={createFile}>+ New File</button>
        <button className="demo-btn" onClick={refreshFiles}>↻ Refresh</button>
        <button className="demo-btn" onClick={commitChanges}>✓ Commit</button>
      </div>

      <div className="file-tree">
        {files.map((file, i) => (
          <div
            key={i}
            className={`file-item${selected?.name === file.name ? ' selected' : ''}`}
            onClick={() => selectFile(file)}
          >
            <span className="file-icon">{file.icon}</span>
            <span className="file-name">{file.name}</span>
            <span className="file-meta">{file.size}</span>
          </div>
        ))}
      </div>

      <div className="file-preview">
        <div className="file-preview-header">
          <span className="file-preview-title">{selected ? selected.name : 'Select a file to preview'}</span>
        </div>
        <div className="file-preview-content">
          {selected ? selected.content : 'Click on any file to see its contents here...'}
        </div>
      </div>

      <div className="action-log">
        {logs.map((log, i) => (
          <div key={i} className={`log-entry${log.type ? ' ' + log.type : ''}`}>{log.text}</div>
        ))}
      </div>
    </div>
  );
}
