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

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleLogin = (e) => {
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

  const handleRegister = (e) => {
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
    <div className="min-h-screen bg-white flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header épuré */}
          <div className="p-8 text-center">
            <div className="w-14 h-14 mx-auto bg-orange-500 rounded-xl flex items-center justify-center mb-4 shadow-sm">
              <span className="text-white font-bold text-2xl">K</span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Espace client</h1>
            <p className="text-gray-400 text-sm mt-1">Connectez-vous à votre compte</p>
          </div>

          {/* Toggle */}
          <div className="flex border-b border-gray-100 mx-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 text-sm font-medium transition-all ${isLogin ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600"}`}
            >
              Connexion
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 text-sm font-medium transition-all ${!isLogin ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-400 hover:text-gray-600"}`}
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
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm" />
                  <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm" />
                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm" />
                </motion.div>
              )}
              
              <div className="space-y-3 mb-6">
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm" />
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mot de passe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm" />
                {!isLogin && (
                  <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirmer le mot de passe" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm" />
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition shadow-sm disabled:opacity-50"
              >
                {isLoading ? "Chargement..." : (isLogin ? "Se connecter" : "Créer mon compte")}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(""); }}
                className="text-gray-400 hover:text-gray-600 text-sm transition"
              >
                {isLogin ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
              </button>
            </div>

            {isLogin && (
              <div className="mt-6 p-3 bg-gray-50 rounded-xl text-center">
                <p className="text-xs text-gray-500">🔐 Démo : <span className="font-medium">client@karhon.ci</span> / <span className="font-medium">password</span></p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
