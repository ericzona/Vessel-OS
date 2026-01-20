/**
 * Core Game Types for The Great Transit
 * Defines all interfaces and types for the game's state management
 */

export interface ShipSystems {
  power: number; // 0-100
  oxygen: number; // 0-100
  hull: number; // 0-100
  cryo: number; // 0-100
  scrap: number; // $SCRAP resource (mining/repair currency)
}

export interface GameState {
  ship: ShipSystems;
  timeDilatation: TimeDilatationState;
  inventory: InventoryState;
  credits: number; // In-game currency (future: Solana token integration)
  gameTime: number; // Total elapsed game ticks
  isRunning: boolean;
}

export interface TimeDilatationState {
  subjectiveTime: number; // Player's "time resource"
  timeScale: number; // 0.5 = slow, 1.0 = normal, 2.0 = fast
  maxSubjectiveTime: number;
}

export interface InventoryState {
  items: InventoryItem[];
  maxSlots: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: ItemType;
  quantity: number;
  description: string;
}

export enum ItemType {
  SEED = "seed",
  MATERIAL = "material",
  TOOL = "tool",
  COMPONENT = "component",
}

export interface CommandResult {
  success: boolean;
  message: string;
  updates?: Partial<GameState>;
}

/**
 * Command Interface - Registry Pattern
 * All commands must implement this interface for dynamic loading
 */
export interface Command {
  name: string;
  aliases?: string[];
  description: string;
  usage: string;
  category: CommandCategory;
  execute(args: string[], context: CommandContext): CommandResult | Promise<CommandResult>;
}

export enum CommandCategory {
  SYSTEM = "system",
  NAVIGATION = "navigation",
  SHIP = "ship",
  TIME = "time",
  INVENTORY = "inventory",
  CREW = "crew",
  UTILITY = "utility",
}

export interface CommandContext {
  gameState: GameState;
  shipHeartbeat: any; // Will be typed properly when refactored
  timeDilatation: any; // Will be typed properly when refactored
}

export interface TerminalMessage {
  id: string;
  text: string;
  type: MessageType;
  timestamp: number;
}

export enum MessageType {
  SYSTEM = "system",
  PLAYER = "player",
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  NARRATIVE = "narrative",
}
