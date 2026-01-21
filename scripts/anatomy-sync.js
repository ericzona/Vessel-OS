/**
 * Anatomy Sync Script
 * Processes ONLY the 3 base anatomy layers: Bodies, Eyes, Hair
 * Renames to pioneer_[folder]_[id].png format
 * 
 * Usage: node scripts/anatomy-sync.js <source_folder> [--execute]
 */

const fs = require('fs');
const path = require('path');

// Anatomy folder mappings (Bodies 1-8 only, no Aliens/Celestials)
const ANATOMY_FOLDERS = {
  'Bodies': {
    targetSlot: '2-body',
    prefix: 'body',
    filter: (filename) => {
      // Only include Body Type 1-8 (exclude Alien/Celestial)
      const match = filename.match(/body[_\s-]?(\d+)/i);
      if (!match) return true; // Include if no number found
      const num = parseInt(match[1]);
      return num >= 1 && num <= 8;
    }
  },
  'Eyes': {
    targetSlot: '3-eyes',
    prefix: 'eyes',
    filter: () => true // Include all eyes
  },
  'Hair': {
    targetSlot: '8-hat',
    prefix: 'hair',
    filter: () => true // Include all hair
  }
};

// Extract numeric ID from filename
function extractId(filename) {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.png$/i, '');
  
  // Try to extract number
  const match = nameWithoutExt.match(/(\d+)/);
  if (match) {
    return match[1];
  }
  
  // Fallback: use sanitized filename
  return nameWithoutExt.toLowerCase().replace(/[^a-z0-9]/g, '_');
}

// Generate new filename
function generateFilename(folderName, originalFilename) {
  const config = ANATOMY_FOLDERS[folderName];
  const id = extractId(originalFilename);
  return `pioneer_${config.prefix}_${id}.png`;
}

// Process anatomy folders
function syncAnatomy(sourceFolder, dryRun = true) {
  const targetBase = path.join(__dirname, '../public/assets/pioneer');
  const plan = [];
  const stats = {
    total: 0,
    byFolder: {},
    filtered: 0
  };
  
  console.log('🧬 ANATOMY SYNC - Processing Base Layers\n');
  console.log('═══════════════════════════════════════════\n');
  
  // Process each anatomy folder
  Object.keys(ANATOMY_FOLDERS).forEach(folderName => {
    const config = ANATOMY_FOLDERS[folderName];
    const sourceFolderPath = path.join(sourceFolder, folderName);
    
    if (!fs.existsSync(sourceFolderPath)) {
      console.log(`⚠️  Warning: ${folderName} folder not found, skipping...\n`);
      return;
    }
    
    console.log(`📁 Processing ${folderName}/ → ${config.targetSlot}/`);
    console.log(`   Prefix: pioneer_${config.prefix}_*\n`);
    
    const files = fs.readdirSync(sourceFolderPath).filter(f => f.toLowerCase().endsWith('.png'));
    let processed = 0;
    let filtered = 0;
    
    files.forEach(file => {
      // Apply filter (e.g., Bodies 1-8 only)
      if (!config.filter(file)) {
        filtered++;
        return;
      }
      
      const newFilename = generateFilename(folderName, file);
      const sourcePath = path.join(sourceFolderPath, file);
      const targetDir = path.join(targetBase, config.targetSlot);
      const targetPath = path.join(targetDir, newFilename);
      
      plan.push({
        folder: folderName,
        source: file,
        target: newFilename,
        sourcePath,
        targetPath,
        targetDir
      });
      
      processed++;
    });
    
    stats.byFolder[folderName] = processed;
    stats.total += processed;
    stats.filtered += filtered;
    
    console.log(`   ✓ ${processed} files queued`);
    if (filtered > 0) {
      console.log(`   ⊘ ${filtered} files filtered out (Aliens/Celestials)`);
    }
    console.log('');
  });
  
  // Show detailed plan
  console.log('═══════════════════════════════════════════\n');
  console.log('📋 FILE MOVE PLAN:\n');
  
  plan.slice(0, 10).forEach(item => {
    console.log(`${item.folder}:`);
    console.log(`  ${item.source}`);
    console.log(`  → pioneer_${ANATOMY_FOLDERS[item.folder].prefix}_${extractId(item.source)}.png`);
    console.log(`  → ${ANATOMY_FOLDERS[item.folder].targetSlot}/\n`);
  });
  
  if (plan.length > 10) {
    console.log(`... and ${plan.length - 10} more files\n`);
  }
  
  // Summary
  console.log('═══════════════════════════════════════════\n');
  console.log('📊 SUMMARY:\n');
  console.log(`Total files to process: ${stats.total}`);
  Object.entries(stats.byFolder).forEach(([folder, count]) => {
    console.log(`  • ${folder}: ${count} files`);
  });
  if (stats.filtered > 0) {
    console.log(`  • Filtered out: ${stats.filtered} files (non-base types)`);
  }
  console.log('');
  
  // Execute or dry run
  if (dryRun) {
    console.log('🔎 DRY RUN COMPLETE - No files moved');
    console.log('   Review the plan above');
    console.log('   Run with --execute to proceed\n');
    console.log('Command:');
    console.log(`   node scripts/anatomy-sync.js "${sourceFolder}" --execute\n`);
  } else {
    console.log('⚙️  EXECUTING FILE OPERATIONS...\n');
    
    let copied = 0;
    plan.forEach(item => {
      // Ensure target directory exists
      if (!fs.existsSync(item.targetDir)) {
        fs.mkdirSync(item.targetDir, { recursive: true });
      }
      
      // Copy file with new name
      fs.copyFileSync(item.sourcePath, item.targetPath);
      copied++;
      
      if (copied % 10 === 0) {
        process.stdout.write(`\r   Progress: ${copied}/${plan.length} files...`);
      }
    });
    
    console.log(`\r   Progress: ${copied}/${plan.length} files... DONE\n`);
    console.log('✅ ANATOMY SYNC COMPLETE\n');
    console.log('Next steps:');
    console.log('  1. Restart dev server to see changes');
    console.log('  2. Test PioneerHUD rendering');
    console.log('  3. Proceed to Global Item Sorter for 6,300 loot items\n');
  }
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    totalFiles: stats.total,
    byFolder: stats.byFolder,
    filteredOut: stats.filtered,
    executed: !dryRun,
    sampleMappings: plan.slice(0, 20).map(p => ({
      source: `${p.folder}/${p.source}`,
      target: `${ANATOMY_FOLDERS[p.folder].targetSlot}/${p.target}`
    }))
  };
  
  fs.writeFileSync(
    path.join(__dirname, '../docs/anatomy-sync-report.json'),
    JSON.stringify(report, null, 2)
  );
  
  console.log('📄 Report saved: docs/anatomy-sync-report.json\n');
}

// CLI
const args = process.argv.slice(2);
const sourceFolder = args[0];
const execute = args.includes('--execute');

if (!sourceFolder) {
  console.error('❌ Error: Please provide source folder path\n');
  console.log('Usage: node scripts/anatomy-sync.js <source_folder> [--execute]\n');
  console.log('Example:');
  console.log('  node scripts/anatomy-sync.js "/path/to/Lootopian Anatomy"');
  console.log('  node scripts/anatomy-sync.js "/path/to/Lootopian Anatomy" --execute\n');
  console.log('Expected folder structure:');
  console.log('  source_folder/');
  console.log('    Bodies/  (Body Types 1-8 only)');
  console.log('    Eyes/');
  console.log('    Hair/\n');
  process.exit(1);
}

if (!fs.existsSync(sourceFolder)) {
  console.error(`❌ Error: Folder not found: ${sourceFolder}\n`);
  process.exit(1);
}

syncAnatomy(sourceFolder, !execute);
