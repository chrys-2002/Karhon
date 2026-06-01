'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Phone } from 'lucide-react';

export default function AproposPage() {
  return (
    <div className="min-h-screen bg-white">

      <div className="text-white pt-32 pb-20 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #1e4a7a 60%, #2a8a8a 100%)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(at_top_right,#2a8a8a_0%,transparent_50%)]"></div>
        <div className="container mx-auto px-6 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{ marginBottom: "20px" }}>KARHON Assurances</h1>
            <div className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-sm border border-white/20" style={{ marginBottom: "90px" }}>
              Agrément n°0305/MEF/DGTCP/DA du 02 Septembre 2021
            </div>
            <p className="text-xl max-w-2xl" style={{ color: "#a8d8d8" }}>
              Votre interlocuteur unique, neutre et indépendant en assurance en Côte d&apos;Ivoire.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-16 max-w-6xl">

        <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3" style={{ color: "#1a2e5a" }}>
            <Shield className="w-9 h-9" style={{ color: "#2a8a8a" }} />
            L&apos;INTERLOCUTEUR UNIQUE
          </h2>
          <div className="bg-white rounded-3xl shadow-xl p-10 border" style={{ borderColor: "#e0ecec" }}>
            <p className="text-lg leading-relaxed text-gray-700 mb-6">
              Créé en 2020,{" "}<strong style={{ color: "#1a2e5a" }}>KARHON Assurances</strong>{" "}met son expertise, son expérience et sa compétence au service de ses clients. Nous offrons un service personnalisé dans tous les domaines d&apos;assurances avec toutes les meilleures compagnies pratiquant sur le marché ivoirien.
            </p>
            <p className="text-lg leading-relaxed text-gray-700">
              Nous travaillons exclusivement dans l&apos;intérêt de nos clients :{" "}gestion du portefeuille d&apos;assurances, assistance en cas de sinistre, contact direct avec les compagnies, étude et conseils personnalisés.
            </p>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <h2 className="text-3xl font-bold mb-10" style={{ color: "#1a2e5a" }}>Notre Mission</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-lg border" style={{ borderColor: "#e0ecec" }}>
              <h3 className="font-semibold text-xl mb-6" style={{ color: "#2a8a8a" }}>Ce que nous faisons :</h3>
              <ul className="space-y-4 text-gray-700">
                {[
                  "Rechercher les produits adaptés à votre situation",
                  "Établir des offres claires et comparatives",
                  "Assurer la gestion administrative complète",
                  "Vous accompagner activement en cas de sinistre",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <CheckCircle className="mt-1 flex-shrink-0" style={{ color: "#2a8a8a" }} size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="text-white p-8 rounded-3xl shadow-lg" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
              <h3 className="font-semibold text-xl mb-6">Nos Engagements</h3>
              <ul className="space-y-4">
                {[
                  "Neutralité et indépendance totale",
                  "Confidentialité absolue",
                  "Aucun honoraire facturé au client",
                  "Défense de vos intérêts face aux compagnies",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <CheckCircle className="mt-1 flex-shrink-0 text-white/80" size={20} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.section>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} className="text-white rounded-3xl p-12 text-center shadow-2xl" style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}>
          <Phone className="w-16 h-16 mx-auto mb-6" />
          <h3 className="text-3xl font-bold mb-4">Prêt à être bien protégé ?</h3>
          <p className="text-xl mb-8 text-white/80">Contactez-nous pour une étude personnalisée gratuite.</p>
          <a href="tel:+2250787103939" className="inline-block font-bold text-xl px-10 py-4 rounded-2xl transition hover:scale-105" style={{ backgroundColor: "#ffffff", color: "#1a2e5a" }}>+225 07 87 10 39 39</a>
        </motion.div>

      </div>
    </div>
  );
}