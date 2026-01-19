/**
 * HELP Command
 * Shows available commands and their usage
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";

export const HelpCommand: Command = {
  name: "help",
  aliases: ["commands", "?"],
  description: "Show available commands and their usage",
  usage: "help [command]",
  category: CommandCategory.UTILITY,

  execute(args: string[], context: CommandContext): CommandResult {
    const helpText = `
╔════════════════════════════════════════════════════════════╗
║                   AVAILABLE COMMANDS                      ║
╚════════════════════════════════════════════════════════════╝

SHIP OPERATIONS:
  status              - Show full ship status report
  repair <system>     - Repair a system (costs 10 subjective time)
  
AVAILABLE SYSTEMS:  power, oxygen, hull, cryo

TIME MANIPULATION:
  time <mode>         - Adjust time scale (slow/normal/fast)
                       Normal speed recharges subjective time
  
UTILITY:
  help                - Show this help text

═══════════════════════════════════════════════════════════

GAMEPLAY LOOP:
1. Monitor ship systems with 'status'
2. Use 'repair <system>' to fix degrading systems
3. Repairs cost subjective time (recharges at normal speed)
4. Manage time flow to balance repairs and recharge

Your ship degrades constantly. Keep systems above 0% to survive.
    `.trim();

    return {
      success: true,
      message: helpText,
    };
  },
};
