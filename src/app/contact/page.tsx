'use client';
import { motion } from 'framer-motion';
import { Phone, MapPin, Clock, Mail, CheckCircle } from 'lucide-react';

export default function ContactPage() {
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
                      <CheckCircle size={28} style={{ color: "#2a8a8a" }} />
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
                <div className="flex gap-4">
                  <Phone className="mt-1 flex-shrink-0" size={28} style={{ color: "#2a8a8a" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "#1a2e5a" }}>Téléphone</p>
                    <a href="tel:+2250787103939" className="text-2xl font-bold text-gray-800 hover:underline transition" style={{ color: "#1a2e5a" }}>
                      +225 07 87 10 39 39
                    </a><br />
                    <a href="tel:+2250576367272" className="text-2xl font-bold text-gray-800 hover:underline transition" style={{ color: "#1a2e5a" }}>
                      +225 05 76 36 72 72
                    </a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail className="mt-1 flex-shrink-0" size={28} style={{ color: "#2a8a8a" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "#1a2e5a" }}>Email</p>
                    <p className="text-gray-700">infos@karhonassurance.com</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <MapPin className="mt-1 flex-shrink-0" size={28} style={{ color: "#2a8a8a" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "#1a2e5a" }}>Adresse</p>
                    <p className="text-gray-700">Abidjan, Côte d&apos;Ivoire</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock className="mt-1 flex-shrink-0" size={28} style={{ color: "#2a8a8a" }} />
                  <div>
                    <p className="font-semibold" style={{ color: "#1a2e5a" }}>Horaires</p>
                    <p className="text-gray-700">Lundi - Vendredi : 08h30 - 17h30<br />Sur rendez-vous de préférence</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-xl p-10 sticky top-8 border" style={{ borderColor: "#e0ecec" }}>
              <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: "#1a2e5a" }}>Envoyez-nous un message</h3>
              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Nom" className="border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none transition text-sm" />
                  <input type="text" placeholder="Prénom" className="border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none transition text-sm" />
                </div>
                <input type="tel" placeholder="Téléphone" className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none transition text-sm" />
                <input type="email" placeholder="Email" className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none transition text-sm" />
                <select className="w-full border border-gray-200 rounded-2xl px-5 py-4 focus:outline-none transition text-sm text-gray-600">
                  <option value="">Type de demande</option>
                  <option value="devis">Demande de devis</option>
                  <option value="sinistre">Déclaration de sinistre</option>
                  <option value="rendezvous">Prendre rendez-vous</option>
                  <option value="information">Demande d&apos;information</option>
                </select>
                <textarea
                  placeholder="Décrivez votre besoin..."
                  rows={5}
                  className="w-full border border-gray-200 rounded-3xl px-5 py-4 focus:outline-none resize-none transition text-sm"
                />
                <button
                  type="submit"
                  className="w-full text-white font-semibold py-4 rounded-2xl transition-all text-lg shadow-lg hover:scale-105 active:scale-95"
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