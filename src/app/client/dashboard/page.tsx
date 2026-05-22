"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (!data) router.push("/client");
    else setUser(JSON.parse(data));
  }, []);

  if (!user) return <div className="py-20 text-center">Chargement...</div>;

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Bonjour {user.email} 👋</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Mes contrats</h2>
            <p className="text-gray-600">Aucun contrat actif</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Sinistres</h2>
            <Link href="/client/sinistres/nouveau" className="text-blue-600 hover:underline">Declarer un sinistre</Link>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <button onClick={() => { localStorage.removeItem("user"); router.push("/client"); }} className="text-red-600 hover:underline">Se deconnecter</button>
          </div>
        </div>
      </div>
    </div>
  );
}
