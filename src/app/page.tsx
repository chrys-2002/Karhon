"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { X, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const produitsIARD = [
  {
    nom: "Assurance Auto",
    description: "Particulier, flotte et deux roues",
    image: "/images/accueil/auto.jpg",
    longDescription: "L'assurance automobile est obligatoire en Côte d'Ivoire. Elle couvre les dommages causés avec ou à un véhicule automobile. KARHON vous propose les meilleures formules adaptées à votre budget.",
    garanties: ["Responsabilité Civile obligatoire", "Vol et Incendie", "Bris de Glace", "Dommages Corporels", "Assistance Dépannage 24/7", "Protection du conducteur"],
    options: ["Tiers Simple", "Tiers Étendu", "Tous Risques"],
  },
  {
    nom: "Assurance Habitation",
    description: "Appartement, immeuble, villa",
    image: "/images/accueil/habitation.jpg",
    longDescription: "Protège votre résidence principale ou secondaire contre tous les risques du quotidien. Idéale pour les locataires et les propriétaires.",
    garanties: ["Incendie & Explosion", "Dégâts des Eaux", "Vol & Cambriolage", "Responsabilité Civile", "Catastrophes Naturelles", "Assistance Dépannage"],
    options: ["Locataire", "Propriétaire Occupant", "Propriétaire Non Occupant"],
  },
  {
    nom: "Assurance Santé",
    description: "Individuelle et famille",
    image: "/images/accueil/sante.jpg",
    longDescription: "Dispositif permettant aux assurés confrontés à des risques de maladies, maternité ou invalidité de bénéficier de prestations au ticket modérateur et de remboursement des frais médicaux.",
    garanties: ["Consultations Médicales", "Hospitalisation", "Maternité", "Pharmacie", "Soins Dentaires & Optiques", "Analyses Médicales"],
    options: ["Niveau 1", "Niveau 2", "Niveau 3", "Formule Famille"],
  },
  {
    nom: "Assurance Voyage",
    description: "Multirisques personnalisée",
    image: "/images/accueil/voyage.jpg",
    longDescription: "Assurance Assistance Voyage multirisques personnalisée pour les voyageurs en toute sérénité. Couvre l'annulation, le rapatriement, les frais médicaux à l'étranger et la perte de bagages.",
    garanties: ["Rapatriement Sanitaire", "Frais Médicaux Étranger", "Annulation de Voyage", "Perte de Bagages", "Assistance 24/7"],
    options: ["Court Séjour", "Long Séjour", "Expatriation", "Scolaire"],
  },
];

const produitsVIE = [
  {
    nom: "Assurance Retraite",
    description: "Préparez votre avenir",
    image: "/images/accueil/retraite.jpg",
    longDescription: "Permet de constituer un capital ou une rente pour maintenir votre niveau de vie après la retraite. Avantages fiscaux intéressants et transmission sécurisée aux héritiers.",
    garanties: ["Capital Garanti", "Rente Viagère", "Transmission aux Héritiers", "Rachat Partiel"],
    options: ["Épargne Libre", "Épargne Programmée", "Versement Unique"],
  },
  {
    nom: "Assurance Études",
    description: "Épargne pour les études",
    image: "/images/accueil/etudes.jpg",
    longDescription: "Épargne dédiée au financement des études supérieures de vos enfants. Capital garanti à l'échéance avec possibilité de versements flexibles. En cas de décès du souscripteur, le contrat continue sans versement.",
    garanties: ["Capital Garanti", "Versement Flexible", "Transmission Sécurisée", "Exonération en cas de décès"],
    options: ["10 ans", "15 ans", "20 ans"],
  },
  {
    nom: "Assurance Emprunteur",
    description: "Protection de prêt bancaire",
    image: "/images/accueil/emprunteur.jpg",
    longDescription: "Couvre le remboursement d'un prêt en cas de décès ou d'invalidité. Obligatoire pour la plupart des prêts immobiliers et recommandée pour les prêts professionnels.",
    garanties: ["Décès", "Invalidité Totale", "Incapacité Temporaire", "Perte d'Emploi (option)"],
    options: ["Prêt Immobilier", "Prêt Automobile", "Prêt Professionnel"],
  },
  {
    nom: "Assurance Obsèques",
    description: "Prévoyance funéraire",
    image: "/images/accueil/obseques.jpg",
    longDescription: "Prise en charge des frais funéraires pour protéger vos proches d'une charge financière difficile. Capital versé rapidement aux bénéficiaires pour couvrir les obsèques.",
    garanties: ["Capital Décès versé rapidement", "Organisation des Obsèques", "Assistance Famille", "Rapatriement du Corps"],
    options: ["Individuelle", "Famille", "Groupe Entreprise"],
  },
];

const stats = [
  { value: "50+", label: "Partenaires", icone: "🤝" },
  { value: "1000+", label: "Clients", icone: "⭐" },
  { value: "48h", label: "Devis express", icone: "⚡" },
  { value: "100%", label: "Sans honoraires", icone: "💰" },
];

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="overflow-hidden">

      {/* Hero */}
      <div
        className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-0"
        style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #1e4a7a 50%, #2a8a8a 100%)" }}
      >
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-700 ${loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 px-2">
              KARHON <span style={{ color: "#2a8a8a" }}>Assurances</span>
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-blue-100 mb-2 sm:mb-3 md:mb-4 px-4">
              Votre courtier en assurances à Abidjan
            </p>
            <p className="text-xs sm:text-base text-blue-200 mb-6 sm:mb-10 max-w-2xl mx-auto px-4 leading-relaxed">
              Neutre et indépendant, nous travaillons dans votre intérêt.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/devis" className="px-6 py-3 rounded-full font-semibold text-white text-center transition-all duration-300 hover:scale-105 active:scale-95" style={{ background: "linear-gradient(135deg, #2a8a8a, #1e4a7a)" }}>
                Demander un devis gratuit
              </Link>
              <Link href="/contact" className="px-6 py-3 rounded-full font-semibold text-white text-center transition-all duration-300 hover:scale-105 active:scale-95 border-2" style={{ borderColor: "#2a8a8a" }}>
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-5 sm:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Stats */}
      <div className="py-8 sm:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
            {stats.map((stat, index) => (
              <div key={index} className="rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 hover:shadow-xl border" style={{ borderColor: "#e0ecec" }}>
                <div className="text-3xl sm:text-5xl mb-1 sm:mb-2">{stat.icone}</div>
                <div className="text-xl sm:text-3xl font-bold" style={{ color: "#1a2e5a" }}>{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IARD */}
      <div className="py-12 sm:py-16" style={{ backgroundColor: "#f0f5f5" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: "#1a2e5a" }}>Assurances IARD</h2>
            <p className="text-sm sm:text-base text-gray-500">Incendie, Accidents, Risques Divers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {produitsIARD.map((produit, index) => (
              <div
                key={index}
                onClick={() => setSelectedProduit(produit)}
                className="cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="rounded-xl shadow-md overflow-hidden group">
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image src={produit.image} alt={produit.nom} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(26,46,90,0.75) 100%)" }} />
                  </div>
                  <div className="p-4" style={{ background: "linear-gradient(135deg, #1e4a7a, #2a8a8a)" }}>
                    <h3 className="text-base font-bold text-white mb-1">{produit.nom}</h3>
                    <p className="text-white/80 text-xs mb-3">{produit.description}</p>
                    <span className="inline-block bg-white/20 px-3 py-1.5 rounded-full text-white text-xs hover:bg-white/30 transition-all">
                      En savoir plus
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* VIE */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: "#1a2e5a" }}>Assurances Vie</h2>
            <p className="text-sm sm:text-base text-gray-500">Préparez et protégez votre avenir</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {produitsVIE.map((produit, index) => (
              <div
                key={index}
                onClick={() => setSelectedProduit(produit)}
                className="cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <div className="rounded-xl shadow-md overflow-hidden group">
                  <div className="relative h-40 w-full overflow-hidden">
                    <Image src={produit.image} alt={produit.nom} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(26,46,90,0.75) 100%)" }} />
                  </div>
                  <div className="p-4" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                    <h3 className="text-base font-bold text-white mb-1">{produit.nom}</h3>
                    <p className="text-white/80 text-xs mb-3">{produit.description}</p>
                    <span className="inline-block bg-white/20 px-3 py-1.5 rounded-full text-white text-xs hover:bg-white/30 transition-all">
                      En savoir plus
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pourquoi KARHON */}
      <div className="py-12 sm:py-16" style={{ background: "linear-gradient(135deg, #1a2e5a, #1e4a7a)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-8 sm:mb-10">Pourquoi choisir KARHON ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { icone: "🎯", title: "Un interlocuteur unique", desc: "Gestion personnalisée de vos dossiers" },
              { icone: "🤝", title: "Neutre et indépendant", desc: "Nous travaillons dans votre intérêt" },
              { icone: "💰", title: "Sans honoraires", desc: "Services pris en charge par les compagnies" },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-5 sm:p-6 text-center border border-white/20 transition-all duration-300 hover:scale-105" style={{ borderColor: "rgba(42,138,138,0.3)" }}>
                <div className="text-5xl sm:text-6xl mb-3">{item.icone}</div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-200 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: "#1a2e5a" }}>
            Prêt à protéger ce qui compte pour vous ?
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6">Obtenez votre devis gratuit en quelques minutes</p>
          <Link href="/devis" className="inline-block px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95" style={{ background: "linear-gradient(135deg, #2a8a8a, #1e4a7a)" }}>
            Commencer maintenant
          </Link>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProduit && (
          <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl my-8"
            >
              {/* Header image */}
              <div className="relative h-52 w-full">
                <Image src={selectedProduit.image} alt={selectedProduit.nom} fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(26,46,90,0.3) 0%, rgba(26,46,90,0.85) 100%)" }} />
                <div className="absolute inset-0 p-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedProduit.nom}</h2>
                    <p className="text-white/70 text-sm mt-1">{selectedProduit.description}</p>
                  </div>
                  <button onClick={() => setSelectedProduit(null)} className="p-2 hover:bg-white/20 rounded-full transition text-white">
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Contenu */}
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#1a2e5a" }}>Description</h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProduit.longDescription}</p>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: "#1a2e5a" }}>Garanties incluses</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProduit.garanties.map((g: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 p-3 rounded-xl text-sm text-gray-700" style={{ backgroundColor: "#f0f7f7" }}>
                        <CheckCircle size={16} style={{ color: "#2a8a8a" }} className="flex-shrink-0" />
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: "#1a2e5a" }}>Formules disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduit.options.map((o: string, i: number) => (
                      <span key={i} className="px-4 py-2 rounded-full text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t flex gap-4" style={{ borderColor: "#e0ecec" }}>
                <button onClick={() => setSelectedProduit(null)} className="flex-1 py-3 border-2 rounded-2xl font-semibold hover:bg-gray-50 transition text-sm" style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}>
                  Fermer
                </button>
                <Link href="/devis" onClick={() => setSelectedProduit(null)} className="flex-1 text-white py-3 rounded-2xl font-semibold transition shadow-lg hover:scale-105 text-center text-sm" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                  Demander un devis gratuit
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}