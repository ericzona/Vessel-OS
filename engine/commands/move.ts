/**
 * MOVE Command - Spatial Navigation System
 * Navigate between ship compartments via the Vibe-Rail
 */

import { Command, CommandResult, CommandContext, CommandCategory, CompartmentId } from "@/types/game.types";
import { LookCommand } from "./look";

// Vibe-Rail Navigation Map
const MOVEMENT_MAP: Record<CompartmentId, Partial<Record<CompartmentId, boolean>>> = {
  cryoBay: { bridge: true },
  bridge: { cryoBay: true, rail: true },
  rail: { bridge: true, silo: true, dojo: true },
  silo: { rail: true, quarters: true },
  quarters: { silo: true },
  dojo: { rail: true },
  engineering: {}, // Legacy - no connections yet
  cargoHold: {}, // Legacy - no connections yet
};

const COMPARTMENT_NAMES: Record<CompartmentId, string> = {
  cryoBay: "Cryo-Bay",
  bridge: "Deck 01: Bridge",
  rail: "The Vibe-Rail",
  silo: "Deck 02: Slumber-Silo",
  quarters: "Personal Quarters",
  dojo: "Deck 04: Training Dojo",
  engineering: "Engineering Deck",
  cargoHold: "Cargo Hold",
};

export const MoveCommand: Command = {
  name: "move",
  aliases: ["go", "travel", "walk", "take"],
  description: "Navigate between ship locations",
  usage: "move <destination>",
  category: CommandCategory.NAVIGATION,

  execute(args: string[], context: CommandContext): CommandResult {
    const { gameState } = context;
    
    if (args.length === 0) {
      const currentName = COMPARTMENT_NAMES[gameState.currentLocation];
      const exits = Object.keys(MOVEMENT_MAP[gameState.currentLocation] || {}) as CompartmentId[];
      const exitNames = exits.map(id => COMPARTMENT_NAMES[id]).join(", ");
      
      return {
        success: false,
        message: `Location: ${currentName}\nExits: ${exitNames || "None"}\n\nUsage: move <destination>`,
      };
    }

    // Parse destination
    const input = args[0].toLowerCase().replace(/[-\s]/g, "");
    
    // Map user input to compartment ID
    const destinationMap: Record<string, CompartmentId> = {
      cryobay: "cryoBay",
      cryo: "cryoBay",
      k: "cryoBay",
      bridge: "bridge",
      command: "bridge",
      b: "bridge",
      rail: "rail",
      viberail: "rail",
      lift: "rail",
      v: "rail",
      r: "rail",
      silo: "silo",
      slumbersilo: "silo",
      deck2: "silo",
      s: "silo",
      quarters: "quarters",
      room: "quarters",
      q: "quarters",
      dojo: "dojo",
      training: "dojo",
      deck4: "dojo",
      d: "dojo",
    };

    const targetId = destinationMap[input];
    
    if (!targetId) {
      return {
        success: false,
        message: `Unknown destination: '${args[0]}'`,
      };
    }

    // Check if already at destination
    if (targetId === gameState.currentLocation) {
      return {
        success: false,
        message: `You are already here.`,
      };
    }

    // Check if destination is accessible (Spatial Reality)
    const canMove = MOVEMENT_MAP[gameState.currentLocation]?.[targetId];
    if (!canMove) {
      const currentName = COMPARTMENT_NAMES[gameState.currentLocation];
      const exits = Object.keys(MOVEMENT_MAP[gameState.currentLocation] || {}) as CompartmentId[];
      const exitNames = exits.map(id => COMPARTMENT_NAMES[id]).join(", ");
      
      return {
        success: false,
        message: `You can't go there from here.\n\nCurrent: ${currentName}\nAvailable exits: ${exitNames || "None"}`,
      };
    }

    // Track visited locations for narrative abstraction
    const visitedLocations = gameState.visitedLocations || [];
    const isFirstVisit = !visitedLocations.includes(targetId);
    
    const updates: any = {
      currentLocation: targetId,
    };
    
    if (isFirstVisit) {
      updates.visitedLocations = [...visitedLocations, targetId];
    }

    const targetName = COMPARTMENT_NAMES[targetId];
    
    // Auto-look on arrival - update game state first
    const updatedGameState = { ...gameState, ...updates };
    const lookResult = LookCommand.execute([], { ...context, gameState: updatedGameState }) as CommandResult;
    
    return {
      success: true,
      message: `Moving to ${targetName}...\n\n${lookResult.message}`,
      updates,
    };
  },
};
