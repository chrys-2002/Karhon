"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function DevisPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    typeAssurance: "auto",
    civilite: "mr",
    nom: "", prenom: "", email: "", telephone: "", 
    dateNaissance: "", profession: "", ville: "Abidjan",
    vehiculeMarque: "", vehiculeModele: "", vehiculeAnnee: "",
    message: ""
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

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20 px-4">
        <div className="max-w-md sm:max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center shadow-2xl mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">Demande envoyée !</h1>
          <p className="text-gray-600 mb-4 sm:mb-6">Merci {formData.prenom} {formData.nom} ! Votre demande a bien été reçue.</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 sm:px-8 py-2.5 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all">Retour à l'accueil</Link>
        </div>
      </div>
    );
  }

  const insuranceTypes = [
    { value: "auto", label: "Auto", icon: "🚗" },
    { value: "habitation", label: "Habitation", icon: "🏠" },
    { value: "sante", label: "Santé", icon: "🏥" },
    { value: "voyage", label: "Voyage", icon: "✈️" },
    { value: "vie", label: "Vie", icon: "💝" },
    { value: "professionnelle", label: "Pro", icon: "💼" }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-3">Devis gratuit</h1>
          <p className="text-sm sm:text-base text-gray-500">Obtenez une offre personnalisée</p>
        </div>

        <div className="flex justify-between mb-6 sm:mb-8">
          {["Votre besoin", "Votre profil", "Confirmation"].map((label, i) => (
            <div key={i} className="text-center flex-1">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                step > i ? "bg-blue-600 text-white shadow-lg" : step === i + 1 ? "bg-white border-2 border-blue-600 text-blue-600" : "bg-gray-200 text-gray-400"
              }`}>
                {step > i ? "✓" : i + 1}
              </div>
              <p className={`text-xs mt-1 sm:mt-2 hidden xs:block ${step === i + 1 ? "text-blue-600 font-medium" : "text-gray-400"}`}>{label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
          <div className="p-5 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} transition={{ duration: 0.3 }}>
                  <div className="mb-6 sm:mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Type d'assurance</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 sm:gap-3">
                      {insuranceTypes.map((type) => (
                        <button key={type.value} type="button" onClick={() => setFormData(prev => ({ ...prev, typeAssurance: type.value }))}
                          className={`p-3 sm:p-4 rounded-xl border-2 transition-all ${
                            formData.typeAssurance === type.value
                              ? "bg-blue-600 border-blue-600 shadow-md text-white"
                              : "border-gray-200 hover:border-blue-300 bg-white text-gray-700"
                          }`}>
                          <div className="text-xl sm:text-2xl mb-1">{type.icon}</div>
                          <p className="text-xs sm:text-sm font-medium">{type.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Informations personnelles</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <select name="civilite" value={formData.civilite} onChange={handleChange} className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="mr">M.</option><option value="mme">Mme</option><option value="mlle">Mlle</option>
                      </select>
                      <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Détails du véhicule</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <input type="text" name="vehiculeMarque" value={formData.vehiculeMarque} onChange={handleChange} placeholder="Marque" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="text" name="vehiculeModele" value={formData.vehiculeModele} onChange={handleChange} placeholder="Modèle" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      <input type="number" name="vehiculeAnnee" value={formData.vehiculeAnnee} onChange={handleChange} placeholder="Année" className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <div className="mb-6 sm:mb-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Informations complémentaires</label>
                    <textarea name="message" rows={4} value={formData.message} onChange={handleChange} placeholder="Précisez vos besoins particuliers..." className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-blue-600 rounded-full flex items-center justify-center shadow-lg mb-4 sm:mb-6">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Prêt à recevoir votre devis ?</h3>
                  <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">Vérifiez vos informations</p>
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-6 text-left mb-4 sm:mb-6">
                    <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                      <div><span className="text-gray-500">Nom:</span><p className="font-medium">{formData.prenom} {formData.nom}</p></div>
                      <div><span className="text-gray-500">Email:</span><p className="font-medium">{formData.email}</p></div>
                      <div><span className="text-gray-500">Téléphone:</span><p className="font-medium">{formData.telephone}</p></div>
                      <div><span className="text-gray-500">Assurance:</span><p className="font-medium capitalize">{formData.typeAssurance}</p></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">En soumettant, vous acceptez le traitement de vos données</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100">
              {step > 1 && (
                <button onClick={prevStep} className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-gray-300 text-gray-600 font-medium text-sm sm:text-base hover:bg-gray-50 transition-all">← Retour</button>
              )}
              {step < 3 ? (
                <button onClick={nextStep} className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all shadow-md">Continuer →</button>
              ) : (
                <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-2 sm:py-3 rounded-xl font-semibold text-sm sm:text-base hover:bg-blue-700 transition-all shadow-md disabled:opacity-50">
                  {isSubmitting ? "Envoi..." : "Recevoir mon devis →"}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 mt-6 sm:mt-8">
          {["Données sécurisées", "Sans engagement", "Réponse sous 48h", "Service gratuit"].map((text, i) => (
            <div key={i} className="flex items-center gap-1 text-xs text-gray-400"><span>✓</span><span>{text}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
