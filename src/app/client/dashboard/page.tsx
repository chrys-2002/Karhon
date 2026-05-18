"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      router.push("/client");
    } else {
      setUser(JSON.parse(userData));
    }
  }, [router]);
  
  const stats = [
    { label: "Contrats actifs", value: "3", icone: "📄", couleur: "bg-blue-100 text-blue-900" },
    { label: "Sinistres en cours", value: "1", icone: "⚠️", couleur: "bg-orange-100 text-orange-900" },
    { label: "Devis en attente", value: "2", icone: "📋", couleur: "bg-green-100 text-green-900" },
    { label: "Échéances à venir", value: "2", icone: "📅", couleur: "bg-purple-100 text-purple-900" }
  ];
  
  const contrats = [
    { id: "C001", produit: "Assurance Auto", compagnie: "SUNU", prime: "185 000 FCFA", echeance: "31/12/2024", statut: "actif" },
    { id: "C002", produit: "Assurance Habitation", compagnie: "NSIA", prime: "95 000 FCFA", echeance: "15/03/2025", statut: "actif" },
    { id: "C003", produit: "Assurance Santé", compagnie: "AXA", prime: "245 000 FCFA", echeance: "30/06/2024", statut: "actif" }
  ];
  
  const sinistres = [
    { id: "S001", contrat: "Assurance Auto", date: "10/01/2024", statut: "En cours", montant: "250 000 FCFA" }
  ];
  
  if (!user) {
    return (
      <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }
  
  return (
    <div className="py-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Bonjour, {user.prenom || user.nom || "Client"}
          </h1>
          <p className="text-gray-600">Bienvenue dans votre espace client KARHON Assurances</p>
        </div>
        
        {/* Statistiques */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={"text-3xl " + stat.couleur.split(" ")[0] + " bg-opacity-20 p-3 rounded-full"}>
                  {stat.icone}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Contrats */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Mes contrats</h2>
            <Link href="/client/contrats" className="text-blue-900 hover:underline text-sm">
              Voir tous →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Contrat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Compagnie</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prime</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contrats.map((contrat) => (
                  <tr key={contrat.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{contrat.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contrat.produit}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contrat.compagnie}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contrat.prime}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{contrat.echeance}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        {contrat.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Sinistres récents */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">Sinistres récents</h2>
            </div>
            <div className="p-6">
              {sinistres.length === 0 ? (
                <p className="text-gray-500 text-center">Aucun sinistre déclaré</p>
              ) : (
                sinistres.map((sinistre) => (
                  <div key={sinistre.id} className="border-b last:border-0 py-3">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{sinistre.contrat}</p>
                        <p className="text-sm text-gray-500">Date: {sinistre.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-orange-600">{sinistre.statut}</p>
                        <p className="text-sm text-gray-500">{sinistre.montant}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <Link href="/client/sinistres" className="block text-center text-blue-900 hover:underline text-sm mt-4">
                Déclarer un sinistre →
              </Link>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-800">Actions rapides</h2>
            </div>
            <div className="p-6 space-y-3">
              <Link href="/client/sinistres/nouveau" className="block w-full text-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                Déclarer un sinistre
              </Link>
              <Link href="/devis" className="block w-full text-center border-2 border-blue-900 text-blue-900 px-4 py-2 rounded-lg hover:bg-blue-50">
                Demander un devis
              </Link>
              <Link href="/client/profil" className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                Modifier mon profil
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem("user");
                  router.push("/client");
                }}
                className="block w-full text-center text-red-600 px-4 py-2 rounded-lg hover:bg-red-50"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
