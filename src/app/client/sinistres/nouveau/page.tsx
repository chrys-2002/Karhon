"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function NouveauSinistre() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    contratId: "",
    dateSurvenance: "",
    circonstances: "",
    montantEstime: "",
    temoins: ""
  });
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      console.log("Sinistre déclaré:", formData, files);
      setIsSubmitting(false);
      router.push("/client/dashboard");
    }, 1500);
  };

  const contrats = [
    { id: "C001", produit: "Assurance Auto" },
    { id: "C002", produit: "Assurance Habitation" },
    { id: "C003", produit: "Assurance Santé" }
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Déclaration de sinistre</h1>
          <p className="text-gray-600 mb-6">Remplissez ce formulaire pour déclarer votre sinistre</p>
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contrat concerné *</label>
              <select
                name="contratId"
                value={formData.contratId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="">Sélectionnez un contrat</option>
                {contrats.map((contrat) => (
                  <option key={contrat.id} value={contrat.id}>
                    {contrat.id} - {contrat.produit}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du sinistre *</label>
              <input
                type="date"
                name="dateSurvenance"
                value={formData.dateSurvenance}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Circonstances du sinistre *</label>
              <textarea
                name="circonstances"
                rows={5}
                value={formData.circonstances}
                onChange={handleChange}
                required
                placeholder="Décrivez précisément les circonstances du sinistre..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant estimé des dommages (FCFA)</label>
              <input
                type="number"
                name="montantEstime"
                value={formData.montantEstime}
                onChange={handleChange}
                placeholder="Ex: 500000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Témoins (nom et contact)</label>
              <input
                type="text"
                name="temoins"
                value={formData.temoins}
                onChange={handleChange}
                placeholder="Nom, téléphone..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-900"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Documents justificatifs</label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Photos, factures, devis, constat amiable... (max 10Mo par fichier)
              </p>
            </div>
            
            <div className="flex gap-4">
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? "Envoi en cours..." : "Déclarer le sinistre"}
              </Button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
