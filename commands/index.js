import { handleCommand as systemCmd } from './system';
import { handleCommand as navCmd } from './navigation';
import { handleCommand as pluginCmd } from './plugins';
import { handleCommand as gamingCmd } from './gaming';
import { handleCommand as utilityCmd } from './utility';

const handlers = [systemCmd, navCmd, pluginCmd, gamingCmd, utilityCmd];

export function processCommand(ctx) {
  for (const handler of handlers) {
    const result = handler(ctx);
    if (result) return result;
  }
  ctx.addLine(`  adam-sh: ${ctx.command}: command not found`, 'error');
  ctx.addLine(`  Type "help" for available commands.`);
  return 'handled';
}
