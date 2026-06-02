import { skills } from '@/data/skills';
import { plugins } from '@/data/plugins';
import { GAME_NAMES } from '@/data/games';

export function handleCommand(ctx) {
  const { command, args, addLine, connections, router } = ctx;

  switch (command) {
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
          addLine(`  ${p.icon}  ${p.title.padEnd(15)} [${p.category.toUpperCase().padEnd(14)}]  ${connected}`);
        });
        addLine('');
        addLine(`  Total: ${plugins.length} plugins (${Object.keys(connections).length} connected).`, 'success');
      } else if (target === 'games') {
        addLine('');
        addLine('  INSTALLED GAMES', 'system');
        addLine('  ════════════════════════════════════════', 'system');
        Object.entries(GAME_NAMES).forEach(([slug, title]) => {
          addLine(`  🎮  ${title.padEnd(16)} [${slug}]`);
        });
        addLine('');
        addLine(`  Total: ${Object.keys(GAME_NAMES).length} games loaded.`, 'success');
      } else {
        addLine('Usage: ls skills | ls plugins | ls games');
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
        'games': '/games',
        'achievements': '/achievements',
        'badges': '/achievements',
      };

      if (!page || !routes[page]) {
        addLine(`cd: ${page || '?'}: No such directory`, 'error');
        addLine(`  Available: home, skills, plugins, docs, ask, terminal, games, achievements`);
      } else {
        addLine(`Navigating to ${page}...`, 'success');
        setTimeout(() => router.push(routes[page]), 600);
      }
      break;
    }

    default:
      return null;
  }
  return 'handled';
}
