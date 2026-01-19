/**
 * MUSH-Style Command Parser (Registry Pattern)
 * Dynamically loads and executes commands from the registry
 * 
 * Commands follow the pattern: <verb> [target] [args...]
 */

import { CommandResult, GameState, CommandContext } from "@/types/game.types";
import { ShipHeartbeat } from "./ship-heartbeat";
import { TimeDilatationManager } from "./time-dilatation";
import { getCommandMap } from "./commands";

export class CommandParser {
  private commandMap: Map<string, any>;
  private shipHeartbeat: ShipHeartbeat;
  private timeDilatation: TimeDilatationManager;

  constructor(shipHeartbeat: ShipHeartbeat, timeDilatation: TimeDilatationManager) {
    this.shipHeartbeat = shipHeartbeat;
    this.timeDilatation = timeDilatation;
    // Load commands from registry
    this.commandMap = getCommandMap();
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
    const commandName = tokens[0];
    const args = tokens.slice(1);

    // Find command in registry
    const command = this.commandMap.get(commandName);
    
    if (!command) {
      return {
        success: false,
        message: `Unknown command: '${commandName}'. Type 'help' for available commands.`,
      };
    }

    // Build command context
    const context: CommandContext = {
      gameState,
      shipHeartbeat: this.shipHeartbeat,
      timeDilatation: this.timeDilatation,
    };

    // Execute command
    try {
      return command.execute(args, context);
    } catch (error) {
      return {
        success: false,
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get list of all available commands
   */
  public getCommandList(): string[] {
    return Array.from(this.commandMap.keys());
  }
}
