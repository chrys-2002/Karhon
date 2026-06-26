"use client";
// Page d'accès RÉSERVÉE au personnel KARHON (rédacteurs + gérant).
// Volontairement discrète : non liée depuis le site public.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, Lock, Mail, KeyRound, AlertCircle, Eye, EyeOff, LockKeyhole, ServerCog } from "lucide-react";

const MARINE = "#1a2e5a";
const TEAL = "#2a8a8a";

export default function AccesEquipe() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [code, setCode] = useState("");
  const [voirMdp, setVoirMdp] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoi, setEnvoi] = useState(false);

  // Si un membre du personnel est déjà connecté, on l'envoie au back-office.
  useEffect(() => {
    let annule = false;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (annule || !d?.utilisateur) return;
        if (["agent", "gerant", "admin"].includes(d.utilisateur.role)) router.push("/admin");
      })
      .catch(() => {});
    return () => { annule = true; };
  }, [router]);

  const seConnecter = async () => {
    if (envoi) return;
    setErreur("");
    if (!email.trim() || !motDePasse || !code.trim()) {
      setErreur("Renseignez l'e-mail, le mot de passe et le code d'accès.");
      return;
    }
    setEnvoi(true);
    try {
      const r = await fetch("/api/auth/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, motDePasse, code }),
      });
      const d = await r.json().catch(() => ({}));
      if (r.ok) router.push("/admin");
      else setErreur(d.erreur || "Accès refusé.");
    } catch {
      setErreur("Connexion impossible. Vérifiez votre réseau.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6" style={{ background: "radial-gradient(1200px 600px at 10% -10%, #16494a 0%, transparent 55%), linear-gradient(135deg, #0c1830, #14254a 55%, #0f3a3b)" }}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-4xl grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-white/10"
      >
        {/* Panneau de marque (gauche) */}
        <div className="relative hidden md:flex flex-col justify-between p-9 text-white overflow-hidden" style={{ background: `linear-gradient(150deg, ${MARINE}, ${TEAL})` }}>
          {/* texture discrète */}
          <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)", backgroundSize: "22px 22px" }} />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-6">
              <ShieldCheck size={24} />
            </div>
            <h1 className="text-2xl font-extrabold leading-tight">KARHON Assurances</h1>
            <p className="text-sm text-white/70 mt-1">Back-office</p>
            <p className="text-sm text-white/80 mt-6 max-w-xs leading-relaxed">
              Espace de gestion réservé aux rédacteurs et au gérant.
            </p>
          </div>
          <div className="relative space-y-3 text-sm text-white/80">
            <p className="flex items-center gap-2.5"><LockKeyhole size={16} /> Connexion chiffrée</p>
            <p className="flex items-center gap-2.5"><KeyRound size={16} /> Code d'accès requis</p>
            
          </div>
        </div>

        {/* Formulaire (droite) */}
        <div className="bg-white p-8 sm:p-10">
          {/* En-tête mobile */}
          <div className="md:hidden flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <p className="font-extrabold leading-tight" style={{ color: MARINE }}>KARHON Assurances</p>
              <p className="text-xs text-gray-400">Back-office sécurisé</p>
            </div>
          </div>

          <h2 className="text-xl font-bold" style={{ color: MARINE }}>Connexion personnel</h2>
          <p className="text-sm text-gray-400 mt-1 mb-6">Réservé aux rédacteurs et au gérant.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">E-mail professionnel</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom@karhon.ci" autoComplete="username"
                  onKeyDown={(e) => { if (e.key === "Enter") seConnecter(); }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all" style={{ borderColor: "#e0ecec" }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type={voirMdp ? "text" : "password"} value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                  onKeyDown={(e) => { if (e.key === "Enter") seConnecter(); }}
                  className="w-full pl-10 pr-11 py-3 rounded-2xl text-sm bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all" style={{ borderColor: "#e0ecec" }}
                />
                <button type="button" onClick={() => setVoirMdp((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={voirMdp ? "Masquer" : "Afficher"}>
                  {voirMdp ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Code d'accès</label>
              <div className="relative">
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#9ca3af" }} />
                <input
                  type="password" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Code partagé de l'équipe" autoComplete="off"
                  onKeyDown={(e) => { if (e.key === "Enter") seConnecter(); }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm bg-gray-50 border focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all" style={{ borderColor: "#e0ecec" }}
                />
              </div>
            </div>

            {erreur && (
              <p className="flex items-center gap-2 text-sm" style={{ color: "#b42318" }}>
                <AlertCircle size={15} className="flex-shrink-0" /> {erreur}
              </p>
            )}

            <button
              onClick={seConnecter}
              disabled={envoi}
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white text-sm transition-all hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${TEAL}, ${MARINE})` }}
            >
              {envoi ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              Accéder au back-office
            </button>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Accès strictement réservé. Toute tentative est enregistrée.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
