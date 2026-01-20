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

RESOURCE MANAGEMENT:
  mine                - Mine the void for $SCRAP (costs 20 subjective time)
                       Yields 1-5 $SCRAP randomly
                       Aliases: dig, extract

EXPLORATION:
  look                - Examine your current location
                       Discover lore fragments about the Great Crash
                       Aliases: l, examine, inspect

TIME MANIPULATION:
  time <mode>         - Adjust time scale (slow/normal/fast)
                       Normal speed recharges subjective time
  
UTILITY:
  help                - Show this help text

═══════════════════════════════════════════════════════════

GAMEPLAY LOOP:
1. Monitor ship systems with 'status'
2. Mine $SCRAP resources with 'mine' (costs subjective time)
3. Use 'repair <system>' to fix degrading systems
4. Subjective time recharges at 1 unit/sec (normal speed)
5. Manage time vs repairs vs mining to survive

Your ship degrades constantly. Keep systems above 0% to survive.
$SCRAP is the future currency for upgrades and crafting.
    `.trim();

    return {
      success: true,
      message: helpText,
    };
  },
};
