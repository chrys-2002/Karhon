"use client";

// <DatePicker> — calendrier custom premium, aux couleurs KARHON.
// Remplace le sélecteur natif du navigateur par une interface maison
// cohérente avec le reste du site. Valeur au format "AAAA-MM-JJ".
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  /** Date maximale autorisée (AAAA-MM-JJ), ex. aujourd'hui. */
  max?: string;
  /** Date minimale autorisée (AAAA-MM-JJ). */
  min?: string;
  /** Désactive les samedis et dimanches (jours non ouvrés). */
  desactiverWeekends?: boolean;
  placeholder?: string;
};

const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const JOURS = ["lu", "ma", "me", "je", "ve", "sa", "di"];

// "2026-06-12" → "12 juin 2026"
function formater(v: string) {
  if (!v) return "";
  const [a, m, j] = v.split("-").map(Number);
  return `${j} ${MOIS[m - 1]} ${a}`;
}

// Objet Date (local) → "AAAA-MM-JJ"
function versISO(d: Date) {
  const a = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const j = String(d.getDate()).padStart(2, "0");
  return `${a}-${m}-${j}`;
}

export default function DatePicker({ value, onChange, max, min, desactiverWeekends = false, placeholder = "Choisir une date" }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  // Le panneau s'ouvre vers le haut s'il manque de place en bas (ex. en bas d'une modale).
  const [versLeHaut, setVersLeHaut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Décide du sens d'ouverture avant d'afficher le panneau.
  const basculer = () => {
    if (!open) {
      const r = ref.current?.getBoundingClientRect();
      const placeEnBas = window.innerHeight - (r?.bottom ?? 0);
      setVersLeHaut(placeEnBas < 380); // hauteur approx. du calendrier
    }
    setOpen((o) => !o);
  };

  // Mois affiché : celui de la valeur, sinon le mois courant.
  const dateBase = value ? new Date(value + "T00:00:00") : new Date();
  const [curseur, setCurseur] = useState(new Date(dateBase.getFullYear(), dateBase.getMonth(), 1));

  useEffect(() => {
    const dehors = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", dehors);
    return () => document.removeEventListener("mousedown", dehors);
  }, []);

  // Construit la grille du mois (cases vides avant le 1er, lundi en tête).
  const annee = curseur.getFullYear();
  const mois = curseur.getMonth();
  const premierJour = new Date(annee, mois, 1);
  const decalage = (premierJour.getDay() + 6) % 7; // lundi = 0
  const nbJours = new Date(annee, mois + 1, 0).getDate();
  const cases: (number | null)[] = [
    ...Array(decalage).fill(null),
    ...Array.from({ length: nbJours }, (_, i) => i + 1),
  ];

  const ajd = versISO(new Date());

  const estDesactive = (iso: string) => {
    if (max && iso > max) return true;
    if (min && iso < min) return true;
    if (desactiverWeekends) {
      const jour = new Date(iso + "T00:00:00").getDay(); // 0 = dimanche, 6 = samedi
      if (jour === 0 || jour === 6) return true;
    }
    return false;
  };

  const choisir = (jour: number) => {
    const iso = versISO(new Date(annee, mois, jour));
    if (estDesactive(iso)) return;
    onChange(iso);
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      {/* Champ déclencheur */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.99 }}
        onClick={basculer}
        className="relative w-full px-3 py-2.5 bg-white border rounded-xl flex items-center gap-3 text-left transition-all hover:border-gray-300"
        style={{ borderColor: "#e0ecec" }}
      >
        <span className="flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
          <CalendarDays size={18} style={{ color: "#2a8a8a" }} strokeWidth={1.7} />
        </span>
        <span className={`flex-1 text-sm ${value ? "text-gray-800 font-medium" : "text-gray-400"}`}>
          {value ? formater(value) : placeholder}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronRight size={16} className="text-gray-400 rotate-90" />
        </motion.span>
      </motion.button>

      {/* Panneau calendrier */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: versLeHaut ? 8 : -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: versLeHaut ? 8 : -8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className={`absolute z-50 w-full max-w-[320px] bg-white rounded-2xl shadow-2xl p-4 border ${versLeHaut ? "bottom-full mb-2" : "mt-2"}`}
            style={{ borderColor: "#e0ecec" }}
          >
            {/* En-tête : mois + navigation */}
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={() => setCurseur(new Date(annee, mois - 1, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100"
              >
                <ChevronLeft size={18} style={{ color: "#1a2e5a" }} />
              </button>
              <span className="text-sm font-bold capitalize" style={{ color: "#1a2e5a" }}>
                {MOIS[mois]} {annee}
              </span>
              <button
                type="button"
                onClick={() => setCurseur(new Date(annee, mois + 1, 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-gray-100"
              >
                <ChevronRight size={18} style={{ color: "#1a2e5a" }} />
              </button>
            </div>

            {/* Jours de la semaine */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {JOURS.map((j) => (
                <div key={j} className="h-8 flex items-center justify-center text-xs font-semibold text-gray-400">
                  {j}
                </div>
              ))}
            </div>

            {/* Grille des jours */}
            <div className="grid grid-cols-7 gap-1">
              {cases.map((jour, i) => {
                if (jour === null) return <div key={`v-${i}`} className="h-9" />;
                const iso = versISO(new Date(annee, mois, jour));
                const selectionne = iso === value;
                const estAjd = iso === ajd;
                const off = estDesactive(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={off}
                    onClick={() => choisir(jour)}
                    className="h-9 rounded-lg text-sm font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    style={
                      selectionne
                        ? { background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", color: "#ffffff" }
                        : estAjd
                        ? { backgroundColor: "#eaf4f4", color: "#1a2e5a" }
                        : { color: "#374151" }
                    }
                    onMouseEnter={(e) => {
                      if (!selectionne && !off) e.currentTarget.style.backgroundColor = "#f0f7f7";
                    }}
                    onMouseLeave={(e) => {
                      if (!selectionne && !off) e.currentTarget.style.backgroundColor = estAjd ? "#eaf4f4" : "transparent";
                    }}
                  >
                    {jour}
                  </button>
                );
              })}
            </div>

            {/* Pied : effacer / aujourd'hui */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t" style={{ borderColor: "#f0f0f0" }}>
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors"
              >
                Effacer
              </button>
              <button
                type="button"
                onClick={() => {
                  if (estDesactive(ajd)) return;
                  onChange(ajd);
                  setCurseur(new Date());
                  setOpen(false);
                }}
                className="text-xs font-semibold transition-colors"
                style={{ color: "#2a8a8a" }}
              >
                Aujourd&apos;hui
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
