"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { X, CheckCircle, ChevronLeft, ChevronRight, ArrowRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

const heroImages = [
  { image: "/images/accueil/auto.jpg", nom: "Assurance Auto", description: "Particulier, flotte et deux roues" },
  { image: "/images/accueil/habitation.jpg", nom: "Assurance Habitation", description: "Appartement, immeuble, villa" },
  { image: "/images/accueil/sante.jpg", nom: "Assurance Santé", description: "Individuelle et famille" },
  { image: "/images/accueil/voyage.jpg", nom: "Assurance Voyage", description: "Multirisques personnalisée" },
  { image: "/images/accueil/retraite.jpg", nom: "Assurance Retraite", description: "Préparez votre avenir" },
  { image: "/images/accueil/etudes.jpg", nom: "Assurance Études", description: "Épargne pour les études" },
  { image: "/images/accueil/emprunteur.jpg", nom: "Assurance Emprunteur", description: "Protection de prêt bancaire" },
  { image: "/images/accueil/obseques.jpg", nom: "Assurance Obsèques", description: "Prévoyance funéraire" },
];

const produitsIARD = [
  {
    nom: "Assurance Auto",
    description: "Particulier, flotte et deux roues",
    image: "/images/accueil/auto.jpg",
    tag: "IARD",
    longDescription: "L'assurance automobile est obligatoire en Côte d'Ivoire. Elle couvre les dommages causés avec ou à un véhicule automobile. KARHON vous propose les meilleures formules adaptées à votre budget.",
    garanties: ["Responsabilité Civile obligatoire", "Vol et Incendie", "Bris de Glace", "Dommages Corporels", "Assistance Dépannage 24/7", "Protection du conducteur"],
    options: ["Tiers Simple", "Tiers Étendu", "Tous Risques"],
  },
  {
    nom: "Assurance Habitation",
    description: "Appartement, immeuble, villa",
    image: "/images/accueil/habitation.jpg",
    tag: "IARD",
    longDescription: "Protège votre résidence principale ou secondaire contre tous les risques du quotidien. Idéale pour les locataires et les propriétaires.",
    garanties: ["Incendie & Explosion", "Dégâts des Eaux", "Vol & Cambriolage", "Responsabilité Civile", "Catastrophes Naturelles", "Assistance Dépannage"],
    options: ["Locataire", "Propriétaire Occupant", "Propriétaire Non Occupant"],
  },
  {
    nom: "Assurance Santé",
    description: "Individuelle et famille",
    image: "/images/accueil/sante.jpg",
    tag: "IARD",
    longDescription: "Dispositif permettant aux assurés confrontés à des risques de maladies, maternité ou invalidité de bénéficier de prestations au ticket modérateur et de remboursement des frais médicaux.",
    garanties: ["Consultations Médicales", "Hospitalisation", "Maternité", "Pharmacie", "Soins Dentaires & Optiques", "Analyses Médicales"],
    options: ["Niveau 1", "Niveau 2", "Niveau 3", "Formule Famille"],
  },
  {
    nom: "Assurance Voyage",
    description: "Multirisques personnalisée",
    image: "/images/accueil/voyage.jpg",
    tag: "IARD",
    longDescription: "Assurance Assistance Voyage multirisques personnalisée pour les voyageurs en toute sérénité. Couvre l'annulation, le rapatriement, les frais médicaux à l'étranger et la perte de bagages.",
    garanties: ["Rapatriement Sanitaire", "Frais Médicaux Étranger", "Annulation de Voyage", "Perte de Bagages", "Assistance 24/7"],
    options: ["Court Séjour", "Long Séjour", "Expatriation", "Scolaire"],
  },
];

const produitsVIE = [
  {
    nom: "Assurance Retraite",
    description: "Préparez votre avenir",
    image: "/images/accueil/retraite.jpg",
    tag: "VIE",
    longDescription: "Permet de constituer un capital ou une rente pour maintenir votre niveau de vie après la retraite. Avantages fiscaux intéressants et transmission sécurisée aux héritiers.",
    garanties: ["Capital Garanti", "Rente Viagère", "Transmission aux Héritiers", "Rachat Partiel"],
    options: ["Épargne Libre", "Épargne Programmée", "Versement Unique"],
  },
  {
    nom: "Assurance Études",
    description: "Épargne pour les études",
    image: "/images/accueil/etudes.jpg",
    tag: "VIE",
    longDescription: "Épargne dédiée au financement des études supérieures de vos enfants. Capital garanti à l'échéance avec possibilité de versements flexibles.",
    garanties: ["Capital Garanti", "Versement Flexible", "Transmission Sécurisée", "Exonération en cas de décès"],
    options: ["10 ans", "15 ans", "20 ans"],
  },
  {
    nom: "Assurance Emprunteur",
    description: "Protection de prêt bancaire",
    image: "/images/accueil/emprunteur.jpg",
    tag: "VIE",
    longDescription: "Couvre le remboursement d'un prêt en cas de décès ou d'invalidité. Obligatoire pour la plupart des prêts immobiliers.",
    garanties: ["Décès", "Invalidité Totale", "Incapacité Temporaire", "Perte d'Emploi (option)"],
    options: ["Prêt Immobilier", "Prêt Automobile", "Prêt Professionnel"],
  },
  {
    nom: "Assurance Obsèques",
    description: "Prévoyance funéraire",
    image: "/images/accueil/obseques.jpg",
    tag: "VIE",
    longDescription: "Prise en charge des frais funéraires pour protéger vos proches d'une charge financière difficile. Capital versé rapidement aux bénéficiaires.",
    garanties: ["Capital Décès versé rapidement", "Organisation des Obsèques", "Assistance Famille", "Rapatriement du Corps"],
    options: ["Individuelle", "Famille", "Groupe Entreprise"],
  },
];

const stats = [
  { value: "50+", label: "Partenaires", icone: "🤝" },
  { value: "1000+", label: "Clients", icone: "⭐" },
  { value: "48h", label: "Devis express", icone: "⚡" },
  { value: "100%", label: "Sans honoraires", icone: "💰" },
];

function Carousel({ produits, title, subtitle }: { produits: any[]; title: string; subtitle: string }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedProduit, setSelectedProduit] = useState<any>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent(prev => (prev + 1) % produits.length);
    }, 4000);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const go = (dir: number) => {
    setDirection(dir);
    setCurrent(prev => (prev + dir + produits.length) % produits.length);
    startTimer();
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0, scale: 0.95 }),
  };

  const p = produits[current];

  return (
    <>
      <section className="py-16 sm:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10 sm:mb-14"
          >
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: "#2a8a8a" }}>{subtitle}</p>
            <h2 className="text-3xl sm:text-5xl font-bold" style={{ color: "#1a2e5a" }}>{title}</h2>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="relative h-64 sm:h-80 lg:h-[480px] rounded-3xl overflow-hidden shadow-2xl">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={current}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                  className="absolute inset-0"
                >
                  <Image src={p.image} alt={p.nom} fill className="object-cover" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(26,46,90,0.4) 0%, rgba(42,138,138,0.2) 100%)" }} />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold text-white backdrop-blur-md" style={{ backgroundColor: "rgba(42,138,138,0.8)" }}>
                      {p.tag}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4">
                    <span className="text-white/60 text-sm font-mono">{String(current + 1).padStart(2, "0")} / {String(produits.length).padStart(2, "0")}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col justify-between h-full">
              <AnimatePresence custom={direction} mode="wait">
                <motion.div
                  key={current + "text"}
                  custom={direction}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.05 }}
                  className="space-y-5"
                >
                  <div>
                    <h3 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: "#1a2e5a" }}>{p.nom}</h3>
                    <p className="text-base text-gray-500 font-medium">{p.description}</p>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{p.longDescription}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {p.garanties.slice(0, 3).map((g: string, i: number) => (
                      <motion.div key={g} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckCircle size={16} style={{ color: "#2a8a8a" }} className="flex-shrink-0" />
                        {g}
                      </motion.div>
                    ))}
                    {p.garanties.length > 3 && <p className="text-xs text-gray-400 pl-7">+{p.garanties.length - 3} garanties supplémentaires</p>}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {p.options.map((o: string, i: number) => (
                      <motion.span key={o} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.06 }} className="px-3 py-1 rounded-full text-xs font-semibold border" style={{ borderColor: "#2a8a8a", color: "#2a8a8a" }}>
                        {o}
                      </motion.span>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setSelectedProduit(p)} className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-105 active:scale-95 shadow-lg" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                      Voir les détails <ArrowRight size={15} />
                    </button>
                    <Link href="/devis" className="flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm border-2 transition-all hover:scale-105 active:scale-95" style={{ borderColor: "#2a8a8a", color: "#2a8a8a" }}>
                      Devis gratuit
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="flex items-center gap-4 mt-8">
                <button onClick={() => go(-1)} className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-95" style={{ borderColor: "#1a2e5a", color: "#1a2e5a" }}>
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => go(1)} className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                  <ChevronRight size={18} />
                </button>
                <div className="flex gap-2 ml-2">
                  {produits.map((_, i) => (
                    <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); startTimer(); }} className="transition-all duration-300 rounded-full" style={{ width: i === current ? "28px" : "8px", height: "8px", backgroundColor: i === current ? "#2a8a8a" : "#d1e8e8" }} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-4 gap-3">
            {produits.map((prod, i) => (
              <motion.button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); startTimer(); }} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} className="relative h-16 sm:h-20 rounded-xl overflow-hidden transition-all" style={{ outline: i === current ? "3px solid #2a8a8a" : "3px solid transparent", outlineOffset: "2px", opacity: i === current ? 1 : 0.6 }}>
                <Image src={prod.image} alt={prod.nom} fill className="object-cover" />
                <div className="absolute inset-0 flex items-end p-1.5" style={{ background: "linear-gradient(to top, rgba(26,46,90,0.7) 0%, transparent 60%)" }}>
                  <span className="text-white text-[10px] font-semibold leading-tight">{prod.nom}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {selectedProduit && (
          <div className="fixed inset-0 bg-black/70 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }} transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }} className="bg-white max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl my-8">
              <div className="relative h-52 w-full">
                <Image src={selectedProduit.image} alt={selectedProduit.nom} fill className="object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(26,46,90,0.3) 0%, rgba(26,46,90,0.85) 100%)" }} />
                <div className="absolute inset-0 p-6 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedProduit.nom}</h2>
                    <p className="text-white/70 text-sm mt-1">{selectedProduit.description}</p>
                  </div>
                  <button onClick={() => setSelectedProduit(null)} className="p-2 hover:bg-white/20 rounded-full transition text-white"><X size={24} /></button>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <h3 className="font-bold text-lg mb-2" style={{ color: "#1a2e5a" }}>Description</h3>
                  <p className="text-gray-700 leading-relaxed text-sm">{selectedProduit.longDescription}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: "#1a2e5a" }}>Garanties incluses</h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedProduit.garanties.map((g: string, i: number) => (
                      <li key={i} className="flex items-center gap-2 p-3 rounded-xl text-sm text-gray-700" style={{ backgroundColor: "#f0f7f7" }}>
                        <CheckCircle size={16} style={{ color: "#2a8a8a" }} className="flex-shrink-0" />{g}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-3" style={{ color: "#1a2e5a" }}>Formules disponibles</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProduit.options.map((o: string, i: number) => (
                      <span key={i} className="px-4 py-2 rounded-full text-sm font-medium text-white" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>{o}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 border-t flex gap-4" style={{ borderColor: "#e0ecec" }}>
                <button onClick={() => setSelectedProduit(null)} className="flex-1 py-3 border-2 rounded-2xl font-semibold hover:bg-gray-50 transition text-sm" style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}>Fermer</button>
                <Link href="/devis" onClick={() => setSelectedProduit(null)} className="flex-1 text-white py-3 rounded-2xl font-semibold transition shadow-lg hover:scale-105 text-center text-sm" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>Demander un devis gratuit</Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Home() {
  const [loaded, setLoaded] = useState(false);
  const [heroCurrent, setHeroCurrent] = useState(0);
  const heroTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => {
    setLoaded(true);
    heroTimerRef.current = setInterval(() => {
      setHeroCurrent(prev => (prev + 1) % heroImages.length);
    }, 4500);
    return () => { if (heroTimerRef.current) clearInterval(heroTimerRef.current); };
  }, []);

  return (
    <div className="overflow-hidden bg-white">

      {/* ═══════════ HERO ═══════════ */}
      <div ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Fond carrousel */}
        <AnimatePresence mode="sync">
          <motion.div
            key={heroCurrent}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[heroCurrent].image}
              alt={heroImages[heroCurrent].nom}
              fill
              className="object-cover"
              priority
            />
            {/* Overlay sombre */}
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,20,50,0.65) 0%, rgba(10,20,50,0.50) 50%, rgba(10,20,50,0.75) 100%)" }} />
          </motion.div>
        </AnimatePresence>

        {/* Badge produit actif — bas gauche */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`badge-${heroCurrent}`}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.45 }}
            className="absolute bottom-20 left-8 sm:left-14 flex items-center gap-3 z-10"
          >
            <div className="w-1 h-10 rounded-full" style={{ background: "#2a8a8a" }} />
            <div>
              <p className="text-white font-semibold text-sm sm:text-base leading-tight">{heroImages[heroCurrent].nom}</p>
              <p className="text-white/50 text-xs">{heroImages[heroCurrent].description}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots verticaux — bas droite */}
        <div className="absolute bottom-16 right-8 sm:right-14 flex flex-col gap-2 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setHeroCurrent(i);
                if (heroTimerRef.current) clearInterval(heroTimerRef.current);
                heroTimerRef.current = setInterval(() => setHeroCurrent(prev => (prev + 1) % heroImages.length), 4500);
              }}
              className="rounded-full transition-all duration-300"
              style={{
                width: "5px",
                height: i === heroCurrent ? "22px" : "5px",
                backgroundColor: i === heroCurrent ? "#2a8a8a" : "rgba(255,255,255,0.35)",
              }}
            />
          ))}
        </div>

        {/* Contenu principal */}
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 50 }}
            transition={{ duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold text-white mb-6 leading-none tracking-tight">
              KARHON
              <br />
              <span className="text-4xl sm:text-6xl lg:text-7xl font-light" style={{ color: "#a8d8d8" }}>Assurances</span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              Votre interlocuteur unique, neutre et indépendant en assurance en Côte d&apos;Ivoire.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/devis" className="group px-8 py-4 rounded-full font-bold text-white text-base transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #2a8a8a, #1e4a7a)" }}>
                Demander un devis gratuit
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/produits" className="px-8 py-4 rounded-full font-bold text-white text-base border-2 border-white/30 hover:border-white/60 transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-md">
                Voir nos produits
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Flèche scroll */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ChevronDown size={28} className="text-white/50" />
          </motion.div>
        </motion.div>
      </div>

      {/* ═══════════ STATS ═══════════ */}
      <section className="py-12 bg-white border-b" style={{ borderColor: "#e0ecec" }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }} className="text-center">
                <div className="text-3xl mb-2">{stat.icone}</div>
                <div className="text-3xl font-bold mb-1" style={{ color: "#1a2e5a" }}>{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CAROUSEL IARD ═══════════ */}
      <div style={{ backgroundColor: "#f8fbfb" }}>
        <Carousel produits={produitsIARD} title="Assurances IARD" subtitle="Incendie · Accidents · Risques Divers" />
      </div>

      {/* ═══════════ SÉPARATEUR ═══════════ */}
      <div className="py-8 flex items-center justify-center">
        <div className="w-full max-w-5xl mx-auto px-6">
          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, #2a8a8a, transparent)" }} />
        </div>
      </div>

      {/* ═══════════ CAROUSEL VIE ═══════════ */}
      <div className="bg-white">
        <Carousel produits={produitsVIE} title="Assurances Vie" subtitle="Épargne · Prévoyance · Avenir" />
      </div>

      {/* ═══════════ POURQUOI KARHON ═══════════ */}
      <section className="py-16 sm:py-24" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #1e4a7a 60%, #2a8a8a 100%)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-xs font-bold tracking-[0.3em] uppercase mb-3 text-white/50">Notre engagement</p>
            <h2 className="text-3xl sm:text-5xl font-bold text-white">Pourquoi choisir KARHON ?</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icone: "🎯", title: "Un interlocuteur unique", desc: "Un seul point de contact pour toutes vos assurances. Gestion personnalisée et simplifiée." },
              { icone: "🤝", title: "Neutre et indépendant", desc: "Nous travaillons exclusivement dans votre intérêt. Aucun lien avec une seule compagnie." },
              { icone: "💰", title: "Sans honoraires", desc: "Nos services sont entièrement pris en charge par les compagnies d'assurance partenaires." },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6 }} whileHover={{ y: -6, scale: 1.02 }} className="bg-white/8 backdrop-blur-md rounded-3xl p-8 border border-white/10 transition-all duration-300 cursor-default">
                <div className="text-5xl mb-5">{item.icone}</div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA FINAL ═══════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="text-3xl sm:text-5xl font-bold mb-4" style={{ color: "#1a2e5a" }}>Prêt à être bien protégé ?</h2>
            <p className="text-gray-500 mb-10 text-lg">Obtenez votre devis personnalisé gratuit en quelques minutes.</p>
            <Link href="/devis" className="group inline-flex items-center gap-3 px-10 py-5 rounded-full font-bold text-white text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xl" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
              Commencer maintenant
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}