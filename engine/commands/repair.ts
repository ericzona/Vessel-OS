/**
 * REPAIR Command
 * Repairs ship systems using subjective time as currency
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";

export const RepairCommand: Command = {
  name: "repair",
  aliases: ["fix"],
  description: "Repair a ship system using subjective time",
  usage: "repair <system>",
  category: CommandCategory.SHIP,

  execute(args: string[], context: CommandContext): CommandResult {
    const { shipHeartbeat, timeDilatation, gameState } = context;
    
    if (args.length === 0) {
      return {
        success: false,
        message: `Usage: repair <system>

Available systems: power, oxygen, hull, cryo

COST: 10 subjective time units per repair action
EFFECT: Restores 15% system integrity`,
      };
    }

    const system = args[0].toLowerCase();
    const validSystems = ["power", "oxygen", "hull", "cryo"];
    
    if (!validSystems.includes(system)) {
      return {
        success: false,
        message: `Invalid system: '${system}'

Valid systems: ${validSystems.join(", ")}`,
      };
    }

    // Check subjective time cost
    const REPAIR_COST = 10;
    const timeState = timeDilatation.getState();
    
    if (timeState.subjectiveTime < REPAIR_COST) {
      return {
        success: false,
        message: `INSUFFICIENT SUBJECTIVE TIME

Required: ${REPAIR_COST} units
Available: ${timeState.subjectiveTime.toFixed(1)} units

Wait at normal time scale to recharge, or use 'time normal' command.`,
      };
    }

    // Deduct subjective time
    const newSubjectiveTime = Math.max(0, timeState.subjectiveTime - REPAIR_COST);
    timeDilatation.state = {
      ...timeState,
      subjectiveTime: newSubjectiveTime,
    };

    // Perform repair
    const REPAIR_AMOUNT = 15;
    shipHeartbeat.repair(system as any, REPAIR_AMOUNT);
    
    const systems = shipHeartbeat.getSystems();
    const currentValue = systems[system as keyof typeof systems];

    return {
      success: true,
      message: `REPAIR INITIATED: ${system.toUpperCase()}

⚙️  Subjective time consumed: ${REPAIR_COST} units
➤  Remaining: ${newSubjectiveTime.toFixed(1)} units

✓  ${system.toUpperCase()} restored: +${REPAIR_AMOUNT}%
➤  Current integrity: ${currentValue.toFixed(1)}%

Time flows differently when you focus on a single task.
The ship responds to your attention.`,
    };
  },
};
