"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AproposPage() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const valeurs = [
    { titre: "Neutralité", description: "Indépendant de toute compagnie. Nous défendons uniquement vos intérêts.", icone: "⚖️" },
    { titre: "Confidentialité", description: "Totale confidentialité de vos informations personnelles garantie.", icone: "🔒" },
    { titre: "Personnalisation", description: "Solutions sur-mesure adaptées à votre situation spécifique.", icone: "🎯" },
    { titre: "Réactivité", description: "Contact direct avec toutes les compagnies pour un traitement rapide.", icone: "⚡" },
    { titre: "Gratuité", description: "Nos services sont entièrement financés par les compagnies partenaires.", icone: "💰" },
    { titre: "Excellence", description: "Accès aux meilleures compagnies du marché ivoirien.", icone: "🏆" }
  ];

  const missions = [
    "Rechercher les produits adaptés à chaque client",
    "Établir des offres personnalisées",
    "Gérer les dossiers administratifs",
    "Accompagner lors des sinistres",
    "Conseiller et orienter sur les meilleurs produits"
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Titre */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Qui sommes-nous ?</h1>
          <div className="w-16 h-1 bg-orange-500 mx-auto"></div>
        </div>

        {/* Notre Cabinet */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <div className="inline-block bg-orange-100 px-3 py-1 rounded-full mb-3">
                <span className="text-sm text-orange-600 font-medium">Fondé en 2020</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Notre Cabinet</h2>
              <p className="text-gray-600 leading-relaxed">
                KARHON Assurances place son expertise, son expérience et sa compétence au service de ses clients. 
                Nous proposons un service personnalisé dans tous les domaines d'assurances avec les meilleures 
                compagnies du marché ivoirien.
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl p-5 text-center min-w-[200px]">
              <div className="text-4xl mb-2">🏢</div>
              <p className="font-semibold text-gray-800">Cabinet de Courtage</p>
              <p className="text-gray-500 text-sm">Arrêté n°0305/MEF/DGTCP/DA</p>
              <p className="text-orange-500 text-sm">02 Septembre 2021</p>
            </div>
          </div>
        </div>

        {/* Notre Mission */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Notre Mission</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {missions.map((mission, i) => (
              <div key={i} className="bg-white rounded-xl p-4 text-center shadow-sm">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-orange-600 font-bold text-sm">{i + 1}</span>
                </div>
                <p className="text-gray-700 text-sm">{mission}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nos Valeurs */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Nos Valeurs</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {valeurs.map((v, i) => (
              <div key={i} className="bg-white rounded-xl p-5 text-center shadow-sm">
                <div className="text-3xl mb-2">{v.icone}</div>
                <h3 className="font-bold text-gray-800 mb-2">{v.titre}</h3>
                <p className="text-gray-500 text-sm">{v.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Client */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl p-6 text-center text-white">
          <h2 className="text-xl font-bold mb-3">Notre Engagement Client</h2>
          <p className="text-blue-100 mb-4">Votre protection, notre priorité.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">✓ Un interlocuteur unique</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">✓ Devis sous 48h</span>
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm">✓ Accompagnement sinistre</span>
          </div>
        </div>

      </div>
    </div>
  );
}
