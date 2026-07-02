"use client";
import { useEffect, useRef, useState } from "react";
import DocumentUpload from "@/components/ui/DocumentUpload";
import { Send, Loader2, FileText, MessagesSquare, Paperclip, ArrowLeft, ArrowRight, ChevronUp, ListChecks, Archive, Trash2, X } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MessagesClient — messagerie du client.
// Atterrissage sur une VUE « SECTION » (carte de la conversation) ; le fil
// ne s'ouvre qu'au clic, et il est PAGINÉ (on charge les messages récents,
// puis « plus anciens » à la demande) → optimal même à très grand volume.
// ─────────────────────────────────────────────────────────────

type Msg = { id: string; expediteur: string; auteurEmail?: string | null; contenu: string; piecesJointes: string[]; createdAt: string };
type Apercu = { dernier: Msg | null; total: number; nonLus: number };

const MARINE = "#1a2e5a";
const TEAL = "#2a8a8a";
const TAILLE = 30;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

function PieceJointe({ doc, clair }: { doc: string; clair?: boolean }) {
  const sep = doc.indexOf("|");
  const libelle = sep > 0 ? doc.slice(0, sep) : "Document";
  const url = sep > 0 ? doc.slice(sep + 1) : doc;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-1 text-xs font-medium underline" style={{ color: clair ? "#fff" : TEAL }}>
      <FileText size={13} /> {libelle}
    </a>
  );
}

export default function MessagesClient({ ouvrirDirect }: { ouvrirDirect?: boolean }) {
  const [ouvert, setOuvert] = useState(false);
  const [apercu, setApercu] = useState<Apercu>({ dernier: null, total: 0, nonLus: 0 });
  const [loadingApercu, setLoadingApercu] = useState(true);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loadingFil, setLoadingFil] = useState(false);
  const [plusEnCours, setPlusEnCours] = useState(false);

  const [texte, setTexte] = useState("");
  const [docs, setDocs] = useState<string[]>([]);
  const [joindre, setJoindre] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const finRef = useRef<HTMLDivElement>(null);

  // Sélection multiple pour archiver / supprimer.
  const [selection, setSelection] = useState(false);
  const [selIds, setSelIds] = useState<string[]>([]);
  const [actionEnCours, setActionEnCours] = useState(false);
  const toggleSel = (id: string) => setSelIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const quitterSelection = () => { setSelection(false); setSelIds([]); };
  const appliquer = async (action: "archiver" | "supprimer") => {
    if (selIds.length === 0 || actionEnCours) return;
    if (action === "supprimer" && !window.confirm(`Supprimer définitivement ${selIds.length} message(s) ?`)) return;
    setActionEnCours(true);
    try {
      const r = await fetch("/api/messages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: selIds, action }) });
      if (r.ok) {
        setMessages((p) => p.filter((m) => !selIds.includes(m.id)));
        setTotal((t) => Math.max(0, t - selIds.length));
        quitterSelection();
        chargerApercu();
      }
    } finally {
      setActionEnCours(false);
    }
  };

  const chargerApercu = () =>
    fetch("/api/messages?apercu=1")
      .then((r) => (r.ok ? r.json() : { dernier: null, total: 0, nonLus: 0 }))
      .then((d) => setApercu({ dernier: d.dernier ?? null, total: d.total ?? 0, nonLus: d.nonLus ?? 0 }))
      .catch(() => {})
      .finally(() => setLoadingApercu(false));

  useEffect(() => { chargerApercu(); }, []);

  const ouvrirFil = async () => {
    setOuvert(true);
    setLoadingFil(true);
    try {
      const r = await fetch(`/api/messages?page=1&pageSize=${TAILLE}`);
      const d = r.ok ? await r.json() : { messages: [], total: 0 };
      setMessages(Array.isArray(d.messages) ? d.messages : []);
      setTotal(d.total ?? 0);
      setPage(1);
      fetch("/api/messages/lire", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
      setApercu((a) => ({ ...a, nonLus: 0 }));
    } finally {
      setLoadingFil(false);
      setTimeout(() => finRef.current?.scrollIntoView({ block: "end" }), 50);
    }
  };

  // Ouvre directement le fil quand on arrive via une notification de message.
  useEffect(() => {
    if (ouvrirDirect) ouvrirFil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ouvrirDirect]);

  const chargerPlus = async () => {
    setPlusEnCours(true);
    try {
      const suiv = page + 1;
      const r = await fetch(`/api/messages?page=${suiv}&pageSize=${TAILLE}`);
      const d = r.ok ? await r.json() : { messages: [] };
      setMessages((prev) => [...(Array.isArray(d.messages) ? d.messages : []), ...prev]);
      setPage(suiv);
    } finally {
      setPlusEnCours(false);
    }
  };

  const envoyer = async () => {
    if ((!texte.trim() && docs.length === 0) || envoi) return;
    setEnvoi(true); setErreur("");
    try {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contenu: texte, piecesJointes: docs.map((u) => `Document corrigé|${u}`) }),
      });
      if (r.ok) {
        const d = await r.json();
        setMessages((p) => [...p, d.message]);
        setTotal((t) => t + 1);
        setTexte(""); setDocs([]); setJoindre(false);
        setApercu((a) => ({ ...a, dernier: d.message, total: a.total + 1 }));
        setTimeout(() => finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
      } else {
        const d = await r.json().catch(() => ({}));
        setErreur(d.erreur || "Envoi impossible. Réessayez.");
      }
    } catch {
      setErreur("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setEnvoi(false);
    }
  };

  const aPlus = messages.length < total;

  // ── VUE SECTION (atterrissage) ──
  if (!ouvert) {
    return (
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e6f0f0" }}>
        <div className="px-6 py-4 border-b flex items-center gap-2.5" style={{ borderColor: "#eef4f4" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
            <MessagesSquare size={18} style={{ color: TEAL }} />
          </div>
          <div>
            <h2 className="text-base font-bold" style={{ color: MARINE }}>Messagerie</h2>
            <p className="text-xs text-gray-400">Vos échanges avec KARHON</p>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {loadingApercu ? (
            <div className="py-12 flex justify-center"><Loader2 size={24} className="animate-spin" style={{ color: TEAL }} /></div>
          ) : (
            <button
              onClick={ouvrirFil}
              className="w-full text-left rounded-2xl border p-4 sm:p-5 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-0.5"
              style={{ borderColor: "#e6f0f0" }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}>
                KA
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-sm" style={{ color: MARINE }}>Conseiller KARHON</p>
                  {apercu.dernier && <span className="text-[11px] text-gray-400 flex-shrink-0">{fmt(apercu.dernier.createdAt)}</span>}
                </div>
                <p className="text-sm text-gray-500 truncate mt-0.5">
                  {apercu.dernier
                    ? `${apercu.dernier.expediteur === "client" ? "Vous : " : ""}${apercu.dernier.contenu || "📎 Pièce jointe"}`
                    : "Démarrez la conversation avec votre conseiller."}
                </p>
              </div>
              {apercu.nonLus > 0 ? (
                <span className="min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-bold text-white flex-shrink-0" style={{ background: "#dc2626" }}>{apercu.nonLus}</span>
              ) : (
                <ArrowRight size={18} style={{ color: TEAL }} className="flex-shrink-0" />
              )}
            </button>
          )}
          <p className="text-xs text-gray-400 mt-3 px-1">
            {apercu.total > 0 ? `${apercu.total} message${apercu.total > 1 ? "s" : ""} dans cette conversation.` : "Aucun message pour l'instant."}
          </p>
        </div>
      </div>
    );
  }

  // ── VUE FIL ──
  return (
    <div className="bg-white rounded-3xl shadow-sm border overflow-hidden flex flex-col" style={{ borderColor: "#e6f0f0", height: "min(72vh, 660px)" }}>
      <div className="px-4 sm:px-6 py-3 border-b flex items-center gap-3" style={{ borderColor: "#eef4f4" }}>
        <button onClick={() => { setOuvert(false); chargerApercu(); }} className="text-gray-500 hover:text-gray-700" aria-label="Retour"><ArrowLeft size={18} /></button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}>KA</div>
        <div className="min-w-0">
          <p className="text-sm font-bold" style={{ color: MARINE }}>Conseiller KARHON</p>
          <p className="text-xs text-gray-400">{total} message{total > 1 ? "s" : ""}</p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => (selection ? quitterSelection() : setSelection(true))}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all hover:bg-gray-50"
            style={{ borderColor: "#e0ecec", color: selection ? "#b42318" : TEAL }}
          >
            {selection ? <><X size={14} /> Annuler</> : <><ListChecks size={14} /> Sélectionner</>}
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3" style={{ background: "#f8fbfb" }}>
        {aPlus && (
          <div className="flex justify-center">
            <button onClick={chargerPlus} disabled={plusEnCours} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-white transition-all hover:shadow-sm disabled:opacity-50" style={{ borderColor: "#e0ecec", color: TEAL }}>
              {plusEnCours ? <Loader2 size={13} className="animate-spin" /> : <ChevronUp size={13} />} Messages plus anciens
            </button>
          </div>
        )}
        {loadingFil ? (
          <div className="h-full flex items-center justify-center"><Loader2 size={22} className="animate-spin" style={{ color: TEAL }} /></div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
              <MessagesSquare size={24} style={{ color: TEAL }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: MARINE }}>Aucun message</p>
            <p className="text-gray-400 text-sm max-w-sm">Écrivez ci-dessous pour démarrer la conversation avec votre conseiller.</p>
          </div>
        ) : (
          messages.map((m) => {
            const moi = m.expediteur === "client";
            const sel = selIds.includes(m.id);
            return (
              <div key={m.id} className={`flex items-center gap-2 ${moi ? "justify-end" : "justify-start"}`}>
                {selection && (
                  <button onClick={() => toggleSel(m.id)} aria-label="Sélectionner" className="flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center" style={{ borderColor: sel ? TEAL : "#cbd5e1", background: sel ? TEAL : "#fff", color: "#fff" }}>
                    {sel && <span style={{ fontSize: 12, lineHeight: 1 }}>✓</span>}
                  </button>
                )}
                <div
                  onClick={selection ? () => toggleSel(m.id) : undefined}
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${selection ? "cursor-pointer" : ""}`}
                  style={{
                    ...(moi ? { background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", color: "#fff" } : { background: "#fff", border: "1px solid #e6f0f0", color: "#374151" }),
                    ...(sel ? { outline: `2px solid ${TEAL}`, outlineOffset: "2px" } : {}),
                  }}
                >
                  {!moi && <p className="text-[11px] font-semibold mb-0.5" style={{ color: TEAL }}>KARHON · Rédacteur</p>}
                  {m.contenu && <p className="text-sm whitespace-pre-line leading-snug">{m.contenu}</p>}
                  {m.piecesJointes?.map((doc) => <PieceJointe key={doc} doc={doc} clair={moi} />)}
                  <p className={`text-[10px] mt-1 ${moi ? "text-white/60" : "text-gray-400"}`}>{fmt(m.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={finRef} />
      </div>

      {selection ? (
        <div className="border-t p-3 sm:p-4 flex items-center justify-between gap-2" style={{ borderColor: "#eef4f4" }}>
          <span className="text-xs text-gray-500">{selIds.length} sélectionné{selIds.length > 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => appliquer("archiver")} disabled={selIds.length === 0 || actionEnCours} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border disabled:opacity-50" style={{ borderColor: "#e0ecec", color: MARINE }}>
              {actionEnCours ? <Loader2 size={14} className="animate-spin" /> : <Archive size={14} />} Archiver
            </button>
            <button onClick={() => appliquer("supprimer")} disabled={selIds.length === 0 || actionEnCours} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white disabled:opacity-50" style={{ background: "#dc2626" }}>
              <Trash2 size={14} /> Supprimer
            </button>
          </div>
        </div>
      ) : (
      <div className="border-t p-3 sm:p-4 space-y-3" style={{ borderColor: "#eef4f4" }}>
        {erreur && <p className="text-xs px-1" style={{ color: "#b42318" }}>{erreur}</p>}
        {(joindre || docs.length > 0) && (
          <div className="rounded-xl p-2" style={{ background: "#f0f7f7", border: "1px solid #d8ebeb" }}>
            <DocumentUpload label="Document corrigé à renvoyer" value={docs} onChange={setDocs} />
          </div>
        )}
        <div className="flex items-end gap-2">
          <button type="button" onClick={() => setJoindre((v) => !v)} className="flex-shrink-0 w-11 h-11 rounded-2xl border flex items-center justify-center transition-colors hover:bg-gray-50" style={{ borderColor: "#e0ecec", color: joindre ? TEAL : "#9ca3af" }} aria-label="Joindre un document" title="Joindre un document">
            <Paperclip size={18} />
          </button>
          <textarea
            value={texte}
            onChange={(e) => setTexte(e.target.value)}
            rows={1}
            placeholder="Écrire un message…"
            className="flex-1 min-w-0 resize-none rounded-2xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-[#2a8a8a]"
            style={{ borderColor: "#e0ecec" }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); envoyer(); } }}
          />
          <button onClick={envoyer} disabled={envoi || (!texte.trim() && docs.length === 0)} className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-all hover:shadow-lg disabled:opacity-50" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }} aria-label="Envoyer">
            {envoi ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
