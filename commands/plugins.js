import { plugins } from '@/data/plugins';

export function handleCommand(ctx) {
  const { command, args, addLine, connections, connectPlugin, disconnectPlugin } = ctx;

  switch (command) {
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

      setTimeout(() => addLine(`  [1/4] Requesting authorization token...`), 400);
      setTimeout(() => addLine(`  [2/4] Verifying credentials...`), 900);
      setTimeout(() => addLine(`  [3/4] Exchanging tokens...`), 1400);
      setTimeout(() => addLine(`  [4/4] Establishing secure channel...`), 1900);
      setTimeout(() => {
        connectPlugin(plugin.slug, new Date().toISOString());
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

      disconnectPlugin(plugin.slug);
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

    default:
      return null;
  }
  return 'handled';
}
