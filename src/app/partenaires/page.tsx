"use client";
// Page publique « Nos partenaires » : présentation neutre de chaque compagnie
// partenaire — produits traités le mieux, avantages et garanties phares.
// (Pas de classement : KARHON reste un courtier neutre et indépendant.)
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Info, ArrowRight, ShieldCheck, Star } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import { TENDANCES, CONTEXTE_MARCHE } from "@/lib/tendancesPartenaires";

const MARINE = "#1a2e5a";
const TEAL = "#2a8a8a";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.08 } }),
};

// Affichage neutre : trié par ordre alphabétique (aucun classement).
const PARTENAIRES_TRIES = [...TENDANCES].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

export default function PartenairesPage() {
  return (
    <div className="min-h-screen pt-28 pb-20" style={{ backgroundColor: "#f8fbfb" }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-6">
          <BackButton label="Retour" />
        </div>

        {/* En-tête */}
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: MARINE }}>
            Nos compagnies partenaires
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            En tant que courtier neutre et indépendant,{" "}
            <strong style={{ color: MARINE }}>KARHON</strong>{" "}
            négocie pour vous auprès de plusieurs compagnies de référence. Découvrez ce que chacune sait faire de mieux, ses avantages et ses garanties phares — sans classement, pour vous orienter vers l&apos;offre la plus adaptée.
          </p>
        </motion.div>

        {/* Contexte de marché */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="max-w-3xl mx-auto mb-10 text-center text-sm rounded-2xl px-5 py-3" style={{ background: "#eaf4f4", color: "#1a6b6b" }}>
          {CONTEXTE_MARCHE}
        </motion.div>

        {/* Cartes partenaires (présentation neutre) */}
        <div className="space-y-5">
          {PARTENAIRES_TRIES.map((p, i) => (
            <motion.div
              key={p.nom}
              initial="hidden"
              animate="visible"
              custom={i + 2}
              variants={fadeUp}
              className="bg-white rounded-3xl shadow-sm border overflow-hidden transition-all hover:shadow-md"
              style={{ borderColor: "#e0ecec" }}
            >
              <div className="flex flex-col sm:flex-row">
                {/* Logo */}
                <div className="flex items-center justify-center p-6 sm:w-44 flex-shrink-0" style={{ background: "linear-gradient(135deg, #f8fbfb, #eef6f6)" }}>
                  <div className="bg-white rounded-2xl border shadow-sm flex items-center justify-center h-16 w-32 p-3" style={{ borderColor: "#e6efef" }}>
                    {p.logo ? (
                      <div className="relative h-full w-full">
                        <Image src={p.logo} alt={p.nom} fill className="object-contain" sizes="128px" />
                      </div>
                    ) : (
                      <span className="text-base font-extrabold tracking-tight text-center leading-tight" style={{ color: MARINE }}>
                        {p.nom.split(" ").slice(0, 2).map((m) => m[0]).join("")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div className="flex-1 p-6">
                  <h2 className="text-xl font-bold mb-2" style={{ color: MARINE }}>{p.nom}</h2>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{p.apropos}</p>

                  {/* Spécialités : produits traités le mieux */}
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: TEAL }}>
                    <Star size={13} /> Ce qu&apos;elle traite le mieux
                  </p>
                  <div className="flex flex-wrap gap-2 mb-5">
                    {p.specialites.map((s) => (
                      <span key={s} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "#eaf4f4", color: "#1a6b6b" }}>
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
                    {/* Avantages */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: TEAL }}>Avantages</p>
                      <ul className="space-y-2">
                        {p.forces.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: TEAL }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Garanties */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: TEAL }}>Garanties phares</p>
                      <ul className="space-y-2">
                        {p.garanties.map((g) => (
                          <li key={g} className="flex items-start gap-2 text-sm text-gray-600">
                            <ShieldCheck size={16} className="mt-0.5 flex-shrink-0" style={{ color: TEAL }} />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.div initial="hidden" animate="visible" custom={PARTENAIRES_TRIES.length + 2} variants={fadeUp} className="mt-8 flex items-start gap-3 rounded-2xl p-4 text-xs text-gray-500" style={{ background: "#f0f7f7", border: "1px solid #d0ecec" }}>
          <Info size={16} className="mt-0.5 flex-shrink-0" style={{ color: TEAL }} />
          <p>
            KARHON est un courtier <strong>neutre et indépendant</strong> : nous ne classons pas nos partenaires et ne favorisons aucune compagnie. Les spécialités et garanties présentées sont indicatives ; la couverture et la prime exactes dépendent du produit, du risque et de votre profil. Contactez-nous pour une cotation personnalisée.
          </p>
        </motion.div>

        {/* Appel à l'action */}
        <motion.div initial="hidden" animate="visible" custom={PARTENAIRES_TRIES.length + 3} variants={fadeUp} className="mt-8 text-center">
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.03] active:scale-95"
            style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
          >
            Demander une cotation personnalisée <ArrowRight size={16} />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}
