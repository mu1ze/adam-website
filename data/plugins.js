export const plugins = [
  {
    slug: 'github',
    title: 'GitHub',
    icon: '🐙',
    description: 'Manage repositories, issues, pull requests, and CI/CD pipelines.',
    tagline: 'Manage repositories, issues, pull requests, and CI/CD',
    capabilities: [
      'Clone, fork, and manage repositories',
      'Create, view, and comment on issues',
      'Submit and review pull requests',
      'Trigger and monitor CI/CD pipelines',
      'Manage project boards and milestones',
      'Access GitHub API for custom operations',
    ],
    category: 'Development',
    exampleUsage: `> github: list my open pull requests
> github: create issue "Bug found in login" on repo X
> github: review PR #123 for repo Y
> github: trigger CI pipeline for branch Z`,
  },
  {
    slug: 'obsidian',
    title: 'Obsidian',
    icon: '🗂️',
    description: 'Navigate your knowledge graph, create notes, and connect ideas.',
    tagline: 'Navigate your knowledge graph, create notes, and connect ideas',
    capabilities: [
      'Create and edit notes',
      'Navigate knowledge graph',
      'Search across vault',
      'Manage tags and links',
      'Create templates',
      'Sync across devices',
    ],
    category: 'Productivity',
    exampleUsage: `> obsidian: create note "Meeting Notes"
> obsidian: search for notes about "AI"
> obsidian: link note A to note B
> obsidian: list recent notes`,
  },
  {
    slug: 'gmail',
    title: 'Gmail',
    icon: '📧',
    description: 'Read, send, search, and organize your emails.',
    tagline: 'Read, send, search, and organize your emails',
    capabilities: [
      'Read and search emails',
      'Compose and send emails',
      'Manage labels and filters',
      'Handle attachments',
      'Draft management',
      'Thread organization',
    ],
    category: 'Communication',
    exampleUsage: `> gmail: check unread emails
> gmail: send email to john@example.com
> gmail: search for "invoice" emails
> gmail: label emails from "boss" as important`,
  },
  {
    slug: 'calendar',
    title: 'Calendar',
    icon: '📅',
    description: 'Schedule events, set reminders, and manage your time.',
    tagline: 'Schedule events, set reminders, and manage your time',
    capabilities: [
      'Create and manage events',
      'Set reminders and alerts',
      'Check availability',
      'Recurring event management',
      'Calendar sharing',
      'Time zone handling',
    ],
    category: 'Productivity',
    exampleUsage: `> calendar: schedule meeting tomorrow at 3pm
> calendar: what's on my schedule today?
> calendar: create recurring weekly standup
> calendar: find free slot this week`,
  },
  {
    slug: 'telegram',
    title: 'Telegram',
    icon: '✈️',
    description: 'Send messages, manage groups, and receive notifications.',
    tagline: 'Send messages, manage groups, and receive notifications',
    capabilities: [
      'Send and receive messages',
      'Manage group chats',
      'Send media and files',
      'Bot command handling',
      'Channel management',
      'Notification configuration',
    ],
    category: 'Communication',
    exampleUsage: `> telegram: send "Hello!" to @user
> telegram: check new messages
> telegram: post to channel "updates"
> telegram: create group "Project Team"`,
  },
  {
    slug: 'notion',
    title: 'Notion',
    icon: '📓',
    description: 'Manage databases, pages, and blocks in your workspace.',
    tagline: 'Manage databases, pages, and blocks in your workspace',
    capabilities: [
      'Create and edit pages',
      'Manage databases',
      'Query and filter data',
      'Block manipulation',
      'Template management',
      'Workspace organization',
    ],
    category: 'Productivity',
    exampleUsage: `> notion: create page "Sprint Planning"
> notion: query database "Tasks" where status = "In Progress"
> notion: add row to "Projects" database
> notion: update page content`,
  },
  {
    slug: 'weather',
    title: 'Weather',
    icon: '🌤️',
    description: 'Real-time weather forecasts and conditions.',
    tagline: 'Real-time weather forecasts and conditions',
    capabilities: [
      'Current weather conditions',
      'Multi-day forecasts',
      'Severe weather alerts',
      'Historical weather data',
      'Location-based queries',
      'UV index and air quality',
    ],
    category: 'Information',
    exampleUsage: `> weather: current conditions in New York
> weather: 5-day forecast for London
> weather: will it rain tomorrow?
> weather: UV index for today`,
  },
  {
    slug: 'spotify',
    title: 'Spotify',
    icon: '🎵',
    description: 'Control playback, search tracks, and manage playlists.',
    tagline: 'Control playback, search tracks, and manage playlists',
    capabilities: [
      'Play, pause, skip tracks',
      'Search songs and artists',
      'Create and manage playlists',
      'Get recommendations',
      'View listening history',
      'Control playback devices',
    ],
    category: 'Entertainment',
    exampleUsage: `> spotify: play "Bohemian Rhapsody"
> spotify: create playlist "Work Focus"
> spotify: what's playing now?
> spotify: recommend songs like "Starboy"`,
  },
  {
    slug: 'healthcheck',
    title: 'HealthCheck',
    icon: '🔒',
    description: 'System hardening, security audits, and risk assessments.',
    tagline: 'System hardening, security audits, and risk assessments',
    capabilities: [
      'System health monitoring',
      'Security vulnerability scanning',
      'SSL certificate checking',
      'Port scanning and analysis',
      'Dependency audit',
      'Configuration review',
    ],
    category: 'Security',
    exampleUsage: `> healthcheck: scan system for vulnerabilities
> healthcheck: check SSL cert expiry
> healthcheck: audit npm dependencies
> healthcheck: review firewall config`,
  },
  {
    slug: 'clawrouter',
    title: 'ClawRouter',
    icon: '⚙️',
    description: 'Smart LLM routing with cost optimization across 55+ models.',
    tagline: 'Smart LLM routing with cost optimization across 55+ models',
    capabilities: [
      'Multi-model routing',
      'Cost optimization',
      'Latency-based routing',
      'Fallback handling',
      'Usage analytics',
      'Model comparison',
    ],
    category: 'Intelligence',
    exampleUsage: `> clawrouter: route to cheapest model for summarization
> clawrouter: compare GPT-4 vs Claude for this task
> clawrouter: show usage stats this month
> clawrouter: set fallback chain`,
  },
  {
    slug: 'imagegen',
    title: 'Image Gen',
    icon: '🎨',
    description: 'Generate stunning images with DALL-E, Flux, and more.',
    tagline: 'Generate stunning images with DALL-E, Flux, and more',
    capabilities: [
      'Text-to-image generation',
      'Image editing and inpainting',
      'Style transfer',
      'Multiple model support',
      'Batch generation',
      'Resolution control',
    ],
    category: 'Intelligence',
    exampleUsage: `> imagegen: create "a cyberpunk cityscape at sunset"
> imagegen: edit image to add rain effect
> imagegen: generate logo for tech startup
> imagegen: upscale this image to 4K`,
  },
  {
    slug: 'websearch',
    title: 'Web Search',
    icon: '🔍',
    description: 'Perplexity-powered web search with fact verification.',
    tagline: 'Perplexity-powered web search with fact verification',
    capabilities: [
      'Real-time web search',
      'Fact verification',
      'Source citation',
      'Deep research mode',
      'News aggregation',
      'Trend analysis',
    ],
    category: 'Intelligence',
    exampleUsage: `> websearch: latest news on AI regulation
> websearch: verify "claim about X"
> websearch: deep research on quantum computing
> websearch: trending topics today`,
  },
];
