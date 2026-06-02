'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BOOT_LINES, ALL_COMMANDS } from '@/data/terminalStrings';
import { usePluginConnections } from '@/hooks/usePluginConnections';
import { useCommandHistory } from '@/hooks/useCommandHistory';
import { processCommand } from '@/commands';
import { getLineColor } from '@/commands/system';

export default function TerminalEmulator() {
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState('');
  const [booted, setBooted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const router = useRouter();
  const { connections, connect: connectPlugin, disconnect: disconnectPlugin } = usePluginConnections();
  const { cmdHistory, addCommand, navigateUp, navigateDown, currentInput } = useCommandHistory();

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth <= 768); }
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  useEffect(() => {
    if (booted && inputRef.current) inputRef.current.focus();
  }, [booted]);

  const addLine = useCallback((text, type = 'output') => {
    setLines(prev => [...prev, { text, type }]);
  }, []);

  const runCommand = useCallback((rawCmd) => {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    addCommand(cmd);
    addLine(`adam@neural-core:~$ ${cmd}`, 'command');

    const parts = cmd.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    const result = processCommand({
      command,
      args,
      addLine,
      connections,
      connectPlugin,
      disconnectPlugin,
      cmdHistory,
      router,
      isMobile,
    });

    if (result === 'clear') {
      setLines([]);
    }
  }, [addLine, addCommand, connections, connectPlugin, disconnectPlugin, cmdHistory, router, isMobile]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) {
      addLine('adam@neural-core:~$ ', 'command');
      return;
    }
    runCommand(input);
    setInput('');
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      navigateUp();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      navigateDown();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const partial = input.toLowerCase();
      const match = ALL_COMMANDS.find(c => c.startsWith(partial));
      if (match) setInput(match + ' ');
    }
  }

  useEffect(() => {
    if (currentInput !== null) setInput(currentInput);
  }, [currentInput]);

  return (
    <div
      className="terminal-shell"
      style={{ fontSize: isMobile ? '11px' : '14px' }}
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={scrollRef}
        className="terminal-scroll"
        style={{ paddingBottom: '0' }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className="terminal-line"
            style={{
              color: getLineColor(line.type),
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
          className="terminal-form"
          style={{ padding: '10px 20px 20px' }}
        >
          <span className="terminal-prompt" style={{ fontSize: isMobile ? '10px' : '14px' }}>{isMobile ? '$' : 'adam@neural-core:~$'}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="terminal-input"
            style={{ fontSize: isMobile ? '11px' : '14px' }}
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
