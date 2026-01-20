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

    // Perform repair with 15% Sovereign Fee deduction
    const REPAIR_AMOUNT = 15;
    
    // Calculate 15% Sovereign Fee distribution
    const SOVEREIGN_FEE_RATE = 0.15;
    const sovereignFee = REPAIR_COST * SOVEREIGN_FEE_RATE;
    const netRepairCost = REPAIR_COST - sovereignFee;
    
    // Distribute to vaults
    const treasuryShare = sovereignFee * (5 / 15); // 5% of total
    const marketingShare = sovereignFee * (5 / 15); // 5% of total
    const builderShare = sovereignFee * (2.5 / 15); // 2.5% of total
    const gcShare = sovereignFee * (2.5 / 15); // 2.5% of total (Garbage Collector)
    
    // Update sovereign vaults
    gameState.sovereignVaults.treasury += treasuryShare;
    gameState.sovereignVaults.marketing += marketingShare;
    gameState.sovereignVaults.builderRewards += builderShare;
    gameState.sovereignVaults.garbageCollector += gcShare;
    
    shipHeartbeat.repair(system as any, REPAIR_AMOUNT);
    
    const systems = shipHeartbeat.getSystems();
    const currentValue = systems[system as keyof typeof systems];

    return {
      success: true,
      message: `REPAIR INITIATED: ${system.toUpperCase()}

⚙️  Subjective time consumed: ${REPAIR_COST} units
➤  Remaining: ${newSubjectiveTime.toFixed(1)} units
📊  Sovereign Fee (15%): ${sovereignFee.toFixed(1)} units allocated to vaults

✓  ${system.toUpperCase()} restored: +${REPAIR_AMOUNT}%
➤  Current integrity: ${currentValue.toFixed(1)}%

[SOVEREIGN FEE DISTRIBUTION]
• Treasury: +${treasuryShare.toFixed(2)} (5%)
• Marketing: +${marketingShare.toFixed(2)} (5%)
• Builder Rewards: +${builderShare.toFixed(2)} (2.5%)
• Garbage Collector: +${gcShare.toFixed(2)} (2.5%)

Time flows differently when you focus on a single task.
The ship responds to your attention.`,
    };
  },
};
