const fs = require('fs');
const H = 'C:/Users/Boli Chyst/mykarhon-assurance/src/components/layout/Header.tsx';
let c = fs.readFileSync(H, 'utf8');

// Injecter linkClass apres bgStyle
const inject = '  const linkClass = "relative text-white/90 hover:text-white transition-all duration-300 text-sm font-medium group";\n';

if (!c.includes('const linkClass')) {
  c = c.replace(
    '  const handleLinkClick',
    inject + '  const handleLinkClick'
  );
  console.log('linkClass injecte OK');
} else {
  console.log('linkClass deja present');
}
fs.writeFileSync(H, c, 'utf8');
