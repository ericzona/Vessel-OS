/**
 * ASCII Border Utility
 * Standardizes all terminal borders to 62-character width
 * 
 * Format:
 * ╔════════════════════════════════════════════════════════════╗
 * ║                    60 chars content                       ║
 * ╚════════════════════════════════════════════════════════════╝
 */

const BORDER_WIDTH = 62;
const CONTENT_WIDTH = 60; // 62 - 2 for the '║' characters

/**
 * Creates a single line with borders and padded content
 * @param content - Text to display inside borders
 * @param align - Text alignment: 'left', 'center', or 'right'
 */
export function createBorderLine(content: string, align: 'left' | 'center' | 'right' = 'left'): string {
  let padded = content.substring(0, CONTENT_WIDTH); // Truncate if too long
  
  if (align === 'center') {
    const totalPadding = CONTENT_WIDTH - padded.length;
    const leftPadding = Math.floor(totalPadding / 2);
    padded = padded.padStart(padded.length + leftPadding).padEnd(CONTENT_WIDTH);
  } else if (align === 'right') {
    padded = padded.padStart(CONTENT_WIDTH);
  } else {
    padded = padded.padEnd(CONTENT_WIDTH);
  }
  
  return `║${padded}║`;
}

/**
 * Creates a top border
 */
export function createTopBorder(): string {
  return `╔${'═'.repeat(CONTENT_WIDTH)}╗`;
}

/**
 * Creates a bottom border
 */
export function createBottomBorder(): string {
  return `╚${'═'.repeat(CONTENT_WIDTH)}╝`;
}

/**
 * Creates a full bordered box with centered title
 * @param title - Title text to display in the box
 */
export function createBorderedTitle(title: string): string {
  return `${createTopBorder()}\n${createBorderLine(title, 'center')}\n${createBottomBorder()}`;
}

/**
 * Creates a horizontal divider line (no borders)
 */
export function createDivider(): string {
  return '─'.repeat(BORDER_WIDTH - 1);
}

/**
 * Wraps multi-line content in borders
 * @param lines - Array of content lines
 */
export function wrapInBorders(lines: string[]): string {
  const bordered = lines.map(line => createBorderLine(line));
  return `${createTopBorder()}\n${bordered.join('\n')}\n${createBottomBorder()}`;
}
