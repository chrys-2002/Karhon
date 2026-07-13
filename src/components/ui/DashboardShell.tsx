"use client";
import { useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Menu, X, Bell, LogOut, Search, ShieldCheck, ChevronRight, ChevronDown, CheckCheck, Inbox, ClipboardList, AlertTriangle, CalendarClock, Sparkles, RefreshCw, MessagesSquare, Mail, Phone, Volume2, VolumeX } from "lucide-react";

// Type d'une notification reçue de /api/notifications.
type Notif = { id: string; type: string; titre: string; message: string; lien?: string | null; lu: boolean; createdAt: string };

// Icône associée au type de notification.
const ICONE_NOTIF: Record<string, LucideIcon> = {
  devis: ClipboardList,
  sinistre: AlertTriangle,
  rendezvous: CalendarClock,
  proposition: Sparkles,
  choix: CheckCheck,
  statut: RefreshCw,
  message: MessagesSquare,
};

// Temps relatif court (ex. "il y a 5 min", "il y a 2 h", "hier").
function tempsRelatif(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j === 1) return "hier";
  if (j < 7) return `il y a ${j} j`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

// ─────────────────────────────────────────────────────────────
// DashboardShell — coquille premium réutilisable (KARHON).
//
//  • Sidebar latérale fixe (desktop) / drawer animé (mobile) :
//    logo, navigation à icônes + libellés + badges, indicateur
//    d'onglet actif animé (layoutId).
//  • Top bar collante : titre + sous-titre, recherche, cloche de
//    notifications, profil (avatar initiales) et déconnexion.
//  • Le contenu de chaque page passe en children.
//
// Pensé pour l'espace admin ET l'espace client : on lui passe la
// liste d'onglets, l'onglet actif, et les callbacks.
// ─────────────────────────────────────────────────────────────

export type NavItem = {
  cle: string;
  label: string;
  Icon: LucideIcon;
  badge?: number;
};

// Onglet ciblé selon le type de notification (secours si le lien ne le précise pas).
// Les clés (devis, sinistres, rdv, messages) existent côté admin ET client.
const ONGLET_PAR_TYPE: Record<string, string> = {
  devis: "devis",
  choix: "devis",
  proposition: "devis",
  sinistre: "sinistres",
  rendezvous: "rdv",
  message: "messages",
};

type Props = {
  marque?: string;                 // libellé sous le logo (ex. "Espace administrateur")
  items: NavItem[];
  actif: string;
  onNaviger: (cle: string, ref?: string) => void;
  titre: string;
  sousTitre?: string;
  user?: { nom?: string; prenom?: string; email?: string; role?: string; telephone?: string | null; adresse?: string | null; dateInscription?: string; dateCreation?: string };
  onLogout: () => void;
  recherche?: { value: string; onChange: (v: string) => void; placeholder?: string };
  children: ReactNode;
};

const MARINE = "#1a2e5a";
const TEAL = "#2a8a8a";

function initiales(user?: Props["user"]) {
  // Rédacteur (agent) → R1, R2, R3… selon son numéro (déduit du nom ou de l'email).
  if (user?.role === "agent") {
    const num = `${user?.prenom ?? ""} ${user?.nom ?? ""} ${user?.email ?? ""}`.match(/\d+/);
    return num ? `R${num[0]}` : "R";
  }
  const p = (user?.prenom ?? "").trim();
  const n = (user?.nom ?? "").trim();
  if (p || n) return `${p[0] ?? ""}${n[0] ?? ""}`.toUpperCase();
  return (user?.email ?? "?")[0]?.toUpperCase() ?? "?";
}

export default function DashboardShell({
  marque = "Espace",
  items,
  actif,
  onNaviger,
  titre,
  sousTitre,
  user,
  onLogout,
  recherche,
  children,
}: Props) {
  const router = useRouter();
  const [menuMobile, setMenuMobile] = useState(false);
  const [confirmDeco, setConfirmDeco] = useState(false);

  // ── Centre de notifications (in-app) ──
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [sonActif, setSonActif] = useState(true); // alerte sonore des nouvelles notifications
  const [clocheOuverte, setClocheOuverte] = useState(false);
  const refCloche = useRef<HTMLDivElement>(null);
  const [profilOuvert, setProfilOuvert] = useState(false);
  const refProfil = useRef<HTMLDivElement>(null);

  // Préférence son (activé/coupé), mémorisée sur l'appareil.
  const sonActifRef = useRef(true);
  useEffect(() => {
    try { const v = localStorage.getItem("karhon_notif_son"); if (v !== null) setSonActif(v === "1"); } catch {}
  }, []);
  useEffect(() => { sonActifRef.current = sonActif; }, [sonActif]);

  // Contexte audio persistant : sur mobile, l'audio doit être « débloqué » par
  // une interaction utilisateur. On crée le contexte une fois et on le réactive
  // à chaque interaction (idempotent), pour que le son marche ensuite tout seul.
  const audioCtxRef = useRef<AudioContext | null>(null);
  useEffect(() => {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const debloquer = () => {
      try {
        if (!audioCtxRef.current) audioCtxRef.current = new AC();
        if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume().catch(() => {});
      } catch {}
    };
    window.addEventListener("pointerdown", debloquer);
    window.addEventListener("keydown", debloquer);
    window.addEventListener("touchstart", debloquer, { passive: true });
    return () => {
      window.removeEventListener("pointerdown", debloquer);
      window.removeEventListener("keydown", debloquer);
      window.removeEventListener("touchstart", debloquer);
    };
  }, []);

  // ── Déconnexion automatique après inactivité ──
  // Sécurité : si l'utilisateur laisse sa session ouverte sans rien faire
  // pendant 1 minute, on ferme la session et on renvoie vers la connexion.
  // Toute activité (souris, clavier, tactile, défilement) remet le compteur à zéro.
  useEffect(() => {
    const DELAI_MS = 900_000; // 15 minutes (mettre 60_000 = 1 min pour la démo)
    const estStaff = ["agent", "gerant", "admin"].includes(user?.role ?? "");
    let timer: ReturnType<typeof setTimeout>;

    const deconnecter = async () => {
      try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
      // Renvoi vers la page de connexion correspondant au rôle.
      router.replace(`${estStaff ? "/acces-equipe" : "/client"}?expire=1`);
    };
    const relancer = () => {
      clearTimeout(timer);
      timer = setTimeout(deconnecter, DELAI_MS);
    };

    const evenements = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"];
    evenements.forEach((e) => window.addEventListener(e, relancer, { passive: true }));
    relancer(); // démarre le compteur

    return () => {
      clearTimeout(timer);
      evenements.forEach((e) => window.removeEventListener(e, relancer));
    };
  }, [user, router]);

  // Alerte à l'arrivée d'une nouvelle notification : son (3 notes montantes) +
  // vibration sur les mobiles compatibles. Réutilise le contexte audio débloqué.
  const jouerSon = () => {
    // Vibration mobile (Android/Chrome) — alerte tactile même si le son est coupé.
    try { navigator.vibrate?.([180, 90, 180, 90, 260]); } catch {}
    try {
      const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AC) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AC();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});
      const bip = (freq: number, debut: number) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, ctx.currentTime + debut);
        g.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + debut + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + debut + 0.24);
        o.start(ctx.currentTime + debut);
        o.stop(ctx.currentTime + debut + 0.26);
      };
      bip(784, 0); bip(1047, 0.16); bip(1319, 0.32);
    } catch {}
  };

  // Active/coupe le son (mémorisé) ; un petit aperçu sonore quand on l'active.
  const basculerSon = () => {
    setSonActif((s) => {
      const n = !s;
      try { localStorage.setItem("karhon_notif_son", n ? "1" : "0"); } catch {}
      if (n) jouerSon();
      return n;
    });
  };

  // Charge les notifications au montage, puis rafraîchit régulièrement.
  // Dès qu'une NOUVELLE notification apparaît (id en tête différent), on émet un son.
  const dernierIdRef = useRef<string | null>(null);
  useEffect(() => {
    let stop = false;
    const charger = async () => {
      try {
        const r = await fetch("/api/notifications");
        if (!r.ok) return;
        const d = await r.json();
        if (stop) return;
        const liste: Notif[] = d.notifications ?? [];
        setNotifs(liste);
        setNonLues(d.nonLues ?? 0);
        const nouveauId = liste[0]?.id ?? null;
        // On ne sonne pas au tout premier chargement (référence non initialisée).
        if (dernierIdRef.current !== null && nouveauId && nouveauId !== dernierIdRef.current) {
          if (sonActifRef.current) jouerSon();
        }
        dernierIdRef.current = nouveauId;
      } catch {}
    };
    charger();
    const t = setInterval(charger, 15000);
    // Rafraîchit aussi quand l'onglet reprend le focus (retour sur la page).
    const onFocus = () => charger();
    window.addEventListener("focus", onFocus);
    return () => { stop = true; clearInterval(t); window.removeEventListener("focus", onFocus); };
  }, []);

  // Ferme le menu profil au clic extérieur.
  useEffect(() => {
    const fermer = (e: MouseEvent) => {
      if (refProfil.current && !refProfil.current.contains(e.target as Node)) setProfilOuvert(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, []);

  // Ferme le panneau au clic extérieur.
  useEffect(() => {
    const fermer = (e: MouseEvent) => {
      if (refCloche.current && !refCloche.current.contains(e.target as Node)) setClocheOuverte(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, []);

  // À l'OUVERTURE de la cloche, les notifications sont considérées comme lues :
  // la pastille disparaît et ne réapparaît qu'à la prochaine nouvelle action.
  // (Les puces "non lu" restent visibles tant que le panneau est ouvert.)
  useEffect(() => {
    if (clocheOuverte && nonLues > 0) {
      setNonLues(0);
      fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
    }
  }, [clocheOuverte, nonLues]);

  const marquerTout = async () => {
    setNotifs((ns) => ns.map((n) => ({ ...n, lu: true })));
    setNonLues(0);
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
  };

  const ouvrirNotif = (n: Notif) => {
    setClocheOuverte(false);
    if (!n.lu) {
      setNotifs((ns) => ns.map((x) => (x.id === n.id ? { ...x, lu: true } : x)));
      setNonLues((c) => Math.max(0, c - 1));
      fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) }).catch(() => {});
    }
    // Détermine la page, l'onglet et la référence (depuis le lien, sinon depuis le type).
    let pathname = "/admin";
    let onglet: string | null = null;
    let ref: string | null = null;
    try {
      const u = new URL(n.lien || "/admin", "http://x");
      if (u.pathname) pathname = u.pathname;
      onglet = u.searchParams.get("onglet");
      ref = u.searchParams.get("ref");
    } catch {}
    if (!onglet) onglet = ONGLET_PAR_TYPE[n.type] ?? null;

    // Bascule immédiatement sur le bon onglet (même page) + ouvre l'élément ciblé.
    if (onglet) onNaviger(onglet, ref ?? undefined);

    // Met l'URL à jour (utile au rechargement / lien e-mail), onglet inclus même
    // pour les anciennes notifications dont le lien ne le contenait pas.
    const params = new URLSearchParams();
    if (onglet) params.set("onglet", onglet);
    if (ref) params.set("ref", ref);
    const q = params.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  };

  const nomAffiche = user?.prenom || user?.nom || user?.email?.split("@")[0] || "Utilisateur";
  const nomComplet = `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() || nomAffiche;
  const roleAffiche =
    user?.role === "gerant" ? "Gérant" : user?.role === "agent" ? "Rédacteur" : user?.role === "client" || !user?.role ? "Client" : user.role;
  // Date de création du compte (client = dateInscription ; personnel = dateCreation).
  const dateCompteIso = user?.dateInscription ?? user?.dateCreation;
  const dateCompte = dateCompteIso
    ? new Date(dateCompteIso).toLocaleDateString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "long", year: "numeric" })
    : null;

  // ── Contenu de la sidebar (réutilisé desktop + drawer mobile) ──
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full" style={{ background: "linear-gradient(180deg, #ffffff, #f6fbfb)" }}>
      {/* Logo + marque (clic → page d'accueil principale) */}
      <div className="px-5 py-6 flex items-center gap-3 border-b" style={{ borderColor: "#eef4f4" }}>
        <Link href="/" onClick={() => mobile && setMenuMobile(false)} title="Aller à l'accueil" className="flex items-center gap-3 min-w-0 group">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0 transition-transform group-hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}
          >
            <ShieldCheck size={22} />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-[15px] leading-tight tracking-tight" style={{ color: MARINE }}>
              KARHON
            </p>
            <p className="text-[11px] text-gray-400 truncate">{marque}</p>
          </div>
        </Link>
        {mobile && (
          <button onClick={() => setMenuMobile(false)} className="ml-auto p-2 -mr-2 text-gray-400 hover:text-gray-600" aria-label="Fermer">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {items.map((it) => {
          const estActif = it.cle === actif;
          return (
            <button
              key={it.cle}
              onClick={() => { onNaviger(it.cle); if (mobile) setMenuMobile(false); }}
              className="relative w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-colors group"
              style={{ color: estActif ? "#ffffff" : MARINE }}
            >
              {estActif && (
                <motion.span
                  layoutId={mobile ? "navActifMobile" : "navActif"}
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})`, boxShadow: "0 8px 20px rgba(42,138,138,0.28)" }}
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center w-5">
                <it.Icon size={18} style={{ color: estActif ? "#ffffff" : TEAL }} />
              </span>
              <span className="relative z-10 flex-1 text-left">{it.label}</span>
              {typeof it.badge === "number" && it.badge > 0 && (
                <span
                  className="relative z-10 min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full text-[11px] font-bold"
                  style={estActif ? { background: "rgba(255,255,255,0.25)", color: "#fff" } : { background: "#fee2e2", color: "#dc2626" }}
                >
                  {it.badge}
                </span>
              )}
              {estActif && <ChevronRight size={15} className="relative z-10 opacity-80" />}
            </button>
          );
        })}
      </nav>

      {/* Carte profil en bas */}
      <div className="px-3 pb-4">
        <div className="rounded-2xl p-3 flex items-center gap-3 border" style={{ background: "#f8fbfb", borderColor: "#eef4f4" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}
          >
            {initiales(user)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate" style={{ color: MARINE }}>{nomAffiche}</p>
            <p className="text-[11px] text-gray-400 truncate">{roleAffiche}</p>
          </div>
          <button
            onClick={() => setConfirmDeco(true)}
            className="p-2 rounded-xl text-red-500 transition-colors hover:bg-red-50"
            aria-label="Se déconnecter"
            title="Se déconnecter"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f4f9f9" }}>
      {/* Sidebar desktop */}
      <aside
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-[256px] border-r z-40"
        style={{ borderColor: "#e6f0f0" }}
      >
        <Sidebar />
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {menuMobile && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMenuMobile(false)}
              className="fixed inset-0 z-50 lg:hidden" style={{ background: "rgba(15,23,42,0.45)" }}
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
              className="fixed inset-y-0 left-0 w-[270px] z-50 lg:hidden shadow-2xl"
            >
              <Sidebar mobile />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Colonne principale */}
      <div className="lg:pl-[256px]">
        {/* Top bar collante */}
        <header
          className="sticky top-0 z-30 border-b backdrop-blur-xl"
          style={{ borderColor: "#e6f0f0", background: "rgba(255,255,255,0.82)" }}
        >
          <div className="flex items-center gap-3 px-4 sm:px-6 lg:px-8 h-16">
            <button
              onClick={() => setMenuMobile(true)}
              className="lg:hidden p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100"
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold leading-tight truncate" style={{ color: MARINE }}>{titre}</h1>
              {sousTitre && <p className="text-[11px] sm:text-xs text-gray-400 truncate">{sousTitre}</p>}
            </div>

            {/* Recherche (centrée, masquée si non fournie) */}
            {recherche && (
              <div className="hidden md:block flex-1 max-w-md mx-auto">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                  <input
                    type="text"
                    value={recherche.value}
                    onChange={(e) => recherche.onChange(e.target.value)}
                    placeholder={recherche.placeholder ?? "Rechercher…"}
                    className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-sm bg-white border focus:outline-none focus:ring-2 transition-all"
                    style={{ borderColor: "#e6f0f0" }}
                  />
                  {recherche.value && (
                    <button
                      onClick={() => recherche.onChange("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      aria-label="Effacer"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 ml-auto">
              {/* Cloche de notifications + panneau */}
              <div ref={refCloche} className="relative">
                <button
                  onClick={() => setClocheOuverte((o) => !o)}
                  className="relative p-2.5 rounded-xl text-gray-500 transition-colors hover:bg-gray-100"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  {nonLues > 0 && (
                    <>
                      <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 inline-flex items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "#dc2626" }}>
                        {nonLues > 9 ? "9+" : nonLues}
                      </span>
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-ping" style={{ background: "#dc2626" }} />
                    </>
                  )}
                </button>

                <AnimatePresence>
                  {clocheOuverte && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-2 w-[340px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border overflow-hidden z-50"
                      style={{ borderColor: "#e6f0f0" }}
                    >
                      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "#eef4f4" }}>
                        <p className="font-bold text-sm" style={{ color: MARINE }}>Notifications</p>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={basculerSon}
                            title={sonActif ? "Couper le son des notifications" : "Activer le son des notifications"}
                            aria-label={sonActif ? "Couper le son" : "Activer le son"}
                            className="transition-colors"
                            style={{ color: sonActif ? TEAL : "#9ca3af" }}
                          >
                            {sonActif ? <Volume2 size={16} /> : <VolumeX size={16} />}
                          </button>
                          {nonLues > 0 && (
                            <button onClick={marquerTout} className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:opacity-80" style={{ color: TEAL }}>
                              <CheckCheck size={14} /> Tout marquer lu
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-[380px] overflow-y-auto">
                        {notifs.length === 0 ? (
                          <div className="flex flex-col items-center justify-center text-center py-10 px-6">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                              <Inbox size={22} style={{ color: TEAL }} />
                            </div>
                            <p className="text-sm text-gray-400">Aucune notification</p>
                          </div>
                        ) : (
                          <ul>
                            {notifs.map((n) => {
                              const IconeN = ICONE_NOTIF[n.type] ?? Bell;
                              return (
                                <li key={n.id}>
                                  <button
                                    onClick={() => ouvrirNotif(n)}
                                    className="w-full text-left flex gap-3 px-4 py-3 border-b transition-colors hover:bg-gray-50"
                                    style={{ borderColor: "#f3f8f8", background: n.lu ? "#fff" : "#f5fbfb" }}
                                  >
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                                      <IconeN size={16} style={{ color: TEAL }} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-semibold leading-snug" style={{ color: MARINE }}>{n.titre}</p>
                                      <p className="text-xs text-gray-500 leading-snug mt-0.5 line-clamp-2">{n.message}</p>
                                      <p className="text-[11px] text-gray-400 mt-1">{tempsRelatif(n.createdAt)}</p>
                                    </div>
                                    {!n.lu && <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: TEAL }} />}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profil (clic → informations du compte) */}
              <div ref={refProfil} className="relative">
                <button
                  onClick={() => setProfilOuvert((o) => !o)}
                  className="flex items-center gap-2.5 pl-2 pr-2 sm:pr-3 py-1.5 rounded-2xl border transition-colors hover:bg-gray-50"
                  style={{ borderColor: "#e6f0f0", background: "#fff" }}
                  aria-label="Mon compte"
                >
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold" style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}>
                    {initiales(user)}
                  </div>
                  <div className="hidden sm:block min-w-0 max-w-[140px] text-left">
                    <p className="text-xs font-semibold truncate leading-tight" style={{ color: MARINE }}>{nomAffiche}</p>
                    <p className="text-[10px] text-gray-400 truncate leading-tight">{roleAffiche}</p>
                  </div>
                  <ChevronDown size={14} className={`hidden sm:block text-gray-400 transition-transform duration-200 ${profilOuvert ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {profilOuvert && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.16 }}
                      className="absolute right-0 mt-2 w-[280px] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border overflow-hidden z-50"
                      style={{ borderColor: "#e6f0f0" }}
                    >
                      <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: "#eef4f4", background: "linear-gradient(135deg, #f8fbfb, #ffffff)" }}>
                        <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}>
                          {initiales(user)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: MARINE }}>{nomComplet}</p>
                          <p className="text-xs text-gray-400">{roleAffiche}</p>
                        </div>
                      </div>

                      <div className="p-3 space-y-2.5">
                        {user?.email && (
                          <div className="flex items-start gap-2.5 text-sm">
                            <Mail size={15} className="mt-0.5 flex-shrink-0" style={{ color: TEAL }} />
                            <span className="min-w-0 break-words" style={{ color: "#374151" }}>{user.email}</span>
                          </div>
                        )}
                        {user?.telephone && (
                          <div className="flex items-center gap-2.5 text-sm">
                            <Phone size={15} className="flex-shrink-0" style={{ color: TEAL }} />
                            <span style={{ color: "#374151" }}>{user.telephone}</span>
                          </div>
                        )}
                        {dateCompte && (
                          <div className="flex items-center gap-2.5 text-sm">
                            <CalendarClock size={15} className="flex-shrink-0" style={{ color: TEAL }} />
                            <span style={{ color: "#374151" }}>Compte créé le {dateCompte}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 border-t" style={{ borderColor: "#eef4f4" }}>
                        <button
                          onClick={() => { setProfilOuvert(false); setConfirmDeco(true); }}
                          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border transition-colors hover:bg-red-50"
                          style={{ color: "#dc2626", borderColor: "#fecaca" }}
                        >
                          <LogOut size={15} /> Se déconnecter
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Recherche mobile (ligne dédiée) */}
          {recherche && (
            <div className="md:hidden px-4 pb-3">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="text"
                  value={recherche.value}
                  onChange={(e) => recherche.onChange(e.target.value)}
                  placeholder={recherche.placeholder ?? "Rechercher…"}
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-sm bg-white border focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e6f0f0" }}
                />
                {recherche.value && (
                  <button onClick={() => recherche.onChange("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-label="Effacer">
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* Contenu */}
        <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>

      {/* Modale de déconnexion */}
      <AnimatePresence>
        {confirmDeco && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
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
              <h3 className="text-lg font-bold mb-1" style={{ color: MARINE }}>Se déconnecter ?</h3>
              <p className="text-sm text-gray-500 mb-6">Vous allez quitter votre espace et revenir à l&apos;accueil.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeco(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm border transition-all hover:bg-gray-50 active:scale-95"
                  style={{ color: MARINE, borderColor: "#e0ecec" }}
                >
                  Annuler
                </button>
                <button
                  onClick={onLogout}
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
