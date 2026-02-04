/**
 * SPAR Command - Combat Training
 * Strike the sparring dummy to verify STR stats and gain combat XP
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";
import { createBorderedTitle, createDivider } from "@/engine/ascii-border";

export const SparCommand: Command = {
  name: "spar",
  aliases: ["train", "strike", "hit dummy"],
  description: "Train with the sparring dummy",
  usage: "spar",
  category: CommandCategory.UTILITY,

  execute(args: string[], context: CommandContext): CommandResult {
    const { gameState } = context;
    
    // Spatial check: Must be in dojo
    if (gameState.currentLocation !== "dojo") {
      return {
        success: false,
        message: "You need to be in the Training Dojo to spar.\n\nTake the Vibe-Rail to Deck 04.",
      };
    }
    
    // Get Pioneer STR stat
    const pioneerSTR = gameState.character.pioneerManifest.stats.str;
    const dummyDefense = 10;
    
    // Combat math calculation
    const attackRoll = Math.floor(Math.random() * 20) + 1; // 1d20
    const totalAttack = attackRoll + pioneerSTR;
    const hit = totalAttack >= dummyDefense;
    
    // Damage calculation (if hit)
    let damage = 0;
    if (hit) {
      damage = Math.floor(pioneerSTR / 2) + Math.floor(Math.random() * 6) + 1; // STR/2 + 1d6
    }
    
    // XP reward
    const xpGained = hit ? 10 : 5;
    
    const output = `
${createBorderedTitle("COMBAT TRAINING")}

You approach the sparring dummy and strike.

${createDivider()}

⚔️  ATTACK ROLL
   Roll: ${attackRoll}
   STR Bonus: +${pioneerSTR}
   Total: ${totalAttack}
   
🛡️  TARGET DEFENSE
   Dummy Defense: ${dummyDefense}
   
${hit ? '✅ HIT!' : '❌ MISS'}

${createDivider()}

${hit ? `
💥 DAMAGE CALCULATION
   Base: ${Math.floor(pioneerSTR / 2)} (STR/2)
   Roll: 1d6 = ${damage - Math.floor(pioneerSTR / 2)}
   Total Damage: ${damage}

The dummy absorbs the impact. Sensors flash green.
` : `
Your strike misses the mark. The dummy remains still.
Try again to improve your form.
`}

${createDivider()}

📊 COMBAT DATA LOGGED
   XP Gained: +${xpGained} Combat Experience
   
   Pioneer STR: ${pioneerSTR}
   Attack Success Rate: ${hit ? '100%' : '0%'} (this session)

${createDivider()}

💡 The terminal displays your performance metrics.
   Type 'spar' again to continue training.
    `.trim();

    return {
      success: true,
      message: output,
    };
  },
};
