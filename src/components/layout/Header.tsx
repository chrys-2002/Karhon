"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const EASE_APPLE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [connecte, setConnecte] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [confirmDeco, setConfirmDeco] = useState(false);
  const [nonLues, setNonLues] = useState(0);

  const isHomePage = pathname === "/";

  // Vérifie si l'utilisateur est connecté (cookie de session valide) et son rôle.
  // Le bouton "Mon espace" mène alors directement au bon tableau de bord.
  useEffect(() => {
    let annule = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (annule) return;
        setConnecte(true);
        setRole(data.utilisateur?.role ?? null);
      })
      .catch(() => {
        if (!annule) { setConnecte(false); setRole(null); }
      });
    return () => { annule = true; };
  }, [pathname]);

  // Compteur de notifications non lues : rafraîchi tant que l'utilisateur est
  // connecté, même hors de son espace. Permet d'afficher une pastille dans
  // l'en-tête du site pour qu'il sache qu'il a une notification.
  useEffect(() => {
    if (!connecte) { setNonLues(0); return; }
    let stop = false;
    const charger = () =>
      fetch("/api/notifications")
        .then((r) => (r.ok ? r.json() : { nonLues: 0 }))
        .then((d) => { if (!stop) setNonLues(d.nonLues ?? 0); })
        .catch(() => {});
    charger();
    const t = setInterval(charger, 30000);
    return () => { stop = true; clearInterval(t); };
  }, [connecte, pathname]);

  // Petite pastille rouge (nombre de notifications non lues), posée sur un bouton.
  const Pastille = () =>
    nonLues > 0 ? (
      <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-sm font-extrabold text-white flex items-center justify-center shadow" style={{ background: "#e11d48" }}>
        {nonLues > 9 ? "9+" : nonLues}
      </span>
    ) : null;

  // Destination du bouton selon l'état de connexion et le rôle.
  const espaceHref = !connecte
    ? "/client"
    : ["agent", "gerant", "admin"].includes(role ?? "")
    ? "/admin"
    : "/client/dashboard";

  // Bloque le défilement de la page quand le menu mobile est ouvert.
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMenuOpen]);

  // Détection du scroll — listener PASSIF + garde requestAnimationFrame.
  // Passif → le navigateur n'attend pas un éventuel preventDefault, le scroll
  // reste fluide. rAF → on ne touche au state qu'une fois par frame, au plus.
  useEffect(() => {
    let frame = 0;
    const handleScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setScrolled(window.scrollY > 50);
        frame = 0;
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const handleLinkClick = () => setIsMenuOpen(false);

  // Bouton "Mon espace" : si on est déjà sur la page cible, on remonte en haut
  // (sinon le clic ne ferait rien). Sinon, la navigation normale s'occupe du scroll.
  const onEspaceClick = () => {
    setIsMenuOpen(false);
    if (pathname === espaceHref) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToHome = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push("/");
    setIsMenuOpen(false);
  };

  // Déconnexion : efface le cookie, met à jour l'état et revient à l'accueil.
  const seDeconnecter = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setConnecte(false);
    setRole(null);
    setConfirmDeco(false);
    setIsMenuOpen(false);
    router.push("/");
  };

  const transparent = isHomePage && !scrolled;

  const navLinks = [
    { href: "/produits", label: "Produits" },
    { href: "/devis", label: "Cotation" },
    { href: "/contact", label: "Contact" },
    { href: "/conseiller", label: "Conseiller" },
    { href: "/apropos", label: "À propos" },
    { href: "/partenaires", label: "Partenaires" },
  ];

  return (
    <>
      <header
        className="fixed top-0 w-full z-[100] transition-[background-color,box-shadow] duration-300"
        style={{
          backgroundColor: transparent ? "transparent" : "#ffffff",
          boxShadow: transparent ? "none" : "0 2px 20px rgba(26,46,90,0.12)",
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">

            {/* Logo + Nom de l'entreprise */}
            <button onClick={goToHome} className="group relative z-20 flex items-center gap-3">
              <div className="relative w-11 h-11 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Image
                  src="/images/logo/karhon-couleur.svg"
                  alt="KARHON Assurances"
                  fill
                  sizes="44px"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col items-start leading-none">
                <span
                  className="font-extrabold text-2xl tracking-tight leading-none"
                  style={{ color: transparent ? "#ffffff" : "#1a2e5a" }}
                >
                  KARHON
                </span>
                <span
                  className="text-sm font-semibold uppercase tracking-[0.25em] mt-0.5"
                  style={{ color: "#2a8a8a" }}
                >
                  Assurances
                </span>
              </div>
            </button>

            {/* Menu desktop */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="relative transition-all duration-300 text-base font-semibold group flex flex-col items-center gap-0.5"
                    style={{
                      color: isActive
                        ? "#2a8a8a"
                        : transparent
                        ? "rgba(255,255,255,0.9)"
                        : "#1a2e5a",
                    }}
                  >
                    {item.label}
                    <span
                      className="absolute -bottom-1 left-0 h-0.5 rounded-full transition-all duration-300"
                      style={{
                        width: isActive ? "100%" : "0%",
                        backgroundColor: "#2a8a8a",
                        opacity: isActive ? 1 : 0,
                      }}
                    />
                    {!isActive && (
                      <span
                        className="absolute -bottom-1 left-0 w-0 h-0.5 rounded-full transition-all duration-300 group-hover:w-full"
                        style={{ backgroundColor: "#2a8a8a", opacity: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
              <Link
                href={espaceHref}
                onClick={onEspaceClick}
                aria-label={connecte && nonLues > 0 ? `Mon espace, ${nonLues} notifications non lues` : undefined}
                className="relative px-5 py-2.5 rounded-full text-white font-bold text-base transition-all duration-300 hover:scale-105 hover:shadow-lg"
                style={{
                  background: pathname === "/client"
                    ? "linear-gradient(135deg, #1a2e5a, #2a8a8a)"
                    : "linear-gradient(135deg, #2a8a8a, #1a2e5a)",
                  boxShadow: pathname === "/client" ? "0 0 0 3px rgba(42,138,138,0.3)" : "none",
                }}
              >
                {connecte ? "Mon espace" : "Connexion"}
                {connecte && <Pastille />}
              </Link>
            </div>

            {/* Bouton menu mobile (avec pastille de notifications) */}
            <button
              className="md:hidden relative w-10 h-10 rounded-xl shadow-lg z-20 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={connecte && nonLues > 0 ? `Menu, ${nonLues} notifications non lues` : "Menu"}
            >
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
              {connecte && !isMenuOpen && <Pastille />}
            </button>
          </div>
        </nav>
      </header>

      {/* Menu mobile */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[105] md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_APPLE }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-2xl overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.35, ease: EASE_APPLE }}
                className="p-6 flex justify-between items-center"
              >
                <div
                  className="flex items-center gap-2 rounded-xl pl-2 pr-3 py-1 border"
                  style={{ borderColor: "#e6f0f0" }}
                >
                  <div className="relative w-9 h-9">
                    <Image
                      src="/images/logo/karhon-couleur.svg"
                      alt="KARHON Assurances"
                      fill
                      sizes="36px"
                      className="object-contain"
                    />
                  </div>
                  <div className="flex items-baseline">
                    <div className="font-extrabold text-xl leading-none" style={{ color: "#1a2e5a" }}>KARHON</div>
                    <div className="text-sm ml-1 font-semibold" style={{ color: "#2a8a8a" }}>Assurances</div>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all duration-200 hover:bg-gray-200 hover:rotate-90 active:scale-90"
                >
                  <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>

              <div className="flex flex-col p-4 gap-1">
                {navLinks.map((item, i) => {
                  const isActive = pathname === item.href;
                  return (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.14 + i * 0.045, duration: 0.35, ease: EASE_APPLE }}
                    >
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className="py-3 px-4 rounded-xl text-lg transition-all duration-200 flex items-center justify-between active:scale-[0.97]"
                        style={{
                          backgroundColor: isActive ? "rgba(42,138,138,0.08)" : "transparent",
                          color: isActive ? "#2a8a8a" : "#1a2e5a",
                          fontWeight: isActive ? 700 : 500,
                        }}
                      >
                        {item.label}
                        {isActive && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: "#2a8a8a" }}
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.14 + navLinks.length * 0.045 + 0.05, duration: 0.35, ease: EASE_APPLE }}
                className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100"
              >
                <Link
                  href={espaceHref}
                  className="relative block w-full text-white text-center py-3 rounded-xl text-lg font-bold transition-all duration-200 hover:shadow-lg active:scale-[0.97]"
                  style={{
                    background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)",
                    boxShadow: pathname === "/client" ? "0 0 0 3px rgba(42,138,138,0.3)" : "none",
                  }}
                  onClick={onEspaceClick}
                  aria-label={connecte && nonLues > 0 ? `Mon espace, ${nonLues} notifications non lues` : undefined}
                >
                  {connecte ? "Mon espace" : "Connexion"}
                  {connecte && <Pastille />}
                </Link>

                {connecte && (
                  <button
                    onClick={() => { setIsMenuOpen(false); setConfirmDeco(true); }}
                    className="mt-3 block w-full text-center py-3 rounded-xl text-lg font-bold border transition-all duration-200 active:scale-[0.97]"
                    style={{ color: "#dc2626", borderColor: "#fecaca", backgroundColor: "#ffffff" }}
                  >
                    Se déconnecter
                  </button>
                )}
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modale : confirmation de déconnexion */}
      <AnimatePresence>
        {confirmDeco && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.5)" }}
            onClick={() => setConfirmDeco(false)}
          >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: EASE_APPLE }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "#fee2e2" }}>
              <svg className="w-6 h-6" fill="none" stroke="#dc2626" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <h3 className="text-xl font-extrabold mb-1" style={{ color: "#1a2e5a" }}>Se déconnecter ?</h3>
            <p className="text-base text-gray-700 mb-6">Vous allez quitter votre session et revenir à l&apos;accueil.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeco(false)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-base border transition-all hover:bg-gray-50 active:scale-95"
                style={{ color: "#1a2e5a", borderColor: "#e0ecec" }}
              >
                Annuler
              </button>
              <button
                onClick={seDeconnecter}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-base text-white transition-all hover:shadow-lg active:scale-95"
                style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
              >
                Se déconnecter
              </button>
            </div>
          </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}