const fs = require("fs");
const path = require("path");
const ROOT = "C:/Users/Boli Chyst/mykarhon-assurance";

function write(rel, lines) {
  const abs = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, lines.join("\n"), "utf8");
  console.log("OK:", abs);
}

write("src/app/produits/page.tsx", [
  'import React from "react";',
  "",
  "export default function ProduitsPage() {",
  "  return (",
  '    
',
  '      
',
  '        
Nos Produits
',
  '        
',
  '          
',
  '            
Particuliers
',
  '            

Auto, Habitation, Sante, Voyage, RC

',
  "          
",
  '          
',
  '            
Professionnels
',
  '            

Flotte, Multirisque, Maritime, Groupe

',
  "          
",
  '          
',
  '            
Assurance Vie
',
  '            

Retraite, Etudes, Emprunteur

',
  "          
",
  "        
",
  "      
",
  "    
",
  "  );",
  "}",
]);

write("src/app/contact/page.tsx", [
  'import React from "react";',
  "",
  "export default function ContactPage() {",
  "  return (",
  '    
',
  '      
',
  '        
Contact
',
  '        
',
  '          

Telephone : +225 07 07 10 87 43

',
  '          

Adresse : Abidjan, Cote d Ivoire

',
  '          

Horaires : Lundi - Vendredi, 8h - 17h

',
  "        
",
  "      
",
  "    
",
  "  );",
  "}",
]);

write("src/app/devis/page.tsx", [
  'import React from "react";',
  "",
  "export default function DevisPage() {",
  "  return (",
  '    
',
  '      
',
  '        
Demande de devis
',
  '        
',
  "          
",
  '            Nom complet',
  '            ',
  "          
",
  "          
",
  '            Email',
  '            ',
  "          
",
  "          
",
  '            Type d assurance',
  '            
Automobile
Habitation
Sante
Vie
",
  "          
",
  '          Envoyer',
  "        
",
  "      
",
  "    
",
  "  );",
  "}",
]);

write("src/app/a-propos/page.tsx", [
  'import React from "react";',
  "",
  "export default function AProposPage() {",
  "  return (",
  '    
',
  '      
',
  '        
A propos de KARHON
',
  '        
',
  '          
',
  '            
Notre mission
',
  '            

Accompagner chaque client avec expertise et neutralite.

',
  "          
",
  '          
',
  '            
Nos engagements
',
  '            

Aucun honoraire client. Confidentialite totale.

',
  "          
",
  "        
",
  "      
",
  "    
",
  "  );",
  "}",
]);

console.log("DONE - tous les fichiers ecrits.");
