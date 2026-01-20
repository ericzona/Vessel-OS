/**
 * STATUS Command
 * Displays comprehensive ship systems report
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";
import { getPioneerSummary } from "@/engine/pioneer-generator";

export const StatusCommand: Command = {
  name: "status",
  aliases: ["stat", "systems"],
  description: "Show full ship status report with all systems",
  usage: "status",
  category: CommandCategory.SHIP,

  execute(args: string[], context: CommandContext): CommandResult {
    const { shipHeartbeat, timeDilatation, gameState } = context;
    
    const report = shipHeartbeat.getStatusReport();
    const timeState = timeDilatation.getState();
    const health = shipHeartbeat.getOverallHealth();

    const message = `
╔════════════════════════════════════════════════════════════╗
║                    SHIP STATUS REPORT                     ║
╚════════════════════════════════════════════════════════════╝

${report}

TIME DILATATION:
  Scale: ${timeState.timeScale}x
  Subjective Time: ${timeState.subjectiveTime.toFixed(1)}/${timeState.maxSubjectiveTime}

OVERALL HEALTH: ${health.toFixed(1)}%
GAME TIME: ${gameState.gameTime} ticks

STATUS: ${health > 75 ? "NOMINAL" : health > 50 ? "DEGRADED" : health > 25 ? "CRITICAL" : "EMERGENCY"}

───────────────────────────────────────────────────────────

💡 PRE-CRASH PIONEER LOG:
"You are Pioneer #${gameState.character.pioneerNumber} of 2,847. The Great Crash during departure from 
Lootopian orbit scattered the fleet. Most crew remain in cryo-sleep. 
Your mission: keep the ship alive until you reach the new galaxy. 
The journey requires subjective time manipulation—one Pioneer, awake 
for centuries, aging slowly while others dream of a new world."

───────────────────────────────────────────────────────────

${getPioneerSummary(gameState.character.pioneerManifest)}
    `.trim();

    return {
      success: true,
      message,
    };
  },
};
