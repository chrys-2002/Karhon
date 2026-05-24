"use client";
import { useState } from "react";
import Link from "next/link";
import Select from "@/components/ui/Select";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({ nom: "", prenom: "", email: "", telephone: "", sujet: "info", message: "" });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setIsSubmitted(true); }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="py-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center bg-white rounded-xl shadow-lg p-8">
          <div className="text-5xl mb-4">??</div>
          <h1 className="text-xl font-bold mb-2">Message envoyé</h1>
          <p className="text-gray-500 text-sm mb-4">Merci, nous vous répondrons rapidement.</p>
          <Link href="/" className="text-blue-800 text-sm hover:underline">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const sujetOptions = [
    { value: "info", label: "Demande d'information" },
    { value: "devis", label: "Demande de devis" },
    { value: "sinistre", label: "Déclaration de sinistre" }
  ];

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Contactez-nous</h1>
          <p className="text-gray-500 text-sm">Notre équipe est à votre écoute</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">?? Adresse</h3>
            <p className="text-gray-500 text-sm">Abidjan, Côte d'Ivoire</p>
            <p className="text-gray-400 text-xs mt-1">Plateau - Avenue Chardy</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">?? Téléphone</h3>
            <p className="text-gray-500 text-sm">+225 07 07 10 87 43</p>
            <p className="text-gray-400 text-xs mt-1">Lun-Ven 8h30-17h30</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">?? Email</h3>
            <p className="text-gray-500 text-sm">contact@karhon-assurances.ci</p>
            <p className="text-gray-400 text-xs mt-1">Réponse sous 24h</p>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Envoyez-nous un message</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 text-sm" />
              <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 text-sm" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 text-sm" />
              <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 text-sm" />
            </div>
            <div className="mb-4">
              <Select label="Sujet" name="sujet" value={formData.sujet} onChange={handleChange} options={sujetOptions} required />
            </div>
            <div className="mb-5">
              <textarea name="message" rows={4} value={formData.message} onChange={handleChange} placeholder="Votre message..." required className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-800 resize-none text-sm"></textarea>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-800 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-900 transition disabled:opacity-50">
              {isSubmitting ? "Envoi..." : "Envoyer le message"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

