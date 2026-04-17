/**
 * Generate all favicon and PWA icon assets from the logo image.
 * Usage: npx tsx scripts/generate-icons.ts
 */

import sharp from "sharp";
import { writeFileSync } from "fs";

const SOURCE = "public/icons/logo-original.png";

async function main() {
  const img = sharp(SOURCE);
  const metadata = await img.metadata();
  console.log(`Source: ${metadata.width}x${metadata.height}`);

  // Crop to square (center)
  const size = Math.min(metadata.width!, metadata.height!);
  const left = Math.round((metadata.width! - size) / 2);
  const top = Math.round((metadata.height! - size) / 2);
  const square = img.extract({ left, top, width: size, height: size });

  // Generate PNG icons
  const sizes = [16, 32, 48, 64, 96, 128, 192, 256, 384, 512];
  for (const s of sizes) {
    await square.clone().resize(s, s, { fit: "cover" }).png().toFile(`public/icons/icon-${s}.png`);
    console.log(`  icon-${s}.png`);
  }

  // Generate favicon.ico (multi-size ICO via 32px PNG — browsers accept PNG favicons)
  await square.clone().resize(32, 32, { fit: "cover" }).png().toFile("app/favicon.png");
  console.log("  app/favicon.png (32x32)");

  // Generate Apple touch icon
  await square.clone().resize(180, 180, { fit: "cover" }).png().toFile("public/apple-touch-icon.png");
  console.log("  public/apple-touch-icon.png (180x180)");

  // Generate maskable icon (with padding — 80% safe zone on colored bg)
  const maskableSize = 512;
  const padding = Math.round(maskableSize * 0.1); // 10% padding each side = 80% safe zone
  const innerSize = maskableSize - padding * 2;
  const innerBuffer = await square.clone().resize(innerSize, innerSize, { fit: "cover" }).png().toBuffer();
  await sharp({
    create: { width: maskableSize, height: maskableSize, channels: 4, background: { r: 255, g: 107, b: 53, alpha: 1 } }
  }).composite([{ input: innerBuffer, left: padding, top: padding }]).png().toFile("public/icons/maskable-512.png");
  console.log("  maskable-512.png (512x512 with coral bg)");

  console.log("\nDone! Update manifest.json and layout.tsx to reference the new icons.");
}

main().catch(console.error);
