# Active Context: The Great Transit (Fingerprint V1)

**Project:** Hypehouse Ventures - The Great Transit  
**Agent:** Aura/CodeAgent  
**Iteration:** Spiral Core (Foundation Layer)  
**Date:** January 17, 2026

---

## Current Focus

**Phase: Core Initialization - "The Silent Ship Awakens"**

We are bootstrapping the foundation of a MUSH-inspired, text-based exploration game. The player awakens in a ship traveling through the void after "The Great Crash," with the mission to reach a distant Galaxy through resource management, repair, and "growth" mechanics.

### Active Development Circle

1. **Terminal Emulator UI** - A Next.js-based retro terminal interface for player interaction
2. **Ship-Heartbeat Engine** - A TypeScript simulation loop that monitors ship systems (power, life support, engine integrity)
3. **MUSH Command Parser** - Text-based command interpreter (e.g., `grow seed`, `repair engine`, `check cryo`)
4. **Time Dilatation System** - A player resource mechanic based on relativistic time as a currency/constraint

---

## Architecture Overview

### Tech Stack

- **Frontend:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **UI Style:** Terminal/CLI aesthetic (green-on-black retro)
- **State Management:** React Context + custom hooks for game state
- **Economy Engine:** TypeScript simulation classes

### Core Systems (Spiral Layer 1)

1. **Terminal Component** (`/components/Terminal`)
   - Command input/output display
   - Command history
   - Typewriter effect for narrative text

2. **Command Parser** (`/engine/parser`)
   - Tokenizes player input
   - Routes to appropriate handlers
   - Returns structured responses

3. **Ship-Heartbeat** (`/engine/heartbeat`)
   - Tick-based simulation (background timer)
   - Monitors: Power, O2, Hull Integrity, Cryo Status
   - Triggers events and degradation

4. **Time Dilatation Manager** (`/engine/time-dilatation`)
   - Tracks "subjective time" as player resource
   - Allows fast-forward or slow-motion gameplay
   - Affects resource consumption rates

---

## Completed

- [x] Read project README and .clinerules
- [x] Analyzed Fingerprint V1 methodology
- [x] Initialized active_context.md
- [x] Initialized vision_map.md with complete Mermaid architecture
- [x] Bootstrapped Next.js project structure (manual setup)
- [x] Created Terminal component with command input & history
- [x] Implemented MUSH-style command parser with extensible handlers
- [x] Built Ship-Heartbeat engine class with tick-based simulation
- [x] Implemented Time Dilatation TypeScript class with resource management
- [x] Wrote comprehensive System Manual in /docs

---

## Next Steps (Layer 2 - Growth Economy)

1. Implement inventory management system
2. Create seed → plant → resource growth mechanic
3. Add cryo crew awakening system
4. Build resource-based crafting system
5. Implement save/load functionality (LocalStorage)

---

## Technical Debt / Blockers

*None yet - clean slate*

---

## Root Cause Log

*This section tracks errors and their root causes per .clinerules constraint*

---

## Notes

- The "Growth" mechanic (Growtopia-inspired) will be Layer 2 - focusing on ship survival first
- Keep all systems modular for future expansion (Episodes → Galaxy layers)
- Document everything for "scalability/sellability"
