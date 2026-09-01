"use client";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// ConfirmModal — modale de confirmation premium (KARHON), réutilisée
// partout où une action supprime ou archive quelque chose (client ET
// personnel). Remplace les window.confirm() natifs du navigateur par
// une modale cohérente avec le reste du design.
//
// Usage : le parent garde en state QUOI confirmer (titre, message,
// action à exécuter), et passe `open` + `onConfirm` + `onCancel`.
// ─────────────────────────────────────────────────────────────

const MARINE = "#1a2e5a";

export type ConfirmState = {
  titre: string;
  message: string;
  labelConfirmer?: string;
  danger?: boolean; // true = rouge (suppression), false = teal (action neutre type archivage)
} | null;

type Props = {
  state: ConfirmState;
  enCours?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({ state, enCours = false, onConfirm, onCancel }: Props) {
  const danger = state?.danger ?? true;
  const couleur = danger ? "#dc2626" : "#2a8a8a";
  const couleurFonce = danger ? "#b91c1c" : "#1e6e6e";
  const fond = danger ? "#fee2e2" : "#eaf4f4";
  const Icone = danger ? Trash2 : AlertTriangle;

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ background: "rgba(15,23,42,0.5)" }}
          onClick={() => !enCours && onCancel()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: fond }}>
              <Icone size={24} style={{ color: couleur }} />
            </div>
            <h3 className="text-xl font-extrabold mb-1" style={{ color: MARINE }}>{state.titre}</h3>
            <p className="text-base text-gray-700 mb-6">{state.message}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={enCours}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-base border transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50"
                style={{ color: MARINE, borderColor: "#e0ecec" }}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={enCours}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-base text-white transition-all hover:shadow-lg active:scale-95 disabled:opacity-70"
                style={{ background: `linear-gradient(135deg, ${couleur}, ${couleurFonce})` }}
              >
                {enCours && <Loader2 size={16} className="animate-spin" />}
                {state.labelConfirmer ?? "Confirmer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
