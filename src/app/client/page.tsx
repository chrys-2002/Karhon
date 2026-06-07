"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function ClientLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", nom: "", prenom: "", telephone: "", confirmPassword: "" });

  // Affiche un message clair si on revient d'un échec de connexion Google.
  useEffect(() => {
    const err = new URLSearchParams(window.location.search).get("erreur");
    if (!err) return;
    const messages: Record<string, string> = {
      google_non_configure: "La connexion Google n'est pas encore configurée.",
      google_annule: "Connexion Google annulée.",
      google_state: "Session expirée. Réessayez la connexion Google.",
      google_token: "Échec de la connexion Google. Réessayez.",
      google_profil: "Impossible de récupérer votre profil Google.",
      google_email: "Votre adresse Google n'est pas vérifiée.",
      google_erreur: "Une erreur est survenue avec Google.",
    };
    setError(messages[err] ?? "Connexion Google impossible.");
    window.history.replaceState({}, "", "/client"); // nettoie l'URL
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  // Connexion : appelle la vraie route API /api/auth/login.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, motDePasse: formData.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.erreur ?? "Connexion impossible.");
        setIsLoading(false);
        return;
      }
      // Le cookie de session est posé automatiquement par le serveur.
      // On aiguille selon le rôle : le personnel (agent/gérant) va au back-office,
      // le client à son espace.
      const estStaff = ["agent", "gerant", "admin"].includes(data.utilisateur?.role);
      router.push(estStaff ? "/admin" : "/client/dashboard");
    } catch {
      setError("Erreur réseau. Vérifie ta connexion.");
      setIsLoading(false);
    }
  };

  // Inscription : appelle la vraie route API /api/auth/register.
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          telephone: formData.telephone,
          motDePasse: formData.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.erreur ?? "Inscription impossible.");
        setIsLoading(false);
        return;
      }
      router.push("/client/dashboard");
    } catch {
      setError("Erreur réseau. Vérifie ta connexion.");
      setIsLoading(false);
    }
  };

  // Connexion Google : redirige vers le flux OAuth côté serveur.
  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    window.location.href = "/api/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-24 px-4 relative overflow-hidden" style={{ backgroundColor: "#f8fbfb" }}>
      
      {/* Background blobs decoratifs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ background: "rgba(42,138,138,0.15)" }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px]" style={{ background: "rgba(26,46,90,0.1)" }}></div>

      <div className="max-w-[420px] w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2rem] shadow-2xl overflow-hidden border"
          style={{ borderColor: "rgba(226, 232, 240, 0.8)", boxShadow: "0 25px 50px -12px rgba(26,46,90,0.15)" }}
        >
          {/* Header avec ton LOGO */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-5 shadow-lg border relative overflow-hidden bg-white" style={{ borderColor: "#f1f5f9" }}>
              <Image 
                src="/images/logo/karhon-couleur.svg"
                alt="Logo KARHON Assurances" 
                fill 
                sizes="80px"
                className="object-contain p-2"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#1a2e5a" }}>Espace Client</h1>
            <p className="text-gray-500 text-sm mt-1.5">
              {isLogin ? "Heureux de vous revoir" : "Créez votre compte en quelques secondes"}
            </p>
          </div>

          {/* Toggle Connexion / Inscription */}
          <div className="flex border-b border-gray-100 mx-8">
            <button
              onClick={() => { setIsLogin(true); setError(""); }}
              className="flex-1 pb-3 text-sm font-bold transition-all relative"
              style={{ color: isLogin ? "#2a8a8a" : "#9ca3af" }}
            >
              Connexion
              {isLogin && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: "#2a8a8a" }} />}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(""); }}
              className="flex-1 pb-3 text-sm font-bold transition-all relative"
              style={{ color: !isLogin ? "#2a8a8a" : "#9ca3af" }}
            >
              Inscription
              {!isLogin && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: "#2a8a8a" }} />}
            </button>
          </div>

          <div className="px-8 py-6">
            
            {/* Bouton Google Premium */}
            <button 
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm mb-6 disabled:opacity-50"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continuer avec Google
                </>
              )}
            </button>

            {/* Séparateur */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400 font-medium">Ou avec votre email</span>
              </div>
            </div>

            {/* Message d'erreur */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-100"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Formulaire */}
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-3">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" required={!isLogin}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm" />
                  </div>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" required={!isLogin}
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm" />
                  </div>
                </div>
              )}

              {!isLogin && (
                <div className="relative">
                  <Phone className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" required={!isLogin}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm" />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Adresse email" required
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm" />
              </div>
              
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Mot de passe" required
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
                  <input type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirmer le mot de passe" required={!isLogin}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm" />
                </div>
              )}

              {isLogin && (
                <div className="flex justify-end">
                  <Link href="/client/mot-de-passe-oublie" className="text-xs font-semibold hover:underline" style={{ color: "#2a8a8a" }}>
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || isGoogleLoading}
                className="w-full text-white py-4 rounded-2xl text-sm font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 flex items-center justify-center gap-2 mt-4"
                style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    {isLogin ? "Se connecter" : "Créer mon compte"}
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
        
        <p className="text-center text-[11px] text-gray-400 mt-6 px-4">
          En vous connectant, vous acceptez nos <Link href="#" className="underline">Conditions d&apos;utilisation</Link> et notre <Link href="#" className="underline">Politique de confidentialité</Link>.
        </p>
      </div>
    </div>
  );
}