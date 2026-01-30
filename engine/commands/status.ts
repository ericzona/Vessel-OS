/**
 * STATUS Command
 * Displays comprehensive ship systems report
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";
import { getPioneerSummary } from "@/engine/pioneer-generator";
import { formatCharacterLoot } from "@/types/loot.types";
import { createBorderedTitle, createDivider } from "@/engine/ascii-border";

export const StatusCommand: Command = {
  name: "status",
  aliases: ["stat", "systems", "s", "a"],
  description: "Display status menu with options",
  usage: "status [option]",
  category: CommandCategory.SHIP,

  execute(args: string[], context: CommandContext): CommandResult {
    const { shipHeartbeat, timeDilatation, gameState } = context;
    
    // Special handling: if command was 'a', show alignment directly
    if (args.length === 0 && context.gameState.currentLocation) {
      // Check if this was called as 'a' shortcut by looking at command history
      // For now, show menu if called as 'status', alignment if called as 'a'
    }
    
    // If no args, show menu
    if (args.length === 0) {
      const menu = `
╔════════════════════════════════════════════════════════════╗
║                       STATUS MENU                          ║
╚════════════════════════════════════════════════════════════╝

Select an option to view detailed information:

  [S] Ship Status     - View ship systems and health
  [P] Pioneer Manifest - View your Pioneer profile (or press P key)
  [A] Alignment/Quests - View your 9-point alignment and quest log

Usage: status <option>
Example: status s    (or just type 's')
Example: status p    (or press [P] key anywhere)
Example: status a    (or just type 'a')

───────────────────────────────────────────────────────────

💡 TIP: Most commands have single-letter shortcuts for speed.
Type 'help' to see all available commands.
      `.trim();
      
      return {
        success: true,
        message: menu,
      };
    }
    
    // Handle specific status views
    const option = args[0].toLowerCase();
    
    if (option === 's' || option === 'ship') {
      return showShipStatus(shipHeartbeat, timeDilatation, gameState);
    } else if (option === 'p' || option === 'pioneer') {
      return showPioneerInfo(gameState);
    } else if (option === 'a' || option === 'alignment') {
      return showAlignmentStatus(gameState);
    } else {
      return {
        success: false,
        message: `Unknown status option: '${option}'\n\nType 'status' to see available options.`,
      };
    }
  },
};

function showShipStatus(shipHeartbeat: any, timeDilatation: any, gameState: any): CommandResult {
  const report = shipHeartbeat.getStatusReport();
  const timeState = timeDilatation.getState();
  const health = shipHeartbeat.getOverallHealth();

  const title = "SHIP STATUS REPORT";
  const paddedTitle = title.padStart((60 + title.length) / 2).padEnd(60);
  
  const message = `
╔════════════════════════════════════════════════════════════╗
║${paddedTitle}║
╚════════════════════════════════════════════════════════════╝

${report}

TIME DILATATION:
  Scale: ${timeState.timeScale}x
  Subjective Time: ${timeState.subjectiveTime.toFixed(1)}/${timeState.maxSubjectiveTime}

OVERALL HEALTH: ${health.toFixed(1)}%
GAME TIME: ${gameState.gameTime} ticks

STATUS: ${health > 75 ? "NOMINAL" : health > 50 ? "DEGRADED" : health > 25 ? "CRITICAL" : "EMERGENCY"}
  `.trim();

  return {
    success: true,
    message,
  };
}

function showPioneerInfo(gameState: any): CommandResult {
  const message = `
╔════════════════════════════════════════════════════════════╗
║                    PIONEER MANIFEST                        ║
╚════════════════════════════════════════════════════════════╝

PIONEER #${gameState.character.pioneerNumber} - Generation ${gameState.character.pioneerManifest.generation}

💡 PRE-CRASH PIONEER LOG:
"You are Pioneer #${gameState.character.pioneerNumber} of 2,847. The Great Crash during departure from 
Lootopian orbit scattered the fleet. Most crew remain in cryo-sleep. 
Your mission: keep the ship alive until you reach the new galaxy."

───────────────────────────────────────────────────────────

${getPioneerSummary(gameState.character.pioneerManifest)}

───────────────────────────────────────────────────────────

${formatCharacterLoot(gameState.character.characterLoot)}

───────────────────────────────────────────────────────────

📊 LOOTOPIAN CORE STATS (10-20, Bench of 12: 10-21):
  STR (Strength):     ${gameState.character.pioneerManifest.stats.str}
  VIT (Vitality):     ${gameState.character.pioneerManifest.stats.vit}
  AGI (Agility):      ${gameState.character.pioneerManifest.stats.agi}
  INT (Intelligence): ${gameState.character.pioneerManifest.stats.int}
  LCK (Luck):         ${gameState.character.pioneerManifest.stats.lck}
  DEX (Dexterity):    ${gameState.character.pioneerManifest.stats.dex}
  
  TOTAL: ${gameState.character.pioneerManifest.stats.str + gameState.character.pioneerManifest.stats.vit + gameState.character.pioneerManifest.stats.agi + gameState.character.pioneerManifest.stats.int + gameState.character.pioneerManifest.stats.lck + gameState.character.pioneerManifest.stats.dex}

───────────────────────────────────────────────────────────

💡 TIP: Press [P] or click your avatar to see full profile with alignment.
  `.trim();

  return {
    success: true,
    message,
  };
}

function showAlignmentStatus(gameState: any): CommandResult {
  const alignment = gameState.alignment;
  const { getAlignmentDescription } = require("@/types/alignment.types");
  
  const quests = alignment.questLog.length > 0 
    ? alignment.questLog.map((q: any) => `  • ${q.name} [${q.status.toUpperCase()}]`).join('\n')
    : '  No active quests.';
  
  const recentChoices = alignment.alignmentHistory.slice(-5).reverse();
  const choiceHistory = recentChoices.length > 0
    ? recentChoices.map((shift: any, i: number) => {
        const impact = `(${shift.lawChaosShift > 0 ? '+' : ''}${shift.lawChaosShift} Law/Chaos, ${shift.goodEvilShift > 0 ? '+' : ''}${shift.goodEvilShift} Good/Evil)`;
        return `  ${i + 1}. ${shift.choice} ${impact}`;
      }).join('\n')
    : '  No choices made yet.';

  const message = `
╔════════════════════════════════════════════════════════════╗
║                  ALIGNMENT & QUEST LOG                     ║
╚════════════════════════════════════════════════════════════╝

⚖️  CURRENT ALIGNMENT: ${alignment.currentAlignment}

${getAlignmentDescription(alignment.currentAlignment)}

───────────────────────────────────────────────────────────

ALIGNMENT SCORES:

  Law ←─────────────────────────→ Chaos
       ${alignment.scores.lawChaos.toString().padStart(4)} / 100

  Good ←────────────────────────→ Evil
       ${alignment.scores.goodEvil.toString().padStart(4)} / 100

───────────────────────────────────────────────────────────

📜 QUEST LOG:

${quests}

───────────────────────────────────────────────────────────

🔄 RECENT ALIGNMENT SHIFTS (Last 5):

${choiceHistory}

───────────────────────────────────────────────────────────

Total Choices Made: ${alignment.alignmentHistory.length}

💡 Your alignment affects NPCs reactions and unlocks specific story paths.
Every choice shapes your Pioneer's soul across the 9-point spectrum.
  `.trim();

  return {
    success: true,
    message,
  };
}
