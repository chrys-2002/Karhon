'use client';
import Link from "next/link";
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, CheckCircle, ArrowRight,
  Globe, User, Building2, TrendingUp,
  Car, Home, HeartPulse, ShieldAlert, Plane, Scale,
  Truck, Store, Users, Anchor, GraduationCap, Landmark,
  Briefcase, Flower2, Target, BadgeDollarSign, Zap,
  Hammer, ShieldCheck, PiggyBank, ShieldPlus,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/ui/BackButton';

const categories = [
  { id: 'all', nom: 'Tous', Icon: Globe },
  { id: 'particuliers', nom: 'Particuliers', Icon: User },
  { id: 'professionnelles', nom: 'Professionnelles', Icon: Building2 },
  { id: 'vie', nom: 'Assurance Vie', Icon: TrendingUp },
];

const produits = [
  {
    id: "automobile", categorie: "particuliers", nom: "Assurance Automobile", Icon: Car,
    image: "/images/produits/automobile.jpg",
    description: "Couvre les dommages causés avec ou à un véhicule (particulier, flotte, deux-roues).",
    longDescription: "L'assurance automobile est obligatoire en Côte d'Ivoire. Elle protège le conducteur, les passagers, les tiers et le véhicule contre les risques d'accident, vol, incendie, et bris de glace.",
    garanties: ["Responsabilité Civile", "Dommages Corporels", "Vol et Incendie", "Bris de Glace", "Assistance Dépannage 24/7", "Protection du conducteur"],
    exclusions: ["Course automobile", "Utilisation professionnelle non déclarée", "Conduite sans permis"],
    options: ["Tiers Simple", "Tiers Étendu", "Tous Risques"]
  },
  {
    id: "habitation", categorie: "particuliers", nom: "Assurance Habitation", Icon: Home,
    image: "/images/produits/habitation.jpg",
    description: "Protège votre appartement, immeuble ou villa contre les risques du quotidien.",
    longDescription: "Cette assurance couvre votre résidence principale ou secondaire contre l'incendie, le vol, les dégâts des eaux et les catastrophes naturelles.",
    garanties: ["Incendie & Explosion", "Dégâts des Eaux", "Vol & Cambriolage", "Responsabilité Civile", "Catastrophes Naturelles", "Assistance Dépannage"],
    exclusions: ["Usure normale", "Négligence grave", "Travaux non déclarés"],
    options: ["Locataire", "Propriétaire Occupant", "Propriétaire Non Occupant"]
  },
  {
    id: "sante-individuelle", categorie: "particuliers", nom: "Assurance Santé", Icon: HeartPulse,
    image: "/images/produits/sante-individuelle.jpg",
    description: "Remboursement des frais médicaux, maternité et invalidité via ticket modérateur.",
    longDescription: "Assurance santé qui prend en charge vos dépenses médicales selon le système du ticket modérateur. Idéale pour les particuliers et les familles.",
    garanties: ["Consultations Médicales", "Hospitalisation", "Maternité", "Pharmacie", "Soins Dentaires & Optiques", "Analyses Médicales"],
    exclusions: ["Maladies préexistantes non déclarées", "Actes esthétiques"],
    options: ["Niveau 1", "Niveau 2", "Niveau 3", "Formule Famille"]
  },
  {
    id: "accident-individuel", categorie: "particuliers", nom: "Assurance Accident", Icon: ShieldAlert,
    image: "/images/produits/accident-individuel.jpg",
    description: "Indemnise les dommages corporels suite à un événement accidentel.",
    longDescription: "Contrat qui indemnise le dommage corporel subi par l'assuré à la suite d'un événement accidentel (décès, invalidité permanente ou temporaire, frais médicaux).",
    garanties: ["Décès Accidentel", "Invalidité Permanente", "Incapacité Temporaire", "Frais Médicaux", "Assistance"],
    exclusions: ["Suicide", "Accident sous emprise"],
    options: ["Individuelle", "Familiale"]
  },
  {
    id: "voyage", categorie: "particuliers", nom: "Assurance Voyage", Icon: Plane,
    image: "/images/produits/voyage.jpg",
    description: "Multirisques personnalisée pour les voyageurs en toute sérénité.",
    longDescription: "Assurance Assistance Voyage multirisques personnalisée pour des voyageurs en toute sérénité. Couvre l'annulation, le rapatriement, les frais médicaux à l'étranger et la perte de bagages.",
    garanties: ["Rapatriement Sanitaire", "Frais Médicaux Étranger", "Annulation de Voyage", "Perte de Bagages", "Assistance 24/7"],
    exclusions: ["Pays en guerre", "Voyage non déclaré"],
    options: ["Court Séjour", "Long Séjour", "Expatriation", "Scolaire"]
  },
  {
    id: "rc-civile", categorie: "particuliers", nom: "Assurance Responsabilité Civile", Icon: Scale,
    image: "/images/produits/rc-civile.jpg",
    description: "Couvre la responsabilité de l'assuré envers les tiers.",
    longDescription: "La Responsabilité Civile couvre les dommages que vous pourriez causer à autrui dans votre vie quotidienne.",
    garanties: ["Dommages Corporels aux Tiers", "Dommages Matériels aux Tiers", "Défense Pénale", "Recours"],
    exclusions: ["Dommages intentionnels", "Activité professionnelle"],
    options: ["Familiale", "Scolaire", "Sportive"]
  },
  // 🆕 PRODUIT 1 : EPARGNE
  {
    id: "epargne",
    categorie: "particuliers",
    nom: "Épargne",
    Icon: PiggyBank,
    image: "/images/produits/epargne.jpg",
    description: "Constituez un capital pour vos projets futurs grâce à une épargne sécurisée et rentable.",
    longDescription: "Le contrat d'épargne KARHON vous permet de constituer progressivement un capital en toute sécurité, avec une rémunération attractive. Idéal pour préparer un projet immobilier, les études de vos enfants ou compléter votre retraite.",
    garanties: [
      "Capital Garanti à 100%",
      "Taux d'intérêt compétitif",
      "Versements libres ou programmés",
      "Disponibilité des fonds",
      "Transmission aux héritiers en cas de décès"
    ],
    exclusions: [
      "Retrait total avant 1 an",
      "Frais sur versement en cas de rupture anticipée"
    ],
    options: [
      "Épargne Mensuelle",
      "Épargne Trimestrielle",
      "Dépôt Initial + Mensuel",
      "Versement Libre"
    ]
  },
  // 🆕 PRODUIT 2 : PREVOYANCE
  {
    id: "prevoyance",
    categorie: "particuliers",
    nom: "Prévoyance",
    Icon: ShieldPlus,
    image: "/images/produits/prevoyance.jpg",
    description: "Protégez votre famille et vos proches face aux aléas de la vie (décès, invalidité, incapacité).",
    longDescription: "Le contrat de prévoyance individuelle KARHON garantit à vous et à vos proches le versement d'un capital ou d'une rente en cas de décès, d'invalidité ou d'incapacité. Une solution essentielle pour assurer la sécurité financière de votre famille en toutes circonstances.",
    garanties: [
      "Capital décès versé aux bénéficiaires",
      "Rente mensuelle en cas d'invalidité",
      "Incapacité temporaire (arrêt de travail)",
      "Frais médicaux et d'hospitalisation",
      "Doublement du capital en cas d'accident",
      "Soutien psychologique et assistance"
    ],
    exclusions: [
      "Suicide durant la première année",
      "Affections liées à l'alcoolisme ou toxicomanie",
      "Sports extrêmes non déclarés"
    ],
    options: [
      "Formule Individuelle",
      "Formule Familiale (conjoint + enfants)",
      "Formule Couple"
    ]
  },
  {
    id: "auto-flotte", categorie: "professionnelles", nom: "Assurance Automobile Flotte", Icon: Truck,
    image: "/images/produits/auto-flotte.jpg",
    description: "Couverture véhicules pour sociétés et entreprises.",
    longDescription: "Assurance automobile dédiée aux flottes de véhicules d'entreprise. Gestion simplifiée de tous vos véhicules avec des conditions avantageuses.",
    garanties: ["Responsabilité Civile", "Dommages aux Véhicules", "Vol et Incendie", "Assistance Flotte", "Gestion Sinistres"],
    exclusions: ["Usage personnel non déclaré"],
    options: ["2-5 véhicules", "6-20 véhicules", "+20 véhicules"]
  },
  {
    id: "multirisque-pro", categorie: "professionnelles", nom: "Assurance Multirisque Professionnelle", Icon: Store,
    image: "/images/produits/multi.jpg",
    description: "Couverture complète biens + responsabilités. 5 garanties disponibles.",
    longDescription: "Assurance multirisques professionnelle offre une couverture complète des biens et des responsabilités. L'assuré peut choisir 5 grandes types de garanties.",
    garanties: ["Incendie", "Vol", "Dégâts des Eaux", "Bris de Glaces", "RC Exploitation/Professionnelle", "Perte d'Exploitation"],
    exclusions: ["Usure normale", "Fraude interne"],
    options: ["Commerce", "Industrie", "Services", "Bureaux"]
  },
  {
    id: "sante-groupe", categorie: "professionnelles", nom: "Assurance Santé", Icon: Users,
    image: "/images/produits/sante-groupe.jpg",
    description: "Couverture santé collective pour les employés d'une société.",
    longDescription: "Couverture santé collective pour les employés d'une société. Avantage social majeur pour attirer et fidéliser les talents.",
    garanties: ["Consultations", "Hospitalisation", "Maternité", "Pharmacie", "Soins Optiques et Dentaires", "Médecine Préventive"],
    exclusions: ["Maladies préexistantes non déclarées"],
    options: ["Standard", "Premium", "Sur-mesure"]
  },
  {
    id: "accident-groupe", categorie: "professionnelles", nom: "Assurance Individuelle Accident Groupe", Icon: ShieldAlert,
    image: "/images/produits/accident-groupe.jpg",
    description: "Version collective de l'assurance accident pour les salariés.",
    longDescription: "Version collective de l'assurance accident, pour les salariés. Couvre tous les employés contre les accidents de la vie privée et professionnelle.",
    garanties: ["Décès Accidentel", "Invalidité Permanente", "Incapacité Temporaire", "Frais Médicaux"],
    exclusions: ["Suicide", "Accident sous emprise"],
    options: ["Tous Salariés", "Cadres Dirigeants", "Personnel de Terrain"]
  },
  {
    id: "rc-pro", categorie: "professionnelles", nom: "Assurance Civile et Professionnelle", Icon: Scale,
    image: "/images/produits/rc-pro.jpg",
    description: "Couvre la responsabilité de l'entreprise envers les tiers.",
    longDescription: "Couvre la responsabilité de l'entreprise envers les tiers et dans le cadre de son activité professionnelle.",
    garanties: ["RC Exploitation", "RC Professionnelle", "Défense Pénale", "Recours des Tiers"],
    exclusions: ["Faute intentionnelle", "Activités non déclarées"],
    options: ["Commerces", "Professions Libérales", "Industries", "BTP"]
  },
  {
    id: "maritime", categorie: "professionnelles", nom: "Assurance Maritime", Icon: Anchor,
    image: "/images/produits/maritime.jpg",
    description: "Contrat par lequel une compagnie s'engage à indemniser les sinistres maritimes.",
    longDescription: "Assurance Maritime est un contrat par lequel une compagnie d'assurance s'engage à indemniser des sinistres Maritimes dans la limite convenue dans le contrat.",
    garanties: ["Corps Navire", "Marchandises Transportées", "RC Armateur", "Assistance & Sauvetage", "Frais de Remorquage"],
    exclusions: ["Usure du navire", "Vice propre"],
    options: ["Import/Export", "Transport National", "Pêche", "Plaisance"]
  },
  {
    id: "tout-risque-chantier", categorie: "professionnelles", nom: "Assurance Tout Risque Chantier", Icon: Hammer,
    image: "/images/produits/tout-risque-chantier.jpg",
    description: "Protection complète des chantiers, équipements et risques liés aux travaux.",
    longDescription: "Cette assurance couvre les biens liés aux chantiers, les dommages matériels, la responsabilité civile et les risques de mise en cause de l'entreprise sur le site d'intervention.",
    garanties: ["Incendie et Explosion", "Vol et Détérioration", "Dégâts des Eaux", "Responsabilité Civile Chantier", "Bris de Matériel", "Assistance et Dépannage"],
    exclusions: ["Travaux non conformes", "Faute intentionnelle", "Usure normale"],
    options: ["Petit Chantier", "Grand Chantier", "Travaux Publics", "Bâtiment & Génie Civil"]
  },
  {
    id: "caution", categorie: "professionnelles", nom: "Assurance Caution", Icon: ShieldCheck,
    image: "/images/produits/caution.jpg",
    description: "Garantie de bonne exécution pour les cautions et engagements commerciaux.",
    longDescription: "L'assurance caution protège l'entreprise en cas de non-exécution d'un engagement, d'un contrat ou d'un cautionnement administratif ou commercial.",
    garanties: ["Caution de bonne fin", "Caution de soumission", "Caution de retenue", "Remboursement en cas de défaillance", "Protection de la trésorerie"],
    exclusions: ["Faute intentionnelle", "Engagement non déclaré", "Dommages liés à une mauvaise gestion"],
    options: ["Caution Fournisseur", "Caution Marché Public", "Caution de bonne exécution"]
  },
  {
    id: "credit", categorie: "professionnelles", nom: "Assurance Crédit", Icon: BadgeDollarSign,
    image: "/images/produits/credit.jpg",
    description: "Protection des créances et du risque d'impayé pour les entreprises.",
    longDescription: "L'assurance crédit aide les entreprises à sécuriser leurs ventes en couvrant les pertes liées au non-paiement de leurs clients, tout en préservant leur trésorerie.",
    garanties: ["Risque d'impayé client", "Protection de la trésorerie", "Recouvrement des créances", "Analyse de solvabilité", "Assistance commerciale"],
    exclusions: ["Clients non déclarés", "Crédits non conformes", "Faute de gestion"],
    options: ["Petites entreprises", "Entreprises de distribution", "B2B / B2G"]
  },
  {
    id: "retraite", categorie: "vie", nom: "Assurance Retraite", Icon: TrendingUp,
    image: "/images/produits/retraite.jpg",
    description: "Constitution d'un capital ou rente pour la retraite.",
    longDescription: "Permet de constituer un capital ou une rente pour maintenir votre niveau de vie après la retraite.",
    garanties: ["Capital Garanti", "Rente Viagère", "Transmission aux Héritiers", "Rachat Partiel"],
    exclusions: ["Retrait anticipé sans motif valable"],
    options: ["Épargne Libre", "Épargne Programmée", "Versement Unique"]
  },
  {
    id: "etude-plus", categorie: "vie", nom: "Assurance Étude Plus", Icon: GraduationCap,
    image: "/images/produits/etude-plus.jpg",
    description: "Épargne dédiée au financement des études des enfants.",
    longDescription: "Épargne dédiée au financement des études supérieures de vos enfants. Capital garanti à l'échéance avec possibilité de versements flexibles.",
    garanties: ["Capital Garanti", "Versement Flexible", "Transmission Sécurisée", "Exonération en cas de décès"],
    exclusions: ["Retrait avant 8 ans"],
    options: ["10 ans", "15 ans", "20 ans"]
  },
  {
    id: "vie-emprunteur", categorie: "vie", nom: "Prêt Bancaire / Vie Emprunteur", Icon: Landmark,
    image: "/images/produits/vie-emprunteur.jpg",
    description: "Couvre le remboursement d'un prêt en cas de décès ou invalidité.",
    longDescription: "Couvre le remboursement d'un prêt en cas de décès ou invalidité. Obligatoire pour la plupart des prêts immobiliers.",
    garanties: ["Décès", "Invalidité Totale", "Incapacité Temporaire", "Perte d'Emploi (option)"],
    exclusions: ["Maladies préexistantes non déclarées"],
    options: ["Prêt Immobilier", "Prêt Automobile", "Prêt Professionnel"]
  },
  {
    id: "retraite-groupe", categorie: "vie", nom: "Assurance Retraite Complémentaire Groupe", Icon: Briefcase,
    image: "/images/produits/retraite-groupe.jpg",
    description: "Version collective de la retraite, souscrite par l'employeur.",
    longDescription: "Version collective de la retraite, souscrite par l'employeur. Avantage social majeur pour fidéliser les collaborateurs.",
    garanties: ["Capital Retraite", "Rente Complémentaire", "Transmission", "Avantages Fiscaux"],
    exclusions: ["Départ avant vesting"],
    options: ["Tous Salariés", "Cadres", "Dirigeants"]
  },
  {
    id: "funeraire", categorie: "vie", nom: "Assurance Assistance Funéraire", Icon: Flower2,
    image: "/images/produits/funeraire.jpg",
    description: "Prise en charge des frais funéraires.",
    longDescription: "Prise en charge des frais funéraires pour protéger vos proches. Capital versé rapidement aux bénéficiaires.",
    garanties: ["Capital Décès", "Organisation Obsèques", "Assistance Famille", "Rapatriement Corps"],
    exclusions: ["Suicide dans les 2 ans"],
    options: ["Individuelle", "Famille", "Groupe Entreprise"]
  },
];

const pourquoi = [
  { Icon: Target, titre: "Interlocuteur Unique", desc: "Gestion personnalisée" },
  { Icon: Scale, titre: "Neutre & Indépendant", desc: "Dans votre intérêt" },
  { Icon: BadgeDollarSign, titre: "Sans Honoraires", desc: "Services gratuits" },
  { Icon: Zap, titre: "Devis Gratuit", desc: "Étude sur-mesure" },
];

export default function ProduitsPage() {
  const [activeCategorie, setActiveCategorie] = useState('all');
  const [selectedProduit, setSelectedProduit] = useState<(typeof produits)[number] | null>(null);
  const router = useRouter();

  const produitsFiltres = activeCategorie === 'all'
    ? produits
    : produits.filter(p => p.categorie === activeCategorie);

  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "#f8fbfb" }}>
      <div className="container mx-auto px-6">
        <div className="mb-6">
          <BackButton label="Retour" />
        </div>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4" style={{ color: "#1a2e5a" }}>Nos Solutions d&apos;Assurance</h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Des protections sur mesure adaptées à vos besoins personnels et professionnels
          </p>
        </motion.div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => {
            const isActive = activeCategorie === cat.id;
            return (
              <motion.button
                key={cat.id}
                onClick={() => setActiveCategorie(cat.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-3 px-6 py-3 rounded-2xl font-medium text-sm transition-all duration-300"
                style={
                  isActive
                    ? {
                        background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)",
                        color: "#fff",
                        boxShadow: "0 8px 24px rgba(26,46,90,0.28)",
                        border: "1.5px solid transparent",
                      }
                    : {
                        backgroundColor: "#fff",
                        color: "#1a2e5a",
                        border: "1.5px solid #e0ecec",
                        boxShadow: "0 2px 8px rgba(26,46,90,0.06)",
                      }
                }
              >
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isActive
                      ? "rgba(255,255,255,0.18)"
                      : "linear-gradient(135deg, #eaf4f4, #d0ecec)",
                    boxShadow: isActive ? "inset 0 1px 0 rgba(255,255,255,0.2)" : "none",
                  }}
                >
                  <cat.Icon size={16} color={isActive ? "#fff" : "#2a8a8a"} strokeWidth={1.8} />
                </div>
                {cat.nom}
              </motion.button>
            );
          })}
        </div>

        {/* Compteur */}
        <div className="text-center mb-10">
          <p className="text-gray-400 text-sm">
            <span className="font-bold text-2xl" style={{ color: "#1a2e5a" }}>{produitsFiltres.length}</span>{" "}
            produit{produitsFiltres.length > 1 ? "s" : ""} disponible{produitsFiltres.length > 1 ? "s" : ""}
          </p>
        </div>

        {/* Grille */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          <AnimatePresence>
            {produitsFiltres.map((produit, index) => (
              <motion.div
                key={produit.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                whileHover={{ y: -8, boxShadow: "0 24px 48px rgba(26,46,90,0.14)" }}
                onClick={() => setSelectedProduit(produit)}
                className="bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 group border"
                style={{ borderColor: "#e8f0f0", boxShadow: "0 4px 16px rgba(26,46,90,0.07)" }}
              >
                <div className="relative h-52 w-full overflow-hidden">
                  <Image
                    src={produit.image}
                    alt={produit.nom}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-600"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(160deg, rgba(26,46,90,0.15) 0%, rgba(26,46,90,0.65) 100%)" }}
                  />
                  <div className="absolute top-4 left-4">
                    <div
                      className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl"
                      style={{
                        background: "rgba(255,255,255,0.14)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid rgba(255,255,255,0.28)",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
                      >
                        <produit.Icon size={15} color="#fff" strokeWidth={1.8} />
                      </div>
                      <span className="text-white text-xs font-semibold tracking-wide leading-tight">
                        {produit.nom.split(" ").slice(0, 2).join(" ")}
                      </span>
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-4">
                    <span
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ background: "rgba(42,138,138,0.75)", backdropFilter: "blur(6px)" }}
                    >
                      {produit.categorie === "particuliers" ? "Particuliers"
                        : produit.categorie === "professionnelles" ? "Pro"
                        : "Vie"}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}
                    >
                      <produit.Icon size={19} style={{ color: "#2a8a8a" }} strokeWidth={1.7} />
                    </div>
                    <h3 className="text-lg font-bold leading-snug" style={{ color: "#1a2e5a" }}>{produit.nom}</h3>
                  </div>

                  <p className="text-gray-500 line-clamp-2 mb-5 leading-relaxed text-sm pl-[52px]">
                    {produit.description}
                  </p>

                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: "1px solid #f0f7f7" }}
                  >
                    <div className="flex items-center gap-1.5 font-semibold text-sm" style={{ color: "#2a8a8a" }}>
                      Voir les détails
                      <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-200" />
                    </div>
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                      style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
                    >
                      <ArrowRight size={14} color="#fff" strokeWidth={2} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Section Engagement */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 text-white rounded-3xl p-12 text-center"
          style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #1e4a7a 55%, #2a8a8a 100%)" }}
        >
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3 text-white/50">Notre engagement</p>
          <h2 className="text-3xl sm:text-4xl font-bold mb-12">Pourquoi choisir KARHON ?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {pourquoi.map((item, i) => (
              <motion.div
                key={item.titre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center gap-4"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  <item.Icon size={28} color="#a8d8d8" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-bold text-white text-base">{item.titre}</p>
                  <p className="text-sm text-white/55 mt-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProduit && (
          <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="bg-white max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl my-8"
            >
              <div className="relative h-56 w-full">
                <Image src={selectedProduit.image} alt={selectedProduit.nom} fill sizes="(max-width: 768px) 100vw, 896px" className="object-cover" />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, rgba(26,46,90,0.35) 0%, rgba(26,46,90,0.88) 100%)" }}
                />
                <div className="absolute inset-0 p-8 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)",
                        boxShadow: "0 0 0 3px rgba(255,255,255,0.2), 0 8px 24px rgba(0,0,0,0.25)",
                      }}
                    >
                      <selectedProduit.Icon size={30} color="#fff" strokeWidth={1.6} />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white leading-tight">{selectedProduit.nom}</h2>
                      <p className="text-white/65 mt-1 text-sm">{selectedProduit.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProduit(null)}
                    className="p-2.5 rounded-full transition-all hover:scale-110"
                    style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)" }}
                  >
                    <X size={22} color="#fff" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scroll">
                <div>
                  <h3 className="font-bold text-xl mb-3" style={{ color: "#1a2e5a" }}>Description Complète</h3>
                  <p className="text-gray-600 leading-relaxed">{selectedProduit.longDescription}</p>
                </div>

                <div>
                  <h3 className="font-bold text-xl mb-4 flex items-center gap-2" style={{ color: "#1a2e5a" }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                      <CheckCircle size={16} style={{ color: "#2a8a8a" }} strokeWidth={2} />
                    </div>
                    Garanties Incluses
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProduit.garanties.map((g: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl"
                        style={{ backgroundColor: "#f0f7f7" }}
                      >
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #2a8a8a, #1a6a6a)" }}
                        >
                          <CheckCircle size={13} color="#fff" strokeWidth={2.5} />
                        </div>
                        <span className="text-gray-700 text-sm">{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl" style={{ backgroundColor: "#f0f7f7" }}>
                    <h4 className="font-bold mb-4 flex items-center gap-2" style={{ color: "#1a2e5a" }}>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                        <span style={{ color: "#fff", fontSize: "10px", fontWeight: 800 }}>F</span>
                      </div>
                      Formules Disponibles
                    </h4>
                    <ul className="space-y-2.5">
                      {selectedProduit.options.map((o: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700 text-sm">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold"
                            style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)", fontSize: "9px" }}
                          >
                            {i + 1}
                          </div>
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-2xl" style={{ backgroundColor: "#fff5f5", border: "1px solid #fecaca" }}>
                    <h4 className="font-bold mb-4 flex items-center gap-2 text-red-700">
                      <div className="w-5 h-5 rounded-md bg-red-500 flex items-center justify-center">
                        <X size={11} color="#fff" strokeWidth={2.5} />
                      </div>
                      Exclusions Principales
                    </h4>
                    <ul className="space-y-2.5">
                      {selectedProduit.exclusions.map((e: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  className="p-6 rounded-2xl flex gap-4"
                  style={{ backgroundColor: "#f0f7f7", borderLeft: "4px solid #2a8a8a" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
                  >
                    <selectedProduit.Icon size={20} color="#fff" strokeWidth={1.7} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1" style={{ color: "#1a2e5a" }}>Pourquoi choisir cette assurance chez KARHON ?</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Accompagnement personnalisé, suivi en cas de sinistre, et défense de vos intérêts auprès des compagnies. Aucun honoraire facturé.</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex flex-col sm:flex-row gap-4" style={{ borderColor: "#e0ecec" }}>
                <button
                  onClick={() => setSelectedProduit(null)}
                  className="flex-1 py-4 border-2 rounded-2xl font-semibold hover:bg-gray-50 transition text-sm"
                  style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}
                >
                  Fermer
                </button>
                <button
                  onClick={() => { setSelectedProduit(null); router.push('/devis'); }}
                  className="flex-1 text-white py-4 rounded-2xl font-semibold transition-all shadow-lg hover:scale-105 text-sm flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
                >
                  Demander un devis gratuit
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}