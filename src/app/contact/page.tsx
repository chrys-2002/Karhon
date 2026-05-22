"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    nom: "", prenom: "", email: "", telephone: "", sujet: "information", message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const sujetOptions = [
    { value: "information", label: "Demande d'information", icon: "📝" },
    { value: "devis", label: "Demande de devis", icon: "📋" },
    { value: "sinistre", label: "Déclaration de sinistre", icon: "⚠️" },
    { value: "reclamation", label: "Réclamation", icon: "💬" }
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md sm:max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center shadow-2xl mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">Message envoyé !</h1>
          <p className="text-gray-600 mb-4">Merci {formData.prenom} ! Votre message a bien été reçu.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const contactInfo = [
    { icone: "📍", title: "Adresse", content: "Abidjan, Côte d'Ivoire" },
    { icone: "📞", title: "Téléphone", content: "+225 07 07 10 87 43" },
    { icone: "✉️", title: "Email", content: "contact@karhon-assurances.ci" },
    { icone: "⏰", title: "Horaires", content: "Lun-Ven 8h30-17h30, Sam 9h-13h" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">Contactez-nous</h1>
          <p className="text-sm sm:text-base text-gray-500">Notre équipe est à votre écoute</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Contact Info - responsive */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden sticky top-24">
              <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 sm:p-6 text-white">
                <h2 className="text-base sm:text-lg md:text-xl font-bold">Nos coordonnées</h2>
                <p className="text-blue-100 text-xs sm:text-sm mt-1">Contactez-nous</p>
              </div>
              <div className="p-4 sm:p-6">
                {contactInfo.map((info, i) => (
                  <div key={i} className="flex items-start gap-3 sm:gap-4 p-2 sm:p-3 rounded-xl hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center text-xl sm:text-2xl">{info.icone}</div>
                    <div><h3 className="font-semibold text-gray-800 text-sm sm:text-base">{info.title}</h3><p className="text-gray-500 text-xs sm:text-sm">{info.content}</p></div>
                  </div>
                ))}
                <div className="border-t border-gray-100 mt-4 sm:mt-6 pt-4 sm:pt-6">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-2 sm:mb-3">Suivez-nous</h3>
                  <div className="flex gap-2 sm:gap-3">
                    {["📘", "📷", "💼", "🐦"].map((social, i) => (<div key={i} className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-full flex items-center justify-center text-base sm:text-xl hover:bg-blue-600 hover:text-white transition-all cursor-pointer">{social}</div>))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire - responsive */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
              <div className="p-5 sm:p-6 md:p-8">
                <form onSubmit={handleSubmit}>
                  <div className="grid sm:grid-cols-2 gap-4 sm:gap-5 mb-4 sm:mb-5">
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Nom *</label><input type="text" name="nom" value={formData.nom} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Prénom *</label><input type="text" name="prenom" value={formData.prenom} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Téléphone</label><input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                  </div>

                  <div className="mb-4 sm:mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Sujet *</label>
                    <select name="sujet" value={formData.sujet} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                      {sujetOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>)}
                    </select>
                  </div>

                  <div className="mb-5 sm:mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Message *</label>
                    <textarea name="message" rows={5} value={formData.message} onChange={handleChange} required className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Décrivez votre demande..."></textarea>
                  </div>

                  <div className="flex items-center gap-2 sm:gap-3 mb-5 sm:mb-6">
                    <input type="checkbox" required className="w-4 h-4 text-blue-600 rounded" />
                    <label className="text-xs sm:text-sm text-gray-500">J'accepte que mes données soient utilisées</label>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white py-2.5 sm:py-3.5 rounded-xl font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all shadow-md disabled:opacity-50">
                    {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
