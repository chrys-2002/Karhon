const fs = require('fs'), path = require('path');
const ROOT = 'C:/Users/Boli Chyst/mykarhon-assurance/src';
const pages = [
  'app/apropos/page.tsx',
  'app/a-propos/page.tsx',
  'app/contact/page.tsx',
  'app/devis/page.tsx',
  'app/produits/page.tsx',
  'app/page.tsx',
];
pages.forEach(p => {
  const abs = path.join(ROOT, p);
  if (!fs.existsSync(abs)) { console.log('SKIP: ' + p); return; }
  let c = fs.readFileSync(abs, 'utf8');
  if (!c.includes('pt-24')) {
    c = c.replace('className="min-h-screen', 'className="min-h-screen pt-24');
    console.log('pt-24 OK: ' + p);
  } else {
    console.log('deja OK: ' + p);
  }
  fs.writeFileSync(abs, c, 'utf8');
});
