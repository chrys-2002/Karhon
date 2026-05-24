"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = localStorage.getItem("user");
    if (!data) {
      router.push("/client");
    } else {
      try {
        setUser(JSON.parse(data));
      } catch {
        router.push("/client");
      }
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-800 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null;

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const stats = [
    { label: "Contrats actifs", value: "3", icone: "📄" },
    { label: "Sinistres", value: "1", icone: "⚠️" },
    { label: "Devis", value: "2", icone: "📋" },
    { label: "Échéances", value: "2", icone: "📅" }
  ];

  const contrats = [
    { id: "C001", produit: "Assurance Auto", compagnie: "SUNU", prime: "185 000 FCFA", echeance: "31/12/2024" },
    { id: "C002", produit: "Assurance Habitation", compagnie: "NSIA", prime: "95 000 FCFA", echeance: "15/03/2025" },
    { id: "C003", produit: "Assurance Santé", compagnie: "AXA", prime: "245 000 FCFA", echeance: "30/06/2024" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="mb-8"
        >
          <h1 className="text-2xl font-semibold text-gray-800">
            Bonjour, <span className="text-gray-900">{user.email?.split("@")[0] || "Client"}</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">Bienvenue dans votre espace personnel</p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-800 mt-1">{stat.value}</p>
                </div>
                <div className="text-2xl">{stat.icone}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Contrats */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">Mes contrats</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["N°", "Produit", "Compagnie", "Prime", "Échéance"].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {contrats.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{c.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.produit}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.compagnie}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{c.prime}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{c.echeance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.3 }}
          className="grid md:grid-cols-3 gap-4"
        >
          <Link href="/client/sinistres/nouveau">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 text-sm">Déclarer un sinistre</h3>
            </div>
          </Link>

          <Link href="/devis">
            <div className="bg-white rounded-xl p-5 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 text-sm">Nouveau devis</h3>
            </div>
          </Link>

          <button onClick={() => { localStorage.removeItem("user"); router.push("/client"); }}>
            <div className="bg-white rounded-xl p-5 text-center border border-gray-100 hover:shadow-md transition-all cursor-pointer">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-800 text-sm">Se déconnecter</h3>
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
