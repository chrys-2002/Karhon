"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, ChevronDown, Check, ArrowUp, ArrowDown } from "lucide-react";
import { PERIODES } from "@/components/ui/PeriodeSelect";

// ─────────────────────────────────────────────────────────────
// FiltreTri — contrôle UNIQUE premium (KARHON) regroupant :
//   • la période (aujourd'hui, hier, semaine, mois, année…),
//   • le champ de tri,
//   • le sens (croissant / décroissant).
//
// Le panneau est rendu dans un PORTAL (document.body) et positionné
// en "fixed" sous le bouton : il n'est donc jamais rogné par la carte
// parente (overflow-hidden) et reste entièrement visible et responsive
// sur mobile comme sur desktop.
// ─────────────────────────────────────────────────────────────

export type OptionTri = { value: string; label: string };

type Props = {
  options: OptionTri[];
  champ: string;
  sens: "asc" | "desc";
  periode: string;
  onChamp: (v: string) => void;
  onSens: () => void;
  onPeriode: (v: string) => void;
};

const MARINE = "#1a2e5a";
const TEAL = "#2a8a8a";

export default function FiltreTri({ options, champ, sens, periode, onChamp, onSens, onPeriode }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number; width: number; maxH: number }>({ top: 0, left: 0, width: 288, maxH: 480 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  // Positionne le panneau : sous le bouton si la place suffit, sinon au-dessus.
  // La hauteur est calée sur l'espace réellement disponible → scroll interne fiable.
  const placer = useCallback(() => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    const marge = 12;
    const largeur = Math.min(288, window.innerWidth - marge * 2);
    let left = b.right - largeur; // aligné à droite du bouton
    left = Math.max(marge, Math.min(left, window.innerWidth - largeur - marge));

    const placeDessous = window.innerHeight - b.bottom - marge;
    const placeDessus = b.top - marge;
    if (placeDessous >= 220 || placeDessous >= placeDessus) {
      setCoords({ top: b.bottom + 8, bottom: undefined, left, width: largeur, maxH: Math.max(160, placeDessous) });
    } else {
      setCoords({ top: undefined, bottom: window.innerHeight - b.top + 8, left, width: largeur, maxH: Math.max(160, placeDessus) });
    }
  }, []);

  // À l'ouverture : positionne + clic extérieur + recale au redimensionnement.
  // On NE ferme PAS quand le scroll vient de l'intérieur du panneau (sinon on ne
  // peut pas atteindre les options du bas).
  useEffect(() => {
    if (!open) return;
    placer();
    const fermer = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return; // scroll interne → on garde
      placer();
    };
    document.addEventListener("mousedown", fermer);
    window.addEventListener("resize", placer);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", fermer);
      window.removeEventListener("resize", placer);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, placer]);

  const champCourant = options.find((o) => o.value === champ) ?? options[0];
  const filtreActif = periode !== "tout";

  const panneau = (
    <div
      ref={panelRef}
      className="fixed bg-white rounded-2xl shadow-2xl border overflow-y-auto z-[70] overscroll-contain"
      style={{ top: coords.top, bottom: coords.bottom, left: coords.left, width: coords.width, maxHeight: coords.maxH, borderColor: "#e0ecec", WebkitOverflowScrolling: "touch" }}
    >
      {/* Période */}
      <p className="px-4 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">Période</p>
      {PERIODES.map((p) => {
        const sel = p.value === periode;
        return (
          <button
            key={p.value}
            onClick={() => onPeriode(p.value)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-left transition-colors hover:bg-gray-50"
            style={sel ? { backgroundColor: "#eaf4f4", color: MARINE, fontWeight: 600 } : { color: "#374151" }}
          >
            {p.label}
            {sel && <Check size={14} style={{ color: TEAL }} />}
          </button>
        );
      })}

      {/* Trier par */}
      <p className="px-4 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-t" style={{ borderColor: "#eef4f4" }}>Trier par</p>
      {options.map((o) => {
        const sel = o.value === champ;
        return (
          <button
            key={o.value}
            onClick={() => onChamp(o.value)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-left transition-colors hover:bg-gray-50"
            style={sel ? { backgroundColor: "#eaf4f4", color: MARINE, fontWeight: 600 } : { color: "#374151" }}
          >
            {o.label}
            {sel && <Check size={14} style={{ color: TEAL }} />}
          </button>
        );
      })}

      {/* Ordre */}
      <p className="px-4 pt-3 pb-1.5 text-[11px] font-bold uppercase tracking-wide text-gray-400 border-t" style={{ borderColor: "#eef4f4" }}>Ordre</p>
      <div className="px-3 pb-3 flex gap-2">
        <button
          onClick={() => { if (sens !== "asc") onSens(); }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
          style={sens === "asc" ? { background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", color: "#fff", borderColor: "transparent" } : { borderColor: "#e0ecec", color: MARINE }}
        >
          <ArrowUp size={13} /> Croissant
        </button>
        <button
          onClick={() => { if (sens !== "desc") onSens(); }}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all"
          style={sens === "desc" ? { background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", color: "#fff", borderColor: "transparent" } : { borderColor: "#e0ecec", color: MARINE }}
        >
          <ArrowDown size={13} /> Décroissant
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-xs font-semibold rounded-xl border px-3 py-2 bg-white transition-all hover:shadow-sm active:scale-95"
        style={filtreActif ? { borderColor: TEAL, color: MARINE, background: "#f0f9f9" } : { borderColor: "#e0ecec", color: MARINE }}
      >
        <SlidersHorizontal size={14} style={{ color: TEAL }} />
        <span className="hidden sm:inline">Filtrer &amp; trier</span>
        <span className="text-gray-400 font-normal hidden md:inline">· {champCourant?.label}</span>
        {sens === "asc" ? <ArrowUp size={13} style={{ color: TEAL }} /> : <ArrowDown size={13} style={{ color: TEAL }} />}
        <ChevronDown size={14} style={{ color: TEAL }} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {mounted && open && createPortal(panneau, document.body)}
    </>
  );
}
