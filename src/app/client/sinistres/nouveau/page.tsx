"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NouveauSinistre() {
  const router = useRouter();
  const [formData, setFormData] = useState({ contratId: "", date: "", description: "", montant: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/client/dashboard");
    }, 1500);
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold mb-6">Déclaration de sinistre</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, contratId: e.target.value })}
              required
              className="w-full p-3 border rounded-xl"
            >
              <option value="">Sélectionnez un contrat</option>
              <option value="C001">Assurance Auto</option>
              <option value="C002">Assurance Habitation</option>
            </select>
            <input
              type="date"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, date: e.target.value })}
              required
              className="w-full p-3 border rounded-xl"
            />
            <textarea
              placeholder="Circonstances"
              rows={5}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
              required
              className="w-full p-3 border rounded-xl"
            ></textarea>
            <input
              type="number"
              placeholder="Montant estimé (FCFA)"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, montant: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-xl font-semibold text-white"
                style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
              >
                {isSubmitting ? "Envoi..." : "Déclarer"}
              </button>
              <button type="button" onClick={() => router.back()} className="px-6 py-3 border rounded-xl" style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}