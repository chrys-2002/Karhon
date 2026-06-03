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
  produit?: { nom?: string; type?: string };
  user?: { nom?: string; prenom?: string; email?: string };
};

// Libellés + couleurs des statuts (alignés sur l'enum StatutDevis).
const STATUTS: { value: string; label: string; couleur: string; fond: string }[] = [
  { value: "en_attente", label: "En attente", couleur: "#92600a", fond: "#fef3c7" },
  { value: "en_cours", label: "En cours", couleur: "#1e40af", fond: "#dbeafe" },
  { value: "envoye", label: "Envoyé", couleur: "#5b21b6", fond: "#ede9fe" },
  { value: "accepte", label: "Accepté", couleur: "#166534", fond: "#dcfce7" },
  { value: "refuse", label: "Refusé", couleur: "#991b1b", fond: "#fee2e2" },
];

const infoStatut = (v: string) =>
  STATUTS.find((s) => s.value === v) ?? STATUTS[0];

// ── Dropdown de statut « premium » (remplace le <select> natif) ──
function StatutDropdown({
  valeur,
  onChange,
  disabled,
}: {
  valeur: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const courant = infoStatut(valeur);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
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
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 z-30 mt-2 w-52 overflow-hidden rounded-2xl bg-white p-1.5"
            style={{ border: "1px solid #e0ecec", boxShadow: "0 16px 40px rgba(26,46,90,0.16)" }}
          >
            {STATUTS.map((s) => {
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
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [autorise, setAutorise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [devis, setDevis] = useState<DevisAdmin[]>([]);
  const [majId, setMajId] = useState<string | null>(null);
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

  // 2) Charge tous les devis (l'API renvoie TOUT pour un admin).
  useEffect(() => {
    if (!autorise) return;
    fetch("/api/devis")
      .then((res) => (res.ok ? res.json() : { devis: [] }))
      .then((data) => {
        if (Array.isArray(data.devis)) setDevis(data.devis);
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
              <p className="text-gray-500 text-sm mt-0.5">Gestion des demandes de devis clients</p>
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
            <div className="divide-y" style={{ borderColor: "#eef4f4" }}>
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

      </div>
    </div>
  );
}
