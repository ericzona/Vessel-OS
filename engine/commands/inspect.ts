/**
 * INSPECT Command
 * Quiet Depth narrative trigger
 * Examines objects and triggers subtle decision trees
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";
import { getTreeByTrigger, nodeToBinaryChoice } from "@/engine/narrative/decision-trees";

export const InspectCommand: Command = {
  name: "inspect",
  aliases: ["examine", "study", "investigate"],
  description: "Closely examine an object or detail",
  usage: "inspect <target>",
  category: CommandCategory.UTILITY,

  execute(args: string[], context: CommandContext): CommandResult {
    const { gameState } = context;
    
    if (args.length === 0) {
      return {
        success: false,
        message: `INSPECT requires a target.

Usage: inspect <target>

Available targets depend on your location.
Try: inspect console, inspect pod, inspect mural, etc.`,
      };
    }

    const target = args.join(" ").toLowerCase();
    const trigger = `inspect ${target}`;
    
    // Check if this triggers a decision tree
    const tree = getTreeByTrigger(trigger);
    
    if (tree) {
      // Get the root node
      const rootNode = tree.nodes[tree.rootNode];
      
      if (!rootNode) {
        return {
          success: false,
          message: "Error: Decision tree malformed.",
        };
      }
      
      // Convert to binary choice
      const binaryChoice = nodeToBinaryChoice(tree, rootNode, gameState.currentLocation);
      
      return {
        success: true,
        message: `You focus your attention on the ${target}...`,
        binaryChoice,
      };
    }
    
    // Default inspect responses based on location
    const inspectables: Record<string, Record<string, string>> = {
      cryoBay: {
        "pod": "The cryo-pods hum softly. Most remain sealed. Try 'inspect pod' for deeper examination.",
        "frost": "Frost patterns spiral across the viewports, crystalline and beautiful.",
        "console": "The cryo bay console shows vital signs for 2,847 frozen Pioneers.",
      },
      bridge: {
        "console": "The captain's console. It calls to you. Try 'inspect console' to dig deeper.",
        "chair": "The captain's chair sits empty, covered in a fine layer of dust.",
        "viewport": "Through the forward viewport: infinite darkness, distant stars.",
      },
      cargoHold: {
        "mural": "The Lootopian homeworld mural: green continents, blue oceans, twin moons.",
        "crates": "Mag-locked crates contain seeds and building materials for a colony.",
        "equipment": "Mining equipment sits ready for void salvage operations.",
      },
      engineering: {
        "reactor": "The main reactor hums on auxiliary power. CORE BREACH RISK: MODERATE.",
        "drones": "Repair drones lie dormant in their charging bays.",
        "conduits": "Power conduits spark and spit, casting dancing shadows.",
      },
    };

    const locationInspectables = inspectables[gameState.currentLocation as keyof typeof inspectables];
    
    if (locationInspectables && locationInspectables[target]) {
      return {
        success: true,
        message: locationInspectables[target],
      };
    }

    return {
      success: false,
      message: `You don't see anything notable about '${target}' here.

Try examining something else, or use 'look' to see what's available.`,
    };
  },
};
