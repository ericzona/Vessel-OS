# Legacy Contracts: Lootopian Archeology

**Technical documentation for 12-layer NFT z-index logic**  
**Status:** Foundation Research  
**PAT Access:** lootopian account

---

## Abstract

This document serves as technical archeology for future Lootopian NFT integration. The original Lootopia system used a sophisticated 12-layer z-index stacking system for composable character assets. The Great Transit inherits this legacy.

## Original Rust Contract Layer System (0-15)

### Layer Stack from Screenshot-3 Analysis

**Base Layers (0-3): Foundation**
```
Layer  0: Base Background          z-index: 1000
Layer  1: Skin Tone                z-index: 1100
Layer  2: Body Type                z-index: 1200
Layer  3: Eye Color                z-index: 1300
```

**Clothing Layers (4-7): Apparel**
```
Layer  4: Base Clothing (Shirt)    z-index: 1400
Layer  5: Pants/Bottoms            z-index: 1500
Layer  6: Shoes                    z-index: 1600
Layer  7: Jacket/Outerwear         z-index: 1700
```

**Accessory Layers (8-11): Details**
```
Layer  8: Hat/Headwear             z-index: 1800
Layer  9: Glasses/Eyewear          z-index: 1900
Layer 10: Necklace/Jewelry         z-index: 2000
Layer 11: Badge/Pin                z-index: 2100
```

**Special Layers (12-15): Effects**
```
Layer 12: Tool/Weapon (Right Hand) z-index: 2200
Layer 13: Tool/Weapon (Left Hand)  z-index: 2300
Layer 14: Aura/Glow Effect         z-index: 2400
Layer 15: Particle Effects         z-index: 2500
```

### Manifest Structure
From the original Rust contract, each Pioneer is represented as:
```rust
struct Pioneer {
    layers: [u16; 16],  // Indices 0-15 map to asset IDs
    rarity: u8,
    generation: u32,
    metadata_uri: String,
}
```

## Current Implementation

The Great Transit uses a simplified 4-category system that maps to the original layers:

```typescript
category: "clothing" | "accessory" | "badge" | "tool"

// Mapping:
clothing   → Layers 7 (Base Clothing)
accessory  → Layers 3-5 (Accessories)
badge      → Layer 4 (Front-facing identifier)
tool       → Layer 9 (Props/Equipment)
```

## Lootopian Character Manifest

Current default manifest in GameState:

```typescript
lootManifest: [
  {
    id: "suit-01",
    name: "Tattered Flight Suit",
    description: "Standard issue Pioneer gear",
    rarity: "common",
    category: "clothing"  // Layer 7
  },
  {
    id: "badge-01",
    name: "Old-World PFP Badge",
    description: "Lootopia's golden age",
    rarity: "uncommon",
    category: "badge"  // Layer 4
  }
]
```

## Future Integration Points

### Phase 2: IPFS Asset Hosting
- Point `/public/assets/characters` to Pinata gateway
- Store metadata on-chain (Solana/Metaplex)
- Lazy-load layered PNG compositing

### Phase 3: Dynamic Rendering
- Client-side canvas compositing
- Real-time layer stacking based on equipped items
- Export to IPFS for profile pictures

### Phase 4: Trading & Marketplace
- NFT swap contracts (Solana Program Library)
- Vending Machine integration
- Loot drops from mining/exploration

## Legacy Token Standards

**Original Lootopia:**
- ERC-721 (Ethereum)
- 10K PFP collection
- On-chain metadata

**The Great Transit Migration:**
- Metaplex NFT Standard (Solana)
- SPL Token for $SCRAP
- Shadow Ledger for airdrop fairness

## Founder Badge Logic

```typescript
if (gameState.character.founderBadge) {
  // Unlock Captain's Log on bridge
  // Grant voting power multiplier (2x)
  // Priority access to limited items
  // Special layer unlocks (auras, effects)
}
```

## Research Notes

- Original Lootopian contracts: [NEEDS PAT ACCESS]
- Asset repository: [PENDING IPFS MIGRATION]
- Z-index conflicts resolved via layer priority system
- Compositing engine: HTML5 Canvas or Three.js

## Next Steps

1. Access lootopian account with PAT
2. Retrieve original contract ABIs
3. Map legacy metadata to new schema
4. Establish IPFS pinning strategy
5. Deploy Metaplex candy machine for new drops

---

**Archeologist:** CodeAgent  
**Date:** January 20, 2026  
**Classification:** Technical Foundation
