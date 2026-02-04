/**
 * QUARTERS Command
 * Enter your personal quarters (must be in Silo)
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";
import { createBorderedTitle, createDivider } from "@/engine/ascii-border";

export const QuartersCommand: Command = {
  name: "quarters",
  aliases: ["q", "room"],
  description: "Enter your personal quarters",
  usage: "quarters",
  category: CommandCategory.NAVIGATION,

  execute(args: string[], context: CommandContext): CommandResult {
    const { gameState } = context;
    
    // Spatial check: Must be in Silo (Deck 02)
    if (gameState.currentLocation !== "silo") {
      return {
        success: false,
        message: "Your quarters are on Deck 02 (Slumber-Silo).\n\nYou need to take the Vibe-Rail there first.",
      };
    }
    
    const pioneerNumber = gameState.character.pioneerNumber;
    const lockStatus = `Pioneer-${String(pioneerNumber).padStart(3, '0')}`;
    
    const output = `
${createBorderedTitle("PERSONAL QUARTERS")}

You step into your assigned quarters.

The room is small but yours. A standard crew bunk along one wall.
A work desk with a small terminal. A storage locker against the
far wall.

${createDivider()}

🔒 QUARTERS ACCESS
   Assigned to: ${lockStatus}
   
   This space belongs to you.

${createDivider()}

AVAILABLE ACTIONS:
  • Type 'locker' to access your storage
  • Type 'look' to examine the room
  • Type 'move silo' to leave

${createDivider()}

💡 Your personal locker contains standard-issue gear.
   Type 'locker' to check your supplies.
    `.trim();

    return {
      success: true,
      message: output,
      updates: {
        currentLocation: "quarters" as any,
      },
    };
  },
};
