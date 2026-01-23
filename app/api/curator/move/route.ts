import { NextResponse } from 'next/server';
import { rename, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: Request) {
  try {
    const { filename, targetFolder } = await request.json();
    
    if (!filename || !targetFolder) {
      return NextResponse.json({
        success: false,
        error: 'Missing filename or targetFolder',
      }, { status: 400 });
    }

    const publicPath = join(process.cwd(), 'public');
    const sourcePath = join(publicPath, 'staging_assets', filename);
    
    // Rename with 'item_' prefix
    const newFilename = `item_${filename}`;
    const targetPath = join(publicPath, 'assets', 'pioneer', targetFolder, newFilename);
    const targetDir = join(publicPath, 'assets', 'pioneer', targetFolder);

    // Ensure target directory exists
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    // Move and rename file
    await rename(sourcePath, targetPath);

    return NextResponse.json({
      success: true,
      message: `Moved ${filename} to ${targetFolder} as ${newFilename}`,
      newFilename,
    });
  } catch (error) {
    console.error('Move error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
