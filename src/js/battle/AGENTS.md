# Combat Engine: src/js/battle

## OVERVIEW
This directory contains the core logic for the turn-based combat system. It operates on an Active Time Battle (ATB) model, where characters act once their ATB gauge is full. The engine is stateful but decoupled from the UI, communicating key events as they occur.

## STRUCTURE

- **`engine.ts` (`Battle` class)**: The heart of the combat system. Manages the state of a single battle instance, including turn order, skill execution, and win/loss conditions. It functions as a self-contained state machine.

- **`service.ts` (`BattleService` class)**: The bridge between the UI/stores and the battle engine. It handles battle setup (creating characters, enemies), manages the game loop (`setInterval`), and processes post-battle settlement (rewards, state reset).

- **`participants.ts` (`BattleCharacters` class)**: A container for a team of characters (either player or enemy). It manages team-wide state and actions, like total HP, group ATB updates, and targeting logic. The `Battle` engine uses two instances of this class.

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| **Core Turn Logic** | `engine.ts` | Look in `next_turn()` and `get_now_character()` |
| **Skill Execution** | `engine.ts` | `execute_skill()` handles damage, healing, and effects. |
| **Battle Lifecycle** | `service.ts` | `startBattle()`, `runLoop()`, `handleSettlement()` |
| **Team Management**| `participants.ts`| Methods for managing a collection of characters. |
| **Data Types** | `types.ts` | Interfaces for `Skill`, `IBattle`, `BattleEvent`.|

## CONVENTIONS
The combat engine is event-driven. The `Battle` class in `engine.ts` implements a simple event emitter (`on`, `off`, `emit`). This allows other parts of the system (like character-specific passive skills or future UI components) to react to battle events (`BATTLE_START`, `TURN_END`, `CHARACTER_DEATH`, etc.) without being tightly coupled to the engine's internal logic.
