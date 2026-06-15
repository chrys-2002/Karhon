"use client";
// Tableau de bord client : souscriptions, devis et sinistres.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BackButton from "@/components/ui/BackButton";
import {
  FileText,
  AlertTriangle,
  ClipboardList,
  CalendarClock,
  LogOut,
  FolderOpen,
  ShieldCheck,
  ArrowRight,
  Printer,
} from "lucide-react";

type Utilisateur = { nom?: string; prenom?: string; email?: string; role?: string };

type Devis = { id: string; statut?: string; dateCreation?: string; produit?: { nom?: string } };

// Date + heure lisibles (ex. "8 juin 2026 à 14:32").
const fmtDateHeure = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " à")
    : "";

type Contrat = {
  id: string;
  numeroContrat: string;
  statut?: string;
  dateFin?: string;
  dureeMois?: number;
  produit?: { nom?: string };
};

type Sinistre = {
  id: string;
  statut?: string;
  typeAssurance?: string | null;
  dateDeclaration?: string;
  dateSurvenance?: string;
};

type RendezVous = {
  id: string;
  statut?: string;
  motif?: string;
  dateHeure?: string;
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [sinistres, setSinistres] = useState<Sinistre[]>([]);
  const [rdv, setRdv] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeco, setConfirmDeco] = useState(false);

  // Récupère l'utilisateur réellement connecté via le cookie de session.
  useEffect(() => {
    let annule = false;
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("non-authentifie");
        return res.json();
      })
      .then((data) => {
        if (!annule) {
          setUser(data.utilisateur);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!annule) router.push("/client");
      });
    return () => {
      annule = true;
    };
  }, [router]);

  // Charge les vrais devis ET contrats du client connecté.
  useEffect(() => {
    let annule = false;
    Promise.all([
      fetch("/api/devis").then((res) => (res.ok ? res.json() : { devis: [] })),
      fetch("/api/contrats").then((res) => (res.ok ? res.json() : { contrats: [] })),
      fetch("/api/sinistres").then((res) => (res.ok ? res.json() : { sinistres: [] })),
      fetch("/api/rendez-vous").then((res) => (res.ok ? res.json() : { rendezVous: [] })),
    ])
      .then(([dDevis, dCon, dSin, dRdv]) => {
        if (annule) return;
        if (Array.isArray(dDevis.devis)) setDevis(dDevis.devis);
        if (Array.isArray(dCon.contrats)) setContrats(dCon.contrats);
        if (Array.isArray(dSin.sinistres)) setSinistres(dSin.sinistres);
        if (Array.isArray(dRdv.rendezVous)) setRdv(dRdv.rendezVous);
      })
      .catch(() => {/* compteurs restent à 0 */});
    return () => {
      annule = true;
    };
  }, []);

  // Déconnexion : efface le cookie côté serveur puis redirige.
  const seDeconnecter = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/"); // retour à la page d'accueil principale
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8fbfb" }}>
        <div
          className="animate-spin rounded-full h-9 w-9 border-2 border-t-transparent"
          style={{ borderColor: "#2a8a8a", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!user) return null;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  // Données réelles : aucune pour l'instant (les API contrats/devis/sinistres
  // seront branchées ensuite). On affiche donc 0 partout, honnêtement.
  // Fait défiler en douceur vers une section (ancre) du tableau de bord.
  const allerVers = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const contratsActifs = contrats.filter((c) => c.statut === "actif").length;
  // Échéances proches : souscriptions actives arrivant à terme dans ≤ 90 jours.
  const dansFenetre90 = (iso?: string) => {
    if (!iso) return false;
    const jours = (new Date(iso).getTime() - Date.now()) / 86_400_000;
    return jours > 0 && jours <= 90;
  };
  const echeancesProches = contrats.filter((c) => c.statut === "actif" && dansFenetre90(c.dateFin)).length;

  const stats = [
    { label: "Souscriptions actives", value: contratsActifs, Icon: FileText, cible: "section-contrats" },
    { label: "Sinistres", value: sinistres.length, Icon: AlertTriangle, cible: "section-sinistres" },
    { label: "Devis", value: devis.length, Icon: ClipboardList, cible: "section-devis" },
    { label: "Échéances proches", value: echeancesProches, Icon: CalendarClock, cible: "section-contrats" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "#f8fbfb" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6">
          <BackButton label="Retour" />
        </div>

        {/* En-tête de bienvenue */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex flex-wrap items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
              <ShieldCheck size={26} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "#1a2e5a" }}>
                Bonjour, {user.prenom || user.email?.split("@")[0] || "Client"}
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Bienvenue dans votre espace personnel</p>
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

        {/* Statistiques */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {stats.map(({ label, value, Icon, cible }) => (
            <button
              key={label}
              type="button"
              onClick={() => allerVers(cible)}
              className="bg-white rounded-3xl p-6 shadow-sm border text-left transition-all hover:shadow-md hover:scale-[1.02] active:scale-95"
              style={{ borderColor: "#e0ecec" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
                  <p className="text-3xl font-bold mt-2" style={{ color: "#1a2e5a" }}>{value}</p>
                </div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                  <Icon size={20} style={{ color: "#2a8a8a" }} />
                </div>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Mes contrats */}
        <motion.div id="section-contrats" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="scroll-mt-28 bg-white rounded-3xl shadow-sm border overflow-hidden mb-8" style={{ borderColor: "#e0ecec" }}>
          <div className="px-6 sm:px-8 py-5 border-b" style={{ borderColor: "#eef4f4" }}>
            <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Mes souscriptions</h2>
          </div>

          {contrats.length === 0 ? (
            /* État vide */
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <FolderOpen size={28} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Aucune souscription pour le moment</p>
              <p className="text-gray-400 text-sm max-w-sm mb-6">
                Vos souscriptions apparaîtront ici dès qu&apos;elles seront enregistrées. Commencez par demander un devis.
              </p>
              <Link
                href="/devis"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02] active:scale-95"
                style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
              >
                Demander un devis <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#eef4f4]">
              {contrats.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-6 sm:px-8 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                      <FileText size={18} style={{ color: "#2a8a8a" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm" style={{ color: "#1a2e5a" }}>{c.produit?.nom ?? "Contrat"}</p>
                      <p className="text-xs text-gray-400">N° {c.numeroContrat} · échéance {fmtDate(c.dateFin)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize" style={{ background: c.statut === "actif" ? "#dcfce7" : "#eaf4f4", color: c.statut === "actif" ? "#166534" : "#2a8a8a" }}>
                      {(c.statut ?? "actif").replace(/_/g, " ")}
                    </span>
                    <Link
                      href={`/client/contrats/${c.id}/imprimer`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                      style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
                    >
                      <Printer size={14} /> Imprimer le reçu
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Mes devis */}
        <motion.div id="section-devis" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.25 }} className="scroll-mt-28 bg-white rounded-3xl shadow-sm border overflow-hidden mb-8" style={{ borderColor: "#e0ecec" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: "#eef4f4" }}>
            <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Mes devis</h2>
            <Link href="/devis" className="text-sm font-semibold" style={{ color: "#2a8a8a" }}>+ Nouveau</Link>
          </div>

          {devis.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <ClipboardList size={24} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Aucune demande de devis</p>
              <p className="text-gray-400 text-sm max-w-sm">Vos demandes de devis apparaîtront ici.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#eef4f4]">
              {devis.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-6 sm:px-8 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                      <ClipboardList size={18} style={{ color: "#2a8a8a" }} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm" style={{ color: "#1a2e5a" }}>{d.produit?.nom ?? "Produit"}</p>
                      {d.dateCreation && (
                        <p className="text-xs text-gray-400">Demande envoyée le {fmtDateHeure(d.dateCreation)}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: "#2a8a8a" }}>
                    {(d.statut ?? "en_attente").replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Mes sinistres */}
        <motion.div id="section-sinistres" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.28 }} className="scroll-mt-28 bg-white rounded-3xl shadow-sm border overflow-hidden mb-8" style={{ borderColor: "#e0ecec" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: "#eef4f4" }}>
            <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Mes sinistres</h2>
            <Link href="/client/sinistres/nouveau" className="text-sm font-semibold" style={{ color: "#2a8a8a" }}>+ Déclarer</Link>
          </div>

          {sinistres.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <AlertTriangle size={24} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Aucun sinistre déclaré</p>
              <p className="text-gray-400 text-sm max-w-sm">Vos déclarations de sinistre et leur suivi apparaîtront ici.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#eef4f4]">
              {sinistres.map((s) => {
                const statut = s.statut ?? "declare";
                const couleur =
                  statut === "indemnise" ? { bg: "#dcfce7", fg: "#166534" }
                  : statut === "refuse" ? { bg: "#fee2e2", fg: "#991b1b" }
                  : statut === "en_cours" ? { bg: "#fef9c3", fg: "#854d0e" }
                  : { bg: "#eaf4f4", fg: "#2a8a8a" };
                return (
                  <li key={s.id} className="flex items-center justify-between px-6 sm:px-8 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                        <AlertTriangle size={18} style={{ color: "#2a8a8a" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm capitalize" style={{ color: "#1a2e5a" }}>{s.typeAssurance ?? "Sinistre"}</p>
                        {s.dateDeclaration && (
                          <p className="text-xs text-gray-400">Déclaré le {fmtDateHeure(s.dateDeclaration)}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize" style={{ background: couleur.bg, color: couleur.fg }}>
                      {statut.replace(/_/g, " ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>

        {/* Mes rendez-vous */}
        <motion.div id="section-rdv" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.29 }} className="scroll-mt-28 bg-white rounded-3xl shadow-sm border overflow-hidden mb-8" style={{ borderColor: "#e0ecec" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: "#eef4f4" }}>
            <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Mes rendez-vous</h2>
            <Link href="/client/rendez-vous/nouveau" className="text-sm font-semibold" style={{ color: "#2a8a8a" }}>+ Prendre rendez-vous</Link>
          </div>

          {rdv.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <CalendarClock size={24} style={{ color: "#2a8a8a" }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Aucun rendez-vous</p>
              <p className="text-gray-400 text-sm max-w-sm">Prenez rendez-vous avec un conseiller, vos créneaux apparaîtront ici.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#eef4f4]">
              {rdv.map((r) => {
                const statut = r.statut ?? "en_attente";
                const couleur =
                  statut === "confirme" ? { bg: "#dcfce7", fg: "#166534" }
                  : statut === "annule" ? { bg: "#fee2e2", fg: "#991b1b" }
                  : statut === "termine" ? { bg: "#eaf4f4", fg: "#2a8a8a" }
                  : { bg: "#fef9c3", fg: "#854d0e" };
                return (
                  <li key={r.id} className="flex items-center justify-between px-6 sm:px-8 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                        <CalendarClock size={18} style={{ color: "#2a8a8a" }} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm" style={{ color: "#1a2e5a" }}>{r.motif ?? "Rendez-vous"}</p>
                        {r.dateHeure && <p className="text-xs text-gray-400">{fmtDateHeure(r.dateHeure)}</p>}
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize" style={{ background: couleur.bg, color: couleur.fg }}>
                      {statut.replace(/_/g, " ")}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>

        {/* Actions rapides */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }} className="scroll-mt-28 grid sm:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/client/rendez-vous/nouveau">
            <div className="bg-white rounded-3xl p-6 border flex items-center gap-4 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer h-full" style={{ borderColor: "#e0ecec" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <CalendarClock size={22} style={{ color: "#2a8a8a" }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: "#1a2e5a" }}>Prendre rendez-vous</h3>
                <p className="text-gray-400 text-sm">Rencontrez un conseiller à votre créneau</p>
              </div>
            </div>
          </Link>

          <Link href="/client/sinistres/nouveau">
            <div className="bg-white rounded-3xl p-6 border flex items-center gap-4 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer h-full" style={{ borderColor: "#e0ecec" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <AlertTriangle size={22} style={{ color: "#2a8a8a" }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: "#1a2e5a" }}>Déclarer un sinistre</h3>
                <p className="text-gray-400 text-sm">Signalez un incident en quelques clics</p>
              </div>
            </div>
          </Link>

          <Link href="/devis">
            <div className="bg-white rounded-3xl p-6 border flex items-center gap-4 transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer h-full" style={{ borderColor: "#e0ecec" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <ClipboardList size={22} style={{ color: "#2a8a8a" }} />
              </div>
              <div>
                <h3 className="font-semibold" style={{ color: "#1a2e5a" }}>Nouveau devis</h3>
                <p className="text-gray-400 text-sm">Obtenez une offre personnalisée gratuite</p>
              </div>
            </div>
          </Link>
        </motion.div>

      </div>

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
              <p className="text-sm text-gray-500 mb-6">Vous allez quitter votre espace et revenir à l&apos;accueil.</p>
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
