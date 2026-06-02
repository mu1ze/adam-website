export const BOOT_LINES = [
  { text: 'ADAM Terminal v2.0 — Autonomous Digital Assistant Mind', delay: 0 },
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

export const HELP_TEXT_FULL = `╔══════════════════════════════════════════════════════════════╗
║                    AVAILABLE COMMANDS                        ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  NAVIGATION                                                  ║
║    ls skills          List all installed skills               ║
║    ls plugins         List all connected plugins             ║
║    ls games           List all arcade games                  ║
║    cat <name>         Show details of a skill or plugin       ║
║    cd <page>          Navigate (home/skills/plugins/docs/    ║
║                       ask/terminal/games/achievements)       ║
║    leaderboard [game] Show arcade high scores                 ║
║    badges [name]      List achievements or check player       ║
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
║    player [name]      Show or set your callsign               ║
║    theme [light|dark] Show or switch color theme              ║
║    help               Show this help message                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝`;

export const HELP_TEXT_COMPACT = `── COMMANDS ──────────────

 NAVIGATION
  ls skills      — List skills
  ls plugins     — List plugins
  ls games       — List games
  cat <name>     — Show details
  cd <page>      — Navigate
  leaderboard    — High scores
  badges [name]  — Achievements

 SYSTEM
  status         — System stats
  whoami         — User info
  uptime         — Uptime
  neofetch       — System info

 PLUGINS
  connect <p>    — Connect
  disconnect     — Disconnect
  connections    — List active

 UTILITIES
  echo <text>    — Print text
  clear          — Clear screen
  history        — Past commands
  player [name]  — Callsign
  theme [l|d]    — Color theme
  help           — This help
──────────────────────────`;

export const NEOFETCH = `
        ██████╗     adam@neural-core
       ██╔═══██╗    ──────────────────
        ██║   ██║    OS:      ADAM OS v2.0
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

export const ALL_BADGES = [
  { id: 'first_score', name: 'FIRST_BLOOD', desc: 'Submit your first score' },
  { id: 'score_100', name: 'CENTURY', desc: 'Score ≥100 in any game' },
  { id: 'score_1000', name: 'KILO', desc: 'Score ≥1,000 in any game' },
  { id: 'score_10000', name: 'DECA_KILO', desc: 'Score ≥10,000 in any game' },
  { id: 'total_5', name: 'ROOKIE', desc: 'Play 5 total games' },
  { id: 'total_25', name: 'VETERAN', desc: 'Play 25 total games' },
  { id: 'total_100', name: 'LEGEND', desc: 'Play 100 total games' },
  { id: 'pong_1000', name: 'PADDLE_MASTER', desc: 'Score ≥1,000 in Pong' },
  { id: 'tetris_10000', name: 'STACK_KING', desc: 'Score ≥10,000 in Tetris' },
  { id: 'bird_20', name: 'AERIAL_ACE', desc: 'Pass 20 pipes in Flappy Bird' },
  { id: 'merge_512', name: 'TILE_ADEPT', desc: 'Score ≥1,000 in 2048' },
];

export const ALL_COMMANDS = [
  'help', 'clear', 'ls', 'cat', 'cd', 'status', 'whoami', 'uptime', 'neofetch',
  'connect', 'disconnect', 'connections', 'echo', 'history', 'date', 'ping',
  'leaderboard', 'games', 'badges', 'achievements', 'player', 'name', 'theme',
  'sudo', 'exit',
];
