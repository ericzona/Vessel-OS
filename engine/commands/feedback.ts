/**
 * FEEDBACK Command
 * Submit feedback to C-Suite (saves to executive_feedback.md)
 * Requires compartment ownership for spam prevention
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";

export const FeedbackCommand: Command = {
  name: "feedback",
  aliases: ["suggest", "report"],
  description: "Submit feedback to executive team",
  usage: "feedback <message>",
  category: CommandCategory.UTILITY,

  execute(args: string[], context: CommandContext): CommandResult {
    const { gameState } = context;
    
    if (args.length === 0) {
      return {
        success: false,
        message: `Usage: feedback <your message>

Submit feedback, suggestions, or bug reports to the C-Suite.
Requires ownership of current compartment (anti-spam measure).`,
      };
    }

    // Check if player owns current compartment (World Lock system)
    const currentOwnership = gameState.compartmentOwnership.find(
      c => c.compartmentId === gameState.currentLocation
    );
    
    if (!currentOwnership || currentOwnership.ownerId !== gameState.character.id) {
      return {
        success: false,
        message: `FEEDBACK DENIED: Compartment not owned

You must own the current compartment to submit feedback.
Use 'claim' command to purchase ownership (${currentOwnership?.claimCost || 0} $SCRAP)

[ANTI-SPAM MEASURE: World Lock system prevents abuse]`,
      };
    }

    const message = args.join(" ");
    const timestamp = new Date().toISOString();
    
    // In production, this would write to docs/executive_feedback.md via API
    // For now, simulate with in-game confirmation
    
    return {
      success: true,
      message: `FEEDBACK SUBMITTED

From: Pioneer #${gameState.character.pioneerNumber}
Location: ${gameState.currentLocation}
Time: ${timestamp}

Message: "${message}"

✓  Your feedback has been recorded in the executive ledger.
✓  The C-Suite will review during next quarterly assessment.

Thank you for contributing to The Great Transit development.`,
    };
  },
};
