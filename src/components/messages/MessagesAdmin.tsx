"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import DocumentUpload from "@/components/ui/DocumentUpload";
import { Send, Loader2, FileText, MessagesSquare, Search, ArrowLeft, X, Paperclip, ChevronUp } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// MessagesAdmin — boîte de réception du rédacteur.
// Liste des conversations (1 par client, avec non-lus), et fil de discussion
// pour répondre / signaler des documents non conformes.
// ─────────────────────────────────────────────────────────────

type Conversation = {
  userId: string;
  client?: { nom?: string; prenom?: string; email?: string } | null;
  dernier: { contenu: string; expediteur: string; createdAt: string; piecesJointes: string[] };
  nonLus: number;
};
type Msg = { id: string; expediteur: string; auteurEmail?: string | null; contenu: string; piecesJointes: string[]; createdAt: string };
type ClientInfo = { nom?: string; prenom?: string; email?: string; telephone?: string } | null;

const MARINE = "#1a2e5a";
const TEAL = "#2a8a8a";

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const nomClient = (c?: { nom?: string; prenom?: string; email?: string } | null) =>
  c ? `${c.prenom ?? ""} ${c.nom ?? ""}`.trim() || c.email || "Client" : "Client";

function PieceJointe({ doc }: { doc: string }) {
  const sep = doc.indexOf("|");
  const libelle = sep > 0 ? doc.slice(0, sep) : "Document";
  const url = sep > 0 ? doc.slice(sep + 1) : doc;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-1 text-xs font-medium underline" style={{ color: TEAL }}>
      <FileText size={13} /> {libelle}
    </a>
  );
}

export default function MessagesAdmin({ cibleInitiale }: { cibleInitiale?: string | null }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recherche, setRecherche] = useState("");
  const [actif, setActif] = useState<string | null>(null);
  const [client, setClient] = useState<ClientInfo>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [totalFil, setTotalFil] = useState(0);
  const [pageFil, setPageFil] = useState(1);
  const [plusFil, setPlusFil] = useState(false);
  const [texte, setTexte] = useState("");
  const [docs, setDocs] = useState<string[]>([]);
  const [joindre, setJoindre] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingFil, setLoadingFil] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  const chargerInbox = useCallback(async () => {
    try {
      const r = await fetch("/api/messages");
      const d = r.ok ? await r.json() : { conversations: [] };
      setConversations(Array.isArray(d.conversations) ? d.conversations : []);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { chargerInbox(); }, [chargerInbox]);
  useEffect(() => { finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages]);

  const ouvrir = async (userId: string) => {
    setActif(userId);
    setLoadingFil(true);
    setPageFil(1);
    try {
      const r = await fetch(`/api/messages?userId=${encodeURIComponent(userId)}&page=1&pageSize=30`);
      const d = r.ok ? await r.json() : { messages: [], client: null, total: 0 };
      setMessages(Array.isArray(d.messages) ? d.messages : []);
      setClient(d.client ?? null);
      setTotalFil(d.total ?? 0);
      // Marque lu + remet le compteur à 0 dans la liste.
      fetch("/api/messages/lire", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) }).catch(() => {});
      setConversations((prev) => prev.map((c) => (c.userId === userId ? { ...c, nonLus: 0 } : c)));
    } finally {
      setLoadingFil(false);
    }
  };

  // Ouvre directement la conversation ciblée (clic sur une notification de message).
  useEffect(() => {
    if (cibleInitiale) ouvrir(cibleInitiale);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cibleInitiale]);

  const chargerPlusFil = async () => {
    if (!actif) return;
    setPlusFil(true);
    try {
      const suiv = pageFil + 1;
      const r = await fetch(`/api/messages?userId=${encodeURIComponent(actif)}&page=${suiv}&pageSize=30`);
      const d = r.ok ? await r.json() : { messages: [] };
      setMessages((prev) => [...(Array.isArray(d.messages) ? d.messages : []), ...prev]);
      setPageFil(suiv);
    } finally {
      setPlusFil(false);
    }
  };

  const envoyer = async () => {
    if ((!texte.trim() && docs.length === 0) || envoi || !actif) return;
    setEnvoi(true);
    try {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: actif, contenu: texte, piecesJointes: docs.map((u) => `Pièce jointe|${u}`) }),
      });
      if (r.ok) {
        const d = await r.json();
        setMessages((p) => [...p, d.message]);
        setTotalFil((t) => t + 1);
        setTexte(""); setDocs([]); setJoindre(false);
        chargerInbox();
      }
    } finally {
      setEnvoi(false);
    }
  };

  const convFiltrees = conversations.filter((c) => {
    const q = recherche.trim().toLowerCase();
    if (!q) return true;
    return `${nomClient(c.client)} ${c.client?.email ?? ""}`.toLowerCase().includes(q);
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border overflow-hidden flex" style={{ borderColor: "#e6f0f0", height: "min(72vh, 680px)" }}>
      {/* Liste des conversations */}
      <div className={`${actif ? "hidden md:flex" : "flex"} flex-col w-full md:w-[320px] border-r flex-shrink-0`} style={{ borderColor: "#eef4f4" }}>
        <div className="p-3 border-b" style={{ borderColor: "#eef4f4" }}>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
            <input
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              placeholder="Rechercher un client…"
              className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#2a8a8a]"
              style={{ borderColor: "#e0ecec" }}
            />
            {recherche && (
              <button onClick={() => setRecherche("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" aria-label="Effacer"><X size={14} /></button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="py-10 flex justify-center"><Loader2 size={22} className="animate-spin" style={{ color: TEAL }} /></div>
          ) : convFiltrees.length === 0 ? (
            <div className="py-10 px-6 text-center text-sm text-gray-400">Aucune conversation.</div>
          ) : (
            convFiltrees.map((c) => (
              <button
                key={c.userId}
                onClick={() => ouvrir(c.userId)}
                className="w-full text-left px-4 py-3 border-b flex items-start gap-3 transition-colors hover:bg-gray-50"
                style={{ borderColor: "#f3f8f8", background: actif === c.userId ? "#f0f9f9" : undefined }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}>
                  {(nomClient(c.client)[0] ?? "?").toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold truncate" style={{ color: MARINE }}>{nomClient(c.client)}</p>
                    <span className="text-[10px] text-gray-400 flex-shrink-0">{fmt(c.dernier.createdAt).split(" ").slice(0, 2).join(" ")}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{c.dernier.expediteur === "staff" ? "Vous : " : ""}{c.dernier.contenu || "📎 Pièce jointe"}</p>
                </div>
                {c.nonLus > 0 && (
                  <span className="min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full text-[10px] font-bold text-white flex-shrink-0" style={{ background: "#dc2626" }}>{c.nonLus}</span>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Fil de discussion */}
      <div className={`${actif ? "flex" : "hidden md:flex"} flex-col flex-1 min-w-0`}>
        {!actif ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
              <MessagesSquare size={24} style={{ color: TEAL }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: MARINE }}>Sélectionnez une conversation</p>
            <p className="text-gray-400 text-sm max-w-xs">Choisissez un client à gauche pour lire et répondre à ses messages.</p>
          </div>
        ) : (
          <>
            <div className="px-4 sm:px-6 py-3 border-b flex items-center gap-3" style={{ borderColor: "#eef4f4" }}>
              <button onClick={() => setActif(null)} className="md:hidden text-gray-500" aria-label="Retour"><ArrowLeft size={18} /></button>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: MARINE }}>{nomClient(client)}</p>
                <p className="text-xs text-gray-400 truncate">{client?.email}{client?.telephone ? ` · ${client.telephone}` : ""}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-3" style={{ background: "#f8fbfb" }}>
              {!loadingFil && messages.length < totalFil && (
                <div className="flex justify-center">
                  <button onClick={chargerPlusFil} disabled={plusFil} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border bg-white transition-all hover:shadow-sm disabled:opacity-50" style={{ borderColor: "#e0ecec", color: TEAL }}>
                    {plusFil ? <Loader2 size={13} className="animate-spin" /> : <ChevronUp size={13} />} Messages plus anciens
                  </button>
                </div>
              )}
              {loadingFil ? (
                <div className="h-full flex items-center justify-center"><Loader2 size={22} className="animate-spin" style={{ color: TEAL }} /></div>
              ) : messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-gray-400">Aucun message dans cette conversation.</div>
              ) : (
                messages.map((m) => {
                  const moi = m.expediteur === "staff";
                  return (
                    <div key={m.id} className={`flex ${moi ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-[80%] rounded-2xl px-4 py-2.5" style={moi ? { background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", color: "#fff" } : { background: "#fff", border: "1px solid #e6f0f0", color: "#374151" }}>
                        {!moi && <p className="text-[11px] font-semibold mb-0.5" style={{ color: TEAL }}>Client</p>}
                        {moi && m.auteurEmail && <p className="text-[11px] font-semibold mb-0.5 text-white/70">{m.auteurEmail}</p>}
                        {m.contenu && <p className="text-sm whitespace-pre-line leading-snug">{m.contenu}</p>}
                        {m.piecesJointes?.map((doc) => <PieceJointe key={doc} doc={doc} />)}
                        <p className={`text-[10px] mt-1 ${moi ? "text-white/60" : "text-gray-400"}`}>{fmt(m.createdAt)}</p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={finRef} />
            </div>

            <div className="border-t p-3 sm:p-4 space-y-3" style={{ borderColor: "#eef4f4" }}>
              {(joindre || docs.length > 0) && (
                <div className="rounded-xl p-2" style={{ background: "#f0f7f7", border: "1px solid #d8ebeb" }}>
                  <DocumentUpload label="Pièce jointe" value={docs} onChange={setDocs} />
                </div>
              )}
              <div className="flex items-end gap-2">
                <button
                  type="button"
                  onClick={() => setJoindre((v) => !v)}
                  className="flex-shrink-0 w-11 h-11 rounded-2xl border flex items-center justify-center transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#e0ecec", color: joindre ? TEAL : "#9ca3af" }}
                  aria-label="Joindre un document"
                  title="Joindre un document"
                >
                  <Paperclip size={18} />
                </button>
                <textarea
                  value={texte}
                  onChange={(e) => setTexte(e.target.value)}
                  rows={1}
                  placeholder="Répondre au client…"
                  className="flex-1 min-w-0 resize-none rounded-2xl px-4 py-3 text-sm border focus:outline-none focus:ring-2 focus:ring-[#2a8a8a]"
                  style={{ borderColor: "#e0ecec" }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); envoyer(); } }}
                />
                <button
                  onClick={envoyer}
                  disabled={envoi || (!texte.trim() && docs.length === 0)}
                  className="flex-shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center text-white transition-all hover:shadow-lg disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
                  aria-label="Envoyer"
                >
                  {envoi ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
