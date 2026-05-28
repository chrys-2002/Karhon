'use client';
import { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const categories = [
  { id: 'all', nom: 'Tous', icone: '🌐' },
  { id: 'particuliers', nom: 'Particuliers', icone: '👤' },
  { id: 'professionnelles', nom: 'Professionnelles', icone: '🏢' },
  { id: 'vie', nom: 'Assurance Vie', icone: '❤️' },
];

const produits = [
  {
    id: "automobile", categorie: "particuliers", nom: "Assurance Automobile",
    icone: "🚗", image: "/images/produits/automobile.jpg",
    description: "Couvre les dommages causés avec ou à un véhicule (particulier, flotte, deux-roues).",
    longDescription: "L'assurance automobile est obligatoire en Côte d'Ivoire. Elle protège le conducteur, les passagers, les tiers et le véhicule contre les risques d'accident, vol, incendie, et bris de glace.",
    garanties: ["Responsabilité Civile", "Dommages Corporels", "Vol et Incendie", "Bris de Glace", "Assistance Dépannage 24/7", "Protection du conducteur"],
    exclusions: ["Course automobile", "Utilisation professionnelle non déclarée", "Conduite sans permis"],
    options: ["Tiers Simple", "Tiers Étendu", "Tous Risques"]
  },
  {
    id: "habitation", categorie: "particuliers", nom: "Assurance Habitation",
    icone: "🏠", image: "/images/produits/habitation.jpg",
    description: "Protège votre appartement, immeuble ou villa contre les risques du quotidien.",
    longDescription: "Cette assurance couvre votre résidence principale ou secondaire contre l'incendie, le vol, les dégâts des eaux et les catastrophes naturelles.",
    garanties: ["Incendie & Explosion", "Dégâts des Eaux", "Vol & Cambriolage", "Responsabilité Civile", "Catastrophes Naturelles", "Assistance Dépannage"],
    exclusions: ["Usure normale", "Négligence grave", "Travaux non déclarés"],
    options: ["Locataire", "Propriétaire Occupant", "Propriétaire Non Occupant"]
  },
  {
    id: "sante-individuelle", categorie: "particuliers", nom: "Santé Individuelle",
    icone: "🩺", image: "/images/produits/sante-individuelle.jpg",
    description: "Remboursement des frais médicaux, maternité et invalidité via ticket modérateur.",
    longDescription: "Assurance santé qui prend en charge vos dépenses médicales selon le système du ticket modérateur. Idéale pour les particuliers et les familles.",
    garanties: ["Consultations Médicales", "Hospitalisation", "Maternité", "Pharmacie", "Soins Dentaires & Optiques", "Analyses Médicales"],
    exclusions: ["Maladies préexistantes non déclarées", "Actes esthétiques"],
    options: ["Niveau 1", "Niveau 2", "Niveau 3", "Formule Famille"]
  },
  {
    id: "accident-individuel", categorie: "particuliers", nom: "Individuelle Accident",
    icone: "🛡️", image: "/images/produits/accident-individuel.jpg",
    description: "Indemnise les dommages corporels suite à un événement accidentel.",
    longDescription: "Contrat qui indemnise le dommage corporel subi par l'assuré à la suite d'un événement accidentel (décès, invalidité permanente ou temporaire, frais médicaux).",
    garanties: ["Décès Accidentel", "Invalidité Permanente", "Incapacité Temporaire", "Frais Médicaux", "Assistance"],
    exclusions: ["Suicide", "Accident sous emprise"],
    options: ["Individuelle", "Familiale"]
  },
  {
    id: "voyage", categorie: "particuliers", nom: "Assurance Voyage",
    icone: "✈️", image: "/images/produits/voyage.jpg",
    description: "Multirisques personnalisée pour les voyageurs en toute sérénité.",
    longDescription: "Assurance Assistance Voyage multirisques personnalisée pour des voyageurs en toute sérénité. Couvre l'annulation, le rapatriement, les frais médicaux à l'étranger et la perte de bagages.",
    garanties: ["Rapatriement Sanitaire", "Frais Médicaux Étranger", "Annulation de Voyage", "Perte de Bagages", "Assistance 24/7"],
    exclusions: ["Pays en guerre", "Voyage non déclaré"],
    options: ["Court Séjour", "Long Séjour", "Expatriation", "Scolaire"]
  },
  {
    id: "rc-civile", categorie: "particuliers", nom: "Responsabilité Civile",
    icone: "⚖️", image: "/images/produits/rc-civile.jpg",
    description: "Couvre la responsabilité de l'assuré envers les tiers.",
    longDescription: "La Responsabilité Civile couvre les dommages que vous pourriez causer à autrui dans votre vie quotidienne.",
    garanties: ["Dommages Corporels aux Tiers", "Dommages Matériels aux Tiers", "Défense Pénale", "Recours"],
    exclusions: ["Dommages intentionnels", "Activité professionnelle"],
    options: ["Familiale", "Scolaire", "Sportive"]
  },
  {
    id: "auto-flotte", categorie: "professionnelles", nom: "Automobile Flotte",
    icone: "🚛", image: "/images/produits/auto-flotte.jpg",
    description: "Couverture véhicules pour sociétés et entreprises.",
    longDescription: "Assurance automobile dédiée aux flottes de véhicules d'entreprise. Gestion simplifiée de tous vos véhicules avec des conditions avantageuses.",
    garanties: ["Responsabilité Civile", "Dommages aux Véhicules", "Vol et Incendie", "Assistance Flotte", "Gestion Sinistres"],
    exclusions: ["Usage personnel non déclaré"],
    options: ["2-5 véhicules", "6-20 véhicules", "+20 véhicules"]
  },
  {
    id: "multirisque-pro", categorie: "professionnelles", nom: "Multirisque Professionnelle",
    icone: "🏪", image: "/images/produits/multirisque-pro.jpg",
    description: "Couverture complète biens + responsabilités. 5 garanties disponibles.",
    longDescription: "Assurance multirisques professionnelle offre une couverture complète des biens et des responsabilités. L'assuré peut choisir 5 grandes types de garanties.",
    garanties: ["Incendie", "Vol", "Dégâts des Eaux", "Bris de Glaces", "RC Exploitation/Professionnelle", "Perte d'Exploitation"],
    exclusions: ["Usure normale", "Fraude interne"],
    options: ["Commerce", "Industrie", "Services", "Bureaux"]
  },
  {
    id: "sante-groupe", categorie: "professionnelles", nom: "Santé Groupe",
    icone: "👥", image: "/images/produits/sante-groupe.jpg",
    description: "Couverture santé collective pour les employés d'une société.",
    longDescription: "Couverture santé collective pour les employés d'une société. Avantage social majeur pour attirer et fidéliser les talents.",
    garanties: ["Consultations", "Hospitalisation", "Maternité", "Pharmacie", "Soins Optiques et Dentaires", "Médecine Préventive"],
    exclusions: ["Maladies préexistantes non déclarées"],
    options: ["Standard", "Premium", "Sur-mesure"]
  },
  {
    id: "accident-groupe", categorie: "professionnelles", nom: "Individuelle Accident Groupe",
    icone: "🛡️", image: "/images/produits/accident-groupe.jpg",
    description: "Version collective de l'assurance accident pour les salariés.",
    longDescription: "Version collective de l'assurance accident, pour les salariés. Couvre tous les employés contre les accidents de la vie privée et professionnelle.",
    garanties: ["Décès Accidentel", "Invalidité Permanente", "Incapacité Temporaire", "Frais Médicaux"],
    exclusions: ["Suicide", "Accident sous emprise"],
    options: ["Tous Salariés", "Cadres Dirigeants", "Personnel de Terrain"]
  },
  {
    id: "rc-pro", categorie: "professionnelles", nom: "RC Civile et Professionnelle",
    icone: "⚖️", image: "/images/produits/rc-pro.jpg",
    description: "Couvre la responsabilité de l'entreprise envers les tiers.",
    longDescription: "Couvre la responsabilité de l'entreprise envers les tiers et dans le cadre de son activité professionnelle.",
    garanties: ["RC Exploitation", "RC Professionnelle", "Défense Pénale", "Recours des Tiers"],
    exclusions: ["Faute intentionnelle", "Activités non déclarées"],
    options: ["Commerces", "Professions Libérales", "Industries", "BTP"]
  },
  {
    id: "maritime", categorie: "professionnelles", nom: "Assurance Maritime",
    icone: "⚓", image: "/images/produits/maritime.jpg",
    description: "Contrat par lequel une compagnie s'engage à indemniser les sinistres maritimes.",
    longDescription: "Assurance Maritime est un contrat par lequel une compagnie d'assurance s'engage à indemniser des sinistres Maritimes dans la limite convenue dans le contrat.",
    garanties: ["Corps Navire", "Marchandises Transportées", "RC Armateur", "Assistance & Sauvetage", "Frais de Remorquage"],
    exclusions: ["Usure du navire", "Vice propre"],
    options: ["Import/Export", "Transport National", "Pêche", "Plaisance"]
  },
  {
    id: "retraite", categorie: "vie", nom: "Assurance Retraite",
    icone: "📈", image: "/images/produits/retraite.jpg",
    description: "Constitution d'un capital ou rente pour la retraite.",
    longDescription: "Permet de constituer un capital ou une rente pour maintenir votre niveau de vie après la retraite.",
    garanties: ["Capital Garanti", "Rente Viagère", "Transmission aux Héritiers", "Rachat Partiel"],
    exclusions: ["Retrait anticipé sans motif valable"],
    options: ["Épargne Libre", "Épargne Programmée", "Versement Unique"]
  },
  {
    id: "etude-plus", categorie: "vie", nom: "Étude Plus",
    icone: "🎓", image: "/images/produits/etude-plus.jpg",
    description: "Épargne dédiée au financement des études des enfants.",
    longDescription: "Épargne dédiée au financement des études supérieures de vos enfants. Capital garanti à l'échéance avec possibilité de versements flexibles.",
    garanties: ["Capital Garanti", "Versement Flexible", "Transmission Sécurisée", "Exonération en cas de décès"],
    exclusions: ["Retrait avant 8 ans"],
    options: ["10 ans", "15 ans", "20 ans"]
  },
  {
    id: "vie-emprunteur", categorie: "vie", nom: "Prêt Bancaire / Vie Emprunteur",
    icone: "🏦", image: "/images/produits/vie-emprunteur.jpg",
    description: "Couvre le remboursement d'un prêt en cas de décès ou invalidité.",
    longDescription: "Couvre le remboursement d'un prêt en cas de décès ou invalidité. Obligatoire pour la plupart des prêts immobiliers.",
    garanties: ["Décès", "Invalidité Totale", "Incapacité Temporaire", "Perte d'Emploi (option)"],
    exclusions: ["Maladies préexistantes non déclarées"],
    options: ["Prêt Immobilier", "Prêt Automobile", "Prêt Professionnel"]
  },
  {
    id: "retraite-groupe", categorie: "vie", nom: "Retraite Complémentaire Groupe",
    icone: "👔", image: "/images/produits/retraite-groupe.jpg",
    description: "Version collective de la retraite, souscrite par l'employeur.",
    longDescription: "Version collective de la retraite, souscrite par l'employeur. Avantage social majeur pour fidéliser les collaborateurs.",
    garanties: ["Capital Retraite", "Rente Complémentaire", "Transmission", "Avantages Fiscaux"],
    exclusions: ["Départ avant vesting"],
    options: ["Tous Salariés", "Cadres", "Dirigeants"]
  },
  {
    id: "funeraire", categorie: "vie", nom: "Assistance Funéraire",
    icone: "🕊️", image: "/images/produits/funeraire.jpg",
    description: "Prise en charge des frais funéraires.",
    longDescription: "Prise en charge des frais funéraires pour protéger vos proches. Capital versé rapidement aux bénéficiaires.",
    garanties: ["Capital Décès", "Organisation Obsèques", "Assistance Famille", "Rapatriement Corps"],
    exclusions: ["Suicide dans les 2 ans"],
    options: ["Individuelle", "Famille", "Groupe Entreprise"]
  },
];

export default function ProduitsPage() {
  const [activeCategorie, setActiveCategorie] = useState('all');
  const [selectedProduit, setSelectedProduit] = useState<any>(null);
  const router = useRouter();

  const produitsFiltres = activeCategorie === 'all'
    ? produits
    : produits.filter(p => p.categorie === activeCategorie);

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="container mx-auto px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4" style={{ color: "#1a2e5a" }}>
            Nos Solutions d&apos;Assurance
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Des protections sur mesure adaptées à vos besoins personnels et professionnels
          </p>
        </motion.div>

        {/* Filtres */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <motion.button
              key={cat.id}
              onClick={() => setActiveCategorie(cat.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 rounded-2xl font-medium flex items-center gap-3 transition-all shadow-md border"
              style={
                activeCategorie === cat.id
                  ? { background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", color: "#ffffff", borderColor: "transparent" }
                  : { backgroundColor: "#ffffff", color: "#1a2e5a", borderColor: "#e0ecec" }
              }
            >
              <span className="text-2xl">{cat.icone}</span>
              <span>{cat.nom}</span>
            </motion.button>
          ))}
        </div>

        {/* Compteur */}
        <div className="text-center mb-8">
          <p className="text-gray-600">
            <span className="font-bold text-2xl" style={{ color: "#1a2e5a" }}>
              {produitsFiltres.length}
            </span>{" "}
            produit(s) disponible(s)
          </p>
        </div>

        {/* Grille */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence>
            {produitsFiltres.map((produit) => (
              <motion.div
                key={produit.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(26,46,90,0.15)" }}
                onClick={() => setSelectedProduit(produit)}
                className="bg-white rounded-3xl overflow-hidden shadow-lg cursor-pointer transition-all duration-300 group border"
                style={{ borderColor: "#e0ecec" }}
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={produit.image}
                    alt={produit.nom}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(26,46,90,0.6) 100%)" }}
                  />
                  <div className="absolute bottom-3 left-4 text-3xl">{produit.icone}</div>
                </div>

                {/* Contenu carte */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: "#1a2e5a" }}>
                    {produit.nom}
                  </h3>
                  <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed text-sm">
                    {produit.description}
                  </p>
                  <div
                    className="flex items-center gap-2 font-medium transition-colors"
                    style={{ color: "#2a8a8a" }}
                  >
                    <span>Voir les détails</span>
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
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
          className="mt-20 text-white rounded-3xl p-12 text-center"
          style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
        >
          <h2 className="text-3xl font-bold mb-8">Pourquoi choisir KARHON ?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icone: "🤝", titre: "Interlocuteur Unique", desc: "Gestion personnalisée" },
              { icone: "⚖️", titre: "Neutre & Indépendant", desc: "Dans votre intérêt" },
              { icone: "💰", titre: "Sans Honoraires", desc: "Services gratuits" },
              { icone: "⚡", titre: "Devis sous 48h", desc: "Réponse rapide" },
            ].map((item) => (
              <div key={item.titre}>
                <div className="text-4xl mb-3">{item.icone}</div>
                <p className="font-semibold">{item.titre}</p>
                <p className="text-sm text-white/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedProduit && (
          <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white max-w-4xl w-full rounded-3xl overflow-hidden shadow-2xl my-8"
            >
              {/* Header Modal avec image */}
              <div className="relative h-56 w-full">
                <Image
                  src={selectedProduit.image}
                  alt={selectedProduit.nom}
                  fill
                  className="object-cover"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to bottom, rgba(26,46,90,0.4) 0%, rgba(26,46,90,0.85) 100%)" }}
                />
                <div className="absolute inset-0 p-8 flex justify-between items-end">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedProduit.icone}</span>
                    <div>
                      <h2 className="text-3xl font-bold text-white">{selectedProduit.nom}</h2>
                      <p className="text-white/70 mt-1">{selectedProduit.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedProduit(null)}
                    className="p-2 hover:bg-white/20 rounded-full transition text-white"
                  >
                    <X size={28} />
                  </button>
                </div>
              </div>

              {/* Contenu Modal */}
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scroll">
                <div>
                  <h3 className="font-bold text-xl mb-3" style={{ color: "#1a2e5a" }}>
                    Description Complète
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{selectedProduit.longDescription}</p>
                </div>

                <div>
                  <h3
                    className="font-bold text-xl mb-4 flex items-center gap-2"
                    style={{ color: "#1a2e5a" }}
                  >
                    <CheckCircle style={{ color: "#2a8a8a" }} /> Garanties Incluses
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProduit.garanties.map((g: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 p-4 rounded-xl"
                        style={{ backgroundColor: "#f0f7f7" }}
                      >
                        <CheckCircle className="flex-shrink-0" style={{ color: "#2a8a8a" }} size={20} />
                        <span className="text-gray-700">{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl" style={{ backgroundColor: "#f0f7f7" }}>
                    <h4 className="font-bold mb-3" style={{ color: "#1a2e5a" }}>
                      Formules Disponibles
                    </h4>
                    <ul className="space-y-2">
                      {selectedProduit.options.map((o: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                          <span
                            className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ backgroundColor: "#2a8a8a" }}
                          ></span>
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-6 rounded-2xl bg-red-50">
                    <h4 className="font-bold mb-3 text-red-800">Exclusions Principales</h4>
                    <ul className="space-y-2">
                      {selectedProduit.exclusions.map((e: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-gray-700">
                          <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  className="p-6 rounded-2xl border-l-4"
                  style={{ backgroundColor: "#f0f7f7", borderColor: "#2a8a8a" }}
                >
                  <h4 className="font-bold mb-2" style={{ color: "#1a2e5a" }}>
                    Pourquoi choisir cette assurance chez KARHON ?
                  </h4>
                  <p className="text-gray-700">
                    Accompagnement personnalisé, suivi en cas de sinistre, et défense de vos intérêts
                    auprès des compagnies. Aucun honoraire facturé.
                  </p>
                </div>
              </div>

              {/* Footer Modal */}
              <div
                className="p-6 border-t flex flex-col sm:flex-row gap-4"
                style={{ borderColor: "#e0ecec" }}
              >
                <button
                  onClick={() => setSelectedProduit(null)}
                  className="flex-1 py-4 border-2 rounded-2xl font-semibold hover:bg-gray-50 transition"
                  style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}
                >
                  Fermer
                </button>
                <button
                  onClick={() => { setSelectedProduit(null); router.push('/devis'); }}
                  className="flex-1 text-white py-4 rounded-2xl font-semibold transition shadow-lg hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
                >
                  Demander un devis gratuit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}