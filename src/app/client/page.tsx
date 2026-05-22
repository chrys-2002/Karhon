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
        localStorage.setItem("user", JSON.stringify({ email: formData.email, nom: "Client" }));
        router.push("/client/dashboard");
      } else { setError("Email ou mot de passe incorrect"); setIsLoading(false); }
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify({ email: formData.email, nom: formData.nom, prenom: formData.prenom }));
      router.push("/client/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 sm:py-20 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto bg-gradient-to-r from-blue-700 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg">
              <span className="text-xl sm:text-2xl text-white font-bold">K</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{isLogin ? "Connexion" : "Inscription"}</h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">{isLogin ? "Accédez à votre espace client" : "Créez votre compte gratuitement"}</p>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            {!isLogin && (
              <div className="grid gap-3 sm:gap-4 mb-4">
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            )}
            <div className="mb-3 sm:mb-4"><input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div className="mb-4 sm:mb-6"><input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mot de passe" required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            {!isLogin && <div className="mb-5 sm:mb-6"><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirmer le mot de passe" required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>}

            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all shadow-md disabled:opacity-50">
              {isLoading ? "Chargement..." : (isLogin ? "Se connecter" : "S'inscrire")}
            </button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <button onClick={() => { setIsLogin(!isLogin); setError(""); setFormData({ email: "", password: "", nom: "", prenom: "", telephone: "", confirmPassword: "" }); }} className="text-blue-600 hover:underline text-sm">
              {isLogin ? "Pas encore de compte ? Créez-en un" : "Déjà un compte ? Connectez-vous"}
            </button>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-xl text-center"><p className="text-xs text-gray-600">🔐 Démo: client@karhon.ci / password</p></div>
        </div>
      </div>
    </div>
  );
}
