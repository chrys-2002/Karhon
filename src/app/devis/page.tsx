'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft, Phone, User, Building2, Car, Home, HeartPulse, ShieldAlert, Plane, Scale, Truck, Store, Anchor, TrendingUp, GraduationCap, Landmark, Flower2, ChevronDown, ShieldCheck, AlertCircle, Globe, CalendarClock, Cake } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import DocumentUpload from '@/components/ui/DocumentUpload';
import FormulaireDynamique from '@/components/ui/FormulaireDynamique';
import { formulaireDe, type Reponses } from '@/lib/formulaires';

// Produits automobiles → on demande la carte grise + la visite technique.
const PRODUITS_AUTO = ['Assurance Automobile', 'Automobile Flotte'];

// Produit voyage → on demande passeport + destination, durée et âge de l'assuré.
const PRODUIT_VOYAGE = 'Assurance Voyage';

const categories = [
  { id: 'particuliers', label: 'Particuliers', Icon: User, desc: 'Auto, Habitation, Santé...' },
  { id: 'professionnelles', label: 'Professionnelles', Icon: Building2, desc: 'Entreprises, Sociétés' },
  { id: 'vie', label: 'Assurance Vie', Icon: TrendingUp, desc: 'Retraite, Épargne, Prévoyance' },
];

// Produit tel que renvoyé par l'API /api/produits (source de vérité = base).
type ProduitDB = { id: string; nom: string; type: string; categorie: string };

// Icône d'illustration associée à chaque produit, par nom.
// (Le catalogue vient de la base ; seules les icônes restent côté front.)
const ICONS: Record<string, LucideIcon> = {
  'Assurance Automobile': Car,
  'Assurance Habitation': Home,
  'Assurance Santé': HeartPulse,
  'Individuelle Accident': ShieldAlert,
  'Assurance Voyage': Plane,
  'Responsabilité Civile': Scale,
  'Automobile Flotte': Truck,
  'Multirisque Pro': Store,
  'RC Professionnelle': Scale,
  'Assurance Maritime': Anchor,
  'Assurance Retraite': TrendingUp,
  'Étude Plus': GraduationCap,
  'Vie Emprunteur': Landmark,
  'Assistance Funéraire': Flower2,
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
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [produitsDB, setProduitsDB] = useState<ProduitDB[]>([]);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  // Pièces jointes pour un devis automobile.
  const [docCarteGrise, setDocCarteGrise] = useState<string[]>([]);
  const [docVisite, setDocVisite] = useState<string[]>([]);
  // Pièce jointe pour un devis voyage (copie du passeport).
  const [docPasseport, setDocPasseport] = useState<string[]>([]);
  // Réponses au questionnaire spécifique du produit (formulaire dynamique).
  const [reponses, setReponses] = useState<Reponses>({});
  const [formData, setFormData] = useState({
    categorie: '',
    produit: '', // contient désormais l'ID réel du produit en base (cuid)
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    entreprise: '',
    message: '',
    // Champs spécifiques au produit Voyage.
    destination: '',
    duree: '',
    ageAssure: '',
  });

  // Charge le catalogue réel depuis la base au montage de la page.
  useEffect(() => {
    let annule = false;
    fetch('/api/produits')
      .then((res) => res.json())
      .then((data) => {
        if (!annule && Array.isArray(data.produits)) setProduitsDB(data.produits);
      })
      .catch(() => {/* le catalogue restera vide ; géré à l'affichage */});
    return () => { annule = true; };
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Produits de la catégorie sélectionnée (depuis la base).
  const produitsCategorie = produitsDB.filter(p => p.categorie === formData.categorie);
  const produitChoisi = produitsDB.find(p => p.id === formData.produit);
  const estAuto = !!produitChoisi && PRODUITS_AUTO.includes(produitChoisi.nom);
  const estVoyage = !!produitChoisi && produitChoisi.nom === PRODUIT_VOYAGE;

  const canGoToStep2 = formData.categorie !== '';
  // Pour un voyage, destination, durée et âge sont requis.
  const voyageComplet = !estVoyage || (formData.destination !== '' && formData.duree !== '' && formData.ageAssure !== '' && docPasseport.length > 0);
  // Pour l'auto, la carte grise et la visite technique sont obligatoires.
  const autoComplet = !estAuto || (docCarteGrise.length > 0 && docVisite.length > 0);

  // Questionnaire spécifique au produit choisi (formulaire dynamique).
  const champsProduit = formulaireDe(produitChoisi?.nom);
  // Toutes les questions requises du produit doivent être renseignées.
  const questionnaireComplet = champsProduit
    .filter((c) => c.requis)
    .every((c) => {
      const v = reponses[c.id];
      return Array.isArray(v) ? v.length > 0 : !!(v && String(v).trim());
    });

  const canGoToStep3 =
    formData.produit !== '' && formData.nom !== '' && formData.telephone !== '' &&
    voyageComplet && autoComplet && questionnaireComplet;

  // Envoi réel : crée un devis en base via l'API (connexion obligatoire).
  const envoyerDevis = async () => {
    if (envoi) return;
    setErreur('');
    setEnvoi(true);
    try {
      // Description lisible pour le conseiller (les coordonnées saisies
      // complètent le compte client déjà rattaché côté serveur).
      const lignes = [
        `Demandeur : ${formData.prenom} ${formData.nom}`.trim(),
        `Téléphone : ${formData.telephone}`,
        formData.email ? `Email : ${formData.email}` : '',
        formData.entreprise ? `Entreprise : ${formData.entreprise}` : '',
        // Détails spécifiques au voyage.
        estVoyage ? `Destination : ${formData.destination}` : '',
        estVoyage ? `Durée du séjour : ${formData.duree} jour(s)` : '',
        estVoyage ? `Âge de l'assuré : ${formData.ageAssure} an(s)` : '',
        formData.message ? `Message : ${formData.message}` : '',
      ].filter(Boolean);

      // Pièces jointes au format "Libellé|url" selon le produit.
      const documents: string[] = [];
      if (estAuto) {
        docCarteGrise.forEach((u) => documents.push(`Carte grise|${u}`));
        docVisite.forEach((u) => documents.push(`Visite technique|${u}`));
      }
      if (estVoyage) {
        docPasseport.forEach((u) => documents.push(`Passeport|${u}`));
      }

      // Réponses au questionnaire : on ne garde que les champs du produit
      // courant et qui ont une valeur (libellé lisible → valeur).
      const reponsesProduit: Record<string, string> = {};
      for (const c of champsProduit) {
        const v = reponses[c.id];
        const texte = Array.isArray(v) ? v.join(', ') : (v ?? '');
        if (texte && String(texte).trim()) reponsesProduit[c.label] = String(texte);
      }

      // Catégorie de souscription déduite AUTOMATIQUEMENT du choix du client
      // (étape 1) : « Professionnelles » → professionnel (flotte) ; sinon
      // particulier (les assurances Vie relèvent de l'usage personnel).
      const segment = formData.categorie === 'professionnelles' ? 'professionnel' : 'particulier';

      const res = await fetch('/api/devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          produitId: formData.produit,
          description: lignes.join('\n'),
          documents,
          reponses: Object.keys(reponsesProduit).length ? reponsesProduit : undefined,
          telephoneContact: formData.telephone || undefined,
          segment,
        }),
      });

      if (res.status === 401) {
        // Non connecté : on redirige vers l'espace client pour se connecter.
        setErreur("Vous devez être connecté pour envoyer une demande. Redirection…");
        setTimeout(() => router.push('/client'), 1500);
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErreur(data.erreur || "Une erreur est survenue. Réessayez.");
        return;
      }
      setStep(3); // succès
    } catch {
      setErreur("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">

        <div className="mb-6">
          {/* Recule d'une étape ; à l'étape 1, quitte la page normalement. */}
          <BackButton
            label="Retour"
            onClick={step > 1 ? () => setStep((s) => Math.max(1, s - 1)) : undefined}
          />
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4" style={{ color: "#1a2e5a" }}>Obtenez votre Cotation Gratuite</h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Remplissez ce formulaire en 3 étapes. Un conseiller{" "}
            <strong style={{ color: "#1a2e5a" }}>KARHON Assurances</strong>{" "}
            vous{" "}contactera rapidement.
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
                      onClick={() => setFormData(prev => ({ ...prev, categorie: cat.id, produit: '' }))}
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
                {produitsCategorie.length === 0 ? (
                  <p className="text-sm text-gray-400">Chargement des produits…</p>
                ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {produitsCategorie.map((prod) => {
                    const isSelected = formData.produit === prod.id;
                    const Icon = ICONS[prod.nom] ?? ShieldCheck;
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
                          <Icon size={18} color={isSelected ? "#fff" : "#2a8a8a"} strokeWidth={1.6} />
                        </div>
                        <span className="font-medium text-sm" style={{ color: "#1a2e5a" }}>{prod.nom}</span>
                        {isSelected && <Check className="ml-auto flex-shrink-0" size={18} style={{ color: "#2a8a8a" }} />}
                      </motion.div>
                    );
                  })}
                </div>
                )}
              </div>

              {/* Pièces du véhicule — affichées uniquement pour un produit auto */}
              {estAuto && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 rounded-2xl p-5 space-y-5"
                  style={{ background: "#fbfdfd", border: "1.5px solid #e6f0f0" }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Car size={18} style={{ color: "#2a8a8a" }} />
                      <h3 className="text-sm font-bold" style={{ color: "#1a2e5a" }}>Documents du véhicule</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Joignez votre carte grise et votre visite technique (PDF ou image). Vous pouvez les prendre en photo depuis votre mobile.
                    </p>
                  </div>
                  <DocumentUpload label="Carte grise" value={docCarteGrise} onChange={setDocCarteGrise} required />
                  <DocumentUpload label="Visite technique" value={docVisite} onChange={setDocVisite} required />
                </motion.div>
              )}

              {/* Informations voyage — affichées uniquement pour l'assurance voyage */}
              {estVoyage && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 rounded-2xl p-5 space-y-5"
                  style={{ background: "#fbfdfd", border: "1.5px solid #e6f0f0" }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Plane size={18} style={{ color: "#2a8a8a" }} />
                      <h3 className="text-sm font-bold" style={{ color: "#1a2e5a" }}>Informations du voyage</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Ces détails nous permettent de calculer une offre adaptée à votre séjour.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-5">
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
                        <Globe size={14} style={{ color: "#2a8a8a" }} /> Destination *
                      </label>
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => updateField('destination', e.target.value)}
                        className="w-full rounded-2xl px-4 py-3.5 focus:outline-none text-sm transition-all"
                        style={{ border: formData.destination ? "1.5px solid #2a8a8a" : "1.5px solid #e2e8f0" }}
                        onFocus={e => e.target.style.border = "1.5px solid #2a8a8a"}
                        onBlur={e => { e.target.style.border = formData.destination ? "1.5px solid #2a8a8a" : "1.5px solid #e2e8f0"; }}
                        placeholder="Ex. France, Maroc, Dubaï…"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
                        <CalendarClock size={14} style={{ color: "#2a8a8a" }} /> Durée (jours) *
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={formData.duree}
                        onChange={(e) => updateField('duree', e.target.value)}
                        className="w-full rounded-2xl px-4 py-3.5 focus:outline-none text-sm transition-all"
                        style={{ border: formData.duree ? "1.5px solid #2a8a8a" : "1.5px solid #e2e8f0" }}
                        onFocus={e => e.target.style.border = "1.5px solid #2a8a8a"}
                        onBlur={e => { e.target.style.border = formData.duree ? "1.5px solid #2a8a8a" : "1.5px solid #e2e8f0"; }}
                        placeholder="Ex. 15"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-600 mb-2">
                        <Cake size={14} style={{ color: "#2a8a8a" }} /> Âge de l&apos;assuré *
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={formData.ageAssure}
                        onChange={(e) => updateField('ageAssure', e.target.value)}
                        className="w-full rounded-2xl px-4 py-3.5 focus:outline-none text-sm transition-all"
                        style={{ border: formData.ageAssure ? "1.5px solid #2a8a8a" : "1.5px solid #e2e8f0" }}
                        onFocus={e => e.target.style.border = "1.5px solid #2a8a8a"}
                        onBlur={e => { e.target.style.border = formData.ageAssure ? "1.5px solid #2a8a8a" : "1.5px solid #e2e8f0"; }}
                        placeholder="Ex. 34"
                      />
                    </div>
                  </div>

                  <DocumentUpload
                    label="Copie du passeport"
                    hint="Photographiez ou importez la page principale de votre passeport (PNG ou JPG)."
                    value={docPasseport}
                    onChange={setDocPasseport}
                    required
                  />
                </motion.div>
              )}

              {/* Questionnaire spécifique au produit (formulaire dynamique) */}
              {champsProduit.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-8 rounded-2xl p-5"
                  style={{ background: "#fbfdfd", border: "1.5px solid #e6f0f0" }}
                >
                  <div className="mb-5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} style={{ color: "#2a8a8a" }} />
                      <h3 className="text-sm font-bold" style={{ color: "#1a2e5a" }}>Informations pour votre {produitChoisi?.nom}</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Ces précisions permettent à nos conseillers de négocier la meilleure offre auprès des compagnies partenaires.</p>
                  </div>
                  <FormulaireDynamique champs={champsProduit} valeurs={reponses} onChange={setReponses} />
                </motion.div>
              )}

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

              {erreur && (
                <div className="flex items-center gap-2 mb-6 px-5 py-3 rounded-2xl text-sm" style={{ background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.25)", color: "#b91c1c" }}>
                  <AlertCircle size={16} className="flex-shrink-0" />
                  {erreur}
                </div>
              )}

              <div
                className="flex items-start gap-3 mb-6 px-5 py-4 rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, rgba(26,46,90,0.05), rgba(42,138,138,0.09))",
                  border: "1.5px solid rgba(42,138,138,0.35)",
                }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                  <ShieldCheck size={18} color="#fff" strokeWidth={2} />
                </div>
                <div className="text-sm">
                  <p className="font-bold" style={{ color: "#1a2e5a" }}>Connexion requise</p>
                  <p className="text-gray-500 mt-0.5">
                    Vous devez être connecté à votre espace client pour envoyer la demande.{" "}
                    <a href="/client" className="font-semibold underline" style={{ color: "#2a8a8a" }}>
                      Se connecter
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-gray-500 hover:bg-gray-50 transition text-sm">
                  <ArrowLeft size={18} /> Retour
                </button>
                <button
                  onClick={envoyerDevis}
                  disabled={!canGoToStep3 || envoi}
                  className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-lg transition-all"
                  style={{
                    background: canGoToStep3 && !envoi ? "linear-gradient(135deg, #1a2e5a, #2a8a8a)" : "#e2e8f0",
                    color: canGoToStep3 && !envoi ? "#fff" : "#94a3b8",
                    cursor: canGoToStep3 && !envoi ? "pointer" : "not-allowed",
                    boxShadow: canGoToStep3 && !envoi ? "0 8px 25px rgba(26,46,90,0.25)" : "none",
                  }}
                >
                  {envoi ? "Envoi…" : <>Envoyer ma demande <ArrowRight size={20} /></>}
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
                Merci <strong style={{ color: "#1a2e5a" }}>{formData.nom}</strong>. Un conseiller{" "}
                <strong style={{ color: "#1a2e5a" }}>KARHON Assurances</strong>{" "}
                <span className="whitespace-nowrap">vous contactera</span> au{" "}
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
                    <span style={{ color: "#1a2e5a" }}>{produitChoisi?.nom}</span>
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
                <a href="/client/dashboard" className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-semibold transition-all hover:scale-105" style={{ border: "2px solid #2a8a8a", color: "#2a8a8a" }}>
                  Voir mes cotations
                </a>
              </div>
            </motion.div>
          )}
        </div>

        {/* Contact Rapide */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-12 text-center">
          <p className="text-gray-400 mb-3 text-sm font-medium tracking-wide uppercase">Une question urgente ?</p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 justify-center items-center">
            <a href="tel:+2250787103939" className="inline-flex items-center gap-3 text-2xl font-bold transition-all hover:scale-105" style={{ color: "#1a2e5a" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <Phone size={18} style={{ color: "#2a8a8a" }} strokeWidth={1.6} />
              </div>
              +225 07 87 10 39 39
            </a>
            <a href="tel:+2250576367272" className="inline-flex items-center gap-3 text-2xl font-bold transition-all hover:scale-105" style={{ color: "#1a2e5a" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <Phone size={18} style={{ color: "#2a8a8a" }} strokeWidth={1.6} />
              </div>
              +225 05 76 36 72 72
            </a>
          </div>
          <p className="text-gray-400 mt-2 text-sm">Ou écrivez-nous à infos@karhonassurance.com</p>
        </motion.div>
      </div>
    </div>
  );
}