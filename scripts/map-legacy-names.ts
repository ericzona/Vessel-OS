/**
 * Asset DNA Mapping Script
 * Maps staging_assets file IDs to their original Lootopian names
 * from the legacy image-api.js database
 */

import fs from 'fs/promises';
import path from 'path';

// Legacy Lootopian databases from image-api.js
const legacyDatabases = {
  body: [
    {id: 1, name: "white"},
    {id: 2, name: "peach"},
    {id: 3, name: "tanned"},
    {id: 4, name: "olive"},
    {id: 5, name: "brown 1"},
    {id: 6, name: "brown 2"},
    {id: 7, name: "brown 3"},
    {id: 8, name: "black"},
    {id: 9, name: "alien"},
    {id: 10, name: "alien 2"},
    {id: 11, name: "alien 3"},
    {id: 12, name: "alien 4"},
    {id: 13, name: "celestial"}
  ],
  
  eyes: [
    {id: 1, name: "black"},
    {id: 2, name: "blue"},
    {id: 3, name: "brown"},
    {id: 4, name: "gray"},
    {id: 5, name: "green"},
    {id: 6, name: "orange"},
    {id: 7, name: "purple"},
    {id: 8, name: "red"},
    {id: 9, name: "yellow"}
  ],

  shoes: [
    {id: 1, name: "black shoes"},
    {id: 2, name: "brown shoes"},
    {id: 3, name: "maroon shoes"},
    {id: 4, name: "black boots"},
    {id: 5, name: "charcoal boots"},
    {id: 6, name: "gray boots"},
    {id: 7, name: "leather boots"},
    {id: 8, name: "slate boots"},
    {id: 9, name: "tan boots"},
    {id: 10, name: "white boots"},
    {id: 11, name: "Aqua/Red Sneakers"},
    {id: 12, name: "Black/White Sneakers"},
    {id: 13, name: "Blue/Purple Sneakers"},
    {id: 14, name: "Blue/Yellow Sneakers"},
    {id: 15, name: "Fire Sneakers"},
    {id: 16, name: "Gray/Aqua Sneakers"},
    {id: 17, name: "Gray/Green Sneakers"},
    {id: 18, name: "Gray/Red Sneakers"},
    {id: 19, name: "Gray/Orange Sneakers"},
    {id: 20, name: "Gray/Purple Sneakers"},
    {id: 21, name: "Green/Orange Sneakers"},
    {id: 22, name: "Navy/Orange Sneakers"},
    {id: 23, name: "Navy/Yellow Sneakers"},
    {id: 24, name: "Orange/Yellow Sneakers"},
    {id: 25, name: "Red/Gray Sneakers"},
    {id: 26, name: "Red/Green Sneakers"},
    {id: 27, name: "Purple/Red Sneakers"},
    {id: 28, name: "Link's Boots"},
    // Continue with full database...
  ],

  pants: [
    {id: 1, name: "black"},
    {id: 2, name: "blue gray"},
    {id: 3, name: "blue"},
    {id: 4, name: "brown"},
    {id: 5, name: "charcoal"},
    {id: 6, name: "forest"},
    {id: 7, name: "gray"},
    {id: 8, name: "green"},
    {id: 9, name: "lavender"},
    {id: 10, name: "leather"},
    // ... continues
  ],

  shirt: [
    {id: 1, name: "longsleeve laced black"},
    {id: 2, name: "longsleeve laced blue gray"},
    // ... 124 total
  ],

  hair: [
    {id: 1, name: "spiked black"},
    {id: 2, name: "spiked white"},
    {id: 3, name: "spiked light brown"},
    {id: 4, name: "spiked dark brown"},
    {id: 5, name: "spiked red"},
    {id: 6, name: "spiked dark red"},
    // ... 201 total
  ],

  hat: [
    {id: 1, name: "armor black special"},
    {id: 2, name: "armor bronze"},
    // ... 104 total
  ],

  glasses: [
    {id: 1, name: "glasses 3d white"},
    {id: 2, name: "glasses 3d black"},
    // ... 37 total
  ],

  necklace: [
    {id: 1, name: "chain gold 1"},
    {id: 2, name: "chain gold 2"},
    // ... 24 total
  ],

  // Add other categories as needed
};

interface ItemRegistry {
  id: number;
  filename: string;
  name: string | null;
  category: string | null;
}

async function mapAssetNames() {
  const stagingPath = path.join(process.cwd(), 'public', 'staging_assets');
  const outputPath = path.join(process.cwd(), 'public', 'assets', 'pioneer', 'item-registry.json');

  try {
    // Read all files from staging_assets
    const files = await fs.readdir(stagingPath);
    const pngFiles = files.filter(f => f.endsWith('.png'));

    console.log(`📦 Found ${pngFiles.length} assets in staging_assets`);

    const registry: ItemRegistry[] = [];

    for (const filename of pngFiles) {
      // Extract ID from filename
      const match = filename.match(/^(\d+)\.png$/);
      if (!match) {
        console.warn(`⚠️  Skipping non-standard filename: ${filename}`);
        continue;
      }

      const id = parseInt(match[1]);
      let foundName: string | null = null;
      let foundCategory: string | null = null;

      // Search all legacy databases
      for (const [category, database] of Object.entries(legacyDatabases)) {
        const item = database.find(item => item.id === id);
        if (item) {
          foundName = item.name;
          foundCategory = category;
          break;
        }
      }

      registry.push({
        id,
        filename,
        name: foundName,
        category: foundCategory
      });

      if (foundName) {
        console.log(`✓ ${id}.png -> "${foundName}" (${foundCategory})`);
      }
    }

    // Sort by ID
    registry.sort((a, b) => a.id - b.id);

    // Write to JSON
    await fs.writeFile(outputPath, JSON.stringify(registry, null, 2));

    // Stats
    const mapped = registry.filter(r => r.name !== null).length;
    const unmapped = registry.length - mapped;

    console.log(`\n✅ Registry created: ${outputPath}`);
    console.log(`📊 Mapped: ${mapped} items`);
    console.log(`❓ Unmapped: ${unmapped} items`);
    console.log(`📈 Success rate: ${((mapped / registry.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  mapAssetNames().catch(console.error);
}

export { mapAssetNames };
