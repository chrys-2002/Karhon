"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ClientPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "client@karhon.ci" && password === "password") {
      localStorage.setItem("user", JSON.stringify({ email }));
      router.push("/client/dashboard");
    } else {
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-2xl text-white font-bold">K</span>
          </div>
          <h1 className="text-2xl font-bold">Espace Client</h1>
          <p className="text-gray-500 text-sm">Connectez-vous a votre compte</p>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 border rounded-xl mb-4" />
          <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 border rounded-xl mb-6" />
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">Se connecter</button>
        </form>
        <div className="mt-4 p-3 bg-blue-50 rounded-xl text-center text-sm">Demo: client@karhon.ci / password</div>
      </div>
    </div>
  );
}
