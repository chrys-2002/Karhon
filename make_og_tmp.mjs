import sharp from "sharp";

const W = 1200, H = 630;

const bg = Buffer.from(`
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a2e5a"/>
      <stop offset="100%" stop-color="#0b6880"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
</svg>
`);

const bgPng = await sharp(bg).png().toBuffer();

const logoWhite = await sharp("public/images/logo/karhon-blanc.svg")
  .resize({ width: 640 })
  .png()
  .toBuffer();

const logoMeta = await sharp(logoWhite).metadata();

const out = await sharp(bgPng)
  .composite([{ input: logoWhite, left: Math.round((W - logoMeta.width) / 2), top: Math.round((H - logoMeta.height) / 2) }])
  .png()
  .toBuffer();

await sharp(out).toFile("public/images/og-image.png");
console.log("OK", await sharp("public/images/og-image.png").metadata());
