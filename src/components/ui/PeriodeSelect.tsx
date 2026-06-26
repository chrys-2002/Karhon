"use client";
import { useState, useRef, useEffect } from "react";
import { CalendarRange, ChevronDown, Check } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// PeriodeSelect — filtre de période premium (KARHON).
//   Filtre une liste sur une date : aujourd'hui, hier, cette semaine,
//   ce mois, cette année — ou toutes les dates.
//   Même style visuel que TriSelect, pour la cohérence du back-office.
// ─────────────────────────────────────────────────────────────

export const PERIODES = [
  { value: "tout", label: "Toutes les dates" },
  { value: "aujourdhui", label: "Aujourd'hui" },
  { value: "hier", label: "Hier" },
  { value: "semaine", label: "Cette semaine" },
  { value: "mois", label: "Ce mois" },
  { value: "annee", label: "Cette année" },
] as const;

type Props = { value: string; onChange: (v: string) => void };

export default function PeriodeSelect({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fermer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, []);

  const courant = PERIODES.find((o) => o.value === value) ?? PERIODES[0];
  const actif = value !== "tout";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs font-semibold rounded-xl border px-3 py-2 bg-white transition-all hover:shadow-sm active:scale-95"
        style={actif ? { borderColor: "#2a8a8a", color: "#1a2e5a", background: "#f0f9f9" } : { borderColor: "#e0ecec", color: "#1a2e5a" }}
      >
        <CalendarRange size={14} style={{ color: "#2a8a8a" }} />
        {courant.label}
        <ChevronDown size={14} style={{ color: "#2a8a8a" }} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border z-40 overflow-hidden" style={{ borderColor: "#e0ecec" }}>
          {PERIODES.map((o) => {
            const sel = o.value === value;
            return (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setOpen(false); }}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors hover:bg-gray-50"
                style={sel ? { backgroundColor: "#eaf4f4", color: "#1a2e5a", fontWeight: 600 } : { color: "#374151" }}
              >
                {o.label}
                {sel && <Check size={14} style={{ color: "#2a8a8a" }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
