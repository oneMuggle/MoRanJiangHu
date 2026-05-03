# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**墨色江湖：无尽武林** is a browser-first interactive fiction / text RPG application with wuxia (martial arts) themes. It features AI-driven story generation, character/NPC management, image asset workflows, world-building systems, and local-first data persistence via IndexedDB.

## Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000, host 0.0.0.0)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check (.ts, .tsx)
npm run lint:fix     # ESLint with auto-fix
npm run stress:test  # Prompt stress test
```

## Technology Stack

- **React 19** + **TypeScript** (~5.8)
- **Vite 6** with `@vitejs/plugin-react`
- **Tailwind CSS** (v3) + PostCSS
- **IndexedDB** for local persistence (custom `dbService.ts`)
- **fflate** for compression (cloud sync)
- Multiple AI provider backends: Gemini, Claude, OpenAI, DeepSeek, Zhipu, OpenAI-compatible

## Architecture

### Entry Point

- `index.html` → `index.tsx` → `App.tsx`
- `App.tsx` is the root component (~1680 lines) that manages view routing, lazy-loaded modals, and responsive layout

### Core State Management

- **`hooks/useGame.ts`** (~2990 lines) - The central React hook managing all game state, AI interactions, and business logic
  - Returns `{ state, meta, setters, actions }` consumed by `App.tsx`
  - Uses `hooks/useGameState.ts` for state initialization
  - Sub-workflows organized in `hooks/useGame/` directory (45+ files):
    - `sendWorkflow.ts` - Main story request handling
    - `systemPromptBuilder.ts` - Runtime prompt assembly
    - `memoryUtils.ts`, `memoryRecall.ts` - Memory system
    - `worldGenerationWorkflow.ts`, `worldEvolutionWorkflow.ts` - World state
    - `openingStoryWorkflow.ts` - New game initialization
    - `bodyPolish.ts` - Text refinement
    - `saveCoordinator.ts` - Save/load orchestration
    - `image/` - Image generation workflows
    - `config/` - Settings persistence

### Domain Models (`models/`)

Type definitions organized by domain:
- **Domain layer** (`models/domain/`) - Core entity structures: character, environment, social, battle, item, kungfu, sect, task, imageGeneration
- **Game layer** (`models/game/`) - Runtime game state: world, story, worldbook, novelDecomposition
- **Planning layer** (`models/planning/`) - Story planning: storyPlan, heroinePlan
- **Fandom planning** (`models/fandomPlanning/`) - Fandom-specific story/heroine plans
- **Top-level models** - system.ts (API config, UI settings), intimacy.ts, story.ts, task.ts, world.ts, etc.

> **Naming convention:** Many types use Chinese characters (e.g., `角色数据结构`, `世界数据结构`). This is intentional and consistent throughout the codebase.

### Components (`components/`)

- **`features/`** - 22 functional modules, each with desktop and mobile versions:
  - Character, Chat, Inventory, Equipment, Battle, Social, Kungfu, World, Map, Sect, Task, Team, Story, Memory, Settings, SaveLoad, NewGame, NovelDecomposition, Worldbook, Music, Agreement, Auth
  - Desktop: `XxxModal.tsx` | Mobile: `MobileXxx.tsx` or `mobile/MobileXxxModal.tsx`
  - All modals are `React.lazy()` loaded via `创建可预加载懒组件()` helper
- **`layout/`** - TopBar, LeftPanel, RightPanel, MobileQuickMenu, LandingPage
- **`ui/`** - Shared UI primitives (InAppConfirmModal, etc.)

### Services (`services/`)

- **`ai/`** - AI client layer:
  - `chatCompletionClient.ts` - Unified multi-provider client
  - `text/` - Text generation services
  - `image/` - Image generation services
- **`dbService.ts`** - IndexedDB operations (saves, settings, image assets)
- **`githubSync.ts`** - Cloud sync via GitHub OAuth + Release attachments
- **`epubImport.ts`** - EPUB novel import
- **`saveArchiveService.ts`** - Save archive management
- **`novel-decomposition/`** - Novel decomposition scheduler

### Prompts (`prompts/`)

Layered prompt system:
- `core/` - Core rules, format constraints, shared CoT fragments
- `runtime/` - Opening, world generation/evolution, variable generation, image extraction, NSFW, intimacy, qiyun, etc.
- `writing/` - Writing style, perspective, prose constraints
- `stats/` - Experience, battle, character, drop, world statistics
- `difficulty/` - Difficulty and judgment rules
- `shared/` - Cross-workflow shared defaults
- `intimacy/` - Intimacy system rules

### Utilities (`utils/`)

- `apiConfig.ts` - API configuration normalization and provider selection
- `settingsSchema.ts` - Settings key definitions and validation
- `builtinPrompts.ts` - Built-in prompt entry management
- `visualSettings.ts` - Visual/theming utilities
- `imageAssets.ts` - Image asset reference management
- `jsonRepair.ts` - JSON repair for AI responses
- `tokenEstimate.ts` - Token estimation

### Data (`data/`)

- `presets.ts`, `newGamePresets.ts` - Game presets
- `qiyun/` - Qiyun (气运/fortune) system data
- `cultivation/` - Cultivation system data
- `transformerPresets/` - Image prompt transformer presets
- `world.ts` - World data

### Cloud Functions (`functions/api/`)

Cloudflare Pages Functions for GitHub cloud sync:
- `auth/github.ts` - GitHub OAuth authentication
- `github/release-upload.ts` - Upload save to GitHub Release
- `github/release-download.ts` - Download save from GitHub Release

## Key Patterns

### View Routing

Three top-level views managed by `state.view`:
1. `'home'` → LandingPage
2. `'new_game'` → NewGameWizard (desktop/mobile)
3. `'game'` → Main game frame with LeftPanel/Chat/RightPanel

### Responsive Design

- Desktop: Three-column layout (LeftPanel | Chat | RightPanel)
- Mobile: Single column with `MobileQuickMenu` bottom navigation
- Breakpoint: `max-width: 767px`
- All feature modals have separate desktop/mobile implementations

### Lazy Loading Strategy

All feature modals use `React.lazy()` with a custom `创建可预加载懒组件()` wrapper that adds a `preload()` method. Preloading is triggered during idle time when the game view is active.

### State Shape

Game state follows a flat structure with Chinese-named keys:
- `state.角色` - Character
- `state.环境` - Environment
- `state.社交` - Social/NPCs
- `state.世界` - World
- `state.战斗` - Battle
- `state.剧情` - Story
- `state.历史记录` - Chat history
- `state.记忆系统` - Memory system
- `state.任务列表` / `state.约定列表` - Tasks / Agreements
- `state.玩家门派` - Player sect
- `state.开局配置` - Opening config
- `state.apiConfig` / `state.gameConfig` / `state.memoryConfig` / `state.visualConfig`

### API Provider Abstraction

Multiple AI providers are abstracted through `接口供应商类型` ('gemini' | 'claude' | 'openai' | 'deepseek' | 'zhipu' | 'openai_compatible'). Different operations (main story, memory, world evolution, image generation, etc.) can use different API endpoints configured via `state.apiConfig`.

### NSFW Content Levels

The project supports NSFW content with multiple levels. Check `state.gameConfig.启用NSFW模式` for feature toggles. Refer to `prompts/runtime/nsfw.ts` for NSFW prompt rules.

## Important Notes

- **All Chinese character naming is intentional** - Do not rename types, variables, or files to English unless specifically requested
- **IndexedDB is the primary data store** - All game state, settings, and image assets persist locally
- **No test framework configured** - The project does not currently have unit/integration tests
- **Large file sizes are common** - `App.tsx` (1681 lines), `useGame.ts` (2990 lines) are the central files
- **Vite chunk warnings are expected** - Large chunk size warnings during build do not block the build
- **NovelAI dev proxy** - Development server includes a NovelAI image proxy (Windows PowerShell-based)
- **GitHub Pages support** - Build base path adjusts via `GITHUB_PAGES=true` env var

## Development Workflow

### New Feature Development Process

1. **Plan first**: Create a plan document in `docs/plans/` before writing any code
2. **Implement per plan**: Follow the plan document step by step
3. **Mark progress**: Annotate completed sections in the plan document during implementation
4. **Archive on completion**: When the feature is complete, archive the plan to:
   - `docs/technical/` — Technical documentation (for developers)
   - `docs/user-manual/` — User manual (for end users)
