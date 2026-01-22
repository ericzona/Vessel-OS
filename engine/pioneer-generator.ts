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
  
  // Generate stats based on rank
  const stats = generateStatsForRank(rank);
  
  return {
    pioneerId,
    generation,
    rank,
    layers,
    stats,
  };
}

/**
 * Generate a single stat with 7-20 range and 0.33% chance for critical 21
 */
function generateStat(): number {
  // 0.33% chance for critical roll of 21
  if (Math.random() < 0.0033) {
    return 21;
  }
  // Normal roll: 7-20
  return Math.floor(Math.random() * 14) + 7;
}

/**
 * Generate stats based on Pioneer rank
 */
function generateStatsForRank(rank: string) {
  // Generate base stats (7-20 range, with 0.33% chance for 21)
  const baseStats = {
    perception: generateStat(),
    salvage: generateStat(),
    engineering: generateStat(),
  };
  
  return baseStats;
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

STATS:
• Perception: ${manifest.stats.perception} (Time Dilatation efficiency)
• Salvage: ${manifest.stats.salvage} (Mining yield bonus)
• Engineering: ${manifest.stats.engineering} (Repair efficiency bonus)

[Pre-Crash DNA: AWAKENED]
  `.trim();
}
