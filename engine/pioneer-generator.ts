/**
 * Pioneer Generator
 * Creates randomized Pioneer manifests for new players
 * Pre-Crash DNA awakening system
 */

import { PioneerManifest, LayerSlot } from "@/types/pioneer.types";

// Basic starter assets (placeholders for future IPFS hashes)
const STARTER_ASSETS = {
  backgrounds: ["bg_void_01", "bg_stars_01", "bg_nebula_01"],
  skins: ["skin_pale", "skin_tan", "skin_dark"],
  eyes: ["eyes_brown", "eyes_blue", "eyes_green"],
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
  
  // Generate layers with basic starter gear
  const layers: Record<LayerSlot, string | null> = {
    [LayerSlot.BACKGROUND]: randomFrom(STARTER_ASSETS.backgrounds),
    [LayerSlot.SHADOW]: null, // No shadow for starters
    [LayerSlot.BODY]: randomFrom(STARTER_ASSETS.skins),
    [LayerSlot.EYES]: randomFrom(STARTER_ASSETS.eyes),
    [LayerSlot.PANTS]: randomFrom(STARTER_ASSETS.pants),
    [LayerSlot.SHOES]: randomFrom(STARTER_ASSETS.shoes),
    [LayerSlot.SHIRT]: randomFrom(STARTER_ASSETS.shirts),
    [LayerSlot.WAIST]: null, // No belt for starters
    [LayerSlot.GLOVES]: null, // No gloves for starters
    [LayerSlot.WRISTS]: null, // No wrist accessories
    [LayerSlot.NECK]: null, // No necklace
    [LayerSlot.FACE_ACC]: null, // No glasses/mask
    [LayerSlot.HAIR_HAT]: null, // Bald/no hat for now
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
 * Generate stats based on Pioneer rank
 */
function generateStatsForRank(rank: string) {
  const baseStats = {
    perception: 5,
    salvage: 5,
    engineering: 5,
  };
  
  // Rank bonuses
  switch (rank) {
    case "Navigator":
      baseStats.perception += 3;
      break;
    case "Salvager":
      baseStats.salvage += 3;
      break;
    case "Engineer":
      baseStats.engineering += 3;
      break;
    case "Technician":
      baseStats.engineering += 2;
      baseStats.salvage += 1;
      break;
    case "Scout":
      baseStats.perception += 2;
      baseStats.salvage += 1;
      break;
    case "Drifter":
      // Balanced - no bonuses
      baseStats.perception += 1;
      baseStats.salvage += 1;
      baseStats.engineering += 1;
      break;
  }
  
  // Add slight randomization (±1)
  baseStats.perception += Math.floor(Math.random() * 3) - 1;
  baseStats.salvage += Math.floor(Math.random() * 3) - 1;
  baseStats.engineering += Math.floor(Math.random() * 3) - 1;
  
  // Ensure minimum of 1
  baseStats.perception = Math.max(1, baseStats.perception);
  baseStats.salvage = Math.max(1, baseStats.salvage);
  baseStats.engineering = Math.max(1, baseStats.engineering);
  
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
