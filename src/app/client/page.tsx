"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", nom: "", prenom: "", telephone: "" });

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <span className="text-2xl text-white font-bold">K</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">{isLogin ? "Connexion" : "Inscription"}</h1>
          <p className="text-gray-500 text-sm mt-1">Accedez a votre espace client</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="mb-6">
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Mot de passe" required className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all">
            {isLoading ? "Chargement..." : "Se connecter"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 hover:underline text-sm">
            Pas encore de compte ? Creez-en un
          </button>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-xl text-center">
          <p className="text-xs text-gray-600">Demo: client@karhon.ci / password</p>
        </div>
      </div>
    </div>
  );
}
