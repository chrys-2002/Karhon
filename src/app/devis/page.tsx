"use client";
import { useState } from "react";
import Link from "next/link";

export default function DevisPage() {
  const [formData, setFormData] = useState({ nom: "", prenom: "", email: "", telephone: "", type: "auto", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="py-20 bg-gray-50 min-h-screen flex items-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold mb-4">Demande envoyee</h1>
          <p className="mb-6">Merci {formData.prenom}, nous vous contacterons sous 48h.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg inline-block">Retour</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold text-center mb-6">Demande de devis gratuit</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" name="nom" placeholder="Nom" onChange={handleChange} required className="w-full p-3 border rounded-xl" />
            <input type="text" name="prenom" placeholder="Prenom" onChange={handleChange} required className="w-full p-3 border rounded-xl" />
            <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full p-3 border rounded-xl" />
            <input type="tel" name="telephone" placeholder="Telephone" onChange={handleChange} required className="w-full p-3 border rounded-xl" />
            <select name="type" onChange={handleChange} className="w-full p-3 border rounded-xl">
              <option value="auto">Assurance Auto</option>
              <option value="habitation">Assurance Habitation</option>
              <option value="sante">Assurance Sante</option>
            </select>
            <textarea name="message" placeholder="Message" rows={4} onChange={handleChange} className="w-full p-3 border rounded-xl"></textarea>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition">
              {isSubmitting ? "Envoi..." : "Envoyer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
