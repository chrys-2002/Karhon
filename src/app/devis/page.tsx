"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Select from "@/components/ui/Select";

export default function DevisPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    typeAssurance: "auto",
    civilite: "mr",
    nom: "", prenom: "", email: "", telephone: "", ville: "Abidjan",
    vehiculeMarque: "", vehiculeModele: "", vehiculeAnnee: "", message: ""
  });

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setIsSubmitted(true); }, 1500);
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const fadeSlide = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.3 } }
  };

  if (isSubmitted) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center py-20"
      >
        <div className="max-w-md text-center">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-gray-900 mb-2"
          >
            Demande envoyée
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 mb-6"
          >
            Merci, notre équipe vous contactera sous 48h
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium">
              Retour à l'accueil
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  const insuranceTypes = [
    { value: "auto", label: "Assurance Auto" },
    { value: "habitation", label: "Assurance Habitation" },
    { value: "sante", label: "Assurance Santé" },
    { value: "voyage", label: "Assurance Voyage" }
  ];

  const civiliteOptions = [
    { value: "mr", label: "Monsieur" },
    { value: "mme", label: "Madame" },
    { value: "mlle", label: "Mademoiselle" }
  ];

  const villeOptions = [
    { value: "Abidjan", label: "Abidjan" },
    { value: "Bouaké", label: "Bouaké" },
    { value: "Yamoussoukro", label: "Yamoussoukro" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full mb-4">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Gratuit & sans engagement</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Demande de devis
          </h1>
          <p className="text-gray-500">Obtenez votre offre personnalisée en quelques clics</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          {/* Steps */}
          <div className="flex justify-between mb-10">
            {[{ num: 1, label: "Produit" }, { num: 2, label: "Profil" }, { num: 3, label: "Validation" }].map((item) => (
              <div key={item.num} className="text-center flex-1">
                <motion.div 
                  className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step > item.num ? "bg-blue-600 text-white shadow-lg" : step === item.num ? "bg-white text-blue-600 border-2 border-blue-600 shadow-md" : "bg-gray-100 text-gray-400"
                  }`}
                  animate={{ scale: step === item.num ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {step > item.num ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : item.num}
                </motion.div>
                <p className={`text-xs mt-2 font-medium ${step === item.num ? "text-blue-600" : "text-gray-400"}`}>{item.label}</p>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Select label="Type d'assurance" name="typeAssurance" value={formData.typeAssurance} onChange={handleChange} options={insuranceTypes} required />
                <div className="mt-4">
                  <Select label="Civilité" name="civilite" value={formData.civilite} onChange={handleChange} options={civiliteOptions} required />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextStep}
                  className="w-full mt-8 bg-blue-600 text-white py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-md"
                >
                  Continuer
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-4"
              >
                <input type="text" name="nom" value={formData.nom} onChange={handleChange} placeholder="Nom complet" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange} placeholder="Prénom" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Adresse email" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                <input type="tel" name="telephone" value={formData.telephone} onChange={handleChange} placeholder="Téléphone" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all" />
                <Select label="Ville" name="ville" value={formData.ville} onChange={handleChange} options={villeOptions} required />
                <textarea name="message" rows={3} value={formData.message} onChange={handleChange} placeholder="Informations complémentaires (optionnel)" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"></textarea>
                <div className="flex gap-3 pt-4">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={prevStep} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Retour</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={nextStep} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-md">Continuer</motion.button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="text-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-5"
                >
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Vérification</h3>
                <p className="text-gray-500 text-sm mb-6">Veuillez vérifier vos informations</p>
                <div className="bg-gray-50 rounded-xl p-5 text-left text-sm mb-6 space-y-3">
                  <div className="flex justify-between"><span className="text-gray-500">Nom complet</span><span className="font-medium text-gray-800">{formData.prenom} {formData.nom}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium text-gray-800">{formData.email}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Téléphone</span><span className="font-medium text-gray-800">{formData.telephone}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Assurance</span><span className="font-medium text-gray-800">{insuranceTypes.find(t => t.value === formData.typeAssurance)?.label}</span></div>
                </div>
                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={prevStep} className="flex-1 border border-gray-300 text-gray-600 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Retour</motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-md disabled:opacity-50">
                    {isSubmitting ? "Envoi..." : "Confirmer"}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center text-xs text-gray-400 mt-6"
        >
          Vos données sont confidentielles et ne seront pas partagées
        </motion.p>
      </div>
    </div>
  );
}

