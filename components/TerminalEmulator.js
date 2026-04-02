'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { skills } from '@/data/skills';
import { plugins } from '@/data/plugins';

const BOOT_LINES = [
  { text: 'ADAM Terminal v3.2.1 — Autonomous Digital Assistant Mind', delay: 0 },
  { text: 'Copyright (c) 2026 ADAM Systems. All rights reserved.', delay: 100 },
  { text: '', delay: 200 },
  { text: '> Initializing kernel modules...', delay: 300 },
  { text: '> Loading skill drivers [8/8]...............OK', delay: 600 },
  { text: '> Loading plugin interfaces [12/12].........OK', delay: 900 },
  { text: '> Establishing neural pathways..............OK', delay: 1200 },
  { text: '> Memory subsystem online...................OK', delay: 1500 },
  { text: '', delay: 1700 },
  { text: 'System ready. Type "help" for available commands.', delay: 1800 },
  { text: '', delay: 1900 },
];

const HELP_TEXT = `╔══════════════════════════════════════════════════════════════╗
║                    AVAILABLE COMMANDS                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  NAVIGATION                                                  ║
║    ls skills          List all installed skills               ║
║    ls plugins         List all connected plugins             ║
║    cat <name>         Show details of a skill or plugin       ║
║    cd <page>          Navigate to a page (home/docs/ask)      ║
║                                                              ║
║  SYSTEM                                                      ║
║    status             Show system status & metrics            ║
║    whoami             Display current user identity           ║
║    uptime             Show system uptime                      ║
║    neofetch           System information display              ║
║                                                              ║
║  PLUGINS                                                     ║
║    connect <plugin>   Simulate plugin OAuth connection        ║
║    disconnect <plugin> Disconnect a plugin                    ║
║    connections        List active plugin connections          ║
║                                                              ║
║  UTILITIES                                                   ║
║    echo <text>        Print text to terminal                  ║
║    clear              Clear terminal output                   ║
║    history            Show command history                    ║
║    help               Show this help message                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;

const NEOFETCH = `
        ██████╗     adam@neural-core
       ██╔═══██╗    ──────────────────
       ██║   ██║    OS:      ADAM OS v3.2.1
       ██║   ██║    Host:    Neural Core Mk.IV
       ██║▄▄▄██║    Kernel:  cortex-6.1.0-pretext
       ╚██████╔╝    Uptime:  {UPTIME}
        ╚═════╝     Shell:   adam-sh 2.0
                    Terminal: ADAM Terminal
    A  D  A  M      CPU:     Quantum Inference Engine
                    Memory:  ∞ (elastic neural mesh)
                    Skills:  8 loaded
                    Plugins: 12 available
                    Theme:   Cyberpunk Green
`;

function getUptime() {
  const start = localStorage.getItem('adam_terminal_start');
  if (!start) {
    localStorage.setItem('adam_terminal_start', Date.now().toString());
    return '0m 0s';
  }
  const elapsed = Date.now() - parseInt(start);
  const hours = Math.floor(elapsed / 3600000);
  const mins = Math.floor((elapsed % 3600000) / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function TerminalEmulator() {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [booted, setBooted] = useState(false);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [connections, setConnections] = useState({});
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const router = useRouter();

  // Load persisted state
  useEffect(() => {
    const savedHistory = localStorage.getItem('adam_terminal_history');
    if (savedHistory) setCmdHistory(JSON.parse(savedHistory));

    const savedConnections = localStorage.getItem('adam_terminal_connections');
    if (savedConnections) setConnections(JSON.parse(savedConnections));
  }, []);

  // Boot sequence
  useEffect(() => {
    const timeouts = [];
    BOOT_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        setLines(prev => [...prev, { text: line.text, type: 'system' }]);
        if (i === BOOT_LINES.length - 1) setBooted(true);
      }, line.delay);
      timeouts.push(t);
    });
    return () => timeouts.forEach(clearTimeout);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Focus input
  useEffect(() => {
    if (booted && inputRef.current) inputRef.current.focus();
  }, [booted]);

  // Save connections
  useEffect(() => {
    if (Object.keys(connections).length > 0) {
      localStorage.setItem('adam_terminal_connections', JSON.stringify(connections));
    }
  }, [connections]);

  const addLine = useCallback((text, type = 'output') => {
    setLines(prev => [...prev, { text, type }]);
  }, []);

  const addLines = useCallback((texts, type = 'output') => {
    setLines(prev => [...prev, ...texts.map(t => ({ text: t, type }))]);
  }, []);

  const processCommand = useCallback((rawCmd) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Add to history
    const newHistory = [cmd, ...cmdHistory.filter(h => h !== cmd)].slice(0, 50);
    setCmdHistory(newHistory);
    localStorage.setItem('adam_terminal_history', JSON.stringify(newHistory));
    setHistoryIndex(-1);

    // Echo the command
    addLine(`adam@neural-core:~$ ${cmd}`, 'command');

    const parts = cmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (command) {
      case 'help':
        addLine(HELP_TEXT, 'system');
        break;

      case 'clear':
        setLines([]);
        break;

      case 'ls': {
        const target = args[0]?.toLowerCase();
        if (target === 'skills') {
          addLine('');
          addLine('  INSTALLED SKILLS', 'system');
          addLine('  ════════════════════════════════════════', 'system');
          skills.forEach(s => {
            addLine(`  ${s.icon}  ${s.title.padEnd(15)} [${s.category.toUpperCase()}]  ${s.tagline}`);
          });
          addLine('');
          addLine(`  Total: ${skills.length} skills loaded.`, 'success');
        } else if (target === 'plugins') {
          addLine('');
          addLine('  AVAILABLE PLUGINS', 'system');
          addLine('  ════════════════════════════════════════', 'system');
          plugins.forEach(p => {
            const connected = connections[p.slug] ? '● CONNECTED' : '○ available';
            const statusColor = connections[p.slug] ? 'success' : 'output';
            addLine(`  ${p.icon}  ${p.title.padEnd(15)} [${p.category.toUpperCase().padEnd(14)}]  ${connected}`);
          });
          addLine('');
          addLine(`  Total: ${plugins.length} plugins (${Object.keys(connections).length} connected).`, 'success');
        } else {
          addLine('Usage: ls skills | ls plugins');
        }
        break;
      }

      case 'cat': {
        const name = args.join(' ').toLowerCase();
        const skill = skills.find(s => s.slug === name || s.title.toLowerCase() === name);
        const plugin = plugins.find(p => p.slug === name || p.title.toLowerCase() === name);
        const item = skill || plugin;

        if (!item) {
          addLine(`cat: ${name}: No such skill or plugin`, 'error');
          addLine(`  Try: cat research, cat github, cat content ...`);
          break;
        }

        addLine('');
        addLine(`  ┌─── ${item.icon} ${item.title.toUpperCase()} ───`, 'system');
        addLine(`  │ Category:  ${item.category}`);
        addLine(`  │ Type:      ${skill ? 'Core Skill' : 'Plugin'}`);
        addLine(`  │`);
        addLine(`  │ ${item.description || item.tagline}`);
        addLine(`  │`);
        addLine(`  │ Capabilities:`, 'system');
        item.capabilities.forEach(c => addLine(`  │   • ${c}`));
        if (item.exampleUsage) {
          addLine(`  │`);
          addLine(`  │ Usage Examples:`, 'system');
          item.exampleUsage.split('\n').forEach(l => addLine(`  │   ${l}`));
        }
        addLine(`  └${'─'.repeat(40)}`, 'system');
        addLine('');
        break;
      }

      case 'cd': {
        const page = args[0]?.toLowerCase();
        const routes = {
          'home': '/', '/': '/',
          'skills': '/skills',
          'plugins': '/plugins',
          'docs': '/docs',
          'ask': '/ask-adam', 'ask-adam': '/ask-adam',
          'terminal': '/terminal',
        };

        if (!page || !routes[page]) {
          addLine(`cd: ${page || '?'}: No such directory`, 'error');
          addLine(`  Available: home, skills, plugins, docs, ask, terminal`);
        } else {
          addLine(`Navigating to ${page}...`, 'success');
          setTimeout(() => router.push(routes[page]), 600);
        }
        break;
      }

      case 'status':
        addLine('');
        addLine('  ╔══════════ SYSTEM STATUS ══════════╗', 'system');
        addLine(`  ║  Uptime:       ${getUptime().padEnd(19)}║`);
        addLine(`  ║  CPU Load:     ${(Math.random() * 20 + 5).toFixed(1).padStart(5)}%${''.padEnd(13)}║`);
        addLine(`  ║  Memory:       ${(Math.random() * 30 + 20).toFixed(1).padStart(5)}%${''.padEnd(13)}║`);
        addLine(`  ║  Neural Cores: 8/8 active${''.padEnd(8)}║`);
        addLine(`  ║  Skills:       ${skills.length}/8 loaded${''.padEnd(9)}║`);
        addLine(`  ║  Plugins:      ${Object.keys(connections).length}/${plugins.length} connected${''.padEnd(5)}║`);
        addLine(`  ║  API Status:   ● OPERATIONAL${''.padEnd(5)}║`, 'success');
        addLine('  ╚══════════════════════════════════╝', 'system');
        addLine('');
        break;

      case 'whoami':
        addLine('');
        addLine('  User:    root@adam-neural-core');
        addLine('  Role:    System Administrator');
        addLine('  Access:  Level 5 (Full Clearance)');
        addLine('  Session: ' + new Date().toISOString());
        addLine('');
        break;

      case 'uptime':
        addLine(`  System uptime: ${getUptime()}`);
        break;

      case 'neofetch':
        addLine(NEOFETCH.replace('{UPTIME}', getUptime()), 'system');
        break;

      case 'connect': {
        const pluginName = args.join(' ').toLowerCase();
        const plugin = plugins.find(p => p.slug === pluginName || p.title.toLowerCase() === pluginName);

        if (!plugin) {
          addLine(`connect: ${pluginName}: Plugin not found`, 'error');
          addLine(`  Try: connect github, connect spotify ...`);
          break;
        }

        if (connections[plugin.slug]) {
          addLine(`  ${plugin.icon} ${plugin.title} is already connected.`, 'system');
          break;
        }

        addLine('');
        addLine(`  Initiating OAuth handshake with ${plugin.title}...`, 'system');

        // Simulate OAuth flow
        setTimeout(() => addLine(`  [1/4] Requesting authorization token...`), 400);
        setTimeout(() => addLine(`  [2/4] Verifying credentials...`), 900);
        setTimeout(() => addLine(`  [3/4] Exchanging tokens...`), 1400);
        setTimeout(() => addLine(`  [4/4] Establishing secure channel...`), 1900);
        setTimeout(() => {
          setConnections(prev => ({ ...prev, [plugin.slug]: { connectedAt: new Date().toISOString() } }));
          addLine('');
          addLine(`  ✓ ${plugin.icon} ${plugin.title} connected successfully!`, 'success');
          addLine(`    Capabilities unlocked: ${plugin.capabilities.length}`);
          addLine('');
        }, 2400);
        break;
      }

      case 'disconnect': {
        const pluginName = args.join(' ').toLowerCase();
        const plugin = plugins.find(p => p.slug === pluginName || p.title.toLowerCase() === pluginName);

        if (!plugin) {
          addLine(`disconnect: ${pluginName}: Plugin not found`, 'error');
          break;
        }

        if (!connections[plugin.slug]) {
          addLine(`  ${plugin.icon} ${plugin.title} is not connected.`, 'system');
          break;
        }

        setConnections(prev => {
          const next = { ...prev };
          delete next[plugin.slug];
          localStorage.setItem('adam_terminal_connections', JSON.stringify(next));
          return next;
        });
        addLine(`  ✗ ${plugin.icon} ${plugin.title} disconnected.`);
        break;
      }

      case 'connections': {
        const active = Object.entries(connections);
        if (active.length === 0) {
          addLine('  No active plugin connections.');
          addLine('  Use "connect <plugin>" to connect one.');
          break;
        }
        addLine('');
        addLine('  ACTIVE CONNECTIONS', 'system');
        addLine('  ══════════════════════════════════', 'system');
        active.forEach(([slug, data]) => {
          const plugin = plugins.find(p => p.slug === slug);
          if (plugin) {
            addLine(`  ● ${plugin.icon} ${plugin.title.padEnd(15)} Connected: ${data.connectedAt}`, 'success');
          }
        });
        addLine('');
        break;
      }

      case 'echo':
        addLine(args.join(' '));
        break;

      case 'history': {
        if (cmdHistory.length === 0) {
          addLine('  No command history.');
          break;
        }
        addLine('');
        addLine('  COMMAND HISTORY', 'system');
        addLine('  ══════════════════════════════════', 'system');
        cmdHistory.slice(0, 20).forEach((h, i) => {
          addLine(`  ${String(i + 1).padStart(3)}.  ${h}`);
        });
        addLine('');
        break;
      }

      case 'date':
        addLine(`  ${new Date().toString()}`);
        break;

      case 'ping':
        addLine('  PING adam-neural-core (127.0.0.1): 56 data bytes');
        setTimeout(() => addLine(`  64 bytes from 127.0.0.1: time=${(Math.random() * 2 + 0.1).toFixed(1)}ms`), 300);
        setTimeout(() => addLine(`  64 bytes from 127.0.0.1: time=${(Math.random() * 2 + 0.1).toFixed(1)}ms`), 600);
        setTimeout(() => addLine(`  64 bytes from 127.0.0.1: time=${(Math.random() * 2 + 0.1).toFixed(1)}ms`), 900);
        setTimeout(() => {
          addLine('');
          addLine('  --- adam-neural-core ping statistics ---');
          addLine('  3 packets transmitted, 3 received, 0% loss');
        }, 1200);
        break;

      case 'sudo':
        addLine('  Nice try. You already have root access.', 'system');
        break;

      case 'exit':
        addLine('  Closing terminal session...', 'system');
        setTimeout(() => router.push('/'), 800);
        break;

      default:
        addLine(`  adam-sh: ${command}: command not found`, 'error');
        addLine(`  Type "help" for available commands.`);
    }
  }, [addLine, addLines, cmdHistory, connections, router]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) {
      addLine('adam@neural-core:~$ ', 'command');
      return;
    }
    processCommand(input);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIndex = Math.min(historyIndex + 1, cmdHistory.length - 1);
      setHistoryIndex(newIndex);
      setInput(cmdHistory[newIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex <= 0) {
        setHistoryIndex(-1);
        setInput('');
        return;
      }
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInput(cmdHistory[newIndex]);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Basic tab completion
      const partial = input.toLowerCase();
      const allCommands = ['help', 'clear', 'ls', 'cat', 'cd', 'status', 'whoami', 'uptime', 'neofetch', 'connect', 'disconnect', 'connections', 'echo', 'history', 'date', 'ping', 'exit'];
      const match = allCommands.find(c => c.startsWith(partial));
      if (match) setInput(match + ' ');
    }
  }

  function getLineColor(type) {
    switch (type) {
      case 'command': return '#888';
      case 'system': return '#228B22';
      case 'error': return '#ff5f57';
      case 'success': return '#28ca41';
      default: return '#e0e0e0';
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#000',
        fontFamily: '"Courier New", monospace',
        fontSize: '14px',
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          paddingBottom: '0',
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            style={{
              color: getLineColor(line.type),
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              lineHeight: '1.5',
              minHeight: line.text === '' ? '14px' : 'auto',
            }}
          >
            {line.text}
          </div>
        ))}
      </div>

      {booted && (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '10px 20px 20px',
            gap: '8px',
          }}
        >
          <span style={{ color: '#228B22', whiteSpace: 'nowrap' }}>adam@neural-core:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#e0e0e0',
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              caretColor: '#228B22',
            }}
            spellCheck="false"
            autoComplete="off"
            autoCapitalize="off"
          />
          <span className="cursor-blink"></span>
        </form>
      )}
    </div>
  );
}
