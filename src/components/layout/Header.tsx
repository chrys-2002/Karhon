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
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "bg-blue-900/80 backdrop-blur-xl shadow-2xl" : "bg-transparent"
      }`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo original */}
            <button 
              onClick={goToHome}
              className="group relative z-20 flex items-center gap-2"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <span className="text-white font-bold text-xl tracking-tight">
                  ARHON
                </span>
                <span className="text-orange-400 text-sm ml-1 font-medium">
                  Assurances
                </span>
              </div>
            </button>
            
            {/* Menu desktop */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={goToHome} className="relative text-white/80 hover:text-white transition-all duration-300 text-sm font-medium group">
                Accueil
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <Link href="/produits" className="relative text-white/80 hover:text-white transition-all duration-300 text-sm font-medium group">
                Produits
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/devis" className="relative text-white/80 hover:text-white transition-all duration-300 text-sm font-medium group">
                Devis
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link href="/contact" className="relative text-white/80 hover:text-white transition-all duration-300 text-sm font-medium group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/client" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-5 py-2.5 rounded-full text-white font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                Espace Client
              </Link>
            </div>
            
            {/* Bouton menu mobile */}
            <button 
              className="md:hidden relative w-10 h-10 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg z-20 transition-all duration-300 hover:scale-105 active:scale-95"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <svg 
                  className={`w-5 h-5 text-white transition-all duration-300 ${isMenuOpen ? "opacity-0 rotate-90" : "opacity-100 rotate-0"}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg 
                  className={`absolute w-5 h-5 text-white transition-all duration-300 ${isMenuOpen ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </button>
          </div>
        </nav>
      </header>
      
      {/* Menu mobile */}
      <div 
        className={`fixed inset-0 z-40 transition-all duration-500 ease-out ${
          isMenuOpen ? "visible" : "invisible"
        }`}
      >
        <div 
          className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${
            isMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        
        <div 
          className={`absolute top-0 right-0 h-full w-80 bg-white shadow-2xl transition-all duration-500 ease-out ${
            isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-blue-900 font-bold text-xl">KARHON</div>
                <div className="text-orange-500 text-sm">Assurances</div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col p-4 gap-2">
            <button 
              onClick={goToHome}
              className="group flex items-center justify-between px-4 py-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all duration-300"
            >
              <span className="font-medium">Accueil</span>
            </button>
            
            <Link 
              href="/produits" 
              className="group flex items-center justify-between px-4 py-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all duration-300"
              onClick={handleLinkClick}
            >
              <span className="font-medium">Produits</span>
            </Link>
            
            <Link 
              href="/devis" 
              className="group flex items-center justify-between px-4 py-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all duration-300"
              onClick={handleLinkClick}
            >
              <span className="font-medium">Devis</span>
            </Link>
            
            <Link 
              href="/contact" 
              className="group flex items-center justify-between px-4 py-3 text-gray-700 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all duration-300"
              onClick={handleLinkClick}
            >
              <span className="font-medium">Contact</span>
            </Link>
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100 bg-white">
            <Link 
              href="/client" 
              className="block w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-center py-3.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              onClick={handleLinkClick}
            >
              Espace Client
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
