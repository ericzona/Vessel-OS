/**
 * Lootopian Asset Sorter
 * Analyzes 6,300 PNG filenames and sorts them into layer slots
 * 
 * Usage: node scripts/sort-lootopian-assets.js <source_folder>
 */

const fs = require('fs');
const path = require('path');

// Layer slot mappings
const LAYER_MAPPINGS = {
  // Already mapped by user
  'body': '2-body',
  'bodies': '2-body',
  'skin': '2-body',
  
  'eye': '3-eyes',
  'eyes': '3-eyes',
  
  'shoe': '6-shoes',
  'shoes': '6-shoes',
  'boot': '6-shoes',
  'boots': '6-shoes',
  
  'hair': '8-hat',
  'hat': '8-hat',
  'helmet': '8-hat',
  'cap': '8-hat',
  'beanie': '8-hat',
  
  // Need to map these
  'shirt': '4-shirt',
  'top': '4-shirt',
  'tee': '4-shirt',
  'blouse': '4-shirt',
  'jersey': '4-shirt',
  
  'pant': '5-pants',
  'pants': '5-pants',
  'jean': '5-pants',
  'jeans': '5-pants',
  'short': '5-pants',
  'shorts': '5-pants',
  'trouser': '5-pants',
  
  'jacket': '7-jacket',
  'coat': '7-jacket',
  'hoodie': '7-jacket',
  'sweater': '7-jacket',
  'vest': '7-jacket',
  
  'glass': '9-glasses',
  'glasses': '9-glasses',
  'sunglass': '9-glasses',
  'goggles': '9-glasses',
  'spectacles': '9-glasses',
  'mask': '9-glasses',
  
  'necklace': '10-necklace',
  'chain': '10-necklace',
  'pendant': '10-necklace',
  'collar': '10-necklace',
  
  'badge': '11-badge',
  'pin': '11-badge',
  'emblem': '11-badge',
  'patch': '11-badge',
  
  'tool': '12-tool-right',
  'weapon': '12-tool-right',
  'sword': '12-tool-right',
  'gun': '12-tool-right',
  'staff': '12-tool-right',
  
  'shield': '13-tool-left',
  'buckler': '13-tool-left',
  
  'aura': '14-aura',
  'glow': '14-aura',
  'effect': '14-aura',
  
  'particle': '15-particles',
  'spark': '15-particles',
  'trail': '15-particles',
  
  // Fallback
  'glove': '8-hat', // Temp: will categorize later
  'waist': '7-jacket', // Belts/waist items go with jacket layer
  'belt': '7-jacket',
};

// Analyze filename and determine layer slot
function analyzeFilename(filename) {
  const lower = filename.toLowerCase();
  
  // Check each keyword
  for (const [keyword, slot] of Object.entries(LAYER_MAPPINGS)) {
    if (lower.includes(keyword)) {
      return slot;
    }
  }
  
  // If no match, categorize by number patterns or default
  // Lootopian items often have numeric IDs
  if (lower.match(/^\d{1,4}/)) {
    // Extract number and map to slot
    const num = parseInt(lower.match(/^\d{1,4}/)[0]);
    if (num >= 0 && num < 1000) return '2-body';
    if (num >= 1000 && num < 2000) return '3-eyes';
    if (num >= 2000 && num < 3000) return '4-shirt';
    if (num >= 3000 && num < 4000) return '5-pants';
    if (num >= 4000 && num < 5000) return '6-shoes';
    if (num >= 5000 && num < 6000) return '7-jacket';
    if (num >= 6000 && num < 6300) return '8-hat';
  }
  
  return 'uncategorized';
}

// Process all files
function processAssets(sourceFolder, dryRun = true) {
  const targetBase = path.join(__dirname, '../public/assets/pioneer');
  const stats = {};
  const uncategorized = [];
  
  console.log('🔍 Analyzing Lootopian assets...\n');
  
  // Read all files
  const files = fs.readdirSync(sourceFolder).filter(f => f.endsWith('.png'));
  
  console.log(`📁 Found ${files.length} PNG files\n`);
  
  files.forEach(file => {
    const slot = analyzeFilename(file);
    
    if (slot === 'uncategorized') {
      uncategorized.push(file);
      return;
    }
    
    if (!stats[slot]) stats[slot] = 0;
    stats[slot]++;
    
    if (!dryRun) {
      const sourcePath = path.join(sourceFolder, file);
      const targetDir = path.join(targetBase, slot);
      const targetPath = path.join(targetDir, file);
      
      // Ensure directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Copy file
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
  
  // Report
  console.log('📊 DISTRIBUTION BY LAYER:\n');
  Object.entries(stats)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([slot, count]) => {
      const percentage = ((count / files.length) * 100).toFixed(1);
      console.log(`${slot.padEnd(20)} ${count.toString().padStart(4)} files (${percentage}%)`);
    });
  
  console.log(`\n⚠️  Uncategorized: ${uncategorized.length} files`);
  
  if (uncategorized.length > 0 && uncategorized.length < 50) {
    console.log('\nUncategorized files:');
    uncategorized.slice(0, 20).forEach(f => console.log(`  - ${f}`));
    if (uncategorized.length > 20) {
      console.log(`  ... and ${uncategorized.length - 20} more`);
    }
  }
  
  if (dryRun) {
    console.log('\n🔎 DRY RUN COMPLETE - No files moved');
    console.log('Run with --execute flag to actually copy files\n');
  } else {
    console.log('\n✅ ASSETS COPIED SUCCESSFULLY\n');
  }
  
  // Save report
  const report = {
    totalFiles: files.length,
    timestamp: new Date().toISOString(),
    distribution: stats,
    uncategorizedCount: uncategorized.length,
    uncategorizedSamples: uncategorized.slice(0, 100),
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../docs/asset-sort-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📄 Report saved to docs/asset-sort-report.json\n');
}

// CLI
const args = process.argv.slice(2);
const sourceFolder = args[0];
const execute = args.includes('--execute');

if (!sourceFolder) {
  console.error('❌ Error: Please provide source folder path');
  console.log('\nUsage: node scripts/sort-lootopian-assets.js <source_folder> [--execute]');
  console.log('\nExample:');
  console.log('  node scripts/sort-lootopian-assets.js "/path/to/Lootopian Items"');
  console.log('  node scripts/sort-lootopian-assets.js "/path/to/Lootopian Items" --execute');
  process.exit(1);
}

if (!fs.existsSync(sourceFolder)) {
  console.error(`❌ Error: Folder not found: ${sourceFolder}`);
  process.exit(1);
}

processAssets(sourceFolder, !execute);
