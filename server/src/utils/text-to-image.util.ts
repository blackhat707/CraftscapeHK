import { createCanvas, registerFont } from 'canvas';
import * as path from 'path';
import * as fs from 'fs';
import * as fontkit from 'fontkit';

// Register the Hong Kong Kai font with fallback to Edukai
const fontPath = path.join(process.cwd(), '..', 'assets', 'mahjong', 'Free-HK-Kai_4700-v1.02.ttf');
const fallbackFontPath = path.join(process.cwd(), '..', 'assets', 'mahjong', 'edukai-5.0.ttf');

let primaryFontAvailable = false;
let fallbackFontAvailable = false;
let primaryFont: any = null;
let fallbackFont: any = null;
let fallbackFontFamilyName = 'Edukai'; // Default name, will be updated from font file

if (fs.existsSync(fontPath)) {
  registerFont(fontPath, { family: 'Free HK Kai' });
  primaryFontAvailable = true;
  // Load font with fontkit for glyph checking
  try {
    primaryFont = fontkit.openSync(fontPath);
    console.log('✅ Free HK Kai font loaded from:', fontPath);
  } catch (err) {
    console.warn('⚠️ Could not parse Free HK Kai font with fontkit:', err.message);
  }
} else {
  console.warn('⚠️ Free HK Kai font not found at:', fontPath);
}

if (fs.existsSync(fallbackFontPath)) {
  // First load with fontkit to get metadata
  try {
    fallbackFont = fontkit.openSync(fallbackFontPath);
    
    // Extract all possible name variations
    const postscriptName = fallbackFont.postscriptName;
    const familyName = fallbackFont.familyName;
    const fullName = fallbackFont.fullName;
    const subfamilyName = fallbackFont.subfamilyName;
    
    console.log('✅ Edukai fallback font loaded from:', fallbackFontPath);
    console.log('   Font postscriptName:', postscriptName);
    console.log('   Font familyName:', familyName);
    console.log('   Font subfamilyName:', subfamilyName);
    console.log('   Font fullName:', fullName);
    
    // The `postscriptName` is often the most unique and reliable identifier.
    fallbackFontFamilyName = postscriptName; // e.g., "TW-MOE-Std-Kai"
    
    console.log('   >>> Registering font under multiple names to ensure compatibility:');
    console.log(`       1. PostScript Name: "${postscriptName}"`);
    console.log(`       2. Family Name: "${familyName}"`);
    console.log(`       3. Localized Name: "教育部標準楷書"`);

    // Register the font under all possible names that canvas might look for.
    // This is a robust way to handle cross-platform inconsistencies.
    registerFont(fallbackFontPath, { family: postscriptName });
    if (familyName !== postscriptName) {
      registerFont(fallbackFontPath, { family: familyName });
    }
    registerFont(fallbackFontPath, { family: '教育部標準楷書' });
    
  } catch (err) {
    console.warn('⚠️ Could not parse Edukai font with fontkit:', err.message);
    // Fallback to registering known-good names if fontkit fails
    fallbackFontFamilyName = 'TW-MOE-Std-Kai';
    registerFont(fallbackFontPath, { family: 'TW-MOE-Std-Kai' });
    registerFont(fallbackFontPath, { family: 'TW-MOE Std Kai' });
    registerFont(fallbackFontPath, { family: '教育部標準楷書' });
  }
  
  fallbackFontAvailable = true;
} else {
  console.warn('⚠️ Edukai fallback font not found at:', fallbackFontPath);
}

if (!primaryFontAvailable && !fallbackFontAvailable) {
  console.error('❌ No Chinese fonts available! Text rendering will use system default.');
}

// Test that Edukai font actually renders at startup
if (fallbackFontAvailable) {
  try {
    const testCanvas = createCanvas(100, 100);
    const testCtx = testCanvas.getContext('2d');
    testCtx.font = `50px "${fallbackFontFamilyName}"`;
    const testChar = '靚';
    testCtx.fillText(testChar, 0, 50);
    const imageData = testCtx.getImageData(0, 0, 100, 100);
    let hasPixels = false;
    for (let i = 0; i < imageData.data.length; i += 4) {
      if (imageData.data[i] < 255) {
        hasPixels = true;
        break;
      }
    }
    if (hasPixels) {
      console.log('✅ Edukai font rendering test PASSED - font is working correctly');
    } else {
      console.error('❌ Edukai font rendering test FAILED - font may not be loaded properly');
      fallbackFontAvailable = false;
    }
  } catch (err) {
    console.error('❌ Edukai font rendering test ERROR:', err.message);
  }
}

export interface TextImageOptions {
  text: string;
  width?: number;
  height?: number;
  fontSize?: number;
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
}

/**
 * Check if a font has a glyph for a specific character using fontkit
 */
function fontHasGlyph(font: any, char: string): boolean {
  if (!font) return false;
  
  try {
    const codePoint = char.codePointAt(0);
    if (codePoint === undefined) return false;
    
    // Check if the font has a glyph for this code point
    const glyphId = font.glyphForCodePoint(codePoint);
    
    // glyphId of 0 typically means no glyph (notdef)
    return glyphId && glyphId.id !== 0;
  } catch (err) {
    return false;
  }
}

/**
 * Generates a PNG image with Chinese text rendered vertically using the Free HK Kai font
 * @param options Configuration for text rendering
 * @returns Base64 encoded PNG image
 */
export function generateChineseTextImage(options: TextImageOptions): string {
  const {
    text,
    width = 300,
    height = 400,
    fontSize: requestedFontSize = 120,
    backgroundColor = '#FFFFFF',
    textColor = '#000000',
    padding = 40,
  } = options;

  // Create canvas
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Calculate dynamic font size to fit text with padding
  const characters = Array.from(text);
  const numChars = characters.length;
  
  // Available space for text
  const availableWidth = width - (padding * 2);
  const availableHeight = height - (padding * 2);
  
  // Calculate maximum font size that fits
  // For vertical text: height per character = fontSize + spacing
  const charSpacing = 20; // spacing between characters
  const totalSpacingHeight = (numChars - 1) * charSpacing;
  const maxFontSizeByHeight = (availableHeight - totalSpacingHeight) / numChars;
  
  // Font size also limited by width (characters shouldn't overflow horizontally)
  const maxFontSizeByWidth = availableWidth;
  
  // Use the smaller of the constraints, but don't exceed requested size
  const fontSize = Math.min(
    requestedFontSize,
    maxFontSizeByHeight,
    maxFontSizeByWidth
  );
  
  console.log(`Dynamic font sizing: requested=${requestedFontSize}px, calculated=${Math.round(fontSize)}px for ${numChars} character(s)`);

  // Set text properties
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  // Calculate vertical positioning for characters
  const totalTextHeight = numChars * fontSize + (numChars - 1) * charSpacing;
  const startY = (height - totalTextHeight) / 2;

  // Draw each character vertically with per-character font fallback
  characters.forEach((char, index) => {
    const x = width / 2;
    const y = startY + index * (fontSize + charSpacing);
    
    // Check which fonts have this glyph
    const primaryHasGlyph = fontHasGlyph(primaryFont, char);
    const fallbackHasGlyph = fontHasGlyph(fallbackFont, char);
    
    if (primaryFontAvailable && primaryHasGlyph) {
      // Use Free HK Kai
      ctx.font = `${fontSize}px "Free HK Kai"`;
      ctx.fillText(char, x, y);
    } else if (fallbackFontAvailable && fallbackHasGlyph) {
      // Use Edukai with the correct family name
      ctx.font = `${fontSize}px "${fallbackFontFamilyName}"`;
      ctx.fillText(char, x, y);
      console.log(`Character "${char}" (U+${char.codePointAt(0)?.toString(16).toUpperCase()}) not in Free HK Kai, using ${fallbackFontFamilyName} fallback`);
    } else if (fallbackFontAvailable) {
      // Edukai available but doesn't have glyph - try it anyway (better than system font)
      ctx.font = `${fontSize}px "${fallbackFontFamilyName}"`;
      ctx.fillText(char, x, y);
      console.warn(`Character "${char}" (U+${char.codePointAt(0)?.toString(16).toUpperCase()}) not in Free HK Kai or ${fallbackFontFamilyName}, using ${fallbackFontFamilyName} anyway`);
    } else if (primaryFontAvailable) {
      // Use Free HK Kai anyway if no fallback available
      ctx.font = `${fontSize}px "Free HK Kai"`;
      ctx.fillText(char, x, y);
      console.warn(`Character "${char}" (U+${char.codePointAt(0)?.toString(16).toUpperCase()}) not in Free HK Kai, no fallback available`);
    } else {
      // Last resort - system default
      ctx.font = `${fontSize}px sans-serif`;
      ctx.fillText(char, x, y);
      console.warn(`Character "${char}" (U+${char.codePointAt(0)?.toString(16).toUpperCase()}) using system sans-serif (no custom fonts available)`);
    }
  });

  // Convert to base64 PNG
  const buffer = canvas.toBuffer('image/png');
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

/**
 * Generates a mahjong tile reference image with Chinese character
 * Optimized for mahjong tile generation with appropriate sizing
 */
export function generateMahjongTileReference(chineseText: string): string {
  // Mahjong tiles are typically narrow and tall
  return generateChineseTextImage({
    text: chineseText,
    width: 300,
    height: 400,
    fontSize: 100,
    backgroundColor: '#F5F5DC', // Beige background similar to traditional tiles
    textColor: '#1A1A1A',
    padding: 30,
  });
}
