"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NouveauSinistre() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    contratId: "",
    dateSurvenance: "",
    circonstances: "",
    montantEstime: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/client/dashboard");
    }, 1500);
  };

  const contrats = [
    { id: "C001", produit: "Assurance Auto" },
    { id: "C002", produit: "Assurance Habitation" },
    { id: "C003", produit: "Assurance Sante" }
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Declaration de sinistre</h1>
          <p className="text-gray-500 mb-6">Remplissez ce formulaire pour declarer votre sinistre</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrat concerne *</label>
              <select name="contratId" value={formData.contratId} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Selectionnez un contrat</option>
                {contrats.map((contrat) => (
                  <option key={contrat.id} value={contrat.id}>{contrat.id} - {contrat.produit}</option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du sinistre *</label>
              <input type="date" name="dateSurvenance" value={formData.dateSurvenance} onChange={handleChange} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Circonstances *</label>
              <textarea name="circonstances" rows={5} value={formData.circonstances} onChange={handleChange} required placeholder="Decrivez les circonstances du sinistre..." className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant estime (FCFA)</label>
              <input type="number" name="montantEstime" value={formData.montantEstime} onChange={handleChange} placeholder="Ex: 500000" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            
            <div className="flex gap-4">
              <button type="submit" disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 rounded-xl font-semibold hover:bg-blue-700 transition-all">
                {isSubmitting ? "Envoi en cours..." : "Declarer le sinistre"}
              </button>
              <button type="button" onClick={() => router.back()} className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all">
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
