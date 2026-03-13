# DevForge — Daily Project Generator

> A fully client-side web application that generates comprehensive developer project ideas with AI-powered generation, offline-first architecture, and a Neo-Brutalist UI.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646cff?logo=vite)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-345%20passing-success)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

## ✨ Features

- **🎯 Daily Featured Idea** — Consistent project idea across all users, refreshed daily
- **⚡ Instant Generation** — Algorithmic generator for offline-capable, deterministic results
- **🤖 AI-Powered** — Optional integration with OpenAI, Gemini, or Groq for enhanced ideas
- **💾 Offline-First** — Full functionality without internet connection
- **🎨 Neo-Brutalist UI** — Modern, bold design with smooth animations and electric blue accents
- **📱 Fully Responsive** — Optimized for mobile, tablet, and desktop
- **🔒 Privacy-Focused** — All data stored locally, no backend required
- **🎭 8 Categories** — Web, Mobile, CLI, Games, Data Viz, APIs, Automation, Full-Stack

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📦 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18.2 with TypeScript 5.3 |
| **Build Tool** | Vite 5.0 |
| **Testing** | Vitest + React Testing Library + fast-check |
| **Styling** | CSS Variables + Neo-Brutalist Design System |
| **Fonts** | Space Grotesk + JetBrains Mono |
| **Storage** | localStorage API |
| **AI Providers** | OpenAI, Google Gemini, Groq |

## 🎨 Design System

DevForge uses a **Neo-Brutalist Tech Workshop** aesthetic — raw industrial energy meets kinetic digital craft. The interface balances utilitarian efficiency with visual delight through:

- **Electric Blue Accent** (#00d4ff) — Primary interactive color
- **Industrial Dark Palette** — Deep space blacks and gunmetal grays
- **Layered Shadows** — Dramatic depth with multiple shadow layers
- **Animated Gradients** — Kinetic micro-interactions and glow effects
- **Bold Typography** — Space Grotesk for UI, JetBrains Mono for code

See [DESIGN.md](DESIGN.md) for complete design system documentation.

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    UI Layer (React)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  MainView    │  │ SavedIdeas   │  │  Settings    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│            Application State Manager                    │
│         (Coordinates UI & Business Logic)               │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  Business Logic Layer                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Idea Manager │  │   Storage    │  │   Settings   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  Generation Layer                       │
│  ┌──────────────────────┐  ┌──────────────────────────┐│
│  │ Algorithmic Generator│  │    AI Generator          ││
│  │  (Offline, Fast)     │  │ (OpenAI/Gemini/Groq)     ││
│  └──────────────────────┘  └──────────────────────────┘│
│              Automatic Fallback: AI → Algorithmic       │
└─────────────────────────────────────────────────────────┘
                           ↕
┌─────────────────────────────────────────────────────────┐
│                  Storage Layer                          │
│              localStorage (Client-Side)                 │
└─────────────────────────────────────────────────────────┘
```

## 🧩 Core Data Models

### ProjectBriefing
Comprehensive project idea with 10 structured sections:
1. **Title** — Concise project name
2. **Description** — Detailed overview
3. **Target Audience** — Who benefits from this project
4. **Core Features** — 5-7 essential features
5. **Technical Requirements** — Tech stack and tools
6. **Difficulty Level** — Beginner, Intermediate, or Advanced
7. **Estimated Time** — Time commitment
8. **Learning Outcomes** — 3-5 skills gained
9. **Potential Extensions** — 3-5 enhancement ideas
10. **Similar Projects** — 3-5 reference projects

### UserSettings
- **Categories** — Selected project categories (8 available)
- **AI Configuration** — Provider, API key, enabled state
- **Settings Version** — Schema versioning

### StorageSchema
- **Saved Ideas** — Array of saved ProjectBriefing objects
- **User Settings** — Persisted configuration
- **Session History** — Temporary duplicate prevention

## 🔧 Development

### Project Structure
```
src/
├── components/          # React UI components
│   ├── MainView.tsx    # Main project display
│   ├── SavedIdeasView.tsx
│   └── SettingsView.tsx
├── types/              # TypeScript interfaces
│   └── index.ts        # Core data models
└── utils/              # Business logic
    ├── generator.ts    # Algorithmic generator
    ├── aiGenerator.ts  # AI provider integration
    ├── ideaManager.ts  # Idea lifecycle management
    ├── storage.ts      # localStorage abstraction
    ├── settings.ts     # Settings management
    ├── appStateManager.ts  # State coordination
    └── constants.ts    # App constants
```

### Testing Strategy
- **Unit Tests** — Vitest for isolated function testing
- **Integration Tests** — Component interaction testing
- **Property-Based Tests** — fast-check for algorithmic correctness
- **Coverage** — 345 passing tests across 17 test files

### Commands
```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:ui          # Visual test UI

# Type Checking
npm run type-check       # TypeScript validation
npx tsc --noEmit path/to/file.ts  # Check single file
```

## 🤖 AI Integration

DevForge supports three AI providers for enhanced project generation:

| Provider | Model | Speed | Quality |
|----------|-------|-------|---------|
| **OpenAI** | gpt-4o-mini | Fast | Excellent |
| **Gemini** | gemini-2.0-flash-exp | Very Fast | Excellent |
| **Groq** | llama-3.3-70b-versatile | Ultra Fast | Good |

### Setup
1. Navigate to Settings (⚙️)
2. Enable AI Generation
3. Select provider
4. Enter API key (stored locally only)
5. Generate ideas with AI enhancement

**Fallback Mechanism**: If AI generation fails (network, API error, rate limit), the app automatically falls back to the algorithmic generator for uninterrupted experience.

## 📱 Responsive Design

| Breakpoint | Width | Optimizations |
|------------|-------|---------------|
| **Mobile** | <768px | Compact nav, stacked layout, 48px touch targets |
| **Tablet** | 768-1023px | Balanced spacing, optimized typography |
| **Desktop** | 1024px+ | Full layout, enhanced animations, max 1280px width |

## 🎯 Use Cases

- **Learning** — Discover new project ideas to build skills
- **Portfolio** — Find unique projects to showcase abilities
- **Hackathons** — Quick inspiration for time-constrained events
- **Teaching** — Generate project assignments for students
- **Exploration** — Discover new technologies and domains

## 🔒 Privacy & Security

- **No Backend** — Fully client-side, no server communication
- **Local Storage** — All data stored in browser localStorage
- **API Keys** — Stored locally, never transmitted except to chosen AI provider
- **No Tracking** — No analytics, cookies, or user tracking
- **Open Source** — Full transparency, audit the code yourself

## 📄 License

MIT License — See [LICENSE](LICENSE) for details.

## 🤝 Contributing

Contributions welcome! Please read [AGENTS.md](AGENTS.md) for development guidelines.

## 🔗 Links

- **Repository**: [github.com/aryannten/devforge-daily-project-generator](https://github.com/aryannten/devforge-daily-project-generator)
- **Issues**: [Report bugs or request features](https://github.com/aryannten/devforge-daily-project-generator/issues)
- **Design System**: [DESIGN.md](DESIGN.md)
- **Agent Guidelines**: [AGENTS.md](AGENTS.md)

---

**Built with ⚡ by developers, for developers**
