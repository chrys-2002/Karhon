"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Inbox,
  ChevronDown,
  Check,
  AlertTriangle,
  HandCoins,
  Trash2,
  Send,
  Mail,
  FileSignature,
  CalendarClock,
  BellRing,
  X,
  RotateCcw,
  Archive,
  History,
  ShieldAlert,
  Printer,
  Users,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Building2,
  Trophy,
  User,
  Truck,
  ArrowRight,
  ArrowLeft,
  Search,
  MessagesSquare,
  FileText,
  ImageOff,
  Plus,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { infoRelance } from "@/lib/contrats";
import { PARTENAIRES } from "@/lib/partenaires";
import DatePicker from "@/components/ui/DatePicker";
import Select from "@/components/ui/Select";
import DocumentUpload from "@/components/ui/DocumentUpload";
import FiltreTri from "@/components/ui/FiltreTri";
import MenuCategorie from "@/components/ui/MenuCategorie";
import MessagesAdmin from "@/components/messages/MessagesAdmin";
import SignalerDocument from "@/components/messages/SignalerDocument";
import DashboardShell, { type NavItem } from "@/components/ui/DashboardShell";

// Construit un lien WhatsApp pré-rempli (format wa.me standard).
// Le numéro est nettoyé (chiffres uniquement, sans + ni espaces).
function lienWhatsApp(telephone: string | undefined, message: string): string | null {
  if (!telephone) return null;
  const numero = telephone.replace(/\D/g, "");
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(message)}`;
}

// Date courte lisible (ex. "5 juin 2026").
function dateCourte(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "short", year: "numeric" });
}

// Date + heure lisibles (ex. "5 juin 2026 à 14:32").
function dateHeure(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso)
    .toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    .replace(",", " à");
}

// ─────────────────────────────────────────────────────────────
// Back-office KARHON Assurances — réservé aux administrateurs.
//
// Sécurité : la page est protégée DEUX fois.
//  1) Côté client (ici) : on vérifie /api/auth/me et le rôle ;
//     un non-admin est immédiatement redirigé.
//  2) Côté serveur (les routes /api/devis) : exigerAdmin() bloque
//     toute requête d'un non-admin, même s'il devine l'URL.
// La vraie barrière de sécurité est la #2 ; la #1 est l'UX.
// ─────────────────────────────────────────────────────────────

type UserAdmin = { nom?: string; prenom?: string; email?: string; telephone?: string };

type PropositionAdmin = {
  id: string;
  compagnie: string;
  documents: string[];
  prime?: number | null;
  message?: string | null;
  choisie: boolean;
};

type DevisAdmin = {
  id: string;
  userId?: string;
  dateCreation: string;
  statut: string;
  montantEstime: number | null;
  description: string;
  documents?: string[];
  reponses?: Record<string, string> | null;
  telephoneContact?: string | null;
  modePaiement?: string | null;
  montantAPayer?: number | null;
  lienPaiement?: string | null;
  derniereRelance?: string | null;
  nombreRelances?: number;
  supprimePar?: string | null;
  supprimeLe?: string | null;
  produit?: { nom?: string; type?: string };
  user?: UserAdmin;
  propositions?: PropositionAdmin[];
};

type SinistreAdmin = {
  id: string;
  userId?: string;
  dateDeclaration: string;
  dateSurvenance: string;
  heureSurvenance: string | null;
  lieu: string | null;
  statut: string;
  typeAssurance: string | null;
  montantEstime: number | null;
  description: string;
  documents?: string[];
  derniereRelance?: string | null;
  nombreRelances?: number;
  supprimePar?: string | null;
  supprimeLe?: string | null;
  user?: UserAdmin;
};

type ContratAdmin = {
  id: string;
  numeroContrat: string;
  dateDebut: string;
  dateFin: string;
  dureeMois: number;
  primeAnnuelle: number;
  segment?: string | null;
  compagnie?: string | null;
  statut: string;
  derniereRelance?: string | null;
  nombreRelances?: number;
  supprimePar?: string | null;
  supprimeLe?: string | null;
  produit?: { nom?: string; type?: string };
  user?: UserAdmin;
};

type JournalEntree = {
  id: string;
  action: string;
  entite: string;
  entiteId: string;
  resume?: string | null;
  auteurEmail: string;
  auteurNom?: string | null;
  createdAt: string;
};

type RendezVousAdmin = {
  id: string;
  dateHeure: string;
  statut: string;
  motif: string;
  notes?: string | null;
  user?: UserAdmin;
};

type TrimestrePoint = { label: string; clients: number; devis: number; souscriptions: number; sinistres: number };
type Apercu = {
  clients: number;
  devisTotal: number;
  devisParStatut: Record<string, number>;
  contratsActifs: number;
  echeancesProches: number;
  sinistresTotal: number;
  sinistresEnCours: number;
  tauxConversion: number;
  trimestres: TrimestrePoint[];
};

// Graphe d'évolution trimestriel : courbes lisses animées (Recharts).
//   Tooltips au survol, légende cliquable, animation d'entrée par courbe.
function GrapheTrimestriel({ data }: { data: TrimestrePoint[] }) {
  const courbes = [
    { cle: "clients", nom: "Nouveaux clients", couleur: "#1a2e5a" },
    { cle: "devis", nom: "Cotations reçues", couleur: "#2a8a8a" },
    { cle: "souscriptions", nom: "Souscriptions", couleur: "#16a34a" },
    { cle: "sinistres", nom: "Sinistres", couleur: "#f59e0b" },
  ];
  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 10, right: 20, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eef4f4" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#1a2e5a", fontSize: 12 }} axisLine={{ stroke: "#e0ecec" }} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e0ecec", fontSize: 13 }} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {courbes.map((c) => (
          <Line
            key={c.cle}
            type="monotone"
            dataKey={c.cle}
            name={c.nom}
            stroke={c.couleur}
            strokeWidth={3}
            dot={{ r: 3, strokeWidth: 0, fill: c.couleur }}
            activeDot={{ r: 5 }}
            animationDuration={900}
            animationEasing="ease-in-out"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// Galerie des pièces jointes (format "Libellé|url") : grande image, slider
// (suivante / précédente) et IMAGE PAR DÉFAUT quand il n'y a aucune pièce.
function PiecesJointes({ documents }: { documents?: string[] }) {
  const [i, setI] = useState(0);
  const items =
    documents && documents.length > 0
      ? documents.map((doc) => {
          const sep = doc.indexOf("|");
          return { libelle: sep > 0 ? doc.slice(0, sep) : "Document", url: sep > 0 ? doc.slice(sep + 1) : doc, defaut: false };
        })
      : [{ libelle: "Aucune pièce jointe", url: "", defaut: true }];
  const idx = Math.min(i, items.length - 1);
  const courant = items[idx];
  const estPdf = !courant.defaut && courant.url.toLowerCase().includes(".pdf");
  const aller = (d: number) => setI((p) => (p + d + items.length) % items.length);
  const [apercu, setApercu] = useState<{ url: string; pdf: boolean } | null>(null);

  return (
    <div className="w-full flex-1 flex flex-col min-h-[240px]">
      <p className="text-xs font-semibold mb-2" style={{ color: "#1a2e5a" }}>
        Pièces jointes{documents?.length ? ` (${documents.length})` : ""}
      </p>
      <div className="relative rounded-2xl overflow-hidden border flex-1 min-h-[200px]" style={{ borderColor: "#e0ecec", background: "linear-gradient(135deg, #eef6f6, #ffffff)" }}>
        {courant.defaut ? (
          <>
            <div className="absolute inset-0 pointer-events-none opacity-60" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #cfe6e6 1px, transparent 0)", backgroundSize: "16px 16px" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)", color: "#ffffff" }}>
                <ImageOff size={38} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1a2e5a" }}>Aucune pièce jointe</p>
                <p className="text-xs text-gray-400 mt-0.5">Le client n&apos;a transmis aucun document</p>
              </div>
            </div>
          </>
        ) : estPdf ? (
          <button type="button" onClick={() => setApercu({ url: courant.url, pdf: true })} className="absolute inset-0 flex flex-col items-center justify-center gap-2" style={{ color: "#2a8a8a" }}>
            <FileText size={48} strokeWidth={1.5} />
            <span className="text-sm font-medium">Aperçu du PDF</span>
          </button>
        ) : (
          <button type="button" onClick={() => setApercu({ url: courant.url, pdf: false })} className="absolute inset-0 block cursor-zoom-in" title="Agrandir">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={courant.url} alt={courant.libelle} className="w-full h-full object-cover" />
          </button>
        )}

        {items.length > 1 && (
          <>
            <button type="button" onClick={() => aller(-1)} aria-label="Précédente" className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center transition-transform hover:scale-110" style={{ color: "#1a2e5a" }}>
              <ArrowLeft size={16} />
            </button>
            <button type="button" onClick={() => aller(1)} aria-label="Suivante" className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 shadow flex items-center justify-center transition-transform hover:scale-110" style={{ color: "#1a2e5a" }}>
              <ArrowRight size={16} />
            </button>
            <span className="absolute bottom-2 right-2 text-[11px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: "rgba(15,23,42,0.6)" }}>
              {idx + 1} / {items.length}
            </span>
          </>
        )}
      </div>

      <p className="text-[11px] text-gray-500 mt-1.5 truncate">{courant.libelle}</p>

      {items.length > 1 && (
        <div className="flex gap-1.5 mt-2">
          {items.map((_, k) => (
            <button key={k} type="button" onClick={() => setI(k)} aria-label={`Image ${k + 1}`} className="h-1.5 rounded-full transition-all" style={{ width: k === idx ? 18 : 6, background: k === idx ? "#2a8a8a" : "#cfe0e0" }} />
          ))}
        </div>
      )}

      {/* Aperçu en superposition (reste sur la même page, pas de redirection) */}
      {apercu && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-8" style={{ background: "rgba(10,18,30,0.82)" }} onClick={() => setApercu(null)}>
          <button type="button" onClick={() => setApercu(null)} aria-label="Fermer" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors">
            <X size={20} />
          </button>
          <div className="w-full max-w-4xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {apercu.pdf ? (
              <iframe src={apercu.url} title="Aperçu du document" className="w-full h-[85vh] rounded-2xl bg-white shadow-2xl" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={apercu.url} alt="Aperçu" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type StatutInfo = { value: string; label: string; couleur: string; fond: string };

// Libellés + couleurs des statuts (alignés sur l'enum StatutDevis).
const STATUTS: StatutInfo[] = [
  { value: "en_attente", label: "En attente", couleur: "#92600a", fond: "#fef3c7" },
  { value: "en_cours", label: "En cours", couleur: "#1e40af", fond: "#dbeafe" },
  { value: "envoye", label: "Envoyé", couleur: "#5b21b6", fond: "#ede9fe" },
  { value: "choisi", label: "Offre choisie · à encaisser", couleur: "#9a3412", fond: "#ffedd5" },
  { value: "paye", label: "Payé · à valider", couleur: "#0e7490", fond: "#cffafe" },
  { value: "accepte", label: "Souscrit", couleur: "#166534", fond: "#dcfce7" },
  { value: "refuse", label: "Refusé", couleur: "#991b1b", fond: "#fee2e2" },
];

// Libellés lisibles des modes de paiement.
const MODE_LABEL: Record<string, string> = { cheque: "Chèque", wave: "Wave", orange_money: "Orange Money" };

// Libellés + couleurs des statuts de sinistre (alignés sur l'enum StatutSinistre).
const STATUTS_SINISTRE: StatutInfo[] = [
  { value: "declare", label: "Déclaré", couleur: "#92600a", fond: "#fef3c7" },
  { value: "en_cours", label: "En cours", couleur: "#1e40af", fond: "#dbeafe" },
  { value: "indemnise", label: "Indemnisé", couleur: "#166534", fond: "#dcfce7" },
  { value: "refuse", label: "Refusé", couleur: "#991b1b", fond: "#fee2e2" },
];

const infoStatut = (v: string) =>
  STATUTS.find((s) => s.value === v) ?? STATUTS[0];

const infoStatutSinistre = (v: string) =>
  STATUTS_SINISTRE.find((s) => s.value === v) ?? STATUTS_SINISTRE[0];

// ── Dropdown de statut « premium » (remplace le <select> natif) ──
function StatutDropdown({
  valeur,
  onChange,
  disabled,
  options = STATUTS,
}: {
  valeur: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  options?: StatutInfo[];
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const courant = options.find((s) => s.value === valeur) ?? options[0];

  // Largeur du menu (px). On l'aligne sous le bouton et on le borne à l'écran.
  const MENU_W = 208;

  // Calcule la position du menu à partir du bouton (coordonnées écran).
  // Le menu est rendu en position: fixed → il échappe à tout overflow-hidden parent.
  const positionner = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const marge = 8;
    let left = r.right - MENU_W;                       // aligné à droite du bouton
    left = Math.max(marge, Math.min(left, window.innerWidth - MENU_W - marge));
    setCoords({ top: r.bottom + 6, left, width: MENU_W });
  };

  const basculer = () => {
    if (!open) positionner();
    setOpen((o) => !o);
  };

  // Ferme au clic/tap extérieur (pointerdown = souris + tactile).
  // Repositionne ou ferme au scroll/redimensionnement.
  useEffect(() => {
    if (!open) return;
    const dehors = (e: Event) => {
      const cible = e.target as Node;
      if (
        btnRef.current && !btnRef.current.contains(cible) &&
        menuRef.current && !menuRef.current.contains(cible)
      ) {
        setOpen(false);
      }
    };
    const onScroll = () => setOpen(false);
    document.addEventListener("pointerdown", dehors);
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", dehors);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        disabled={disabled}
        onClick={basculer}
        className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all hover:shadow-sm disabled:opacity-50"
        style={{ background: courant.fond, color: courant.couleur, minWidth: "150px" }}
      >
        <span className="h-2 w-2 rounded-full" style={{ background: courant.couleur }} />
        <span className="flex-1 text-left">{courant.label}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={15} />
        </motion.span>
      </button>

      <AnimatePresence>
        {open && coords && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="overflow-hidden rounded-2xl bg-white p-1.5"
            style={{
              position: "fixed",
              top: coords.top,
              left: coords.left,
              width: coords.width,
              zIndex: 200,
              border: "1px solid #e0ecec",
              boxShadow: "0 16px 40px rgba(26,46,90,0.16)",
            }}
          >
            {options.map((s) => {
              const actif = s.value === valeur;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    onChange(s.value);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                  style={{ background: actif ? "rgba(42,138,138,0.08)" : "transparent", color: "#1a2e5a" }}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.couleur }} />
                  <span className="flex-1 text-left">{s.label}</span>
                  {actif && <Check size={15} style={{ color: "#2a8a8a" }} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Boutons d'action d'une ligne : Relancer (email + WhatsApp) et Supprimer.
function ActionsLigne({
  enCours,
  onRelance,
  onSupprimer,
}: {
  enCours: boolean;
  onRelance: () => void;
  onSupprimer: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={enCours}
        onClick={onRelance}
        title="Relancer le client (email + WhatsApp)"
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all hover:shadow-sm disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
      >
        {enCours ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
        Relancer
      </button>
      <button
        type="button"
        disabled={enCours}
        onClick={onSupprimer}
        title="Supprimer définitivement"
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:bg-red-50 disabled:opacity-50"
        style={{ border: "1px solid #f7caca", color: "#b42318" }}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

// Une ligne d'élément archivé, avec actions Restaurer / Purger (gérant).
function LigneArchive({
  type,
  titre,
  sousTitre,
  par,
  le,
  dateEnvoi,
  enCours,
  onRestaurer,
  onPurger,
}: {
  type: string;
  titre: string;
  sousTitre: string;
  par?: string | null;
  le?: string | null;
  dateEnvoi?: string | null;
  enCours: boolean;
  onRestaurer: () => void;
  onPurger: () => void;
}) {
  const TYPE_LABEL: Record<string, string> = { devis: "Cotation", sinistres: "Sinistre", contrats: "Souscription" };
  return (
    <div className="px-6 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md" style={{ background: "#eef2f7", color: "#64748b" }}>
            {TYPE_LABEL[type] ?? type}
          </span>
          <span className="font-semibold" style={{ color: "#1a2e5a" }}>{titre}</span>
        </div>
        <p className="text-sm text-gray-500 mt-0.5">{sousTitre}</p>
        {dateEnvoi && (
          <p className="text-xs text-gray-400 mt-0.5">Envoyé le {dateHeure(dateEnvoi)}</p>
        )}
        <p className="text-xs mt-0.5" style={{ color: "#b42318" }}>
          Archivé par <strong>{par ?? "—"}</strong>{le ? ` le ${dateHeure(le)}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={enCours}
          onClick={onRestaurer}
          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:shadow-sm disabled:opacity-50"
          style={{ border: "1px solid #cfe3e3", color: "#166534", background: "#f0fdf4" }}
        >
          {enCours ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Restaurer
        </button>
        <button
          type="button"
          disabled={enCours}
          onClick={onPurger}
          title="Supprimer définitivement"
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:bg-red-100 disabled:opacity-50"
          style={{ border: "1px solid #f7caca", color: "#b42318", background: "#fef2f2" }}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
}

// Modale de conversion d'un devis en contrat (durée, prime, date de début).
const DUREES = [
  { mois: 1, label: "1 mois" },
  { mois: 2, label: "2 mois" },
  { mois: 3, label: "3 mois" },
  { mois: 6, label: "6 mois" },
  { mois: 12, label: "1 an" },
];

function ConversionModal({
  devis,
  enCours,
  onClose,
  onSubmit,
}: {
  devis: DevisAdmin;
  enCours: boolean;
  onClose: () => void;
  onSubmit: (p: { devisId: string; dureeMois: number; primeAnnuelle: number; dateDebut: string; compagnie: string }) => void;
}) {
  const aujourdhui = new Date().toISOString().split("T")[0];
  const [dureeMois, setDureeMois] = useState(12);
  const [prime, setPrime] = useState("");
  const [dateDebut, setDateDebut] = useState(aujourdhui);
  const [compagnie, setCompagnie] = useState("");

  const valide = prime !== "" && Number(prime) >= 0 && dateDebut !== "" && compagnie !== "";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.45)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 flex items-center justify-between rounded-t-3xl" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
          <div className="flex items-center gap-2.5 text-white">
            <FileSignature size={20} />
            <h3 className="font-bold">Enregistrer la souscription</h3>
          </div>
          <button type="button" onClick={onClose} className="text-white/80 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#f5fbfb", color: "#1a2e5a" }}>
            <p className="font-semibold">{devis.produit?.nom}</p>
            <p className="text-gray-500 text-xs mt-0.5">{devis.user?.prenom} {devis.user?.nom} · {devis.user?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durée souscrite</label>
            <div className="flex flex-wrap gap-2">
              {DUREES.map((d) => {
                const actif = d.mois === dureeMois;
                return (
                  <button
                    key={d.mois}
                    type="button"
                    onClick={() => setDureeMois(d.mois)}
                    className="px-3.5 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={actif
                      ? { background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", color: "#fff" }
                      : { background: "#f1f5f9", color: "#1a2e5a" }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Select
            label="Compagnie partenaire"
            name="compagnie"
            value={compagnie}
            onChange={(e) => setCompagnie(e.target.value)}
            options={PARTENAIRES.map((p) => ({ value: p, label: p }))}
            required
          />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prime (FCFA)</label>
              <input
                type="number"
                min={0}
                value={prime}
                onChange={(e) => setPrime(e.target.value)}
                placeholder="Ex. 150000"
                className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none"
                style={{ borderColor: "#e0ecec" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date de début</label>
              <DatePicker value={dateDebut} onChange={setDateDebut} placeholder="Choisir une date" />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              disabled={!valide || enCours}
              onClick={() => onSubmit({ devisId: devis.id, dureeMois, primeAnnuelle: Number(prime), dateDebut, compagnie })}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
            >
              {enCours ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Enregistrer la souscription
            </button>
            <button type="button" onClick={onClose} className="px-5 py-3 rounded-xl font-semibold text-sm border" style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}>
              Annuler
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);
  const [estGerant, setEstGerant] = useState(false);
  const [profil, setProfil] = useState<{ nom?: string; prenom?: string; email?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [devis, setDevis] = useState<DevisAdmin[]>([]);
  const [sinistres, setSinistres] = useState<SinistreAdmin[]>([]);
  const [contrats, setContrats] = useState<ContratAdmin[]>([]);
  // Devis en cours de conversion en contrat (ouvre la modale).
  const [conversion, setConversion] = useState<DevisAdmin | null>(null);
  // Envoi de propositions (cotations) sur un devis — on peut en envoyer plusieurs.
  type PropLigne = { compagnie: string; docs: string[]; prime: string; message: string };
  const propVide = (): PropLigne => ({ compagnie: "", docs: [], prime: "", message: "" });
  const [propPour, setPropPour] = useState<DevisAdmin | null>(null);
  const [propProps, setPropProps] = useState<PropLigne[]>([propVide()]);
  const [propEnvoi, setPropEnvoi] = useState(false);
  const majProp = (i: number, champ: keyof PropLigne, valeur: string | string[]) =>
    setPropProps((arr) => arr.map((p, k) => (k === i ? ({ ...p, [champ]: valeur } as PropLigne) : p)));
  // Archives + journal d'audit (gérant uniquement).
  const [archDevis, setArchDevis] = useState<DevisAdmin[]>([]);
  const [archSinistres, setArchSinistres] = useState<SinistreAdmin[]>([]);
  const [archContrats, setArchContrats] = useState<ContratAdmin[]>([]);
  const [journal, setJournal] = useState<JournalEntree[]>([]);
  const [apercu, setApercu] = useState<Apercu | null>(null);
  const [vue, setVue] = useState<"accueil" | "devis" | "sinistres" | "souscriptions" | "compagnies" | "messages" | "rdv" | "gerant">("accueil");
  const [messagesNonLus, setMessagesNonLus] = useState(0);
  const [convCible, setConvCible] = useState<string | null>(null); // conversation à ouvrir (clic notif)
  const [archRecherche, setArchRecherche] = useState("");
  const [archTri, setArchTri] = useState("date");
  const [archSens, setArchSens] = useState<"asc" | "desc">("desc");
  const [archPeriode, setArchPeriode] = useState("tout");
  const [rendezVous, setRendezVous] = useState<RendezVousAdmin[]>([]);
  const [recherche, setRecherche] = useState("");
  const [triChamp, setTriChamp] = useState<string>("date");
  const [triSens, setTriSens] = useState<"asc" | "desc">("desc");
  const [periode, setPeriode] = useState<string>("tout");
  // Souscriptions : catégorie ouverte (null = on affiche les cartes de catégories).
  const [categorieVue, setCategorieVue] = useState<string | null>(null);
  // Réinitialise tri + période + catégorie quand on change d'onglet.
  // La conversation ciblée n'est gardée que sur l'onglet Messages.
  useEffect(() => { setTriChamp("date"); setTriSens("desc"); setPeriode("tout"); setCategorieVue(null); if (vue !== "messages") setConvCible(null); }, [vue]);

  // Au chargement (clic notif / lien e-mail), ouvre l'onglet et l'élément ciblés (?onglet=…&ref=…).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const o = params.get("onglet");
    const ref = params.get("ref");
    if (o) setVue(o as typeof vue);
    if (ref) setConvCible(ref);
  }, []);

  // ── Journal d'audit : recherche + filtre + pagination CÔTÉ SERVEUR ──
  const JOURNAL_TAILLE = 20;
  const [journalQ, setJournalQ] = useState("");
  const [journalAction, setJournalAction] = useState(""); // "" | archivage | restauration | purge
  const [journalPage, setJournalPage] = useState(1);
  const [journalTotal, setJournalTotal] = useState(0);
  const [journalChargement, setJournalChargement] = useState(false);
  const [journalTri, setJournalTri] = useState("date");
  const [journalSens, setJournalSens] = useState<"asc" | "desc">("desc");
  const [journalPeriode, setJournalPeriode] = useState("tout");

  const chargerJournal = useCallback(async () => {
    if (!estGerant) return;
    setJournalChargement(true);
    try {
      const params = new URLSearchParams({ page: String(journalPage), pageSize: String(JOURNAL_TAILLE), tri: journalTri, sens: journalSens, periode: journalPeriode });
      if (journalQ.trim()) params.set("q", journalQ.trim());
      if (journalAction) params.set("action", journalAction);
      const r = await fetch(`/api/journal?${params.toString()}`);
      const d = r.ok ? await r.json() : { entrees: [], total: 0 };
      setJournal(Array.isArray(d.entrees) ? d.entrees : []);
      setJournalTotal(typeof d.total === "number" ? d.total : 0);
    } catch {
      setJournal([]); setJournalTotal(0);
    } finally {
      setJournalChargement(false);
    }
  }, [estGerant, journalPage, journalQ, journalAction, journalTri, journalSens, journalPeriode]);

  // Recharge le journal quand on ouvre l'onglet gérant ou qu'un critère change
  // (la saisie est « débouncée » pour ne pas requêter à chaque frappe).
  useEffect(() => {
    if (vue !== "gerant" || !estGerant) return;
    const t = setTimeout(() => { chargerJournal(); }, 250);
    return () => clearTimeout(t);
  }, [vue, estGerant, chargerJournal]);

  // Revient à la page 1 quand la recherche, le filtre, le tri ou la période change.
  useEffect(() => { setJournalPage(1); }, [journalQ, journalAction, journalTri, journalSens, journalPeriode]);

  // Compteur de messages non lus (pour la pastille de l'onglet Messages).
  useEffect(() => {
    if (!autorise) return;
    let stop = false;
    const charger = () => fetch("/api/messages?count=1")
      .then((r) => (r.ok ? r.json() : { nonLus: 0 }))
      .then((d) => { if (!stop) setMessagesNonLus(d.nonLus ?? 0); })
      .catch(() => {});
    charger();
    const t = setInterval(charger, 30000);
    return () => { stop = true; clearInterval(t); };
  }, [autorise, vue]);
  const [majId, setMajId] = useState<string | null>(null);
  const [majSinistreId, setMajSinistreId] = useState<string | null>(null);
  // Id en cours d'action (suppression / relance) pour afficher le spinner.
  const [actionId, setActionId] = useState<string | null>(null);
  // Bandeau de retour transitoire (résultat d'une relance / suppression).
  const [notif, setNotif] = useState<{ type: "ok" | "warn" | "err"; texte: string } | null>(null);
  // Filtre actif : "tous" ou une valeur de statut. Piloté par les cartes.
  const [filtre, setFiltre] = useState<string>("tous");

  // Affiche un message transitoire (auto-effacé après 6 s).
  const afficherNotif = (type: "ok" | "warn" | "err", texte: string) => {
    setNotif({ type, texte });
    window.setTimeout(() => setNotif(null), 6000);
  };

  // 1) Contrôle d'accès : doit être connecté ET admin.
  useEffect(() => {
    let annule = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (annule) return;
        const role = data.utilisateur?.role;
        if (["agent", "gerant", "admin"].includes(role)) {
          setAutorise(true);
          setProfil(data.utilisateur ?? null);
          setEstGerant(["gerant", "admin"].includes(role)); // admin = ancien rôle, traité comme gérant
        } else {
          router.push("/client/dashboard"); // client connecté → son espace
        }
      })
      .catch(() => {
        if (!annule) router.push("/client"); // non connecté → connexion
      });
    return () => {
      annule = true;
    };
  }, [router]);

  // 2) Charge tous les devis ET tous les sinistres (l'API renvoie TOUT pour un admin).
  useEffect(() => {
    if (!autorise) return;
    Promise.all([
      fetch("/api/devis").then((res) => (res.ok ? res.json() : { devis: [] })),
      fetch("/api/sinistres").then((res) => (res.ok ? res.json() : { sinistres: [] })),
      fetch("/api/contrats").then((res) => (res.ok ? res.json() : { contrats: [] })),
      fetch("/api/rendez-vous").then((res) => (res.ok ? res.json() : { rendezVous: [] })),
    ])
      .then(([dDevis, dSin, dCon, dRdv]) => {
        if (Array.isArray(dDevis.devis)) setDevis(dDevis.devis);
        if (Array.isArray(dSin.sinistres)) setSinistres(dSin.sinistres);
        if (Array.isArray(dCon.contrats)) setContrats(dCon.contrats);
        if (Array.isArray(dRdv.rendezVous)) setRendezVous(dRdv.rendezVous);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [autorise]);

  // 2bis) Indicateurs et série trimestrielle (calculés côté serveur).
  useEffect(() => {
    if (!autorise) return;
    fetch("/api/stats")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d && typeof d.clients === "number") setApercu(d); })
      .catch(() => {});
  }, [autorise]);

  // 3) Données réservées au gérant : archives (éléments supprimés).
  //    Le journal d'audit est chargé séparément (recherche + pagination serveur).
  useEffect(() => {
    if (!autorise || !estGerant) return;
    Promise.all([
      fetch("/api/devis?archives=1").then((r) => (r.ok ? r.json() : { devis: [] })),
      fetch("/api/sinistres?archives=1").then((r) => (r.ok ? r.json() : { sinistres: [] })),
      fetch("/api/contrats?archives=1").then((r) => (r.ok ? r.json() : { contrats: [] })),
    ])
      .then(([dD, dS, dC]) => {
        if (Array.isArray(dD.devis)) setArchDevis(dD.devis);
        if (Array.isArray(dS.sinistres)) setArchSinistres(dS.sinistres);
        if (Array.isArray(dC.contrats)) setArchContrats(dC.contrats);
      })
      .catch(() => {});
  }, [autorise, estGerant]);

  const seDeconnecter = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/"); // retour à la page d'accueil principale
  };

  // Ouvre la fenêtre d'envoi de propositions (repart d'une proposition vide).
  const ouvrirProposition = (d: DevisAdmin) => {
    setPropPour(d); setPropProps([propVide()]);
  };

  // Envoie UNE OU PLUSIEURS propositions pour le devis sélectionné.
  const envoyerProposition = async () => {
    if (!propPour) return;
    // Validation : chaque proposition doit avoir au moins une fiche de cotation.
    const valides = propProps.filter((p) => p.docs.length > 0);
    if (valides.length === 0) {
      setNotif({ type: "warn", texte: "Joignez au moins une fiche de cotation (PDF)." });
      return;
    }
    setPropEnvoi(true);
    try {
      const res = await fetch(`/api/devis/${propPour.id}/propositions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propositions: valides.map((p) => ({
            compagnie: p.compagnie.trim(),
            documents: p.docs.map((u, k) => `${p.docs.length > 1 ? `Cotation ${k + 1}` : "Cotation"}|${u}`),
            prime: p.prime ? Number(p.prime) : undefined,
            message: p.message,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setNotif({ type: "err", texte: data.erreur ?? "Envoi impossible." }); return; }
      // Le devis passe en "envoyé" ; on recharge pour récupérer les propositions créées.
      setDevis((prev) => prev.map((d) => d.id === propPour.id ? { ...d, statut: "envoye" } : d));
      rechargerActifs();
      setNotif({ type: "ok", texte: `${data.nombre ?? valides.length} proposition(s) envoyée(s) au client.` });
      setPropPour(null);
    } catch {
      setNotif({ type: "err", texte: "Erreur réseau lors de l'envoi." });
    } finally {
      setPropEnvoi(false);
    }
  };

  // ── Encaissement : montant à régler + lien de paiement + confirmation ──
  const [lienInputs, setLienInputs] = useState<Record<string, string>>({});
  const [montantInputs, setMontantInputs] = useState<Record<string, string>>({});
  const [paieId, setPaieId] = useState<string | null>(null);

  const communiquerMontant = async (d: DevisAdmin) => {
    const montant = (montantInputs[d.id] ?? "").trim();
    if (!montant || Number(montant) < 0) { setNotif({ type: "warn", texte: "Saisissez le montant à régler." }); return; }
    setPaieId(d.id);
    try {
      const res = await fetch(`/api/devis/${d.id}/paiement`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ montant: Number(montant) }) });
      const data = await res.json();
      if (!res.ok) { setNotif({ type: "err", texte: data.erreur ?? "Échec." }); return; }
      setDevis((prev) => prev.map((x) => (x.id === d.id ? { ...x, montantAPayer: Number(montant) } : x)));
      setNotif({ type: "ok", texte: "Montant communiqué au client." });
    } catch { setNotif({ type: "err", texte: "Erreur réseau." }); }
    finally { setPaieId(null); }
  };

  const envoyerLienPaiement = async (d: DevisAdmin) => {
    const lien = (lienInputs[d.id] ?? "").trim();
    if (!/^https?:\/\//i.test(lien)) { setNotif({ type: "warn", texte: "Saisissez un lien valide (https://…)." }); return; }
    setPaieId(d.id);
    try {
      const res = await fetch(`/api/devis/${d.id}/paiement`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lien }) });
      const data = await res.json();
      if (!res.ok) { setNotif({ type: "err", texte: data.erreur ?? "Échec." }); return; }
      setDevis((prev) => prev.map((x) => (x.id === d.id ? { ...x, lienPaiement: lien } : x)));
      setNotif({ type: "ok", texte: "Lien de paiement envoyé au client." });
    } catch { setNotif({ type: "err", texte: "Erreur réseau." }); }
    finally { setPaieId(null); }
  };

  const confirmerPaiement = async (d: DevisAdmin) => {
    setPaieId(d.id);
    try {
      const res = await fetch(`/api/devis/${d.id}/paiement`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmer: true }) });
      const data = await res.json();
      if (!res.ok) { setNotif({ type: "err", texte: data.erreur ?? "Échec." }); return; }
      setDevis((prev) => prev.map((x) => (x.id === d.id ? { ...x, statut: "paye" } : x)));
      setNotif({ type: "ok", texte: "Paiement confirmé. Vous pouvez valider la souscription." });
    } catch { setNotif({ type: "err", texte: "Erreur réseau." }); }
    finally { setPaieId(null); }
  };

  // Envoie une proposition au client via WhatsApp (message + lien vers la fiche).
  const propositionWhatsApp = async (d: DevisAdmin, p: PropositionAdmin) => {
    const prenom = d.user?.prenom ?? "";
    const lienFiche = (p.documents[0] ?? "").split("|")[1] ?? "";
    const message =
      `Bonjour ${prenom},\n\n` +
      `Voici notre proposition de cotation pour ${d.produit?.nom ?? ""}${p.compagnie ? ` (${p.compagnie})` : ""}` +
      (typeof p.prime === "number" ? ` — prime : ${p.prime.toLocaleString("fr-FR")} FCFA` : "") + ".\n" +
      (lienFiche ? `Consultez la fiche détaillée : ${lienFiche}\n` : "") +
      (p.message ? `\n${p.message}\n` : "") +
      `\nÀ votre disposition,\n` +
      `KARHON Assurances — Cabinet de courtage, Abidjan\n` +
      `Tel : +2250787103939 / +2250576367272`;

    const tel = d.telephoneContact || d.user?.telephone;
    const lien = lienWhatsApp(tel, message);
    if (!lien) { afficherNotif("warn", "Aucun numéro de téléphone pour ce client."); return; }
    try { await navigator.clipboard.writeText(message); } catch { /* presse-papier bloqué */ }
    window.open(lien, "_blank", "noopener,noreferrer");
    afficherNotif("ok", "WhatsApp ouvert — si le texte ne s'affiche pas, collez-le avec Ctrl+V.");
  };

  // Change le statut d'un devis via PATCH /api/devis/[id].
  const changerStatut = async (id: string, statut: string) => {
    setMajId(id);
    try {
      const res = await fetch(`/api/devis/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      if (res.ok) {
        const data = await res.json();
        setDevis((prev) => prev.map((d) => (d.id === id ? { ...d, statut: data.devis.statut } : d)));
      }
    } finally {
      setMajId(null);
    }
  };

  // Change le statut d'un sinistre via PATCH /api/sinistres/[id].
  const changerStatutSinistre = async (id: string, statut: string) => {
    setMajSinistreId(id);
    try {
      const res = await fetch(`/api/sinistres/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      if (res.ok) {
        const data = await res.json();
        setSinistres((prev) => prev.map((s) => (s.id === id ? { ...s, statut: data.sinistre.statut } : s)));
      }
    } finally {
      setMajSinistreId(null);
    }
  };

  // Change le statut d'un rendez-vous via PATCH /api/rendez-vous/[id].
  const changerStatutRdv = async (id: string, statut: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/rendez-vous/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      });
      if (res.ok) {
        const data = await res.json();
        setRendezVous((prev) => prev.map((r) => (r.id === id ? { ...r, statut: data.rendezVous.statut } : r)));
      }
    } finally {
      setActionId(null);
    }
  };

  // Recharge les listes ACTIVES (après restauration notamment).
  const rechargerActifs = async () => {
    const [dD, dS, dC] = await Promise.all([
      fetch("/api/devis").then((r) => (r.ok ? r.json() : { devis: [] })),
      fetch("/api/sinistres").then((r) => (r.ok ? r.json() : { sinistres: [] })),
      fetch("/api/contrats").then((r) => (r.ok ? r.json() : { contrats: [] })),
    ]);
    if (Array.isArray(dD.devis)) setDevis(dD.devis);
    if (Array.isArray(dS.sinistres)) setSinistres(dS.sinistres);
    if (Array.isArray(dC.contrats)) setContrats(dC.contrats);
  };

  // Recharge les ARCHIVES + le journal (gérant).
  const rechargerArchives = async () => {
    if (!estGerant) return;
    const [dD, dS, dC] = await Promise.all([
      fetch("/api/devis?archives=1").then((r) => (r.ok ? r.json() : { devis: [] })),
      fetch("/api/sinistres?archives=1").then((r) => (r.ok ? r.json() : { sinistres: [] })),
      fetch("/api/contrats?archives=1").then((r) => (r.ok ? r.json() : { contrats: [] })),
    ]);
    if (Array.isArray(dD.devis)) setArchDevis(dD.devis);
    if (Array.isArray(dS.sinistres)) setArchSinistres(dS.sinistres);
    if (Array.isArray(dC.contrats)) setArchContrats(dC.contrats);
    chargerJournal();
  };

  // ── ARCHIVER (suppression douce) — disponible pour tout le personnel ──
  const archiver = async (type: "devis" | "sinistres" | "contrats", id: string) => {
    if (!window.confirm("Archiver cet élément ? Il quitte la liste active. Le gérant pourra toujours le consulter et le restaurer.")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/${type}/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (type === "devis") setDevis((p) => p.filter((d) => d.id !== id));
        else if (type === "sinistres") setSinistres((p) => p.filter((s) => s.id !== id));
        else setContrats((p) => p.filter((c) => c.id !== id));
        afficherNotif("ok", "Élément archivé.");
        await rechargerArchives();
      } else {
        afficherNotif("err", "Archivage impossible.");
      }
    } catch {
      afficherNotif("err", "Erreur réseau.");
    } finally {
      setActionId(null);
    }
  };

  // ── RESTAURER un élément archivé — gérant uniquement ──
  const restaurer = async (type: "devis" | "sinistres" | "contrats", id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/${type}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurer: true }),
      });
      if (res.ok) {
        afficherNotif("ok", "Élément restauré.");
        await Promise.all([rechargerActifs(), rechargerArchives()]);
      } else {
        const d = await res.json().catch(() => ({}));
        afficherNotif("err", d.erreur || "Restauration impossible.");
      }
    } catch {
      afficherNotif("err", "Erreur réseau.");
    } finally {
      setActionId(null);
    }
  };

  // ── PURGER définitivement un élément archivé — gérant uniquement ──
  const purger = async (type: "devis" | "sinistres" | "contrats", id: string) => {
    if (!window.confirm("Supprimer DÉFINITIVEMENT cet élément ? Cette action est IRRÉVERSIBLE : la donnée sera effacée pour de bon.")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/${type}/${id}?purge=1`, { method: "DELETE" });
      if (res.ok) {
        if (type === "devis") setArchDevis((p) => p.filter((d) => d.id !== id));
        else if (type === "sinistres") setArchSinistres((p) => p.filter((s) => s.id !== id));
        else setArchContrats((p) => p.filter((c) => c.id !== id));
        afficherNotif("ok", "Élément supprimé définitivement.");
        await rechargerArchives();
      } else {
        const d = await res.json().catch(() => ({}));
        afficherNotif("err", d.erreur || "Suppression impossible.");
      }
    } catch {
      afficherNotif("err", "Erreur réseau.");
    } finally {
      setActionId(null);
    }
  };

  // ── Relance générique (devis, sinistre ou contrat) ──
  // Envoie l'email, marque la relance, puis ouvre WhatsApp pré-rempli.
  const relancer = async (type: "devis" | "sinistres" | "contrats", id: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/${type}/${id}/relance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        afficherNotif("err", data.erreur || "Relance impossible.");
        return;
      }

      // Met à jour la date/compteur de relance dans la liste concernée.
      if (type === "devis" && data.devis) {
        setDevis((prev) => prev.map((d) => (d.id === id
          ? { ...d, derniereRelance: data.devis.derniereRelance, nombreRelances: data.devis.nombreRelances }
          : d)));
      } else if (type === "sinistres" && data.sinistre) {
        setSinistres((prev) => prev.map((s) => (s.id === id
          ? { ...s, derniereRelance: data.sinistre.derniereRelance, nombreRelances: data.sinistre.nombreRelances }
          : s)));
      } else if (type === "contrats" && data.contrat) {
        setContrats((prev) => prev.map((c) => (c.id === id
          ? { ...c, derniereRelance: data.contrat.derniereRelance, nombreRelances: data.contrat.nombreRelances }
          : c)));
      }

      // Statut de l'email (configuré ou non).
      if (data.email?.ok) {
        afficherNotif("ok", "Relance enregistrée et email envoyé au client.");
      } else {
        afficherNotif("warn", `Relance enregistrée. Email non envoyé : ${data.email?.erreur ?? "service non configuré"}.`);
      }

      // Prépare le message WhatsApp. On le COPIE dans le presse-papier (fiable
      // à 100 %) ET on ouvre WhatsApp pré-rempli. Si WhatsApp n'affiche pas le
      // texte (capricieux sur desktop), l'agent n'a qu'à coller (Ctrl+V).
      const texteWa = data.whatsapp?.message ?? "";
      const lien = lienWhatsApp(data.whatsapp?.telephone, texteWa);
      if (lien) {
        let copie = false;
        try {
          await navigator.clipboard.writeText(texteWa);
          copie = true;
        } catch { /* le presse-papier peut être bloqué selon le navigateur */ }
        window.open(lien, "_blank", "noopener,noreferrer");
        if (copie) {
          afficherNotif("ok", "Message copié — si WhatsApp ne l'affiche pas, collez-le avec Ctrl+V.");
        }
      }
    } catch {
      afficherNotif("err", "Erreur réseau lors de la relance.");
    } finally {
      setActionId(null);
    }
  };

  // ── Création d'un contrat depuis un devis (souscription) ──
  const creerContrat = async (payload: {
    devisId: string;
    dureeMois: number;
    primeAnnuelle: number;
    dateDebut: string;
    compagnie: string;
  }) => {
    setActionId(payload.devisId);
    try {
      const res = await fetch("/api/contrats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        afficherNotif("err", data.erreur || "Création du contrat impossible.");
        return;
      }
      // Ajoute le contrat en tête de liste et passe le devis en "accepté".
      setContrats((prev) => [data.contrat, ...prev]);
      setDevis((prev) => prev.map((d) => (d.id === payload.devisId ? { ...d, statut: "accepte" } : d)));
      setConversion(null);
      afficherNotif("ok", `Contrat ${data.contrat.numeroContrat} créé.`);
    } catch {
      afficherNotif("err", "Erreur réseau lors de la création.");
    } finally {
      setActionId(null);
    }
  };

  // Re-catégorise une souscription existante (particulier / professionnel / transport).
  const changerSegment = async (id: string, segment: string) => {
    // Mise à jour optimiste (l'UI réagit tout de suite).
    setContrats((prev) => prev.map((c) => (c.id === id ? { ...c, segment } : c)));
    try {
      const res = await fetch(`/api/contrats/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segment }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        afficherNotif("err", data.erreur || "Changement de catégorie impossible.");
      } else {
        afficherNotif("ok", "Catégorie mise à jour.");
      }
    } catch {
      afficherNotif("err", "Erreur réseau lors du changement de catégorie.");
    }
  };

  if (loading || !autorise) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8fbfb" }}>
        <Loader2 className="animate-spin" size={36} style={{ color: "#2a8a8a" }} />
      </div>
    );
  }

  // Statistiques rapides.
  const total = devis.length;
  const enAttente = devis.filter((d) => d.statut === "en_attente").length;
  const acceptes = devis.filter((d) => d.statut === "accepte").length;
  const refuses = devis.filter((d) => d.statut === "refuse").length;

  // Devis RESTANT à traiter : tout devis pas encore réglé (ni accepté, ni refusé).
  // La pastille reste tant que tous les devis ne sont pas réglés.
  const devisATraiter = devis.filter((d) => !["accepte", "refuse"].includes(d.statut)).length;
  // À traiter : devis non réglés + sinistres ouverts + choix client à poursuivre.
  const sinistresATraiter = sinistres.filter((s) => s.statut === "declare" || s.statut === "en_cours").length;
  const choixATraiter = devis.filter((d) => d.propositions?.some((p) => p.choisie)).length;
  const aTraiter = devisATraiter + sinistresATraiter + choixATraiter;

  // Analyse du comportement client vis-à-vis des compagnies : à partir des
  // propositions envoyées (sollicitations) et de celles réellement choisies.
  const compagniesStats = (() => {
    const map = new Map<string, { envoyees: number; choisies: number }>();
    for (const d of devis) {
      for (const p of d.propositions ?? []) {
        // On n'agrège que les propositions rattachées à une compagnie nommée.
        if (!p.compagnie) continue;
        const e = map.get(p.compagnie) ?? { envoyees: 0, choisies: 0 };
        e.envoyees++;
        if (p.choisie) e.choisies++;
        map.set(p.compagnie, e);
      }
    }
    return Array.from(map.entries())
      .map(([nom, v]) => ({ nom, envoyees: v.envoyees, choisies: v.choisies, taux: v.envoyees ? Math.round((v.choisies / v.envoyees) * 100) : 0 }))
      .sort((a, b) => b.choisies - a.choisies || b.envoyees - a.envoyees);
  })();
  const totalSollicitations = compagniesStats.reduce((s, c) => s + c.envoyees, 0);
  const totalChoix = compagniesStats.reduce((s, c) => s + c.choisies, 0);

  const stats = [
    { label: "Cotations reçues", value: total, Icon: ClipboardList, filtre: "tous" },
    { label: "En attente", value: enAttente, Icon: Clock, filtre: "en_attente" },
    { label: "Acceptés", value: acceptes, Icon: CheckCircle2, filtre: "accepte" },
    { label: "Refusés", value: refuses, Icon: XCircle, filtre: "refuse" },
  ];

  // ── Recherche transversale (nom / email / téléphone / produit…) ──
  const norm = (s: unknown) =>
    String(s ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const q = norm(recherche.trim());
  // Recherche "intelligente" : on découpe la requête en mots et CHAQUE mot doit
  // se retrouver dans l'un des champs (multi-termes, ordre libre, sans accents).
  const termes = q.split(/\s+/).filter(Boolean);
  const correspond = (...champs: unknown[]) => {
    if (termes.length === 0) return true;
    const foin = norm(champs.join(" "));
    return termes.every((t) => foin.includes(t));
  };

  // ── Filtre par période (sur une date donnée) ──
  // La Côte d'Ivoire est à UTC : le calendrier UTC correspond au calendrier local.
  const dansPeriodeVal = (iso: string | null | undefined, p: string) => {
    if (p === "tout") return true;
    if (!iso) return false;
    const t = new Date(iso).getTime();
    if (Number.isNaN(t)) return false;
    const now = new Date();
    const debutJour = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    if (p === "aujourdhui") return t >= debutJour;
    if (p === "hier") return t >= debutJour - 86_400_000 && t < debutJour;
    if (p === "semaine") {
      const jour = now.getUTCDay() || 7; // lundi = 1 … dimanche = 7
      return t >= debutJour - (jour - 1) * 86_400_000;
    }
    if (p === "mois") {
      const d = new Date(iso);
      return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
    }
    if (p === "annee") return new Date(iso).getUTCFullYear() === now.getUTCFullYear();
    return true;
  };
  const dansPeriode = (iso?: string | null) => dansPeriodeVal(iso, periode);

  // ── Tri générique (selon triChamp / triSens) ──
  const sensMul = triSens === "asc" ? 1 : -1;
  const trier = <T,>(arr: T[], cle: (x: T) => string) =>
    arr.slice().sort((a, b) => {
      const va = cle(a), vb = cle(b);
      return (va < vb ? -1 : va > vb ? 1 : 0) * sensMul;
    });

  // Clés de tri par type de liste (champ inconnu → tri par date).
  const cleDevis = (d: DevisAdmin) =>
    (({ nom: norm(`${d.user?.nom ?? ""} ${d.user?.prenom ?? ""}`), email: norm(d.user?.email), telephone: norm(d.user?.telephone), type: norm(d.produit?.nom), statut: norm(d.statut) }) as Record<string, string>)[triChamp] ?? (d.dateCreation ?? "");
  const cleSinistre = (s: SinistreAdmin) =>
    (({ nom: norm(`${s.user?.nom ?? ""} ${s.user?.prenom ?? ""}`), email: norm(s.user?.email), telephone: norm(s.user?.telephone), type: norm(s.typeAssurance), statut: norm(s.statut) }) as Record<string, string>)[triChamp] ?? (s.dateDeclaration ?? "");
  const cleContrat = (c: ContratAdmin) =>
    (({ nom: norm(`${c.user?.nom ?? ""} ${c.user?.prenom ?? ""}`), email: norm(c.user?.email), numero: norm(c.numeroContrat), compagnie: norm(c.compagnie), statut: norm(c.statut) }) as Record<string, string>)[triChamp] ?? (c.dateDebut ?? "");

  // Liste affichée : filtre par statut + recherche + tri.
  const devisAffiches = trier(
    (filtre === "tous" ? devis : devis.filter((d) => d.statut === filtre))
      .filter((d) => dansPeriode(d.dateCreation) && correspond(d.user?.nom, d.user?.prenom, d.user?.email, d.user?.telephone, d.produit?.nom, d.produit?.type, d.statut, d.description)),
    cleDevis
  );
  const titreListe = filtre === "tous" ? "Toutes les demandes" : `Cotations « ${infoStatut(filtre).label} »`;

  // Recherche + tri pour les autres sections.
  const sinistresAffiches = trier(
    sinistres.filter((s) => dansPeriode(s.dateDeclaration) && correspond(s.user?.nom, s.user?.prenom, s.user?.email, s.user?.telephone, s.typeAssurance, s.statut, s.lieu, s.description)),
    cleSinistre
  );
  const contratsAffiches = trier(
    contrats.filter((c) => dansPeriode(c.dateDebut) && correspond(c.user?.nom, c.user?.prenom, c.user?.email, c.user?.telephone, c.produit?.nom, c.numeroContrat, c.compagnie, c.statut)),
    cleContrat
  );
  // Recherche dédiée aux ARCHIVES (multi-mots, indépendante de la barre globale).
  const termesArch = norm(archRecherche.trim()).split(/\s+/).filter(Boolean);
  const matchArch = (...champs: unknown[]) => termesArch.length === 0 || termesArch.every((t) => norm(champs.join(" ")).includes(t));
  const archDevisAffiches = archDevis.filter((d) =>
    matchArch(d.user?.nom, d.user?.prenom, d.user?.email, d.user?.telephone, d.produit?.nom, d.statut, d.description));
  const archSinistresAffiches = archSinistres.filter((s) =>
    matchArch(s.user?.nom, s.user?.prenom, s.user?.email, s.user?.telephone, s.typeAssurance, s.lieu, s.statut, s.description));
  const archContratsAffiches = archContrats.filter((c) =>
    matchArch(c.user?.nom, c.user?.prenom, c.user?.email, c.user?.telephone, c.produit?.nom, c.numeroContrat, c.compagnie, c.statut));
  const totalArchives = archDevis.length + archSinistres.length + archContrats.length;
  // Liste d'archives fusionnée (3 types), filtrée par période puis triée.
  const archivesListe = [
    ...archDevisAffiches.map((d) => ({ kind: "devis" as const, id: d.id, titre: d.produit?.nom ?? "Cotation", sousTitre: `${d.user?.prenom ?? ""} ${d.user?.nom ?? ""} · ${d.user?.email ?? ""}`, nom: norm(`${d.user?.nom ?? ""} ${d.user?.prenom ?? ""}`), email: norm(d.user?.email), par: d.supprimePar, le: d.supprimeLe, dateEnvoi: d.dateCreation })),
    ...archSinistresAffiches.map((s) => ({ kind: "sinistres" as const, id: s.id, titre: s.typeAssurance ?? "Sinistre", sousTitre: `${s.user?.prenom ?? ""} ${s.user?.nom ?? ""} · ${s.user?.email ?? ""}`, nom: norm(`${s.user?.nom ?? ""} ${s.user?.prenom ?? ""}`), email: norm(s.user?.email), par: s.supprimePar, le: s.supprimeLe, dateEnvoi: s.dateDeclaration })),
    ...archContratsAffiches.map((c) => ({ kind: "contrats" as const, id: c.id, titre: `${c.produit?.nom ?? "Contrat"} (${c.numeroContrat})`, sousTitre: `${c.user?.prenom ?? ""} ${c.user?.nom ?? ""} · ${c.user?.email ?? ""}`, nom: norm(`${c.user?.nom ?? ""} ${c.user?.prenom ?? ""}`), email: norm(c.user?.email), par: c.supprimePar, le: c.supprimeLe, dateEnvoi: c.dateDebut })),
  ].filter((a) => dansPeriodeVal(a.dateEnvoi, archPeriode));
  const cleArch = (a: (typeof archivesListe)[number]) =>
    archTri === "nom" ? a.nom : archTri === "email" ? a.email : archTri === "type" ? a.kind : archTri === "archivage" ? (a.le ?? "") : (a.dateEnvoi ?? "");
  const archivesTriees = archivesListe.slice().sort((x, y) => {
    const vx = cleArch(x), vy = cleArch(y);
    return (vx < vy ? -1 : vx > vy ? 1 : 0) * (archSens === "asc" ? 1 : -1);
  });
  const totalArchivesAffiches = archivesTriees.length;

  // ── Recherche-raccourci GLOBALE (transversale à tous les onglets) ──
  // Quoi qu'on tape, on retrouve les éléments correspondants du client, où
  // qu'on soit dans le back-office. Résultats groupés et cliquables.
  const rechercheActive = recherche.trim().length > 0;
  const resDevis = rechercheActive ? devis.filter((d) => correspond(d.user?.nom, d.user?.prenom, d.user?.email, d.user?.telephone, d.produit?.nom, d.produit?.type, d.statut, d.description)).slice(0, 6) : [];
  const resSinistres = rechercheActive ? sinistres.filter((s) => correspond(s.user?.nom, s.user?.prenom, s.user?.email, s.user?.telephone, s.typeAssurance, s.statut, s.lieu, s.description)).slice(0, 6) : [];
  const resContrats = rechercheActive ? contrats.filter((c) => correspond(c.user?.nom, c.user?.prenom, c.user?.email, c.user?.telephone, c.produit?.nom, c.numeroContrat, c.compagnie, c.statut)).slice(0, 6) : [];
  const resRdv = rechercheActive ? rendezVous.filter((r) => correspond(r.user?.nom, r.user?.prenom, r.user?.email, r.user?.telephone, r.motif)).slice(0, 6) : [];
  const totalRecherche = resDevis.length + resSinistres.length + resContrats.length + resRdv.length;
  // Navigue vers l'élément trouvé puis referme la recherche.
  const ouvrirResultat = (cible: typeof vue, contrat?: ContratAdmin) => {
    if (cible === "devis") setFiltre("tous");
    if (cible === "souscriptions" && contrat) setCategorieVue(contrat.segment === "professionnel" || contrat.segment === "transport" ? contrat.segment : "particulier");
    setVue(cible);
    setRecherche("");
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const navItems: NavItem[] = [
    { cle: "accueil", label: "Accueil", Icon: BarChart3 },
    { cle: "devis", label: "Cotations", Icon: ClipboardList, badge: devisATraiter },
    { cle: "sinistres", label: "Sinistres", Icon: AlertTriangle, badge: sinistresATraiter },
    { cle: "souscriptions", label: "Souscriptions", Icon: FileSignature },
    { cle: "compagnies", label: "Compagnies", Icon: Building2 },
    { cle: "messages", label: "Messages", Icon: MessagesSquare, badge: messagesNonLus },
    { cle: "rdv", label: "Rendez-vous", Icon: CalendarClock },
    ...(estGerant ? [{ cle: "gerant", label: "Espace gérant", Icon: ShieldAlert }] : []),
  ];
  const titresVue: Record<string, { t: string; s: string }> = {
    accueil: { t: "Vue d'ensemble", s: "Indicateurs clés et évolution de l'activité" },
    devis: { t: "Cotations", s: "Demandes de cotation des clients" },
    sinistres: { t: "Sinistres", s: "Déclarations et suivi des dossiers" },
    souscriptions: { t: "Souscriptions", s: "Contrats actifs et renouvellements" },
    compagnies: { t: "Compagnies", s: "Comportement clients " },
    messages: { t: "Messages", s: "Échanges avec les clients · signalement de documents" },
    rdv: { t: "Rendez-vous", s: "Créneaux demandés par les clients" },
    gerant: { t: "Espace gérant", s: "Archives et journal d'audit" },
  };
  const infoVue = titresVue[vue] ?? titresVue.accueil;

  return (
    <DashboardShell
      marque="Espace administrateur"
      items={navItems}
      actif={vue}
      onNaviger={(c, ref) => { setVue(c as typeof vue); if (ref) setConvCible(ref); }}
      titre={infoVue.t}
      sousTitre={infoVue.s}
      user={profil ?? undefined}
      onLogout={seDeconnecter}
      recherche={{ value: recherche, onChange: setRecherche, placeholder: "Rechercher un client, une cotation, un contrat, un sinistre…" }}
    >

        {/* ── Recherche-raccourci globale : résultats transversaux ── */}
        {rechercheActive && (
          <>
            <div className="fixed inset-x-0 bottom-0 top-[116px] md:top-16 z-40" onClick={() => setRecherche("")} />
            <div className="fixed left-1/2 -translate-x-1/2 top-[124px] md:top-[72px] z-50 w-[min(720px,calc(100vw-1.5rem))]">
              <div className="bg-white rounded-2xl shadow-2xl border overflow-hidden" style={{ borderColor: "#e6f0f0" }}>
                <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: "#eef4f4" }}>
                  <p className="text-xs font-semibold text-gray-500">
                    {totalRecherche} résultat{totalRecherche > 1 ? "s" : ""} pour « {recherche.trim()} »
                  </p>
                  <button onClick={() => setRecherche("")} className="text-gray-400 hover:text-gray-600" aria-label="Fermer"><X size={15} /></button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto">
                  {totalRecherche === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-400">Aucun résultat. Vérifie l&apos;orthographe ou essaie un autre terme.</div>
                  ) : (
                    <>
                      {resContrats.length > 0 && (
                        <div>
                          <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">Souscriptions</p>
                          {resContrats.map((c) => (
                            <button key={c.id} onClick={() => ouvrirResultat("souscriptions", c)} className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-gray-50">
                              <FileSignature size={16} style={{ color: "#2a8a8a" }} className="flex-shrink-0" />
                              <span className="min-w-0 flex-1">
                                <span className="text-sm font-semibold block truncate" style={{ color: "#1a2e5a" }}>{c.user?.prenom} {c.user?.nom} — {c.produit?.nom ?? "Contrat"}</span>
                                <span className="text-xs text-gray-400 block truncate">{c.numeroContrat} · {c.compagnie ?? "—"} · {c.user?.email}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {resDevis.length > 0 && (
                        <div className="border-t" style={{ borderColor: "#f3f8f8" }}>
                          <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">Cotations</p>
                          {resDevis.map((d) => (
                            <button key={d.id} onClick={() => ouvrirResultat("devis")} className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-gray-50">
                              <ClipboardList size={16} style={{ color: "#2a8a8a" }} className="flex-shrink-0" />
                              <span className="min-w-0 flex-1">
                                <span className="text-sm font-semibold block truncate" style={{ color: "#1a2e5a" }}>{d.user?.prenom} {d.user?.nom} — {d.produit?.nom ?? "Produit"}</span>
                                <span className="text-xs text-gray-400 block truncate">{d.statut.replace(/_/g, " ")} · {d.user?.email}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {resSinistres.length > 0 && (
                        <div className="border-t" style={{ borderColor: "#f3f8f8" }}>
                          <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">Sinistres</p>
                          {resSinistres.map((s) => (
                            <button key={s.id} onClick={() => ouvrirResultat("sinistres")} className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-gray-50">
                              <AlertTriangle size={16} style={{ color: "#2a8a8a" }} className="flex-shrink-0" />
                              <span className="min-w-0 flex-1">
                                <span className="text-sm font-semibold block truncate" style={{ color: "#1a2e5a" }}>{s.user?.prenom} {s.user?.nom} — {s.typeAssurance ?? "Sinistre"}</span>
                                <span className="text-xs text-gray-400 block truncate">{s.statut.replace(/_/g, " ")} · {s.user?.email}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                      {resRdv.length > 0 && (
                        <div className="border-t" style={{ borderColor: "#f3f8f8" }}>
                          <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-gray-400">Rendez-vous</p>
                          {resRdv.map((r) => (
                            <button key={r.id} onClick={() => ouvrirResultat("rdv")} className="w-full text-left px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-gray-50">
                              <CalendarClock size={16} style={{ color: "#2a8a8a" }} className="flex-shrink-0" />
                              <span className="min-w-0 flex-1">
                                <span className="text-sm font-semibold block truncate" style={{ color: "#1a2e5a" }}>{r.user?.prenom} {r.user?.nom} — {r.motif}</span>
                                <span className="text-xs text-gray-400 block truncate">{r.user?.email}</span>
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Alerte : éléments à traiter dès l'arrivée de l'agent */}
        {aTraiter > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl px-5 py-4 border"
            style={{ background: "linear-gradient(135deg, #fff7ed, #fffbeb)", borderColor: "#fed7aa" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#fef3c7" }}>
              <BellRing size={20} style={{ color: "#b45309" }} />
            </div>
            <div className="flex-1 min-w-[180px]">
              <p className="font-semibold text-sm" style={{ color: "#92600a" }}>
                {aTraiter} élément{aTraiter > 1 ? "s" : ""} à traiter
              </p>
              <p className="text-xs" style={{ color: "#a16207" }}>
                {[
                  devisATraiter > 0 && `${devisATraiter} cotation${devisATraiter > 1 ? "s" : ""} à traiter`,
                  choixATraiter > 0 && `${choixATraiter} choix client à poursuivre`,
                  sinistresATraiter > 0 && `${sinistresATraiter} sinistre${sinistresATraiter > 1 ? "s" : ""} à gérer`,
                ].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex gap-2">
              {(devisATraiter > 0 || choixATraiter > 0) && (
                <button onClick={() => setVue("devis")} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #b45309, #d97706)" }}>
                  Voir les cotations
                </button>
              )}
              {sinistresATraiter > 0 && (
                <button onClick={() => setVue("sinistres")} className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105" style={{ background: "#fff", color: "#b45309", border: "1px solid #fed7aa" }}>
                  Voir les sinistres
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Bandeau de retour (relance / suppression) */}
        <AnimatePresence>
          {notif && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium"
              style={
                notif.type === "ok"
                  ? { background: "#dcfce7", color: "#166534" }
                  : notif.type === "warn"
                  ? { background: "#fef3c7", color: "#92600a" }
                  : { background: "#fee2e2", color: "#991b1b" }
              }
            >
              {notif.type === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {notif.texte}
            </motion.div>
          )}
        </AnimatePresence>

        {vue === "accueil" && (<>
        {/* Vue d'ensemble : indicateurs clés (lecture seule) */}
        {apercu && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.05 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            {/* Clients */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: "#e0ecec" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Clients</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#1a2e5a" }}>{apercu.clients}</p>
                  <p className="text-xs text-gray-400 mt-1">inscrits</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                  <Users size={20} style={{ color: "#2a8a8a" }} />
                </div>
              </div>
            </div>
            {/* Devis */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: "#e0ecec" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Cotations</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#1a2e5a" }}>{apercu.devisTotal}</p>
                  <p className="text-xs text-gray-400 mt-1">{apercu.devisParStatut["en_attente"] ?? 0} en attente · {apercu.devisParStatut["accepte"] ?? 0} acceptés</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                  <ClipboardList size={20} style={{ color: "#2a8a8a" }} />
                </div>
              </div>
            </div>
            {/* Souscriptions actives */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: "#e0ecec" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Souscriptions actives</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#1a2e5a" }}>{apercu.contratsActifs}</p>
                  <p className="text-xs text-gray-400 mt-1">{apercu.echeancesProches} échéance{apercu.echeancesProches > 1 ? "s" : ""} ≤ 90 j</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                  <FileSignature size={20} style={{ color: "#2a8a8a" }} />
                </div>
              </div>
            </div>
            {/* Sinistres + conversion */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: "#e0ecec" }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Sinistres</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#1a2e5a" }}>{apercu.sinistresEnCours}</p>
                  <p className="text-xs text-gray-400 mt-1 inline-flex items-center gap-1"><TrendingUp size={12} style={{ color: "#16a34a" }} /> {apercu.tauxConversion}% conversion</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                  <AlertTriangle size={20} style={{ color: "#2a8a8a" }} />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Graphes : évolution (courbe) + répartition des devis (donut) */}
        {apercu && (
          <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.08 }} className="lg:col-span-2 bg-white rounded-3xl shadow-sm border p-6 sm:p-8" style={{ borderColor: "#e0ecec" }}>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                  <BarChart3 size={18} style={{ color: "#2a8a8a" }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Évolution sur les 6 derniers trimestres</h2>
              </div>
              <GrapheTrimestriel data={apercu.trimestres} />
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.12 }} className="bg-white rounded-3xl shadow-sm border p-6 sm:p-8" style={{ borderColor: "#e0ecec" }}>
              <h2 className="text-lg font-bold mb-1" style={{ color: "#1a2e5a" }}>Répartition des cotations</h2>
              <p className="text-xs text-gray-400 mb-3">Par statut</p>
              {(() => {
                const palette: Record<string, string> = { en_attente: "#f59e0b", accepte: "#16a34a", refuse: "#dc2626", en_cours: "#2a8a8a" };
                const labels: Record<string, string> = { en_attente: "En attente", accepte: "Acceptés", refuse: "Refusés", en_cours: "En cours" };
                const data = Object.entries(apercu.devisParStatut)
                  .filter(([, v]) => v > 0)
                  .map(([k, v]) => ({ nom: labels[k] ?? k.replace(/_/g, " "), valeur: v, couleur: palette[k] ?? "#1a2e5a" }));
                const totalD = data.reduce((s, x) => s + x.valeur, 0);
                if (totalD === 0) return <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">Aucune cotation pour l&apos;instant.</div>;
                return (
                  <>
                    <div className="h-[180px] relative">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={data} dataKey="valeur" nameKey="nom" cx="50%" cy="50%" innerRadius={52} outerRadius={76} paddingAngle={3} stroke="none" animationDuration={900}>
                            {data.map((e) => <Cell key={e.nom} fill={e.couleur} />)}
                          </Pie>
                          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6f0f0", fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-extrabold" style={{ color: "#1a2e5a" }}>{totalD}</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wide">cotations</span>
                      </div>
                    </div>
                    <ul className="mt-3 space-y-1.5">
                      {data.map((e) => (
                        <li key={e.nom} className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 text-gray-600"><span className="w-2.5 h-2.5 rounded-full" style={{ background: e.couleur }} /> {e.nom}</span>
                          <span className="font-bold" style={{ color: "#1a2e5a" }}>{e.valeur}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}

        {/* Teaser : compagnies préférées des clients */}
        {compagniesStats.length > 0 && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.16 }} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
            <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between gap-3" style={{ borderColor: "#eef4f4" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #fef3c7, #fde9d2)" }}>
                  <Trophy size={18} style={{ color: "#b45309" }} />
                </div>
                <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Compagnies préférées des clients</h2>
              </div>
              <button onClick={() => setVue("compagnies")} className="text-xs font-semibold" style={{ color: "#2a8a8a" }}>
                Tout voir →
              </button>
            </div>
            <ul className="divide-y divide-[#eef4f4]">
              {compagniesStats.slice(0, 3).map((c, i) => (
                <li key={c.nom} className="px-6 sm:px-8 py-3.5 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ background: i === 0 ? "linear-gradient(135deg, #d4af37, #b45309)" : "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>{i + 1}</span>
                  <span className="flex-1 font-medium text-sm" style={{ color: "#1a2e5a" }}>{c.nom}</span>
                  <span className="text-xs text-gray-500">{c.choisies} choisie{c.choisies > 1 ? "s" : ""} · {c.taux}%</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
        </>)}

        {vue === "devis" && (<>
        {/* Statistiques cliquables (filtrent la liste) */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map(({ label, value, Icon, filtre: f }) => {
            const actif = filtre === f;
            return (
              <button
                key={label}
                onClick={() => setFiltre(f)}
                className="text-left bg-white rounded-3xl p-6 shadow-sm border transition-all hover:scale-[1.02] active:scale-[0.99]"
                style={{
                  borderColor: actif ? "#2a8a8a" : "#e0ecec",
                  boxShadow: actif ? "0 8px 24px rgba(42,138,138,0.18)" : undefined,
                  background: actif ? "linear-gradient(135deg, #ffffff, #f0f9f9)" : "#ffffff",
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
                    <p className="text-3xl font-bold mt-2" style={{ color: "#1a2e5a" }}>{value}</p>
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: actif ? "linear-gradient(135deg, #1a2e5a, #2a8a8a)" : "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                    <Icon size={20} style={{ color: actif ? "#ffffff" : "#2a8a8a" }} />
                  </div>
                </div>
                {actif && (
                  <p className="mt-3 text-xs font-semibold" style={{ color: "#2a8a8a" }}>● Filtre actif</p>
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Liste des devis */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "#eef4f4" }}>
            <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>{titreListe}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <FiltreTri
                options={[
                  { value: "date", label: "Date de création" },
                  { value: "nom", label: "Nom" },
                  { value: "email", label: "Email" },
                  { value: "telephone", label: "Téléphone" },
                  { value: "type", label: "Type d'assurance" },
                  { value: "statut", label: "Statut" },
                ]}
                champ={triChamp}
                sens={triSens}
                periode={periode}
                onChamp={setTriChamp}
                onSens={() => setTriSens((s) => (s === "asc" ? "desc" : "asc"))}
                onPeriode={setPeriode}
              />
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: "#2a8a8a" }}>
                {devisAffiches.length} résultat{devisAffiches.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {devisAffiches.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <Inbox size={28} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>
                {filtre === "tous" ? "Aucune demande pour le moment" : "Aucune cotation dans cette catégorie"}
              </p>
              <p className="text-gray-400 text-sm max-w-sm">
                {filtre === "tous"
                  ? "Les demandes de cotation envoyées par les clients apparaîtront ici."
                  : "Essayez un autre filtre en cliquant sur une autre carte."}
              </p>
            </div>
          ) : (
            <div className="p-4 sm:p-5 space-y-4" style={{ background: "#f6fafa" }}>
              {devisAffiches.map((d) => {
                const st = infoStatut(d.statut);
                const date = new Date(d.dateCreation).toLocaleString("fr-FR", {
                  timeZone: "Africa/Abidjan", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
                }).replace(",", " à");
                return (
                  <div key={d.id} className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md" style={{ borderColor: "#e6f0f0" }}>
                    <div className="flex flex-wrap items-stretch gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold" style={{ color: "#1a2e5a" }}>
                            {d.produit?.nom ?? "Produit"}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: st.fond, color: st.couleur }}>
                            {st.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {d.user?.prenom} {d.user?.nom} · {d.user?.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">Reçu le {date}</p>
                        {d.description && (
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line bg-gray-50 rounded-xl px-3 py-2">
                            {d.description}
                          </p>
                        )}
                        {d.reponses && Object.keys(d.reponses).length > 0 && (
                          <div className="mt-3 rounded-xl p-3" style={{ background: "#f8fbfb", border: "1px solid #e6f0f0" }}>
                            <p className="text-xs font-semibold mb-1.5" style={{ color: "#1a2e5a" }}>Questionnaire</p>
                            <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5">
                              {Object.entries(d.reponses).map(([q, r]) => (
                                <div key={q} className="text-xs">
                                  <dt className="text-gray-400">{q}</dt>
                                  <dd className="font-medium" style={{ color: "#1a2e5a" }}>{r}</dd>
                                </div>
                              ))}
                            </dl>
                          </div>
                        )}
                        {d.nombreRelances ? (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "#2a8a8a" }}>
                            <Mail size={12} /> Relancé {d.nombreRelances} fois · dernière le {dateCourte(d.derniereRelance)}
                          </p>
                        ) : null}

                        {/* Propositions envoyées + choix du client */}
                        {d.propositions && d.propositions.length > 0 && (
                          <div className="mt-3 rounded-xl p-3" style={{ background: "#f8fbfb", border: "1px solid #eef4f4" }}>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#2a8a8a" }}>
                              Propositions envoyées ({d.propositions.length})
                            </p>
                            <ul className="space-y-2">
                              {d.propositions.map((p, pi) => (
                                <li key={p.id} className="text-xs bg-white rounded-lg px-2.5 py-2 border" style={{ borderColor: p.choisie ? "#16a34a" : "#eef4f4" }}>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-semibold" style={{ color: "#1a2e5a" }}>Cotation {pi + 1}</span>
                                    {typeof p.prime === "number" && <span className="text-gray-500">· {p.prime.toLocaleString("fr-FR")} FCFA</span>}
                                    {p.choisie && (
                                      <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#166534" }}>
                                        ✓ Choisie par le client
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => propositionWhatsApp(d, p)}
                                      title="Envoyer cette proposition au client par WhatsApp"
                                      className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg text-white transition-all hover:scale-105 ml-auto"
                                      style={{ background: "#25D366" }}
                                    >
                                      <MessageCircle size={12} /> WhatsApp
                                    </button>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                    {p.documents.map((doc) => {
                                      const [lbl, url] = doc.split("|");
                                      return (
                                        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium px-2.5 py-1 rounded-lg" style={{ color: "#2a8a8a", background: "#eaf4f4" }}>
                                          <FileText size={12} /> Lire {lbl || "la cotation"}
                                        </a>
                                      );
                                    })}
                                    {p.compagnie && (
                                      <span className="inline-flex items-center font-bold px-2.5 py-1 rounded-lg" style={{ background: "#eef2ff", color: "#4f46e5" }}>
                                        {p.compagnie}
                                      </span>
                                    )}
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Encaissement : visible une fois que le client a choisi une offre */}
                        {(d.statut === "choisi" || d.statut === "paye") && (
                          <div className="mt-3 rounded-xl p-3" style={{ background: "#fffaf0", border: "1px solid #fed7aa" }}>
                            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#9a3412" }}>
                              Encaissement{d.modePaiement ? ` · ${MODE_LABEL[d.modePaiement] ?? d.modePaiement}` : ""}
                            </p>
                            {/* Montant (prime) à communiquer au client */}
                            <div className="flex flex-wrap gap-2 items-center mb-2">
                              <input
                                type="number"
                                value={montantInputs[d.id] ?? (d.montantAPayer != null ? String(d.montantAPayer) : "")}
                                onChange={(e) => setMontantInputs((s) => ({ ...s, [d.id]: e.target.value }))}
                                placeholder="Montant à régler (FCFA)"
                                className="flex-1 min-w-[160px] px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-[#2a8a8a]"
                                style={{ borderColor: "#e0ecec" }}
                              />
                              <button type="button" onClick={() => communiquerMontant(d)} disabled={paieId === d.id}
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-60" style={{ background: "#9a3412" }}>
                                <Send size={13} /> {d.montantAPayer != null ? "Mettre à jour" : "Communiquer le montant"}
                              </button>
                            </div>
                            {d.modePaiement && d.modePaiement !== "cheque" && (
                              <div className="flex flex-wrap gap-2 items-center mb-2">
                                <input
                                  value={lienInputs[d.id] ?? d.lienPaiement ?? ""}
                                  onChange={(e) => setLienInputs((s) => ({ ...s, [d.id]: e.target.value }))}
                                  placeholder="Lien de paiement (https://pay.wave.com/…)"
                                  className="flex-1 min-w-[180px] px-3 py-2 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-[#2a8a8a]"
                                  style={{ borderColor: "#e0ecec" }}
                                />
                                <button type="button" onClick={() => envoyerLienPaiement(d)} disabled={paieId === d.id}
                                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-60" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                                  <Send size={13} /> {d.lienPaiement ? "Mettre à jour" : "Envoyer le lien"}
                                </button>
                              </div>
                            )}
                            {d.statut === "choisi" ? (
                              <button type="button" onClick={() => confirmerPaiement(d)} disabled={paieId === d.id}
                                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white disabled:opacity-60" style={{ background: "#16a34a" }}>
                                {paieId === d.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Confirmer le paiement reçu
                              </button>
                            ) : (
                              <p className="text-xs font-semibold" style={{ color: "#0e7490" }}>
                                Paiement confirmé — validez la souscription (bouton « Enregistrer la souscription »).
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Galerie : colonne centrale qui remplit l'espace en hauteur */}
                      <div className="w-full sm:w-72 lg:w-80 flex flex-col">
                        <PiecesJointes documents={d.documents} />
                        {(d.documents?.length ?? 0) > 0 && (
                          <div className="mt-2">
                            <SignalerDocument userId={d.userId} documents={d.documents} contexte="devis" contexteId={d.id} />
                          </div>
                        )}
                      </div>

                      {/* Actions : statut + relance + suppression */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="flex items-center gap-2">
                          {majId === d.id && <Loader2 className="animate-spin" size={16} style={{ color: "#2a8a8a" }} />}
                          <StatutDropdown
                            valeur={d.statut}
                            disabled={majId === d.id}
                            onChange={(v) => changerStatut(d.id, v)}
                          />
                        </div>
                        <ActionsLigne
                          enCours={actionId === d.id}
                          onRelance={() => relancer("devis", d.id)}
                          onSupprimer={() => archiver("devis", d.id)}
                        />
                        <button
                          type="button"
                          onClick={() => ouvrirProposition(d)}
                          title="Envoyer une proposition (cotation) d'une compagnie"
                          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all hover:shadow-sm"
                          style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
                        >
                          <Send size={14} /> Envoyer une proposition
                        </button>
                        <button
                          type="button"
                          onClick={() => setConversion(d)}
                          title="Enregistrer la souscription à partir de cette cotation"
                          className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:shadow-sm"
                          style={{ border: "1px solid #cfe3e3", color: "#1a2e5a", background: "#ffffff" }}
                        >
                          <FileSignature size={14} style={{ color: "#2a8a8a" }} /> Enregistrer la souscription
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        </>)}

        {/* ── Sinistres déclarés par les clients ── */}
        {vue === "sinistres" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "#eef4f4" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <AlertTriangle size={18} style={{ color: "#2a8a8a" }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Sinistres déclarés</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <FiltreTri
                options={[
                  { value: "date", label: "Date de déclaration" },
                  { value: "nom", label: "Nom" },
                  { value: "email", label: "Email" },
                  { value: "telephone", label: "Téléphone" },
                  { value: "type", label: "Type d'assurance" },
                  { value: "statut", label: "Statut" },
                ]}
                champ={triChamp}
                sens={triSens}
                periode={periode}
                onChamp={setTriChamp}
                onSens={() => setTriSens((s) => (s === "asc" ? "desc" : "asc"))}
                onPeriode={setPeriode}
              />
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: "#2a8a8a" }}>
                {sinistresAffiches.length} déclaration{sinistresAffiches.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {sinistresAffiches.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <Inbox size={28} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Aucun sinistre déclaré</p>
              <p className="text-gray-400 text-sm max-w-sm">Les déclarations de sinistre envoyées par les clients apparaîtront ici.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#eef4f4]">
              {sinistresAffiches.map((s) => {
                const st = infoStatutSinistre(s.statut);
                const dateDecl = new Date(s.dateDeclaration).toLocaleDateString("fr-FR", {
                  timeZone: "Africa/Abidjan", day: "2-digit", month: "short", year: "numeric",
                });
                const dateSurv = new Date(s.dateSurvenance).toLocaleDateString("fr-FR", {
                  timeZone: "Africa/Abidjan", day: "2-digit", month: "short", year: "numeric",
                });
                return (
                  <div key={s.id} className="px-6 sm:px-8 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold" style={{ color: "#1a2e5a" }}>
                            {s.typeAssurance ?? "Sinistre"}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: st.fond, color: st.couleur }}>
                            {st.label}
                          </span>
                          {typeof s.montantEstime === "number" && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#f0f7f7", color: "#2a8a8a" }}>
                              <HandCoins size={12} /> {s.montantEstime.toLocaleString("fr-FR")} FCFA
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {s.user?.prenom} {s.user?.nom} · {s.user?.email}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Survenu le {dateSurv}{s.heureSurvenance ? ` à ${s.heureSurvenance}` : ""} · Déclaré le {dateDecl}
                        </p>
                        {s.lieu && (
                          <p className="text-xs text-gray-500 mt-0.5">Lieu : {s.lieu}</p>
                        )}
                        {s.description && (
                          <p className="text-sm text-gray-600 mt-2 whitespace-pre-line bg-gray-50 rounded-xl px-3 py-2">
                            {s.description}
                          </p>
                        )}
                        <PiecesJointes documents={s.documents} />
                        {(s.documents?.length ?? 0) > 0 && (
                          <div className="mt-2">
                            <SignalerDocument userId={s.userId} documents={s.documents} contexte="sinistre" contexteId={s.id} />
                          </div>
                        )}
                        {s.nombreRelances ? (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "#2a8a8a" }}>
                            <Mail size={12} /> Relancé {s.nombreRelances} fois · dernière le {dateCourte(s.derniereRelance)}
                          </p>
                        ) : null}
                      </div>

                      {/* Actions : statut + relance + suppression */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {majSinistreId === s.id && <Loader2 className="animate-spin" size={16} style={{ color: "#2a8a8a" }} />}
                          <StatutDropdown
                            valeur={s.statut}
                            options={STATUTS_SINISTRE}
                            disabled={majSinistreId === s.id}
                            onChange={(v) => changerStatutSinistre(s.id, v)}
                          />
                        </div>
                        <ActionsLigne
                          enCours={actionId === s.id}
                          onRelance={() => relancer("sinistres", s.id)}
                          onSupprimer={() => archiver("sinistres", s.id)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        )}

        {/* ── Contrats & rappels de renouvellement ── */}
        {vue === "souscriptions" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.35 }} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex flex-wrap items-center justify-between gap-3" style={{ borderColor: "#eef4f4" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <FileSignature size={18} style={{ color: "#2a8a8a" }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Souscriptions & renouvellements</h2>
            </div>
            {categorieVue !== null && (
            <div className="flex flex-wrap items-center gap-3">
              <FiltreTri
                options={[
                  { value: "date", label: "Date de début" },
                  { value: "nom", label: "Nom" },
                  { value: "email", label: "Email" },
                  { value: "numero", label: "N° de contrat" },
                  { value: "compagnie", label: "Compagnie" },
                  { value: "statut", label: "Statut" },
                ]}
                champ={triChamp}
                sens={triSens}
                periode={periode}
                onChamp={setTriChamp}
                onSens={() => setTriSens((s) => (s === "asc" ? "desc" : "asc"))}
                onPeriode={setPeriode}
              />
              {(() => {
                const aRelancer = contrats.filter((c) => c.statut === "actif" && infoRelance(c.dateFin, c.dureeMois).fenetreOuverte).length;
                return (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={aRelancer > 0 ? { background: "#fef3c7", color: "#92600a" } : { background: "#eaf4f4", color: "#2a8a8a" }}>
                    {aRelancer > 0 ? `${aRelancer} à relancer` : `${contratsAffiches.length} souscription${contratsAffiches.length > 1 ? "s" : ""}`}
                  </span>
                );
              })()}
            </div>
            )}
          </div>

          {contratsAffiches.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <Inbox size={28} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Aucune souscription</p>
              <p className="text-gray-400 text-sm max-w-sm">Enregistrez une souscription depuis une cotation (bouton « Enregistrer la souscription ») pour activer les rappels de renouvellement.</p>
            </div>
          ) : categorieVue === null ? (
            <div className="p-5 sm:p-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { cle: "particulier", label: "Particulier", desc: "Usage personnel", Icon: User, couleur: "#2a8a8a" },
                { cle: "professionnel", label: "Professionnel", desc: "Flotte / pack auto", Icon: Building2, couleur: "#b45309" },
                { cle: "transport", label: "Transport pro", desc: "Taxi, marchandises, VTC", Icon: Truck, couleur: "#7c3aed" },
              ].map((cat) => {
                const n = contratsAffiches.filter((c) => (c.segment === "professionnel" || c.segment === "transport" ? c.segment : "particulier") === cat.cle).length;
                return (
                  <button key={cat.cle} type="button" onClick={() => setCategorieVue(cat.cle)} className="text-left rounded-2xl border p-5 transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99]" style={{ borderColor: "#e0ecec" }}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${cat.couleur}1a` }}>
                        <cat.Icon size={20} style={{ color: cat.couleur }} />
                      </div>
                      <span className="text-2xl font-extrabold" style={{ color: "#1a2e5a" }}>{n}</span>
                    </div>
                    <p className="font-bold text-sm" style={{ color: "#1a2e5a" }}>{cat.label}</p>
                    <p className="text-xs text-gray-400">{cat.desc}</p>
                    <p className="text-xs font-semibold mt-3 inline-flex items-center gap-1" style={{ color: cat.couleur }}>
                      {n > 0 ? <>Voir les souscriptions <ArrowRight size={12} /></> : "Aucune pour l'instant"}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div>
              <button type="button" onClick={() => setCategorieVue(null)} className="flex items-center gap-1.5 px-6 sm:px-8 py-3 text-xs font-semibold border-b w-full transition-colors hover:bg-gray-50" style={{ color: "#2a8a8a", borderColor: "#eef4f4" }}>
                <ArrowLeft size={14} /> Toutes les catégories
              </button>
              {(() => {
                const items = contratsAffiches.filter((c) => (c.segment === "professionnel" || c.segment === "transport" ? c.segment : "particulier") === categorieVue);
                if (items.length === 0) {
                  return <div className="py-12 text-center text-sm text-gray-400">Aucune souscription dans cette catégorie.</div>;
                }
                return (
                  <div className="divide-y divide-[#eef4f4]">
                    {items.map((c) => {
                const info = infoRelance(c.dateFin, c.dureeMois);
                const debut = dateCourte(c.dateDebut);
                const fin = dateCourte(c.dateFin);
                const stStyle = c.statut === "actif"
                  ? { background: "#dcfce7", color: "#166534" }
                  : c.statut === "suspendu"
                  ? { background: "#fef3c7", color: "#92600a" }
                  : { background: "#fee2e2", color: "#991b1b" };
                return (
                  <div key={c.id} className="px-6 sm:px-8 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold" style={{ color: "#1a2e5a" }}>{c.produit?.nom ?? "Contrat"}</span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded-md" style={{ background: "#f0f7f7", color: "#2a8a8a" }}>{c.numeroContrat}</span>
                          {c.compagnie && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#eef2ff", color: "#4f46e5" }}>{c.compagnie}</span>
                          )}
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize" style={stStyle}>{c.statut}</span>
                          <MenuCategorie value={c.segment ?? "particulier"} onChange={(s) => changerSegment(c.id, s)} disabled={actionId === c.id} />
                          {c.statut === "actif" && info.fenetreOuverte && (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92600a" }}>
                              <BellRing size={12} /> À relancer
                            </span>
                          )}
                          {info.expire && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#fee2e2", color: "#991b1b" }}>Expiré</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{c.user?.prenom} {c.user?.nom} · {c.user?.email}</p>
                        <p className="text-xs text-gray-400 mt-0.5 inline-flex items-center gap-1.5">
                          <CalendarClock size={12} /> Du {debut} au {fin} · {c.dureeMois} mois · {c.primeAnnuelle.toLocaleString("fr-FR")} FCFA
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: info.expire ? "#991b1b" : info.fenetreOuverte ? "#92600a" : "#6b7280" }}>
                          {info.expire
                            ? `Échu depuis ${Math.abs(info.joursRestants)} jour(s)`
                            : `Échéance dans ${info.joursRestants} jour(s) · fenêtre de relance dès le ${dateCourte(info.dateRelance.toISOString())}`}
                        </p>
                        {c.nombreRelances ? (
                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: "#2a8a8a" }}>
                            <Mail size={12} /> Relancé {c.nombreRelances} fois · dernière le {dateCourte(c.derniereRelance)}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={actionId === c.id}
                          onClick={() => relancer("contrats", c.id)}
                          title="Relancer le client (email + WhatsApp)"
                          className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all hover:shadow-sm disabled:opacity-50"
                          style={{ background: info.fenetreOuverte ? "linear-gradient(135deg, #b45309, #d97706)" : "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
                        >
                          {actionId === c.id ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          Relancer
                        </button>
                        <a
                          href={`/client/contrats/${c.id}/imprimer`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Imprimer le reçu de souscription (traçabilité physique)"
                          className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all hover:shadow-sm"
                          style={{ border: "1px solid #cfe3e3", color: "#1a2e5a", background: "#ffffff" }}
                        >
                          <Printer size={14} style={{ color: "#2a8a8a" }} /> Imprimer
                        </a>
                        <button
                          type="button"
                          disabled={actionId === c.id}
                          onClick={() => archiver("contrats", c.id)}
                          title="Archiver cette souscription"
                          className="inline-flex items-center justify-center w-9 h-9 rounded-xl transition-all hover:bg-red-50 disabled:opacity-50"
                          style={{ border: "1px solid #f7caca", color: "#b42318" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </motion.div>

        )}

        {/* ── Analyse des compagnies (comportement client) ── */}
        {vue === "compagnies" && (
          <div className="space-y-6">
            {totalSollicitations === 0 ? (
              <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl shadow-sm border p-12 text-center" style={{ borderColor: "#e0ecec" }}>
                <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                  <Building2 size={28} style={{ color: "#2a8a8a" }} />
                </div>
                <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Pas encore de données</p>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">Dès que vous enverrez des propositions de cotation, cette page analysera quelles compagnies sont les plus sollicitées et les plus choisies par vos clients.</p>
              </motion.div>
            ) : (
              <>
                {/* KPIs */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {[
                    { label: "Compagnies sollicitées", value: compagniesStats.length, Icon: Building2, sub: "partenaires proposés" },
                    { label: "Propositions envoyées", value: totalSollicitations, Icon: Send, sub: "toutes compagnies" },
                    { label: "Choix clients", value: totalChoix, Icon: CheckCircle2, sub: "offres retenues" },
                    { label: "Taux de choix global", value: `${totalSollicitations ? Math.round((totalChoix / totalSollicitations) * 100) : 0}%`, Icon: TrendingUp, sub: "choisies / envoyées" },
                  ].map(({ label, value, Icon, sub }) => (
                    <div key={label} className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: "#e0ecec" }}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
                          <p className="text-3xl font-bold mt-2" style={{ color: "#1a2e5a" }}>{value}</p>
                          <p className="text-xs text-gray-400 mt-1">{sub}</p>
                        </div>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                          <Icon size={20} style={{ color: "#2a8a8a" }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {/* Graphe comparatif sollicitations vs choix */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.08 }} className="bg-white rounded-3xl shadow-sm border p-6 sm:p-8" style={{ borderColor: "#e0ecec" }}>
                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                      <BarChart3 size={18} style={{ color: "#2a8a8a" }} />
                    </div>
                    <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Sollicitations et choix par compagnie</h2>
                  </div>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={compagniesStats.slice(0, 8).map((c) => ({ nom: c.nom.split(" ")[0], Proposées: c.envoyees, Choisies: c.choisies }))} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#eef4f4" vertical={false} />
                        <XAxis dataKey="nom" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6f0f0", fontSize: 12 }} cursor={{ fill: "rgba(42,138,138,0.06)" }} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Bar dataKey="Proposées" fill="#2a8a8a" radius={[6, 6, 0, 0]} animationDuration={900} />
                        <Bar dataKey="Choisies" fill="#16a34a" radius={[6, 6, 0, 0]} animationDuration={900} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Classement interne */}
                <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.12 }} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
                  <div className="px-6 sm:px-8 py-5 border-b flex items-center gap-2.5" style={{ borderColor: "#eef4f4" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #fef3c7, #fde9d2)" }}>
                      <Trophy size={18} style={{ color: "#b45309" }} />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Classement par préférence des clients</h2>
                      <p className="text-xs text-gray-400">Classé selon le nombre d&apos;offres choisies, puis sollicitées</p>
                    </div>
                  </div>
                  <ul className="divide-y divide-[#eef4f4]">
                    {compagniesStats.map((c, i) => (
                      <li key={c.nom} className="px-6 sm:px-8 py-4 flex flex-wrap items-center gap-4">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: i === 0 ? "linear-gradient(135deg, #d4af37, #b45309)" : i === 1 ? "linear-gradient(135deg, #9ca3af, #6b7280)" : i === 2 ? "linear-gradient(135deg, #d89655, #b45309)" : "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                          {i + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm" style={{ color: "#1a2e5a" }}>{c.nom}</p>
                          <div className="mt-1.5 h-2 rounded-full overflow-hidden max-w-xs" style={{ background: "#eef4f4" }}>
                            <div className="h-full rounded-full" style={{ width: `${c.taux}%`, background: "linear-gradient(90deg, #2a8a8a, #16a34a)" }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-5 text-sm">
                          <div className="text-center">
                            <p className="font-bold" style={{ color: "#2a8a8a" }}>{c.envoyees}</p>
                            <p className="text-[10px] text-gray-400 uppercase">proposées</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold" style={{ color: "#16a34a" }}>{c.choisies}</p>
                            <p className="text-[10px] text-gray-400 uppercase">choisies</p>
                          </div>
                          <div className="text-center">
                            <p className="font-bold" style={{ color: "#1a2e5a" }}>{c.taux}%</p>
                            <p className="text-[10px] text-gray-400 uppercase">taux</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </>
            )}
          </div>
        )}

        {/* ── Messagerie : boîte de réception du rédacteur ── */}
        {vue === "messages" && <MessagesAdmin cibleInitiale={convCible} />}

        {/* ── Rendez-vous demandés par les clients ── */}
        {vue === "rdv" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between gap-3" style={{ borderColor: "#eef4f4" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <CalendarClock size={18} style={{ color: "#2a8a8a" }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Rendez-vous</h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: "#2a8a8a" }}>
              {rendezVous.length} demande{rendezVous.length > 1 ? "s" : ""}
            </span>
          </div>

          {rendezVous.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <CalendarClock size={28} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Aucun rendez-vous demandé</p>
              <p className="text-gray-400 text-sm max-w-sm">Les demandes de rendez-vous des clients apparaîtront ici.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#eef4f4]">
              {rendezVous.map((r) => {
                const couleur =
                  r.statut === "confirme" ? { bg: "#dcfce7", fg: "#166534" }
                  : r.statut === "annule" ? { bg: "#fee2e2", fg: "#991b1b" }
                  : r.statut === "termine" ? { bg: "#eaf4f4", fg: "#2a8a8a" }
                  : { bg: "#fef9c3", fg: "#854d0e" };
                const quand = new Date(r.dateHeure).toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", weekday: "long", day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" }).replace(",", " à");
                return (
                  <li key={r.id} className="px-6 sm:px-8 py-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm" style={{ color: "#1a2e5a" }}>{r.motif}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {r.user ? `${r.user.prenom} ${r.user.nom}` : "Client"}
                          {r.user?.telephone ? ` · ${r.user.telephone}` : ""}
                        </p>
                        <p className="text-xs capitalize mt-0.5" style={{ color: "#2a8a8a" }}>{quand}</p>
                        {r.notes && <p className="text-xs text-gray-500 mt-1 italic">« {r.notes} »</p>}
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize" style={{ background: couleur.bg, color: couleur.fg }}>
                        {(r.statut ?? "en_attente").replace(/_/g, " ")}
                      </span>
                    </div>

                    {(r.statut === "en_attente" || r.statut === "confirme") && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {r.statut === "en_attente" && (
                          <button
                            disabled={actionId === r.id}
                            onClick={() => changerStatutRdv(r.id, "confirme")}
                            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all hover:shadow-sm disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
                          >
                            {actionId === r.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                            Confirmer
                          </button>
                        )}
                        {r.statut === "confirme" && (
                          <button
                            disabled={actionId === r.id}
                            onClick={() => changerStatutRdv(r.id, "termine")}
                            className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold text-white transition-all hover:shadow-sm disabled:opacity-50"
                            style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
                          >
                            <Check size={14} /> Marquer terminé
                          </button>
                        )}
                        <button
                          disabled={actionId === r.id}
                          onClick={() => changerStatutRdv(r.id, "annule")}
                          className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all hover:shadow-sm disabled:opacity-50"
                          style={{ border: "1px solid #fecaca", color: "#b91c1c", background: "#fff" }}
                        >
                          <X size={14} /> Annuler
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
        )}

        {/* ── ESPACE GÉRANT : archives + journal d'audit (réservé) ── */}
        {vue === "gerant" && estGerant && (
          <>
            {/* Bandeau de rôle */}
            <div className="mt-10 mb-4 flex items-center gap-2">
              <ShieldAlert size={18} style={{ color: "#b45309" }} />
              <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Espace gérant</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#fef3c7", color: "#92600a" }}>réservé</span>
            </div>

            {/* Archives (éléments supprimés par les agents) */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
              <div className="px-6 sm:px-8 py-5 border-b" style={{ borderColor: "#eef4f4" }}>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #fde9d2, #f8d4a8)" }}>
                      <Archive size={18} style={{ color: "#b45309" }} />
                    </div>
                    <h3 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Éléments archivés</h3>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: "#2a8a8a" }}>
                    {archRecherche.trim() ? `${totalArchivesAffiches} / ${totalArchives}` : `${totalArchives} archivé(s)`}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                    <input
                      type="text"
                      value={archRecherche}
                      onChange={(e) => setArchRecherche(e.target.value)}
                      placeholder="Rechercher dans les archives (client, email, n° de contrat, produit…)"
                      className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-sm bg-white border focus:outline-none focus:ring-2 focus:ring-[#2a8a8a]"
                      style={{ borderColor: "#e0ecec" }}
                    />
                    {archRecherche && (
                      <button onClick={() => setArchRecherche("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Effacer"><X size={15} /></button>
                    )}
                  </div>
                  <FiltreTri
                    options={[
                      { value: "date", label: "Date d'envoi" },
                      { value: "archivage", label: "Date d'archivage" },
                      { value: "nom", label: "Nom" },
                      { value: "email", label: "Email" },
                      { value: "type", label: "Type d'élément" },
                    ]}
                    champ={archTri}
                    sens={archSens}
                    periode={archPeriode}
                    onChamp={setArchTri}
                    onSens={() => setArchSens((s) => (s === "asc" ? "desc" : "asc"))}
                    onPeriode={setArchPeriode}
                  />
                </div>
              </div>

              {totalArchives === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                  <p className="text-gray-400 text-sm">Rien d&apos;archivé. Tout ce qu&apos;un rédacteur supprime apparaîtra ici, avec son auteur.</p>
                </div>
              ) : totalArchivesAffiches === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">Aucun résultat dans les archives pour cette recherche.</div>
              ) : (
                <div className="divide-y divide-[#eef4f4]">
                  {archivesTriees.map((a) => (
                    <LigneArchive
                      key={a.id} type={a.kind}
                      titre={a.titre}
                      sousTitre={a.sousTitre}
                      par={a.par} le={a.le} dateEnvoi={a.dateEnvoi}
                      enCours={actionId === a.id}
                      onRestaurer={() => restaurer(a.kind, a.id)}
                      onPurger={() => purger(a.kind, a.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Journal d'audit */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mt-8 bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
              <div className="px-6 sm:px-8 py-5 border-b" style={{ borderColor: "#eef4f4" }}>
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                    <History size={18} style={{ color: "#2a8a8a" }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Journal d&apos;audit</h3>
                    <p className="text-xs text-gray-400">{journalTotal.toLocaleString("fr-FR")} entrée{journalTotal > 1 ? "s" : ""} · recherche instantanée</p>
                  </div>
                </div>

                {/* Recherche serveur + filtres par action */}
                <div className="flex flex-col lg:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                    <input
                      type="text"
                      value={journalQ}
                      onChange={(e) => setJournalQ(e.target.value)}
                      placeholder="Rechercher (auteur, élément, n° d'ID, résumé…)"
                      className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-sm bg-white border focus:outline-none focus:ring-2 focus:ring-[#2a8a8a]"
                      style={{ borderColor: "#e0ecec" }}
                    />
                    {journalQ && (
                      <button onClick={() => setJournalQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label="Effacer">
                        <X size={15} />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: "", label: "Toutes" },
                      { v: "archivage", label: "Archivages" },
                      { v: "restauration", label: "Restaurations" },
                      { v: "purge", label: "Purges" },
                    ].map((f) => {
                      const actif = journalAction === f.v;
                      return (
                        <button
                          key={f.v || "tous"}
                          onClick={() => setJournalAction(f.v)}
                          className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                          style={actif ? { background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", color: "#fff" } : { background: "#fff", color: "#1a2e5a", border: "1px solid #e0ecec" }}
                        >
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                  <FiltreTri
                    options={[
                      { value: "date", label: "Date" },
                      { value: "auteur", label: "Auteur" },
                      { value: "action", label: "Action" },
                      { value: "entite", label: "Type d'élément" },
                    ]}
                    champ={journalTri}
                    sens={journalSens}
                    periode={journalPeriode}
                    onChamp={setJournalTri}
                    onSens={() => setJournalSens((s) => (s === "asc" ? "desc" : "asc"))}
                    onPeriode={setJournalPeriode}
                  />
                </div>
              </div>

              {journalChargement ? (
                <div className="py-12 flex justify-center"><Loader2 className="animate-spin" size={26} style={{ color: "#2a8a8a" }} /></div>
              ) : journal.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">
                  {journalQ || journalAction ? "Aucun résultat pour cette recherche." : "Aucune action enregistrée pour l'instant."}
                </div>
              ) : (
                <>
                  <div className="divide-y divide-[#eef4f4]">
                    {journal.map((j) => {
                      const couleur = j.action === "purge" ? "#b42318" : j.action === "restauration" ? "#166534" : "#b45309";
                      const fond = j.action === "purge" ? "#fee2e2" : j.action === "restauration" ? "#dcfce7" : "#fef3c7";
                      return (
                        <div key={j.id} className="px-6 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full capitalize" style={{ background: fond, color: couleur }}>{j.action}</span>
                            <span className="text-sm text-gray-700 ml-2">{j.resume ?? `${j.entite} ${j.entiteId}`}</span>
                          </div>
                          <p className="text-xs text-gray-400">
                            par <strong style={{ color: "#1a2e5a" }}>{j.auteurEmail}</strong> · {new Date(j.createdAt).toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pagination serveur */}
                  {(() => {
                    const pages = Math.max(1, Math.ceil(journalTotal / JOURNAL_TAILLE));
                    const debut = (journalPage - 1) * JOURNAL_TAILLE + 1;
                    const fin = Math.min(journalTotal, journalPage * JOURNAL_TAILLE);
                    return (
                      <div className="px-6 sm:px-8 py-4 flex items-center justify-between gap-3 border-t" style={{ borderColor: "#eef4f4" }}>
                        <p className="text-xs text-gray-400">{debut}–{fin} sur {journalTotal.toLocaleString("fr-FR")}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setJournalPage((p) => Math.max(1, p - 1))}
                            disabled={journalPage <= 1}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40 hover:shadow-sm"
                            style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}
                          >
                            <ArrowLeft size={13} /> Précédent
                          </button>
                          <span className="text-xs font-semibold px-2" style={{ color: "#1a2e5a" }}>{journalPage} / {pages}</span>
                          <button
                            onClick={() => setJournalPage((p) => Math.min(pages, p + 1))}
                            disabled={journalPage >= pages}
                            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition-all disabled:opacity-40 hover:shadow-sm"
                            style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}
                          >
                            Suivant <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </motion.div>
          </>
        )}

      {/* Modale : convertir un devis en contrat */}
      <AnimatePresence>
        {conversion && (
          <ConversionModal
            devis={conversion}
            enCours={actionId === conversion.id}
            onClose={() => setConversion(null)}
            onSubmit={creerContrat}
          />
        )}
      </AnimatePresence>

      {/* Modale : envoyer une proposition (cotation) */}
      <AnimatePresence>
        {propPour && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
            style={{ background: "rgba(15,23,42,0.5)" }}
            onClick={() => setPropPour(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full my-8"
            >
              <div className="px-7 py-5 text-white rounded-t-3xl flex items-center justify-between" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                <div>
                  <h3 className="font-bold">Envoyer des propositions</h3>
                  <p className="text-xs text-white/70">{propPour.produit?.nom} · {propPour.user?.prenom} {propPour.user?.nom}</p>
                </div>
                <button onClick={() => setPropPour(null)}><X size={20} /></button>
              </div>

              <div className="p-6 sm:p-7">
                <div className="space-y-4 max-h-[58vh] overflow-y-auto pr-1">
                  {propProps.map((p, i) => (
                    <div key={i} className="rounded-2xl border p-4 space-y-4" style={{ borderColor: "#e6f0f0", background: "#f8fbfb" }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#2a8a8a" }}>Proposition {i + 1}</span>
                        {propProps.length > 1 && (
                          <button onClick={() => setPropProps((arr) => arr.filter((_, k) => k !== i))} className="inline-flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-600" type="button">
                            <Trash2 size={13} /> Retirer
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la compagnie <span className="text-gray-400 font-normal">(optionnel)</span></label>
                        <input
                          type="text" value={p.compagnie} onChange={(e) => majProp(i, "compagnie", e.target.value)} placeholder="ex. NSIA, SUNU, Sanlam Allianz…"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] transition-all text-sm"
                        />
                      </div>
                      <DocumentUpload
                        label="Fiches de cotation (PDF)"
                        value={p.docs}
                        onChange={(urls) => majProp(i, "docs", urls)}
                        required
                        max={6}
                        hint="PDF ou images — vous pouvez en sélectionner plusieurs à la fois."
                      />
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Prime (FCFA, optionnel)</label>
                          <input
                            type="number" value={p.prime} onChange={(e) => majProp(i, "prime", e.target.value)} placeholder="ex. 120000"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Message (optionnel)</label>
                          <input
                            type="text" value={p.message} onChange={(e) => majProp(i, "message", e.target.value)} placeholder="Note pour le client…"
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => setPropProps((arr) => [...arr, propVide()])}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed text-sm font-semibold transition-all hover:bg-gray-50"
                    style={{ borderColor: "#cfe3e3", color: "#2a8a8a" }}
                  >
                    <Plus size={16} /> Ajouter une autre proposition
                  </button>
                </div>

                <div className="flex gap-3 pt-5">
                  <button onClick={() => setPropPour(null)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-gray-50" style={{ color: "#1a2e5a", borderColor: "#e0ecec" }}>
                    Annuler
                  </button>
                  <button onClick={envoyerProposition} disabled={propEnvoi} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg disabled:opacity-60" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                    {propEnvoi ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Envoyer {propProps.filter((p) => p.docs.length > 0).length > 1 ? `(${propProps.filter((p) => p.docs.length > 0).length})` : ""} au client
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </DashboardShell>
  );
}
