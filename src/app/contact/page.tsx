'use client';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Mail, CheckCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [selectValue, setSelectValue] = useState('');

  const inputStyle = {
    border: "1.5px solid #e2e8f0",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "#2a8a8a";
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = "#e2e8f0";
  };

  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold mb-4" style={{ color: "#1a2e5a" }}>Contactez KARHON Assurances</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Un interlocuteur unique à votre écoute. Nous vous répondons rapidement.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-10">
          {/* Informations */}
          <div className="lg:col-span-3 space-y-10">
            <div className="bg-white rounded-3xl shadow-xl p-10 border" style={{ borderColor: "#e0ecec" }}>
              <h2 className="text-3xl font-bold mb-8" style={{ color: "#1a2e5a" }}>Pourquoi nous contacter ?</h2>
              <div className="space-y-8">
                {[
                  { label: "Étude personnalisée gratuite", desc: "Nous analysons votre situation et vous proposons la meilleure offre du marché ivoirien." },
                  { label: "Accompagnement sinistre", desc: "Nous vous assistons de la déclaration jusqu'au règlement de votre dossier." },
                  { label: "Aucun honoraire", desc: "Nos services sont entièrement pris en charge par les compagnies d'assurance." },
                ].map((item) => (
                  <div key={item.label} className="flex gap-5">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#e8f5f5" }}>
                      <CheckCircle size={24} style={{ color: "#2a8a8a" }} strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: "#1a2e5a" }}>{item.label}</h3>
                      <p className="text-gray-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordonnées */}
            <div className="bg-white rounded-3xl shadow-xl p-10 border" style={{ borderColor: "#e0ecec" }}>
              <h2 className="text-2xl font-bold mb-8" style={{ color: "#1a2e5a" }}>Nos Coordonnées</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                {[
                  {
                    Icon: Phone, title: "Téléphone", content: (
                      <>
                        <a href="tel:+2250787103939" className="block font-bold hover:underline transition" style={{ color: "#1a2e5a" }}>+225 07 87 10 39 39</a>
                        <a href="tel:+2250576367272" className="block font-bold hover:underline transition" style={{ color: "#1a2e5a" }}>+225 05 76 36 72 72</a>
                      </>
                    )
                  },
                  {
                    Icon: Mail, title: "Email", content: (
                      <p className="text-gray-700">infos@karhonassurance.com</p>
                    )
                  },
                  {
                    Icon: MapPin, title: "Adresse", content: (
                      <p className="text-gray-700">Abidjan, Côte d&apos;Ivoire</p>
                    )
                  },
                  {
                    Icon: Clock, title: "Horaires", content: (
                      <p className="text-gray-700">Lundi - Vendredi : 08h30 - 17h30<br />Sur rendez-vous de préférence</p>
                    )
                  },
                ].map(({ Icon, title, content }) => (
                  <div key={title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                      <Icon size={18} style={{ color: "#2a8a8a" }} strokeWidth={1.7} />
                    </div>
                    <div>
                      <p className="font-semibold mb-1" style={{ color: "#1a2e5a" }}>{title}</p>
                      {content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-10 sticky top-8 border" style={{ borderColor: "#e0ecec" }}>
              <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: "#1a2e5a" }}>Envoyez-nous un message</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Nom"
                    className="rounded-2xl px-5 py-4 text-sm w-full"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                  <input
                    type="text"
                    placeholder="Prénom"
                    className="rounded-2xl px-5 py-4 text-sm w-full"
                    style={inputStyle}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  />
                </div>

                <input
                  type="tel"
                  placeholder="Téléphone"
                  className="w-full rounded-2xl px-5 py-4 text-sm"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

                <input
                  type="email"
                  placeholder="Email"
                  className="w-full rounded-2xl px-5 py-4 text-sm"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

                {/* Select stylé */}
                <div className="relative">
                  <select
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    className="w-full rounded-2xl px-5 py-4 text-sm appearance-none cursor-pointer"
                    style={{
                      ...inputStyle,
                      color: selectValue ? "#1a2e5a" : "#9ca3af",
                      backgroundColor: "#fff",
                    }}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                  >
                    <option value="" disabled hidden>Type de demande</option>
                    <option value="devis" style={{ color: "#1a2e5a" }}>Demande de devis</option>
                    <option value="sinistre" style={{ color: "#1a2e5a" }}>Déclaration de sinistre</option>
                    <option value="rendezvous" style={{ color: "#1a2e5a" }}>Prendre rendez-vous</option>
                    <option value="information" style={{ color: "#1a2e5a" }}>Demande d&apos;information</option>
                  </select>
                  {/* Chevron custom */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={17} style={{ color: "#2a8a8a" }} strokeWidth={2} />
                  </div>
                  {/* Indicateur de sélection */}
                  {selectValue && (
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                      style={{ background: "linear-gradient(to bottom, #2a8a8a, #1a2e5a)" }}
                    />
                  )}
                </div>

                <textarea
                  placeholder="Décrivez votre besoin..."
                  rows={5}
                  className="w-full rounded-3xl px-5 py-4 resize-none text-sm"
                  style={inputStyle}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                />

                <button
                  type="submit"
                  className="w-full text-white font-semibold py-4 rounded-2xl transition-all text-base shadow-lg hover:scale-105 active:scale-95"
                  style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
                >
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}