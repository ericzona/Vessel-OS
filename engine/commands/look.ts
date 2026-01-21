/**
 * LOOK Command
 * MUSH-style environment description
 * Displays current compartment and obvious exits
 */

import { Command, CommandResult, CommandContext, CommandCategory } from "@/types/game.types";

// Compartment descriptions with lore
const COMPARTMENTS = {
  cryoBay: {
    name: "The Cryo-Bay",
    description: `You stand in the Cryo-Bay, where rows of hibernation pods line the walls
like ancient sarcophagi. Most are dark, their occupants still frozen in 
suspended animation. A few blink with amber warnings.

The air is cold. Frost patterns spiral across the viewports, obscuring
the void beyond. Emergency lighting casts everything in a sickly green.

Through the cracked displays, you can see fragments of the ship's manifest:
"Pioneer-Class Colony Vessel • Destination: [DATA CORRUPTED] • Crew: 2,847"

Only one pod stands open. Yours.`,
    exits: ["engineering", "bridge", "cargo-hold"],
    lore: "The Great Crash left most Pioneers frozen. You are the first to wake.",
  },
  
  engineering: {
    name: "Engineering Deck",
    description: `The heart of the ship hums with failing power cores. Conduits spark
and spit, casting shadows that dance across bulkheads scarred by impact.

Repair drones lie dormant in their charging bays. Without $SCRAP to
fuel them, they're useless. The main reactor display flickers:
"AUXILIARY POWER ONLY • CORE BREACH RISK: MODERATE"

A viewport shows nothing but void and distant asteroids—the debris field
that shattered Lootopia's orbital dock and sent you spiraling into deep space.`,
    exits: ["cryo-bay", "cargo-hold"],
    lore: "The asteroids came from nowhere. Some say it wasn't an accident.",
  },

  bridge: {
    name: "Command Bridge", 
    description: `The bridge is a tomb of dead consoles. Navigation screens flicker with
corrupted data. The captain's chair sits empty, a layer of dust marking
where they once sat before the crash.

Through the forward viewport: infinite darkness. No stars. No landmarks.
Just the endless void and the faint glow of your destination—a galaxy
too far to reach in a single lifetime.

The only active terminal displays a message loop:
"AUTO-PILOT ENGAGED • ETA: [CALCULATING...] • WARNING: SUBJECTIVE TIME REQUIRED"`,
    exits: ["cryo-bay"],
    lore: "The captain never made it to the pods. Their legacy is your burden.",
  },

  cargoHold: {
    name: "Cargo Hold",
    description: `Massive. Cavernous. Half-empty from the crash that tore open bay doors
and spilled supplies into the void. What remains is secured by mag-locks:
crates of seeds, tools, building materials for a colony that may never exist.

Mining equipment sits ready. The void is rich with salvageable debris—
fragments of Lootopia's fallen orbital stations, frozen in asteroid belts.

A faded mural on the wall shows the Lootopian homeworld: green continents,
blue oceans, twin moons. All of it lost now, light-years behind you.`,
    exits: ["cryo-bay", "engineering"],
    lore: "Lootopia fell. You carry its seeds to a new galaxy.",
  },
};

type CompartmentKey = keyof typeof COMPARTMENTS;

export const LookCommand: Command = {
  name: "look",
  aliases: ["l", "examine", "inspect"],
  description: "Examine your current location",
  usage: "look [location]",
  category: CommandCategory.NAVIGATION,

  execute(args: string[], context: CommandContext): CommandResult {
    const { gameState } = context;
    
    const currentLocation = gameState.currentLocation as CompartmentKey;
    const location = COMPARTMENTS[currentLocation];

    // Show NPCs in current location
    let npcPresence = "";
    if (currentLocation === "cargoHold") {
      npcPresence = `\n\n[NPC] Quartermaster BRIGGS is here, muttering over inventory tablets.\n       Type 'talk briggs' to interact.`;
    }
    
    const formattedExits = location.exits
      .map(exit => {
        const shorthand = exit.charAt(0).toUpperCase();
        const fullName = exit.replace(/-/g, ' ').toUpperCase();
        return `[${shorthand}]${fullName.substring(1)}`;
      })
      .join(", ");

    // Check for founder badge - unlock Captain's Log on Bridge
    const hasFounderBadge = gameState.character.founderBadge;
    const isBridge = currentLocation === "bridge";
    
    let captainsLog = "";
    if (isBridge && hasFounderBadge) {
      captainsLog = `

🔓 FOUNDER ACCESS GRANTED

[CAPTAIN'S LOG - CLASSIFIED]
"To those who supported us from the beginning: You are the reason
this journey exists. The Lootopian legacy lives through you. When
we reach the new galaxy, your names will be etched in the Foundation
Stone. Pioneer #1 of the first generation. Thank you."
- Captain Vess, Final Entry

[COORDINATES UNLOCKED: Hidden sector accessible to Legacy Holders]`;
    }

    const output = `
╔════════════════════════════════════════════════════════════╗
║  ${location.name.toUpperCase().padEnd(57)}║
╚════════════════════════════════════════════════════════════╝

${location.description}

───────────────────────────────────────────────────────────

💡 LORE FRAGMENT: ${location.lore}

───────────────────────────────────────────────────────────

Obvious exits: ${formattedExits}${npcPresence}${captainsLog}

Use 'move <destination>' or shorthand (e.g., 'c' for Cargo) - Costs 1 subjective time
    `.trim();

    return {
      success: true,
      message: output,
    };
  },
};
