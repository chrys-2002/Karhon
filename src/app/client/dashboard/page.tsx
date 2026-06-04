"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";

type Utilisateur = { nom?: string; prenom?: string; email?: string; role?: string };

type Devis = { id: string; statut?: string; produit?: { nom?: string } };

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Charge les vrais devis du client connecté.
  useEffect(() => {
    let annule = false;
    fetch("/api/devis")
      .then((res) => (res.ok ? res.json() : { devis: [] }))
      .then((data) => {
        if (!annule && Array.isArray(data.devis)) setDevis(data.devis);
      })
      .catch(() => {/* compteur restera à 0 */});
    return () => {
      annule = true;
    };
  }, []);

  // Déconnexion : efface le cookie côté serveur puis redirige.
  const seDeconnecter = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/client");
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

  const stats = [
    { label: "Contrats actifs", value: 0, Icon: FileText, cible: "section-contrats" },
    { label: "Sinistres", value: 0, Icon: AlertTriangle, cible: "section-sinistre" },
    { label: "Devis", value: devis.length, Icon: ClipboardList, cible: "section-devis" },
    { label: "Échéances", value: 0, Icon: CalendarClock, cible: "section-contrats" },
  ];

  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "#f8fbfb" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6">
          <BackButton href="/" label="Retour à l'accueil" />
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
            onClick={seDeconnecter}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border transition-all hover:scale-[1.02] active:scale-95"
            style={{ color: "#1a2e5a", borderColor: "#cfe3e3", backgroundColor: "#ffffff" }}
          >
            <LogOut size={16} style={{ color: "#2a8a8a" }} />
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
            <h2 className="text-lg font-bold" style={{ color: "#1a2e5a" }}>Mes contrats</h2>
          </div>

          {/* État vide (aucune donnée réelle pour l'instant) */}
          <div className="flex flex-col items-center justify-center text-center py-16 px-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
              <FolderOpen size={28} style={{ color: "#2a8a8a" }} />
            </div>
            <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>Aucun contrat pour le moment</p>
            <p className="text-gray-400 text-sm max-w-sm mb-6">
              Vos contrats apparaîtront ici dès qu&apos;ils seront enregistrés. Commencez par demander un devis.
            </p>
            <Link
              href="/devis"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02] active:scale-95"
              style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
            >
              Demander un devis <ArrowRight size={16} />
            </Link>
          </div>
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
            <ul className="divide-y" style={{ borderColor: "#eef4f4" }}>
              {devis.map((d) => (
                <li key={d.id} className="flex items-center justify-between px-6 sm:px-8 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                      <ClipboardList size={18} style={{ color: "#2a8a8a" }} />
                    </div>
                    <span className="font-medium text-sm" style={{ color: "#1a2e5a" }}>{d.produit?.nom ?? "Produit"}</span>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: "#2a8a8a" }}>
                    {(d.statut ?? "en_attente").replace(/_/g, " ")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        {/* Actions rapides */}
        <motion.div id="section-sinistre" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.3 }} className="scroll-mt-28 grid sm:grid-cols-2 gap-4 sm:gap-6">
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
    </div>
  );
}
