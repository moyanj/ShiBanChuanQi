# src/js/characters - Character Definition

## OVERVIEW
This directory contains the class-based system for all game characters. It establishes the base attributes, skills, and types that every character uses, and provides concrete implementations for each unique character in the game.

## STRUCTURE
The system is split into two main files:
- `base.ts`: Defines the abstract `Character` class, including common properties (HP, ATK, DEF), interfaces, and type enums. This is the template for all characters.
- `definitions.ts`: Contains all concrete character classes (e.g., `Fairy`, `FanShiFu`). Each class extends `Character` and implements its unique skills and default attributes.

## ANTI-PATTERNS
- **God Class**: `definitions.ts` is a classic "God Class" anti-pattern. It contains over 35 character class definitions in a single file, making it extremely large and difficult to navigate and maintain. Any change to a single character requires modifying this massive file.

## CONVENTIONS
To add a new character:
1. Create a new `export class YourCharacter extends Character` in `definitions.ts`.
2. In the `constructor`, define the character's unique properties (`name`, `desc`, `type`, skill names).
3. Override the `general()`, `skill()`, and `super_skill()` methods to implement custom logic.
