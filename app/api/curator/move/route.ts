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
    const targetPath = join(publicPath, 'assets', 'pioneer', targetFolder, filename);
    const targetDir = join(publicPath, 'assets', 'pioneer', targetFolder);

    // Ensure target directory exists
    if (!existsSync(targetDir)) {
      await mkdir(targetDir, { recursive: true });
    }

    // Move file
    await rename(sourcePath, targetPath);

    return NextResponse.json({
      success: true,
      message: `Moved ${filename} to ${targetFolder}`,
    });
  } catch (error) {
    console.error('Move error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
