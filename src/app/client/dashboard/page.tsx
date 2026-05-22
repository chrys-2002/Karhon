"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (!data) {
      router.push("/client");
    } else {
      try {
        const parsed = JSON.parse(data);
        setUser(parsed);
      } catch {
        router.push("/client");
      }
    }
  }, [router]);

  if (!user) {
    return (
      <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Bonjour {user?.email || "Client"} 👋</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Mes contrats</h2>
            <p className="text-gray-600">Aucun contrat actif</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Sinistres</h2>
            <Link href="/client/sinistres/nouveau" className="text-blue-600 hover:underline">
              Déclarer un sinistre
            </Link>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Actions</h2>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                router.push("/client");
              }}
              className="text-red-600 hover:underline"
            >
              Se déconnecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
