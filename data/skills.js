export const skills = [
  {
    slug: 'research',
    title: 'Research',
    icon: '🔍',
    tagline: 'Web search, fact-checking, and information synthesis',
    description: 'The Research module enables comprehensive web searches and information gathering. ADAM can search the web, analyze results, verify facts, and synthesize information from multiple sources into coherent summaries.',
    shortDescription: 'Web search, content extraction, data analysis, and information synthesis with verification.',
    capabilities: [
      'Web search with fresh content filtering',
      'Fact verification and source checking',
      'Multi-source information synthesis',
      'Academic paper and article retrieval',
      'Competitive intelligence analysis',
      'Technical documentation lookup',
    ],
    exampleUsage: `> search: "latest AI developments 2026"
> find: academic papers on neural networks
> verify: [claim] against reliable sources
> summarize: top 5 findings from search results`,
    config: `Provider:   Perplexity API
Model:      sonar-deep-research
Freshness:  day
Max Results: 10`,
    features: ['Search', 'Fact Check', 'Synthesis'],
    category: 'Intelligence',
    asciiIcon: `  _______________    _____________________
 \\             /    |                   |
  \\           /     |    WEB RESEARCH    |
   \\========/      |     MODULE v1      |
   |         |     |_____________________|
   |  O   O  |         \\|/    \\|/
   |    _    |          _Y_   _Y_
   |_________|         |_____|_____|`,
    demoType: 'search',
  },
  {
    slug: 'content',
    title: 'Content',
    icon: '📝',
    tagline: 'Writing, editing, and creative content generation',
    description: 'The Content module handles all forms of written communication. From emails and reports to blog posts and creative writing, ADAM crafts clear, engaging content tailored to your voice and audience.',
    shortDescription: 'Writing, editing, summarization, and documentation across multiple formats and styles.',
    capabilities: [
      'Professional email composition and replies',
      'Blog posts and articles',
      'Technical documentation',
      'Creative writing and storytelling',
      'Marketing copy and slogans',
      'Editing and proofreading',
      'Translation between languages',
    ],
    exampleUsage: `> write: professional email to client about delay
> draft: blog post about AI trends
> edit: proofread this article for grammar
> create: product description for new app
> summarize: condense this 10-page report`,
    features: ['Emails', 'Docs', 'Creative'],
    category: 'Creation',
    asciiIcon: `       ╔═══════════════════╗
       ║   CONTENT CREATOR ║
       ╠═══════════════════╣
       ║ ╭─────────────────╮ ║
       ║ │  ✎ Draft 1.0  │ ║
       ║ ╰─────────────────╯ ║
       ╚═══════════════════╝`,
    demoType: 'content',
  },
  {
    slug: 'code',
    title: 'Code',
    icon: '💻',
    tagline: 'Programming, code review, and debugging across 50+ languages',
    description: 'The Code module provides comprehensive software development assistance. ADAM writes, reviews, debugs, and explains code across 50+ programming languages including Python, JavaScript, TypeScript, Rust, Go, and more.',
    shortDescription: 'Code review, debugging, implementation, and technical problem-solving.',
    capabilities: [
      'Write and refactor production code',
      'Code review with best practice suggestions',
      'Debug error messages and stack traces',
      'Explain complex algorithms and codebases',
      'Write tests and documentation',
      'Database queries and schema design',
      'API design and integration',
    ],
    exampleUsage: `> code: write a REST API in Python
> review: check this function for bugs
> debug: explain this error message
> explain: how does this algorithm work`,
    config: `Model:      Devstral (specialized for code)
Context:    128K tokens
Linting:    enabled
Best Practices: strict`,
    supportedLanguages: `Python, JavaScript, TypeScript, Rust, Go, Java, C++, C#,
Ruby, PHP, Swift, Kotlin, Scala, R, MATLAB, Julia,
SQL, HTML, CSS, Bash, PowerShell, and 30+ more...`,
    features: ['Write', 'Review', 'Debug'],
    category: 'Development',
    asciiIcon: `    ┌─────────────────┐
    │  </> CODE  >/< │
    │─────────────────│
    │ ╔═══╗ ╔═══╗ ╔═══╗│
    │ ║ 1 ║ ║ 2 ║ ║ 3 ║│
    │ ╠═══╣ ╠═══╣ ╠═══╣│
    │ ║ 4 ║ ║ 5 ║ ║ 6 ║│
    │ ╚═══╝ ╚═══╝ ╚═══╝│`,
    demoType: 'code',
  },
  {
    slug: 'data',
    title: 'Data',
    icon: '📊',
    tagline: 'Analysis, processing, and visualization of data',
    description: 'The Data module processes, analyzes, and visualizes data. ADAM can work with CSVs, JSON, databases, and APIs to extract insights, generate reports, and create charts.',
    shortDescription: 'File operations, organization, database queries, and structured data handling.',
    capabilities: [
      'Parse and analyze CSV/JSON files',
      'SQL query generation and optimization',
      'Statistical analysis and trends',
      'Data cleaning and transformation',
      'Report generation from datasets',
      'API data aggregation',
    ],
    exampleUsage: `> analyze: this sales CSV and find trends
> query: get top 10 customers by revenue
> clean: remove duplicates from this dataset
> chart: create bar chart of monthly data
> report: summarize key metrics from JSON`,
    features: ['CSV', 'SQL', 'Charts'],
    category: 'Data Management',
    asciiIcon: `    ┌────────────────────┐
    │    DATA ENGINE    │
    │────────────────────│
    │  ▓▓▓▓▓▓░░░ 67%    │
    │  ╭────────────╮   │
    │  │ ██ ██ ██ ██│   │
    │  ╰────────────╯   │
    └────────────────────┘`,
    demoType: 'data',
  },
  {
    slug: 'delegation',
    title: 'Delegation',
    icon: '🤖',
    tagline: 'Task management, scheduling, and workflow orchestration',
    description: 'The Delegation module manages tasks, schedules, and reminders. ADAM helps you break down complex projects, track progress, and ensures nothing falls through the cracks.',
    shortDescription: 'Breaking down complex tasks, spawning sub-agents, and coordinating multi-step workflows.',
    capabilities: [
      'Create and track tasks with deadlines',
      'Break down complex projects',
      'Set reminders and notifications',
      'Schedule meetings and events',
      'Prioritize with urgency/importance matrix',
      'Progress tracking and reporting',
    ],
    exampleUsage: `> remind: meeting tomorrow at 3pm
> task: break down "build website" into subtasks
> schedule: team call for Friday 2pm
> list: all tasks due this week
> priority: reschedule by importance`,
    features: ['Tasks', 'Reminders', 'Scheduling'],
    category: 'Operations',
    asciiIcon: `      ┌──────────────────────┐
      │  TASK MANAGER v1.0   │
      │──────────────────────│
      │  [✓] Task 1   DONE  │
      │  [▓] Task 2   50%  │
      │  [ ] Task 3   TODO  │
      └──────────────────────┘`,
    demoType: 'delegation',
  },
  {
    slug: 'monitoring',
    title: 'Monitoring',
    icon: '🔔',
    tagline: 'System health, alerts, and security monitoring',
    description: 'The Monitoring module keeps watch over your infrastructure and sends alerts when issues arise. ADAM monitors CPU, memory, disk, network, and can run custom health checks.',
    shortDescription: 'Heartbeat checks, calendar awareness, email monitoring, and proactive notifications.',
    capabilities: [
      'Real-time system resource monitoring',
      'Security audit and hardening',
      'Uptime and availability tracking',
      'Custom health check scripts',
      'Alert escalation and notifications',
      'Log analysis and anomaly detection',
    ],
    exampleUsage: `> status: check system health
> audit: run security scan
> alert: if CPU > 90% notify me
> uptime: report last 7 days
> logs: find errors in last hour`,
    features: ['Health', 'Security', 'Alerts'],
    category: 'System',
    asciiIcon: `    ┌──────────────────────────┐
    │    SYSTEM MONITOR       │
    │─────────────────────────│
    │  CPU: ████████░░ 80%   │
    │  RAM: ██████░░░░ 60%   │
    │─────────────────────────│
    │  ● ONLINE  ▲ UPTIME    │
    └──────────────────────────┘`,
    demoType: 'monitoring',
  },
  {
    slug: 'web',
    title: 'Web',
    icon: '🌐',
    tagline: 'Browser automation, scraping, and form handling',
    description: 'The Web module automates browser interactions. ADAM can navigate websites, scrape data, fill forms, and take screenshots for web automation tasks.',
    shortDescription: 'Browser control, form filling, navigation, and web-based task automation.',
    capabilities: [
      'Automated browser control',
      'Web scraping and data extraction',
      'Form submission and interaction',
      'Screenshot and visual capture',
      'Cross-browser testing simulation',
      'Dynamic web page interaction',
    ],
    exampleUsage: `> browse: "example.com" and get page title
> scrape: all product links from "example.com/products"
> fill: form on "example.com/contact" with details
> screenshot: "example.com/dashboard"`,
    features: ['Scrape', 'Forms', 'Screenshots'],
    category: 'Automation',
    asciiIcon: `      ╭─────────────────────────╮
      │  🌐  WEB AUTOMATION  🌐 │
      │─────────────────────────│
      │  ╔═══╗ ╔═══╗ ╔═══╗   │
      │  ║ ● ║ ║ ● ║ ║ ● ║   │
      │  ╚═══╝ ╚═══╝ ╚═══╝   │`,
    demoType: 'web',
  },
  {
    slug: 'files',
    title: 'Files',
    icon: '📁',
    tagline: 'File operations, organization, and Git management',
    description: 'The Files module manages file system operations. ADAM can create, read, update, delete files and directories, and interact with Git repositories.',
    shortDescription: 'Read, write, edit files with precision. Support for text, images, and PDFs.',
    capabilities: [
      'File and directory CRUD operations',
      'Content searching and filtering',
      'File organization and renaming',
      'Git repository management',
      'Branching, committing, and merging',
      'Remote repository synchronization',
    ],
    exampleUsage: `> ls: list files in directory
> read: file "config.json"
> write: new content to "output.txt"
> delete: directory "temp_files"
> git commit: "add new feature"`,
    features: ['CRUD', 'Search', 'Git'],
    category: 'File System',
    asciiIcon: `      ╭───────────────────────────╮
      │     FILE MANAGER         │
      │───────────────────────────│
      │  📁 projects/           │
      │   ├── 📄 index.html     │
      │   └── 📁 scripts/        │
      └───────────────────────────╯`,
    demoType: 'files',
  },
];
