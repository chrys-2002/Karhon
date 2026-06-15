"use client";
// Page publique « Nos partenaires » : classement réel des compagnies
// partenaires (chiffre d'affaires non-vie 2024), avantages et coût indicatif.
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Check, Info, ArrowRight } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { TENDANCES, ANNEE_DONNEES, CONTEXTE_MARCHE } from "@/lib/tendancesPartenaires";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
};

// Affiche le coût indicatif : € colorés selon le niveau, le reste grisé.
function CoutIndicatif({ niveau }: { niveau: 1 | 2 | 3 }) {
  return (
    <span className="inline-flex items-center" title="Positionnement tarifaire indicatif">
      {[1, 2, 3].map((n) => (
        <span key={n} className="text-lg font-bold" style={{ color: n <= niveau ? "#1a2e5a" : "#d1dede" }}>€</span>
      ))}
    </span>
  );
}

const medaille = ["#d4af37", "#9ca3af", "#d89655"]; // or, argent, bronze

export default function PartenairesPage() {
  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "#f8fbfb" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6">
          <BackButton label="Retour" />
        </div>

        {/* En-tête */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: "#1a2e5a" }}>
            Nos compagnies partenaires
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            En tant que courtier, <b>KARHON</b> négocie pour vous auprès des plus grandes compagnies du marché ivoirien.
            Voici leur classement réel par chiffre d&apos;affaires (branche non-vie), leurs atouts et leur positionnement tarifaire.
          </p>
        </motion.div>

        {/* Contexte de marché récent */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="max-w-3xl mx-auto mb-8 text-center text-sm rounded-2xl px-5 py-3" style={{ background: "#eaf4f4", color: "#1a6b6b" }}>
          {CONTEXTE_MARCHE}
        </motion.div>

        {/* Légende du coût */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10 text-sm text-gray-500">
          <span className="font-semibold" style={{ color: "#1a2e5a" }}>Coût indicatif :</span>
          <span><strong style={{ color: "#1a2e5a" }}>€</strong> économique</span>
          <span><strong style={{ color: "#1a2e5a" }}>€€</strong> moyen</span>
          <span><strong style={{ color: "#1a2e5a" }}>€€€</strong> premium</span>
        </motion.div>

        {/* Classement */}
        <div className="space-y-5">
          {TENDANCES.map((p, i) => (
            <motion.div
              key={p.nom}
              initial="hidden"
              animate="visible"
              custom={i + 2}
              variants={fadeUp}
              className="bg-white rounded-3xl shadow-sm border overflow-hidden"
              style={{ borderColor: "#e0ecec" }}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Rang + logo */}
                <div className="flex sm:flex-col items-center justify-center gap-4 sm:gap-3 p-6 sm:w-44 flex-shrink-0" style={{ background: "linear-gradient(135deg, #f8fbfb, #eef6f6)" }}>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow" style={{ background: i < 3 ? `linear-gradient(135deg, ${medaille[i]}, #1a2e5a)` : "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                      {p.rang}
                    </div>
                    {i === 0 && (
                      <Trophy size={16} className="absolute -top-2 -right-2" style={{ color: "#d4af37" }} fill="#d4af37" />
                    )}
                  </div>
                  <div className="bg-white rounded-2xl border shadow-sm flex items-center justify-center h-16 w-32 p-3" style={{ borderColor: "#e6efef" }}>
                    <div className="relative h-full w-full">
                      <Image src={p.logo} alt={p.nom} fill className="object-contain" sizes="128px" />
                    </div>
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex-1 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                    <div>
                      <h2 className="text-xl font-bold" style={{ color: "#1a2e5a" }}>{p.nom}</h2>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-0.5">
                        <span>CA non-vie {ANNEE_DONNEES} : <strong style={{ color: "#2a8a8a" }}>{p.caNonVie}</strong></span>
                        <span>Part de marché : <strong style={{ color: "#2a8a8a" }}>{p.partDeMarche}</strong></span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Coût</p>
                      <CoutIndicatif niveau={p.cout} />
                    </div>
                  </div>

                  {/* Présentation */}
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{p.apropos}</p>

                  {/* Barre de part de marché */}
                  <div className="mb-4">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#eef4f4" }}>
                      <div className="h-full rounded-full" style={{ width: `${parseFloat(p.partDeMarche.replace(",", "."))}%`, background: "linear-gradient(90deg, #2a8a8a, #1a2e5a)" }} />
                    </div>
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#2a8a8a" }}>Avantages</p>
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
                    {p.forces.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#2a8a8a" }} />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note de source */}
        <motion.div initial="hidden" animate="visible" custom={TENDANCES.length + 2} variants={fadeUp} className="mt-8 flex items-start gap-3 rounded-2xl p-4 text-xs text-gray-500" style={{ background: "#f0f7f7", border: "1px solid #d0ecec" }}>
          <Info size={16} className="mt-0.5 flex-shrink-0" style={{ color: "#2a8a8a" }} />
          <p>
            Classement fondé sur le chiffre d&apos;affaires de la branche non-vie {ANNEE_DONNEES}, dernier exercice complet publié (sources : Financial Afrik, Sika Finance, 225 Assurances, Horonya Finance).
            Le <strong>coût</strong> est un positionnement <strong>indicatif</strong> : la prime réelle dépend du produit, du risque et de votre profil.
            Contactez-nous pour une cotation personnalisée.
          </p>
        </motion.div>

        {/* Appel à l'action */}
        <motion.div initial="hidden" animate="visible" custom={TENDANCES.length + 3} variants={fadeUp} className="mt-8 text-center">
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.03] active:scale-95"
            style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
          >
            Demander un devis personnalisé <ArrowRight size={16} />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
