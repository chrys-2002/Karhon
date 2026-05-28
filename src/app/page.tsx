"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const produitsIARD = [
    { nom: "Assurance Auto", description: "Particulier, flotte et deux roues", icone: "🚗", color: "from-[#1e4a7a] to-[#2a8a8a]" },
    { nom: "Assurance Habitation", description: "Appartement, immeuble, villa", icone: "🏠", color: "from-[#2a8a8a] to-[#1a6a6a]" },
    { nom: "Assurance Santé", description: "Individuelle et famille", icone: "🏥", color: "from-[#1a2e5a] to-[#1e4a7a]" },
    { nom: "Assurance Voyage", description: "Multirisques personnalisée", icone: "✈️", color: "from-[#2a8a8a] to-[#1a2e5a]" },
  ];
  
  const produitsVIE = [
    { nom: "Assurance Retraite", description: "Préparez votre avenir", icone: "👴", color: "from-[#1e4a7a] to-[#2a8a8a]" },
    { nom: "Assurance Études", description: "Épargne pour les études", icone: "📚", color: "from-[#2a8a8a] to-[#1a6a6a]" },
    { nom: "Assurance Emprunteur", description: "Protection de prêt bancaire", icone: "🏦", color: "from-[#1a2e5a] to-[#1e4a7a]" },
    { nom: "Assurance Obsèques", description: "Prévoyance funéraire", icone: "🕊️", color: "from-[#2a8a8a] to-[#1a2e5a]" },
  ];
  
  const stats = [
    { value: "50+", label: "Partenaires", icone: "🤝" },
    { value: "1000+", label: "Clients", icone: "⭐" },
    { value: "48h", label: "Devis express", icone: "⚡" },
    { value: "100%", label: "Sans honoraires", icone: "💰" },
  ];
  
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <div className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-16 sm:pt-0"
        style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #1e4a7a 50%, #2a8a8a 100%)" }}>
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
              <Link href="/devis"
                className="px-6 py-3 rounded-full font-semibold text-white text-center transition-all duration-300 hover:scale-105 active:scale-95"
                style={{ background: "linear-gradient(135deg, #2a8a8a, #1e4a7a)" }}>
                Demander un devis gratuit
              </Link>
              <Link href="/contact"
                className="px-6 py-3 rounded-full font-semibold text-white text-center transition-all duration-300 hover:scale-105 active:scale-95 border-2"
                style={{ borderColor: "#2a8a8a" }}>
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
              <div key={index}
                className={`rounded-2xl p-4 sm:p-5 text-center transition-all duration-300 hover:shadow-xl active:scale-95 cursor-pointer border ${loaded ? "animate-scaleIn" : "opacity-0"}`}
                style={{ borderColor: "#e0ecec", animationDelay: `${index * 0.1}s` }}>
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
              <div key={index}
                className={`transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${loaded ? "animate-scaleIn" : "opacity-0"}`}
                style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`bg-gradient-to-br ${produit.color} p-5 rounded-xl shadow-md`}>
                  <div className="text-4xl sm:text-5xl mb-3">{produit.icone}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{produit.nom}</h3>
                  <p className="text-white/80 text-sm mb-3">{produit.description}</p>
                  <Link href="/devis" className="inline-block bg-white/20 px-3 py-1.5 rounded-full text-white text-xs hover:bg-white/30 transition-all">
                    Demander un devis
                  </Link>
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
              <div key={index}
                className={`transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${loaded ? "animate-scaleIn" : "opacity-0"}`}
                style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`bg-gradient-to-br ${produit.color} p-5 rounded-xl shadow-md`}>
                  <div className="text-4xl sm:text-5xl mb-3">{produit.icone}</div>
                  <h3 className="text-lg font-bold text-white mb-1">{produit.nom}</h3>
                  <p className="text-white/80 text-sm mb-3">{produit.description}</p>
                  <Link href="/devis" className="inline-block bg-white/20 px-3 py-1.5 rounded-full text-white text-xs hover:bg-white/30 transition-all">
                    Demander un devis
                  </Link>
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
              <div key={i}
                className="bg-white/10 backdrop-blur-md rounded-xl p-5 sm:p-6 text-center border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
                style={{ borderColor: "rgba(42,138,138,0.3)" }}>
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
          <Link href="/devis"
            className="inline-block px-8 py-3 rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #2a8a8a, #1e4a7a)" }}>
            Commencer maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}