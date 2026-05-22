"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const produitsIARD = [
    { nom: "Assurance Auto", description: "Particulier, flotte et deux roues", icone: "🚗", color: "from-blue-500 to-cyan-500" },
    { nom: "Assurance Habitation", description: "Appartement, immeuble, villa", icone: "🏠", color: "from-emerald-500 to-teal-500" },
    { nom: "Assurance Santé", description: "Individuelle et famille", icone: "🏥", color: "from-red-500 to-pink-500" },
    { nom: "Assurance Voyage", description: "Multirisques personnalisée", icone: "✈️", color: "from-purple-500 to-indigo-500" },
  ];
  
  const produitsVIE = [
    { nom: "Assurance Retraite", description: "Préparez votre avenir", icone: "👴", color: "from-orange-500 to-yellow-500" },
    { nom: "Assurance Études", description: "Épargne pour les études", icone: "📚", color: "from-green-500 to-lime-500" },
    { nom: "Assurance Emprunteur", description: "Protection de prêt bancaire", icone: "🏦", color: "from-indigo-500 to-blue-500" },
    { nom: "Assurance Obsèques", description: "Prévoyance funéraire", icone: "🕊️", color: "from-gray-500 to-slate-500" },
  ];
  
  const stats = [
    { value: "50+", label: "Partenaires", icone: "🤝" },
    { value: "1000+", label: "Clients", icone: "⭐" },
    { value: "48h", label: "Devis express", icone: "⚡" },
    { value: "100%", label: "Sans honoraires", icone: "💰" }
  ];
  
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center hero-gradient overflow-hidden pt-16 sm:pt-0">
        <div className="absolute inset-0 hero-particles"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-700 ${loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <div className="animate-float">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 px-2">
                KARHON <span className="text-orange-400">Assurances</span>
              </h1>
            </div>
            <p className="text-base xs:text-lg sm:text-xl md:text-2xl text-blue-100 mb-2 sm:mb-3 md:mb-4 px-4 animate-slideRight">
              Votre courtier en assurances à Abidjan
            </p>
            <p className="text-xs xs:text-sm sm:text-base text-blue-200 mb-6 sm:mb-8 md:mb-10 max-w-2xl mx-auto px-4 animate-slideUp leading-relaxed" style={{animationDelay: "0.2s"}}>
              Neutre et indépendant, nous travaillons dans votre intérêt.
            </p>
            <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center px-4 animate-scaleIn" style={{animationDelay: "0.4s"}}>
              <Link href="/devis" className="btn-primary px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-white text-center text-sm xs:text-base active:scale-95 transition-transform">Demander un devis gratuit</Link>
              <Link href="/contact" className="btn-outline px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-full font-semibold text-white text-center text-sm xs:text-base active:scale-95 transition-transform">Nous contacter</Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-5 sm:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      
      {/* Stats Section - interactions tactiles */}
      <div className="py-8 sm:py-10 md:py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`glass-card rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-center transition-all duration-300 hover:shadow-xl active:scale-95 cursor-pointer ${loaded ? 'animate-scaleIn' : 'opacity-0'}`} 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl mb-1 sm:mb-2">{stat.icone}</div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{stat.value}</div>
                <div className="text-xs sm:text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Section IARD - cartes avec interactions tactiles */}
      <div className="py-12 sm:py-14 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 animate-slideUp">Assurances IARD</h2>
            <p className="text-sm sm:text-base text-gray-500 animate-slideUp" style={{animationDelay: "0.1s"}}>Incendie, Accidents, Risques Divers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {produitsIARD.map((produit, index) => (
              <div 
                key={index} 
                className={`card-3d transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${loaded ? 'animate-scaleIn' : 'opacity-0'}`} 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`bg-gradient-to-br ${produit.color} p-4 sm:p-5 rounded-xl shadow-md transition-all duration-300`}>
                  <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 animate-float">{produit.icone}</div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1">{produit.nom}</h3>
                  <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">{produit.description}</p>
                  <Link href="/devis" className="inline-block bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-white text-xs hover:bg-white/30 transition-all active:scale-95">Demander un devis</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Section VIE - cartes avec interactions tactiles */}
      <div className="py-12 sm:py-14 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 animate-slideUp">Assurances Vie</h2>
            <p className="text-sm sm:text-base text-gray-500 animate-slideUp" style={{animationDelay: "0.1s"}}>Préparez et protégez votre avenir</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {produitsVIE.map((produit, index) => (
              <div 
                key={index} 
                className={`card-3d transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${loaded ? 'animate-scaleIn' : 'opacity-0'}`} 
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`bg-gradient-to-br ${produit.color} p-4 sm:p-5 rounded-xl shadow-md transition-all duration-300`}>
                  <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 animate-float">{produit.icone}</div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1">{produit.nom}</h3>
                  <p className="text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">{produit.description}</p>
                  <Link href="/devis" className="inline-block bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-white text-xs hover:bg-white/30 transition-all active:scale-95">Demander un devis</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Section Pourquoi choisir KARHON - cartes interactives */}
      <div className="py-12 sm:py-14 md:py-16 bg-gradient-to-r from-blue-900 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center text-white mb-6 sm:mb-8 md:mb-10 animate-slideUp">Pourquoi choisir KARHON ?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            {[
              { icone: "🎯", title: "Un interlocuteur unique", desc: "Gestion personnalisée de vos dossiers" },
              { icone: "🤝", title: "Neutre et indépendant", desc: "Nous travaillons dans votre intérêt" },
              { icone: "💰", title: "Sans honoraires", desc: "Services pris en charge par les compagnies" }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-5 md:p-6 text-center border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${loaded ? 'animate-scaleIn' : 'opacity-0'}`} 
                style={{animationDelay: `${0.3 + i * 0.1}s`}}
              >
                <div className="text-4xl sm:text-5xl md:text-6xl mb-2 sm:mb-3 animate-float">{item.icone}</div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-1 sm:mb-2">{item.title}</h3>
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section - bouton avec feedback tactile */}
      <div className="py-10 sm:py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2 sm:mb-3 animate-slideUp">Prêt à protéger ce qui compte pour vous ?</h2>
          <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-5 md:mb-6 animate-slideUp" style={{animationDelay: "0.1s"}}>Obtenez votre devis gratuit en quelques minutes</p>
          <Link 
            href="/devis" 
            className="inline-block btn-primary px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 rounded-full font-semibold text-white text-sm sm:text-base transition-all duration-300 hover:scale-105 active:scale-95 animate-scaleIn" 
            style={{animationDelay: "0.2s"}}
          >
            Commencer maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}
