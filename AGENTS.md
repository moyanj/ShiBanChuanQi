# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-21 21:00
**Branch:** main

## OVERVIEW
Vue 3 + Electron RPG with Python WebSocket backend. Features turn-based combat, character collection (gacha), and persistent save system.

## STRUCTURE
```
./
├── src/                # Frontend (Vue 3)
│   ├── js/            # Core Domain Logic
│   │   ├── battle/    # Combat Engine (Turn-based system)
│   │   ├── characters/# Character Definitions (God-class pattern)
│   │   ├── stores/    # State Management (Pinia)
│   │   └── lib/       # Utils (AI, Random Name, Audio)
│   ├── views/         # UI Pages (Manual Routing)
│   └── main.ts        # App Entry
├── python/            # Backend (WebSocket Server)
├── electron/          # Desktop Wrapper
├── html/              # Build Output (Custom dist/)
└── build.py           # Custom Build Orchestrator
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| **Combat Logic** | `src/js/battle/` | Engine, participants, service |
| **Character Data** | `src/js/characters/definitions.ts` | **God Class** (All 35+ chars defined here) |
| **State/Save** | `src/js/stores/` | `save.ts` (Persistent), `fight.ts` (Transient) |
| **Backend API** | `python/server.py` | WebSocket protocol definition |
| **UI Routing** | `src/App.vue` | Manual `v-if` routing (No Vue Router) |
| **Build Config** | `build.py` | Electron packaging & distribution |

## CONVENTIONS
- **Output Dir**: `html/` (Not `dist/`)
- **Backend**: Located in `python/` (Not `server/`)
- **Routing**: Manual state-based routing in `App.vue`
- **Audio**: Global `APM` instance via `src/js/utils.ts`
- **Stores**: defined in separate files under `src/js/stores/` but historically merged

## ANTI-PATTERNS (THIS PROJECT)
- **God Classes**: `src/js/characters/definitions.ts` contains ALL character classes.
- **Large Components**: `src/views/Fight.vue` (>900 lines) mixes UI and battle logic.
- **Manual Routing**: No Vue Router; confusing navigation flow in `App.vue`.
- **Hybrid Build**: `build.py` handles tasks usually done by `electron-builder`.

## COMMANDS
```bash
# Dev
pnpm dev              # Vue Dev Server
python python/server.py # Backend (Manual start required)

# Build
pnpm build            # Build Frontend -> html/
python build.py       # Package Electron (Requires html/)
```
