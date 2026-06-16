"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  LogOut,
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
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { infoRelance } from "@/lib/contrats";
import { PARTENAIRES } from "@/lib/partenaires";
import DatePicker from "@/components/ui/DatePicker";
import Select from "@/components/ui/Select";
import DocumentUpload from "@/components/ui/DocumentUpload";

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
  dateCreation: string;
  statut: string;
  montantEstime: number | null;
  description: string;
  documents?: string[];
  reponses?: Record<string, string> | null;
  telephoneContact?: string | null;
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
    { cle: "devis", nom: "Devis reçus", couleur: "#2a8a8a" },
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

// Affiche les pièces jointes (format "Libellé|url") en miniatures cliquables.
function PiecesJointes({ documents }: { documents?: string[] }) {
  if (!documents || documents.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="text-xs font-semibold mb-2" style={{ color: "#1a2e5a" }}>
        Pièces jointes ({documents.length})
      </p>
      <div className="flex flex-wrap gap-2">
        {documents.map((doc, i) => {
          const sep = doc.indexOf("|");
          const libelle = sep > 0 ? doc.slice(0, sep) : "Document";
          const url = sep > 0 ? doc.slice(sep + 1) : doc;
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-24"
              title={libelle}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={libelle}
                className="w-24 h-20 rounded-xl object-cover border transition-all group-hover:shadow-md"
                style={{ borderColor: "#e0ecec" }}
              />
              <span className="block text-[11px] text-gray-500 mt-1 truncate">{libelle}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

type StatutInfo = { value: string; label: string; couleur: string; fond: string };

// Libellés + couleurs des statuts (alignés sur l'enum StatutDevis).
const STATUTS: StatutInfo[] = [
  { value: "en_attente", label: "En attente", couleur: "#92600a", fond: "#fef3c7" },
  { value: "en_cours", label: "En cours", couleur: "#1e40af", fond: "#dbeafe" },
  { value: "envoye", label: "Envoyé", couleur: "#5b21b6", fond: "#ede9fe" },
  { value: "accepte", label: "Accepté", couleur: "#166534", fond: "#dcfce7" },
  { value: "refuse", label: "Refusé", couleur: "#991b1b", fond: "#fee2e2" },
];

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
  enCours,
  onRestaurer,
  onPurger,
}: {
  type: string;
  titre: string;
  sousTitre: string;
  par?: string | null;
  le?: string | null;
  enCours: boolean;
  onRestaurer: () => void;
  onPurger: () => void;
}) {
  const TYPE_LABEL: Record<string, string> = { devis: "Devis", sinistres: "Sinistre", contrats: "Souscription" };
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
        <p className="text-xs mt-0.5" style={{ color: "#b42318" }}>
          Archivé par <strong>{par ?? "—"}</strong>{le ? ` le ${dateCourte(le)}` : ""}
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
  const [loading, setLoading] = useState(true);
  const [devis, setDevis] = useState<DevisAdmin[]>([]);
  const [sinistres, setSinistres] = useState<SinistreAdmin[]>([]);
  const [contrats, setContrats] = useState<ContratAdmin[]>([]);
  // Devis en cours de conversion en contrat (ouvre la modale).
  const [conversion, setConversion] = useState<DevisAdmin | null>(null);
  const [confirmDeco, setConfirmDeco] = useState(false);
  // Envoi d'une proposition (cotation) sur un devis.
  const [propPour, setPropPour] = useState<DevisAdmin | null>(null);
  const [propCompagnie, setPropCompagnie] = useState("");
  const [propDocs, setPropDocs] = useState<string[]>([]);
  const [propPrime, setPropPrime] = useState("");
  const [propMessage, setPropMessage] = useState("");
  const [propEnvoi, setPropEnvoi] = useState(false);
  // Archives + journal d'audit (gérant uniquement).
  const [archDevis, setArchDevis] = useState<DevisAdmin[]>([]);
  const [archSinistres, setArchSinistres] = useState<SinistreAdmin[]>([]);
  const [archContrats, setArchContrats] = useState<ContratAdmin[]>([]);
  const [journal, setJournal] = useState<JournalEntree[]>([]);
  const [apercu, setApercu] = useState<Apercu | null>(null);
  const [vue, setVue] = useState<"accueil" | "devis" | "sinistres" | "souscriptions" | "rdv" | "gerant">("accueil");
  const [rendezVous, setRendezVous] = useState<RendezVousAdmin[]>([]);
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

  // 3) Données réservées au gérant : archives (éléments supprimés) + journal d'audit.
  useEffect(() => {
    if (!autorise || !estGerant) return;
    Promise.all([
      fetch("/api/devis?archives=1").then((r) => (r.ok ? r.json() : { devis: [] })),
      fetch("/api/sinistres?archives=1").then((r) => (r.ok ? r.json() : { sinistres: [] })),
      fetch("/api/contrats?archives=1").then((r) => (r.ok ? r.json() : { contrats: [] })),
      fetch("/api/journal").then((r) => (r.ok ? r.json() : { entrees: [] })),
    ])
      .then(([dD, dS, dC, dJ]) => {
        if (Array.isArray(dD.devis)) setArchDevis(dD.devis);
        if (Array.isArray(dS.sinistres)) setArchSinistres(dS.sinistres);
        if (Array.isArray(dC.contrats)) setArchContrats(dC.contrats);
        if (Array.isArray(dJ.entrees)) setJournal(dJ.entrees);
      })
      .catch(() => {});
  }, [autorise, estGerant]);

  const seDeconnecter = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/"); // retour à la page d'accueil principale
  };

  // Ouvre/ferme la fenêtre d'envoi de proposition.
  const ouvrirProposition = (d: DevisAdmin) => {
    setPropPour(d); setPropCompagnie(""); setPropDocs([]); setPropPrime(""); setPropMessage("");
  };

  // Envoie une proposition (cotation) d'une compagnie pour le devis sélectionné.
  const envoyerProposition = async () => {
    if (!propPour || !propCompagnie || propDocs.length === 0) {
      setNotif({ type: "warn", texte: "Choisissez une compagnie et joignez la fiche PDF." });
      return;
    }
    setPropEnvoi(true);
    try {
      const res = await fetch(`/api/devis/${propPour.id}/propositions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          compagnie: propCompagnie,
          documents: propDocs,
          prime: propPrime ? Number(propPrime) : undefined,
          message: propMessage,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setNotif({ type: "err", texte: data.erreur ?? "Envoi impossible." }); return; }
      // Ajoute la proposition au devis localement + statut "envoye".
      setDevis((prev) => prev.map((d) => d.id === propPour.id
        ? { ...d, statut: "envoye", propositions: [...(d.propositions ?? []), data.proposition] }
        : d));
      setNotif({ type: "ok", texte: `Proposition ${propCompagnie} envoyée au client.` });
      setPropPour(null);
    } finally {
      setPropEnvoi(false);
    }
  };

  // Envoie une proposition au client via WhatsApp (message + lien vers la fiche).
  const propositionWhatsApp = async (d: DevisAdmin, p: PropositionAdmin) => {
    const prenom = d.user?.prenom ?? "";
    const lienFiche = (p.documents[0] ?? "").split("|")[1] ?? "";
    const message =
      `Bonjour ${prenom},\n\n` +
      `Voici notre proposition d'assurance ${d.produit?.nom ?? ""} avec ${p.compagnie}` +
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
    const [dD, dS, dC, dJ] = await Promise.all([
      fetch("/api/devis?archives=1").then((r) => (r.ok ? r.json() : { devis: [] })),
      fetch("/api/sinistres?archives=1").then((r) => (r.ok ? r.json() : { sinistres: [] })),
      fetch("/api/contrats?archives=1").then((r) => (r.ok ? r.json() : { contrats: [] })),
      fetch("/api/journal").then((r) => (r.ok ? r.json() : { entrees: [] })),
    ]);
    if (Array.isArray(dD.devis)) setArchDevis(dD.devis);
    if (Array.isArray(dS.sinistres)) setArchSinistres(dS.sinistres);
    if (Array.isArray(dC.contrats)) setArchContrats(dC.contrats);
    if (Array.isArray(dJ.entrees)) setJournal(dJ.entrees);
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

  // À traiter : devis en attente (cotation) + sinistres ouverts + choix client à poursuivre.
  const sinistresATraiter = sinistres.filter((s) => s.statut === "declare" || s.statut === "en_cours").length;
  const choixATraiter = devis.filter((d) => d.propositions?.some((p) => p.choisie)).length;
  const aTraiter = enAttente + sinistresATraiter + choixATraiter;

  const stats = [
    { label: "Devis reçus", value: total, Icon: ClipboardList, filtre: "tous" },
    { label: "En attente", value: enAttente, Icon: Clock, filtre: "en_attente" },
    { label: "Acceptés", value: acceptes, Icon: CheckCircle2, filtre: "accepte" },
    { label: "Refusés", value: refuses, Icon: XCircle, filtre: "refuse" },
  ];

  // Liste affichée selon le filtre actif.
  const devisAffiches = filtre === "tous" ? devis : devis.filter((d) => d.statut === filtre);
  const titreListe = filtre === "tous" ? "Toutes les demandes" : `Devis « ${infoStatut(filtre).label} »`;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "#f8fbfb" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* En-tête */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#1a2e5a" }}>
                Back-office administrateur
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Gestion des devis et des sinistres clients</p>
            </div>
          </div>
          <button
            onClick={() => setConfirmDeco(true)}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm border border-red-200 text-red-600 bg-white transition-all hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-lg active:scale-95"
          >
            <LogOut size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Se déconnecter
          </button>
        </motion.div>

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
                  enAttente > 0 && `${enAttente} devis en attente de cotation`,
                  choixATraiter > 0 && `${choixATraiter} choix client à poursuivre`,
                  sinistresATraiter > 0 && `${sinistresATraiter} sinistre${sinistresATraiter > 1 ? "s" : ""} à gérer`,
                ].filter(Boolean).join(" · ")}
              </p>
            </div>
            <div className="flex gap-2">
              {(enAttente > 0 || choixATraiter > 0) && (
                <button onClick={() => setVue("devis")} className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #b45309, #d97706)" }}>
                  Voir les devis
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

        {/* Navigation par onglets (blocs) */}
        <div className="flex flex-wrap gap-2 mb-8">
          {([
            { cle: "accueil", label: "Accueil" },
            { cle: "devis", label: "Devis" },
            { cle: "sinistres", label: "Sinistres" },
            { cle: "souscriptions", label: "Souscriptions" },
            { cle: "rdv", label: "Rendez-vous" },
            ...(estGerant ? [{ cle: "gerant", label: "Espace gérant" }] : []),
          ] as const).map((t) => {
            const badge = t.cle === "devis" ? enAttente : t.cle === "sinistres" ? sinistresATraiter : 0;
            return (
              <button
                key={t.cle}
                onClick={() => setVue(t.cle as typeof vue)}
                className="relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.03] active:scale-95"
                style={
                  vue === t.cle
                    ? { background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", color: "#ffffff", boxShadow: "0 6px 18px rgba(42,138,138,0.22)" }
                    : { background: "#ffffff", color: "#1a2e5a", border: "1px solid #e0ecec" }
                }
              >
                {t.label}
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-bold text-white" style={{ background: "#dc2626" }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

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
                  <p className="text-gray-400 text-xs uppercase tracking-wide">Devis</p>
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

        {/* Graphe d'évolution trimestriel */}
        {apercu && (
          <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.08 }} className="bg-white rounded-3xl shadow-sm border p-6 sm:p-8 mb-8" style={{ borderColor: "#e0ecec" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <BarChart3 size={18} style={{ color: "#2a8a8a" }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Évolution sur les 6 derniers trimestres</h2>
            </div>
            <GrapheTrimestriel data={apercu.trimestres} />
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
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between gap-3" style={{ borderColor: "#eef4f4" }}>
            <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>{titreListe}</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: "#2a8a8a" }}>
              {devisAffiches.length} résultat{devisAffiches.length > 1 ? "s" : ""}
            </span>
          </div>

          {devisAffiches.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <Inbox size={28} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>
                {filtre === "tous" ? "Aucune demande pour le moment" : "Aucun devis dans cette catégorie"}
              </p>
              <p className="text-gray-400 text-sm max-w-sm">
                {filtre === "tous"
                  ? "Les demandes de devis envoyées par les clients apparaîtront ici."
                  : "Essayez un autre filtre en cliquant sur une autre carte."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#eef4f4]">
              {devisAffiches.map((d) => {
                const st = infoStatut(d.statut);
                const date = new Date(d.dateCreation).toLocaleDateString("fr-FR", {
                  timeZone: "Africa/Abidjan", day: "2-digit", month: "short", year: "numeric",
                });
                return (
                  <div key={d.id} className="px-6 sm:px-8 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0">
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
                        <PiecesJointes documents={d.documents} />
                        {d.reponses && Object.keys(d.reponses).length > 0 && (
                          <div className="mt-3 rounded-xl p-3" style={{ background: "#f8fbfb", border: "1px solid #e6f0f0" }}>
                            <p className="text-xs font-semibold mb-1.5" style={{ color: "#1a2e5a" }}>Questionnaire</p>
                            <dl className="grid sm:grid-cols-2 gap-x-4 gap-y-1">
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
                            <ul className="space-y-1.5">
                              {d.propositions.map((p) => (
                                <li key={p.id} className="flex flex-wrap items-center gap-2 text-xs">
                                  <span className="font-semibold" style={{ color: "#1a2e5a" }}>{p.compagnie}</span>
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
                                    className="inline-flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg text-white transition-all hover:scale-105"
                                    style={{ background: "#25D366" }}
                                  >
                                    <MessageCircle size={12} /> WhatsApp
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Actions : statut + relance + suppression */}
                      <div className="flex flex-col items-end gap-2">
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
                          title="Enregistrer la souscription à partir de ce devis"
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
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between gap-3" style={{ borderColor: "#eef4f4" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <AlertTriangle size={18} style={{ color: "#2a8a8a" }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Sinistres déclarés</h2>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: "#2a8a8a" }}>
              {sinistres.length} déclaration{sinistres.length > 1 ? "s" : ""}
            </span>
          </div>

          {sinistres.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <Inbox size={28} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Aucun sinistre déclaré</p>
              <p className="text-gray-400 text-sm max-w-sm">Les déclarations de sinistre envoyées par les clients apparaîtront ici.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#eef4f4]">
              {sinistres.map((s) => {
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
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between gap-3" style={{ borderColor: "#eef4f4" }}>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <FileSignature size={18} style={{ color: "#2a8a8a" }} />
              </div>
              <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Souscriptions & renouvellements</h2>
            </div>
            {(() => {
              const aRelancer = contrats.filter((c) => c.statut === "actif" && infoRelance(c.dateFin, c.dureeMois).fenetreOuverte).length;
              return (
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={aRelancer > 0 ? { background: "#fef3c7", color: "#92600a" } : { background: "#eaf4f4", color: "#2a8a8a" }}>
                  {aRelancer > 0 ? `${aRelancer} à relancer` : `${contrats.length} souscription${contrats.length > 1 ? "s" : ""}`}
                </span>
              );
            })()}
          </div>

          {contrats.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <Inbox size={28} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Aucune souscription</p>
              <p className="text-gray-400 text-sm max-w-sm">Enregistrez une souscription depuis un devis (bouton « Enregistrer la souscription ») pour activer les rappels de renouvellement.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#eef4f4]">
              {contrats.map((c) => {
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
          )}
        </motion.div>

        )}

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
              <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between gap-3" style={{ borderColor: "#eef4f4" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #fde9d2, #f8d4a8)" }}>
                    <Archive size={18} style={{ color: "#b45309" }} />
                  </div>
                  <h3 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Éléments archivés</h3>
                </div>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: "#2a8a8a" }}>
                  {archDevis.length + archSinistres.length + archContrats.length} archivé(s)
                </span>
              </div>

              {archDevis.length + archSinistres.length + archContrats.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-6">
                  <p className="text-gray-400 text-sm">Rien d&apos;archivé. Tout ce qu&apos;un agent supprime apparaîtra ici, avec son auteur.</p>
                </div>
              ) : (
                <div className="divide-y divide-[#eef4f4]">
                  {archDevis.map((d) => (
                    <LigneArchive
                      key={d.id} type="devis"
                      titre={d.produit?.nom ?? "Devis"}
                      sousTitre={`${d.user?.prenom ?? ""} ${d.user?.nom ?? ""} · ${d.user?.email ?? ""}`}
                      par={d.supprimePar} le={d.supprimeLe}
                      enCours={actionId === d.id}
                      onRestaurer={() => restaurer("devis", d.id)}
                      onPurger={() => purger("devis", d.id)}
                    />
                  ))}
                  {archSinistres.map((s) => (
                    <LigneArchive
                      key={s.id} type="sinistres"
                      titre={s.typeAssurance ?? "Sinistre"}
                      sousTitre={`${s.user?.prenom ?? ""} ${s.user?.nom ?? ""} · ${s.user?.email ?? ""}`}
                      par={s.supprimePar} le={s.supprimeLe}
                      enCours={actionId === s.id}
                      onRestaurer={() => restaurer("sinistres", s.id)}
                      onPurger={() => purger("sinistres", s.id)}
                    />
                  ))}
                  {archContrats.map((c) => (
                    <LigneArchive
                      key={c.id} type="contrats"
                      titre={`${c.produit?.nom ?? "Contrat"} (${c.numeroContrat})`}
                      sousTitre={`${c.user?.prenom ?? ""} ${c.user?.nom ?? ""} · ${c.user?.email ?? ""}`}
                      par={c.supprimePar} le={c.supprimeLe}
                      enCours={actionId === c.id}
                      onRestaurer={() => restaurer("contrats", c.id)}
                      onPurger={() => purger("contrats", c.id)}
                    />
                  ))}
                </div>
              )}
            </motion.div>

            {/* Journal d'audit */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mt-8 bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
              <div className="px-6 sm:px-8 py-5 border-b flex items-center gap-2.5" style={{ borderColor: "#eef4f4" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                  <History size={18} style={{ color: "#2a8a8a" }} />
                </div>
                <h3 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Journal d&apos;audit</h3>
              </div>

              {journal.length === 0 ? (
                <div className="py-12 text-center text-sm text-gray-400">Aucune action enregistrée pour l&apos;instant.</div>
              ) : (
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
              )}
            </motion.div>
          </>
        )}

      </div>

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
                  <h3 className="font-bold">Envoyer une proposition</h3>
                  <p className="text-xs text-white/70">{propPour.produit?.nom} · {propPour.user?.prenom} {propPour.user?.nom}</p>
                </div>
                <button onClick={() => setPropPour(null)}><X size={20} /></button>
              </div>

              <div className="p-7 space-y-5">
                <Select
                  label="Compagnie partenaire" name="compagnie" value={propCompagnie} required
                  onChange={(e) => setPropCompagnie(e.target.value)}
                  options={PARTENAIRES.map((c) => ({ value: c, label: c }))}
                />
                <DocumentUpload
                  label="Fiche de la compagnie (PDF)"
                  value={propDocs}
                  onChange={setPropDocs}
                  required
                  hint="PDF ou image — obligatoire."
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prime proposée (FCFA, optionnel)</label>
                  <input
                    type="number" value={propPrime} onChange={(e) => setPropPrime(e.target.value)} placeholder="ex. 120000"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message (optionnel)</label>
                  <textarea
                    value={propMessage} onChange={(e) => setPropMessage(e.target.value)} rows={2} placeholder="Note pour le client…"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <button onClick={() => setPropPour(null)} className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-gray-50" style={{ color: "#1a2e5a", borderColor: "#e0ecec" }}>
                    Annuler
                  </button>
                  <button onClick={envoyerProposition} disabled={propEnvoi} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg disabled:opacity-60" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                    {propEnvoi ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    Envoyer au client
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modale : confirmation de déconnexion */}
      <AnimatePresence>
        {confirmDeco && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.5)" }}
            onClick={() => setConfirmDeco(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4" style={{ background: "#fee2e2" }}>
                <LogOut size={24} style={{ color: "#dc2626" }} />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "#1a2e5a" }}>Se déconnecter ?</h3>
              <p className="text-sm text-gray-500 mb-6">Vous allez quitter votre session et revenir à l&apos;accueil.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeco(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-gray-50 active:scale-95"
                  style={{ color: "#1a2e5a", borderColor: "#e0ecec" }}
                >
                  Annuler
                </button>
                <button
                  onClick={seDeconnecter}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg active:scale-95"
                  style={{ background: "linear-gradient(135deg, #dc2626, #b91c1c)" }}
                >
                  Se déconnecter
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
