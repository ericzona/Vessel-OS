# Project: Fingerprint (Codename: The Great Transit)

**Parent Organization:** Hypehouse Ventures
**Lead Architect:** Eric
**Autonomous Agent:** Aura/CodeAgent

## 🛸 The Vision: "The Long Silent Journey"

We are building a text-based, rogue-like exploration game set during a multi-generational exodus from a forgotten home.

### The Narrative Shell

- **Setting:** A fleet of "Pioneers" traveling through the silence of deep space toward a distant, pre-established "Galaxy."
- **Atmosphere:** Serene, lonely, mechanical, and slightly mysterious.
- **The Hook:** The journey is finite, but the destination is far. Survival depends on maintaining the Ship and "coding" tools into existence through text interaction.

### The Development Philosophy (The Spiral)

This project is built using the **Fingerprint Method**:

1. **The Core (Tutorial/Ship):** A 10-15 minute "First Contact" with the ship’s systems. Learning to survive, repair, and optimize.
2. **The First Circle (Episodes):** Modular, Star Trek-prequel style missions (The "Away Team" or "System Crisis" loops).
3. **The Expansion (The Galaxy):** Future layers where we introduce complexity, hidden destination hints, and eventually, the unknown.

## 🛠️ System Architecture

- **Language:** Python (suggested for text-logic) or Node.js.
- **Documentation:** - `active_context.md`: The Agent's current memory and next logical "loop."
  - `vision_map.md`: A Mermaid-rendered spiral of the game's expanding features.
  - `.clinerules`: The rigid constraints that keep the "DNA" of the project consistent.

## 📜 The "Fingerprint" Directive

Every file created must be documented. Every system must be "scalable for sale." The agent must act as a pioneer: building the road while walking it, ensuring no technical debt is left behind in the void.

# 🛸 Vessel-OS: The Great Transit

**Status:** Alpha (Phase 0: The Awakening)
**Architecture:** Next.js + Tailwind + TypeScript (MUSH-Logic Engine)

## 🌌 The Vision

A modular, text-based survival and expansion engine. Players (and AI) are "Enhanced Pioneers" on a multi-generational journey to a new Galaxy.

## 🏗️ The "Living Document" Architecture

This repository is designed for **Scalable Expansion**. It follows a "Bolt-on" philosophy inspired by Growtopia and MUSH environments.

### 1. The Core (Ship Mainframe)

The primary engine handling time-dilation, resource management, and the command parser.

### 2. Chapters (Side Quests/Forks)

New game sections (e.g., "The Moonbase," "The Casino," "The Engine Room") are built as **Modules**.

- To add a chapter: Create a new directory in `/modules`.
- Register the module in `mainframe-manifest.json`.
- The Core will automatically "bolt" the new commands and UI elements into the player's terminal.

### 3. AI-Coexistence

Vessel-OS is "Agent-Native." The code is commented specifically to guide AI coding assistants (like Cline/Roo) to understand the "Intent" behind the logic, ensuring no-breakage during autonomous sprints.

## 🛠️ Contribution for Humans & Agents

1. **Humans:** Define the "Spec" and the "Lore" in a new Markdown file.
2. **Agents:** Read the spec, build the `CommandModule`, and update the `vision_map.md`.
3. **Safety:** All destructive commands require human-in-the-loop verification.

---
*Built for the Hypehouse Ventures Ecosystem. Designed to mature. Destined to arrive.*
