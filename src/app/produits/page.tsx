"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function ProduitsPage() {
  const [activeCategorie, setActiveCategorie] = useState("particuliers");
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const produits = {
    particuliers: [
      { id: "auto", nom: "Assurance Auto", icone: "🚗", description: "Couvre les dommages causes avec ou a un vehicule", details: ["Responsabilite Civile", "Dommages tous accidents", "Vol et incendie", "Bris de glace", "Assistance 24h/24"], options: ["Particulier", "Flotte", "Deux roues"] },
      { id: "habitation", nom: "Assurance Habitation", icone: "🏠", description: "Protection complete pour votre logement", details: ["Incendie", "Degats des eaux", "Vol", "Bris de glace", "Responsabilite Civile"], options: ["Appartement", "Villa", "Immeuble"] },
      { id: "sante", nom: "Assurance Sante Individuelle", icone: "🏥", description: "Remboursement des frais medicaux", details: ["Consultations", "Hospitalisation", "Medicaments", "Analyses", "Soins dentaires"], options: ["Individuelle", "Famille"] },
      { id: "voyage", nom: "Assurance Voyage", icone: "✈️", description: "Couverture multirisques pour voyageurs", details: ["Annulation", "Rapatriement", "Perte bagages", "Assistance medicale"], options: ["Individuel", "Famille", "Affaires"] }
    ],
    professionnels: [
      { id: "autoflotte", nom: "Automobile Flotte", icone: "🚛", description: "Gestion des dommages pour flotte d'entreprise", details: ["RC Flotte", "Dommages tous accidents", "Vol et incendie", "Assistance 24h/24"], options: ["TPE", "PME", "Grandes entreprises"] },
      { id: "mrpro", nom: "Multirisque Professionnelle", icone: "🏢", description: "Couverture complete biens + responsabilites", details: ["Incendie", "Vol", "Degats des eaux", "Bris de glaces", "RC exploitation"], options: ["TPE", "PME", "Grandes entreprises"] },
      { id: "santegroupe", nom: "Sante Groupe", icone: "👥", description: "Couverture sante collective pour les employes", details: ["Consultations", "Hospitalisation", "Medicaments", "Soins dentaires"], options: ["Entreprise", "Association"] }
    ],
    vie: [
      { id: "retraite", nom: "Assurance Retraite", icone: "👴", description: "Constitution d'un capital pour la retraite", details: ["Epargne flexible", "Rente viagere", "Avantage fiscal", "Reversion possible"], options: ["Individuelle", "Groupe"] },
      { id: "etudes", nom: "Etude Plus", icone: "📚", description: "Epargne dediee au financement des etudes", details: ["Epargne programmee", "Capital garanti", "Avantage fiscal"], options: ["Etudes superieures", "Internationales"] },
      { id: "emprunteur", nom: "Pret bancaire", icone: "🏦", description: "Couvre le remboursement d'un pret", details: ["Deces", "Invalidite permanente", "Incapacite de travail"], options: ["Pret immobilier", "Pret personnel"] }
    ]
  };

  const categories = [
    { id: "particuliers", nom: "Particuliers", icone: "👤" },
    { id: "professionnels", nom: "Professionnels", icone: "🏢" },
    { id: "vie", nom: "Assurances Vie", icone: "💝" }
  ];

  const getProduitsFiltres = () => {
    if (activeCategorie === "particuliers") return produits.particuliers;
    if (activeCategorie === "professionnels") return produits.professionnels;
    return produits.vie;
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Nos produits d'assurance</h1>
          <p className="text-gray-500">Decouvrez nos solutions adaptees a chaque besoin</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          {categories.map((categorie) => (
            <button
              key={categorie.id}
              onClick={() => setActiveCategorie(categorie.id)}
              className={`p-4 rounded-xl text-center transition-all ${
                activeCategorie === categorie.id
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:shadow-md border border-gray-200"
              }`}
            >
              <div className="text-2xl mb-1">{categorie.icone}</div>
              <div className="font-semibold text-sm">{categorie.nom}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {getProduitsFiltres().map((produit, index) => (
            <div key={produit.id} className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all hover:-translate-y-1 ${isVisible ? 'animate-scaleIn' : 'opacity-0'}`} style={{animationDelay: `${index * 0.1}s`}}>
              <div className="p-5">
                <div className="text-4xl mb-3 animate-float">{produit.icone}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{produit.nom}</h3>
                <p className="text-gray-500 text-sm mb-3">{produit.description}</p>
                <div className="border-t border-gray-100 pt-3 mb-3">
                  <h4 className="font-semibold text-gray-700 text-xs mb-2">Garanties incluses :</h4>
                  <ul className="space-y-1">
                    {produit.details.slice(0, 3).map((detail, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                        <span className="text-blue-500">✓</span> {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <Link href="/devis">
                  <button className="w-full bg-blue-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">Demander un devis</button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
