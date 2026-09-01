'use client';
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { X, CheckCircle, ArrowRight, ChevronDown, Handshake, Users, Zap, ShieldCheck, Target, Scale, BadgeDollarSign } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

// Interfaces pour typer les données
interface ProductOption {
  label: string;
  description: string;
}

interface Product {
  nom: string;
  description: string;
  image: string;
  tag: string;
  longDescription: string;
  garanties: string[];
  options: ProductOption[];
}

const heroImages = [
  { image: "/images/accueil/auto.jpg", nom: "Assurance Auto", description: "Particulier, flotte et deux roues" },
  { image: "/images/accueil/habitation.jpg", nom: "Assurance Habitation", description: "Appartement, immeuble, villa" },
  { image: "/images/accueil/sante.jpg", nom: "Assurance Santé", description: "Individuelle et famille" },
  { image: "/images/accueil/voyage.jpg", nom: "Assurance Voyage", description: "Multirisques personnalisée" },
  { image: "/images/accueil/retraite.jpg", nom: "Assurance Retraite", description: "Préparez votre avenir" },
  { image: "/images/accueil/etudes.jpg", nom: "Assurance Études", description: "Épargne pour les études" },
  { image: "/images/accueil/emprunteur.jpg", nom: "Assurance Emprunteur", description: "Protection de prêt bancaire" },
  { image: "/images/accueil/obseques.jpg", nom: "Assurance Obsèques", description: "Prévoyance funéraire" },
];

const produitsIARD: Product[] = [
  {
    nom: "Assurance Auto",
    description: "Particulier, flotte et deux roues",
    image: "/images/accueil/auto.jpg",
    tag: "IARD",
    longDescription: "L'assurance automobile est obligatoire en Côte d'Ivoire. Elle couvre les dommages causés avec ou à un véhicule automobile. KARHON vous propose les meilleures formules adaptées à votre budget.",
    garanties: ["Responsabilité Civile obligatoire", "Vol et Incendie", "Bris de Glace", "Dommages Corporels", "Assistance Dépannage 24/7", "Protection du conducteur"],
    options: [
      { label: "Tiers Simple", description: "Couverture minimale obligatoire. Prend en charge uniquement la responsabilité civile (dommages causés à autrui). Idéal pour les budgets serrés et les véhicules anciens." },
      { label: "Tiers Étendu", description: "Inclut la responsabilité civile + vol, incendie et bris de glace. Offre une meilleure protection que le tiers simple tout en restant abordable. Parfait pour les véhicules de valeur moyenne." },
      { label: "Tous Risques", description: "Couverture complète incluant tous les dommages au véhicule (accident, vol, incendie, bris de glace, catastrophes naturelles) ainsi que la responsabilité civile. La formule la plus complète pour une protection optimale." }
    ],
  },
  {
    nom: "Assurance Habitation",
    description: "Appartement, immeuble, villa",
    image: "/images/accueil/habitation.jpg",
    tag: "IARD",
    longDescription: "Protège votre résidence principale ou secondaire contre tous les risques du quotidien. Idéale pour les locataires et les propriétaires.",
    garanties: ["Incendie & Explosion", "Dégâts des Eaux", "Vol & Cambriolage", "Responsabilité Civile", "Catastrophes Naturelles", "Assistance Dépannage"],
    options: [
      { label: "Locataire", description: "Couvre vos biens personnels et votre responsabilité civile locative (dégâts causés à l'appartement). Obligatoire pour la plupart des locations." },
      { label: "Propriétaire Occupant", description: "Couvre à la fois le bâtiment et vos biens personnels. Protège contre tous les risques (incendie, dégâts des eaux, vol, etc.) pour les propriétaires qui habitent leur logement." },
      { label: "Propriétaire Non Occupant", description: "Couvre uniquement le bâtiment contre les risques locatifs. Essentielle si vous louez votre bien, elle protège votre investissement contre les dégâts causés par les locataires." }
    ],
  },
  {
    nom: "Assurance Santé",
    description: "Frais médicaux et hospitalisation",
    image: "/images/accueil/sante.jpg",
    tag: "IARD",
    longDescription: "Dispositif permettant aux assurés confrontés à des risques de maladies, maternité ou invalidité de bénéficier de prestations au ticket modérateur et de remboursement des frais médicaux.",
    garanties: ["Consultations Médicales", "Hospitalisation", "Maternité", "Pharmacie", "Soins Dentaires & Optiques", "Analyses Médicales"],
    options: [
      { label: "Niveau 1", description: "Remboursement de base (70-80%) des frais médicaux. Couvre l'essentiel des soins courants à un coût modéré." },
      { label: "Niveau 2", description: "Remboursement moyen (80-90%) avec couverture hospitalisation complète. Idéal pour les familles avec des besoins médicaux réguliers." },
      { label: "Niveau 3", description: "Remboursement élevé (90-100%) avec couverture complète incluant les médicaments coûteux et les soins spécialisés." },
      { label: "Formule Famille", description: "Couverture étendue à tous les membres de la famille (conjoint et enfants) avec des tarifs avantageux. Inclut souvent la prévention et les vaccins." }
    ],
  },
  {
    nom: "Assurance Voyage",
    description: "Multirisques personnalisée",
    image: "/images/accueil/voyage.jpg",
    tag: "IARD",
    longDescription: "Assurance Assistance Voyage multirisques personnalisée pour les voyageurs en toute sérénité. Couvre l'annulation, le rapatriement, les frais médicaux à l'étranger et la perte de bagages.",
    garanties: ["Rapatriement Sanitaire", "Frais Médicaux Étranger", "Annulation de Voyage", "Perte de Bagages", "Assistance 24/7"],
    options: [
      { label: "Court Séjour", description: "Pour les voyages de moins de 30 jours. Couvre les urgences médicales, l'annulation et la perte de bagages pour les séjours touristiques." },
      { label: "Long Séjour", description: "Pour les voyages de 30 à 90 jours. Inclut une couverture médicale renforcée et une assistance étendue pour les séjours prolongés." },
      { label: "Expatriation", description: "Couverture complète pour les expatriés. Inclut la responsabilité civile à l'étranger, le rapatriement, et la couverture des frais médicaux sur le long terme." },
      { label: "Scolaire", description: "Assurance spécialement conçue pour les voyages scolaires. Couvre les accidents, la responsabilité civile et l'assistance spécifique aux mineurs." }
    ],
  },
  {
    nom: "Responsabilité Civile",
    description: "Dommages causés à autrui",
    image: "/images/accueil/rc.jpg",
    tag: "IARD",
    longDescription: "Couvre les dommages corporels, matériels ou immatériels que vous pourriez causer à un tiers dans le cadre de votre vie privée. Une protection essentielle pour vous et votre famille au quotidien.",
    garanties: ["Dommages Corporels", "Dommages Matériels", "Défense Pénale & Recours", "Protection de la Famille"],
    options: [
      { label: "Individuelle", description: "Couvre uniquement la personne souscriptrice pour les dommages causés à un tiers dans sa vie privée." },
      { label: "Familiale", description: "Étend la couverture à l'ensemble des membres du foyer (conjoint, enfants), y compris les animaux domestiques." }
    ],
  },
  {
    nom: "Assurance Maritime",
    description: "Marchandises et corps de navire",
    image: "/images/accueil/maritime.jpg",
    tag: "IARD",
    longDescription: "Couvre les marchandises transportées par voie maritime ainsi que le corps des navires contre les avaries, pertes et risques liés au transport. Indispensable pour les importateurs, exportateurs et armateurs.",
    garanties: ["Facultés (Marchandises)", "Corps de Navire", "Avaries Communes & Particulières", "Responsabilité Civile Maritime"],
    options: [
      { label: "Facultés", description: "Couvre les marchandises transportées par mer contre la perte, le vol ou l'avarie durant le trajet." },
      { label: "Corps de Navire", description: "Couvre le navire lui-même contre les dommages matériels, l'échouement, l'incendie ou le naufrage." }
    ],
  },
  {
    nom: "Multirisque Professionnel",
    description: "Locaux et activité professionnelle",
    image: "/images/accueil/multirisque-pro.jpg",
    tag: "IARD",
    longDescription: "Protection globale des locaux, du matériel et de l'activité de votre entreprise contre les principaux risques : incendie, vol, bris de matériel et pertes d'exploitation.",
    garanties: ["Incendie & Explosion", "Vol & Vandalisme", "Bris de Matériel", "Pertes d'Exploitation"],
    options: [
      { label: "Essentielle", description: "Couverture de base des locaux et du matériel contre l'incendie et le vol. Adaptée aux petites structures." },
      { label: "Étendue", description: "Ajoute la couverture des pertes d'exploitation et du bris de matériel. Recommandée pour les entreprises avec un fort enjeu opérationnel." }
    ],
  },
  {
    nom: "Individuelle Accident",
    description: "Indemnisation en cas d'accident",
    image: "/images/accueil/accident.jpg",
    tag: "IARD",
    longDescription: "Garantit le versement d'un capital ou d'une rente en cas d'accident corporel survenu dans la vie privée ou professionnelle, entraînant invalidité ou décès.",
    garanties: ["Invalidité Permanente", "Décès Accidentel", "Frais Médicaux", "Capital ou Rente"],
    options: [
      { label: "Capital Fixe", description: "Verse un capital déterminé à l'avance en cas d'invalidité ou de décès accidentel." },
      { label: "Capital Progressif", description: "Le capital versé évolue selon la gravité de l'accident et le degré d'invalidité constaté." }
    ],
  },
];

const produitsVIE: Product[] = [
  {
    nom: "Assurance Retraite",
    description: "Préparez votre avenir",
    image: "/images/accueil/retraite.jpg",
    tag: "VIE",
    longDescription: "Permet de constituer un capital ou une rente pour maintenir votre niveau de vie après la retraite. Avantages fiscaux intéressants et transmission sécurisée aux héritiers.",
    garanties: ["Capital Garanti", "Rente Viagère", "Transmission aux Héritiers", "Rachat Partiel"],
    options: [
      { label: "Épargne Libre", description: "Versements libres à tout moment, sans engagement. Idéal pour ceux qui veulent épargner selon leurs possibilités financières." },
      { label: "Épargne Programmée", description: "Versements réguliers (mensuels, trimestriels) avec un montant fixe. Permet de constituer un capital progressif avec des avantages fiscaux." },
      { label: "Versement Unique", description: "Investissement unique avec capital garanti. Solution optimale pour placer un capital disponible avec un rendement attractif." }
    ],
  },
  {
    nom: "Assurance Études",
    description: "Épargne pour les études",
    image: "/images/accueil/etudes.jpg",
    tag: "VIE",
    longDescription: "Épargne dédiée au financement des études supérieures de vos enfants. Capital garanti à l'échéance avec possibilité de versements flexibles.",
    garanties: ["Capital Garanti", "Versement Flexible", "Transmission Sécurisée", "Exonération en cas de décès"],
    options: [
      { label: "10 ans", description: "Épargne sur 10 ans avec capital garanti à l'échéance. Solution pour les études proches (lycée, premier cycle universitaire)." },
      { label: "15 ans", description: "Épargne sur 15 ans avec un meilleur rendement. Idéal pour préparer les études supérieures complètes (licence, master)." },
      { label: "20 ans", description: "Épargne long terme avec capital garanti et rendement optimisé. Parfait pour les parents d'enfants en bas âge qui veulent anticiper les études futures." }
    ],
  },
  {
    nom: "Assurance Emprunteur",
    description: "Protection de prêt bancaire",
    image: "/images/accueil/emprunteur.jpg",
    tag: "VIE",
    longDescription: "Couvre le remboursement d'un prêt en cas de décès ou d'invalidité. Obligatoire pour la plupart des prêts immobiliers.",
    garanties: ["Décès", "Invalidité Totale", "Incapacité Temporaire", "Perte d'Emploi (option)"],
    options: [
      { label: "Prêt Immobilier", description: "Couverture spécifique pour les prêts immobiliers. Garantit le remboursement du capital restant dû en cas de décès ou d'invalidité de l'emprunteur." },
      { label: "Prêt Automobile", description: "Protection pour les prêts automobiles. Prend en charge le solde du crédit en cas d'incapacité de remboursement due à un accident ou un décès." },
      { label: "Prêt Professionnel", description: "Assurance pour les prêts professionnels. Sécurise les emprunts liés à l'activité professionnelle contre les aléas de la vie." }
    ],
  },
  {
    nom: "Assurance Obsèques",
    description: "Prévoyance funéraire",
    image: "/images/accueil/obseques.jpg",
    tag: "VIE",
    longDescription: "Prise en charge des frais funéraires pour protéger vos proches d'une charge financière difficile. Capital versé rapidement aux bénéficiaires.",
    garanties: ["Capital Décès versé rapidement", "Organisation des Obsèques", "Assistance Famille", "Rapatriement du Corps"],
    options: [
      { label: "Individuelle", description: "Couverture pour une seule personne. Capital versé aux bénéficiaires désignés pour prendre en charge les frais funéraires." },
      { label: "Famille", description: "Couverture étendue à tous les membres de la famille (conjoint et enfants). Solution économique pour protéger toute la famille." },
      { label: "Groupe Entreprise", description: "Couverture collective pour les employés d'une entreprise. Avantage social majeur qui protège les familles des salariés." }
    ],
  },
  {
    nom: "Assurance Prêt Bancaire",
    description: "Protection de vos engagements bancaires",
    image: "/images/accueil/pret-bancaire.jpg",
    tag: "VIE",
    longDescription: "Garantit le remboursement de vos engagements bancaires (prêt personnel, découvert, ligne de crédit) en cas de décès ou d'invalidité, pour protéger votre famille de la dette restante.",
    garanties: ["Décès", "Invalidité Totale", "Solde Restant Dû Couvert", "Tranquillité Familiale"],
    options: [
      { label: "Prêt Personnel", description: "Couvre le remboursement d'un prêt à la consommation en cas de décès ou d'invalidité de l'emprunteur." },
      { label: "Ligne de Crédit", description: "Sécurise une facilité de caisse ou une ligne de crédit renouvelable contre les aléas de la vie." }
    ],
  },
  {
    nom: "Assurance Caution",
    description: "Garantie pour vos engagements contractuels",
    image: "/images/accueil/caution.jpg",
    tag: "VIE",
    longDescription: "Se substitue à vous pour garantir vos engagements financiers envers un tiers (bailleur, administration, partenaire commercial) en cas de défaillance, sans immobiliser votre trésorerie.",
    garanties: ["Garantie Locative", "Garantie de Marché", "Garantie Douanière", "Libération de Trésorerie"],
    options: [
      { label: "Caution Locative", description: "Remplace le dépôt de garantie classique auprès d'un bailleur, sans bloquer votre épargne." },
      { label: "Caution Professionnelle", description: "Garantit vos engagements contractuels ou administratifs dans le cadre de votre activité professionnelle." }
    ],
  },
];

const stats = [
  { value: "5+", label: "Partenaires", Icon: Handshake },
  { value: "200+", label: "Clients", Icon: Users },
  { value: "Gratuit", label: "Cotations & conseils", Icon: Zap },
  { value: "100%", label: "Sans honoraires", Icon: ShieldCheck },
];

const partenaires = [
  { nom: "ACTIVA", logo: "/images/logo/ACTIVA.png" },
  { nom: "AFG", logo: "/images/logo/AFG.jpg" },
  { nom: "GNA", logo: "/images/logo/GNA.jpg" },
  { nom: "NSIA", logo: "/images/logo/NSIA.png" },
  { nom: "Sanlam Allianz", logo: "/images/logo/SANLAM.png" },
  { nom: "SIM Assurances", logo: "/images/logo/SIM.png" },
  { nom: "SUNU", logo: "/images/logo/SUNU.png" },
  { nom: "VITALIS", logo: "/images/logo/VITALIS.png" },
  { nom: "WAFA", logo: "/images/logo/WAFA.jpg" },
  { nom: "Leadway", logo: "/images/logo/leadway.webp" },
];

const pourquoi = [
  { Icon: Target, title: "Un interlocuteur unique", desc: "Un seul point de contact pour toutes vos assurances. Gestion personnalisée et simplifiée." },
  { Icon: Scale, title: "Neutre et indépendant", desc: "Nous travaillons exclusivement dans votre intérêt. Aucun lien avec une seule compagnie." },
  { Icon: BadgeDollarSign, title: "Sans honoraires", desc: "Nos services sont entièrement pris en charge par les compagnies d'assurance partenaires." },
];

function Carousel({ produits, title, subtitle }: { produits: Product[]; title: string; subtitle: string }) {
  // Vitrine produits en grille : plus de défilement automatique. Chaque produit
  // est une carte élégante ; le détail s'ouvre dans une fenêtre au clic.
  const [selectedProduit, setSelectedProduit] = useState<Product | null>(null);
  const [expandedOption, setExpandedOption] = useState<string | null>(null);

  return (
    <>
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-10 sm:mb-14">
            <p className="text-sm font-extrabold tracking-[0.3em] uppercase mb-2" style={{ color: "#2a8a8a" }}>{subtitle}</p>
            <h2 className="text-4xl sm:text-6xl font-extrabold" style={{ color: "#1a2e5a" }}>{title}</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {produits.map((prod, idx) => (
              <motion.div
                key={prod.nom}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (idx % 3) * 0.08 }}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                style={{ borderColor: "#e6f0f0" }}
              >
                <div className="relative h-44 sm:h-48 overflow-hidden">
                  <Image src={prod.image} alt={prod.nom} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(26,46,90,0.85) 0%, rgba(26,46,90,0.15) 55%, transparent 100%)" }} />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-extrabold text-white backdrop-blur-md" style={{ backgroundColor: "rgba(42,138,138,0.85)" }}>{prod.tag}</span>
                  <div className="absolute bottom-4 left-5 right-5">
                    <h3 className="text-2xl font-extrabold text-white leading-tight">{prod.nom}</h3>
                    <p className="text-white/75 text-sm mt-0.5">{prod.description}</p>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <p className="text-base text-gray-800 leading-relaxed mb-4 line-clamp-3">{prod.longDescription}</p>

                  <div className="space-y-2 mb-4">
                    {prod.garanties.slice(0, 3).map((g: string) => (
                      <div key={g} className="flex items-center gap-2.5 text-base text-gray-700">
                        <CheckCircle size={15} style={{ color: "#2a8a8a" }} className="flex-shrink-0" />
                        <span className="truncate">{g}</span>
                      </div>
                    ))}
                    {prod.garanties.length > 3 && (
                      <p className="text-sm text-gray-600 pl-[26px]">+{prod.garanties.length - 3} garanties supplémentaires</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {prod.options.map((o: ProductOption) => (
                      <button
                        key={o.label}
                        type="button"
                        onClick={() => { setSelectedProduit(prod); setExpandedOption(o.label); }}
                        className="px-2.5 py-1 rounded-full text-sm font-bold border transition-all hover:bg-[#f0f7f7]"
                        style={{ borderColor: "#cfe3e3", color: "#2a8a8a" }}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-2 mt-auto pt-1">
                    <button onClick={() => setSelectedProduit(prod)} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm text-white transition-all hover:shadow-lg" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                      Voir les détails <ArrowRight size={14} />
                    </button>
                    <Link href="/devis" className="inline-flex items-center justify-center px-4 py-2.5 rounded-2xl font-bold text-sm border-2 transition-all hover:bg-[#f0f7f7]" style={{ borderColor: "#2a8a8a", color: "#2a8a8a" }}>
                      Cotation
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedProduit && (
          <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl my-8"
            >
              <div className="relative h-52 w-full">
                <Image src={selectedProduit.image} alt={selectedProduit.nom} fill sizes="(max-width: 768px) 100vw, 672px" className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(26,46,90,0.3) 0%, rgba(26,46,90,0.85) 100%)" }} />
                <div className="absolute inset-0 p-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-extrabold text-white">{selectedProduit.nom}</h2>
                    <p className="text-white/70 text-base mt-1">{selectedProduit.description}</p>
                  </div>
                  <button onClick={() => { setSelectedProduit(null); setExpandedOption(null); }} className="p-2 hover:bg-white/20 rounded-full transition text-white"><X size={24} /></button>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="font-extrabold text-xl mb-2" style={{ color: "#1a2e5a" }}>Description</h3>
                  <p className="text-gray-700 leading-relaxed text-base">{selectedProduit.longDescription}</p>
                </div>
                <div>
                  <h3 className="font-extrabold text-xl mb-3" style={{ color: "#1a2e5a" }}>Garanties incluses</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProduit.garanties.map((g: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 p-3 rounded-xl text-base text-gray-700" style={{ backgroundColor: "#f0f7f7" }}>
                        <CheckCircle size={16} style={{ color: "#2a8a8a" }} className="flex-shrink-0" />{g}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-extrabold text-xl mb-3" style={{ color: "#1a2e5a" }}>Formules disponibles</h3>
                  <div className="space-y-2">
                    {selectedProduit.options.map((option: ProductOption) => (
                      <motion.div
                        key={option.label}
                        initial={false}
                        className="rounded-xl overflow-hidden"
                        style={{
                          backgroundColor: expandedOption === option.label ? "#f0f7ff" : "#f8fafc",
                          border: expandedOption === option.label ? "1px solid #2a8a8a" : "1px solid #e2e8f0"
                        }}
                      >
                        <motion.button
                          onClick={() => setExpandedOption(expandedOption === option.label ? null : option.label)}
                          className="w-full flex justify-between items-center p-4 text-left"
                          whileHover={{ backgroundColor: "#eff6ff" }}
                        >
                          <span className="font-semibold text-gray-800">{option.label}</span>
                          <motion.div
                            animate={{ rotate: expandedOption === option.label ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronDown size={18} style={{ color: "#2a8a8a" }} />
                          </motion.div>
                        </motion.button>
                        <AnimatePresence>
                          {expandedOption === option.label && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="px-4 pb-4"
                            >
                              <p className="text-gray-800 text-base leading-relaxed">{option.description}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex gap-4" style={{ borderColor: "#e0ecec" }}>
                <button onClick={() => { setSelectedProduit(null); setExpandedOption(null); }} className="flex-1 py-3 border-2 rounded-2xl font-bold hover:bg-gray-50 transition text-base" style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}>Fermer</button>
                <Link href="/devis" onClick={() => { setSelectedProduit(null); setExpandedOption(null); }} className="flex-1 text-white py-3 rounded-2xl font-bold transition shadow-lg hover:scale-105 text-center text-base" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>Demander une cotation gratuite</Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [heroCurrent, setHeroCurrent] = useState(0);
  const heroTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoaded(true);
    heroTimerRef.current = setInterval(() => {
      setHeroCurrent(prev => (prev + 1) % heroImages.length);
    }, 4500);
    return () => { if (heroTimerRef.current) clearInterval(heroTimerRef.current); };
  }, []);

  return (
    <div className="overflow-hidden bg-white">
      {/* ═══════════ HERO ═══════════ */}
      <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="sync">
          <motion.div key={heroCurrent} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.4, ease: "easeInOut" }} className="absolute inset-0">
            <Image src={heroImages[heroCurrent].image} alt={heroImages[heroCurrent].nom} fill sizes="100vw" className="object-cover" priority />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,20,50,0.65) 0%, rgba(10,20,50,0.50) 50%, rgba(10,20,50,0.75) 100%)" }} />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div key={`badge-${heroCurrent}`} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.45 }} className="absolute bottom-16 left-8 sm:left-14 flex items-start gap-3 z-10">
            <div className="w-1 h-10 rounded-full mt-1" style={{ background: "#2a8a8a" }} />
            <div>
              <p className="text-white font-bold text-base sm:text-lg leading-tight">{heroImages[heroCurrent].nom}</p>
              <p className="text-white/50 text-sm">{heroImages[heroCurrent].description}</p>
              <div className="flex flex-row gap-2 mt-3">
                {heroImages.map((_, i) => (
                  <button key={i} onClick={() => { setHeroCurrent(i); if (heroTimerRef.current) clearInterval(heroTimerRef.current); heroTimerRef.current = setInterval(() => setHeroCurrent(prev => (prev + 1) % heroImages.length), 4500); }} className="rounded-full transition-all duration-300" style={{ height: "5px", width: i === heroCurrent ? "22px" : "5px", backgroundColor: i === heroCurrent ? "#2a8a8a" : "rgba(255,255,255,0.35)" }} />
                ))}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center pb-14 sm:pb-0">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 50 }} transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}>
           <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white mb-6 tracking-tight leading-[0.95]">
  KARHON
  <br />
  <span className="text-4xl sm:text-5xl lg:text-6xl font-semibold" style={{ color: "#a8d8d8" }}>Assurances</span>
</h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-xl sm:text-2xl font-semibold text-white/80 max-w-2xl mx-auto mb-10 mt-8 leading-relaxed">
              Votre interlocuteur unique, neutre et indépendant en assurance <br />en Côte d&apos;Ivoire.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/devis" className="group px-6 sm:px-8 py-3 sm:py-4 rounded-full font-extrabold text-white text-base sm:text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #2a8a8a, #1e4a7a)" }}>
                Demander une cotation gratuite <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/produits" className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-extrabold text-white text-base sm:text-lg border-2 border-white/30 hover:border-white/60 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md">
                Voir nos produits
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
            <ChevronDown size={28} className="text-white/50" />
          </motion.div>
        </motion.div>
      </div>

      {/* ═══════════ CAROUSEL IARD ═══════════ */}
      <div style={{ backgroundColor: "#f8fbfb" }}>
        <Carousel produits={produitsIARD} title="Assurances IARD" subtitle="Incendie · Accidents · Risques Divers" />
      </div>

      {/* ═══════════ SÉPARATEUR ═══════════ */}
      <div className="py-8 flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto px-6">
          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #2a8a8a, transparent)" }} />
        </div>
      </div>

      {/* ═══════════ CAROUSEL VIE ═══════════ */}
      <div className="bg-white">
        <Carousel produits={produitsVIE} title="Assurances Vie" subtitle="Épargne · Prévoyance · Avenir" />
      </div>

      {/* ═══════════ STATS ═══════════ */}
      <section className="py-14 bg-white border-b" style={{ borderColor: "#e0ecec" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                  <stat.Icon size={22} style={{ color: "#2a8a8a" }} strokeWidth={1.6} />
                </div>
                <div>
                  <div className="text-4xl font-extrabold mb-0.5" style={{ color: "#1a2e5a" }}>{stat.value}</div>
                  <div className="text-base text-gray-600 font-semibold">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ POURQUOI KARHON ═══════════ */}
      <section className="py-16 sm:py-24" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #1e4a7a 60%, #2a8a8a 100%)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-sm font-extrabold tracking-[0.3em] uppercase mb-3 text-white/50">Notre engagement</p>
            <h2 className="text-4xl sm:text-6xl font-extrabold text-white">Pourquoi choisir KARHON ?</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {pourquoi.map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6 }} whileHover={{ y: -6, scale: 1.02 }} className="rounded-3xl p-8 border border-white/10 transition-all duration-300 cursor-default" style={{ backgroundColor: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(42,138,138,0.25)", border: "1px solid rgba(42,138,138,0.4)" }}>
                  <item.Icon size={26} color="#a8d8d8" strokeWidth={1.5} />
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-3">{item.title}</h3>
                <p className="text-white/55 text-base leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PARTENAIRES ═══════════ */}
      <section className="py-16 sm:py-20 bg-white border-t" style={{ borderColor: "#e0ecec" }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-sm font-extrabold tracking-[0.3em] uppercase mb-3" style={{ color: "#2a8a8a" }}>Nos partenaires</p>
            <h2 className="text-4xl sm:text-5xl font-extrabold" style={{ color: "#1a2e5a" }}>Les meilleures compagnies à vos côtés</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
            {partenaires.map((p, i) => (
              <motion.div
                key={p.nom}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                className="flex items-center justify-center rounded-2xl bg-white border p-6 h-28 transition-all duration-300 hover:shadow-lg"
                style={{ borderColor: "#e0ecec" }}
              >
                <div className="relative w-full h-full">
                  <Image src={p.logo} alt={p.nom} fill sizes="160px" className="object-contain" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-4xl sm:text-6xl font-extrabold mb-4" style={{ color: "#1a2e5a" }}>
              Prêt à être bien protégé ?
            </h2>
            <p className="text-gray-700 mb-10 text-xl">
              Obtenez votre cotation personnalisée gratuite en quelques minutes.
            </p>
            <Link
              href="/devis"
              className="group inline-flex items-center gap-3 px-10 py-5 rounded-full font-extrabold text-white text-xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl"
              style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
            >
              Commencer maintenant
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}