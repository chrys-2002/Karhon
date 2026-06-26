"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MenuCategorie — petit menu (portail) pour (re)classer une souscription
// dans une catégorie : particulier / professionnel (flotte) / transport.
// Rendu via portail → jamais rogné par la carte parente (overflow-hidden).
// ─────────────────────────────────────────────────────────────

export const CATEGORIES_SEGMENT: Record<string, { court: string; couleur: string; fond: string }> = {
  particulier: { court: "Particulier", couleur: "#2a8a8a", fond: "#eaf4f4" },
  professionnel: { court: "Flotte (pro)", couleur: "#b45309", fond: "#fef3c7" },
  transport: { court: "Transport pro", couleur: "#7c3aed", fond: "#f3e8ff" },
};

type Props = { value: string; onChange: (v: string) => void; disabled?: boolean };

export default function MenuCategorie({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number }>({ top: 0, left: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  const placer = useCallback(() => {
    const b = btnRef.current?.getBoundingClientRect();
    if (!b) return;
    const marge = 8;
    const largeur = 176;
    let left = b.left;
    left = Math.max(marge, Math.min(left, window.innerWidth - largeur - marge));
    const hauteurEstimee = 130;
    if (window.innerHeight - b.bottom < hauteurEstimee && b.top > hauteurEstimee) {
      setCoords({ bottom: window.innerHeight - b.top + 6, left });
    } else {
      setCoords({ top: b.bottom + 6, left });
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    placer();
    const fermer = (e: MouseEvent) => {
      if (btnRef.current?.contains(e.target as Node)) return;
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onScroll = () => placer();
    document.addEventListener("mousedown", fermer);
    window.addEventListener("resize", placer);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", fermer);
      window.removeEventListener("resize", placer);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, placer]);

  const cur = CATEGORIES_SEGMENT[value] ?? CATEGORIES_SEGMENT.particulier;

  const panneau = (
    <div
      ref={panelRef}
      className="fixed z-[70] w-44 bg-white rounded-xl shadow-2xl border overflow-hidden"
      style={{ top: coords.top, bottom: coords.bottom, left: coords.left, borderColor: "#e0ecec" }}
    >
      <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Catégorie</p>
      {Object.entries(CATEGORIES_SEGMENT).map(([k, v]) => {
        const sel = k === value;
        return (
          <button
            key={k}
            onClick={() => { setOpen(false); if (k !== value) onChange(k); }}
            className="w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors hover:bg-gray-50"
            style={sel ? { backgroundColor: "#eaf4f4", color: "#1a2e5a", fontWeight: 600 } : { color: "#374151" }}
          >
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: v.couleur }} /> {v.court}
            </span>
            {sel && <Check size={12} style={{ color: "#2a8a8a" }} />}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        title="Changer la catégorie"
        className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-all hover:shadow-sm disabled:opacity-50"
        style={{ background: cur.fond, color: cur.couleur }}
      >
        {cur.court}
        <ChevronDown size={11} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {mounted && open && createPortal(panneau, document.body)}
    </>
  );
}
