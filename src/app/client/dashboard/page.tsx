"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) router.push("/client");
    else setUser(JSON.parse(userData));
  }, [router]);

  const stats = [
    { label: "Contrats actifs", value: "3", icone: "📄", color: "from-blue-500 to-blue-600" },
    { label: "Sinistres en cours", value: "1", icone: "⚠️", color: "from-orange-500 to-orange-600" },
    { label: "Devis en attente", value: "2", icone: "📋", color: "from-green-500 to-green-600" },
    { label: "Échéances", value: "2", icone: "📅", color: "from-purple-500 to-purple-600" }
  ];

  const contrats = [
    { id: "C001", produit: "Assurance Auto", compagnie: "SUNU", prime: "185 000 FCFA", echeance: "31/12/2024", statut: "actif" },
    { id: "C002", produit: "Assurance Habitation", compagnie: "NSIA", prime: "95 000 FCFA", echeance: "15/03/2025", statut: "actif" }
  ];

  if (!user) return <div className="py-20 text-center">Chargement...</div>;

  return (
    <div className="py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bonjour, {user.prenom || user.nom || "Client"} 👋</h1>
          <p className="text-gray-500">Bienvenue dans votre espace client KARHON</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }} className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white shadow-lg`}>
              <div className="flex justify-between items-start"><div><p className="text-white/80 text-sm">{stat.label}</p><p className="text-3xl font-bold mt-1">{stat.value}</p></div><div className="text-4xl">{stat.icone}</div></div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="border-b px-6 py-4 bg-gray-50"><h2 className="text-xl font-semibold text-gray-800">Mes contrats</h2></div>
            <div className="overflow-x-auto">
              <table className="w-full"><thead className="bg-gray-50"><tr>{["N°", "Produit", "Compagnie", "Prime", "Statut"].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-200">
                {contrats.map((c) => (<tr key={c.id}><td className="px-6 py-4 text-sm font-medium text-gray-900">{c.id}</td><td className="px-6 py-4 text-sm text-gray-600">{c.produit}</td><td className="px-6 py-4 text-sm text-gray-600">{c.compagnie}</td><td className="px-6 py-4 text-sm text-gray-600">{c.prime}</td><td className="px-6 py-4"><span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">✅ {c.statut}</span></td></tr>))}
              </tbody></table>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions rapides</h2>
            <div className="space-y-3">
              <Link href="/client/sinistres/nouveau"><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all">📋 Déclarer un sinistre</motion.button></Link>
              <Link href="/devis"><motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full border-2 border-blue-900 text-blue-900 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all">💰 Demander un devis</motion.button></Link>
              <button onClick={() => { localStorage.removeItem("user"); router.push("/client"); }} className="w-full text-red-600 py-3 rounded-xl font-semibold hover:bg-red-50 transition-all">🚪 Se déconnecter</button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
