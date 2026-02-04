/**
 * LOCKER Command - Supply Check
 * Access the storage locker in your personal quarters
 */

import { Command, CommandResult, CommandContext, CommandCategory, BinaryChoice } from "@/types/game.types";
import { createBorderedTitle, createDivider } from "@/engine/ascii-border";

export const LockerCommand: Command = {
  name: "locker",
  aliases: ["storage", "check locker", "open locker"],
  description: "Access your personal storage locker",
  usage: "locker",
  category: CommandCategory.UTILITY,

  execute(args: string[], context: CommandContext): CommandResult {
    const { gameState } = context;
    
    // Spatial check: Must be in quarters
    if (gameState.currentLocation !== "quarters") {
      return {
        success: false,
        message: "You need to be in your quarters to access your locker.",
      };
    }
    
    // First time opening the locker - Supply Check
    if (!gameState.hasVisitedQuarters) {
      const supplyCheck: BinaryChoice = {
        id: "loot-locker-awakening",
        frameText: "Supply Check",
        optionA: {
          letter: "A",
          text: "SALVAGE RAGS",
          alignmentImpact: {
            lawChaos: 5, // Lawful - practical choice
            goodEvil: 0,
          },
          resultText: `
You pull the standard-issue rags from the top shelf.

The fabric is coarse but serviceable. Someone left these here
for you - basic crew gear from before the journey began.

Items acquired:
  • [Cryo-Suit Rags] - Basic necklace
  • [Standard Shirt] - Utility shirt
  • [Deck Pants] - Reinforced pants

The practical choice. You are building a foundation.

[Items added to inventory]
          `.trim(),
        },
        optionB: {
          letter: "B",
          text: "DIG DEEPER",
          alignmentImpact: {
            lawChaos: -5, // Chaotic - curiosity
            goodEvil: 0,
          },
          resultText: `
You push aside the rags and search the back of the locker.

Your fingers find a hidden seam. The panel releases with a soft click.
Inside: a small botanical specimen in preservation gel.

[Botanical Sample] acquired.

The ship's manifest doesn't list any plant material. Someone hid
this here deliberately. The specimen pulses with faint bioluminescence.

You pocket it quickly.

[Special item added to inventory]
          `.trim(),
        },
        location: gameState.currentLocation,
      };

      const output = `
${createBorderedTitle("SUPPLY CHECK")}

You open your personal storage locker.

Inside, you find a pile of standard-issue fabric on the top shelf—
crew uniforms from before the journey. Basic but functional.

But the back wall of the locker looks... off. There's a slight
irregularity in the panel. Almost like a hidden compartment.

${createDivider()}

What do you do?

${createDivider()}
      `.trim();

      return {
        success: true,
        message: output,
        binaryChoice: supplyCheck,
      };
    }

    // Subsequent visits - locker is empty or shows inventory
    return {
      success: true,
      message: "The locker is empty. All your gear is in your inventory.\n\nType 'inventory' or press [I] to view your items.",
    };
  },
};
