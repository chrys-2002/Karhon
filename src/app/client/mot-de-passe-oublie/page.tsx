"use client";

// Page /client/mot-de-passe-oublie
// Le visiteur saisit son email pour recevoir un lien de réinitialisation.
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, Send, Loader2 } from "lucide-react";

export default function MotDePasseOublie() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        setErreur("Une erreur est survenue. Réessayez.");
        return;
      }
      setEnvoye(true);
    } catch {
      setErreur("Erreur réseau. Vérifiez votre connexion.");
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
        <Link href="/client" className="inline-flex items-center gap-2 text-sm font-semibold mb-6" style={{ color: "#1a2e5a" }}>
          <ArrowLeft size={16} /> Retour à la connexion
        </Link>

        {envoye ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
              <CheckCircle2 size={32} style={{ color: "#2a8a8a" }} />
            </div>
            <h1 className="text-xl font-bold mb-2" style={{ color: "#1a2e5a" }}>Vérifiez vos emails</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation vient d&apos;être envoyé. Le lien est valable 1 heure.
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-1" style={{ color: "#1a2e5a" }}>Mot de passe oublié</h1>
            <p className="text-gray-500 text-sm mb-6">Entrez votre email, nous vous enverrons un lien pour le réinitialiser.</p>

            {erreur && (
              <div className="mb-4 p-3 rounded-xl text-xs font-medium" style={{ background: "#fdecec", color: "#b42318" }}>{erreur}</div>
            )}

            <form onSubmit={soumettre} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Adresse email"
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
                {loading ? <Loader2 size={18} className="animate-spin" /> : <><Send size={16} /> Envoyer le lien</>}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
