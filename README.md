# DevForge - Daily Project Idea Generator

A fully client-side web application that generates comprehensive developer project ideas without requiring a backend server.

## Project Structure

```
devforge-daily-project-generator/
├── src/
│   ├── components/          # React UI components
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts        # Core data models (ProjectBriefing, UserSettings, etc.)
│   └── utils/              # Utility functions and helpers
│       └── constants.ts    # Application constants and default settings
├── tsconfig.json           # TypeScript configuration (strict mode enabled)
├── package.json            # Project dependencies and scripts
└── README.md              # This file
```

## Core Data Models

### ProjectBriefing
The main data structure representing a generated project idea with 10 sections:
1. Title
2. Description
3. Target Audience
4. Core Features (5-7 items)
5. Technical Requirements
6. Difficulty Level (Beginner/Intermediate/Advanced)
7. Estimated Time
8. Learning Outcomes (3-5 items)
9. Potential Extensions (3-5 items)
10. Similar Projects (3-5 items)

### UserSettings
User preferences including:
- Category selections (8 supported categories)
- AI configuration (provider, API key, enabled state)
- Settings version

### SessionHistory
Temporary session data for avoiding duplicate ideas

### StorageSchema
localStorage structure for persisting saved ideas and settings

## Supported Categories

1. Web Development
2. Mobile Development
3. CLI Tools
4. Games
5. Data Visualization
6. APIs & Backend
7. Automation & Scripts
8. Full-Stack Applications

## Technology Stack

- **TypeScript** with strict mode for type safety
- **React** for UI components
- **Vite** for build tooling
- **Vitest** for testing
- **fast-check** for property-based testing
- **localStorage** for client-side persistence

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Architecture

The application follows a modular client-side architecture:
- **UI Layer**: React components for Main View, Saved Ideas, and Settings
- **Application State Manager**: Coordinates UI and business logic
- **Business Logic**: Idea Manager, Storage Manager, Settings Manager
- **Generation Layer**: Algorithmic Generator and optional AI Generator
- **Storage**: localStorage for persistence

## Features

- ✅ Fully client-side (no backend required)
- ✅ Algorithmic idea generation (instant, offline-capable)
- ✅ Optional AI-powered generation (OpenAI, Gemini, Groq)
- ✅ Daily featured idea (consistent across all users)
- ✅ Unlimited on-demand generation
- ✅ Category filtering
- ✅ localStorage persistence
- ✅ Dark GitHub-inspired UI theme
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Automatic fallback mechanism

## Requirements

See `.kiro/specs/devforge-daily-project-generator/requirements.md` for detailed requirements.

## Design

See `.kiro/specs/devforge-daily-project-generator/design.md` for architecture and design details.
