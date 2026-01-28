/**
 * QUARTERS Command
 * Phase 4.6: Personal Quarters - Home Building
 * 
 * A space-time anomaly makes the quarters feel cavernous.
 * This is the player's blank canvas in the void.
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";
import { createBorderedTitle, createDivider } from "@/engine/ascii-border";

export const QuartersCommand: Command = {
  name: "quarters",
  aliases: ["q", "room", "home"],
  description: "Enter your personal quarters",
  usage: "quarters",
  category: CommandCategory.NAVIGATION,

  execute(args: string[], context: CommandContext): CommandResult {
    const { gameState } = context;
    
    const pioneerNumber = gameState.character.pioneerNumber;
    const lockStatus = `Room secured by Pioneer-${String(pioneerNumber).padStart(3, '0')}`;
    
    // Check if first visit - grant starter gear
    const isFirstVisit = !gameState.hasVisitedQuarters;
    let starterGearMessage = "";
    const updates: any = {
      currentLocation: "quarters" as any,
      hasVisitedQuarters: true,
    };
    
    if (isFirstVisit) {
      // Grant starter gear on first visit
      const starterItems = [
        { id: "10-necklace", name: "Basic Necklace", type: "MATERIAL" as any, quantity: 1, description: "A simple chain. Functional, not decorative." },
        { id: "4-shirt", name: "Utility Shirt", type: "MATERIAL" as any, quantity: 1, description: "Standard-issue crew shirt. Stained but serviceable." },
        { id: "5-pants", name: "Basic Pants", type: "MATERIAL" as any, quantity: 1, description: "Cargo pants with reinforced knees." }
      ];
      
      updates.inventory = {
        items: [...gameState.inventory.items, ...starterItems],
        maxSlots: gameState.inventory.maxSlots
      };
      
      starterGearMessage = `

${createDivider()}

🎁 STARTER GEAR MANIFESTED

The ship's fabricator hums to life. Three items materialize on your workbench:

  • [10-necklace] Basic Necklace
  • [4-shirt] Utility Shirt  
  • [5-pants] Basic Pants

[Items added to inventory - type 'inventory' to view]

${createDivider()}
`;
    }

    const output = `
${createBorderedTitle("PERSONAL QUARTERS")}

You step through the threshold and feel the shift—

A space-time anomaly makes this room feel cavernous. The walls shimmer
with possibility, as if reality itself is waiting for your command.
This is your blank canvas in the void.

The floor is polished obsidian, reflecting starlight from viewports that
shouldn't exist. The ceiling stretches upward into impossible darkness.
A workbench materializes along one wall. Empty shelves line another,
eager to be filled with treasures from your journey.

This is not just a room.
This is the first step toward building something that lasts.

${createDivider()}

🔒 QUARTERS LOCK STATUS
   ${lockStatus}
   
   Only you can modify this space.
   Your creations persist across the journey.

${createDivider()}

AVAILABLE ACTIONS:
  • Type 'build' to access construction interface (COMING SOON)
  • Type 'decorate' to personalize your space (COMING SOON)
  • Type 'look' to examine your quarters more closely
  • Type 'leave' to return to the ship

${createDivider()}

💡 WARP-LOGIC DETECTED
   
   "Time flows differently here. Resources gathered in the void
   can be transformed into permanent structures. This is where
   Pioneers become Architects."
   
   - Ship's AI, Fragment 2847-Q
${starterGearMessage}
    `.trim();

    return {
      success: true,
      message: output,
      updates,
    };
  },
};
