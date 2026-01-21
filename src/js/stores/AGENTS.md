# PROJECT KNOWLEDGE BASE: src/js/stores

**Generated:** 2026-01-21 21:00
**Branch:** main

## OVERVIEW
This directory contains all Pinia stores, serving as the central state management hub for the application. It cleanly separates persistent game state (e.g., player progress) from transient, session-specific state (e.g., active combat data).

## STRUCTURE
The state is modularized into four distinct stores:

| Store File | Store Name | Purpose | State Type |
|---|---|---|---|
| `save.ts` | `useSaveStore` | **Persistent Player Data**: Tracks all user progress, characters, inventory, and gacha-related counters. This acts as the master "save file". | Persistent |
| `data.ts` | `useDataStore` | **Game Definitions**: Holds static game data, such as character definitions, items, and other configuration loaded at runtime. | Static |
| `fight.ts` | `useFightStore` | **Transient Combat State**: Manages all data for a single battle instance, including participants, turn order, and temporary status effects. | Transient |
| `chat.ts` | `useChatStore` | **In-Game Messages**: Handles dialogue, system notifications, and combat logs displayed to the user. | Transient |

## CONVENTIONS
- **Persistence**: State persistence is handled automatically by a Pinia plugin. Stores that need to be saved across sessions are marked with the `persist: true` option.
- **Synchronized Stores**: The `save` store is the primary persistent store, automatically saving all player progress to `localStorage`.
- **Transient by Design**: The `fight` and `data` stores are intentionally non-persistent. They are reset on application load to ensure that temporary states (like a battle in progress) do not bleed between sessions.
