/**
 * Pioneer Generator
 * Creates randomized Pioneer manifests for new players
 * Pre-Crash DNA awakening system
 */

import { PioneerManifest, LayerSlot } from "@/types/pioneer.types";

// Basic starter assets - MUST match actual file names
const STARTER_ASSETS = {
  backgrounds: ["bg_void_01", "bg_stars_01", "bg_nebula_01"],
  bodies: ["1-white", "2-peach", "3-Tanned-2", "4-Olive", "5-Brown", "6-Brown-2", "7-Brown-3", "8-Black"],
  eyes: ["1-Black", "2-Blue", "3-Brown", "4-Gray", "5-Green", "6-Orange", "7-Purple", "8-Red", "9-Yellow"],
  hair: ["1-spiked-black", "5-spiked-red", "7-spiked-blonde", "26-chronos-black", "27-chronos-blonde"],
  shirts: ["shirt_tattered", "shirt_utility", "shirt_pioneer"],
  pants: ["pants_cargo", "pants_flight", "pants_utility"],
  shoes: ["shoes_boots", "shoes_sneakers"],
};

const RANKS = [
  "Drifter",
  "Technician", 
  "Navigator",
  "Salvager",
  "Engineer",
  "Scout",
];

/**
 * The Bench of 12 - Special Lootopians with stat bonuses
 */
const BENCH_OF_12 = [1, 303, 606, 909, 1212, 1515, 1818, 2121, 2424, 2727, 3030, 3333];

/**
 * Check if a Lootopian is on the Bench of 12
 */
function isOnBench(pioneerId: string): boolean {
  const num = parseInt(pioneerId);
  return !isNaN(num) && BENCH_OF_12.includes(num);
}

/**
 * Generate a single stat
 * @param isBench - Whether this is a Bench of 12 member
 * @returns Stat value (10-20 for regular, 10-21 for Bench)
 */
function generateStat(isBench: boolean): number {
  // Base roll: 10-20 (inclusive)
  const base = Math.floor(Math.random() * 11) + 10;
  
  if (isBench) {
    // Bench members get +1 to +5 bonus
    const bonus = Math.floor(Math.random() * 5) + 1;
    // Cap at 21
    return Math.min(base + bonus, 21);
  }
  
  return base;
}

/**
 * Generate 6 core stats
 */
function generateCoreStats(pioneerId: string) {
  const isBench = isOnBench(pioneerId);
  
  const stats = {
    str: generateStat(isBench),
    vit: generateStat(isBench),
    agi: generateStat(isBench),
    int: generateStat(isBench),
    lck: generateStat(isBench),
    dex: generateStat(isBench),
  };
  
  const total = stats.str + stats.vit + stats.agi + stats.int + stats.lck + stats.dex;
  
  if (isBench) {
    console.log(`🌟 BENCH OF 12 #${pioneerId} VERIFIED`);
    console.log(`   STR: ${stats.str} | VIT: ${stats.vit} | AGI: ${stats.agi}`);
    console.log(`   INT: ${stats.int} | LCK: ${stats.lck} | DEX: ${stats.dex}`);
    console.log(`   TOTAL: ${total} (Range: 66-126 for Bench)`);
  }
  
  return stats;
}

/**
 * Generate a random Pioneer manifest for a new player
 */
export function generatePioneerManifest(pioneerId: string, generation: number = 0): PioneerManifest {
  // Random rank selection
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  
  // Generate layers with basic starter gear - use actual file IDs
  const layers: Record<LayerSlot, string | null> = {
    [LayerSlot.BACKGROUND]: randomFrom(STARTER_ASSETS.backgrounds),
    [LayerSlot.SHADOW]: null, // No shadow for starters
    [LayerSlot.BODY]: randomFrom(STARTER_ASSETS.bodies),
    [LayerSlot.EYES]: randomFrom(STARTER_ASSETS.eyes),
    [LayerSlot.PANTS]: randomFrom(STARTER_ASSETS.pants),
    [LayerSlot.SHOES]: randomFrom(STARTER_ASSETS.shoes),
    [LayerSlot.SHIRT]: randomFrom(STARTER_ASSETS.shirts),
    [LayerSlot.WAIST]: null, // No belt for starters
    [LayerSlot.GLOVES]: null, // No gloves for starters
    [LayerSlot.WRISTS]: null, // No wrist accessories
    [LayerSlot.NECK]: null, // No necklace
    [LayerSlot.FACE_ACC]: null, // No glasses/mask
    [LayerSlot.HAIR_HAT]: randomFrom(STARTER_ASSETS.hair), // Assign actual hair
  };
  
  // Generate 6 core stats
  const stats = generateCoreStats(pioneerId);
  
  return {
    pioneerId,
    generation,
    rank,
    layers,
    stats,
  };
}

/**
 * Get a random item from array
 */
function randomFrom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get human-readable layer description
 */
export function describeLayer(slot: LayerSlot, assetId: string | null): string {
  if (!assetId) return "None";
  
  // Convert asset ID to readable name
  return assetId
    .replace(/_/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Get Pioneer visual summary for display
 */
export function getPioneerSummary(manifest: PioneerManifest): string {
  const activeLayers = Object.entries(manifest.layers)
    .filter(([_, asset]) => asset !== null)
    .length;
  
  const total = manifest.stats.str + manifest.stats.vit + manifest.stats.agi +
                manifest.stats.int + manifest.stats.lck + manifest.stats.dex;
    
  return `
╔════════════════════════════════════════════════════════════╗
║                    PIONEER MANIFEST                       ║
╚════════════════════════════════════════════════════════════╝

ID: ${manifest.pioneerId}
Rank: ${manifest.rank}
Generation: ${manifest.generation === 0 ? "Pre-Crash OG" : `Gen ${manifest.generation}`}

EQUIPPED LAYERS: ${activeLayers}/13
• Body: ${describeLayer(LayerSlot.BODY, manifest.layers[LayerSlot.BODY])}
• Shirt: ${describeLayer(LayerSlot.SHIRT, manifest.layers[LayerSlot.SHIRT])}
• Pants: ${describeLayer(LayerSlot.PANTS, manifest.layers[LayerSlot.PANTS])}
• Shoes: ${describeLayer(LayerSlot.SHOES, manifest.layers[LayerSlot.SHOES])}

LOOTOPIAN CORE STATS (10-20, Bench: 10-21):
• STR (Strength):     ${manifest.stats.str}
• VIT (Vitality):     ${manifest.stats.vit}
• AGI (Agility):      ${manifest.stats.agi}
• INT (Intelligence): ${manifest.stats.int}
• LCK (Luck):         ${manifest.stats.lck}
• DEX (Dexterity):    ${manifest.stats.dex}

TOTAL: ${total}

[Pre-Crash DNA: AWAKENED]
  `.trim();
}
