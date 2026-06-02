import { GAME_NAMES } from '@/data/games';
import { ALL_BADGES } from '@/data/terminalStrings';

export function handleCommand(ctx) {
  const { command, args, addLine } = ctx;

  switch (command) {
    case 'leaderboard':
    case 'games': {
      const playerName = localStorage.getItem('adam_player_name') || 'GUEST';
      const specificGame = args[0]?.toLowerCase();
      const gameKeys = Object.keys(GAME_NAMES);
      const gamesToFetch = specificGame ? (gameKeys.includes(specificGame) ? [specificGame] : null) : gameKeys;

      if (!gamesToFetch) {
        addLine(`leaderboard: ${specificGame}: Unknown game. Available: ${gameKeys.join(', ')}`, 'error');
        break;
      }

      addLine('');
      addLine('  ARCADE LEADERBOARDS', 'system');
      addLine(`  Callsign: ${playerName}`);
      addLine('  ══════════════════════════════════', 'system');

      (async () => {
        for (const game of gamesToFetch) {
          addLine(`  [ ${GAME_NAMES[game]} ]`, 'success');
          try {
            const res = await fetch(`/api/scores?game=${game}`);
            const data = await res.json();
            const board = data.success ? data.scores : [];
            if (board.length === 0) {
              addLine('    No scores recorded.');
            } else {
              board.slice(0, 5).forEach((s, i) => {
                addLine(`    #${i + 1} ${s.name.padEnd(16)} ${s.score.toString().padStart(6)}`);
              });

              const personalScores = board.filter(s => s.name === playerName);
              if (personalScores.length > 0) {
                const best = Math.max(...personalScores.map(s => s.score));
                addLine(`  > Personal Best: ${best}`, 'system');
              }
            }
          } catch {
            addLine('    Error reading scores.');
          }
          addLine('');
        }
      })();
      break;
    }

    case 'badges':
    case 'achievements': {
      const badgeName = args.join(' ').toLowerCase();
      const playerName = badgeName || localStorage.getItem('adam_player_name') || 'GUEST';
      addLine('');

      if (!badgeName) {
        addLine('  ALL ACHIEVEMENTS', 'system');
        addLine('  ════════════════════════════════════════', 'system');
        ALL_BADGES.forEach(b => {
          addLine(`  ${b.name.padEnd(16)} ${b.desc}`);
        });
        addLine('');
        addLine(`  Total: ${ALL_BADGES.length} achievements available.`, 'success');
        addLine(`  Use "badges <name>" to check earned badges for a player.`);
        break;
      }

      addLine(`  Fetching badges for ${playerName}...`, 'system');
      (async () => {
        try {
          const res = await fetch(`/api/achievements?name=${encodeURIComponent(playerName)}`);
          const data = await res.json();
          const earned = data.success ? (data.earned || []) : [];
          addLine('');
          addLine(`  BADGES — ${playerName}`, 'system');
          addLine('  ════════════════════════════════════════', 'system');
          ALL_BADGES.forEach(b => {
            const isEarned = earned.includes(b.id);
            addLine(`  ${isEarned ? '●' : '○'} ${b.name.padEnd(16)} ${b.desc}`, isEarned ? 'success' : 'output');
          });
          addLine('');
          addLine(`  Earned: ${earned.length}/${ALL_BADGES.length}`, earned.length > 0 ? 'success' : 'output');
        } catch {
          addLine('  Error fetching achievements.', 'error');
        }
      })();
      break;
    }

    default:
      return null;
  }
  return 'handled';
}
