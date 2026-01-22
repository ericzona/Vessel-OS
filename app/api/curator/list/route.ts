import { NextResponse } from 'next/server';
import { readdir } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    const stagingPath = join(process.cwd(), 'staging_assets');
    const files = await readdir(stagingPath);
    
    // Filter for PNG files only, exclude README
    const pngFiles = files
      .filter(file => file.endsWith('.png'))
      .sort((a, b) => {
        // Sort numerically by extracting the number
        const numA = parseInt(a.replace('.png', ''));
        const numB = parseInt(b.replace('.png', ''));
        return numA - numB;
      });
    
    return NextResponse.json({
      success: true,
      files: pngFiles,
      total: pngFiles.length,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to read staging_assets directory',
      files: [],
      total: 0,
    }, { status: 500 });
  }
}
