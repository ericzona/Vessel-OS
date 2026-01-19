/**
 * Core Game Types for The Great Transit
 * Defines all interfaces and types for the game's state management
 */

export interface ShipSystems {
  power: number; // 0-100
  oxygen: number; // 0-100
  hull: number; // 0-100
  cryo: number; // 0-100
}

export interface GameState {
  ship: ShipSystems;
  timeDilatation: TimeDilatationState;
  inventory: InventoryState;
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
