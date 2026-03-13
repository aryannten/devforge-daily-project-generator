# Agent Instructions

## Package Manager
Use **npm**: `npm install`, `npm run dev`, `npm test`

## Commit Attribution
AI commits MUST include:
```
Co-Authored-By: Claude Sonnet 4 <noreply@anthropic.com>
```

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `npx tsc --noEmit path/to/file.ts` |
| Test single file | `npm test path/to/file.test.ts` |
| Test watch | `npm run test:watch` |

## Project Structure
```
src/
├── components/     # React UI components (MainView, SavedIdeasView, SettingsView)
├── types/         # TypeScript interfaces (ProjectBriefing, UserSettings)
└── utils/         # Business logic (generator, storage, settings, ideaManager)
```

## Key Conventions

### Component Patterns
- Functional components with TypeScript
- Props interfaces exported from component files
- CSS modules for styling (`.css` files alongside components)

### State Management
- `appStateManager.ts` coordinates all state
- No external state libraries (React hooks only)
- localStorage for persistence via `storage.ts`

### Testing
- Vitest + React Testing Library
- Property-based testing with `fast-check` for core logic
- Test files colocated: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`

### Generation System
- Algorithmic generator (offline-first, deterministic)
- Optional AI generator (OpenAI/Gemini/Groq)
- Automatic fallback: AI → Algorithmic
- Daily featured idea uses date-based seed

### Design System
- Neo-Brutalist Tech Workshop aesthetic
- CSS variables in `src/index.css`
- Electric blue accent (#00d4ff)
- Industrial dark palette
- Space Grotesk + JetBrains Mono fonts

## API Integration
AI providers configured in Settings:
- OpenAI: `gpt-4o-mini`
- Gemini: `gemini-2.0-flash-exp`
- Groq: `llama-3.3-70b-versatile`

User provides API keys (stored in localStorage only).

## Build & Deploy
- Vite for bundling
- TypeScript strict mode enabled
- Production build: `npm run build` → `dist/`
- Preview: `npm run preview`
