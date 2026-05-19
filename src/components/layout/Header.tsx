"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);
  
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };
  
  const goToHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/");
    setIsMenuOpen(false);
  };
  
  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "navbar-glass shadow-lg" : "bg-transparent"
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <button onClick={goToHome} className="text-base sm:text-xl md:text-2xl font-bold z-20 hover:opacity-80 transition-opacity cursor-pointer bg-transparent border-none">
              <span className="bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent">KARHON</span>
              <span className="bg-gradient-to-r from-white to-orange-300 bg-clip-text text-transparent ml-1">Assurances</span>
            </button>
            
            <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <button onClick={goToHome} className="text-white/90 hover:text-white transition-colors text-sm lg:text-base">Accueil</button>
              <Link href="/produits" className="text-white/90 hover:text-white transition-colors text-sm lg:text-base">Produits</Link>
              <Link href="/devis" className="text-white/90 hover:text-white transition-colors text-sm lg:text-base">Devis</Link>
              <Link href="/contact" className="text-white/90 hover:text-white transition-colors text-sm lg:text-base">Contact</Link>
              <Link href="/client" className="btn-primary px-4 py-2 rounded-full text-white font-semibold text-sm">Espace Client</Link>
            </div>
            
            {/* Bouton menu mobile */}
            <button 
              className="md:hidden text-white p-2 rounded-lg glass z-20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              {!isMenuOpen && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>
      
      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <button onClick={goToHome} className="text-left">
                <div className="text-blue-900 font-bold text-xl">KARHON</div>
                <div className="text-orange-500 text-sm">Assurances</div>
              </button>
              <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-col p-4">
              <button onClick={() => { goToHome(); setIsMenuOpen(false); }} className="text-left py-4 px-4 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl">Accueil</button>
              <Link href="/produits" onClick={handleLinkClick} className="py-4 px-4 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl">Produits</Link>
              <Link href="/devis" onClick={handleLinkClick} className="py-4 px-4 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl">Devis</Link>
              <Link href="/contact" onClick={handleLinkClick} className="py-4 px-4 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl">Contact</Link>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
              <Link href="/client" onClick={handleLinkClick} className="btn-primary w-full py-3 rounded-xl text-white font-semibold text-center block">Espace Client</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
