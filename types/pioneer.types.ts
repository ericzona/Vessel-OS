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
    perception: number; // Affects Time Dilatation
    salvage: number;    // Affects Mine yield
    engineering: number;// Affects Repair efficiency
  };
}