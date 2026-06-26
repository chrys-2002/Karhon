"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertOctagon, X, Send, Loader2, CheckCircle2, ChevronDown, Check, FileText } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// SignalerDocument — bouton + modale permettant au rédacteur de signaler
// au client qu'une pièce est illisible / non conforme, et de lui demander
// de la renvoyer corrigée. Envoie un message (via /api/messages) + notif.
// ─────────────────────────────────────────────────────────────

type Props = {
  userId?: string;            // id du client concerné
  documents?: string[];       // pièces du dossier ("Libellé|url")
  contexte: "devis" | "sinistre";
  contexteId: string;
};

const MOTIFS = [
  { v: "illisible", label: "Illisible / flou" },
  { v: "périmé", label: "Périmé / expiré" },
  { v: "incomplet", label: "Incomplet (page manquante)" },
  { v: "non conforme", label: "Non conforme" },
  { v: "mauvais document", label: "Mauvais document" },
  { v: "autre", label: "Autre" },
];

const MARINE = "#1a2e5a";
const TEAL = "#2a8a8a";

export default function SignalerDocument({ userId, documents, contexte, contexteId }: Props) {
  const [open, setOpen] = useState(false);
  const [piece, setPiece] = useState("");
  const [motif, setMotif] = useState("illisible");
  const [note, setNote] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [ok, setOk] = useState(false);
  const [erreur, setErreur] = useState("");
  const [pieceOpen, setPieceOpen] = useState(false);
  const refPiece = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fermer = (e: MouseEvent) => {
      if (refPiece.current && !refPiece.current.contains(e.target as Node)) setPieceOpen(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, []);

  const libelles = (documents ?? []).map((d) => (d.indexOf("|") > 0 ? d.slice(0, d.indexOf("|")) : "Document"));
  const optionsPiece = libelles.length ? libelles : ["le document demandé"];

  const ouvrir = () => {
    setPiece(libelles[0] ?? "le document demandé");
    setMotif("illisible");
    setNote("");
    setOk(false);
    setErreur("");
    setOpen(true);
  };

  const envoyer = async () => {
    if (!userId) { setErreur("Client introuvable pour ce dossier."); return; }
    setEnvoi(true);
    setErreur("");
    const libelleMotif = MOTIFS.find((m) => m.v === motif)?.label ?? motif;
    const contenu =
      `Bonjour, concernant votre ${contexte === "devis" ? "demande de cotation" : "déclaration de sinistre"}, ` +
      `le document « ${piece} » est ${libelleMotif.toLowerCase()}. ` +
      `Merci de bien vouloir le renvoyer corrigé directement depuis votre espace, dans la Messagerie.` +
      (note.trim() ? `\n\nPrécision : ${note.trim()}` : "");
    try {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, contenu, contexte, contexteId, signal: true }),
      });
      if (r.ok) {
        setOk(true);
        setTimeout(() => setOpen(false), 1400);
      } else {
        const d = await r.json().catch(() => ({}));
        setErreur(d.erreur || "Envoi impossible.");
      }
    } catch {
      setErreur("Erreur réseau.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={ouvrir}
        title="Signaler un document non conforme au client"
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:shadow-sm"
        style={{ border: "1px solid #fed7aa", color: "#b45309", background: "#fff7ed" }}
      >
        <AlertOctagon size={13} /> Signaler un document
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.5)" }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: "linear-gradient(135deg, #b45309, #d97706)" }}>
                <div className="flex items-center gap-2.5 text-white">
                  <AlertOctagon size={20} />
                  <h3 className="font-bold">Signaler un document</h3>
                </div>
                <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white"><X size={20} /></button>
              </div>

              {ok ? (
                <div className="p-8 text-center">
                  <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3" style={{ background: "#dcfce7" }}>
                    <CheckCircle2 size={26} style={{ color: "#166534" }} />
                  </div>
                  <p className="font-semibold" style={{ color: MARINE }}>Message envoyé au client</p>
                  <p className="text-sm text-gray-500 mt-1">Il est invité à renvoyer le document corrigé depuis sa messagerie.</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document concerné</label>
                    <div ref={refPiece} className="relative">
                      <button
                        type="button"
                        onClick={() => setPieceOpen((o) => !o)}
                        className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm border bg-white transition-all hover:shadow-sm"
                        style={{ borderColor: pieceOpen ? TEAL : "#e0ecec", color: MARINE }}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <FileText size={15} style={{ color: TEAL }} className="flex-shrink-0" />
                          <span className="truncate">{piece}</span>
                        </span>
                        <ChevronDown size={16} style={{ color: TEAL }} className={`flex-shrink-0 transition-transform duration-200 ${pieceOpen ? "rotate-180" : ""}`} />
                      </button>
                      {pieceOpen && (
                        <div className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border z-10 overflow-hidden" style={{ borderColor: "#e0ecec" }}>
                          {optionsPiece.map((l, i) => {
                            const sel = l === piece;
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => { setPiece(l); setPieceOpen(false); }}
                                className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors hover:bg-gray-50"
                                style={sel ? { backgroundColor: "#eaf4f4", color: MARINE, fontWeight: 600 } : { color: "#374151" }}
                              >
                                <span className="flex items-center gap-2 min-w-0"><FileText size={14} style={{ color: TEAL }} className="flex-shrink-0" /> <span className="truncate">{l}</span></span>
                                {sel && <Check size={15} style={{ color: TEAL }} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Motif</label>
                    <div className="flex flex-wrap gap-2">
                      {MOTIFS.map((m) => (
                        <button key={m.v} onClick={() => setMotif(m.v)} className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                          style={motif === m.v ? { background: "linear-gradient(135deg, #b45309, #d97706)", color: "#fff" } : { background: "#fff", color: MARINE, border: "1px solid #e0ecec" }}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Précision (optionnel)</label>
                    <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Ex. la photo est trop sombre, on ne lit pas le numéro…"
                      className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] resize-none" style={{ borderColor: "#e0ecec" }} />
                  </div>
                  {erreur && <p className="text-xs" style={{ color: "#b42318" }}>{erreur}</p>}
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => setOpen(false)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-gray-50" style={{ color: MARINE, borderColor: "#e0ecec" }}>Annuler</button>
                    <button onClick={envoyer} disabled={envoi} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg disabled:opacity-60" style={{ background: `linear-gradient(135deg, ${TEAL}, ${MARINE})` }}>
                      {envoi ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Envoyer au client
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
