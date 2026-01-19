/**
 * MUSH-Style Command Parser
 * Interprets player text commands and routes them to appropriate handlers
 * 
 * Commands follow the pattern: <verb> [target] [args...]
 * Examples: "grow seed", "repair engine", "check cryo", "status"
 */

import { CommandResult, GameState } from "@/types/game.types";
import { ShipHeartbeat } from "./ship-heartbeat";
import { TimeDilatationManager } from "./time-dilatation";

export type CommandHandler = (args: string[], gameState: GameState) => CommandResult;

export class CommandParser {
  private commands: Map<string, CommandHandler>;
  private shipHeartbeat: ShipHeartbeat;
  private timeDilatation: TimeDilatationManager;

  constructor(shipHeartbeat: ShipHeartbeat, timeDilatation: TimeDilatationManager) {
    this.commands = new Map();
    this.shipHeartbeat = shipHeartbeat;
    this.timeDilatation = timeDilatation;
    this.registerCommands();
  }

  /**
   * Register all available commands
   */
  private registerCommands(): void {
    // System Status Commands
    this.commands.set("status", this.handleStatus.bind(this));
    this.commands.set("check", this.handleCheck.bind(this));
    this.commands.set("systems", this.handleSystems.bind(this));
    
    // Repair Commands
    this.commands.set("repair", this.handleRepair.bind(this));
    this.commands.set("fix", this.handleRepair.bind(this));
    
    // Time Dilatation Commands
    this.commands.set("time", this.handleTime.bind(this));
    this.commands.set("speed", this.handleSpeed.bind(this));
    
    // Help Command
    this.commands.set("help", this.handleHelp.bind(this));
    this.commands.set("commands", this.handleHelp.bind(this));
    
    // Growth Commands (placeholder for future)
    this.commands.set("grow", this.handleGrow.bind(this));
    
    // Inventory Commands (placeholder for future)
    this.commands.set("inventory", this.handleInventory.bind(this));
    this.commands.set("inv", this.handleInventory.bind(this));
  }

  /**
   * Parse and execute a command
   * @param input - Raw player input
   * @param gameState - Current game state
   */
  public parse(input: string, gameState: GameState): CommandResult {
    const trimmed = input.trim().toLowerCase();
    
    if (!trimmed) {
      return {
        success: false,
        message: "Please enter a command. Type 'help' for available commands.",
      };
    }

    // Tokenize input
    const tokens = trimmed.split(/\s+/);
    const command = tokens[0];
    const args = tokens.slice(1);

    // Find and execute command
    const handler = this.commands.get(command);
    
    if (!handler) {
      return {
        success: false,
        message: `Unknown command: '${command}'. Type 'help' for available commands.`,
      };
    }

    return handler(args, gameState);
  }

  /**
   * Handle 'status' command - Show overall ship status
   */
  private handleStatus(args: string[], gameState: GameState): CommandResult {
    const report = this.shipHeartbeat.getStatusReport();
    const timeState = this.timeDilatation.getState();
    const health = this.shipHeartbeat.getOverallHealth();

    const message = `
=== SHIP STATUS REPORT ===

${report}

TIME SCALE: ${timeState.timeScale}x
SUBJECTIVE TIME: ${timeState.subjectiveTime.toFixed(1)}/${timeState.maxSubjectiveTime}

OVERALL HEALTH: ${health.toFixed(1)}%
    `.trim();

    return {
      success: true,
      message,
    };
  }

  /**
   * Handle 'check' command - Check specific system
   */
  private handleCheck(args: string[], gameState: GameState): CommandResult {
    if (args.length === 0) {
      return this.handleStatus(args, gameState);
    }

    const system = args[0];
    const systems = this.shipHeartbeat.getSystems();
    
    const validSystems = ["power", "oxygen", "hull", "cryo"];
    if (!validSystems.includes(system)) {
      return {
        success: false,
        message: `Invalid system: '${system}'. Valid systems: ${validSystems.join(", ")}`,
      };
    }

    const value = systems[system as keyof typeof systems];
    const status = value < 20 ? "CRITICAL" : value < 50 ? "WARNING" : "GOOD";

    return {
      success: true,
      message: `${system.toUpperCase()}: ${value.toFixed(1)}% [${status}]`,
    };
  }

  /**
   * Handle 'systems' command - Alias for status
   */
  private handleSystems(args: string[], gameState: GameState): CommandResult {
    return this.handleStatus(args, gameState);
  }

  /**
   * Handle 'repair' command - Repair a ship system
   */
  private handleRepair(args: string[], gameState: GameState): CommandResult {
    if (args.length === 0) {
      return {
        success: false,
        message: "Usage: repair <system>\nSystems: power, oxygen, hull, cryo",
      };
    }

    const system = args[0];
    const validSystems = ["power", "oxygen", "hull", "cryo"];
    
    if (!validSystems.includes(system)) {
      return {
        success: false,
        message: `Invalid system: '${system}'. Valid systems: ${validSystems.join(", ")}`,
      };
    }

    const success = this.shipHeartbeat.repair(system as any, 15);
    
    if (success) {
      return {
        success: true,
        message: `Repairing ${system.toUpperCase()}... +15% integrity restored.`,
      };
    }

    return {
      success: false,
      message: `Failed to repair ${system}.`,
    };
  }

  /**
   * Handle 'time' command - Manage time dilatation
   */
  private handleTime(args: string[], gameState: GameState): CommandResult {
    if (args.length === 0) {
      const state = this.timeDilatation.getState();
      return {
        success: true,
        message: `Time Scale: ${state.timeScale}x\nSubjective Time: ${state.subjectiveTime.toFixed(1)}/${state.maxSubjectiveTime}\n\nUsage: time <slow|normal|fast>`,
      };
    }

    const mode = args[0];
    let scale = 1.0;

    switch (mode) {
      case "slow":
        scale = 0.5;
        break;
      case "normal":
        scale = 1.0;
        break;
      case "fast":
        scale = 2.0;
        break;
      default:
        return {
          success: false,
          message: "Invalid time mode. Use: slow, normal, or fast",
        };
    }

    const success = this.timeDilatation.setTimeScale(scale);
    
    if (success) {
      return {
        success: true,
        message: `Time scale set to ${scale}x (${mode})`,
      };
    }

    return {
      success: false,
      message: "Insufficient subjective time. Time scale remains at normal.",
    };
  }

  /**
   * Handle 'speed' command - Alias for time
   */
  private handleSpeed(args: string[], gameState: GameState): CommandResult {
    return this.handleTime(args, gameState);
  }

  /**
   * Handle 'help' command - Show available commands
   */
  private handleHelp(args: string[], gameState: GameState): CommandResult {
    const helpText = `
=== AVAILABLE COMMANDS ===

SYSTEM MONITORING:
  status                - Show full ship status
  check <system>        - Check specific system
  systems               - Show all systems

SHIP OPERATIONS:
  repair <system>       - Repair a ship system
  fix <system>          - Alias for repair

TIME MANIPULATION:
  time <slow|normal|fast> - Adjust time scale
  speed <mode>            - Alias for time

INVENTORY (Coming Soon):
  inventory / inv       - View inventory
  grow <seed>           - Plant and grow resources

GENERAL:
  help / commands       - Show this help text

SYSTEMS: power, oxygen, hull, cryo
    `.trim();

    return {
      success: true,
      message: helpText,
    };
  }

  /**
   * Handle 'grow' command - Placeholder for growth mechanic
   */
  private handleGrow(args: string[], gameState: GameState): CommandResult {
    return {
      success: false,
      message: "Growth system not yet implemented. (Layer 2 feature)",
    };
  }

  /**
   * Handle 'inventory' command - Placeholder
   */
  private handleInventory(args: string[], gameState: GameState): CommandResult {
    return {
      success: true,
      message: "=== INVENTORY ===\n\nEmpty. (Inventory system coming in Layer 2)",
    };
  }

  /**
   * Get list of all available commands
   */
  public getCommandList(): string[] {
    return Array.from(this.commands.keys());
  }
}
