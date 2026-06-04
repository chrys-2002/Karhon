"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, CalendarDays, FileText, Coins, Send, Phone, CheckCircle2, Car, Home, HeartPulse, Plane, Scale, Truck, Store, Briefcase, Anchor, Landmark, Flower2 } from "lucide-react";
import Select from "@/components/ui/Select";
import DatePicker from "@/components/ui/DatePicker";
import BackButton from "@/components/ui/BackButton";

// Gamme des assurances pouvant faire l'objet d'une déclaration de sinistre.
const contrats = [
  { value: "auto", label: "Assurance Auto", desc: "Particulier", Icon: Car },
  { value: "habitation", label: "Assurance Habitation", desc: "Multirisque", Icon: Home },
  { value: "sante", label: "Assurance Santé", desc: "Individuelle / Groupe", Icon: HeartPulse },
  { value: "accident", label: "Individuelle Accident", desc: "Dommages corporels", Icon: ShieldAlert },
  { value: "voyage", label: "Assurance Voyage", desc: "Multirisque voyage", Icon: Plane },
  { value: "rc", label: "Responsabilité Civile", desc: "Particulier", Icon: Scale },
  { value: "flotte", label: "Flotte Automobile", desc: "Professionnel", Icon: Truck },
  { value: "multirisque-pro", label: "Multirisque Professionnelle", desc: "Professionnel", Icon: Store },
  { value: "rc-pro", label: "RC Professionnelle", desc: "Professionnel", Icon: Briefcase },
  { value: "maritime", label: "Assurance Maritime", desc: "Transport / Marchandises", Icon: Anchor },
  { value: "emprunteur", label: "Vie Emprunteur", desc: "Protection de prêt", Icon: Landmark },
  { value: "funeraire", label: "Assistance Funéraire", desc: "Prévoyance", Icon: Flower2 },
];

// Date du jour au format AAAA-MM-JJ (pour interdire les dates futures).
const aujourdhui = new Date().toISOString().split("T")[0];

export default function NouveauSinistre() {
  const router = useRouter();
  const [formData, setFormData] = useState({ contratId: "", date: "", description: "", montant: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  const setChamp = (name: string, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contratId || !formData.date || !formData.description) return;
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setEnvoye(true);
      setTimeout(() => router.push("/client/dashboard"), 1800);
    }, 1400);
  };

  // Écran de confirmation après envoi.
  if (envoye) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f5fbfb" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "linear-gradient(135deg, #eaf4f4, #d0ecec)" }}
          >
            <CheckCircle2 size={40} style={{ color: "#2a8a8a" }} />
          </motion.div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "#1a2e5a" }}>Déclaration enregistrée</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Un conseiller KARHON vous recontacte rapidement pour la suite des démarches. Redirection vers votre espace…
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16 px-4" style={{ backgroundColor: "#f5fbfb" }}>
      <div className="max-w-2xl mx-auto">

        {/* Bouton retour */}
        <div className="mb-6">
          <BackButton label="Retour" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white rounded-3xl shadow-xl overflow-hidden"
        >
          {/* En-tête coloré */}
          <div className="relative px-8 py-8" style={{ background: "linear-gradient(135deg, #1a2e5a 0%, #1e4a7a 60%, #2a8a8a 100%)" }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <ShieldAlert size={26} color="#ffffff" strokeWidth={1.6} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Déclaration de sinistre</h1>
                <p className="text-white/60 text-sm mt-1">Nous vous accompagnons jusqu&apos;à l&apos;indemnisation.</p>
              </div>
            </div>
          </div>

          {/* Corps du formulaire */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">

            <Select
              label="Contrat concerné"
              name="contratId"
              value={formData.contratId}
              onChange={(e) => setChamp(e.target.name, e.target.value)}
              options={contrats}
              required
            />

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <CalendarDays size={15} style={{ color: "#2a8a8a" }} /> Date du sinistre <span style={{ color: "#2a8a8a" }}>*</span>
              </label>
              <DatePicker
                value={formData.date}
                onChange={(v) => setChamp("date", v)}
                max={aujourdhui}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <FileText size={15} style={{ color: "#2a8a8a" }} /> Circonstances <span style={{ color: "#2a8a8a" }}>*</span>
              </label>
              <textarea
                placeholder="Décrivez ce qui s'est passé : lieu, déroulement, dommages constatés…"
                rows={5}
                value={formData.description}
                onChange={(e) => setChamp("description", e.target.value)}
                required
                className="w-full px-4 py-3 bg-white border rounded-xl text-sm text-gray-700 transition-all focus:outline-none resize-none"
                style={{ borderColor: "#e0ecec" }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(42,138,138,0.18)")}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Coins size={15} style={{ color: "#2a8a8a" }} /> Montant estimé <span className="text-gray-400 font-normal">(facultatif)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  value={formData.montant}
                  onChange={(e) => setChamp("montant", e.target.value)}
                  className="w-full px-4 py-3 pr-16 bg-white border rounded-xl text-sm text-gray-700 transition-all focus:outline-none"
                  style={{ borderColor: "#e0ecec" }}
                  onFocus={(e) => (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(42,138,138,0.18)")}
                  onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">FCFA</span>
              </div>
            </div>

            {/* Encart d'urgence */}
            <div className="flex items-start gap-3 rounded-2xl p-4" style={{ backgroundColor: "#f0f7f7" }}>
              <Phone size={18} style={{ color: "#2a8a8a" }} className="flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 leading-relaxed">
                Pour un sinistre urgent, contactez-nous directement au <span className="font-semibold" style={{ color: "#1a2e5a" }}>+225 07 87 10 39 39</span> ou <span className="font-semibold" style={{ color: "#1a2e5a" }}>+225 05 76 36 72 72</span>. Nous vous accompagnons dans toutes vos démarches.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.97 }}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white text-sm shadow-lg disabled:opacity-70"
                style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}
              >
                {isSubmitting ? "Envoi en cours…" : (<>Déclarer le sinistre <Send size={16} /></>)}
              </motion.button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3.5 border-2 rounded-2xl font-semibold text-sm transition-all hover:bg-gray-50"
                style={{ borderColor: "#e0ecec", color: "#1a2e5a" }}
              >
                Annuler
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
