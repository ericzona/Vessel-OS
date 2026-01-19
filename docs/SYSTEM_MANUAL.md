# The Great Transit - System Manual

**Version:** 1.0.0 (Core Layer)  
**Project:** Hypehouse Ventures - The Great Transit  
**Methodology:** Fingerprint V1  
**Date:** January 19, 2026

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Core Systems](#core-systems)
5. [Game Mechanics](#game-mechanics)
6. [Commands Reference](#commands-reference)
7. [Future Development](#future-development)
8. [Troubleshooting](#troubleshooting)

---

## Overview

**The Great Transit** is a text-based, MUSH-inspired exploration game built with Next.js and TypeScript. Players manage a ship traveling through deep space after "The Great Crash," balancing resource management, ship repairs, and time manipulation to reach a distant Galaxy.

### Core Concept

- **Setting:** Post-crash exodus through deep space
- **Gameplay:** Text-based command interface with real-time ship simulation
- **Theme:** Serene, lonely, mechanical survival
- **Unique Mechanic:** Time Dilatation as a player resource

---

## Architecture

### Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (terminal aesthetic)
- **State:** React hooks + custom game engines
- **Deployment:** Static export ready

### Project Structure

```
code-agent-v1-core/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Main game page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Global styles + Tailwind
├── components/              # React components
│   └── Terminal.tsx         # Main terminal UI
├── engine/                  # Game engine systems
│   ├── ship-heartbeat.ts    # Ship simulation loop
│   ├── time-dilatation.ts   # Time manipulation system
│   └── command-parser.ts    # MUSH-style command interpreter
├── types/                   # TypeScript definitions
│   └── game.types.ts        # Core game interfaces
├── docs/                    # Documentation
│   └── SYSTEM_MANUAL.md     # This file
├── active_context.md        # Agent memory/current state
├── vision_map.md            # Mermaid architecture diagrams
└── README.md                # Project overview

```

### Data Flow

```
Player Input → Terminal Component
     ↓
Command Parser → Parse & Route
     ↓
Game Engines (Ship Heartbeat, Time Dilatation)
     ↓
Game State Update
     ↓
Terminal Display Update
```

---

## Installation & Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
npm start
```

---

## Core Systems

### 1. Terminal Emulator (`components/Terminal.tsx`)

The main UI component providing a retro terminal interface.

**Features:**
- Command input with history (↑/↓ arrows)
- Real-time message display
- Color-coded message types
- Auto-scrolling
- Blinking cursor effect

**Message Types:**
- `SYSTEM` - General system messages (green)
- `PLAYER` - Player commands (cyan)
- `SUCCESS` - Successful operations (green)
- `ERROR` - Failed operations (red)
- `WARNING` - System alerts (yellow)
- `NARRATIVE` - Story text (dim green)

### 2. Ship-Heartbeat Engine (`engine/ship-heartbeat.ts`)

Real-time ship simulation with tick-based degradation.

**Monitored Systems:**
- **Power** - Core ship energy (degradation: 0.05/tick)
- **Oxygen** - Life support (degradation: 0.03/tick)
- **Hull** - Ship integrity (degradation: 0.02/tick)
- **Cryo** - Crew preservation (degradation: 0.01/tick)

**Critical Thresholds:**
- `<20%` - CRITICAL (red alert)
- `<50%` - WARNING (yellow alert)
- `0%` - FAILURE (game over condition)

**System Interdependencies:**
- Low Power (< 20%) → Accelerated Oxygen loss
- Hull Breach (< 20%) → Oxygen leak

**Key Methods:**
```typescript
start(callback) // Start simulation loop
stop()          // Stop simulation
tick(multiplier) // Execute one tick
repair(system, amount) // Repair a system
getSystems()    // Get current state
getStatusReport() // Get formatted report
```

### 3. Time Dilatation Manager (`engine/time-dilatation.ts`)

Manages relativistic time as a player resource.

**Concept:** Players can manipulate time flow (slow/normal/fast) but this drains their "Subjective Time" reserve.

**Time Scales:**
- `0.5x` - SLOW (high precision, drains subjective time)
- `1.0x` - NORMAL (default, recharges subjective time)
- `2.0x` - FAST (quick actions, drains subjective time)

**Resource Management:**
- Decay Rate: `0.1` per tick at non-normal speeds
- Recharge Rate: `0.05` per tick at normal speed
- Auto-revert to normal when depleted

**Key Methods:**
```typescript
setTimeScale(scale) // Change speed
tick(deltaTime)     // Update resource
getState()          // Get current state
canManipulateTime() // Check availability
```

### 4. Command Parser (`engine/command-parser.ts`)

MUSH-style text command interpreter.

**Command Pattern:** `<verb> [target] [args...]`

**Architecture:**
- Token-based parsing
- Map-based command routing
- Contextual help system
- Extensible handler pattern

**Key Methods:**
```typescript
parse(input, gameState) // Parse and execute
getCommandList()        // List all commands
```

---

## Game Mechanics

### Starting Conditions

- **Power:** 85%
- **Oxygen:** 90%
- **Hull:** 75%
- **Cryo:** 95%
- **Subjective Time:** 100/100
- **Time Scale:** 1.0x (normal)

### Survival Loop

1. **Monitor** - Check ship systems with `status`
2. **Repair** - Fix degrading systems with `repair <system>`
3. **Manage** - Balance time manipulation to optimize repairs
4. **Survive** - Keep all systems above 0%

### Win/Loss Conditions

**Current Version (Core Layer):**
- **Loss:** Any ship system reaches 0%
- **Win:** Not yet implemented (planned for Layer 3)

---

## Commands Reference

### System Monitoring

| Command | Description | Example |
|---------|-------------|---------|
| `status` | Show full ship status | `status` |
| `check <system>` | Check specific system | `check power` |
| `systems` | Alias for status | `systems` |

### Ship Operations

| Command | Description | Example |
|---------|-------------|---------|
| `repair <system>` | Repair a system (+15%) | `repair hull` |
| `fix <system>` | Alias for repair | `fix oxygen` |

**Valid Systems:** `power`, `oxygen`, `hull`, `cryo`

### Time Manipulation

| Command | Description | Example |
|---------|-------------|---------|
| `time <mode>` | Set time scale | `time fast` |
| `speed <mode>` | Alias for time | `speed slow` |

**Time Modes:** `slow` (0.5x), `normal` (1.0x), `fast` (2.0x)

### Inventory (Coming Soon - Layer 2)

| Command | Description | Status |
|---------|-------------|--------|
| `inventory` / `inv` | View inventory | Placeholder |
| `grow <seed>` | Plant seed | Placeholder |

### General

| Command | Description |
|---------|-------------|
| `help` | Show command list |
| `commands` | Alias for help |

---

## Future Development

### Layer 2: Growth Economy (Planned)

**Features:**
- Seed → Plant → Resource crafting system
- Inventory management
- Cryo crew awakening and skill assignment
- Resource-based repairs

**New Commands:**
- `grow <seed>` - Plant and nurture seeds
- `harvest <plant>` - Collect resources
- `craft <item>` - Create components
- `wake <crew>` - Awaken crew member
- `assign <crew> <task>` - Delegate work

### Layer 3: Episodes & Events (Planned)

**Features:**
- Modular story missions
- Random anomaly events
- Away team mechanics
- Ship upgrade tech tree

**New Commands:**
- `mission` - View available missions
- `scan` - Detect anomalies
- `upgrade <system>` - Improve ship
- `deploy` - Send away team

### Layer 4: The Galaxy (Planned)

**Features:**
- Destination mechanics
- Multi-ship fleet management
- End-game revelation
- Hidden lore discovery

---

## Troubleshooting

### TypeScript Errors

**Issue:** "Cannot find module 'react'" or similar  
**Solution:** Run `npm install` to install dependencies

**Issue:** "Cannot find namespace 'NodeJS'"  
**Solution:** Install Node types: `npm install --save-dev @types/node`

### Game Not Running

**Issue:** Ship systems not degrading  
**Solution:** Check browser console for errors. Heartbeat should auto-start on mount.

**Issue:** Commands not working  
**Solution:** Verify CommandParser initialization in Terminal component.

### Performance Issues

**Issue:** Game slows down over time  
**Solution:** Message history grows infinitely. Implement message limit (future enhancement).

### Build Errors

**Issue:** Tailwind classes not working  
**Solution:** Ensure `tailwind.config.ts` and `postcss.config.mjs` are properly configured.

---

## Development Guidelines

### Adding New Commands

1. Create handler method in `CommandParser` class
2. Register in `registerCommands()` method
3. Update help text in `handleHelp()`
4. Document in this manual

Example:
```typescript
private handleNewCommand(args: string[], gameState: GameState): CommandResult {
  // Implementation
  return { success: true, message: "Result" };
}

// In registerCommands():
this.commands.set("newcommand", this.handleNewCommand.bind(this));
```

### Adding New Systems

1. Define interfaces in `types/game.types.ts`
2. Create manager class in `engine/`
3. Integrate with Terminal component
4. Add relevant commands

### Code Standards

- **TypeScript:** Strict mode, explicit types
- **Comments:** JSDoc for all public methods
- **Naming:** camelCase for variables/methods, PascalCase for classes
- **Files:** One class per file, descriptive names
- **Documentation:** Update this manual for all new features

---

## Rollback & Safety

### Data Persistence

**Current:** No save system (in-memory only)  
**Future:** LocalStorage saves (Layer 2)

### Safe Command Testing

All commands are non-destructive except `repair` (which only improves state).

### Emergency Reset

Refresh the page to restart the game with default values.

---

## Contact & Support

**Project:** Hypehouse Ventures  
**Lead:** Eric  
**Agent:** Aura/CodeAgent  
**Version:** 1.0.0 (Core Layer)

---

## License

Proprietary - Hypehouse Ventures  
Built with the Fingerprint V1 methodology for maximum scalability and clean handoff.

---

**END OF SYSTEM MANUAL**
