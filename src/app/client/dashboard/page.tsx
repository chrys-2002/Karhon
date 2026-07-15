"use client";
// Tableau de bord client — coquille premium (sidebar + top bar), onglets,
// indicateurs animés et graphes. Souscriptions, devis, sinistres, rendez-vous.
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import DashboardShell, { type NavItem } from "@/components/ui/DashboardShell";
import MessagesClient from "@/components/messages/MessagesClient";
import {
  FileText,
  AlertTriangle,
  ClipboardList,
  CalendarClock,
  FolderOpen,
  ArrowRight,
  Printer,
  LayoutGrid,
  TrendingUp,
  Sparkles,
  MessagesSquare,
  ChevronDown,
  CheckCircle2,
  Check,
  CreditCard,
  X,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RTooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from "recharts";

type Utilisateur = { nom?: string; prenom?: string; email?: string; role?: string };

// Libellés des modes de paiement.
const MODE_LABEL: Record<string, string> = { carte: "Carte bancaire", wave: "Wave", orange_money: "Orange Money" };
// Libellés lisibles des statuts de cotation côté client.
const STATUT_COTATION: Record<string, string> = {
  en_attente: "En attente",
  envoye: "Offre à choisir",
  choisi: "En cours",
  paye: "En cours",
  en_cours: "En cours",
  accepte: "Souscrit",
  refuse: "Refusé",
};
const libStatut = (s?: string | null) => STATUT_COTATION[s ?? "en_attente"] ?? (s ?? "").replace(/_/g, " ");
const MODES_PAIEMENT = [
  { v: "carte", label: "Carte bancaire", desc: "Visa / Mastercard, paiement en ligne sécurisé" },
  { v: "wave", label: "Wave", desc: "Paiement mobile Wave" },
  { v: "orange_money", label: "Orange Money", desc: "Paiement mobile Orange Money" },
];

type Proposition = {
  id: string;
  compagnie: string;
  documents: string[];
  prime?: number | null;
  message?: string | null;
  choisie: boolean;
  dateEnvoi?: string;
  vueClient?: boolean;
};
type Devis = { id: string; statut?: string; dateCreation?: string; segment?: string | null; montantEstime?: number | null; modePaiement?: string | null; montantAPayer?: number | null; lienPaiement?: string | null; produit?: { nom?: string }; propositions?: Proposition[] };

type Contrat = {
  id: string;
  numeroContrat: string;
  statut?: string;
  dateDebut?: string;
  dateFin?: string;
  dureeMois?: number;
  primeAnnuelle?: number;
  compagnie?: string | null;
  segment?: string | null;
  attestation?: string | null;
  produit?: { nom?: string };
};

type Sinistre = {
  id: string;
  statut?: string;
  typeAssurance?: string | null;
  dateDeclaration?: string;
  dateSurvenance?: string;
  heureSurvenance?: string | null;
  lieu?: string | null;
  description?: string;
  montantEstime?: number | null;
};

type RendezVous = { id: string; statut?: string; motif?: string; dateHeure?: string; notes?: string | null };

const MARINE = "#1a2e5a";
const TEAL = "#2a8a8a";

const fmtDateHeure = (iso?: string) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", " à")
    : "";
const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "short", year: "numeric" }) : "—";

// Compteur animé (montée en douceur de 0 → valeur).
function Compteur({ value }: { value: number }) {
  const [n, setN] = useState(0);
  const ref = useRef<number | null>(null);
  useEffect(() => {
    const duree = 800;
    const debut = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - debut) / duree, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setN(Math.round(eased * value));
      if (p < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => { if (ref.current) cancelAnimationFrame(ref.current); };
  }, [value]);
  return <>{n}</>;
}

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.06 } }),
};

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [devis, setDevis] = useState<Devis[]>([]);
  const [contrats, setContrats] = useState<Contrat[]>([]);
  const [sinistres, setSinistres] = useState<Sinistre[]>([]);
  const [rdv, setRdv] = useState<RendezVous[]>([]);
  const [loading, setLoading] = useState(true);
  const [vue, setVue] = useState<"accueil" | "souscriptions" | "devis" | "sinistres" | "rdv" | "messages">("accueil");
  const [messagesNonLus, setMessagesNonLus] = useState(0);
  const [contratOuvert, setContratOuvert] = useState<string | null>(null);
  const [detailOuvert, setDetailOuvert] = useState<string | null>(null); // devis / sinistre / rdv
  const [ouvrirConvDirect, setOuvrirConvDirect] = useState(false); // ouvrir la conversation au clic d'une notif
  const [cibleDossier, setCibleDossier] = useState<string | null>(null); // dossier exact à ouvrir/surligner au clic d'une notif

  useEffect(() => {
    let annule = false;
    fetch("/api/auth/me")
      .then((res) => { if (!res.ok) throw new Error("non-authentifie"); return res.json(); })
      .then((data) => { if (!annule) { setUser(data.utilisateur); setLoading(false); } })
      .catch(() => { if (!annule) router.push("/client"); });
    return () => { annule = true; };
  }, [router]);

  useEffect(() => {
    let annule = false;
    // Recharge les données du client. Appelé au montage, périodiquement, et au
    // retour sur l'onglet : ainsi une souscription enregistrée par le rédacteur
    // (ou une nouvelle offre, un changement de statut) apparaît sans rechargement.
    const chargerDonnees = () =>
      Promise.all([
        fetch("/api/devis", { cache: "no-store" }).then((res) => (res.ok ? res.json() : { devis: [] })),
        fetch("/api/contrats", { cache: "no-store" }).then((res) => (res.ok ? res.json() : { contrats: [] })),
        fetch("/api/sinistres", { cache: "no-store" }).then((res) => (res.ok ? res.json() : { sinistres: [] })),
        fetch("/api/rendez-vous", { cache: "no-store" }).then((res) => (res.ok ? res.json() : { rendezVous: [] })),
      ])
        .then(([dDevis, dCon, dSin, dRdv]) => {
          if (annule) return;
          if (Array.isArray(dDevis.devis)) setDevis(dDevis.devis);
          if (Array.isArray(dCon.contrats)) setContrats(dCon.contrats);
          if (Array.isArray(dSin.sinistres)) setSinistres(dSin.sinistres);
          if (Array.isArray(dRdv.rendezVous)) setRdv(dRdv.rendezVous);
        })
        .catch(() => {});
    chargerDonnees();
    const t = setInterval(chargerDonnees, 30000);
    const onFocus = () => chargerDonnees();
    window.addEventListener("focus", onFocus);
    return () => { annule = true; clearInterval(t); window.removeEventListener("focus", onFocus); };
  }, []);

  // Compteur de messages non lus (pour la pastille de l'onglet Messages).
  useEffect(() => {
    let stop = false;
    const charger = () => fetch("/api/messages?count=1")
      .then((r) => (r.ok ? r.json() : { nonLus: 0 }))
      .then((d) => { if (!stop) setMessagesNonLus(d.nonLus ?? 0); })
      .catch(() => {});
    charger();
    const t = setInterval(charger, 30000);
    return () => { stop = true; clearInterval(t); };
  }, [vue]);

  // Au chargement (clic notif / lien e-mail), ouvre l'onglet et, pour un message, la conversation.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const o = params.get("onglet");
    const ref = params.get("ref");
    if (o) setVue(o as typeof vue);
    if (o === "messages" && ref) setOuvrirConvDirect(true);
    if (ref && o !== "messages") setCibleDossier(ref);
  }, []);

  // L'ouverture directe ne vaut que pour l'arrivée via notification.
  useEffect(() => { if (vue !== "messages") setOuvrirConvDirect(false); }, [vue]);

  // Ouvre et défile vers le dossier exact ciblé par une notification, puis
  // retire le repère. Pour une cotation, on ouvre aussi le groupe de propositions.
  useEffect(() => {
    if (!cibleDossier) return;
    setDetailOuvert(cibleDossier);
    setGroupeOuvert(cibleDossier);
    const t = setTimeout(() => {
      const el = document.getElementById(`dossier-${cibleDossier}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 320);
    const clear = setTimeout(() => setCibleDossier(null), 3500);
    return () => { clearTimeout(t); clearTimeout(clear); };
  }, [cibleDossier, vue, devis, sinistres, rdv]);

  // Choix d'une offre : le client retient une proposition puis indique son
  // mode de paiement. La cotation passe en "choisi" (en attente de paiement).
  const [choixModal, setChoixModal] = useState<{ devisId: string; propId: string } | null>(null);
  const [modePaiement, setModePaiement] = useState("");
  const [choixEnvoi, setChoixEnvoi] = useState(false);
  const [erreurChoix, setErreurChoix] = useState("");
  const [groupeOuvert, setGroupeOuvert] = useState<string | null>(null);
  // Offres écartées par le client (localement, pour comparer) — non enregistré.
  const [ecartees, setEcartees] = useState<Set<string>>(new Set());
  const toggleEcartee = (id: string) =>
    setEcartees((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  // Marque côté serveur toutes les propositions d'une cotation comme consultées
  // (appelé à l'ouverture du groupe). Met aussi l'état local à jour tout de suite
  // pour que le repère « Nouveau » disparaisse sans attendre le rechargement.
  const marquerVues = (devisId: string) => {
    setDevis((prev) =>
      prev.map((d) =>
        d.id === devisId
          ? { ...d, propositions: d.propositions?.map((p) => ({ ...p, vueClient: true })) }
          : d
      )
    );
    fetch(`/api/devis/${devisId}/vues`, { method: "POST" }).catch(() => {});
  };

  const confirmerChoix = async () => {
    if (!choixModal || !modePaiement || choixEnvoi) return;
    setChoixEnvoi(true);
    setErreurChoix("");
    try {
      const res = await fetch(`/api/propositions/${choixModal.propId}/choisir`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modePaiement }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErreurChoix(data?.erreur || "Le choix n'a pas pu être envoyé. Réessayez.");
        return;
      }
      setDevis((prev) =>
        prev.map((d) =>
          d.id === choixModal.devisId
            ? { ...d, statut: "en_cours", modePaiement, propositions: d.propositions?.map((p) => ({ ...p, choisie: p.id === choixModal.propId })) }
            : d
        )
      );
      setChoixModal(null);
      setModePaiement("");
    } catch {
      setErreurChoix("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setChoixEnvoi(false);
    }
  };

  const seDeconnecter = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  // ── Indicateurs ──
  const dansFenetre90 = (iso?: string) => {
    if (!iso) return false;
    const jours = (new Date(iso).getTime() - Date.now()) / 86_400_000;
    return jours > 0 && jours <= 90;
  };
  const contratsActifs = contrats.filter((c) => c.statut === "actif").length;
  const echeancesProches = contrats.filter((c) => c.statut === "actif" && dansFenetre90(c.dateFin)).length;
  const offresAChoisir = devis.filter((d) => (d.propositions ?? []).length > 0 && !(d.propositions ?? []).some((p) => p.choisie)).length;
  const rdvAvenir = rdv.filter((r) => r.dateHeure && new Date(r.dateHeure).getTime() > Date.now() && r.statut !== "annule" && r.statut !== "termine").length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f4f9f9" }}>
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-t-transparent" style={{ borderColor: TEAL, borderTopColor: "transparent" }} />
      </div>
    );
  }
  if (!user) return null;

  const items: NavItem[] = [
    { cle: "accueil", label: "Accueil", Icon: LayoutGrid },
    { cle: "souscriptions", label: "Souscriptions", Icon: FileText },
    { cle: "devis", label: "Cotations", Icon: ClipboardList, badge: offresAChoisir },
    { cle: "sinistres", label: "Sinistres", Icon: AlertTriangle },
    { cle: "rdv", label: "Rendez-vous", Icon: CalendarClock },
    { cle: "messages", label: "Messages", Icon: MessagesSquare, badge: messagesNonLus },
  ];

  const titres: Record<typeof vue, { t: string; s: string }> = {
    accueil: { t: `Bonjour, ${user.prenom || user.email?.split("@")[0] || "Client"}`, s: "Vue d'ensemble de votre espace" },
    souscriptions: { t: "Mes souscriptions", s: "Vos contrats et leurs échéances" },
    devis: { t: "Mes cotations", s: "Vos demandes et les offres reçues" },
    sinistres: { t: "Mes sinistres", s: "Suivi de vos déclarations" },
    rdv: { t: "Mes rendez-vous", s: "Vos créneaux avec un conseiller" },
    messages: { t: "Messagerie", s: "Échangez avec votre conseiller KARHON" },
  };

  const repartition = [
    { nom: "Souscriptions", valeur: contrats.length, couleur: TEAL },
    { nom: "Cotations", valeur: devis.length, couleur: MARINE },
    { nom: "Sinistres", valeur: sinistres.length, couleur: "#f59e0b" },
    { nom: "Rendez-vous", valeur: rdv.length, couleur: "#7c5cff" },
  ].filter((x) => x.valeur > 0);
  const totalActivite = repartition.reduce((s, x) => s + x.valeur, 0);

  // Petite courbe « échéances » : nb de contrats arrivant à terme par mois (6 mois à venir).
  const moisLabels = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() + i);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("fr-FR", { month: "short", timeZone: "Africa/Abidjan" }) };
  });
  const echeancesData = moisLabels.map((m) => ({
    mois: m.label,
    echeances: contrats.filter((c) => {
      if (c.statut !== "actif" || !c.dateFin) return false;
      const d = new Date(c.dateFin);
      return `${d.getFullYear()}-${d.getMonth()}` === m.key;
    }).length,
  }));

  const stats = [
    { label: "Souscriptions actives", value: contratsActifs, Icon: FileText, cible: "souscriptions" as const },
    { label: "Cotations", value: devis.length, Icon: ClipboardList, cible: "devis" as const },
    { label: "Sinistres", value: sinistres.length, Icon: AlertTriangle, cible: "sinistres" as const },
    { label: "Rendez-vous à venir", value: rdvAvenir, Icon: CalendarClock, cible: "rdv" as const },
  ];

  return (
    <DashboardShell
      marque="Espace client"
      items={items}
      actif={vue}
      onNaviger={(c, ref) => { setVue(c as typeof vue); if (c === "messages" && ref) setOuvrirConvDirect(true); if (ref && c !== "messages") setCibleDossier(ref); }}
      titre={titres[vue].t}
      sousTitre={titres[vue].s}
      user={user}
      onLogout={seDeconnecter}
    >
      {/* ───────────── ACCUEIL ───────────── */}
      {vue === "accueil" && (
        <div className="space-y-6">
          {/* Bandeau « offres à choisir » */}
          {offresAChoisir > 0 && (
            <motion.button
              onClick={() => setVue("devis")}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="w-full flex items-center gap-3 rounded-2xl px-5 py-4 border text-left transition-all hover:shadow-md"
              style={{ background: "linear-gradient(135deg, #eef9f9, #ffffff)", borderColor: "#cfe9e9" }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                <Sparkles size={18} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: MARINE }}>
                  {offresAChoisir} offre{offresAChoisir > 1 ? "s" : ""} à comparer
                </p>
                <p className="text-xs text-gray-500">Des compagnies vous ont proposé des cotations. Choisissez la meilleure pour vous.</p>
              </div>
              <ArrowRight size={18} style={{ color: TEAL }} />
            </motion.button>
          )}

          {/* KPIs animés */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, Icon, cible }, i) => (
              <motion.button
                key={label}
                custom={i} initial="hidden" animate="visible" variants={fadeUp}
                onClick={() => setVue(cible)}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border text-left transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
                style={{ borderColor: "#e6f0f0" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-400 text-[11px] uppercase tracking-wide">{label}</p>
                    <p className="text-3xl font-extrabold mt-2" style={{ color: MARINE }}><Compteur value={value} /></p>
                  </div>
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                    <Icon size={20} style={{ color: TEAL }} />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Graphes : répartition (donut) + échéances (aire) */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
            <motion.div custom={4} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl shadow-sm border p-6" style={{ borderColor: "#e6f0f0" }}>
              <h3 className="text-base font-bold mb-1" style={{ color: MARINE }}>Répartition de votre activité</h3>
              <p className="text-xs text-gray-400 mb-3">Vos demandes et contrats en un coup d&apos;œil</p>
              {totalActivite === 0 ? (
                <div className="h-[240px] flex flex-col items-center justify-center text-center">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                    <LayoutGrid size={24} style={{ color: TEAL }} />
                  </div>
                  <p className="text-sm text-gray-400">Rien à afficher pour l&apos;instant.</p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-full sm:w-1/2 h-[200px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={repartition} dataKey="valeur" nameKey="nom" cx="50%" cy="50%" innerRadius={56} outerRadius={82} paddingAngle={3} stroke="none" animationDuration={900}>
                          {repartition.map((e) => <Cell key={e.nom} fill={e.couleur} />)}
                        </Pie>
                        <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6f0f0", fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-extrabold" style={{ color: MARINE }}>{totalActivite}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wide">éléments</span>
                    </div>
                  </div>
                  <ul className="w-full sm:w-1/2 space-y-2">
                    {repartition.map((e) => (
                      <li key={e.nom} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-gray-600">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.couleur }} /> {e.nom}
                        </span>
                        <span className="font-bold" style={{ color: MARINE }}>{e.valeur}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>

            <motion.div custom={5} initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl shadow-sm border p-6" style={{ borderColor: "#e6f0f0" }}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-base font-bold" style={{ color: MARINE }}>Échéances à venir</h3>
                {echeancesProches > 0 && (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1" style={{ background: "#fef3c7", color: "#92600a" }}>
                    <TrendingUp size={12} /> {echeancesProches} ≤ 90 j
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mb-3">Renouvellements sur les 6 prochains mois</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={echeancesData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradEch" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={TEAL} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={TEAL} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef4f4" vertical={false} />
                    <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                    <RTooltip contentStyle={{ borderRadius: 12, border: "1px solid #e6f0f0", fontSize: 12 }} />
                    <Area type="monotone" dataKey="echeances" name="Échéances" stroke={TEAL} strokeWidth={2.5} fill="url(#gradEch)" animationDuration={900} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Actions rapides */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { href: "/client/rendez-vous/nouveau", Icon: CalendarClock, t: "Prendre rendez-vous", d: "Rencontrez un conseiller" },
              { href: "/client/sinistres/nouveau", Icon: AlertTriangle, t: "Déclarer un sinistre", d: "Signalez un incident" },
              { href: "/devis", Icon: ClipboardList, t: "Nouvelle cotation", d: "Une offre personnalisée" },
            ].map((a, i) => (
              <motion.div key={a.href} custom={6 + i} initial="hidden" animate="visible" variants={fadeUp}>
                <Link href={a.href}>
                  <div className="bg-white rounded-3xl p-5 border flex items-center gap-4 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer h-full" style={{ borderColor: "#e6f0f0" }}>
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                      <a.Icon size={22} style={{ color: TEAL }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm" style={{ color: MARINE }}>{a.t}</h3>
                      <p className="text-gray-400 text-xs">{a.d}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ───────────── SOUSCRIPTIONS ───────────── */}
      {vue === "souscriptions" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e6f0f0" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: "#eef4f4" }}>
            <h2 className="text-lg font-bold" style={{ color: MARINE }}>Mes souscriptions</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: TEAL }}>{contrats.length} contrat{contrats.length > 1 ? "s" : ""}</span>
          </div>
          {contrats.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <FolderOpen size={28} style={{ color: TEAL }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: MARINE }}>Aucune souscription pour le moment</p>
              <p className="text-gray-400 text-sm max-w-sm mb-6">Vos souscriptions apparaîtront ici. Commencez par demander une cotation.</p>
              <Link href="/devis" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02] active:scale-95" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                Demander une cotation <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-[#eef4f4]">
              {contrats.map((c) => {
                const ouvert = contratOuvert === c.id;
                const segLabel = c.segment === "professionnel" ? "Professionnel — flotte / pack auto" : c.segment === "transport" ? "Transport professionnel" : "Particulier (usage personnel)";
                const lignes: [string, string][] = [
                  ["Produit", c.produit?.nom ?? "—"],
                  ["N° de contrat", c.numeroContrat],
                  ["Catégorie", segLabel],
                  ["Compagnie", c.compagnie ?? "—"],
                  ["Date de début", fmtDate(c.dateDebut)],
                  ["Échéance", fmtDate(c.dateFin)],
                  ["Durée", c.dureeMois ? `${c.dureeMois} mois` : "—"],
                  ["Prime", typeof c.primeAnnuelle === "number" ? `${c.primeAnnuelle.toLocaleString("fr-FR")} FCFA` : "—"],
                  ["Statut", (c.statut ?? "actif").replace(/_/g, " ")],
                ];
                return (
                  <li key={c.id} id={`dossier-${c.id}`} className="scroll-mt-24 transition-colors" style={{ background: cibleDossier === c.id ? "rgba(42,138,138,0.06)" : undefined }}>
                    <div className="flex flex-wrap items-center justify-between gap-3 px-6 sm:px-8 py-4">
                      <button onClick={() => setContratOuvert(ouvert ? null : c.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                          <FileText size={18} style={{ color: TEAL }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm" style={{ color: MARINE }}>{c.produit?.nom ?? "Contrat"}</p>
                          <p className="text-xs text-gray-400">N° {c.numeroContrat} · échéance {fmtDate(c.dateFin)}</p>
                        </div>
                        <ChevronDown size={16} className={`ml-1 flex-shrink-0 transition-transform duration-200 ${ouvert ? "rotate-180" : ""}`} style={{ color: TEAL }} />
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize" style={{ background: c.statut === "actif" ? "#dcfce7" : "#eaf4f4", color: c.statut === "actif" ? "#166534" : TEAL }}>
                          {(c.statut ?? "actif").replace(/_/g, " ")}
                        </span>
                        <Link href={`/client/recu/${c.id}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                          <Printer size={14} /> Voir le reçu
                        </Link>
                        {c.attestation && (
                          <a
                            href={c.attestation.split("|")[1] ?? c.attestation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                            style={{ background: "#dcfce7", color: "#166534" }}
                          >
                            <FileText size={14} /> Mon attestation
                          </a>
                        )}
                      </div>
                    </div>
                    <AnimatePresence initial={false}>
                      {ouvert && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <div className="px-6 sm:px-8 pb-5 pt-1">
                            <div className="rounded-2xl p-4 sm:p-5 grid sm:grid-cols-2 gap-x-8 gap-y-2.5" style={{ background: "#f8fbfb", border: "1px solid #eef4f4" }}>
                              {lignes.map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between gap-3 text-sm">
                                  <span className="text-gray-400">{k}</span>
                                  <span className="font-semibold text-right" style={{ color: MARINE }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      )}

      {/* ───────────── DEVIS ───────────── */}
      {vue === "devis" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e6f0f0" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: "#eef4f4" }}>
            <h2 className="text-lg font-bold" style={{ color: MARINE }}>Mes cotations</h2>
            <Link href="/devis" className="text-sm font-semibold" style={{ color: TEAL }}>+ Nouveau</Link>
          </div>
          {devis.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <ClipboardList size={24} style={{ color: TEAL }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: MARINE }}>Aucune demande de cotation</p>
              <p className="text-gray-400 text-sm max-w-sm">Vos demandes de cotation apparaîtront ici.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#eef4f4]">
              {devis.map((d) => {
                // Propositions triées de la plus récente à la plus ancienne.
                const props = [...(d.propositions ?? [])].sort(
                  (a, b) => new Date(b.dateEnvoi ?? 0).getTime() - new Date(a.dateEnvoi ?? 0).getTime()
                );
                const choisie = props.find((p) => p.choisie);
                // Offres reçues mais pas encore consultées par le client (indicateur serveur).
                const nouvelles = choisie ? 0 : props.filter((p) => !p.vueClient).length;
                return (
                  <li key={d.id} id={`dossier-${d.id}`} className="px-6 sm:px-8 py-4 scroll-mt-24 transition-colors" style={{ background: cibleDossier === d.id ? "rgba(42,138,138,0.06)" : undefined }}>
                    <div className="flex items-center justify-between gap-3">
                      <button onClick={() => setDetailOuvert(detailOuvert === d.id ? null : d.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                          <ClipboardList size={18} style={{ color: TEAL }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm" style={{ color: MARINE }}>{d.produit?.nom ?? "Produit"}</p>
                          {d.dateCreation && <p className="text-xs text-gray-400">Demande envoyée le {fmtDateHeure(d.dateCreation)}</p>}
                        </div>
                        <ChevronDown size={16} className={`ml-1 flex-shrink-0 transition-transform duration-200 ${detailOuvert === d.id ? "rotate-180" : ""}`} style={{ color: TEAL }} />
                      </button>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {nouvelles > 0 && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full text-white animate-pulse" style={{ background: "#e11d48" }}>
                            <Sparkles size={11} /> {nouvelles} nouvelle{nouvelles > 1 ? "s" : ""} offre{nouvelles > 1 ? "s" : ""}
                          </span>
                        )}
                        <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#eaf4f4", color: TEAL }}>
                          {libStatut(d.statut)}
                        </span>
                      </div>
                    </div>
                    <AnimatePresence initial={false}>
                      {detailOuvert === d.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <div className="pt-3">
                            <div className="rounded-2xl p-4 grid sm:grid-cols-2 gap-x-8 gap-y-2.5" style={{ background: "#f8fbfb", border: "1px solid #eef4f4" }}>
                              {([
                                ["Produit", d.produit?.nom ?? "—"],
                                ["Demande du", d.dateCreation ? fmtDateHeure(d.dateCreation) : "—"],
                                ["Catégorie", d.segment === "professionnel" ? "Professionnel — flotte" : d.segment === "transport" ? "Transport professionnel" : "Particulier"],
                                ["Statut", libStatut(d.statut)],
                                ...(typeof d.montantEstime === "number" ? [["Montant estimé", `${d.montantEstime.toLocaleString("fr-FR")} FCFA`]] : []),
                                ["Offres reçues", String(props.length)],
                                ...(choisie ? [["Offre choisie", choisie.compagnie || `Offre ${props.findIndex((p) => p.choisie) + 1}`]] : []),
                              ] as [string, string][]).map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between gap-3 text-sm">
                                  <span className="text-gray-400">{k}</span>
                                  <span className="font-semibold text-right" style={{ color: MARINE }}>{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    {props.length > 0 && (
                      <div className="mt-3 rounded-2xl overflow-hidden border" style={{ borderColor: "#cfe7e7", background: "#f4fbfb" }}>
                        {/* En-tête groupé : toutes les propositions réunies */}
                        <button
                          type="button"
                          onClick={() => {
                            const ouvre = groupeOuvert !== d.id;
                            setGroupeOuvert(ouvre ? d.id : null);
                            if (ouvre && nouvelles > 0) marquerVues(d.id);
                          }}
                          className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[#eef9f9]"
                        >
                          <span className="flex items-center gap-2 font-semibold text-sm" style={{ color: "#0f766e" }}>
                            <FolderOpen size={18} style={{ color: TEAL }} />
                            {choisie ? "Votre choix de cotation" : `Propositions de cotation (${props.length})`}
                            {nouvelles > 0 && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white animate-pulse" style={{ background: "#e11d48" }}>
                                {nouvelles} nouveau{nouvelles > 1 ? "x" : ""}
                              </span>
                            )}
                          </span>
                          <span className="flex items-center gap-2">
                            {!choisie && <span className="hidden sm:inline text-xs font-medium" style={{ color: TEAL }}>Ouvrir pour comparer</span>}
                            <ChevronDown size={16} className={`transition-transform duration-200 ${groupeOuvert === d.id ? "rotate-180" : ""}`} style={{ color: TEAL }} />
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {groupeOuvert === d.id && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                              <ul className="px-3 pb-3 space-y-2">
                                {props.map((p, pi) => {
                                  const estNouvelle = !p.choisie && !p.vueClient;
                                  const estEcartee = !p.choisie && ecartees.has(p.id);
                                  return (
                                  <li key={p.id} className="bg-white rounded-xl px-3 py-2.5 border transition-all" style={{ borderColor: p.choisie ? "#16a34a" : estNouvelle ? "#fecdd3" : "#e0ecec", opacity: estEcartee ? 0.6 : 1 }}>
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <p className="font-semibold text-sm" style={{ color: MARINE }}>Cotation {props.length - pi}</p>
                                          {p.compagnie && (
                                            <span className="inline-flex items-center text-xs font-bold px-2.5 py-0.5 rounded-lg" style={{ background: "#eef2ff", color: "#4f46e5" }}>
                                              {p.compagnie}
                                            </span>
                                          )}
                                          {estNouvelle && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "#e11d48" }}>Nouveau</span>
                                          )}
                                          {estEcartee && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "#f1f5f9", color: "#64748b" }}>Écartée</span>
                                          )}
                                          {p.choisie && (
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "#dcfce7", color: "#166534" }}>✓ Choisie</span>
                                          )}
                                        </div>
                                        {p.dateEnvoi && (
                                          <p className="text-[11px] text-gray-400 mt-0.5">Reçue le {fmtDateHeure(p.dateEnvoi)}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                          {p.documents.map((doc) => {
                                            const [lbl, url] = doc.split("|");
                                            return (
                                              <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg" style={{ color: TEAL, background: "#eaf4f4" }}>
                                                <FileText size={12} /> Lire {lbl || "la cotation"}
                                              </a>
                                            );
                                          })}
                                          {typeof p.prime === "number" && (
                                            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ background: "#fff7ed", color: "#9a3412" }}>
                                              Prime : {p.prime.toLocaleString("fr-FR")} FCFA
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Actions à droite : valider (✓) ou écarter (✗). Masquées si une offre est déjà choisie. */}
                                      {!choisie && (
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                          <button
                                            type="button"
                                            onClick={() => { setChoixModal({ devisId: d.id, propId: p.id }); setModePaiement(""); setErreurChoix(""); }}
                                            aria-label="Choisir cette offre"
                                            title="Choisir cette offre"
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                                            style={{ background: "#16a34a" }}
                                          >
                                            <Check size={18} strokeWidth={3} />
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => toggleEcartee(p.id)}
                                            aria-label={estEcartee ? "Remettre cette offre" : "Écarter cette offre"}
                                            title={estEcartee ? "Remettre cette offre" : "Écarter cette offre"}
                                            className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                                            style={estEcartee ? { background: "#eef2ff", color: "#4f46e5" } : { background: "#fee2e2", color: "#dc2626" }}
                                          >
                                            <X size={18} strokeWidth={3} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </li>
                                  );
                                })}
                              </ul>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Paiement : une fois l'offre choisie (statut « En cours ») */}
                    {d.statut === "en_cours" && (
                      <div className="mt-3 rounded-2xl p-3 sm:p-4" style={{ background: "#fffaf0", border: "1px solid #fed7aa" }}>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: "#9a3412" }}>
                          Paiement{d.modePaiement ? ` · ${MODE_LABEL[d.modePaiement] ?? d.modePaiement}` : ""}
                        </p>
                        {d.montantAPayer == null ? (
                          <p className="text-sm text-gray-600">Votre choix a bien été transmis. Votre rédacteur va vous communiquer le montant à régler.</p>
                        ) : (
                          <>
                            <p className="text-sm mb-2" style={{ color: MARINE }}>Montant à régler : <strong>{d.montantAPayer.toLocaleString("fr-FR")} FCFA</strong></p>
                            {d.lienPaiement ? (
                              <div className="flex flex-wrap items-center gap-3">
                                <p className="text-sm text-gray-600">Votre lien de paiement {d.modePaiement ? MODE_LABEL[d.modePaiement] : ""} est prêt.</p>
                                <a href={d.lienPaiement} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
                                  <CreditCard size={14} /> Payer maintenant
                                </a>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">Votre rédacteur va vous transmettre le lien de paiement {d.modePaiement ? MODE_LABEL[d.modePaiement] : ""} sous peu.</p>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      )}

      {/* ───────────── SINISTRES ───────────── */}
      {vue === "sinistres" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e6f0f0" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: "#eef4f4" }}>
            <h2 className="text-lg font-bold" style={{ color: MARINE }}>Mes sinistres</h2>
            <Link href="/client/sinistres/nouveau" className="text-sm font-semibold" style={{ color: TEAL }}>+ Déclarer</Link>
          </div>
          {sinistres.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <AlertTriangle size={24} style={{ color: TEAL }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: MARINE }}>Aucun sinistre déclaré</p>
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
                  : { bg: "#eaf4f4", fg: TEAL };
                const lignesSin: [string, string][] = [
                  ["Type d'assurance", s.typeAssurance ?? "—"],
                  ["Déclaré le", s.dateDeclaration ? fmtDateHeure(s.dateDeclaration) : "—"],
                  ["Survenu le", s.dateSurvenance ? `${fmtDate(s.dateSurvenance)}${s.heureSurvenance ? ` à ${s.heureSurvenance}` : ""}` : "—"],
                  ["Lieu", s.lieu || "—"],
                  ...(typeof s.montantEstime === "number" ? [["Montant estimé", `${s.montantEstime.toLocaleString("fr-FR")} FCFA`]] as [string, string][] : []),
                  ["Statut", statut.replace(/_/g, " ")],
                ];
                return (
                  <li key={s.id} id={`dossier-${s.id}`} className="scroll-mt-24 transition-colors" style={{ background: cibleDossier === s.id ? "rgba(42,138,138,0.06)" : undefined }}>
                    <div className="flex items-center justify-between gap-3 px-6 sm:px-8 py-4">
                      <button onClick={() => setDetailOuvert(detailOuvert === s.id ? null : s.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                          <AlertTriangle size={18} style={{ color: TEAL }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm capitalize" style={{ color: MARINE }}>{s.typeAssurance ?? "Sinistre"}</p>
                          {s.dateDeclaration && <p className="text-xs text-gray-400">Déclaré le {fmtDateHeure(s.dateDeclaration)}</p>}
                        </div>
                        <ChevronDown size={16} className={`ml-1 flex-shrink-0 transition-transform duration-200 ${detailOuvert === s.id ? "rotate-180" : ""}`} style={{ color: TEAL }} />
                      </button>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize" style={{ background: couleur.bg, color: couleur.fg }}>{statut.replace(/_/g, " ")}</span>
                    </div>
                    <AnimatePresence initial={false}>
                      {detailOuvert === s.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <div className="px-6 sm:px-8 pb-5 pt-1">
                            <div className="rounded-2xl p-4 sm:p-5" style={{ background: "#f8fbfb", border: "1px solid #eef4f4" }}>
                              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
                                {lignesSin.map(([k, v]) => (
                                  <div key={k} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-gray-400">{k}</span>
                                    <span className="font-semibold text-right" style={{ color: MARINE }}>{v}</span>
                                  </div>
                                ))}
                              </div>
                              {s.description && (
                                <div className="mt-3 pt-3 border-t" style={{ borderColor: "#eef4f4" }}>
                                  <p className="text-xs text-gray-400 mb-1">Circonstances</p>
                                  <p className="text-sm whitespace-pre-line" style={{ color: MARINE }}>{s.description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      )}

      {/* ───────────── RENDEZ-VOUS ───────────── */}
      {vue === "rdv" && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e6f0f0" }}>
          <div className="px-6 sm:px-8 py-5 border-b flex items-center justify-between" style={{ borderColor: "#eef4f4" }}>
            <h2 className="text-lg font-bold" style={{ color: MARINE }}>Mes rendez-vous</h2>
            <Link href="/client/rendez-vous/nouveau" className="text-sm font-semibold" style={{ color: TEAL }}>+ Prendre rendez-vous</Link>
          </div>
          {rdv.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <CalendarClock size={24} style={{ color: TEAL }} />
              </div>
              <p className="font-semibold mb-1" style={{ color: MARINE }}>Aucun rendez-vous</p>
              <p className="text-gray-400 text-sm max-w-sm">Prenez rendez-vous avec un conseiller, vos créneaux apparaîtront ici.</p>
            </div>
          ) : (
            <ul className="divide-y divide-[#eef4f4]">
              {rdv.map((r) => {
                const statut = r.statut ?? "en_attente";
                const couleur =
                  statut === "confirme" ? { bg: "#dcfce7", fg: "#166534" }
                  : statut === "annule" ? { bg: "#fee2e2", fg: "#991b1b" }
                  : statut === "termine" ? { bg: "#eaf4f4", fg: TEAL }
                  : { bg: "#fef9c3", fg: "#854d0e" };
                const lignesRdv: [string, string][] = [
                  ["Motif", r.motif ?? "—"],
                  ["Date et heure", r.dateHeure ? fmtDateHeure(r.dateHeure) : "—"],
                  ["Statut", statut.replace(/_/g, " ")],
                ];
                return (
                  <li key={r.id} id={`dossier-${r.id}`} className="scroll-mt-24 transition-colors" style={{ background: cibleDossier === r.id ? "rgba(42,138,138,0.06)" : undefined }}>
                    <div className="flex items-center justify-between gap-3 px-6 sm:px-8 py-4">
                      <button onClick={() => setDetailOuvert(detailOuvert === r.id ? null : r.id)} className="flex items-center gap-3 min-w-0 flex-1 text-left">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                          <CalendarClock size={18} style={{ color: TEAL }} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm" style={{ color: MARINE }}>{r.motif ?? "Rendez-vous"}</p>
                          {r.dateHeure && <p className="text-xs text-gray-400">{fmtDateHeure(r.dateHeure)}</p>}
                        </div>
                        <ChevronDown size={16} className={`ml-1 flex-shrink-0 transition-transform duration-200 ${detailOuvert === r.id ? "rotate-180" : ""}`} style={{ color: TEAL }} />
                      </button>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full capitalize" style={{ background: couleur.bg, color: couleur.fg }}>{statut.replace(/_/g, " ")}</span>
                    </div>
                    <AnimatePresence initial={false}>
                      {detailOuvert === r.id && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                          <div className="px-6 sm:px-8 pb-5 pt-1">
                            <div className="rounded-2xl p-4 sm:p-5" style={{ background: "#f8fbfb", border: "1px solid #eef4f4" }}>
                              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2.5">
                                {lignesRdv.map(([k, v]) => (
                                  <div key={k} className="flex items-center justify-between gap-3 text-sm">
                                    <span className="text-gray-400">{k}</span>
                                    <span className="font-semibold text-right" style={{ color: MARINE }}>{v}</span>
                                  </div>
                                ))}
                              </div>
                              {r.notes && (
                                <div className="mt-3 pt-3 border-t" style={{ borderColor: "#eef4f4" }}>
                                  <p className="text-xs text-gray-400 mb-1">Notes</p>
                                  <p className="text-sm whitespace-pre-line" style={{ color: MARINE }}>{r.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          )}
        </motion.div>
      )}

      {/* ───────────── MESSAGERIE ───────────── */}
      {vue === "messages" && <MessagesClient ouvrirDirect={ouvrirConvDirect} />}

      {/* Modale : choix du mode de paiement après sélection d'une offre */}
      <AnimatePresence>
        {choixModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            style={{ background: "rgba(15,23,42,0.5)" }}
            onClick={() => { if (!choixEnvoi) { setChoixModal(null); setModePaiement(""); } }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              <div className="px-6 py-5 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}>
                <h3 className="font-bold text-white">Valider votre choix</h3>
                <button onClick={() => { if (!choixEnvoi) { setChoixModal(null); setModePaiement(""); } }} className="text-white/80 hover:text-white"><X size={20} /></button>
              </div>
              <div className="p-6 space-y-4">
                {/* Avertissement : le choix est définitif. */}
                <div className="flex items-start gap-2.5 rounded-2xl px-4 py-3" style={{ background: "#fff7ed", border: "1px solid #fed7aa" }}>
                  <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#c2410c" }} />
                  <p className="text-sm" style={{ color: "#9a3412" }}>
                    <strong>Choix définitif.</strong> Une fois votre choix confirmé, vous ne pourrez plus revenir en arrière ni changer d&apos;offre. Vérifiez bien votre sélection avant de continuer.
                  </p>
                </div>
                <p className="text-sm text-gray-600">Comment souhaitez-vous régler votre prime ? Votre rédacteur vous transmettra un lien de paiement sécurisé selon le mode choisi.</p>
                <div className="space-y-2">
                  {MODES_PAIEMENT.map((m) => (
                    <button
                      key={m.v}
                      type="button"
                      onClick={() => setModePaiement(m.v)}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                      style={modePaiement === m.v
                        ? { borderColor: TEAL, background: "#eaf4f4", color: MARINE }
                        : { borderColor: "#e0ecec", color: MARINE, background: "#fff" }}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <span className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#eaf4f4" }}>
                          <CreditCard size={16} style={{ color: TEAL }} />
                        </span>
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold">{m.label}</span>
                          <span className="block text-[11px] text-gray-400">{m.desc}</span>
                        </span>
                      </span>
                      {modePaiement === m.v && <CheckCircle2 size={18} style={{ color: TEAL }} className="flex-shrink-0" />}
                    </button>
                  ))}
                </div>
                {erreurChoix && (
                  <div className="flex items-start gap-2 rounded-xl px-4 py-3 text-sm" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.25)", color: "#b91c1c" }}>
                    <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                    <span>{erreurChoix}</span>
                  </div>
                )}
                <div className="flex gap-3 pt-1">
                  <button onClick={() => { setChoixModal(null); setModePaiement(""); setErreurChoix(""); }} className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-gray-50" style={{ color: MARINE, borderColor: "#e0ecec" }}>
                    Annuler
                  </button>
                  <button onClick={confirmerChoix} disabled={!modePaiement || choixEnvoi} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg disabled:opacity-60" style={{ background: `linear-gradient(135deg, ${TEAL}, ${MARINE})` }}>
                    {choixEnvoi ? "Validation…" : "Confirmer mon choix"}
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
