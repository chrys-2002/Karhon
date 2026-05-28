const fs = require('fs');
const ROOT = 'C:/Users/Boli Chyst/mykarhon-assurance/src';

// 1. Fix Header : transparent sur accueil ET pendant le scroll
const H = ROOT + '/components/layout/Header.tsx';
let h = fs.readFileSync(H, 'utf8');

// Remplacer bgStyle pour que la transparence soit sur accueil TOUJOURS
// (pas seulement sans scroll) - et opaque sur les autres pages
h = h.replace(
  /const bgStyle = \(isHomePage && !scrolled\)[\s\S]*?\};/,
  [
    'const bgStyle = isHomePage',
    '    ? scrolled',
    '      ? { backgroundColor: "rgba(15,43,92,0.97)", backdropFilter: "blur(16px)" }',
    '      : { backgroundColor: "transparent" }',
    '    : { backgroundColor: "rgba(15,43,92,0.97)", backdropFilter: "blur(16px)" };',
  ].join("\n  ")
);
fs.writeFileSync(H, h, 'utf8');
console.log('Header scroll OK');

// 2. Fix padding pages - pt-24 -> pt-28 sur apropos et contact
const pages = [
  ROOT + '/app/apropos/page.tsx',
  ROOT + '/app/a-propos/page.tsx',
  ROOT + '/app/contact/page.tsx',
];
pages.forEach(p => {
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');
  c = c.replace(/pt-24/g, 'pt-28');
  fs.writeFileSync(p, c, 'utf8');
  console.log('pt-28 OK: ' + p.split('/src/')[1]);
});
