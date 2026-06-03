"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Car, Home, HeartPulse, ShieldAlert, Plane, Scale, Truck, Store, Users, Anchor, TrendingUp, GraduationCap, Landmark, Briefcase, Flower2, X, Navigation, ExternalLink, Clock, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const produitsParticuliers = [
  { label: "Assurance Automobile", Icon: Car },
  { label: "Assurance Habitation", Icon: Home },
  { label: "Santé Individuelle", Icon: HeartPulse },
  { label: "Assurance Accident", Icon: ShieldAlert },
  { label: "Assurance Voyage", Icon: Plane },
  { label: "Responsabilité Civile", Icon: Scale },
];

const produitsPro = [
  { label: "Automobile Flotte", Icon: Truck },
  { label: "Multirisque Pro", Icon: Store },
  { label: "Santé Groupe", Icon: Users },
  { label: "Accident Groupe", Icon: ShieldAlert },
  { label: "RC Professionnelle", Icon: Scale },
  { label: "Assurance Maritime", Icon: Anchor },
];

const produitsVie = [
  { label: "Assurance Retraite", Icon: TrendingUp },
  { label: "Assurance Étude Plus", Icon: GraduationCap },
  { label: "Vie Emprunteur", Icon: Landmark },
  { label: "Retraite Groupe", Icon: Briefcase },
  { label: "Assistance Funéraire", Icon: Flower2 },
];

const liens = [
  { href: "/", label: "Accueil" },
  { href: "/produits", label: "Nos produits" },
  { href: "/devis", label: "Demander un devis" },
  { href: "/apropos", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/client", label: "Espace Client" },
];

function ProduitLink({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <li>
      <Link href="/produits" className="flex items-center gap-2.5 text-xs transition-all hover:text-white group" style={{ color: "#9ab8b8" }}>
        <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110" style={{ background: "rgba(42,138,138,0.15)", border: "1px solid rgba(42,138,138,0.2)" }}>
          <Icon size={11} style={{ color: "#2a8a8a" }} strokeWidth={1.8} />
        </div>
        {label}
      </Link>
    </li>
  );
}

function ColTitle({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 rounded-full" style={{ background: "linear-gradient(to bottom, #2a8a8a, #1a6a6a)" }} />
      <h4 className="font-bold text-sm uppercase tracking-widest" style={{ color: "#2a8a8a" }}>{label}</h4>
    </div>
  );
}

// ============= MODALE DE LOCALISATION =============
function LocationModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("KARHON Assurances Angré 8ème Tranche Abidjan")}`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("Angré 8ème Tranche, Abidjan, Côte d'Ivoire")}`;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent("Angré 8ème Tranche, Abidjan, Côte d'Ivoire")}&output=embed`;

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="relative p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #2a8a8a 100%)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                    <MapPin size={26} color="#fff" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">Notre Localisation</h2>
                    <p className="text-white/70 text-sm mt-1">KARHON Assurances Abidjan</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2.5 rounded-full transition-all hover:scale-110 flex-shrink-0" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(8px)" }}>
                  <X size={20} color="#fff" />
                </button>
              </div>
            </div>

            <div className="relative w-full h-64 sm:h-80 bg-gray-100">
              <iframe src={embedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Localisation KARHON Assurances" />
            </div>

            <div className="p-6 sm:p-8 space-y-5">
              <div className="flex gap-4 p-5 rounded-2xl" style={{ backgroundColor: "#f0f7f7", border: "1px solid #d0ecec" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                  <Building2 size={20} color="#fff" strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1" style={{ color: "#1a2e5a" }}>Adresse physique</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Zone résidentielle et commerciale<br />
                    <strong>Angré 8ème Tranche</strong><br />
                    Abidjan, Côte d&apos;Ivoire
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-5 rounded-2xl" style={{ backgroundColor: "#f0f7f7", border: "1px solid #d0ecec" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                  <Mail size={20} color="#fff" strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1" style={{ color: "#1a2e5a" }}>Adresse postale</h3>
                  <p className="text-gray-700 text-sm">BP V 236 Abidjan</p>
                </div>
              </div>

              <div className="flex gap-4 p-5 rounded-2xl" style={{ backgroundColor: "#f0f7f7", border: "1px solid #d0ecec" }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                  <Clock size={20} color="#fff" strokeWidth={1.8} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-1" style={{ color: "#1a2e5a" }}>Horaires d&apos;ouverture</h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Lundi - Vendredi : <strong>08h30 - 17h30</strong><br />
                    <span className="text-xs text-gray-500">Sur rendez-vous de préférence</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a href="tel:+2250787103939" className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: "#f0f7f7", border: "1px solid #d0ecec" }}>
                  <Phone size={16} style={{ color: "#2a8a8a" }} strokeWidth={2} />
                  <span className="text-sm font-semibold" style={{ color: "#1a2e5a" }}>+225 07 87 10 39 39</span>
                </a>
                <a href="tel:+2250576367272" className="flex items-center gap-3 p-4 rounded-xl transition-all hover:scale-[1.02]" style={{ backgroundColor: "#f0f7f7", border: "1px solid #d0ecec" }}>
                  <Phone size={16} style={{ color: "#2a8a8a" }} strokeWidth={2} />
                  <span className="text-sm font-semibold" style={{ color: "#1a2e5a" }}>+225 05 76 36 72 72</span>
                </a>
              </div>
            </div>

            <div className="p-6 border-t flex flex-col sm:flex-row gap-3" style={{ borderColor: "#e0ecec", backgroundColor: "#fafbfb" }}>
              <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-[1.02] shadow-lg" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                <Navigation size={17} strokeWidth={2} />
                Itinéraire GPS
              </a>
              <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm border-2 transition-all hover:scale-[1.02]" style={{ borderColor: "#2a8a8a", color: "#2a8a8a" }}>
                <ExternalLink size={16} strokeWidth={2} />
                Voir sur Google Maps
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============= COMPOSANT FOOTER PRINCIPAL =============
export default function Footer() {
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const contacts = [
    { Icon: Phone, text: "+225 07 87 10 39 39", href: "tel:+2250787103939" },
    { Icon: Phone, text: "+225 05 76 36 72 72", href: "tel:+2250576367272" },
    { Icon: Mail, text: "infos@karhonassurance.com", href: "mailto:infos@karhonassurance.com" },
  ];

  return (
    <>
      <footer style={{ background: "linear-gradient(160deg, #0f1e3a 0%, #1a2e5a 60%, #163a3a 100%)" }} className="text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">

          {/* Bloc logo + contact */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-12 pb-10" style={{ borderBottom: "1px solid rgba(42,138,138,0.25)" }}>
            <div className="flex-1 max-w-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12">
                  <Image
                    src="/images/logo/karhon-blanc.svg"
                    alt="KARHON Assurances"
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div className="flex items-baseline">
                  <span className="font-bold text-2xl text-white">KARHON</span>
                  <span className="text-base ml-1 font-medium" style={{ color: "#2a8a8a" }}>Assurances</span>
                </div>
              </div>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                Cabinet de courtage en assurances à Abidjan. Votre interlocuteur unique, neutre et indépendant.
              </p>
              <p className="text-xs mt-2" style={{ color: "#2a8a8a" }}>Agrément n°0305/MEF/DGTCP/DA du 02 SEPT 2021</p>
            </div>

            {/* Contact rapide */}
            <div className="flex flex-col gap-2.5">
              {contacts.map((item, i) => (
                <a key={i} href={item.href} className="flex items-center gap-3 text-sm transition-colors hover:text-white" style={{ color: "#9ab8b8" }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(42,138,138,0.18)", border: "1px solid rgba(42,138,138,0.3)" }}>
                    <item.Icon size={13} style={{ color: "#2a8a8a" }} strokeWidth={1.8} />
                  </div>
                  {item.text}
                </a>
              ))}

              <button
                onClick={() => setIsLocationOpen(true)}
                className="flex items-center gap-3 text-sm transition-all hover:text-white group cursor-pointer text-left"
                style={{ color: "#9ab8b8" }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110" style={{ background: "rgba(42,138,138,0.18)", border: "1px solid rgba(42,138,138,0.3)" }}>
                  <MapPin size={13} style={{ color: "#2a8a8a" }} strokeWidth={1.8} />
                </div>
                <span className="flex items-center gap-1.5">
                  Angré 8ème Tranche, Abidjan
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: "rgba(42,138,138,0.25)", color: "#2a8a8a", border: "1px solid rgba(42,138,138,0.4)" }}>
                    Voir
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Grille produits + liens */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <ColTitle label="Particuliers" />
              <ul className="space-y-2.5">
                {produitsParticuliers.map((item, i) => <ProduitLink key={i} label={item.label} Icon={item.Icon} />)}
              </ul>
            </div>
            <div>
              <ColTitle label="Professionnelles" />
              <ul className="space-y-2.5">
                {produitsPro.map((item, i) => <ProduitLink key={i} label={item.label} Icon={item.Icon} />)}
              </ul>
            </div>
            <div>
              <ColTitle label="Assurance Vie" />
              <ul className="space-y-2.5">
                {produitsVie.map((item, i) => <ProduitLink key={i} label={item.label} Icon={item.Icon} />)}
              </ul>
            </div>
            <div>
              <ColTitle label="Navigation" />
              <ul className="space-y-2.5">
                {liens.map((item, i) => (
                  <li key={i}>
                    <Link href={item.href} className="flex items-center gap-2.5 text-xs transition-all hover:text-white group" style={{ color: "#9ab8b8" }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all group-hover:scale-150" style={{ backgroundColor: "#2a8a8a" }} />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/devis" className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-xs text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)", boxShadow: "0 6px 20px rgba(42,138,138,0.3)" }}>
                Devis gratuit →
              </Link>
            </div>
          </div>

          {/* Bas de page */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 text-xs" style={{ borderTop: "1px solid rgba(42,138,138,0.2)", color: "#5a7a7a" }}>
            <p>© {new Date().getFullYear()} KARHON Assurances — Tous droits réservés</p>
            <button
              onClick={() => setIsLocationOpen(true)}
              className="hover:underline transition-colors hover:text-white cursor-pointer"
              style={{ color: "#2a8a8a" }}
            >
              📍 Angré 8ème Tranche, Abidjan, Côte d&apos;Ivoire
            </button>
          </div>
        </div>
      </footer>

      <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
    </>
  );
}