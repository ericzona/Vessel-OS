export enum LayerSlot {
  BACKGROUND = 0,
  SHADOW = 10,
  BODY = 20,
  EYES = 30,
  PANTS = 40,
  SHOES = 50,
  SHIRT = 60,
  WAIST = 70,
  GLOVES = 80,
  WRISTS = 90,
  NECK = 100,
  FACE_ACC = 110,
  HAIR_HAT = 120 // Logic: If Hat exists, Hair = null
}

export interface PioneerManifest {
  pioneerId: string;
  generation: number; // Gen 0 = Pre-Crash OG
  rank: string;       // Drifter, Technician, etc.
  layers: Record<LayerSlot, string | null>; // Maps Slot to IPFS Hash
  stats: {
    str: number;  // Strength (10-21) - Affects combat and mining
    vit: number;  // Vitality (10-21) - Affects health and survival
    agi: number;  // Agility (10-21) - Affects movement and evasion
    int: number;  // Intelligence (10-21) - Affects research and problem-solving
    lck: number;  // Luck (10-21) - Affects critical hits and rare finds
    dex: number;  // Dexterity (10-21) - Affects precision and crafting
  };
}
