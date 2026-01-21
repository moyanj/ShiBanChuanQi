# src/js - Core Game Logic

## OVERVIEW
Contains the core domain logic, now modularized into dedicated subdirectories.

## STRUCTURE
```
src/js/
├── battle/        # Combat Engine & Logic (Active)
├── characters/    # Character Definitions (Active)
├── stores/        # Pinia State Management (Active)
├── lib/           # Utilities (AI, Names, GT4)
├── utils.ts       # Global Helpers (Audio, etc)
├── character.ts   # [Legacy/Shared] Type definitions or Base classes
├── things.ts      # Item Manager
├── item.ts        # Item definitions
└── key.ts         # Input Handling
```

## SUB-MODULES
Detailed documentation available in:
- [Battle System](./battle/AGENTS.md)
- [Character System](./characters/AGENTS.md)
- [State Management](./stores/AGENTS.md)

## CONVENTIONS
- **Modularization**: Code is moving from flat files (e.g., old `fight.ts`) to structured directories (`battle/`).
- **Managers**: New code uses `Manager` classes in respective directories.
