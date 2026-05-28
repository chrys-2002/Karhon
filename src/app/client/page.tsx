"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ClientLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", nom: "", prenom: "", telephone: "", confirmPassword: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      if (formData.email === "client@karhon.ci" && formData.password === "password") {
        localStorage.setItem("user", JSON.stringify({ email: formData.email }));
        router.push("/client/dashboard");
      } else {
        setError("Email ou mot de passe incorrect");
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify({ email: formData.email, nom: formData.nom }));
      router.push("/client/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20 px-4" style={{ background: "linear-gradient(135deg, #f0f7f7 0%, #ffffff 60%, #e8f0f8 100%)" }}>
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden border"
          style={{ borderColor: "#e0ecec" }}
        >
          {/* Header */}
          <div className="p-8 text-center" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
            <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-lg bg-white/20">
              <span className="text-white font-bold text-3xl">K</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Espace Client</h1>
            <p className="text-white/70 text-sm mt-1">Connectez-vous à votre compte</p>
          </div>

          {/* Toggle */}
          <div className="flex border-b border-gray-100 mx-8 mt-6">
            <button
              onClick={() => setIsLogin(true)}
              className="flex-1 py-3 text-sm font-medium transition-all"
              style={{ color: isLogin ? "#2a8a8a" : "#9ca3af", borderBottom: isLogin ? "2px solid #2a8a8a" : "2px solid transparent" }}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="flex-1 py-3 text-sm font-medium transition-all"
              style={{ color: !isLogin ? "#2a8a8a" : "#9ca3af", borderBottom: !isLogin ? "2px solid #2a8a8a" : "2px solid transparent" }}
            >
              Inscription
            </button>
          </div>

          <div className="p-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={isLogin ? handleLogin : handleRegister}>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-3 mb-4"
                >
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all text-sm"
                    style={{ focusBorderColor: "#2a8a8a" }} />
                  <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all text-sm" />
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all text-sm" />
                </motion.div>
              )}

              <div className="space-y-3 mb-6">
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all text-sm" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mot de passe"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all text-sm" />
                {!isLogin && (
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirmer le mot de passe"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white transition-all text-sm" />
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full text-white py-3 rounded-xl text-sm font-semibold transition shadow-md disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
              >
                {isLoading ? "Chargement..." : (isLogin ? "Se connecter" : "Créer mon compte")}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="text-sm transition hover:underline"
                style={{ color: "#2a8a8a" }}
              >
                {isLogin ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
              </button>
            </div>

            {isLogin && (
              <div className="mt-6 p-3 rounded-xl text-center" style={{ backgroundColor: "#f0f7f7" }}>
                <p className="text-xs text-gray-500">🔐 Démo : <span className="font-medium">client@karhon.ci</span> / <span className="font-medium">password</span></p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}