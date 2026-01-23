/**
 * BRIGGS - "The Sayer of Sayings"
 * 
 * A grizzled NPC with a unique personality blend:
 * - 40% Pirate (nautical, treasure-focused, "arr" energy)
 * - 40% Prospector (mining wisdom, frontier mentality, "strike it rich")
 * - 20% Confucius (philosophical, cryptic wisdom)
 * 
 * Briggs dispenses comical yet oddly wise advice to Pioneers navigating The Great Transit.
 */

export interface BriggsSaying {
  text: string;
  type: 'pirate' | 'prospector' | 'confucius';
}

// 40% Pirate sayings (nautical wisdom)
const PIRATE_SAYINGS: string[] = [
  "Arrr, the void be vast, but a Pioneer's resolve be vaster!",
  "Dead men tell no tales, but dead ships tell even fewer. Keep yer hull patched, savvy?",
  "The stars be yer treasure map, mate. X marks the colony!",
  "A smooth void never made a skilled captain. Embrace the chaos!",
  "Aye, the cryo pods be like a pirate's rum - ye never know what ye'll wake up to!",
  "Batten down the hatches! The cosmos don't give second chances.",
  "Every Pioneer be the captain of their own destiny. Chart yer course!",
  "The void's darker than a kraken's belly, but yer ship's got teeth!",
];

// 40% Prospector sayings (frontier mining wisdom)
const PROSPECTOR_SAYINGS: string[] = [
  "There's gold in them stars, partner! Keep diggin' through the void.",
  "A good claim ain't worth nothin' if yer pick breaks. Repair yer tools!",
  "The frontier don't suffer fools. Check yer oxygen 'fore ye check yer pride.",
  "Strike while the iron's hot, but don't strike when the hull's cold!",
  "Every rock tells a story, if ye listen close enough. Mine wisely.",
  "Ain't no shame in restin' at camp. Subjective time's cheaper than a funeral.",
  "The richest vein runs deep, Pioneer. Don't give up on the first dry shaft.",
  "Out here, a man's worth is measured in grit and $SCRAP. Keep both close.",
];

// 20% Confucius sayings (philosophical wisdom)
const CONFUCIUS_SAYINGS: string[] = [
  "The ship that repairs itself today, sails tomorrow.",
  "When the void speaks, only the silent hear its secrets.",
  "A journey of a thousand light-years begins with a single repair.",
  "The wise Pioneer knows: time flows faster when you're busy fixing leaks.",
];

/**
 * Returns a random saying from Briggs based on personality distribution
 * 40% chance pirate, 40% chance prospector, 20% chance philosophical
 */
export function getBriggsSaying(): BriggsSaying {
  const roll = Math.random();
  
  if (roll < 0.4) {
    // 40% Pirate
    const saying = PIRATE_SAYINGS[Math.floor(Math.random() * PIRATE_SAYINGS.length)];
    return { text: saying, type: 'pirate' };
  } else if (roll < 0.8) {
    // 40% Prospector (0.4 to 0.8)
    const saying = PROSPECTOR_SAYINGS[Math.floor(Math.random() * PROSPECTOR_SAYINGS.length)];
    return { text: saying, type: 'prospector' };
  } else {
    // 20% Confucius (0.8 to 1.0)
    const saying = CONFUCIUS_SAYINGS[Math.floor(Math.random() * CONFUCIUS_SAYINGS.length)];
    return { text: saying, type: 'confucius' };
  }
}

/**
 * Get a greeting from Briggs (used when first encountering him)
 */
export function getBriggsGreeting(): string {
  const greetings = [
    "Well, well! Another Pioneer seekin' wisdom from ol' Briggs, eh?",
    "Ahoy there, mate! Come fer a tale or just lost in the void?",
    "Partner! Pull up a crate. Briggs has got words fer ye.",
    "Arrr! The void's lonely, but ye found the right crusty ol' dog to talk to!",
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * Get Briggs' farewell message
 */
export function getBriggsFarewell(): string {
  const farewells = [
    "Fair winds and full sails, Pioneer!",
    "May yer hull stay patched and yer oxygen flow steady!",
    "Keep yer eyes on the stars and yer hands on the controls, mate.",
    "Until we meet again in this cold, dark void!",
  ];
  return farewells[Math.floor(Math.random() * farewells.length)];
}

/**
 * Get all sayings (useful for debugging or displaying full collection)
 */
export function getAllSayings(): BriggsSaying[] {
  return [
    ...PIRATE_SAYINGS.map(text => ({ text, type: 'pirate' as const })),
    ...PROSPECTOR_SAYINGS.map(text => ({ text, type: 'prospector' as const })),
    ...CONFUCIUS_SAYINGS.map(text => ({ text, type: 'confucius' as const })),
  ];
}

/**
 * Get the total count of sayings available
 */
export function getSayingsCount(): { total: number; pirate: number; prospector: number; confucius: number } {
  return {
    total: PIRATE_SAYINGS.length + PROSPECTOR_SAYINGS.length + CONFUCIUS_SAYINGS.length,
    pirate: PIRATE_SAYINGS.length,
    prospector: PROSPECTOR_SAYINGS.length,
    confucius: CONFUCIUS_SAYINGS.length,
  };
}
