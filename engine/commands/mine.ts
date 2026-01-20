/**
 * MINE Command
 * Allows players to mine the void for $SCRAP
 * 
 * Cost: 20 subjective time units
 * Yield: 1-5 $SCRAP (random)
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";

export const MineCommand: Command = {
  name: "mine",
  aliases: ["dig", "extract"],
  description: "Mine the void for $SCRAP resources",
  usage: "mine",
  category: CommandCategory.INVENTORY,
  
  execute(args: string[], context: CommandContext): CommandResult {
    const { shipHeartbeat, timeDilatation, gameState } = context;
    
    const MINING_COST = 20; // Subjective time units
    const MIN_SCRAP = 1;
    const MAX_SCRAP = 5;
    
    // Get current time state
    const timeState = timeDilatation.getState();
    
    // Check if player has enough subjective time
    if (timeState.subjectiveTime < MINING_COST) {
      return {
        success: false,
        message: `INSUFFICIENT SUBJECTIVE TIME

Mining requires ${MINING_COST} units of subjective time.
Current: ${timeState.subjectiveTime.toFixed(1)} units

Wait for subjective time to recharge (1 unit per second at normal speed).`,
      };
    }
    
    // Calculate random scrap yield
    const scrapYield = Math.floor(Math.random() * (MAX_SCRAP - MIN_SCRAP + 1)) + MIN_SCRAP;
    
    // Deduct subjective time
    const newSubjectiveTime = Math.max(0, timeState.subjectiveTime - MINING_COST);
    timeDilatation.state = {
      ...timeState,
      subjectiveTime: newSubjectiveTime,
    };
    
    // Add scrap to ship systems
    const systems = shipHeartbeat.getSystems();
    systems.scrap += scrapYield;
    
    // Update the ship heartbeat with new scrap value
    shipHeartbeat.repair("scrap" as any, scrapYield);
    
    // Generate mining narrative based on yield
    let narrative = "";
    if (scrapYield === MAX_SCRAP) {
      narrative = "A rich vein! The void yields generously.";
    } else if (scrapYield >= 3) {
      narrative = "Decent haul. The scrap collectors hum with satisfaction.";
    } else {
      narrative = "Slim pickings, but every fragment counts.";
    }
    
    // Lore injection: 15% chance to find corrupted data fragment
    const foundLore = Math.random() < 0.15;
    const loreFragments = [
      `
⚠️  CORRUPTED DATA FRAGMENT DETECTED

[LOG_ENTRY_#2847-A] "...asteroids appeared on scopes without warning. 
No trajectory. No source. They struck the Lootopian orbital dock like 
a surgical strike. Debris cascaded through our departure vector. We had 
no choice but to sever moorings and burn hard. Impact in 3... 2..."
[END TRANSMISSION]`,
      
      `
⚠️  CORRUPTED DATA FRAGMENT DETECTED

[PERSONAL_LOG_CAPTAIN_VESS] "The Pioneers trusted me to lead them to 
the new galaxy. Now half are dead, the rest frozen in cryo. I don't know 
if we'll ever wake them. The ship is dying. I'm staying at the helm. 
Someone has to guide them home, even if it takes generations..."
[SIGNAL LOST]`,
      
      `
⚠️  CORRUPTED DATA FRAGMENT DETECTED

[LOOTOPIAN_NEWS_ARCHIVE] "BREAKING: Orbital defense grid offline. 
Source of asteroid bombardment remains unknown. Conspiracy theorists 
claim sabotage. Officials deny any connection to the departing colony 
ships. Casualty estimates exceed 10,000..."
[DATA CORRUPTION - FILE INCOMPLETE]`,
      
      `
⚠️  CORRUPTED DATA FRAGMENT DETECTED

[SHIP_AI_LOG] "Crew morale declining. Resources depleting faster than 
projected. Subjective time manipulation technology shows promise for 
extending effective operational lifespan. Recommend awakening crew in 
rotating shifts across centuries. One Pioneer at a time..."
[RECOMMENDATION ACCEPTED]`,
    ];
    
    const updatedSystems = shipHeartbeat.getSystems();
    
    let message = `MINING OPERATION INITIATED

⛏️  Subjective time consumed: ${MINING_COST} units
➤  Remaining: ${newSubjectiveTime.toFixed(1)} units

✓  $SCRAP extracted: +${scrapYield}
➤  Total $SCRAP: ${updatedSystems.scrap.toFixed(1)}

${narrative}

The void is vast. More resources await.`;

    // Append lore fragment if found
    if (foundLore) {
      const randomFragment = loreFragments[Math.floor(Math.random() * loreFragments.length)];
      message += "\n\n" + randomFragment;
    }
    
    return {
      success: true,
      message,
    };
  },
};
