const fs = require("fs");
const path = require("path");
const ROOT = "C:/Users/Boli Chyst/mykarhon-assurance";

function stripBOM(buf) {
  if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) return buf.slice(3);
  return buf;
}

function fixFile(rel) {
  const abs = path.join(ROOT, rel);
  try {
    const buf = fs.readFileSync(abs);
    const clean = stripBOM(buf);
    fs.writeFileSync(abs, clean);
    console.log("BOM supprime:", rel);
  } catch(e) { console.log("SKIP:", rel, e.message); }
}

const corrupted = [
  "src/app/a-propos/page.tsx",
  "src/app/apropos/page.tsx",
  "src/app/client/dashboard/page.tsx",
  "src/app/client/page.tsx",
  "src/app/client/sinistres/nouveau/page.tsx",
  "src/app/layout.tsx",
  "src/app/page.tsx",
  "src/components/layout/Footer.tsx",
  "src/components/layout/Header.tsx",
  "src/components/layout/Header_old.tsx",
  "src/components/ui/Button.tsx",
  "src/components/ui/Select.tsx",
  "src/hooks/useTouchFeedback.ts",
  "src/types/index.ts",
];

corrupted.forEach(fixFile);

const tsFiles = [
  "src/app/client/page.tsx",
  "src/app/client/sinistres/nouveau/page.tsx",
  "src/app/contact/page.tsx",
  "src/app/devis/page.tsx",
];

tsFiles.forEach(rel => {
  const abs = path.join(ROOT, rel);
  try {
    let c = fs.readFileSync(abs, "utf8");
    c = c.replace(/\(e\)\s*=>/g, "(e: React.FormEvent) =>");
    fs.writeFileSync(abs, c, "utf8");
    console.log("TS fix:", rel);
  } catch(e2) { console.log("SKIP TS:", rel); }
});

const motionFiles = [
  "src/app/produits/page.tsx",
  "src/app/devis/page.tsx",
];

motionFiles.forEach(rel => {
  const abs = path.join(ROOT, rel);
  try {
    let c = fs.readFileSync(abs, "utf8");
    c = c.replace(/ease:\s*\[[^\]]+\]/g, 'ease: "easeOut"');
    fs.writeFileSync(abs, c, "utf8");
    console.log("Motion fix:", rel);
  } catch(e2) { console.log("SKIP Motion:", rel); }
});

const rootLock = "C:/Users/Boli Chyst/package-lock.json";
if (fs.existsSync(rootLock)) {
  fs.unlinkSync(rootLock);
  console.log("package-lock.json racine supprime");
}

console.log("DONE");