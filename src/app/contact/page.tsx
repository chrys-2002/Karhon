'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  MapPin,
  Clock,
  Mail,
  CheckCircle,
  Check,
  ChevronDown,
  FileText,
  ShieldAlert,
  CalendarDays,
  CircleHelp,
} from 'lucide-react';
import MapItineraire from '@/components/ui/MapItineraire';
import {
  useState,
  useRef,
  useEffect,
  type CSSProperties,
  type ChangeEvent,
  type FocusEvent,
  type FormEvent,
} from 'react';

const selectOptions = [
  {
    value: 'devis',
    label: 'Demande de devis',
    Icon: FileText,
    badge: 'linear-gradient(135deg, #2a8a8a, #1a2e5a)',
  },
  {
    value: 'sinistre',
    label: 'Déclaration de sinistre',
    Icon: ShieldAlert,
    badge: 'linear-gradient(135deg, #1a2e5a, #2a8a8a)',
  },
  {
    value: 'rendezvous',
    label: 'Prendre rendez-vous',
    Icon: CalendarDays,
    badge: 'linear-gradient(135deg, #2a8a8a, #1a2e5a)',
  },
  {
    value: 'information',
    label: "Demande d'information",
    Icon: CircleHelp,
    badge: 'linear-gradient(135deg, #1a2e5a, #2a8a8a)',
  },
];

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

function CustomSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = selectOptions.find((o) => o.value === value);
  const SelectedIcon = selected?.Icon;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full flex items-center justify-between px-5 py-4 rounded-2xl text-sm transition-all duration-200"
        style={{
          border: open || selected ? '1.5px solid #2a8a8a' : '1.5px solid #e2e8f0',
          background: '#fff',
          color: selected ? '#1a2e5a' : '#9ca3af',
          boxShadow: open ? '0 0 0 3px rgba(42,138,138,0.10)' : 'none',
        }}
      >
        <div className="flex items-center gap-3">
          {selected && SelectedIcon && (
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
              style={{ background: selected.badge }}
            >
              <SelectedIcon size={16} color="#fff" strokeWidth={2} />
            </span>
          )}
          <span className="font-medium">
            {selected ? selected.label : 'Type de demande'}
          </span>
        </div>

        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={16} style={{ color: '#2a8a8a' }} strokeWidth={2.2} />
        </motion.div>
      </button>

      {selected && (
        <div
          className="absolute left-0 top-2 bottom-2 w-1 rounded-full"
          style={{ background: 'linear-gradient(to bottom, #2a8a8a, #1a2e5a)' }}
        />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
            style={{
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 16px 40px rgba(26,46,90,0.12)',
            }}
          >
            {selectOptions.map((opt) => {
              const Icon = opt.Icon;
              const isSelected = opt.value === value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-left transition-all duration-150"
                  style={{
                    background: isSelected ? 'rgba(42,138,138,0.07)' : 'transparent',
                    color: isSelected ? '#2a8a8a' : '#1a2e5a',
                    fontWeight: isSelected ? 600 : 400,
                    borderTop: '1px solid #f1f5f9',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = '#f8fbfb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                    }
                  }}
                >
                  <span
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: isSelected ? opt.badge : 'linear-gradient(135deg, #eff8f8, #e5f1f1)',
                      boxShadow: isSelected ? '0 8px 18px rgba(42,138,138,0.18)' : 'none',
                    }}
                  >
                    <Icon size={16} color={isSelected ? '#fff' : '#2a8a8a'} strokeWidth={2} />
                  </span>

                  <span className="flex-1 font-medium">{opt.label}</span>

                  {isSelected && (
                    <CheckCircle size={15} style={{ color: '#2a8a8a' }} strokeWidth={2} />
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhoneInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [selectedPays, setSelectedPays] = useState(pays[0]);
  const [numero, setNumero] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!value) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNumero('');
      return;
    }

    const match = value.match(/^(\+\d{1,4})\s*(.*)$/);
    if (!match) return;

    const indicatif = match[1];
    const rest = match[2] ?? '';

    const paysTrouve = pays.find((p) => p.indicatif === indicatif);
    if (paysTrouve) setSelectedPays(paysTrouve);

    setNumero(rest.replace(/\s+/g, ' ').trim());
  }, [value]);

  const formatNumero = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 15);
    return digits.match(/.{1,2}/g)?.join(' ') ?? '';
  };

  const handleNumeroChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumero(e.target.value);
    setNumero(formatted);
    onChange(`${selectedPays.indicatif} ${formatted}`.trim());
  };

  const handleSelectPays = (p: (typeof pays)[number]) => {
    setSelectedPays(p);
    setOpen(false);
    onChange(`${p.indicatif} ${numero}`.trim());
  };

  const isFilled = numero.trim().length > 0;

  return (
    <div
      ref={ref}
      className="flex rounded-2xl overflow-visible relative"
      style={{
        border: isFilled ? '1.5px solid #2a8a8a' : '1.5px solid #e2e8f0',
        transition: 'border-color 0.2s',
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-4 py-4 border-r flex-shrink-0 transition-all"
        style={{
          borderColor: '#e2e8f0',
          background: open ? 'rgba(42,138,138,0.06)' : '#f8fbfb',
          borderRadius: '1rem 0 0 1rem',
          minWidth: '100px',
        }}
      >
        <span className="text-xl leading-none">{selectedPays.flag}</span>
        <span className="text-sm font-semibold" style={{ color: '#1a2e5a' }}>
          {selectedPays.indicatif}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} style={{ color: '#2a8a8a' }} strokeWidth={2.2} />
        </motion.div>
      </button>

      <input
        type="tel"
        value={numero}
        onChange={handleNumeroChange}
        placeholder="07 87 10 39 39"
        className="flex-1 px-4 py-4 text-sm focus:outline-none bg-white"
        style={{ borderRadius: '0 1rem 1rem 0', color: '#1a2e5a' }}
      />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute left-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50"
            style={{
              background: '#fff',
              border: '1.5px solid #e2e8f0',
              boxShadow: '0 16px 40px rgba(26,46,90,0.14)',
            }}
          >
            <div className="p-2 max-h-64 overflow-y-auto">
              {pays.map((p) => {
                const isSelected = p.code === selectedPays.code;
                return (
                  <button
                    key={p.code}
                    type="button"
                    onClick={() => handleSelectPays(p)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left transition-all"
                    style={{
                      background: isSelected ? 'rgba(42,138,138,0.08)' : 'transparent',
                      color: isSelected ? '#2a8a8a' : '#1a2e5a',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <span className="text-xl leading-none">{p.flag}</span>
                    <span className="flex-1">{p.label}</span>
                    <span className="font-semibold text-xs" style={{ color: '#2a8a8a' }}>
                      {p.indicatif}
                    </span>
                    {isSelected && <Check size={14} style={{ color: '#2a8a8a' }} strokeWidth={2.5} />}
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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    motif: '',
    message: '',
  });

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const inputStyle: CSSProperties = {
    border: '1.5px solid #e2e8f0',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    backgroundColor: '#fff',
    color: '#1a2e5a',
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#2a8a8a';
    e.target.style.boxShadow = '0 0 0 3px rgba(42,138,138,0.10)';
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.target.style.borderColor = '#e2e8f0';
    e.target.style.boxShadow = 'none';
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Formulaire contact:', formData);
    alert('Message envoyé (simulation)');
  };

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#1a2e5a' }}>
            Contactez KARHON Assurances
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Un interlocuteur unique à votre écoute. Nous vous répondons rapidement.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Informations */}
          <div className="lg:col-span-3 space-y-10">
            
            {/* 🆕 EN HAUR : Nos Coordonnées */}
            <div
              className="bg-white rounded-3xl shadow-xl p-10 border"
              style={{ borderColor: '#e0ecec' }}
            >
              <h2 className="text-2xl font-bold mb-8" style={{ color: '#1a2e5a' }}>
                Nos Coordonnées
              </h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  {
                    Icon: Phone,
                    title: 'Téléphone',
                    content: (
                      <>
                        <a
                          href="tel:+2250787103939"
                          className="block font-bold hover:underline"
                          style={{ color: '#1a2e5a' }}
                        >
                          +225 07 87 10 39 39
                        </a>
                        <a
                          href="tel:+2250576367272"
                          className="block font-bold hover:underline"
                          style={{ color: '#1a2e5a' }}
                        >
                          +225 05 76 36 72 72
                        </a>
                      </>
                    ),
                  },
                  {
                    Icon: Mail,
                    title: 'Email',
                    content: <p className="text-gray-600 text-sm">infos@karhonassurance.com</p>,
                  },
                  {
                    Icon: MapPin,
                    title: 'Adresse',
                    content: <p className="text-gray-600 text-sm">Cocody, Angré 8ème Tranche — BP V 236 Abidjan</p>,
                  },
                  {
                    Icon: Clock,
                    title: 'Horaires',
                    content: (
                      <p className="text-gray-600 text-sm">
                        Lundi - Vendredi : 08h30 - 17h30
                        <br />
                        Sur rendez-vous de préférence
                      </p>
                    ),
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #eaf4f4, #d0ecec)' }}
                    >
                      <item.Icon size={18} style={{ color: '#2a8a8a' }} strokeWidth={1.7} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1" style={{ color: '#1a2e5a' }}>
                        {item.title}
                      </p>
                      {item.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 🆕 EN BAS : Pourquoi nous contacter */}
            <div
              className="bg-white rounded-3xl shadow-xl p-10 border"
              style={{ borderColor: '#e0ecec' }}
            >
              <h2 className="text-3xl font-bold mb-8" style={{ color: '#1a2e5a' }}>
                Pourquoi nous contacter ?
              </h2>
              <div className="space-y-8">
                {[
                  {
                    label: 'Étude personnalisée gratuite',
                    desc: 'Nous analysons votre situation et vous proposons la meilleure offre du marché ivoirien.',
                  },
                  {
                    label: 'Accompagnement sinistre',
                    desc: 'Nous vous assistons de la déclaration jusquau règlement de votre dossier.',
                  },
                  {
                    label: 'Aucun honoraire',
                    desc: 'Nos services sont entièrement pris en charge par les compagnies dassurance.',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex gap-5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #eaf4f4, #d0ecec)' }}
                    >
                      <CheckCircle size={22} style={{ color: '#2a8a8a' }} strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: '#1a2e5a' }}>
                        {item.label}
                      </h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div
              className="bg-white rounded-3xl shadow-xl p-10 sticky top-8 border"
              style={{ borderColor: '#e0ecec' }}
            >
              <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: '#1a2e5a' }}>
                Envoyez-nous un message
              </h3>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={formData.nom}
                    onChange={(e) => updateField('nom', e.target.value)}
                    className="rounded-2xl px-5 py-4 text-sm w-full"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <input
                    type="text"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={(e) => updateField('prenom', e.target.value)}
                    className="rounded-2xl px-5 py-4 text-sm w-full"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                <PhoneInput
                  value={formData.telephone}
                  onChange={(val) => updateField('telephone', val)}
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full rounded-2xl px-5 py-4 text-sm"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

                <CustomSelect
                  value={formData.motif}
                  onChange={(val) => updateField('motif', val)}
                />

                <textarea
                  placeholder="Décrivez votre besoin..."
                  rows={5}
                  value={formData.message}
                  onChange={(e) => updateField('message', e.target.value)}
                  className="w-full rounded-3xl px-5 py-4 resize-none text-sm"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

                <button
                  type="submit"
                  className="w-full text-white font-semibold py-4 rounded-2xl transition-all text-base shadow-lg hover:scale-105 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #2a8a8a, #1a2e5a)' }}
                >
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>

          {/* Carte interactive + itinéraire temps réel */}
          <div className="mt-12">
            <MapItineraire />
          </div>
        </div>
      </div>
    </div>
  );
}