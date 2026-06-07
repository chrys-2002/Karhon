"use client";

// Page /client/reinitialiser?token=...
// L'utilisateur définit son nouveau mot de passe à partir du lien reçu par email.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";

export default function Reinitialiser() {
  const router = useRouter();
  // undefined = pas encore lu ; null = absent ; string = présent
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const [voir, setVoir] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [ok, setOk] = useState(false);

  // Lit le jeton depuis l'URL (sans useSearchParams pour éviter le Suspense).
  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    setToken(t || null);
  }, []);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (pwd.length < 6) { setErreur("Le mot de passe doit faire au moins 6 caractères."); return; }
    if (pwd !== confirm) { setErreur("Les mots de passe ne correspondent pas."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, motDePasse: pwd }),
      });
      const data = await res.json();
      if (!res.ok) { setErreur(data.erreur || "Lien invalide ou expiré."); return; }
      setOk(true);
      setTimeout(() => router.push("/client"), 2200);
    } catch {
      setErreur("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-4" style={{ backgroundColor: "#f8fbfb" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-[420px] w-full bg-white rounded-[2rem] shadow-xl border p-8"
        style={{ borderColor: "rgba(226,232,240,0.8)" }}
      >
        {ok ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
              <CheckCircle2 size={32} style={{ color: "#2a8a8a" }} />
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "#1a2e5a" }}>Mot de passe mis à jour</h1>
            <p className="text-gray-500 text-sm">Vous allez être redirigé vers la connexion…</p>
          </div>
        ) : token === undefined ? (
          // jeton pas encore lu
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin" size={28} style={{ color: "#2a8a8a" }} />
          </div>
        ) : token === null ? (
          // pas de jeton dans l'URL
          <div className="text-center py-4">
            <h1 className="text-xl font-bold mb-2" style={{ color: "#1a2e5a" }}>Lien invalide</h1>
            <p className="text-gray-500 text-sm mb-5">Ce lien de réinitialisation est incomplet ou a expiré.</p>
            <Link href="/client/mot-de-passe-oublie" className="inline-block px-5 py-2.5 rounded-xl font-semibold text-sm text-white" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
              Refaire une demande
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <ShieldCheck size={20} style={{ color: "#2a8a8a" }} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: "#1a2e5a" }}>Nouveau mot de passe</h1>
            </div>

            {erreur && (
              <div className="mb-4 p-3 rounded-xl text-xs font-medium" style={{ background: "#fdecec", color: "#b42318" }}>{erreur}</div>
            )}

            <form onSubmit={soumettre} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type={voir ? "text" : "password"}
                  value={pwd}
                  onChange={(e) => setPwd(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm"
                />
                <button type="button" onClick={() => setVoir(!voir)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                  {voir ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type={voir ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Confirmer le mot de passe"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-white py-4 rounded-2xl text-sm font-bold shadow-lg disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : "Réinitialiser"}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
