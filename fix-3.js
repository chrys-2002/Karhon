const fs = require('fs');
const ROOT = 'C:/Users/Boli Chyst/mykarhon-assurance/src';

// ---- 1. HEADER : remplacement force du bgStyle + menu plein ecran ----
const H = ROOT + '/components/layout/Header.tsx';
let h = fs.readFileSync(H, 'utf8');

// Supprimer TOUTE declaration bgStyle existante (peu importe la forme)
const lines = h.split('\n');
const cleaned = [];
let skip = false;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  // Sauter les lignes bgStyle et ses suites
  if (l.includes('const bgStyle')) { skip = true; }
  if (skip) {
    // Fin du bloc bgStyle : ligne qui se termine par ";"
    // et ne contient pas backgroundColor
    if (l.trim().endsWith(';') && !l.includes('backgroundColor') && !l.includes('backdropFilter')) {
      skip = false;
    }
    continue;
  }
  cleaned.push(l);
}
h = cleaned.join('\n');

// Injecter le bon bgStyle apres "const isHomePage"
h = h.replace(
  '  const isHomePage = pathname === "/";',
  [
    '  const isHomePage = pathname === "/";',
    '  // transparent sur accueil sans scroll, opaque sinon',
    '  const bgStyle = (isHomePage && !scrolled)',
    '    ? { backgroundColor: "transparent" }',
    '    : { backgroundColor: "rgba(15,43,92,0.97)", backdropFilter: "blur(16px)" };',
  ].join('\n')
);

// Fix menu mobile : z-index 40 mais SOUS le header (z-50)
// Le panneau menu doit commencer apres le header (top-16 = 64px)
h = h.replace(
  '
 {
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');
  // Remplacer tout pt-XX existant par pt-32
  c = c.replace(/pt-\d+/g, 'pt-32');
  // Si pas de pt du tout, ajouter
  if (!c.includes('pt-32')) {
    c = c.replace('min-h-screen', 'min-h-screen pt-32');
  }
  fs.writeFileSync(p, c, 'utf8');
  console.log('pt-32 OK: ' + p.split('/app/')[1]);
});
