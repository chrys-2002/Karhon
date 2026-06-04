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
} from "lucide-react";

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

type DevisAdmin = {
  id: string;
  dateCreation: string;
  statut: string;
  montantEstime: number | null;
  description: string;
  documents?: string[];
  produit?: { nom?: string; type?: string };
  user?: { nom?: string; prenom?: string; email?: string };
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
  user?: { nom?: string; prenom?: string; email?: string };
};

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

export default function AdminPage() {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [devis, setDevis] = useState<DevisAdmin[]>([]);
  const [sinistres, setSinistres] = useState<SinistreAdmin[]>([]);
  const [majId, setMajId] = useState<string | null>(null);
  const [majSinistreId, setMajSinistreId] = useState<string | null>(null);
  // Filtre actif : "tous" ou une valeur de statut. Piloté par les cartes.
  const [filtre, setFiltre] = useState<string>("tous");

  // 1) Contrôle d'accès : doit être connecté ET admin.
  useEffect(() => {
    let annule = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (annule) return;
        if (data.utilisateur?.role === "admin") {
          setAutorise(true);
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
    ])
      .then(([dDevis, dSin]) => {
        if (Array.isArray(dDevis.devis)) setDevis(dDevis.devis);
        if (Array.isArray(dSin.sinistres)) setSinistres(dSin.sinistres);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [autorise]);

  const seDeconnecter = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/client");
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
            onClick={seDeconnecter}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all hover:scale-[1.02] active:scale-95"
            style={{ color: "#1a2e5a", borderColor: "#cfe3e3", backgroundColor: "#ffffff" }}
          >
            <LogOut size={16} style={{ color: "#2a8a8a" }} />
            Se déconnecter
          </button>
        </motion.div>

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
                  day: "2-digit", month: "short", year: "numeric",
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
                      </div>

                      {/* Changement de statut (dropdown premium) */}
                      <div className="flex items-center gap-2">
                        {majId === d.id && <Loader2 className="animate-spin" size={16} style={{ color: "#2a8a8a" }} />}
                        <StatutDropdown
                          valeur={d.statut}
                          disabled={majId === d.id}
                          onChange={(v) => changerStatut(d.id, v)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* ── Sinistres déclarés par les clients ── */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }} className="mt-8 bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
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
                  day: "2-digit", month: "short", year: "numeric",
                });
                const dateSurv = new Date(s.dateSurvenance).toLocaleDateString("fr-FR", {
                  day: "2-digit", month: "short", year: "numeric",
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
                      </div>

                      {/* Changement de statut du sinistre */}
                      <div className="flex items-center gap-2">
                        {majSinistreId === s.id && <Loader2 className="animate-spin" size={16} style={{ color: "#2a8a8a" }} />}
                        <StatutDropdown
                          valeur={s.statut}
                          options={STATUTS_SINISTRE}
                          disabled={majSinistreId === s.id}
                          onChange={(v) => changerStatutSinistre(s.id, v)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
