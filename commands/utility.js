export function handleCommand(ctx) {
  const { command, args, addLine, cmdHistory } = ctx;

  switch (command) {
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

    case 'player':
    case 'name': {
      if (args.length > 0) {
        const newName = args.join(' ').substring(0, 16).toUpperCase();
        localStorage.setItem('adam_player_name', newName);
        addLine(`  Callsign updated: ${newName}`, 'success');
      } else {
        const current = localStorage.getItem('adam_player_name') || 'GUEST';
        addLine(`  Current callsign: ${current}`);
        addLine(`  Use "player {name}" to set a new callsign.`);
      }
      break;
    }

    case 'theme': {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      if (args.length > 0) {
        const newTheme = args[0].toLowerCase();
        if (newTheme === 'dark' || newTheme === 'light') {
          document.documentElement.setAttribute('data-theme', newTheme);
          localStorage.setItem('theme', newTheme);
          addLine(`  Theme set to ${newTheme}.`, 'success');
        } else {
          addLine(`theme: ${newTheme}: Unknown theme. Use "light" or "dark".`, 'error');
        }
      } else {
        addLine(`  Current theme: ${currentTheme}`);
        addLine(`  Use "theme light" or "theme dark" to switch.`);
      }
      break;
    }

    default:
      return null;
  }
  return 'handled';
}
