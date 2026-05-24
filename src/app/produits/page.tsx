"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProduitsPage() {
  const [activeCategorie, setActiveCategorie] = useState("particuliers");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const produits = {
    particuliers: [
      { id: "auto", nom: "Assurance Auto", icone: "??", description: "Protection complète pour votre véhicule", details: ["Responsabilité Civile", "Dommages tous accidents", "Vol et incendie", "Bris de glace", "Assistance 24h/24"], options: ["Particulier", "Flotte", "Deux roues"] },
      { id: "habitation", nom: "Assurance Habitation", icone: "??", description: "Protection de votre logement", details: ["Incendie", "Dégâts des eaux", "Vol", "Bris de glace", "Responsabilité Civile"], options: ["Appartement", "Villa", "Immeuble"] },
      { id: "sante", nom: "Assurance Santé", icone: "??", description: "Couverture médicale complète", details: ["Consultations", "Hospitalisation", "Médicaments", "Analyses", "Soins dentaires"], options: ["Individuelle", "Famille"] },
      { id: "voyage", nom: "Assurance Voyage", icone: "??", description: "Voyagez en toute sérénité", details: ["Annulation", "Rapatriement", "Perte bagages", "Assistance médicale"], options: ["Individuel", "Famille", "Affaires"] }
    ],
    professionnels: [
      { id: "autoflotte", nom: "Auto Flotte", icone: "??", description: "Gestion de flotte d'entreprise", details: ["RC Flotte", "Dommages tous accidents", "Vol", "Assistance"], options: ["TPE", "PME", "Grandes entreprises"] },
      { id: "mrpro", nom: "Multirisque Pro", icone: "??", description: "Protection complète de l'entreprise", details: ["Incendie", "Vol", "Dégâts des eaux", "Bris de glaces", "RC exploitation"], options: ["TPE", "PME", "Grandes entreprises"] },
      { id: "santegroupe", nom: "Santé Groupe", icone: "??", description: "Couverture collective", details: ["Consultations", "Hospitalisation", "Médicaments", "Soins dentaires"], options: ["Entreprise", "Association"] }
    ],
    vie: [
      { id: "retraite", nom: "Assurance Retraite", icone: "??", description: "Préparez votre avenir", details: ["Épargne flexible", "Rente viagère", "Avantage fiscal"], options: ["Individuelle", "Groupe"] },
      { id: "etudes", nom: "Étude Plus", icone: "??", description: "Épargne pour les études", details: ["Épargne programmée", "Capital garanti"], options: ["Études supérieures", "Internationales"] },
      { id: "emprunteur", nom: "Prêt bancaire", icone: "??", description: "Protection de votre crédit", details: ["Décès", "Invalidité", "Incapacité"], options: ["Prêt immobilier", "Prêt personnel"] }
    ]
  };

  const categories = [
    { id: "particuliers", nom: "Particuliers", icone: "??" },
    { id: "professionnels", nom: "Professionnels", icone: "??" },
    { id: "vie", nom: "Assurances Vie", icone: "??" }
  ];

  const getProduits = () => {
    if (activeCategorie === "particuliers") return produits.particuliers;
    if (activeCategorie === "professionnels") return produits.professionnels;
    return produits.vie;
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeUp}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Notre expertise</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Des solutions d'assurance
            <span className="text-blue-600"> sur mesure</span>
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Découvrez notre gamme complète de produits conçus pour protéger ce qui compte le plus pour vous
          </p>
        </motion.div>

        {/* Categories */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex justify-center gap-4 mb-12"
        >
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCategorie(cat.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                activeCategorie === cat.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-gray-600 hover:shadow-md border border-gray-200"
              }`}
            >
              <span className="text-lg">{cat.icone}</span>
              <span>{cat.nom}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {getProduits().map((produit, index) => (
            <motion.div
              key={produit.id}
              variants={fadeUp}
              whileHover={{ y: -8 }}
              onHoverStart={() => setHoveredCard(produit.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="group"
            >
              <div className={`relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden ${
                hoveredCard === produit.id ? "shadow-2xl" : ""
              }`}>
                <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="p-6">
                  <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{produit.icone}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{produit.nom}</h3>
                  <p className="text-gray-500 text-sm mb-5">{produit.description}</p>
                  <div className="border-t border-gray-100 pt-4 mb-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Garanties principales</p>
                    <div className="space-y-2">
                      {produit.details.slice(0, 3).map((detail, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                            <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-sm text-gray-600">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link href="/devis">
                      <button className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                        Demander un devis
                      </button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

