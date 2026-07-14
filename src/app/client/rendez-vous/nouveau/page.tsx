"use client";
// Page /client/rendez-vous/nouveau — un client demande un rendez-vous.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarClock, Loader2, CheckCircle2 } from "lucide-react";
import BackButton from "@/components/ui/BackButton";
import DatePicker from "@/components/ui/DatePicker";
import Select from "@/components/ui/Select";

const aujourdhui = new Date().toISOString().slice(0, 10);

// Créneaux horaires (heures ouvrées).
const HEURES = ["08:00", "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"].map(
  (h) => ({ value: h, label: h })
);

const MOTIFS = [
  { value: "Conseil / orientation", label: "Conseil / orientation" },
  { value: "Souscription d'un contrat", label: "Souscription d'un contrat" },
  { value: "Suivi d'un sinistre", label: "Suivi d'un sinistre" },
  { value: "Renouvellement", label: "Renouvellement" },
  { value: "Autre", label: "Autre" },
];

export default function NouveauRendezVous() {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [motif, setMotif] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [erreur, setErreur] = useState("");
  const [ok, setOk] = useState(false);
  const [creneauxPris, setCreneauxPris] = useState<string[]>([]);

  // Quand le client choisit une date : on récupère les créneaux déjà pris.
  const choisirDate = async (d: string) => {
    setDate(d);
    setHeure("");
    setCreneauxPris([]);
    if (!d) return;
    try {
      const res = await fetch(`/api/rendez-vous?creneaux=${d}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.creneauxPris)) setCreneauxPris(data.creneauxPris);
      }
    } catch { /* on ignore : le serveur revérifiera à l'envoi */ }
  };

  // Heures encore libres pour la date choisie.
  const heuresDispo = HEURES.filter((h) => !creneauxPris.includes(h.value));

  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErreur("");
    if (!date || !heure || !motif) {
      setErreur("Merci de choisir une date, une heure et un motif.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/rendez-vous", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, heure, motif, notes }),
      });
      if (res.status === 401) { router.push("/client"); return; }
      const data = await res.json();
      if (!res.ok) { setErreur(data.erreur ?? "Demande impossible."); setLoading(false); return; }
      setOk(true);
      setTimeout(() => router.push("/client/dashboard"), 1600);
    } catch {
      setErreur("Erreur réseau. Réessaie.");
      setLoading(false);
    }
  };

  if (ok) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ backgroundColor: "#f8fbfb" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#dcfce7" }}>
          <CheckCircle2 size={30} style={{ color: "#166534" }} />
        </div>
        <h1 className="text-xl font-bold mb-1" style={{ color: "#1a2e5a" }}>Demande envoyée !</h1>
        <p className="text-gray-500 text-sm">Notre équipe vous confirmera le créneau rapidement.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-20" style={{ backgroundColor: "#f8fbfb" }}>
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="mb-6"><BackButton label="Retour" /></div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
          <div className="px-6 py-6 sm:px-7 text-white" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.15)" }}>
                <CalendarClock size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold leading-tight">Prendre rendez-vous</h1>
                <p className="text-xs text-white/70">Rencontrez un conseiller KARHON</p>
              </div>
            </div>
          </div>

          <form onSubmit={envoyer} className="p-5 sm:p-7 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date <span style={{ color: "#2a8a8a" }}>*</span></label>
                <DatePicker value={date} onChange={choisirDate} min={aujourdhui} desactiverWeekends placeholder="Choisir une date" />
                <p className="text-xs text-gray-400 mt-1.5">Jours ouvrés uniquement (hors week-end).</p>
              </div>
              <Select label="Heure" name="heure" value={heure} onChange={(e) => setHeure(e.target.value)} options={heuresDispo} required />
            </div>

            <Select label="Motif" name="motif" value={motif} onChange={(e) => setMotif(e.target.value)} options={MOTIFS} required />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Précisions (optionnel)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Donnez plus de détails si besoin…"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#2a8a8a] focus:bg-white transition-all text-sm resize-none"
              />
            </div>

            {erreur && (
              <p className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">{erreur}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #2a8a8a, #1a2e5a)" }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <CalendarClock size={18} />}
              {loading ? "Envoi…" : "Demander le rendez-vous"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
