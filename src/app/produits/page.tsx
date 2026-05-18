"use client";
import { useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function ProduitsPage() {
  const [activeCategorie, setActiveCategorie] = useState("tous");

  const produits = {
    iard: [
      {
        id: "auto",
        nom: "Assurance Auto",
        icone: "🚗",
        description: "Protection complète pour votre véhicule",
        details: [
          "Responsabilité Civile",
          "Dommages tous accidents",
          "Vol et incendie",
          "Bris de glace",
          "Assistance 24h/24"
        ],
        options: ["Particulier", "Flotte automobile", "Deux roues"]
      },
      {
        id: "habitation",
        nom: "Assurance Habitation",
        icone: "🏠",
        description: "Protection de votre logement et de vos biens",
        details: [
          "Incendie et explosions",
          "Dégâts des eaux",
          "Vol et vandalisme",
          "Bris de glace",
          "Responsabilité Civile"
        ],
        options: ["Appartement", "Villa", "Immeuble"]
      },
      {
        id: "sante",
        nom: "Assurance Santé",
        icone: "🏥",
        description: "Couverture médicale complète",
        details: [
          "Consultations médicales",
          "Hospitalisation",
          "Médicaments",
          "Analyses et examens",
          "Soins dentaires et optiques"
        ],
        options: ["Individuelle", "Famille", "Groupe"]
      },
      {
        id: "voyage",
        nom: "Assurance Voyage",
        icone: "✈️",
        description: "Partez l'esprit tranquille",
        details: [
          "Annulation de voyage",
          "Rapatriement sanitaire",
          "Perte de bagages",
          "Assistance médicale",
          "Responsabilité Civile à l'étranger"
        ],
        options: ["Voyage individuel", "Voyage famille", "Voyage d'affaires"]
      },
      {
        id: "rc",
        nom: "Responsabilité Civile",
        icone: "⚖️",
        description: "Protection contre les dommages causés à autrui",
        details: [
          "Dommages corporels",
          "Dommages matériels",
          "Dommages immatériels",
          "Défense pénale et recours"
        ],
        options: ["Particulier", "Professionnel"]
      }
    ],
    vie: [
      {
        id: "retraite",
        nom: "Assurance Retraite",
        icone: "👴",
        description: "Préparez votre avenir sereinement",
        details: [
          "Épargne retraite flexible",
          "Versement libre ou programmé",
          "Rente viagère garantie",
          "Avantage fiscal",
          "Réversion possible"
        ],
        options: ["Retraite individuelle", "Retraite complémentaire groupe"]
      },
      {
        id: "etudes",
        nom: "Assurance Études",
        icone: "📚",
        description: "Épargnez pour l'avenir de vos enfants",
        details: [
          "Épargne programmée",
          "Capital garanti",
          "Frais de scolarité",
          "Versement unique ou fractionné",
          "Avantage fiscal"
        ],
        options: ["Études supérieures", "Études internationales"]
      },
      {
        id: "emprunteur",
        nom: "Assurance Emprunteur",
        icone: "🏦",
        description: "Protégez votre crédit immobilier",
        details: [
          "Décès",
          "Perte totale et irréversible d'autonomie",
          "Invalidité permanente",
          "Incapacité de travail",
          "Perte d'emploi"
        ],
        options: ["Prêt immobilier", "Prêt personnel", "Prêt professionnel"]
      },
      {
        id: "obseques",
        nom: "Assurance Obsèques",
        icone: "🕊️",
        description: "Préparez vos funérailles",
        details: [
          "Capital décès",
          "Prise en charge des obsèques",
          "Libre choix des prestataires",
          "Frais d'obsèques garantis",
          "Transmission du capital"
        ],
        options: ["Individuelle", "Conjoint", "Famille"]
      }
    ]
  };

  const categories = [
    { id: "tous", nom: "Tous les produits", icone: "📦" },
    { id: "iard", nom: "Assurances IARD", icone: "🛡️" },
    { id: "vie", nom: "Assurances Vie", icone: "❤️" }
  ];

  const getProduitsFiltres = () => {
    if (activeCategorie === "tous") {
      return [...produits.iard, ...produits.vie];
    } else if (activeCategorie === "iard") {
      return produits.iard;
    } else {
      return produits.vie;
    }
  };

  const produitsFiltres = getProduitsFiltres();

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Nos produits d'assurance</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            KARHON Assurances vous propose une gamme complète de produits adaptés à vos besoins,
            en partenariat avec les meilleures compagnies du marché ivoirien.
          </p>
        </div>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((categorie) => (
            <button
              key={categorie.id}
              onClick={() => setActiveCategorie(categorie.id)}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                activeCategorie === categorie.id
                  ? "bg-blue-900 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              <span>{categorie.icone}</span>
              <span>{categorie.nom}</span>
            </button>
          ))}
        </div>

        {/* Grille des produits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produitsFiltres.map((produit) => (
            <div key={produit.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="text-5xl mb-4">{produit.icone}</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{produit.nom}</h3>
                <p className="text-gray-600 mb-4">{produit.description}</p>
                
                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Garanties incluses :</h4>
                  <ul className="space-y-1">
                    {produit.details.map((detail, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                        <span className="text-green-500">✓</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-2">Formules disponibles :</h4>
                  <div className="flex flex-wrap gap-2">
                    {produit.options.map((option, index) => (
                      <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
                
                <Link href="/devis">
                  <Button variant="primary" className="w-full">
                    Demander un devis
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Section avantages KARHON */}
        <div className="mt-16 bg-blue-900 text-white rounded-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Pourquoi choisir KARHON ?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="font-semibold">Un interlocuteur unique</p>
              <p className="text-sm text-blue-200">Gestion personnalisée</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🤝</div>
              <p className="font-semibold">Neutre et indépendant</p>
              <p className="text-sm text-blue-200">Dans votre intérêt</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">💰</div>
              <p className="font-semibold">Sans honoraires</p>
              <p className="text-sm text-blue-200">Services gratuits</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">⚡</div>
              <p className="font-semibold">Devis sous 48h</p>
              <p className="text-sm text-blue-200">Réponse rapide</p>
            </div>
          </div>
        </div>

        {/* Section partenaires */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Nos partenaires assureurs</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <span className="text-gray-500">SUNU Assurances</span>
            <span className="text-gray-500">NSIA Assurances</span>
            <span className="text-gray-500">AXA Côte d'Ivoire</span>
            <span className="text-gray-500">Allianz</span>
            <span className="text-gray-500">Colina</span>
          </div>
        </div>
      </div>
    </div>
  );
}
