const fs = require('fs'), path = require('path');
const H = 'C:/Users/Boli Chyst/mykarhon-assurance/src/components/layout/Header.tsx';
const lines = fs.readFileSync(H, 'utf8').split('\n');
const out = [];
let done = false;
for (let i = 0; i < lines.length; i++) {
  const l = lines[i];
  if (l.includes('const bgStyle') || l.includes('backgroundColor')) continue;
  out.push(l);
  if (!done && l.includes('const isHomePage')) {
    out.push('  const bgStyle = (isHomePage && !scrolled)');
    out.push('    ? { backgroundColor: "transparent" }');
    out.push('    : { backgroundColor: "rgba(15,43,92,0.97)", backdropFilter: "blur(16px)" };');
    done = true;
  }
}
fs.writeFileSync(H, out.join('\n'), 'utf8');
const count = (fs.readFileSync(H,'utf8').match(/const bgStyle/g)||[]).length;
console.log('bgStyle count: ' + count + (count===1 ? ' OK' : ' ERREUR'));
