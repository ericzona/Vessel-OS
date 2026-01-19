/**
 * STATUS Command
 * Displays comprehensive ship systems report
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";

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
    `.trim();

    return {
      success: true,
      message,
    };
  },
};
