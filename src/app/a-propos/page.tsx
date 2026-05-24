"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const valeurs = [
    { 
      titre: "Neutralité", 
      description: "Indépendant de toute compagnie. Nous défendons uniquement vos intérêts.",
      icone: "??",
      couleur: "from-blue-500 to-blue-600"
    },
    { 
      titre: "Confidentialité", 
      description: "Totale confidentialité de vos informations personnelles garantie.",
      icone: "??",
      couleur: "from-purple-500 to-purple-600"
    },
    { 
      titre: "Personnalisation", 
      description: "Solutions sur-mesure adaptées à votre situation spécifique.",
      icone: "??",
      couleur: "from-orange-500 to-orange-600"
    },
    { 
      titre: "Réactivité", 
      description: "Contact direct avec toutes les compagnies pour un traitement rapide.",
      icone: "?",
      couleur: "from-yellow-500 to-yellow-600"
    },
    { 
      titre: "Gratuité", 
      description: "Nos services sont entièrement financés par les compagnies partenaires.",
      icone: "??",
      couleur: "from-emerald-500 to-emerald-600"
    },
    { 
      titre: "Excellence", 
      description: "Accès aux meilleures compagnies du marché ivoirien.",
      icone: "??",
      couleur: "from-rose-500 to-rose-600"
    }
  ];

  const missions = [
    { titre: "Rechercher", description: "Les produits adaptés à chaque client" },
    { titre: "Établir", description: "Des offres personnalisées" },
    { titre: "Gérer", description: "Les dossiers administratifs" },
    { titre: "Accompagner", description: "Lors des sinistres" },
    { titre: "Conseiller", description: "Et orienter sur les meilleurs produits" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Hero Section */}
        <motion.div 
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeUp}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Qui sommes-nous ?</h1>
          <div className="w-20 h-1 bg-orange-500 mx-auto mb-6"></div>
        </motion.div>

        {/* Présentation du cabinet */}
        <motion.div 
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="inline-block px-4 py-1.5 bg-orange-100 rounded-full mb-4">
                <span className="text-sm font-medium text-orange-600">Fondé en 2020</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Notre Cabinet</h2>
              <p className="text-gray-600 leading-relaxed">
                KARHON Assurances place son expertise, son expérience et sa compétence au service de ses clients. 
                Nous proposons un service personnalisé dans tous les domaines d'assurances avec les meilleures 
                compagnies du marché ivoirien.
              </p>
            </div>
            <div className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
              <div className="text-5xl mb-3">??</div>
              <p className="text-orange-800 font-semibold">Cabinet de Courtage en Assurances</p>
              <p className="text-orange-600 text-sm mt-2">Arrêté n°0305/MEF/DGTCP/DA</p>
              <p className="text-orange-500 text-sm">02 Septembre 2021</p>
            </div>
          </div>
        </motion.div>

        {/* Notre Mission */}
        <motion.div 
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Notre Mission</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {missions.map((mission, index) => (
              <div key={index} className="bg-white rounded-xl p-5 text-center shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-orange-500 text-lg font-bold">{index + 1}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-1">{mission.titre}</h3>
                <p className="text-gray-500 text-sm">{mission.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Nos Valeurs */}
        <motion.div 
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeUp}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">Nos Valeurs & Engagements</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {valeurs.map((valeur, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className={`w-14 h-14 bg-gradient-to-r ${valeur.couleur} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{valeur.icone}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{valeur.titre}</h3>
                <p className="text-gray-500 text-sm">{valeur.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notre Engagement Client */}
        <motion.div 
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeUp}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-2xl p-8 text-white text-center mb-8"
        >
          <h2 className="text-2xl font-bold mb-4">Notre Engagement Client</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Nous nous engageons à placer vos intérêts au cœur de notre action, 
            avec transparence, réactivité et professionnalisme.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">? Un interlocuteur unique</div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">? Devis gratuit sous 48h</div>
            <div className="bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-sm">? Accompagnement sinistre</div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div 
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={fadeUp}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Link href="/contact">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105">
              Contactez-nous
            </button>
          </Link>
        </motion.div>

      </div>
    </div>
  );
}

