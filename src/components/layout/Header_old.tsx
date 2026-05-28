"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const isHomePage = pathname === "/";
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
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
  
  const handleLinkClick = () => setIsMenuOpen(false);
  
  const goToHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/");
    setIsMenuOpen(false);
  };

  const transparent = isHomePage && !scrolled;
  
  return (
    <>
      <header
        className={`fixed top-0 w-full z-[100] transition-all duration-500 ${transparent ? "" : "backdrop-blur-md shadow-lg"}`}
        style={{ backgroundColor: transparent ? "transparent" : "#1a2e5a" }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">

            {/* Logo */}
            <button onClick={goToHome} className="group relative z-20 flex items-center gap-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:rotate-6"
                style={{ background: "linear-gradient(135deg, #2a8a8a, #1e4a7a)" }}
              >
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div>
                <span className="text-white font-bold text-xl tracking-tight">ARHON</span>
                <span className="text-sm ml-1 font-medium" style={{ color: "#2a8a8a" }}>Assurances</span>
              </div>
            </button>
            
            {/* Menu desktop */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { href: "/produits", label: "Produits" },
                { href: "/devis", label: "Devis" },
                { href: "/contact", label: "Contact" },
                { href: "/apropos", label: "À propos" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative transition-all duration-300 text-sm font-medium group text-white/90 hover:text-white"
                >
                  {item.label}
                  <span
                    className="absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full"
                    style={{ backgroundColor: "#2a8a8a" }}
                  />
                </Link>
              ))}
              <Link
                href="/client"
                className="px-5 py-2.5 rounded-full text-white font-semibold text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #2a8a8a, #1e4a7a)" }}
              >
                Espace Client
              </Link>
            </div>
            
            {/* Bouton menu mobile */}
            <button
              className="md:hidden relative w-10 h-10 rounded-xl shadow-lg z-20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2a8a8a, #1e4a7a)" }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menu"
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

          </div>
        </nav>
      </header>
      
      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[105] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <div className="font-bold text-xl" style={{ color: "#1a2e5a" }}>KARHON</div>
                <div className="text-sm" style={{ color: "#2a8a8a" }}>Assurances</div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col p-4">
              {[
                { href: "/produits", label: "Produits" },
                { href: "/devis", label: "Devis" },
                { href: "/contact", label: "Contact" },
                { href: "/apropos", label: "À propos" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="py-3 px-4 rounded-xl transition-colors text-gray-700 hover:bg-gray-50"
                  style={{ color: "#1a2e5a" }}
                  onClick={handleLinkClick}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
              <Link
                href="/client"
                className="block w-full text-white text-center py-3 rounded-xl font-semibold"
                style={{ background: "linear-gradient(135deg, #2a8a8a, #1e4a7a)" }}
                onClick={handleLinkClick}
              >
                Espace Client
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}