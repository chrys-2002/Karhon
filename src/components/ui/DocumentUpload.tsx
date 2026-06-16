"use client";
import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Camera, X, FileImage, Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// DocumentUpload — champ d'upload d'images premium (KARHON).
//
// • Importe une image (PNG / JPG / WEBP) OU la prend en photo (mobile).
// • Upload DIRECT vers Vercel Blob via /api/upload (aucune limite 4,5 Mo).
// • Aperçu miniature, barre de progression, suppression.
// • Gère 1 fichier (max=1, défaut) ou plusieurs (max>1).
//
// Le composant ne renvoie que des URLs ; le parent leur associe un libellé
// au moment de l'envoi (ex. "Carte grise|https://…").
// ─────────────────────────────────────────────────────────────

type Props = {
  label: string;
  value: string[];                 // URLs déjà uploadées
  onChange: (urls: string[]) => void;
  hint?: string;                   // petite aide sous le titre
  required?: boolean;
  max?: number;                    // nombre de fichiers autorisés (défaut 1)
};

const TYPES_OK = ["image/png", "image/jpeg", "image/jpg", "image/webp", "application/pdf"];
const TAILLE_MAX = 8 * 1024 * 1024; // 8 Mo

export default function DocumentUpload({
  label,
  value,
  onChange,
  hint,
  required = false,
  max = 1,
}: Props) {
  const [enCours, setEnCours] = useState(false);
  const [progression, setProgression] = useState(0);
  const [erreur, setErreur] = useState("");
  const inputFichier = useRef<HTMLInputElement>(null);
  const inputCamera = useRef<HTMLInputElement>(null);

  const plein = value.length >= max;

  const traiterFichier = async (file: File) => {
    setErreur("");

    // Validation côté client (le serveur revérifie de toute façon).
    if (!TYPES_OK.includes(file.type)) {
      setErreur("Format non accepté. Utilisez un PDF ou une image (PNG/JPG).");
      return;
    }
    if (file.size > TAILLE_MAX) {
      setErreur("Fichier trop volumineux (8 Mo maximum).");
      return;
    }

    setEnCours(true);
    setProgression(0);
    try {
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        onUploadProgress: (p) => {
          const pct = p.percentage ?? (p.total ? (p.loaded / p.total) * 100 : 0);
          setProgression(Math.round(pct));
        },
      });
      onChange([...value, blob.url]);
    } catch (e) {
      setErreur((e as Error).message || "Échec de l'envoi. Réessayez.");
    } finally {
      setEnCours(false);
      setProgression(0);
    }
  };

  const onSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier
    if (file) traiterFichier(file);
  };

  const supprimer = (url: string) => onChange(value.filter((u) => u !== url));

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        <FileImage size={15} style={{ color: "#2a8a8a" }} />
        {label}
        {required ? (
          <span style={{ color: "#2a8a8a" }}>*</span>
        ) : (
          <span className="text-gray-400 font-normal">(facultatif)</span>
        )}
      </label>
      {hint && <p className="text-xs text-gray-400 -mt-1 mb-2">{hint}</p>}

      {/* Inputs cachés : un pour la galerie/fichiers, un pour la caméra arrière. */}
      <input ref={inputFichier} type="file" accept="image/png,image/jpeg,image/webp,application/pdf" hidden onChange={onSelection} />
      <input ref={inputCamera} type="file" accept="image/png,image/jpeg,image/webp" capture="environment" hidden onChange={onSelection} />

      {/* Miniatures des fichiers déjà envoyés */}
      <AnimatePresence>
        {value.map((url) => (
          <motion.div
            key={url}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex items-center gap-3 mb-2 rounded-xl p-2.5"
            style={{ backgroundColor: "#f0f7f7", border: "1px solid #d8ebeb" }}
          >
            {url.toLowerCase().includes(".pdf") ? (
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#eaf4f4" }}>
                <FileText size={20} style={{ color: "#2a8a8a" }} />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={url} alt={label} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            )}
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <CheckCircle2 size={15} style={{ color: "#2a8a8a" }} className="flex-shrink-0" />
              <span className="text-xs text-gray-600 truncate">Document envoyé</span>
            </div>
            <button
              type="button"
              onClick={() => supprimer(url)}
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors hover:bg-white"
              aria-label="Supprimer"
            >
              <X size={15} className="text-gray-400" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Zone d'action (cachée quand le nombre max est atteint) */}
      {!plein && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={enCours}
            onClick={() => inputFichier.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all disabled:opacity-60"
            style={{ borderColor: "#cfe3e3", color: "#1a2e5a", backgroundColor: "#fbfdfd" }}
          >
            {enCours ? (
              <><Loader2 size={16} className="animate-spin" style={{ color: "#2a8a8a" }} /> Envoi… {progression}%</>
            ) : (
              <><UploadCloud size={16} style={{ color: "#2a8a8a" }} /> Importer</>
            )}
          </button>
          <button
            type="button"
            disabled={enCours}
            onClick={() => inputCamera.current?.click()}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all disabled:opacity-60 sm:flex-shrink-0"
            style={{ borderColor: "#cfe3e3", color: "#1a2e5a", backgroundColor: "#fbfdfd" }}
            title="Prendre une photo"
          >
            <Camera size={16} style={{ color: "#2a8a8a" }} />
            <span className="hidden sm:inline">Photo</span>
          </button>
        </div>
      )}

      {/* Barre de progression fine */}
      {enCours && (
        <div className="mt-2 h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: "#e0ecec" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progression}%`, background: "linear-gradient(90deg, #1a2e5a, #2a8a8a)" }} />
        </div>
      )}

      {/* Message d'erreur */}
      {erreur && (
        <p className="mt-2 flex items-center gap-1.5 text-xs" style={{ color: "#b42318" }}>
          <AlertCircle size={13} /> {erreur}
        </p>
      )}
    </div>
  );
}
