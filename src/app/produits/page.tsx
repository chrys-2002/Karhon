"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProduitsPage() {
  const [activeCategorie, setActiveCategorie] = useState("particuliers");
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const produits = {
    particuliers: [
      { id: "auto", nom: "Assurance Auto", icone: "🚗", description: "Couvre les dommages causés avec ou à un véhicule", details: ["Responsabilité Civile", "Dommages tous accidents", "Vol et incendie", "Bris de glace", "Assistance 24h/24"], options: ["Particulier", "Flotte", "Deux roues"] },
      { id: "habitation", nom: "Assurance Habitation", icone: "🏠", description: "Protection complète pour votre logement", details: ["Incendie", "Dégâts des eaux", "Vol", "Bris de glace", "Responsabilité Civile"], options: ["Appartement", "Villa", "Immeuble"] },
      { id: "sante", nom: "Assurance Santé Individuelle", icone: "🏥", description: "Remboursement des frais médicaux par ticket modérateur", details: ["Consultations", "Hospitalisation", "Médicaments", "Analyses", "Soins dentaires", "Maternité", "Invalidité"], options: ["Individuelle", "Famille"] },
      { id: "accident", nom: "Individuelle Accident", icone: "⚠️", description: "Indemnisation des dommages corporels suite à un accident", details: ["Décès", "Invalidité permanente", "Incapacité temporaire", "Frais médicaux"], options: ["Individuelle", "Famille"] },
      { id: "voyage", nom: "Assurance Voyage", icone: "✈️", description: "Couverture multirisques personnalisée pour voyageurs", details: ["Annulation", "Rapatriement", "Perte bagages", "Assistance médicale", "RC à l'étranger"], options: ["Voyage individuel", "Famille", "Affaires"] },
      { id: "rc", nom: "Responsabilité Civile", icone: "⚖️", description: "Couvre la responsabilité de l'assuré envers les tiers", details: ["Dommages corporels", "Dommages matériels", "Dommages immatériels", "Défense pénale"], options: ["Particulier", "Famille"] }
    ],
    professionnels: [
      { id: "autoflotte", nom: "Automobile Flotte", icone: "🚛", description: "Gestion des dommages pour flotte d'entreprise", details: ["RC Flotte", "Dommages tous accidents", "Vol et incendie", "Gestion des sinistres", "Assistance 24h/24"], options: ["TPE", "PME", "Grandes entreprises"] },
      { id: "mrpro", nom: "Multirisque Professionnelle", icone: "🏢", description: "Couverture complète biens + responsabilités", details: ["Incendie", "Vol", "Dégâts des eaux", "Bris de glaces", "RC exploitation/professionnelle"], options: ["TPE", "PME", "Grandes entreprises"] },
      { id: "santegroupe", nom: "Santé Groupe", icone: "👥", description: "Couverture santé collective pour les employés", details: ["Consultations", "Hospitalisation", "Médicaments", "Soins dentaires", "Optique"], options: ["Entreprise", "Association", "Collectivité"] },
      { id: "accidentgroupe", nom: "Individuelle Accident Groupe", icone: "👥⚠️", description: "Version collective de l'assurance accident", details: ["Décès", "Invalidité", "Incapacité", "Frais médicaux"], options: ["Salariés", "Employés", "Membres"] },
      { id: "rcpro", nom: "RC Civile et Professionnelle", icone: "⚖️🏢", description: "Couvre la responsabilité de l'entreprise", details: ["RC exploitation", "RC professionnelle", "RC civile", "Défense pénale"], options: ["Profession libérale", "Commerce", "Industrie"] },
      { id: "maritime", nom: "Assurance Maritime", icone: "⛴️", description: "Indemnisation des sinistres maritimes", details: ["Casco", "Marchandises transportées", "RC exploitant", "Fret"], options: ["Navires", "Marchandises", "Transporteurs"] }
    ],
    vie: [
      { id: "retraite", nom: "Assurance Retraite", icone: "👴", description: "Constitution d'un capital ou rente pour la retraite", details: ["Épargne flexible", "Rente viagère garantie", "Avantage fiscal", "Réversion possible"], options: ["Individuelle", "Groupe", "TNS"] },
      { id: "etudes", nom: "Étude Plus", icone: "📚", description: "Épargne dédiée au financement des études", details: ["Épargne programmée", "Capital garanti", "Avantage fiscal", "Versement unique"], options: ["Études supérieures", "Internationales"] },
      { id: "emprunteur", nom: "Prêt bancaire / Vie emprunteur", icone: "🏦", description: "Couvre le remboursement d'un prêt en cas de décès", details: ["Décès", "Invalidité permanente", "Incapacité de travail", "Perte d'emploi"], options: ["Prêt immobilier", "Prêt personnel", "Prêt professionnel"] },
      { id: "retraitegroupe", nom: "Retraite complémentaire groupe", icone: "👥👴", description: "Version collective de la retraite", details: ["Épargne salariale", "Rente viagère", "Avantage fiscal entreprise"], options: ["Grands groupes", "PME", "Associations"] },
      { id: "obseques", nom: "Assistance funéraire", icone: "🕊️", description: "Prise en charge des frais funéraires", details: ["Capital décès", "Prise en charge des obsèques", "Libre choix des prestataires"], options: ["Individuelle", "Conjoint", "Famille"] }
    ]
  };

  const categories = [
    { id: "particuliers", nom: "Particuliers", icone: "👤", description: "Solutions pour votre protection personnelle" },
    { id: "professionnels", nom: "Professionnels", icone: "🏢", description: "Protection pour votre activité" },
    { id: "vie", nom: "Assurances Vie", icone: "💝", description: "Préparez votre avenir" }
  ];

  const getProduitsFiltres = () => {
    if (activeCategorie === "particuliers") return produits.particuliers;
    if (activeCategorie === "professionnels") return produits.professionnels;
    return produits.vie;
  };

  const currentCategory = categories.find(c => c.id === activeCategorie);

  return (
    <div className="py-8 sm:py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 sm:mb-4">
            Nos produits d'assurance
          </h1>
          <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto px-4">
            Découvrez nos solutions adaptées à chaque besoin
          </p>
        </div>

        {/* Categories - 3 grandes sections */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
          {categories.map((categorie) => (
            <button
              key={categorie.id}
              onClick={() => setActiveCategorie(categorie.id)}
              className={`p-4 sm:p-5 rounded-xl sm:rounded-2xl text-center transition-all duration-300 ${
                activeCategorie === categorie.id
                  ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-xl scale-105"
                  : "bg-white text-gray-700 hover:shadow-md border border-gray-200"
              }`}
            >
              <div className="text-2xl sm:text-3xl mb-2">{categorie.icone}</div>
              <h3 className="font-bold text-sm sm:text-base">{categorie.nom}</h3>
              <p className={`text-xs mt-1 ${activeCategorie === categorie.id ? "text-blue-200" : "text-gray-400"}`}>
                {categorie.description}
              </p>
            </button>
          ))}
        </div>

        {/* Section description */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            {currentCategory?.nom}
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            {currentCategory?.description}
          </p>
        </div>

        {/* Grille des produits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {getProduitsFiltres().map((produit, index) => (
            <div
              key={produit.id}
              className={`bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${isVisible ? 'animate-scaleIn' : 'opacity-0'}`}
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="p-4 sm:p-5 md:p-6">
                <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 animate-float">{produit.icone}</div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 mb-1">{produit.nom}</h3>
                <p className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">{produit.description}</p>
                
                <div className="border-t border-gray-100 pt-3 sm:pt-4 mb-3 sm:mb-4">
                  <h4 className="font-semibold text-gray-700 text-xs sm:text-sm mb-2">Garanties incluses :</h4>
                  <ul className="space-y-1">
                    {produit.details.slice(0, 4).map((detail, i) => (
                      <li key={i} className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <span className="text-blue-500 text-xs">✓</span> {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-3 sm:mb-4">
                  <h4 className="font-semibold text-gray-700 text-xs sm:text-sm mb-2">Formules disponibles :</h4>
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    {produit.options.map((option, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{option}</span>
                    ))}
                  </div>
                </div>
                
                <Link href="/devis">
                  <button className="w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-xl font-medium text-xs sm:text-sm hover:bg-blue-700 transition-all active:scale-95">
                    Demander un devis
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
