'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Phone, User, Building2, Car, Home, HeartPulse, ShieldAlert, Plane, Scale, Truck, Store, Users, Anchor, TrendingUp, GraduationCap, Landmark, Flower2, ChevronDown } from 'lucide-react';

const categories = [
  { id: 'particuliers', label: 'Particuliers', Icon: User, desc: 'Auto, Habitation, Santé...' },
  { id: 'professionnelles', label: 'Professionnelles', Icon: Building2, desc: 'Entreprises, Sociétés' },
  { id: 'vie', label: 'Assurance Vie', Icon: TrendingUp, desc: 'Retraite, Épargne, Prévoyance' },
];

const produitsParCategorie: Record<string, { id: string; nom: string; Icon: any }[]> = {
  particuliers: [
    { id: 'automobile', nom: 'Assurance Automobile', Icon: Car },
    { id: 'habitation', nom: 'Assurance Habitation', Icon: Home },
    { id: 'sante', nom: 'Santé Individuelle', Icon: HeartPulse },
    { id: 'accident', nom: 'Individuelle Accident', Icon: ShieldAlert },
    { id: 'voyage', nom: 'Assurance Voyage', Icon: Plane },
    { id: 'rc', nom: 'Responsabilité Civile', Icon: Scale },
  ],
  professionnelles: [
    { id: 'flotte', nom: 'Automobile Flotte', Icon: Truck },
    { id: 'multirisque', nom: 'Multirisque Pro', Icon: Store },
    { id: 'sante-groupe', nom: 'Santé Groupe', Icon: Users },
    { id: 'rc-pro', nom: 'RC Professionnelle', Icon: Scale },
    { id: 'maritime', nom: 'Assurance Maritime', Icon: Anchor },
  ],
  vie: [
    { id: 'retraite', nom: 'Assurance Retraite', Icon: TrendingUp },
    { id: 'etude', nom: 'Étude Plus', Icon: GraduationCap },
    { id: 'emprunteur', nom: 'Vie Emprunteur', Icon: Landmark },
    { id: 'funeraire', nom: 'Assistance Funéraire', Icon: Flower2 },
  ],
};

const pays = [
  { code: 'CI', label: "Côte d'Ivoire", indicatif: '+225', flag: '🇨🇮' },
  { code: 'SN', label: 'Sénégal', indicatif: '+221', flag: '🇸🇳' },
  { code: 'ML', label: 'Mali', indicatif: '+223', flag: '🇲🇱' },
  { code: 'BF', label: 'Burkina Faso', indicatif: '+226', flag: '🇧🇫' },
  { code: 'GN', label: 'Guinée', indicatif: '+224', flag: '🇬🇳' },
  { code: 'TG', label: 'Togo', indicatif: '+228', flag: '🇹🇬' },
  { code: 'BJ', label: 'Bénin', indicatif: '+229', flag: '🇧🇯' },
  { code: 'NE', label: 'Niger', indicatif: '+227', flag: '🇳🇪' },
  { code: 'CM', label: 'Cameroun', indicatif: '+237', flag: '🇨🇲' },
  { code: 'GA', label: 'Gabon', indicatif: '+241', flag: '🇬🇦' },
  { code: 'FR', label: 'France', indicatif: '+33', flag: '🇫🇷' },
  { code: 'US', label: 'États-Unis', indicatif: '+1', flag: '🇺🇸' },
];

function PhoneInput({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const [selectedPays, setSelectedPays] = useState(pays[0]);
  const [numero, setNumero] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNumeroChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNumero(val);
    onChange(selectedPays.indicatif + ' ' + val);
  };

  const handleSelectPays = (p: typeof pays[0]) => {
    setSelectedPays(p);
    setOpen(false);
    onChange(p.indicatif + ' ' + numero);
  };

  const isFilled = numero.length > 0;

  return (
    <div
      ref={ref}
      className="flex rounded-2xl overflow-visible relative"
      style={{ border: isFilled ? "1.5px solid #2a8a8a" : "1.5px solid #e2e8f0", transition: "border-color 0.2s" }}
    >
      {/* Sélecteur pays */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 px-4 py-4 border-r flex-shrink-0 transition-all"
        style={{
          borderColor: "#e2e8f0",
          background: open ? "rgba(42,138,138,0.06)" : "#f8fbfb",
          borderRadius: "1rem 0 0 1rem",
          minWidth: "100px",
        }}
      >
        <span className="text-xl leading-none">{selectedPays.flag}</span>
        <span className="text-sm font-semibold" style={{ color: "#1a2e5a" }}>{selectedPays.indicatif}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} style={{ color: "#2a8a8a" }} strokeWidth={2.2} />
        </motion.div>
      </button>

      {/* Input numéro */}
      <input
        type="tel"
        value={numero}
        onChange={handleNumeroChange}
        placeholder="XX XX XX XX XX"
        className="flex-1 px-4 py-4 text-sm focus:outline-none bg-white"
        style={{ borderRadius: "0 1rem 1rem 0", color: "#1a2e5a" }}
      />

      {/* Dropdown pays */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute left-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50"
            style={{ background: "#fff", border: "1.5px solid #e2e8f0", boxShadow: "0 16px 40px rgba(26,46,90,0.14)" }}
          >
            <div className="p-2 max-h-64 overflow-y-auto">
              {pays.map((p, i) => {
                const isSelected = p.code === selectedPays.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleSelectPays(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
                    style={{
                      background: isSelected ? "rgba(42,138,138,0.08)" : "transparent",
                      color: isSelected ? "#2a8a8a" : "#1a2e5a",
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span className="text-xl leading-none">{p.flag}</span>
                    <span className="flex-1">{p.label}</span>
                    <span className="font-semibold text-xs" style={{ color: "#2a8a8a" }}>{p.indicatif}</span>
                    {isSelected && <Check size={14} style={{ color: "#2a8a8a" }} strokeWidth={2.5} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold mb-4" style={{ backgroundColor: "rgba(42,138,138,0.1)", color: "#2a8a8a", border: "1px solid rgba(42,138,138,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            Réponse sous 48h maximum
          </div>
          <h1 className="text-5xl font-bold mb-4" style={{ color: "#1a2e5a" }}>Obtenez votre Devis Gratuit</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
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
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all"
                    style={{
                      background: step >= s.num ? "linear-gradient(135deg, #1a2e5a, #2a8a8a)" : "#f1f5f9",
                      color: step >= s.num ? "#fff" : "#94a3b8",
                      boxShadow: step >= s.num ? "0 4px 15px rgba(26,46,90,0.25)" : "none",
                    }}
                  >
                    {step > s.num ? <Check size={22} /> : s.num}
                  </div>
                  <span className="mt-2 text-sm font-medium" style={{ color: step >= s.num ? "#1a2e5a" : "#94a3b8" }}>
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className="flex-1 h-1 mx-4 rounded transition-all" style={{ background: step > s.num ? "linear-gradient(90deg, #1a2e5a, #2a8a8a)" : "#e2e8f0" }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">

          {/* ÉTAPE 1 */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold text-center mb-3" style={{ color: "#1a2e5a" }}>
                Quel type d&apos;assurance recherchez-vous ?
              </h2>
              <p className="text-center text-gray-400 mb-10">Sélectionnez la catégorie qui correspond à votre besoin</p>

              <div className="grid md:grid-cols-3 gap-6">
                {categories.map((cat) => {
                  const isSelected = formData.categorie === cat.id;
                  return (
                    <motion.div
                      key={cat.id}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => updateField('categorie', cat.id)}
                      className="rounded-3xl p-8 text-center cursor-pointer transition-all"
                      style={{
                        border: isSelected ? "2px solid #2a8a8a" : "2px solid #e2e8f0",
                        background: isSelected ? "linear-gradient(135deg, rgba(26,46,90,0.04), rgba(42,138,138,0.06))" : "#fff",
                        boxShadow: isSelected ? "0 8px 30px rgba(42,138,138,0.15)" : "none",
                      }}
                    >
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                        style={{ background: isSelected ? "linear-gradient(135deg, #1a2e5a, #2a8a8a)" : "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}
                      >
                        <cat.Icon size={28} color={isSelected ? "#fff" : "#2a8a8a"} strokeWidth={1.6} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2" style={{ color: "#1a2e5a" }}>{cat.label}</h3>
                      <p className="text-gray-400 text-sm">{cat.desc}</p>
                      {isSelected && (
                        <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold text-white" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                          <Check size={12} /> Sélectionné
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex justify-end mt-10">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canGoToStep2}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all"
                  style={{
                    background: canGoToStep2 ? "linear-gradient(135deg, #1a2e5a, #2a8a8a)" : "#e2e8f0",
                    color: canGoToStep2 ? "#fff" : "#94a3b8",
                    cursor: canGoToStep2 ? "pointer" : "not-allowed",
                    boxShadow: canGoToStep2 ? "0 8px 25px rgba(26,46,90,0.25)" : "none",
                  }}
                >
                  Continuer <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 2 */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-3xl font-bold text-center mb-3" style={{ color: "#1a2e5a" }}>
                Précisez votre besoin
              </h2>
              <p className="text-center text-gray-400 mb-10">Choisissez un produit et renseignez vos coordonnées</p>

              <div className="mb-10">
                <label className="block text-sm font-semibold mb-4 tracking-wide uppercase" style={{ color: "#1a2e5a" }}>Produit souhaité</label>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {produitsParCategorie[formData.categorie]?.map((prod) => {
                    const isSelected = formData.produit === prod.id;
                    return (
                      <motion.div
                        key={prod.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => updateField('produit', prod.id)}
                        className="rounded-2xl p-4 cursor-pointer transition-all flex items-center gap-3"
                        style={{
                          border: isSelected ? "2px solid #2a8a8a" : "2px solid #e2e8f0",
                          background: isSelected ? "rgba(42,138,138,0.05)" : "#fff",
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: isSelected ? "linear-gradient(135deg, #1a2e5a, #2a8a8a)" : "#f1f5f9" }}
                        >
                          <prod.Icon size={18} color={isSelected ? "#fff" : "#2a8a8a"} strokeWidth={1.6} />
                        </div>
                        <span className="font-medium text-sm" style={{ color: "#1a2e5a" }}>{prod.nom}</span>
                        {isSelected && <Check className="ml-auto flex-shrink-0" size={18} style={{ color: "#2a8a8a" }} />}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Nom + Prénom */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Nom *</label>
                  <input
                    type="text"
                    value={formData.nom}
                    onChange={(e) => updateField('nom', e.target.value)}
                    className="w-full rounded-2xl px-5 py-4 focus:outline-none text-sm transition-all"
                    style={{ border: formData.nom ? "1.5px solid #2a8a8a" : "1.5px solid #e2e8f0" }}
                    onFocus={e => e.target.style.border = "1.5px solid #2a8a8a"}
                    onBlur={e => { e.target.style.border = formData.nom ? "1.5px solid #2a8a8a" : "1.5px solid #e2e8f0"; }}
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Prénom</label>
                  <input
                    type="text"
                    value={formData.prenom}
                    onChange={(e) => updateField('prenom', e.target.value)}
                    className="w-full rounded-2xl px-5 py-4 focus:outline-none text-sm transition-all"
                    style={{ border: "1.5px solid #e2e8f0" }}
                    onFocus={e => e.target.style.border = "1.5px solid #2a8a8a"}
                    onBlur={e => { e.target.style.border = "1.5px solid #e2e8f0"; }}
                    placeholder="Votre prénom"
                  />
                </div>
              </div>

              {/* Téléphone avec indicatif pays + Email */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Téléphone *</label>
                  <PhoneInput value={formData.telephone} onChange={(val) => updateField('telephone', val)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full rounded-2xl px-5 py-4 focus:outline-none text-sm transition-all"
                    style={{ border: "1.5px solid #e2e8f0" }}
                    onFocus={e => e.target.style.border = "1.5px solid #2a8a8a"}
                    onBlur={e => { e.target.style.border = "1.5px solid #e2e8f0"; }}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {formData.categorie === 'professionnelles' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Nom de l&apos;entreprise</label>
                  <input
                    type="text"
                    value={formData.entreprise}
                    onChange={(e) => updateField('entreprise', e.target.value)}
                    className="w-full rounded-2xl px-5 py-4 focus:outline-none text-sm transition-all"
                    style={{ border: "1.5px solid #e2e8f0" }}
                    onFocus={e => e.target.style.border = "1.5px solid #2a8a8a"}
                    onBlur={e => { e.target.style.border = "1.5px solid #e2e8f0"; }}
                    placeholder="Nom de votre société"
                  />
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-600 mb-2">Message (optionnel)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  rows={4}
                  className="w-full rounded-2xl px-5 py-4 focus:outline-none resize-none text-sm transition-all"
                  style={{ border: "1.5px solid #e2e8f0" }}
                  onFocus={e => e.target.style.border = "1.5px solid #2a8a8a"}
                  onBlur={e => { e.target.style.border = "1.5px solid #e2e8f0"; }}
                  placeholder="Décrivez votre besoin..."
                />
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-gray-500 hover:bg-gray-50 transition text-sm">
                  <ArrowLeft size={18} /> Retour
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canGoToStep3}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all"
                  style={{
                    background: canGoToStep3 ? "linear-gradient(135deg, #1a2e5a, #2a8a8a)" : "#e2e8f0",
                    color: canGoToStep3 ? "#fff" : "#94a3b8",
                    cursor: canGoToStep3 ? "pointer" : "not-allowed",
                    boxShadow: canGoToStep3 ? "0 8px 25px rgba(26,46,90,0.25)" : "none",
                  }}
                >
                  Continuer <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ÉTAPE 3 */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, rgba(42,138,138,0.15), rgba(26,46,90,0.1))", border: "2px solid rgba(42,138,138,0.3)" }}>
                <Check size={44} style={{ color: "#2a8a8a" }} strokeWidth={2.5} />
              </div>
              <h2 className="text-4xl font-bold mb-4" style={{ color: "#1a2e5a" }}>Demande envoyée !</h2>
              <p className="text-xl text-gray-500 mb-8">
                Merci <strong style={{ color: "#1a2e5a" }}>{formData.nom}</strong>. Un conseiller KARHON vous contactera sous 48h au{" "}
                <strong style={{ color: "#2a8a8a" }}>{formData.telephone}</strong>.
              </p>

              <div className="rounded-2xl p-8 mb-8 max-w-lg mx-auto text-left" style={{ background: "linear-gradient(135deg, rgba(26,46,90,0.04), rgba(42,138,138,0.06))", border: "1px solid rgba(42,138,138,0.2)" }}>
                <h3 className="font-bold text-lg mb-4" style={{ color: "#1a2e5a" }}>Récapitulatif de votre demande</h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span className="font-medium">Catégorie</span>
                    <span style={{ color: "#1a2e5a" }}>{categories.find(c => c.id === formData.categorie)?.label}</span>
                  </div>
                  <div className="h-px bg-gray-100" />
                  <div className="flex justify-between">
                    <span className="font-medium">Produit</span>
                    <span style={{ color: "#1a2e5a" }}>{produitsParCategorie[formData.categorie]?.find(p => p.id === formData.produit)?.nom}</span>
                  </div>
                  {formData.entreprise && (
                    <>
                      <div className="h-px bg-gray-100" />
                      <div className="flex justify-between">
                        <span className="font-medium">Entreprise</span>
                        <span style={{ color: "#1a2e5a" }}>{formData.entreprise}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="tel:+2250787103939" className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", boxShadow: "0 8px 25px rgba(26,46,90,0.25)" }}>
                  <Phone size={18} /> Appeler maintenant
                </a>
                <a href="/produits" className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all hover:scale-105" style={{ border: "2px solid #2a8a8a", color: "#2a8a8a" }}>
                  Voir d&apos;autres produits
                </a>
              </div>
            </motion.div>
          )}
        </div>

        {/* Contact Rapide */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12 text-center">
          <p className="text-gray-400 mb-3 text-sm font-medium tracking-wide uppercase">Une question urgente ?</p>
          <a href="tel:+2250787103939" className="inline-flex items-center gap-3 text-2xl font-bold transition-all hover:scale-105" style={{ color: "#1a2e5a" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
              <Phone size={18} style={{ color: "#2a8a8a" }} strokeWidth={1.6} />
            </div>
            +225 07 87 10 39 39
          </a>
          <p className="text-gray-400 mt-2 text-sm">Ou écrivez-nous à infos@karhonassurance.com</p>
        </motion.div>
      </div>
    </div>
  );
}