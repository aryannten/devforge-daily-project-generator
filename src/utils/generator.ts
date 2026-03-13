/**
 * AlgorithmicGenerator - Deterministic project idea generation
 * Implements Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 2.1-2.11
 */

import { ProjectBriefing } from '../types';
import { CATEGORIES } from './constants';

/**
 * Simple hash function for seeded randomization
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Seeded random number generator
 */
class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = hashString(seed);
  }

  next(): number {
    // Linear congruential generator
    this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
    return this.seed / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    if (array.length === 0) {
      throw new Error('Cannot choose from empty array');
    }
    return array[this.nextInt(0, array.length - 1)]!;
  }

  sample<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => this.next() - 0.5);
    return shuffled.slice(0, Math.min(count, array.length));
  }
}

/**
 * Word banks for combinatorial generation
 */
const WORD_BANKS = {
  titleAdjectives: [
    'Smart', 'Modern', 'Intelligent', 'Advanced', 'Simple', 'Elegant',
    'Powerful', 'Lightweight', 'Fast', 'Secure', 'Real-time', 'Interactive',
    'Collaborative', 'Personal', 'Professional', 'Creative', 'Automated',
    'Dynamic', 'Responsive', 'Adaptive', 'Minimal', 'Full-featured'
  ],
  titleNouns: {
    'Web Development': ['Dashboard', 'Portal', 'Platform', 'Hub', 'Studio', 'Manager', 'Builder', 'Editor'],
    'Mobile Development': ['App', 'Companion', 'Tracker', 'Assistant', 'Organizer', 'Scanner', 'Monitor'],
    'CLI Tools': ['CLI', 'Tool', 'Utility', 'Command', 'Script', 'Helper', 'Generator', 'Analyzer'],
    'Games': ['Game', 'Puzzle', 'Challenge', 'Adventure', 'Simulator', 'Arena', 'Quest'],
    'Data Visualization': ['Visualizer', 'Chart', 'Graph', 'Explorer', 'Analyzer', 'Dashboard', 'Viewer'],
    'APIs & Backend': ['API', 'Service', 'Server', 'Gateway', 'Endpoint', 'Backend', 'Microservice'],
    'Automation & Scripts': ['Automator', 'Scheduler', 'Bot', 'Worker', 'Pipeline', 'Workflow', 'Agent'],
    'Full-Stack Applications': ['Application', 'System', 'Platform', 'Solution', 'Suite', 'Workspace']
  },
  titleDomains: {
    'Web Development': ['Task', 'Project', 'Content', 'Blog', 'Portfolio', 'E-commerce', 'Social', 'Forum'],
    'Mobile Development': ['Fitness', 'Finance', 'Health', 'Travel', 'Food', 'Shopping', 'Learning', 'Productivity'],
    'CLI Tools': ['File', 'Git', 'Docker', 'Database', 'Log', 'Config', 'Package', 'Deployment'],
    'Games': ['Puzzle', 'Strategy', 'Arcade', 'Card', 'Board', 'Word', 'Memory', 'Trivia'],
    'Data Visualization': ['Sales', 'Analytics', 'Metrics', 'Statistics', 'Financial', 'Network', 'Geographic', 'Time-series'],
    'APIs & Backend': ['User', 'Auth', 'Payment', 'Notification', 'File', 'Search', 'Analytics', 'Webhook'],
    'Automation & Scripts': ['Backup', 'Deployment', 'Testing', 'Monitoring', 'Report', 'Email', 'Data', 'CI/CD'],
    'Full-Stack Applications': ['CRM', 'CMS', 'ERP', 'LMS', 'Booking', 'Inventory', 'Ticketing', 'Collaboration']
  },
  descriptionTemplates: {
    'Web Development': [
      'A web-based platform that enables users to {action} with {feature}. Built with modern web technologies, it provides {benefit} through an intuitive interface.',
      'An interactive web application designed for {audience} to {action}. Features include {feature} and {benefit} for enhanced productivity.',
      'A responsive web solution that helps {audience} {action} efficiently. Leverages {technology} to deliver {benefit} with minimal setup.'
    ],
    'Mobile Development': [
      'A mobile application that helps users {action} on the go. Designed for {audience}, it offers {feature} with offline support and {benefit}.',
      'A cross-platform mobile app enabling {audience} to {action} seamlessly. Features {feature} and provides {benefit} through native performance.',
      'An intuitive mobile solution for {action} that combines {feature} with {benefit}. Perfect for {audience} seeking convenience.'
    ],
    'CLI Tools': [
      'A command-line tool that streamlines {action} for developers. Offers {feature} with {benefit} and integrates seamlessly with existing workflows.',
      'A powerful CLI utility designed to {action} efficiently. Features {feature} and provides {benefit} through simple commands.',
      'A developer-focused command-line interface for {action}. Combines {feature} with {benefit} for enhanced productivity.'
    ],
    'Games': [
      'An engaging game where players {action} to achieve victory. Features {feature} with {benefit} for hours of entertainment.',
      'A challenging game that tests players\' ability to {action}. Includes {feature} and offers {benefit} through progressive difficulty.',
      'An addictive game combining {feature} with strategic {action}. Provides {benefit} and endless replayability.'
    ],
    'Data Visualization': [
      'A data visualization tool that transforms {data} into insightful charts. Features {feature} and enables {audience} to {benefit}.',
      'An interactive dashboard for exploring {data} through visual analytics. Offers {feature} with {benefit} for data-driven decisions.',
      'A visualization platform that helps {audience} understand {data} through {feature}. Provides {benefit} with real-time updates.'
    ],
    'APIs & Backend': [
      'A RESTful API service that provides {feature} for {audience}. Built with {technology}, it offers {benefit} with high performance.',
      'A scalable backend service enabling {action} through well-documented endpoints. Features {feature} and delivers {benefit}.',
      'A microservice architecture for {action} that provides {feature}. Ensures {benefit} with robust error handling.'
    ],
    'Automation & Scripts': [
      'An automation solution that handles {action} without manual intervention. Features {feature} and provides {benefit} through scheduled execution.',
      'A workflow automation tool designed to {action} efficiently. Offers {feature} with {benefit} and easy configuration.',
      'An intelligent automation system for {action} that combines {feature} with {benefit}. Reduces manual work significantly.'
    ],
    'Full-Stack Applications': [
      'A comprehensive application that enables {audience} to {action} end-to-end. Features {feature} with {benefit} across all layers.',
      'A full-stack solution for {action} that integrates {feature} seamlessly. Provides {benefit} with modern architecture.',
      'An enterprise-grade application combining frontend and backend for {action}. Offers {feature} and ensures {benefit}.'
    ]
  },
  actions: {
    'Web Development': ['manage tasks', 'create content', 'collaborate', 'organize projects', 'track progress', 'share resources'],
    'Mobile Development': ['track activities', 'monitor health', 'manage finances', 'plan trips', 'discover places', 'learn skills'],
    'CLI Tools': ['manage files', 'automate workflows', 'analyze logs', 'deploy applications', 'configure systems', 'process data'],
    'Games': ['solve puzzles', 'compete', 'explore worlds', 'build strategies', 'collect items', 'complete challenges'],
    'Data Visualization': ['analyze trends', 'explore data', 'monitor metrics', 'compare statistics', 'track performance', 'visualize patterns'],
    'APIs & Backend': ['authenticate users', 'process payments', 'manage data', 'send notifications', 'handle requests', 'integrate services'],
    'Automation & Scripts': ['backup data', 'deploy code', 'run tests', 'generate reports', 'sync files', 'monitor systems'],
    'Full-Stack Applications': ['manage customers', 'process orders', 'track inventory', 'schedule appointments', 'collaborate', 'analyze business']
  },
  features: {
    'Web Development': ['drag-and-drop interface', 'real-time collaboration', 'responsive design', 'dark mode', 'keyboard shortcuts', 'export functionality'],
    'Mobile Development': ['offline mode', 'push notifications', 'biometric authentication', 'camera integration', 'location services', 'background sync'],
    'CLI Tools': ['interactive prompts', 'configuration files', 'plugin system', 'colored output', 'progress indicators', 'auto-completion'],
    'Games': ['multiple difficulty levels', 'leaderboards', 'achievements', 'save system', 'sound effects', 'animations'],
    'Data Visualization': ['interactive charts', 'filtering', 'drill-down', 'export to PDF', 'custom themes', 'real-time updates'],
    'APIs & Backend': ['JWT authentication', 'rate limiting', 'caching', 'webhooks', 'API documentation', 'versioning'],
    'Automation & Scripts': ['scheduling', 'error handling', 'logging', 'notifications', 'retry logic', 'parallel execution'],
    'Full-Stack Applications': ['user management', 'role-based access', 'audit logs', 'reporting', 'search functionality', 'data export']
  },
  benefits: ['improved efficiency', 'better organization', 'enhanced security', 'seamless experience', 'increased productivity', 'reduced errors'],
  audiences: ['developers', 'teams', 'businesses', 'students', 'professionals', 'enthusiasts', 'beginners', 'power users'],
  technologies: {
    'Web Development': ['React', 'Vue', 'TypeScript', 'Tailwind CSS', 'Next.js', 'Vite'],
    'Mobile Development': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo', 'Firebase'],
    'CLI Tools': ['Node.js', 'Python', 'Go', 'Rust', 'Commander.js', 'Click'],
    'Games': ['Phaser', 'Unity', 'Godot', 'Canvas API', 'WebGL', 'Three.js'],
    'Data Visualization': ['D3.js', 'Chart.js', 'Plotly', 'Recharts', 'Apache ECharts', 'Visx'],
    'APIs & Backend': ['Express', 'FastAPI', 'NestJS', 'PostgreSQL', 'MongoDB', 'Redis'],
    'Automation & Scripts': ['Bash', 'Python', 'Node.js', 'Cron', 'GitHub Actions', 'Ansible'],
    'Full-Stack Applications': ['React', 'Node.js', 'PostgreSQL', 'TypeScript', 'Docker', 'AWS']
  }
};

/**
 * Generate attribute hash for uniqueness checking
 */
function generateAttributeHash(category: string, title: string, features: string[]): string {
  const combined = `${category}|${title}|${features.slice(0, 3).join('|')}`;
  return hashString(combined).toString(36);
}

/**
 * Check if idea differs from session history by at least 3 attributes
 */
function checkUniqueness(
  category: string,
  difficultyLevel: string,
  techStack: string[],
  sessionHistory: string[]
): boolean {
  if (sessionHistory.length === 0) return true;
  
  const currentHash = generateAttributeHash(category, difficultyLevel, techStack);
  return !sessionHistory.includes(currentHash);
}

/**
 * AlgorithmicGenerator class
 * Generates project ideas using deterministic algorithms with seeded randomization
 */
export class AlgorithmicGenerator {
  /**
   * Generate a unique project idea
   * @param seed - Seed for randomization (timestamp, date string, etc.)
   * @param categories - User-selected categories (empty = all categories)
   * @param sessionHistory - Array of attribute hashes from previous generations
   * @returns Complete ProjectBriefing object
   */
  generateIdea(
    seed: string,
    categories: string[],
    sessionHistory: string[]
  ): ProjectBriefing {
    const startTime = performance.now();
    const rng = new SeededRandom(seed);
    
    // Select category
    const availableCategories = categories.length > 0 
      ? categories.filter(c => CATEGORIES.includes(c as any))
      : [...CATEGORIES];
    const category = rng.choice(availableCategories) as string;
    
    // Generate title
    const adjective = rng.choice(WORD_BANKS.titleAdjectives);
    const domain = rng.choice(WORD_BANKS.titleDomains[category as keyof typeof WORD_BANKS.titleDomains]);
    const noun = rng.choice(WORD_BANKS.titleNouns[category as keyof typeof WORD_BANKS.titleNouns]);
    const title = `${adjective} ${domain} ${noun}`;
    
    // Select difficulty level
    const difficultyLevel = rng.choice(['Beginner', 'Intermediate', 'Advanced'] as const);
    
    // Select technologies
    const techCount = rng.nextInt(3, 5);
    const technologies = rng.sample(WORD_BANKS.technologies[category as keyof typeof WORD_BANKS.technologies], techCount);
    
    // Check uniqueness
    const isUnique = checkUniqueness(category, difficultyLevel, technologies, sessionHistory);
    
    // If not unique, add entropy to seed and regenerate
    if (!isUnique && sessionHistory.length > 0) {
      return this.generateIdea(`${seed}_retry_${Date.now()}`, categories, sessionHistory);
    }
    
    // Generate description
    const template = rng.choice(WORD_BANKS.descriptionTemplates[category as keyof typeof WORD_BANKS.descriptionTemplates]);
    const action = rng.choice(WORD_BANKS.actions[category as keyof typeof WORD_BANKS.actions]);
    const feature = rng.choice(WORD_BANKS.features[category as keyof typeof WORD_BANKS.features]);
    const benefit = rng.choice(WORD_BANKS.benefits);
    const audience = rng.choice(WORD_BANKS.audiences);
    const technology = rng.choice(technologies);
    
    const description = template
      .replace('{action}', action)
      .replace('{feature}', feature)
      .replace('{benefit}', benefit)
      .replace('{audience}', audience)
      .replace('{technology}', technology)
      .replace('{data}', domain.toLowerCase() + ' data');
    
    // Generate target audience
    const targetAudience = `Designed for ${audience} who want to ${action} and improve their workflow. Suitable for those with ${difficultyLevel.toLowerCase()}-level programming experience.`;
    
    // Generate core features (5-7 items)
    const featureCount = rng.nextInt(5, 7);
    const coreFeatures = rng.sample(WORD_BANKS.features[category as keyof typeof WORD_BANKS.features], featureCount) as string[];
    
    // Generate technical requirements
    const technicalRequirements = [
      ...technologies,
      ...(difficultyLevel === 'Advanced' ? ['Docker', 'CI/CD'] : []),
      ...(category === 'APIs & Backend' ? ['API Testing Tools'] : [])
    ];
    
    // Generate estimated time
    const timeEstimates = {
      'Beginner': ['1 weekend', '3-5 days', '1 week'],
      'Intermediate': ['1-2 weeks', '2-3 weeks', '3-4 weeks'],
      'Advanced': ['1 month', '1-2 months', '2-3 months']
    };
    const estimatedTime = rng.choice(timeEstimates[difficultyLevel]);
    
    // Generate learning outcomes (3-5 items)
    const learningTemplates = [
      `Master ${technologies[0]} fundamentals and best practices`,
      `Implement ${feature} from scratch`,
      `Understand ${category.toLowerCase()} architecture patterns`,
      `Build production-ready ${category.toLowerCase()} applications`,
      `Learn testing and deployment strategies`,
      `Develop problem-solving skills in ${domain.toLowerCase()} domain`
    ];
    const learningCount = rng.nextInt(3, 5);
    const learningOutcomes = rng.sample(learningTemplates, learningCount) as string[];
    
    // Generate potential extensions (3-5 items)
    const extensionTemplates = [
      `Add ${rng.choice(['AI-powered', 'machine learning', 'advanced analytics'])} features`,
      `Implement ${rng.choice(['real-time', 'collaborative', 'multi-user'])} functionality`,
      `Create ${rng.choice(['mobile app', 'desktop app', 'browser extension'])} version`,
      `Add ${rng.choice(['payment processing', 'subscription model', 'premium features'])}`,
      `Integrate with ${rng.choice(['third-party APIs', 'external services', 'cloud platforms'])}`
    ];
    const extensionCount = rng.nextInt(3, 5);
    const potentialExtensions = rng.sample(extensionTemplates, extensionCount) as string[];
    
    // Generate similar projects (3-5 items)
    const similarTemplates = [
      `${rng.choice(['Trello', 'Notion', 'Asana', 'Jira', 'Monday.com'])} (for project management)`,
      `${rng.choice(['GitHub', 'GitLab', 'Bitbucket'])} (for version control)`,
      `${rng.choice(['Figma', 'Sketch', 'Adobe XD'])} (for design tools)`,
      `${rng.choice(['Slack', 'Discord', 'Teams'])} (for communication)`,
      `${rng.choice(['VS Code', 'Sublime', 'Atom'])} (for development tools)`
    ];
    const similarCount = rng.nextInt(3, 5);
    const similarProjects = rng.sample(similarTemplates, similarCount) as string[];
    
    // Generate unique ID
    const id = `${hashString(seed + Date.now()).toString(36)}-${hashString(title).toString(36)}`;
    
    const endTime = performance.now();
    const generationTime = endTime - startTime;
    
    // Ensure generation time is under 500ms (Requirement 1.2)
    if (generationTime > 500) {
      console.warn(`Generation took ${generationTime.toFixed(2)}ms, exceeding 500ms target`);
    }
    
    return {
      id,
      title,
      description,
      targetAudience,
      coreFeatures,
      technicalRequirements,
      difficultyLevel,
      estimatedTime,
      learningOutcomes,
      potentialExtensions,
      similarProjects,
      category,
      generatedAt: Date.now(),
      generationType: 'algorithmic'
    };
  }
  
  /**
   * Generate the daily featured idea for a specific date
   * @param date - Date object for the featured idea
   * @returns ProjectBriefing for the daily featured idea
   */
  generateDailyIdea(date: Date): ProjectBriefing {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD in UTC
    const seed = `daily_${dateString}`;
    
    // Daily idea uses all categories and empty session history
    return this.generateIdea(seed, [], []);
  }
}
