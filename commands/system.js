import { skills } from '@/data/skills';
import { plugins } from '@/data/plugins';
import { GAME_NAMES } from '@/data/games';
import { HELP_TEXT_FULL, HELP_TEXT_COMPACT, NEOFETCH, ALL_BADGES } from '@/data/terminalStrings';

export function getLineColor(type) {
  switch (type) {
    case 'command': return '#888';
    case 'system': return '#228B22';
    case 'error': return '#ff5f57';
    case 'success': return '#28ca41';
    default: return '#e0e0e0';
  }
}

export function handleCommand(ctx) {
  const { command, args, addLine, connections, router, isMobile } = ctx;

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

  switch (command) {
    case 'help':
      addLine(isMobile ? HELP_TEXT_COMPACT : HELP_TEXT_FULL, 'system');
      break;

    case 'clear':
      return 'clear';

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
      return null;
  }
  return 'handled';
}
