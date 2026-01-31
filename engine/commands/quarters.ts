/**
 * THE LOOT LOCKER Command
 * INCREMENT 2: The Loot Locker - First Binary Choice
 * 
 * A space-time anomaly makes the room feel cavernous.
 * This is where Pioneers make their first alignment choice.
 */

import { Command, CommandResult, CommandContext, CommandCategory, BinaryChoice } from "@/types/game.types";
import { createBorderedTitle, createDivider } from "@/engine/ascii-border";

export const QuartersCommand: Command = {
  name: "quarters",
  aliases: ["q", "locker", "room"],
  description: "Enter The Loot Locker",
  usage: "quarters",
  category: CommandCategory.NAVIGATION,

  execute(args: string[], context: CommandContext): CommandResult {
    const { gameState } = context;
    
    const pioneerNumber = gameState.character.pioneerNumber;
    const lockStatus = `Room secured by Pioneer-${String(pioneerNumber).padStart(3, '0')}`;
    
    // Check if first visit - present binary choice
    const isFirstVisit = !gameState.hasVisitedQuarters;
    
    if (isFirstVisit) {
      // THE AWAKENING - First binary choice
      const awakeningChoice: BinaryChoice = {
        id: "loot-locker-awakening",
        frameText: "The Awakening",
        optionA: {
          letter: "A",
          text: "SALVAGE RAGS",
          alignmentImpact: {
            lawChaos: 5, // Lawful choice
            goodEvil: 0,
          },
          resultText: `
You kneel and inspect the pile of fabric.

The rags are coarse but serviceable—remnants of crew uniforms 
from the pre-Crash era. You recognize the pattern: Pioneer 
standard-issue. Someone left these here intentionally.

You gather what you need:
  • [10-necklace] Basic Necklace - "For identification"
  • [4-shirt] Utility Shirt - "Stained but functional"
  • [5-pants] Basic Pants - "Reinforced at the knees"

The practical choice. The safe choice.
You are building a foundation.

[Items added to inventory]
          `.trim(),
        },
        optionB: {
          letter: "B",
          text: "DIG DEEPER",
          alignmentImpact: {
            lawChaos: -5, // Chaotic choice
            goodEvil: 0,
          },
          resultText: `
You push aside the rags and run your fingers along the floor seams.

There—a hidden compartment. The magnetic seal releases with a hiss.
Inside, wrapped in preservation film: a single luminous leaf.

[Aether-Leaf] acquired.

The ship's logs never mentioned botanical samples. This wasn't
in the manifest. Someone hid this here before the Crash.

The leaf pulses with bioluminescent energy. You pocket it quickly,
glancing over your shoulder. Some discoveries are best kept secret.

[Special item added to inventory]
          `.trim(),
        },
        location: gameState.currentLocation,
      };

      const output = `
${createBorderedTitle("THE LOOT LOCKER")}

You step through the threshold and feel the shift—

The walls shimmer with an impossible depth. This room exists
outside normal ship geometry. Quartermaster Briggs's voice
echoes in your memory: "Resonant, stop flapping in the wind.
Use the locker."

${createDivider()}

THE AWAKENING

A pile of fabric lies in the corner—tattered rags from the
pre-Crash era. Standard-issue crew uniforms, left behind
during the evacuation chaos.

But something feels... off.

The floor beneath the rags shows unusual wear patterns.
Scuff marks. As if someone spent time here, digging.
Searching for something hidden.

${createDivider()}

🔒 LOOT LOCKER ACCESS
   ${lockStatus}
   
   This is your first test.
   Choose wisely.

${createDivider()}
      `.trim();

      return {
        success: true,
        message: output,
        updates: {
          currentLocation: "quarters" as any,
          hasVisitedQuarters: true,
        },
        binaryChoice: awakeningChoice,
      };
    }

    // Subsequent visits - normal quarters description
    const output = `
${createBorderedTitle("THE LOOT LOCKER")}

Your personal quarters. The space-time anomaly makes the room
feel larger than it should be.

${createDivider()}

🔒 LOOT LOCKER ACCESS
   ${lockStatus}
   
   Only you can modify this space.

${createDivider()}

AVAILABLE ACTIONS:
  • Type 'look' to examine your quarters
  • Type 'inventory' to check your gear
  • Type 'leave' to return to the ship

${createDivider()}
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
