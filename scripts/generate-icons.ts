import sharp from "sharp";

async function main() {
  const SOURCE = "public/icons/logo-original.png";

  // Step 1: Create a square version by fitting the logo (contain, not crop)
  // with transparent padding around it
  const squareBuf = await sharp(SOURCE)
    .resize(512, 512, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Step 2: Remove the near-white/cream background pixels
  const raw = await sharp(squareBuf).raw().toBuffer();
  const withAlpha = Buffer.alloc(512 * 512 * 4);
  for (let i = 0; i < 512 * 512; i++) {
    const r = raw[i * 4];
    const g = raw[i * 4 + 1];
    const b = raw[i * 4 + 2];
    const a = raw[i * 4 + 3];
    // Remove near-white/cream background (the logo bg is ~#f2f0eb)
    const isBackground = a > 0 && r > 225 && g > 222 && b > 215;
    withAlpha[i * 4] = r;
    withAlpha[i * 4 + 1] = g;
    withAlpha[i * 4 + 2] = b;
    withAlpha[i * 4 + 3] = isBackground ? 0 : a;
  }

  const transparentBuf = await sharp(withAlpha, { raw: { width: 512, height: 512, channels: 4 } })
    .png()
    .toBuffer();
  await sharp(transparentBuf).toFile("public/icons/logo-transparent.png");
  console.log("✓ Transparent logo (512x512)");

  // Step 3: Light mode icons (white bg)
  for (const s of [16, 32, 48, 64, 96, 128, 192, 256, 384, 512]) {
    const resized = await sharp(transparentBuf).resize(s, s).toBuffer();
    await sharp({
      create: { width: s, height: s, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
    })
      .composite([{ input: resized }])
      .png()
      .toFile(`public/icons/icon-${s}.png`);
  }
  console.log("✓ Light mode icons (16-512)");

  // Step 4: Dark mode icons (dark bg #1a1614)
  for (const s of [16, 32, 48, 64, 96, 128, 192, 256, 384, 512]) {
    const resized = await sharp(transparentBuf).resize(s, s).toBuffer();
    await sharp({
      create: { width: s, height: s, channels: 4, background: { r: 26, g: 22, b: 20, alpha: 1 } },
    })
      .composite([{ input: resized }])
      .png()
      .toFile(`public/icons/icon-${s}-dark.png`);
  }
  console.log("✓ Dark mode icons (16-512)");

  // Step 5: Favicon
  const fav = await sharp(transparentBuf).resize(32, 32).toBuffer();
  await sharp({
    create: { width: 32, height: 32, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: fav }])
    .png()
    .toFile("app/favicon.png");
  console.log("✓ Favicon (32x32)");

  // Dark favicon
  await sharp({
    create: { width: 32, height: 32, channels: 4, background: { r: 26, g: 22, b: 20, alpha: 1 } },
  })
    .composite([{ input: fav }])
    .png()
    .toFile("public/icons/favicon-dark.png");
  console.log("✓ Dark favicon (32x32)");

  // Step 6: Apple touch icon
  const apple = await sharp(transparentBuf).resize(180, 180).toBuffer();
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } },
  })
    .composite([{ input: apple }])
    .png()
    .toFile("public/apple-touch-icon.png");
  console.log("✓ Apple touch icon (180x180)");

  // Step 7: Maskable icon (coral bg with safe-zone padding)
  const pad = 51;
  const inner = await sharp(transparentBuf)
    .resize(512 - pad * 2, 512 - pad * 2)
    .toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 255, g: 107, b: 53, alpha: 1 } },
  })
    .composite([{ input: inner, left: pad, top: pad }])
    .png()
    .toFile("public/icons/maskable-512.png");
  console.log("✓ Maskable icon (512x512, coral bg)");

  console.log("\nAll icons generated!");
}

main().catch(console.error);
