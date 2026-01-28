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

export interface Character {
  name: string;
  id: string; // Unique identifier
  pioneerManifest: import("@/types/pioneer.types").PioneerManifest; // Pre-Crash DNA
  characterLoot: import("@/types/loot.types").CharacterLoot; // Personality traits & skills
  lootManifest: LootItem[]; // Lootopian gear/items
  founderBadge: boolean; // Legacy holder status
  pioneerNumber: number; // Position in crew manifest (1-2847)
  awakeningTime: number; // When player first woke from cryo
}

export interface LootItem {
  id: string;
  name: string;
  description: string;
  rarity: "common" | "uncommon" | "rare" | "legendary";
  category: "clothing" | "accessory" | "badge" | "tool";
}

export type CompartmentId = "cryoBay" | "engineering" | "bridge" | "cargoHold";

export interface VendingMachine {
  id: string;
  ownerId: string; // Character who placed it
  compartmentId: CompartmentId;
  itemType: ItemType;
  price: number; // In $SCRAP
  stock: number;
}

export interface CompartmentOwnership {
  compartmentId: CompartmentId;
  ownerId: string | null; // Character who claimed it
  claimCost: number; // $SCRAP cost to claim
  isLocked: boolean;
  vendingMachine: VendingMachine | null;
}

export interface SovereignVaults {
  treasury: number; // 5% of all transactions
  marketing: number; // 5% of all transactions
  builderRewards: number; // 2.5% of all transactions
  garbageCollector: number; // 2.5% of all transactions (inactive cleanup fund)
}

export interface GameState {
  character: Character;
  currentLocation: CompartmentId;
  ship: ShipSystems;
  timeDilatation: TimeDilatationState;
  inventory: InventoryState;
  credits: number; // Chip Credits (future: exchanged from $SOL)
  scrapBalance: number; // Player's $SCRAP balance
  sovereignVaults: SovereignVaults; // 15% Sovereign Fee allocation
  compartmentOwnership: CompartmentOwnership[]; // World Lock system
  gameTime: number; // Total elapsed game ticks
  isRunning: boolean;
  accomplishments?: import("@/engine/hidden-accomplishments").AccomplishmentState; // Hidden achievements
  briggsConversations?: number; // Track talks with Briggs for "Chatty Pioneer" achievement
  alignment: import("@/types/alignment.types").AlignmentState; // 9-Point Alignment System (Identity Engine)
  pendingChoice?: BinaryChoice; // Current choice awaiting player decision
  hasVisitedQuarters?: boolean; // Track if player has been to quarters (for starter gear)
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

export interface BinaryChoice {
  id: string;
  frameText: string; // Narrative context for the choice
  optionA: ChoiceOption;
  optionB: ChoiceOption;
  location: CompartmentId; // Where this choice occurred
}

export interface ChoiceOption {
  letter: "A" | "B";
  text: string;
  alignmentImpact: {
    lawChaos: number; // -10 to +10
    goodEvil: number; // -10 to +10
  };
  resultText: string; // What happens after choosing this option
}

export interface CommandResult {
  success: boolean;
  message: string;
  updates?: Partial<GameState>;
  binaryChoice?: BinaryChoice; // Optional choice to present to player
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
