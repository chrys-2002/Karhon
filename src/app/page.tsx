"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const produitsIARD = [
    { id: "auto", nom: "Assurance Auto", description: "Particulier, flotte et deux roues", icone: "🚗", color: "from-blue-500 to-cyan-500" },
    { id: "habitation", nom: "Assurance Habitation", description: "Appartement, immeuble, villa", icone: "🏠", color: "from-emerald-500 to-teal-500" },
    { id: "sante", nom: "Assurance Santé", description: "Individuelle et famille", icone: "🏥", color: "from-red-500 to-pink-500" },
    { id: "voyage", nom: "Assurance Voyage", description: "Multirisques personnalisée", icone: "✈️", color: "from-purple-500 to-indigo-500" },
  ];
  
  const produitsVIE = [
    { id: "retraite", nom: "Assurance Retraite", description: "Préparez votre avenir", icone: "👴", color: "from-orange-500 to-yellow-500" },
    { id: "etudes", nom: "Assurance Études", description: "Épargne pour les études", icone: "📚", color: "from-green-500 to-lime-500" },
    { id: "emprunteur", nom: "Assurance Emprunteur", description: "Protection de prêt bancaire", icone: "🏦", color: "from-indigo-500 to-blue-500" },
    { id: "obseques", nom: "Assurance Obsèques", description: "Prévoyance funéraire", icone: "🕊️", color: "from-gray-500 to-slate-500" },
  ];
  
  const stats = [
    { value: "50+", label: "Partenaires", icone: "🤝" },
    { value: "1000+", label: "Clients", icone: "⭐" },
    { value: "48h", label: "Devis express", icone: "⚡" },
    { value: "100%", label: "Sans honoraires", icone: "💰" }
  ];
  
  // Gestionnaire tactile pour les cartes
  const handleCardTouch = (cardId: string) => {
    setActiveCard(cardId);
    setTimeout(() => setActiveCard(null), 300);
  };
  
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center hero-gradient overflow-hidden pt-16">
        <div className="absolute inset-0 hero-particles"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className={`transition-all duration-700 ${loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}>
            <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-4 sm:mb-6 tracking-tight">
              KARHON <span className="text-orange-400">Assurances</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 mb-3 sm:mb-4 px-4 font-medium">
              Votre courtier en assurances à Abidjan
            </p>
            <p className="text-sm sm:text-base md:text-lg text-blue-200 mb-8 sm:mb-10 md:mb-12 max-w-2xl mx-auto px-4 leading-relaxed">
              Neutre et indépendant, nous travaillons dans votre intérêt 
              pour vous trouver les meilleures garanties aux meilleurs prix.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
              <Link href="/devis" className="btn-primary px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-semibold text-white text-center text-sm sm:text-base inline-block transition-all duration-300 hover:scale-105 active:scale-95">
                Demander un devis gratuit
              </Link>
              <Link href="/contact" className="btn-outline px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 rounded-full font-semibold text-white text-center text-sm sm:text-base inline-block transition-all duration-300 hover:scale-105 active:scale-95">
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-5 sm:bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
      
      {/* Stats Section */}
      <div className="py-10 sm:py-12 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className={`glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-7 text-center transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-2 active:scale-95 ${
                  loaded ? 'animate-scaleIn' : 'opacity-0'
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3">{stat.icone}</div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Section IARD - avec interactions tactiles */}
      <div className="py-14 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-900 to-blue-600 bg-clip-text text-transparent mb-3 sm:mb-4">
              Assurances IARD
            </h2>
            <p className="text-base sm:text-lg text-gray-600">Incendie, Accidents, Risques Divers</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7">
            {produitsIARD.map((produit, index) => (
              <div 
                key={produit.id}
                onClick={() => handleCardTouch(produit.id)}
                onTouchStart={() => handleCardTouch(produit.id)}
                className={`card-3d cursor-pointer transition-all duration-300 ${
                  activeCard === produit.id ? 'scale-95' : ''
                }`}
              >
                <div className={`bg-gradient-to-br ${produit.color} p-5 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 active:scale-95 ${
                  loaded ? 'animate-scaleIn' : 'opacity-0'
                } ${activeCard === produit.id ? 'scale-95' : ''}`} 
                style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transition-transform duration-300 hover:scale-110">{produit.icone}</div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">{produit.nom}</h3>
                  <p className="text-white/95 text-sm sm:text-base mb-4 sm:mb-5 leading-relaxed">{produit.description}</p>
                  <Link 
                    href="/devis" 
                    className="inline-block glass px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-white text-sm sm:text-base font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Demander un devis
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Section VIE - avec interactions tactiles */}
      <div className="py-14 sm:py-16 md:py-20 bg-gradient-to-br from-gray-100 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent mb-3 sm:mb-4">
              Assurances Vie
            </h2>
            <p className="text-base sm:text-lg text-gray-600">Préparez et protégez votre avenir</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-7">
            {produitsVIE.map((produit, index) => (
              <div 
                key={produit.id}
                onClick={() => handleCardTouch(produit.id)}
                onTouchStart={() => handleCardTouch(produit.id)}
                className={`card-3d cursor-pointer transition-all duration-300 ${
                  activeCard === produit.id ? 'scale-95' : ''
                }`}
              >
                <div className={`bg-gradient-to-br ${produit.color} p-5 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 active:scale-95 ${
                  loaded ? 'animate-scaleIn' : 'opacity-0'
                } ${activeCard === produit.id ? 'scale-95' : ''}`} 
                style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 transition-transform duration-300 hover:scale-110">{produit.icone}</div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2">{produit.nom}</h3>
                  <p className="text-white/95 text-sm sm:text-base mb-4 sm:mb-5 leading-relaxed">{produit.description}</p>
                  <Link 
                    href="/devis" 
                    className="inline-block glass px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-white text-sm sm:text-base font-medium transition-all duration-300 hover:bg-white/30 hover:scale-105 active:scale-95"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Demander un devis
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Section Pourquoi choisir KARHON */}
      <div className="py-14 sm:py-16 md:py-20 bg-gradient-to-br from-blue-900 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 hero-particles opacity-20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-white mb-10 sm:mb-12 md:mb-14">
            Pourquoi choisir KARHON ?
          </h2>
          <div className="grid md:grid-cols-3 gap-6 sm:gap-7 md:gap-8">
            {[
              { id: "unique", icone: "🎯", title: "Un interlocuteur unique", desc: "Gestion personnalisée de vos dossiers" },
              { id: "neutre", icone: "🤝", title: "Neutre et indépendant", desc: "Nous travaillons dans votre intérêt" },
              { id: "honoraires", icone: "💰", title: "Sans honoraires", desc: "Services pris en charge par les compagnies" }
            ].map((item, index) => (
              <div 
                key={item.id}
                onClick={() => handleCardTouch(item.id)}
                onTouchStart={() => handleCardTouch(item.id)}
                className={`bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-6 sm:p-7 md:p-8 text-center border border-white/20 transition-all duration-300 cursor-pointer hover:bg-white/20 hover:scale-105 hover:-translate-y-2 active:scale-95 ${
                  activeCard === item.id ? 'scale-95' : ''
                }`}
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className="text-5xl sm:text-6xl md:text-7xl mb-4 transition-transform duration-300 hover:scale-110">{item.icone}</div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-gray-200 text-sm sm:text-base leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-12 sm:py-14 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
            Prêt à protéger ce qui compte pour vous ?
          </h2>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-7 md:mb-8">
            Obtenez votre devis gratuit en quelques minutes
          </p>
          <Link href="/devis" className="btn-primary px-8 sm:px-10 md:px-12 py-3 sm:py-3.5 md:py-4 rounded-full font-semibold text-white inline-block text-sm sm:text-base transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95">
            Commencer maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}
