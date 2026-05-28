const fs = require('fs');
const H = 'C:/Users/Boli Chyst/mykarhon-assurance/src/components/layout/Header.tsx';
let c = fs.readFileSync(H, 'utf8');

// Le useEffect est casse - la ligne "}, [isMenuOpen]);" est mal formee
// Reconstruire le useEffect proprement
const oldEffect = /useEffect\(\(\) => \{[\s\S]*?\}, \[isMenuOpen\]\);/;
const newEffect = `useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);`;

if (oldEffect.test(c)) {
  c = c.replace(oldEffect, newEffect);
  console.log('useEffect reconstruit OK');
} else {
  console.log('PATTERN NON TROUVE - colle le contenu de src-header.txt');
  fs.writeFileSync('src-header.txt', c, 'utf8');
}
fs.writeFileSync(H, c, 'utf8');
