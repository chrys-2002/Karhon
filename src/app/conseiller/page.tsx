"use client";

// Page /conseiller — le « conseiller » KARHON.
// Objectif : éduquer le visiteur et lui donner envie de souscrire.
//   1) Hero  2) Pourquoi un courtier  3) Questionnaire guidé (reco produit)
//   4) Conseils par profil  5) Confiance & garanties  6) Étapes  7) FAQ  8) CTA
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Scale, UserCheck, Wallet, ArrowRight, Phone, Check,
  User, Users, Building2, Car, Home, HeartPulse, Plane, Briefcase, Shield,
  RotateCcw, FileText, PhoneCall, FileSignature, BadgeCheck,
  ChevronDown,
} from "lucide-react";

// ── Données : pourquoi un courtier ───────────────────────────
const ATOUTS = [
  { Icon: Scale, titre: "Neutre et indépendant", texte: "KARHON ne dépend d'aucune compagnie. Nous comparons le marché et choisissons ce qui est le mieux POUR VOUS, pas pour un assureur." },
  { Icon: ShieldCheck, titre: "Votre intérêt d'abord", texte: "En cas de sinistre, nous défendons votre dossier face à la compagnie jusqu'à la juste indemnisation. Vous n'êtes jamais seul." },
  { Icon: Wallet, titre: "Zéro frais pour vous", texte: "Notre accompagnement, le conseil et la gestion de vos contrats sont gratuits. Nous sommes rémunérés par les compagnies, pas par vous." },
  { Icon: UserCheck, titre: "Un interlocuteur unique", texte: "Un seul contact pour toutes vos assurances : auto, habitation, santé, pro… Plus simple, plus rapide, plus humain." },
];

// ── Questionnaire : questions ────────────────────────────────
const Q_PROFIL = {
  question: "Pour commencer, vous êtes…",
  options: [
    { val: "particulier", label: "Un particulier", Icon: User },
    { val: "famille", label: "Une famille", Icon: Users },
    { val: "pro", label: "Un professionnel", Icon: Building2 },
  ],
};
const Q_BESOIN = {
  question: "Que souhaitez-vous protéger en priorité ?",
  options: [
    { val: "auto", label: "Mon véhicule", Icon: Car },
    { val: "logement", label: "Mon logement", Icon: Home },
    { val: "sante", label: "Ma santé", Icon: HeartPulse },
    { val: "prevoyance", label: "L'avenir de mes proches", Icon: Shield },
    { val: "voyage", label: "Mes voyages", Icon: Plane },
    { val: "activite", label: "Mon activité pro", Icon: Briefcase },
  ],
};

// Recommandation selon (profil, besoin).
function recommander(profil: string, besoin: string) {
  const pro = profil === "pro";
  const table: Record<string, { produit: string; texte: string }> = {
    auto: pro
      ? { produit: "Automobile Flotte", texte: "Pour gérer et couvrir l'ensemble de vos véhicules professionnels avec une gestion centralisée et une assistance 24/7." }
      : { produit: "Assurance Automobile", texte: "Responsabilité civile, dommages, vol et incendie : une couverture complète et une assistance 24/7 pour rouler l'esprit tranquille." },
    logement: pro
      ? { produit: "Multirisque Professionnelle", texte: "Protégez vos locaux, votre matériel et votre activité contre l'incendie, le vol, les bris et les pertes d'exploitation." }
      : { produit: "Assurance Habitation", texte: "Incendie, dégâts des eaux, vol, responsabilité civile : votre logement et vos biens protégés au quotidien." },
    sante: { produit: "Assurance Santé", texte: "Hospitalisation, consultations, pharmacie, optique et dentaire : vos frais médicaux pris en charge, pour vous et vos proches." },
    prevoyance: { produit: "Assurance Vie (Prévoyance)", texte: "Garantissez l'avenir de votre famille : capital ou rente en cas de décès, d'invalidité, et solutions d'épargne/retraite." },
    voyage: { produit: "Assurance Voyage", texte: "Frais médicaux à l'étranger, rapatriement, bagages, annulation : voyagez sereinement, où que vous alliez." },
    activite: { produit: "RC Professionnelle", texte: "Couvrez les dommages causés à des tiers dans le cadre de votre activité, avec défense et recours inclus." },
  };
  return table[besoin] ?? table.auto;
}

// ── Conseils par profil ──────────────────────────────────────
const PROFILS = [
  { Icon: Car, titre: "Automobiliste", conseil: "En Côte d'Ivoire, l'assurance auto est obligatoire. Au-delà du minimum légal, une formule « tous risques » vous protège même quand vous êtes responsable. Nous vous aidons à choisir le bon niveau selon la valeur de votre véhicule." },
  { Icon: Home, titre: "Propriétaire / Locataire", conseil: "Un dégât des eaux ou un incendie peut coûter des millions. L'assurance habitation couvre vos biens ET votre responsabilité envers les voisins. Indispensable, que vous soyez propriétaire ou locataire." },
  { Icon: Users, titre: "Famille", conseil: "Une bonne couverture santé évite des dépenses imprévues lourdes. Ajoutez une prévoyance pour protéger vos enfants en cas d'imprévu. Nous construisons une protection globale adaptée à votre foyer." },
  { Icon: Briefcase, titre: "Entrepreneur", conseil: "Votre activité a des risques spécifiques : responsabilité, locaux, salariés, marchandises. Une multirisque pro et une RC pro sécurisent votre entreprise et rassurent vos clients et partenaires." },
  { Icon: Plane, titre: "Voyageur", conseil: "Un problème de santé à l'étranger peut être très coûteux. L'assurance voyage prend en charge les frais médicaux, le rapatriement et les imprévus. Souscrivez avant chaque départ." },
];

// ── Confiance & garanties ────────────────────────────────────
const GARANTIES = [
  { titre: "Accompagnement sinistre", texte: "Nous montons votre dossier et négocions avec la compagnie jusqu'à l'indemnisation." },
  { titre: "Transparence totale", texte: "Garanties, exclusions, tarifs : tout est expliqué clairement, sans petites lignes cachées." },
  { titre: "Proximité à Abidjan", texte: "Nos conseillers sont joignables et disponibles, à Cocody — Angré, pour un suivi humain." },
  { titre: "Les meilleures compagnies", texte: "Nous travaillons avec les assureurs les plus solides du marché ivoirien." },
];

// ── Étapes pour souscrire ────────────────────────────────────
const ETAPES = [
  { Icon: FileText, titre: "1. Demande de devis", texte: "Remplissez le formulaire en ligne ou appelez-nous. C'est gratuit et sans engagement." },
  { Icon: PhoneCall, titre: "2. Conseil personnalisé", texte: "Un conseiller analyse votre besoin et vous propose la meilleure offre du marché." },
  { Icon: FileSignature, titre: "3. Souscription", texte: "Vous choisissez votre formule et la durée (1 à 12 mois). Nous gérons les démarches." },
  { Icon: BadgeCheck, titre: "4. Suivi & rappels", texte: "Vous êtes couvert. Nous vous accompagnons et vous relançons avant chaque échéance." },
];

// ── FAQ ──────────────────────────────────────────────────────
const FAQ = [
  { q: "Combien coûte le service d'un courtier ?", r: "Rien pour vous. Le conseil, la souscription et la gestion de vos contrats sont gratuits : nous sommes rémunérés par les compagnies d'assurance." },
  { q: "Pourquoi passer par KARHON plutôt qu'aller directement chez un assureur ?", r: "Parce que nous comparons plusieurs compagnies pour vous, négocions les meilleures conditions, et surtout nous défendons VOTRE intérêt en cas de sinistre — un assureur ne défend que le sien." },
  { q: "Puis-je souscrire pour une courte durée ?", r: "Oui. Selon le produit, vous pouvez souscrire pour 1, 2, 3, 6 mois ou 1 an. Nous vous conseillons la durée la plus avantageuse." },
  { q: "Que se passe-t-il en cas de sinistre ?", r: "Vous nous contactez, nous montons votre dossier et nous nous occupons de tout face à la compagnie, jusqu'à votre indemnisation." },
];

export default function ConseillerPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8fbfb" }}>
      {/* ── HERO (clair et sobre, comme les autres pages) ── */}
      <section className="max-w-4xl mx-auto px-4 pt-32 pb-10 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-5" style={{ color: "#1a2e5a" }}>
            Bien assuré, l&apos;esprit tranquille.
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            KARHON est votre courtier neutre et indépendant à Abidjan. Nous vous expliquons tout, comparons le marché, et défendons vos intérêts — gratuitement. Trouvez en 1 minute l&apos;assurance qu&apos;il vous faut.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <a href="#diagnostic" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-105 shadow-lg" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
              Trouver mon assurance <ArrowRight size={18} />
            </a>
            <Link href="/devis" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-gray-50" style={{ color: "#1a2e5a", border: "1.5px solid #e0ecec" }}>
              Devis gratuit
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── POURQUOI UN COURTIER ── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#1a2e5a" }}>Pourquoi passer par un courtier ?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Un courtier travaille pour vous, pas pour l&apos;assureur. Voici ce que ça change concrètement.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ATOUTS.map((a, i) => (
            <motion.div
              key={a.titre}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: "#e0ecec" }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <a.Icon size={22} style={{ color: "#2a8a8a" }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: "#1a2e5a" }}>{a.titre}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{a.texte}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── QUESTIONNAIRE GUIDÉ ── */}
      <section id="diagnostic" className="py-20 px-4" style={{ background: "linear-gradient(180deg, #ffffff, #f0f7f7)" }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#1a2e5a" }}>Trouvez votre assurance en 1 minute</h2>
            <p className="text-gray-500">Répondez à 2 questions, on vous recommande la couverture adaptée.</p>
          </div>
          <Diagnostic />
        </div>
      </section>

      {/* ── CONSEILS PAR PROFIL ── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#1a2e5a" }}>Des conseils selon votre profil</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Chaque situation a ses priorités. Voici nos recommandations.</p>
        </div>
        <div className="space-y-4">
          {PROFILS.map((p, i) => (
            <motion.div
              key={p.titre}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="flex items-start gap-4 bg-white rounded-3xl p-6 shadow-sm border" style={{ borderColor: "#e0ecec" }}
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                <p.Icon size={22} color="#fff" />
              </div>
              <div>
                <h3 className="font-bold mb-1" style={{ color: "#1a2e5a" }}>{p.titre}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{p.conseil}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CONFIANCE & GARANTIES ── */}
      <section className="py-20 px-4" style={{ background: "#1a2e5a" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Pourquoi nous faire confiance</h2>
            <p className="text-white/70 max-w-2xl mx-auto">Nous nous engageons sur la durée, à vos côtés.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {GARANTIES.map((g, i) => (
              <motion.div
                key={g.titre}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(42,138,138,0.3)" }}>
                  <Check size={20} color="#fff" />
                </div>
                <h3 className="font-bold text-white mb-2">{g.titre}</h3>
                <p className="text-sm text-white/70 leading-relaxed">{g.texte}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ÉTAPES POUR SOUSCRIRE ── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#1a2e5a" }}>Souscrire, c&apos;est simple et rapide</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">4 étapes, du devis gratuit à votre contrat.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ETAPES.map((e, i) => (
            <motion.div
              key={e.titre}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white rounded-3xl p-6 shadow-sm border text-center" style={{ borderColor: "#e0ecec" }}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                <e.Icon size={24} style={{ color: "#2a8a8a" }} />
              </div>
              <h3 className="font-bold mb-2" style={{ color: "#1a2e5a" }}>{e.titre}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{e.texte}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 pb-20">
        <h2 className="text-3xl font-bold text-center mb-10" style={{ color: "#1a2e5a" }}>Questions fréquentes</h2>
        <div className="space-y-3">
          {FAQ.map((f) => <FaqItem key={f.q} q={f.q} r={f.r} />)}
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="px-4 pb-24">
        <div className="max-w-4xl mx-auto rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
          <h2 className="text-3xl font-bold text-white mb-4">Prêt à être bien protégé ?</h2>
          <p className="text-white/80 max-w-xl mx-auto mb-8">Obtenez votre devis gratuit en quelques minutes, ou appelez un conseiller dès maintenant.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/devis" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:scale-105" style={{ background: "#fff", color: "#1a2e5a" }}>
              Demander un devis gratuit <ArrowRight size={18} />
            </Link>
            <a href="tel:+2250787103939" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-white/10" style={{ color: "#fff", border: "1.5px solid rgba(255,255,255,0.4)" }}>
              <Phone size={17} /> +225 07 87 10 39 39
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Composant : questionnaire interactif ─────────────────────
function Diagnostic() {
  const [etape, setEtape] = useState(0); // 0 = profil, 1 = besoin, 2 = résultat
  const [profil, setProfil] = useState("");
  const [besoin, setBesoin] = useState("");

  const reset = () => { setEtape(0); setProfil(""); setBesoin(""); };

  return (
    <div className="bg-white rounded-3xl shadow-xl border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
      {/* Progression */}
      <div className="h-1.5 w-full" style={{ background: "#eef4f4" }}>
        <div className="h-full transition-all" style={{ width: `${(etape / 2) * 100}%`, background: "linear-gradient(90deg, #1a2e5a, #2a8a8a)" }} />
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {etape === 0 && (
            <motion.div key="q0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h3 className="text-xl font-bold mb-6 text-center" style={{ color: "#1a2e5a" }}>{Q_PROFIL.question}</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {Q_PROFIL.options.map((o) => (
                  <button
                    key={o.val}
                    onClick={() => { setProfil(o.val); setEtape(1); }}
                    className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all hover:scale-[1.03]"
                    style={{ borderColor: "#e0ecec", background: "#fbfdfd" }}
                  >
                    <span className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                      <o.Icon size={24} style={{ color: "#2a8a8a" }} />
                    </span>
                    <span className="font-semibold text-sm" style={{ color: "#1a2e5a" }}>{o.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {etape === 1 && (
            <motion.div key="q1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              <h3 className="text-xl font-bold mb-6 text-center" style={{ color: "#1a2e5a" }}>{Q_BESOIN.question}</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {Q_BESOIN.options.map((o) => (
                  <button
                    key={o.val}
                    onClick={() => { setBesoin(o.val); setEtape(2); }}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all hover:scale-[1.03]"
                    style={{ borderColor: "#e0ecec", background: "#fbfdfd" }}
                  >
                    <span className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                      <o.Icon size={22} style={{ color: "#2a8a8a" }} />
                    </span>
                    <span className="font-semibold text-sm text-center" style={{ color: "#1a2e5a" }}>{o.label}</span>
                  </button>
                ))}
              </div>
              <button onClick={() => setEtape(0)} className="mt-6 text-sm font-semibold text-gray-400 hover:text-gray-600 mx-auto block">← Retour</button>
            </motion.div>
          )}

          {etape === 2 && (() => {
            const reco = recommander(profil, besoin);
            return (
              <motion.div key="res" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}>
                  <BadgeCheck size={32} style={{ color: "#2a8a8a" }} />
                </div>
                <p className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: "#2a8a8a" }}>Notre recommandation</p>
                <h3 className="text-2xl font-bold mb-3" style={{ color: "#1a2e5a" }}>{reco.produit}</h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-8">{reco.texte}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/devis" className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-semibold text-sm text-white transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
                    Demander un devis gratuit <ArrowRight size={18} />
                  </Link>
                  <button onClick={reset} className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:bg-gray-50" style={{ border: "1.5px solid #e0ecec", color: "#1a2e5a" }}>
                    <RotateCcw size={16} /> Recommencer
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Composant : item FAQ (accordéon) ─────────────────────────
function FaqItem({ q, r }: { q: string; r: string }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
      <button onClick={() => setOuvert((o) => !o)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="font-semibold text-sm" style={{ color: "#1a2e5a" }}>{q}</span>
        <motion.span animate={{ rotate: ouvert ? 180 : 0 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
          <ChevronDown size={18} style={{ color: "#2a8a8a" }} />
        </motion.span>
      </button>
      <AnimatePresence>
        {ouvert && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <p className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{r}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
