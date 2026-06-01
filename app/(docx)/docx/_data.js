export const SECTIONS = [
  { href: '/docx', label: 'Overview', desc: 'Platform overview, core principles, and technology stack' },
  { href: '/docx/guides', label: 'Guides', desc: 'Getting started, navigation, configuration, deployment' },
  { href: '/docx/ask-adam', label: 'Ask Adam', desc: 'Chat interface, mood system, web search pipeline' },
  { href: '/docx/terminal', label: 'Terminal', desc: 'CLI emulator, command reference, tab completion' },
  { href: '/docx/games', label: 'Games', desc: 'Arcade, achievements, scorecards, leaderboards' },
  { href: '/docx/skills', label: 'Skills', desc: '8 core skill domains with interactive demos' },
  { href: '/docx/plugins', label: 'Plugins', desc: '12 plugins, connection management' },
  { href: '/docx/api', label: 'API', desc: 'Endpoint reference, request/response examples' },
];

export const COMMANDS = [
  ['help', 'Show available commands', 'help [--compact]'],
  ['ls', 'List available items by category', 'ls <skills|plugins|games>'],
  ['cat', 'Show item details', 'cat <name>'],
  ['cd', 'Navigate to page', 'cd <page>'],
  ['clear', 'Clear terminal output', 'clear'],
  ['status', 'Display system status', 'status'],
  ['whoami', 'Show current user', 'whoami'],
  ['uptime', 'Show session uptime', 'uptime'],
  ['neofetch', 'Display system info ASCII', 'neofetch'],
  ['echo', 'Print text', 'echo <text>'],
  ['date', 'Show current date/time', 'date'],
  ['history', 'Show command history', 'history'],
  ['ping', 'Test system response', 'ping'],
  ['player', 'Set or show player name', 'player [name]'],
  ['theme', 'Switch terminal theme', 'theme <green|amber|blue|red>'],
  ['leaderboard', 'Show game leaderboard', 'leaderboard [game]'],
  ['badges', 'List badges or check player', 'badges [player]'],
  ['connect', 'Connect a plugin', 'connect <plugin>'],
  ['disconnect', 'Disconnect a plugin', 'disconnect <plugin>'],
  ['connections', 'List plugin connections', 'connections'],
  ['sudo', 'Elevate privileges (easter egg)', 'sudo [command]'],
  ['exit', 'Exit terminal', 'exit'],
];

export const GAMES = [
  ['pong', 'Canvas Pong vs AI', '↑↓ / Mouse / Touch drag', 'AI opponent, multilingual characters, speed ramp'],
  ['snake', 'Classic grid snake', 'WASD / Arrows / Swipe', 'Speed increase at 50pts, grid display'],
  ['space-invaders', 'Alien shooter', '←→ / Space / Touch auto-fire', '55 aliens, sector clear win condition'],
  ['tetris', 'Block puzzle', '←→↓ / Rotate / Space hard-drop', '7 tetrominoes, ghost piece, next preview, levels'],
  ['flappy-bird', 'Endless pipe flyer', 'Space / ↑ / Tap', 'Procedural pipes, rotation physics, gradient sky'],
  ['2048', 'Tile merger', 'Arrows / Swipe', '4x4 grid, tile colors, continue-after-win'],
];

export const BADGES = [
  ['FIRST_BLOOD', 'Submit your first score', 'Play any game once'],
  ['CENTURY', 'Reach a score of 100', 'Score ≥ 100 in any game'],
  ['KILO', 'Reach a score of 1,000', 'Score ≥ 1,000 in any game'],
  ['DECA_KILO', 'Reach a score of 10,000', 'Score ≥ 10,000 in any game'],
  ['ROOKIE', 'Play 5 games', 'Submit scores in 5 sessions'],
  ['VETERAN', 'Play 25 games', 'Submit scores in 25 sessions'],
  ['LEGEND', 'Play 100 games', 'Submit scores in 100 sessions'],
  ['PADDLE_MASTER', 'Pong excellence', 'Score ≥ 1,000 in Pong'],
  ['STACK_KING', 'Tetris mastery', 'Score ≥ 10,000 in Tetris'],
  ['AERIAL_ACE', 'Flappy Bird expert', 'Pass 20 pipes in Flappy Bird'],
  ['TILE_ADEPT', '2048 proficiency', 'Score ≥ 1,000 in 2048'],
];

export const API_ENDPOINTS = [
  ['POST /api/chat', 'AI chat completion via OrcaRouter', '{ messages, mood, webSearch } → { reply, mood }'],
  ['GET /api/scores', 'Query leaderboard scores', '?game=&name=&limit= → { scores }'],
  ['POST /api/scores', 'Submit a score + award badges', '{ game, name, score } → { success, badges }'],
  ['GET /api/achievements', 'Get player badges', '?name= → { achievements }'],
  ['POST /api/register', 'Register a player', '{ name, password } → { success, name }'],
  ['GET /embed/leaderboard', 'Embeddable leaderboard HTML', '?theme=dark|light → text/html'],
];

export const SKILLS = [
  ['🔍', 'Research', 'Search, fact-check, and synthesize information across sources. Interactive search demo available.'],
  ['📝', 'Content', 'Generate emails, documents, and creative content. Content generator demo included.'],
  ['💻', 'Code', 'Write, review, and debug code across languages. Animated code snippet demo.'],
  ['📊', 'Data', 'Analyze CSV, query SQL, and generate charts. Data analysis demo available.'],
  ['🤖', 'Delegation', 'Task management, reminders, and scheduling workflow. Task breakdown demo.'],
  ['🔔', 'Monitoring', 'System health checks, security alerts, and performance monitoring dashboard.'],
  ['🌐', 'Web', 'Web scraping, form automation, and screenshot capture. Form automation demo.'],
  ['📁', 'Files', 'File CRUD operations, search, and Git integration. File browser demo.'],
];

export const PLUGINS = [
  ['🐙', 'GitHub', 'Repository management, PR tracking, issue management.'],
  ['🗂️', 'Obsidian', 'Knowledge base queries, note management, graph views.'],
  ['📧', 'Gmail', 'Email search, send, compose, label management.'],
  ['📅', 'Calendar', 'Event management, scheduling, availability checks.'],
  ['✈️', 'Telegram', 'Message send, group management, bot integration.'],
  ['📓', 'Notion', 'Page management, database queries, workspace search.'],
  ['🌤️', 'Weather', 'Current conditions, forecasts, location search.'],
  ['🎵', 'Spotify', 'Playback control, playlist management, search.'],
  ['🔒', 'HealthCheck', 'System monitoring, health probes, status tracking.'],
  ['⚙️', 'ClawRouter', 'Request routing, API orchestration, middleware.'],
  ['🎨', 'Image Gen', 'AI image generation, style presets, batch processing.'],
  ['🔍', 'Web Search', 'Web results, news, structured data extraction.'],
];
