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
    `.trim();

    return {
      success: true,
      message: output,
      updates: {
        currentLocation: "quarters" as any, // Will add to types later
      },
    };
  },
};
