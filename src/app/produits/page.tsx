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
      { id: "auto", nom: "Assurance Auto", icone: "🚗", description: "Couvre les dommages causes avec ou a un vehicule", details: ["Responsabilite Civile", "Dommages tous accidents", "Vol et incendie"], options: ["Particulier", "Flotte", "Deux roues"] },
      { id: "habitation", nom: "Assurance Habitation", icone: "🏠", description: "Protection complete pour votre logement", details: ["Incendie", "Degats des eaux", "Vol"], options: ["Appartement", "Villa", "Immeuble"] },
      { id: "sante", nom: "Assurance Sante", icone: "🏥", description: "Remboursement des frais medicaux", details: ["Consultations", "Hospitalisation", "Medicaments"], options: ["Individuelle", "Famille"] },
      { id: "voyage", nom: "Assurance Voyage", icone: "✈️", description: "Couverture multirisques pour voyageurs", details: ["Annulation", "Rapatriement", "Perte bagages"], options: ["Individuel", "Famille"] }
    ],
    professionnels: [
      { id: "autoflotte", nom: "Automobile Flotte", icone: "🚛", description: "Gestion des dommages pour flotte", details: ["RC Flotte", "Dommages tous accidents", "Vol"], options: ["TPE", "PME"] },
      { id: "mrpro", nom: "Multirisque Pro", icone: "🏢", description: "Couverture complete biens", details: ["Incendie", "Vol", "Degats des eaux"], options: ["TPE", "PME"] }
    ],
    vie: [
      { id: "retraite", nom: "Assurance Retraite", icone: "👴", description: "Constitution d'un capital", details: ["Epargne flexible", "Rente viagere"], options: ["Individuelle", "Groupe"] },
      { id: "etudes", nom: "Etude Plus", icone: "📚", description: "Epargne pour les etudes", details: ["Epargne programmee", "Capital garanti"], options: ["Etudes superieures"] }
    ]
  };

  const categories = [
    { id: "particuliers", nom: "Particuliers", icone: "👤" },
    { id: "professionnels", nom: "Professionnels", icone: "🏢" },
    { id: "vie", nom: "Assurances Vie", icone: "💝" }
  ];

  const getProduits = () => {
    if (activeCategorie === "particuliers") return produits.particuliers;
    if (activeCategorie === "professionnels") return produits.professionnels;
    return produits.vie;
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Nos produits</h1>
          <p className="text-gray-500">Decouvrez nos solutions adaptees</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategorie(cat.id)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeCategorie === cat.id
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-gray-700 hover:shadow-md border"
              }`}
            >
              {cat.icone} {cat.nom}
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {getProduits().map((produit, idx) => (
            <div key={produit.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-5">
              <div className="text-5xl mb-3">{produit.icone}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{produit.nom}</h3>
              <p className="text-gray-500 text-sm mb-3">{produit.description}</p>
              <ul className="space-y-1 mb-4">
                {produit.details.map((d, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="text-green-500">✓</span> {d}
                  </li>
                ))}
              </ul>
              <Link href="/devis">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition">Demander un devis</button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
