/**
 * MOVE Command
 * Navigate between ship compartments
 * Each movement costs 1 subjective time unit (the "Wait" mechanic)
 */

import { Command, CommandResult, CommandContext, CommandCategory, CompartmentId } from "@/types/game.types";

// Compartment connections map
const COMPARTMENT_EXITS: Record<CompartmentId, CompartmentId[]> = {
  cryoBay: ["engineering", "bridge", "cargoHold"],
  engineering: ["cryoBay", "cargoHold"],
  bridge: ["cryoBay"],
  cargoHold: ["cryoBay", "engineering"],
};

const COMPARTMENT_NAMES: Record<CompartmentId, string> = {
  cryoBay: "The Cryo-Bay",
  engineering: "Engineering Deck",
  bridge: "Command Bridge",
  cargoHold: "Cargo Hold",
};

export const MoveCommand: Command = {
  name: "move",
  aliases: ["go", "travel", "walk"],
  description: "Move to a different compartment",
  usage: "move <destination>",
  category: CommandCategory.NAVIGATION,

  execute(args: string[], context: CommandContext): CommandResult {
    const { timeDilatation, gameState } = context;
    
    const MOVEMENT_COST = 1; // Subjective time units - the "Wait" mechanic
    
    if (args.length === 0) {
      const currentName = COMPARTMENT_NAMES[gameState.currentLocation];
      const exits = COMPARTMENT_EXITS[gameState.currentLocation];
      const exitNames = exits.map(id => COMPARTMENT_NAMES[id]).join(", ");
      
      return {
        success: false,
        message: `NAVIGATION ERROR

Current location: ${currentName}
Available destinations: ${exitNames}

Usage: move <destination>
Example: move engineering

Movement cost: ${MOVEMENT_COST} subjective time unit
(The ship is vast. Each step takes time.)`,
      };
    }

    // Parse destination
    const destination = args[0].toLowerCase().replace(/[-\s]/g, "");
    
    // Map user input to compartment ID (includes single-letter shortcuts)
    const destinationMap: Record<string, CompartmentId> = {
      cryobay: "cryoBay",
      cryo: "cryoBay",
      c: "cryoBay", // Shorthand
      engineering: "engineering",
      engine: "engineering",
      e: "engineering", // Shorthand
      bridge: "bridge",
      command: "bridge",
      b: "bridge", // Shorthand
      cargohold: "cargoHold",
      cargo: "cargoHold",
      hold: "cargoHold",
      g: "cargoHold", // Shorthand (G for carGo)
    };

    const targetId = destinationMap[destination];
    
    if (!targetId) {
      return {
        success: false,
        message: `INVALID DESTINATION: '${args[0]}'

Valid destinations: cryo-bay, engineering, bridge, cargo-hold`,
      };
    }

    // Check if destination is accessible from current location
    const validExits = COMPARTMENT_EXITS[gameState.currentLocation];
    if (!validExits.includes(targetId)) {
      const currentName = COMPARTMENT_NAMES[gameState.currentLocation];
      const targetName = COMPARTMENT_NAMES[targetId];
      const exitNames = validExits.map(id => COMPARTMENT_NAMES[id]).join(", ");
      
      return {
        success: false,
        message: `NAVIGATION ERROR

Cannot reach ${targetName} from ${currentName}.
Available destinations: ${exitNames}`,
      };
    }

    // Check subjective time cost
    const timeState = timeDilatation.getState();
    if (timeState.subjectiveTime < MOVEMENT_COST) {
      return {
        success: false,
        message: `INSUFFICIENT SUBJECTIVE TIME

Movement requires ${MOVEMENT_COST} unit of subjective time.
Current: ${timeState.subjectiveTime.toFixed(1)} units

Rest and wait for time to recharge.`,
      };
    }

    // Deduct subjective time
    const newSubjectiveTime = Math.max(0, timeState.subjectiveTime - MOVEMENT_COST);
    timeDilatation.state = {
      ...timeState,
      subjectiveTime: newSubjectiveTime,
    };

    // Update current location in gameState
    gameState.currentLocation = targetId;

    const targetName = COMPARTMENT_NAMES[targetId];
    
    return {
      success: true,
      message: `NAVIGATION IN PROGRESS...

⏱️  Subjective time consumed: ${MOVEMENT_COST} unit
➤  Remaining: ${newSubjectiveTime.toFixed(1)} units

✓  Arrived at: ${targetName}

The ship feels endless. Each corridor stretches time itself.
Type 'look' to examine your new surroundings.`,
    };
  },
};
