const fs = require('fs');
const ROOT = 'C:/Users/Boli Chyst/mykarhon-assurance/src';

// ===== HEADER COMPLET =====
fs.writeFileSync(ROOT + '/components/layout/Header.tsx', [
'"use client";',
'import Link from "next/link";',
'import { useState, useEffect } from "react";',
'import { useRouter, usePathname } from "next/navigation";',
'',
'export default function Header() {',
'  const router = useRouter();',
'  const pathname = usePathname();',
'  const [isMenuOpen, setIsMenuOpen] = useState(false);',
'  const [scrolled, setScrolled] = useState(false);',
'  const isHomePage = pathname === "/";',
'  const bgStyle = (isHomePage && !scrolled)',
'    ? { backgroundColor: "transparent" }',
'    : { backgroundColor: "rgba(15,43,92,0.97)", backdropFilter: "blur(16px)" };',
'  const linkCls = "relative text-white/90 hover:text-white text-sm font-medium group";',
'  const spanCls = "absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full";',
'',
'  useEffect(() => {',
'    const onScroll = () => setScrolled(window.scrollY > 50);',
'    window.addEventListener("scroll", onScroll);',
'    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";',
'    return () => { window.removeEventListener("scroll", onScroll); document.body.style.overflow = "unset"; };',
'  }, [isMenuOpen]);',
'',
'  const close = () => setIsMenuOpen(false);',
'  const goHome = () => { window.scrollTo({ top: 0, behavior: "smooth" }); router.push("/"); close(); };',
'',
'  const navLinks = [',
'    { href: "/produits", label: "Produits" },',
'    { href: "/devis", label: "Devis" },',
'    { href: "/contact", label: "Contact" },',
'    { href: "/apropos", label: "A propos" },',
'  ];',
'',
'  return (',
'    <>',
'      
',
'        
',
'          
',
'            ',
'              
',
'                K',
'              
',
'              
',
'                ARHON',
'                Assurances',
'              
',
'            ',
'            
',
'              {navLinks.map(l => (',
'                ',
'                  {l.label}',
'                ',
'              ))}',
'              Espace Client',
'            
',
'             setIsMenuOpen(p => !p)} aria-label="Menu">',
'              ',
'            ',
'          
',
'        
',
'      
',
'      {isMenuOpen && (',
'        
',
'          
',
'          
',
'            
',
'              

KARHON

Assurances

',
'              x',
'            
',
'            
',
'              {navLinks.map(l => (',
'                {l.label}',
'              ))}',
'            
',
'            
',
'              Espace Client',
'            
',
'          
',
'        
',
'      )}',
'    ',
'  );',
'}',
].join("\n"), "utf8");
console.log("Header OK");

// ===== PAGE PRODUITS ENRICHIE =====
fs.writeFileSync(ROOT + '/app/produits/page.tsx', [
'"use client";',
'import { useState } from "react";',
'import Link from "next/link";',
'',
'const data = {',
'  particuliers: [',
'    { nom: "Assurance Automobile", icone: "🚗", desc: "Couvre les dommages causes avec ou a un vehicule.", details: ["Responsabilite Civile obligatoire", "Dommages tous accidents", "Vol et incendie", "Bris de glace", "Assistance 24h/24"], options: ["Particulier", "Flotte", "Deux roues"] },',
'    { nom: "Assurance Habitation", icone: "🏠", desc: "Protection complete de votre logement.", details: ["Incendie et explosion", "Degats des eaux", "Vol et vandalisme", "Catastrophes naturelles", "Responsabilite civile vie privee"], options: ["Appartement", "Villa", "Immeuble"] },',
'    { nom: "Assurance Sante", icone: "🏥", desc: "Remboursement frais medicaux : maladie, maternite, invalidite.", details: ["Consultations et hospitalisations", "Medicaments et soins", "Maternite et accouchement", "Invalidite", "Ticket moderateur pris en charge"], options: ["Individuelle", "Familiale"] },',
'    { nom: "Individuelle Accident", icone: "🦺", desc: "Indemnise les dommages corporels suite a un accident.", details: ["Deces accidentel", "Invalidite permanente totale ou partielle", "Incapacite temporaire de travail", "Frais medicaux et chirurgicaux", "Remboursement hospitalisation"], options: ["Individuelle", "Familiale"] },',
'    { nom: "Assurance Voyage", icone: "✈️", desc: "Couverture multirisques pour voyageurs en toute serenite.", details: ["Assistance medicale a l etranger", "Rapatriement sanitaire", "Annulation ou interruption voyage", "Perte bagages", "Responsabilite civile a l etranger"], options: ["Sejour court", "Annuel multi-voyages"] },',
'    { nom: "Responsabilite Civile", icone: "⚖️", desc: "Couvre votre responsabilite envers les tiers.", details: ["Dommages corporels causes a autrui", "Dommages materiels causes a autrui", "Frais de defense juridique", "Protection vie privee et professionnelle"], options: ["Vie privee", "Professionnelle"] },',
'  ],',
'  professionnels: [',
'    { nom: "Auto Flotte Entreprise", icone: "🚛", desc: "Gestion de flotte vehicules pour societes.", details: ["Responsabilite Civile flotte", "Dommages tous accidents", "Vol incendie", "Assistance et remorquage", "Gestion centralisee des sinistres"], options: ["TPE/PME", "Grande entreprise"] },',
'    { nom: "Multirisque Professionnelle", icone: "🏢", desc: "Couverture complete biens et responsabilites entreprise.", details: ["Incendie et explosion", "Vol et vandalisme", "Degats des eaux", "Bris de glaces", "RC exploitation ou RC professionnelle"], options: ["Commerce", "Bureau", "Industrie"] },',
'    { nom: "Sante Groupe", icone: "👥", desc: "Couverture sante collective pour les employes.", details: ["Consultations et soins", "Hospitalisation et chirurgie", "Maternite", "Optique et dentaire", "Portabilite en cas de depart"], options: ["PME", "Grande entreprise"] },',
'    { nom: "Accident Groupe", icone: "🛡️", desc: "Protection accident collective pour tous les salaries.", details: ["Deces accidentel", "Invalidite permanente", "Incapacite temporaire", "Frais medicaux", "24h/24 y compris hors travail"], options: ["Cadres", "Non-cadres", "Tous salaries"] },',
'    { nom: "RC Civile et Pro", icone: "📋", desc: "Responsabilite de l entreprise envers tiers et dans son activite.", details: ["RC exploitation", "RC professionnelle", "Faute inexcusable", "Atteinte a l environnement", "Defense penale"], options: ["Artisan", "Profession liberale", "Societe"] },',
'    { nom: "Assurance Maritime", icone: "⚓", desc: "Indemnise les sinistres maritimes dans les limites du contrat.", details: ["Corps du navire", "Marchandises transportees", "RC armateur", "Assistance en mer", "Pollution marine"], options: ["Import/Export", "Transport maritime"] },',
'  ],',
'  vie: [',
'    { nom: "Assurance Retraite", icone: "👴", desc: "Constituez un capital ou une rente pour la retraite.", details: ["Versements libres ou programmes", "Capital garanti a l echeance", "Rente viagere possible", "Avantages fiscaux", "Rachat partiel possible"], options: ["Individuelle", "Groupe"] },',
'    { nom: "Etude Plus", icone: "📚", desc: "Epargne dedicee au financement des etudes de vos enfants.", details: ["Capital verse a la majorite", "Exoneration en cas de deces parent", "Versements flexibles", "Rendement garanti", "Capital protege"], options: ["Moins de 5 ans", "5 a 15 ans"] },',
'    { nom: "Pret Bancaire / Vie Emprunteur", icone: "🏦", desc: "Couvre le remboursement d un pret en cas de deces ou invalidite.", details: ["Deces toutes causes", "Invalidite totale et permanente", "Incapacite temporaire de travail", "Perte d emploi en option", "Couverture du capital restant du"], options: ["Pret immobilier", "Pret consommation"] },',
'    { nom: "Retraite Complementaire Groupe", icone: "🤝", desc: "Version collective souscrite par l employeur pour ses salaries.", details: ["Abondement employeur", "Portabilite en cas de depart", "Sortie en capital ou rente", "Avantages fiscaux entreprise", "Gestion collective mutualisee"], options: ["Cadres", "Ensemble des salaries"] },',
'    { nom: "Assistance Funeraire", icone: "🕯️", desc: "Prise en charge des frais funeraires pour proteger vos proches.", details: ["Frais obseques pris en charge", "Rapatriement du corps", "Assistance famille 24h/24", "Capital verse aux beneficiaires", "Pas de condition medicale"], options: ["Individuelle", "Familiale"] },',
'  ],',
'};',
'',
'export default function ProduitsPage() {',
'  const [cat, setCat] = useState("particuliers");',
'  const [selected, setSelected] = useState(null);',
'  const items = data[cat as keyof typeof data];',
'  const cats = [{ id: "particuliers", label: "👤 Particuliers" }, { id: "professionnels", label: "🏢 Professionnels" }, { id: "vie", label: "💎 Assurances Vie" }];',
'',
'  return (',
'    
',
'      
',
'        
',
'          
Nos Produits
',
'          

Couverture complete — Particuliers et Entreprises

',
'        
',
'        
',
'          {cats.map(c => (',
'             { setCat(c.id); setSelected(null); }}',
'              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${cat === c.id ? "bg-orange-500 text-white shadow-md" : "bg-white text-gray-600 border hover:shadow-md"}`}>',
'              {c.label}',
'            ',
'          ))}',
'        
',
'        
',
'          {items.map((p, i) => (',
'            
',
'              
',
'                
{p.icone}
',
'                
{p.nom}
',
'                

{p.desc}

',
'                 setSelected(selected === p.nom ? null : p.nom)}',
'                  className="text-orange-500 text-sm font-medium hover:underline mb-3">',
'                  {selected === p.nom ? "Masquer les details" : "Voir les details"}',
'                ',
'                {selected === p.nom && (',
'                  
',
'                    

Garanties incluses

',
'                    
',
'                      {p.details.map((d, j) => (',
'                        
',
'                          ✓{d}',
'                        
',
'                      ))}',
'                    
',
'                    

Formules disponibles

',
'                    
',
'                      {p.options.map((o, j) => (',
'                        {o}',
'                      ))}',
'                    
',
'                  
',
'                )}',
'                ',
'                  Demander un devis',
'                ',
'              
',
'            
',
'          ))}',
'        
',
'      
',
'    
',
'  );',
'}',
].join("\n"), "utf8");
console.log("Produits OK");
