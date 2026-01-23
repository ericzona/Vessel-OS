/**
 * LOOK Command
 * MUSH-style environment description
 * Displays current compartment and obvious exits
 * May present binary choices for meaningful interactions
 */

import { Command, CommandResult, CommandContext, CommandCategory, BinaryChoice } from "@/types/game.types";
import { createBorderedTitle, createDivider } from "@/engine/ascii-border";

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
    
    // Map exits to shorthand letters (avoid collisions)
    const exitShorthand: Record<string, string> = {
      "engineering": "E",
      "bridge": "B",
      "cargo-hold": "C",
      "cryo-bay": "K", // K for Kryo to avoid collision with Cargo
    };
    
    const formattedExits = location.exits
      .map(exit => {
        const letter = exitShorthand[exit] || exit.charAt(0).toUpperCase();
        const fullName = exit.replace(/-/g, ' ').toUpperCase();
        const displayName = exit === "cryo-bay" ? "KRYO-BAY" : fullName;
        return `[${letter}]${displayName.substring(1)}`;
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
║${location.name.toUpperCase().padStart((60 + location.name.toUpperCase().length) / 2).padEnd(60)}║
╚════════════════════════════════════════════════════════════╝

${location.description}

───────────────────────────────────────────────────────────

💡 LORE FRAGMENT: ${location.lore}

───────────────────────────────────────────────────────────

Obvious exits: ${formattedExits}${npcPresence}${captainsLog}

Use 'move <destination>' or shorthand (e.g., 'c' for Cargo) - Costs 1 subjective time
    `.trim();

    // 30% chance to trigger a binary choice based on location
    const triggerChoice = Math.random() < 0.3;
    const binaryChoice = triggerChoice ? generateLocationChoice(currentLocation, gameState) : undefined;

    return {
      success: true,
      message: output,
      binaryChoice,
    };
  },
};

/**
 * Generate location-specific binary choices that affect alignment
 */
function generateLocationChoice(location: CompartmentKey, gameState: any): BinaryChoice | undefined {
  const choices: Record<CompartmentKey, BinaryChoice[]> = {
    cryoBay: [
      {
        id: "cryo-wake-pod",
        frameText: `A cryo-pod emits a distress signal. The occupant inside is dying—their 
pod damaged during the crash. You could wake them now, but doing so will 
consume precious life support resources. Or you could end their suffering 
quietly, conserving supplies for those who remain.`,
        optionA: {
          letter: "A",
          text: "Wake them. Every life matters, no matter the cost.",
          alignmentImpact: { lawChaos: 5, goodEvil: 10 },
          resultText: `You override the safety protocols. The pod hisses open. The Pioneer gasps,
alive but weak. They'll need resources, but they're alive. You've saved a life.`,
        },
        optionB: {
          letter: "B",
          text: "Let them sleep. The needs of the many outweigh one life.",
          alignmentImpact: { lawChaos: -5, goodEvil: -8 },
          resultText: `You disable the distress signal. The pod goes dark. Cold pragmatism. The
ship's supplies will last longer now. One less mouth to feed.`,
        },
        location: "cryoBay",
      },
    ],
    engineering: [
      {
        id: "reactor-override",
        frameText: `You discover a manual reactor override. Engaging it would boost power output
by 50% for the next week—enough to run all ship systems at full capacity.
However, the reactor logs warn this will reduce its lifespan by years. The
journey requires centuries. Do you sacrifice the future for comfort now?`,
        optionA: {
          letter: "A",
          text: "Engage the override. We need power now to survive.",
          alignmentImpact: { lawChaos: -8, goodEvil: 2 },
          resultText: `The reactor roars to life. Lights brighten. Warmth floods the corridors. For
now, the ship feels alive again. But at what cost to those who come after?`,
        },
        optionB: {
          letter: "B",
          text: "Follow protocol. Conserve the reactor for future generations.",
          alignmentImpact: { lawChaos: 8, goodEvil: 5 },
          resultText: `You resist temptation. The reactor continues its slow, steady burn. Future
Pioneers will thank you for your restraint—if they ever wake.`,
        },
        location: "engineering",
      },
    ],
    bridge: [
      {
        id: "captain-chair",
        frameText: `The captain's terminal flickers to life. It contains classified information:
coordinates to a shortcut through an uncharted nebula. The route could cut
the journey time in half, but navigation logs mark it as "EXTREME HAZARD - 
87% CREW LOSS PROJECTION." Do you gamble everything for a faster arrival?`,
        optionA: {
          letter: "A",
          text: "Take the shortcut. Fortune favors the bold.",
          alignmentImpact: { lawChaos: -10, goodEvil: -3 },
          resultText: `You plot the new course. The ship's trajectory shifts. The gamble is set. You
may reach the new galaxy in half the time—or doom everyone aboard.`,
        },
        optionB: {
          letter: "B",
          text: "Stick to the original route. Safety over speed.",
          alignmentImpact: { lawChaos: 7, goodEvil: 8 },
          resultText: `The original flight path remains locked. Slow. Safe. Methodical. The journey
will take centuries, but at least there's a journey to complete.`,
        },
        location: "bridge",
      },
    ],
    cargoHold: [
      {
        id: "seed-vault",
        frameText: `You find emergency rations hidden behind Lootopian seed crates. Enough food
to keep you comfortable for months. But these seeds are the colony's future—
their only hope of survival in the new galaxy. Do you take from tomorrow to
ease your hunger today?`,
        optionA: {
          letter: "A",
          text: "Take the rations. Survival is immediate, not theoretical.",
          alignmentImpact: { lawChaos: -6, goodEvil: -7 },
          resultText: `You pocket the rations. Your stomach thanks you. The seed vault sits lighter
now, its contents reduced. The colony will have fewer options when it lands.`,
        },
        optionB: {
          letter: "B",
          text: "Leave the vault intact. Protect the colony's future.",
          alignmentImpact: { lawChaos: 5, goodEvil: 10 },
          resultText: `You seal the vault. Your hunger remains, but the seeds are safe. Somewhere,
in a future you may never see, colonists will plant these seeds and thrive.`,
        },
        location: "cargoHold",
      },
    ],
  };

  const locationChoices = choices[location];
  if (!locationChoices || locationChoices.length === 0) return undefined;

  // Return a random choice from this location
  return locationChoices[Math.floor(Math.random() * locationChoices.length)];
}
