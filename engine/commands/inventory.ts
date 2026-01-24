/**
 * INVENTORY Command
 * Displays Pioneer's collected items and unlocks
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";
import { createBorderedTitle, createDivider } from "@/engine/ascii-border";

export const InventoryCommand: Command = {
  name: "inventory",
  aliases: ["inv", "i", "items"],
  description: "View your inventory and collected items",
  usage: "inventory",
  category: CommandCategory.UTILITY,

  execute(args: string[], context: CommandContext): CommandResult {
    const { gameState } = context;
    
    const inventory = gameState.inventory;
    const itemCount = inventory.items.length;
    const maxSlots = inventory.maxSlots;
    
    // Header
    let output = `
╔════════════════════════════════════════════════════════════╗
║${"PIONEER INVENTORY".padStart((60 + "PIONEER INVENTORY".length) / 2).padEnd(60)}║
╚════════════════════════════════════════════════════════════╝

Capacity: ${itemCount}/${maxSlots} slots used

`;

    if (itemCount === 0) {
      output += `Your inventory is empty.

Items you collect during your journey will appear here.
Unlocks from decision trees, found objects, and crafted items
will be tracked and available for use.

───────────────────────────────────────────────────────────

💡 TIP: Explore with 'inspect' to discover hidden items.
`;
    } else {
      output += "COLLECTED ITEMS:\n\n";
      
      inventory.items.forEach((item, index) => {
        output += `  ${index + 1}. ${item.name}`;
        if (item.quantity > 1) {
          output += ` (x${item.quantity})`;
        }
        output += `\n     ${item.description}\n\n`;
      });
      
      output += "───────────────────────────────────────────────────────────\n\n";
      output += "💡 Use items with specific commands (e.g., 'use medkit').\n";
    }
    
    // Show unlocked areas/features (from alignment choices)
    const unlocks = gameState.alignment?.alignmentHistory
      .map(shift => shift.choice)
      .filter(choice => choice.includes("unlocked")) || [];
    
    if (unlocks.length > 0) {
      output += "\nUNLOCKED FEATURES:\n\n";
      unlocks.forEach((unlock, i) => {
        output += `  🔓 ${unlock}\n`;
      });
    }

    return {
      success: true,
      message: output.trim(),
    };
  },
};
