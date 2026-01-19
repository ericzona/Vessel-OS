/**
 * Character & Lootopian Layer System
 * Modular design for NFT integration
 * 
 * DESIGN: Characters are composed of layers (Base, Clothing, Accessory)
 * Each layer can be swapped, upgraded, or replaced with NFT metadata
 */

export interface Character {
  id: string;
  name: string;
  layers: CharacterLayers;
  stats: CharacterStats;
  metadata?: NFTMetadata; // Optional: for future Solana NFT integration
}

export interface CharacterLayers {
  base: LayerItem;
  clothing?: LayerItem;
  accessory?: LayerItem;
  special?: LayerItem; // For unique/rare items
}

export interface LayerItem {
  id: string;
  name: string;
  type: LayerType;
  rarity: Rarity;
  attributes: LayerAttributes;
  visualData?: string; // Future: sprite/image URL or on-chain ref
  nftAddress?: string; // Future: Solana NFT mint address
}

export enum LayerType {
  BASE = "base",
  CLOTHING = "clothing",
  ACCESSORY = "accessory",
  SPECIAL = "special",
}

export enum Rarity {
  COMMON = "common",
  UNCOMMON = "uncommon",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary",
}

export interface LayerAttributes {
  defense?: number;
  speed?: number;
  charisma?: number;
  techSkill?: number;
  // Extensible for future attributes
  [key: string]: number | undefined;
}

export interface CharacterStats {
  health: number;
  maxHealth: number;
  defense: number;
  speed: number;
  charisma: number;
  techSkill: number;
}

/**
 * NFT Metadata Structure (Future: Solana/Metaplex standard)
 */
export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: NFTAttribute[];
  properties?: {
    category?: string;
    files?: Array<{
      uri: string;
      type: string;
    }>;
  };
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

/**
 * Character Class - Lootopian System
 * Manages layered character composition
 */
export class CharacterManager {
  private character: Character;

  constructor(character: Character) {
    this.character = character;
    this.recalculateStats();
  }

  /**
   * Equip a layer item to the character
   */
  public equipLayer(layer: LayerItem): void {
    switch (layer.type) {
      case LayerType.BASE:
        this.character.layers.base = layer;
        break;
      case LayerType.CLOTHING:
        this.character.layers.clothing = layer;
        break;
      case LayerType.ACCESSORY:
        this.character.layers.accessory = layer;
        break;
      case LayerType.SPECIAL:
        this.character.layers.special = layer;
        break;
    }
    this.recalculateStats();
  }

  /**
   * Remove a layer from the character
   */
  public unequipLayer(layerType: LayerType): void {
    switch (layerType) {
      case LayerType.CLOTHING:
        this.character.layers.clothing = undefined;
        break;
      case LayerType.ACCESSORY:
        this.character.layers.accessory = undefined;
        break;
      case LayerType.SPECIAL:
        this.character.layers.special = undefined;
        break;
      // Cannot unequip base layer
    }
    this.recalculateStats();
  }

  /**
   * Recalculate character stats based on equipped layers
   */
  private recalculateStats(): void {
    const layers = Object.values(this.character.layers).filter(Boolean) as LayerItem[];
    
    let defense = 0;
    let speed = 0;
    let charisma = 0;
    let techSkill = 0;

    layers.forEach((layer) => {
      defense += layer.attributes.defense || 0;
      speed += layer.attributes.speed || 0;
      charisma += layer.attributes.charisma || 0;
      techSkill += layer.attributes.techSkill || 0;
    });

    this.character.stats = {
      ...this.character.stats,
      defense,
      speed,
      charisma,
      techSkill,
    };
  }

  /**
   * Get current character state
   */
  public getCharacter(): Character {
    return { ...this.character };
  }

  /**
   * Export character as NFT metadata (future use)
   */
  public exportAsNFTMetadata(): NFTMetadata {
    const attributes: NFTAttribute[] = [
      { trait_type: "Defense", value: this.character.stats.defense },
      { trait_type: "Speed", value: this.character.stats.speed },
      { trait_type: "Charisma", value: this.character.stats.charisma },
      { trait_type: "Tech Skill", value: this.character.stats.techSkill },
    ];

    // Add layer information
    if (this.character.layers.clothing) {
      attributes.push({
        trait_type: "Clothing",
        value: this.character.layers.clothing.name,
      });
    }
    if (this.character.layers.accessory) {
      attributes.push({
        trait_type: "Accessory",
        value: this.character.layers.accessory.name,
      });
    }

    return {
      name: this.character.name,
      symbol: "TRANSIT",
      description: `A Pioneer from The Great Transit - ${this.character.name}`,
      image: "", // Future: generated sprite or IPFS URL
      attributes,
    };
  }
}
