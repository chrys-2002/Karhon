'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Send, Phone, Mail } from 'lucide-react';

const categories = [
  { id: 'particuliers', label: 'Particuliers', icon: '👤', desc: 'Auto, Habitation, Santé...' },
  { id: 'professionnelles', label: 'Professionnelles', icon: '🏢', desc: 'Entreprises, Sociétés' },
  { id: 'vie', label: 'Assurance Vie', icon: '❤️', desc: 'Retraite, Épargne, Prévoyance' },
];

const produitsParCategorie: Record<string, { id: string; nom: string; icon: string }[]> = {
  particuliers: [
    { id: 'automobile', nom: 'Assurance Automobile', icon: '🚗' },
    { id: 'habitation', nom: 'Assurance Habitation', icon: '🏠' },
    { id: 'sante', nom: 'Santé Individuelle', icon: '🩺' },
    { id: 'accident', nom: 'Individuelle Accident', icon: '🛡️' },
    { id: 'voyage', nom: 'Assurance Voyage', icon: '✈️' },
    { id: 'rc', nom: 'Responsabilité Civile', icon: '⚖️' },
  ],
  professionnelles: [
    { id: 'flotte', nom: 'Automobile Flotte', icon: '🚛' },
    { id: 'multirisque', nom: 'Multirisque Pro', icon: '🏪' },
    { id: 'sante-groupe', nom: 'Santé Groupe', icon: '👥' },
    { id: 'rc-pro', nom: 'RC Professionnelle', icon: '⚖️' },
    { id: 'maritime', nom: 'Assurance Maritime', icon: '⚓' },
  ],
  vie: [
    { id: 'retraite', nom: 'Assurance Retraite', icon: '📈' },
    { id: 'etude', nom: 'Étude Plus', icon: '🎓' },
    { id: 'emprunteur', nom: 'Vie Emprunteur', icon: '🏦' },
    { id: 'funeraire', nom: 'Assistance Funéraire', icon: '🕊️' },
  ],
};

export default function DevisPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    categorie: '',
    produit: '',
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    entreprise: '',
    message: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canGoToStep2 = formData.categorie !== '';
  const canGoToStep3 = formData.produit !== '' && formData.nom !== '' && formData.telephone !== '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-block bg-orange-100 text-orange-700 px-6 py-2 rounded-full text-sm font-medium mb-4">
            ⚡ Réponse sous 48h maximum
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Obtenez votre Devis Gratuit</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Remplissez ce formulaire en 3 étapes. Un conseiller KARHON vous contactera rapidement.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
          <div className="flex justify-between items-center">
            {[
              { num: 1, label: 'Catégorie' },
              { num: 2, label: 'Produit & Infos' },
              { num: 3, label: 'Confirmation' },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all ${
                      step >= s.num 
                        ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {step > s.num ? <Check size={24} /> : s.num}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${step >= s.num ? 'text-blue-900' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${step > s.num ? 'bg-blue-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* ÉTAPE 1 : Catégorie */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
                Quel type d&apos;assurance recherchez-vous ?
              </h2>
              <p className="text-center text-gray-500 mb-10">Sélectionnez la catégorie qui correspond à votre besoin</p>
              
              <div className="grid md:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <motion.div
                    key={cat.id}
                    whileHover={{ scale: 1.03, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateField('categorie', cat.id)}
                    className={`border-2 rounded-3xl p-8 text-center cursor-pointer transition-all ${
                      formData.categorie === cat.id
                        ? 'border-blue-600 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-6xl mb-4">{cat.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{cat.label}</h3>
                    <p className="text-gray-500 text-sm">{cat.desc}</p>
                    {formData.categorie === cat.id && (
                      <div className="mt-4 inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm">
                        Sélectionné ✓
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-end mt-10">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canGoToStep2}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                    canGoToStep2
                      ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continuer <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 2 : Produit + Infos */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold text-center mb-4 text-gray-900">
                Précisez votre besoin
              </h2>
              <p className="text-center text-gray-500 mb-10">Choisissez un produit et renseignez vos coordonnées</p>

              {/* Sélection Produit */}
              <div className="mb-10">
                <label className="block text-lg font-semibold mb-4 text-gray-800">Produit souhaité</label>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {produitsParCategorie[formData.categorie]?.map((prod) => (
                    <motion.div
                      key={prod.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateField('produit', prod.id)}
                      className={`border-2 rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-3 ${
                        formData.produit === prod.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-3xl">{prod.icon}</span>
                      <span className="font-medium">{prod.nom}</span>
                      {formData.produit === prod.id && (
                        <Check className="ml-auto text-blue-600" size={20} />
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Coordonnées */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => updateField('nom', e.target.value)}
                    className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => updateField('prenom', e.target.value)}
                    className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone *</label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => updateField('telephone', e.target.value)}
                    className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="+225 XX XX XX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {formData.categorie === 'professionnelles' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l&apos;entreprise</label>
                  <input
                    type="text"
                    value={formData.entreprise}
                    onChange={(e) => updateField('entreprise', e.target.value)}
                    className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    placeholder="Nom de votre société"
                  />
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (optionnel)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
                  placeholder="Décrivez votre besoin..."
                />
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-gray-600 hover:bg-gray-100 transition"
                >
                  <ArrowLeft size={20} /> Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canGoToStep3}
                  className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all ${
                    canGoToStep3
                      ? 'bg-gradient-to-r from-blue-900 to-blue-700 text-white hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Continuer <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 3 : Confirmation */}
          {step === 3 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="text-green-600" size={48} />
              </div>
              
              <h2 className="text-4xl font-bold text-green-600 mb-4">Demande envoyée !</h2>
              <p className="text-xl text-gray-600 mb-8">
                Merci <strong>{formData.nom}</strong>. Un conseiller KARHON vous contactera sous 48h au 
                <strong> {formData.telephone}</strong>.
              </p>

              <div className="bg-blue-50 rounded-2xl p-8 mb-8 max-w-lg mx-auto">
                <h3 className="font-bold text-lg mb-4 text-blue-900">Récapitulatif de votre demande</h3>
                <div className="text-left space-y-3 text-gray-700">
                  <p><strong>Catégorie :</strong> {categories.find(c => c.id === formData.categorie)?.label}</p>
                  <p><strong>Produit :</strong> {produitsParCategorie[formData.categorie]?.find(p => p.id === formData.produit)?.nom}</p>
                  {formData.entreprise && <p><strong>Entreprise :</strong> {formData.entreprise}</p>}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:+2250707108743"
                  className="flex items-center justify-center gap-3 bg-green-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-green-700 transition"
                >
                  <Phone size={20} /> Appeler maintenant
                </a>
                <a 
                  href="/produits"
                  className="flex items-center justify-center gap-3 border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-blue-50 transition"
                >
                  Voir d&apos;autres produits
                </a>
              </div>
            </motion.div>
          )}
        </div>

        {/* Contact Rapide */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600 mb-4">Une question urgente ?</p>
          <a href="tel:+2250707108743" className="text-3xl font-bold text-blue-900 hover:text-orange-600 transition">
            📞 +225 07 87 10 39 39
          </a>
          <p className="text-gray-500 mt-2">Ou écrivez-nous à infos@karhonassurance.com</p>
        </motion.div>
      </div>
    </div>
  );
}