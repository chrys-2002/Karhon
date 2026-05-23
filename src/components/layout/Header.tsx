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
            {/* Logo */}
            <button onClick={goToHome} className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <span className="text-white font-bold text-xl">ARHON</span>
                <span className="text-orange-400 text-sm ml-1">Assurances</span>
              </div>
            </button>
            
            {/* Menu desktop */}
            <div className="hidden md:flex items-center gap-8">
              <button onClick={goToHome} className="text-white/80 hover:text-white text-sm">Accueil</button>
              <Link href="/produits" className="text-white/80 hover:text-white text-sm">Produits</Link>
              <Link href="/devis" className="text-white/80 hover:text-white text-sm">Devis</Link>
              <Link href="/contact" className="text-white/80 hover:text-white text-sm">Contact</Link>
              <Link href="/client" className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-full text-white text-sm">Espace Client</Link>
            </div>
            
            {/* Bouton menu mobile - le plus simple possible */}
            <button 
              className="md:hidden w-10 h-10 rounded-xl bg-orange-500 text-white text-2xl font-bold flex items-center justify-center"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              ☰
            </button>
          </div>
        </nav>
      </header>
      
      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl">
            <div className="p-5 border-b flex justify-between items-center">
              <div><span className="text-blue-900 font-bold">KARHON</span><span className="text-orange-500 text-sm ml-1">Assurances</span></div>
              <button onClick={() => setIsMenuOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600">✕</button>
            </div>
            <div className="flex flex-col p-4">
              <button onClick={goToHome} className="py-3 px-4 text-gray-700 hover:bg-orange-50 rounded-lg text-left">Accueil</button>
              <Link href="/produits" className="py-3 px-4 text-gray-700 hover:bg-orange-50 rounded-lg" onClick={handleLinkClick}>Produits</Link>
              <Link href="/devis" className="py-3 px-4 text-gray-700 hover:bg-orange-50 rounded-lg" onClick={handleLinkClick}>Devis</Link>
              <Link href="/contact" className="py-3 px-4 text-gray-700 hover:bg-orange-50 rounded-lg" onClick={handleLinkClick}>Contact</Link>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 border-t">
              <Link href="/client" className="block w-full bg-orange-500 text-white text-center py-3 rounded-lg" onClick={handleLinkClick}>Espace Client</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
