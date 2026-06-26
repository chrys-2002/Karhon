"use client";
import { useState, useRef, useEffect } from "react";
import { ArrowUp, ArrowDown, ChevronDown, Check, ArrowDownUp } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// TriSelect — contrôle de tri premium (KARHON).
//   • Menu déroulant soigné pour choisir le champ de tri.
//   • Bouton ↑/↓ pour inverser le sens.
//   • Réutilisable sur n'importe quelle liste du back-office.
// ─────────────────────────────────────────────────────────────

export type OptionTri = { value: string; label: string };

type Props = {
  options: OptionTri[];
  champ: string;
  sens: "asc" | "desc";
  onChamp: (v: string) => void;
  onSens: () => void;
};

export default function TriSelect({ options, champ, sens, onChamp, onSens }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fermer = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, []);

  const courant = options.find((o) => o.value === champ) ?? options[0];

  return (
    <div className="flex items-center gap-2">
      <ArrowDownUp size={15} className="hidden sm:block" style={{ color: "#9ca3af" }} />
      <span className="text-xs text-gray-400 hidden md:inline">Trier par</span>

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 text-xs font-semibold rounded-xl border px-3 py-2 bg-white transition-all hover:shadow-sm active:scale-95"
          style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}
        >
          {courant?.label}
          <ChevronDown size={14} style={{ color: "#2a8a8a" }} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div
            className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border z-40 overflow-hidden"
            style={{ borderColor: "#e0ecec" }}
          >
            {options.map((o) => {
              const actif = o.value === champ;
              return (
                <button
                  key={o.value}
                  onClick={() => { onChamp(o.value); setOpen(false); }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-left transition-colors hover:bg-gray-50"
                  style={actif ? { backgroundColor: "#eaf4f4", color: "#1a2e5a", fontWeight: 600 } : { color: "#374151" }}
                >
                  {o.label}
                  {actif && <Check size={14} style={{ color: "#2a8a8a" }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onSens}
        title={sens === "asc" ? "Ordre croissant" : "Ordre décroissant"}
        aria-label="Inverser le sens du tri"
        className="w-9 h-9 rounded-xl border flex items-center justify-center transition-all hover:shadow-sm active:scale-95"
        style={{ borderColor: "#e0ecec", color: "#2a8a8a" }}
      >
        {sens === "asc" ? <ArrowUp size={15} /> : <ArrowDown size={15} />}
      </button>
    </div>
  );
}
