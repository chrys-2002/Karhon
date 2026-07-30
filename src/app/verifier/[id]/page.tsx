"use client";
// Page PUBLIQUE de vérification d'un reçu KARHON.
// Accessible en scannant le QR code du reçu (ou via son lien).
// Affiche « Reçu authentique » avec le résumé si la signature correspond,
// sinon un avertissement clair.
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";

const MARINE = "#1a2e5a";
const TEAL = "#2a8a8a";

type Recu = {
  numeroContrat: string;
  produit: string | null;
  compagnie: string | null;
  assure: string;
  dateDebut: string;
  dateFin: string;
  primeAnnuelle: number;
  statut: string;
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "long", year: "numeric" }) : "—";

export default function VerifierPage() {
  const { id } = useParams<{ id: string }>();
  const params = useSearchParams();
  const s = params.get("s") ?? "";
  const [etat, setEtat] = useState<"chargement" | "valide" | "invalide">("chargement");
  const [recu, setRecu] = useState<Recu | null>(null);

  useEffect(() => {
    fetch(`/api/verifier/${id}?s=${encodeURIComponent(s)}`)
      .then((r) => (r.ok ? r.json() : { valide: false }))
      .then((d) => {
        if (d.valide && d.recu) { setRecu(d.recu); setEtat("valide"); }
        else setEtat("invalide");
      })
      .catch(() => setEtat("invalide"));
  }, [id, s]);

  return (
    <div className="min-h-screen flex items-center justify-center py-10 px-4" style={{ background: "#f4f8f8" }}>
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
        <div className="px-8 py-6 flex items-center gap-3" style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/karhon-blanc.svg" alt="KARHON Assurances" className="h-9" />
          <span className="text-white/80 text-xs uppercase tracking-widest">Vérification de reçu</span>
        </div>

        <div className="p-8">
          {etat === "chargement" && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="animate-spin" size={28} style={{ color: TEAL }} />
              <p className="text-sm text-gray-500">Vérification en cours…</p>
            </div>
          )}

          {etat === "invalide" && (
            <div className="flex flex-col items-center text-center gap-3 py-6">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#fee2e2" }}>
                <ShieldAlert size={32} style={{ color: "#b42318" }} />
              </div>
              <h1 className="text-xl font-bold" style={{ color: "#b42318" }}>Reçu non authentifié</h1>
              <p className="text-sm text-gray-500 max-w-xs">
                Ce reçu n&apos;a pas pu être vérifié. Le code de signature est invalide ou le document ne correspond à aucun reçu enregistré par KARHON Assurances. Méfiez-vous d&apos;un éventuel faux.
              </p>
            </div>
          )}

          {etat === "valide" && recu && (
            <>
              <div className="flex flex-col items-center text-center gap-2 mb-6">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: "#dcfce7" }}>
                  <ShieldCheck size={32} style={{ color: "#166534" }} />
                </div>
                <h1 className="text-xl font-bold" style={{ color: "#166534" }}>Reçu authentique</h1>
                <p className="text-sm text-gray-500">Ce reçu a bien été émis par KARHON Assurances.</p>
              </div>

              <div className="grid grid-cols-1 gap-y-3 rounded-2xl p-5" style={{ background: "#f8fbfb", border: "1px solid #eef4f4" }}>
                {([
                  ["Assuré(e)", recu.assure || "—"],
                  ["Produit", recu.produit ?? "—"],
                  ["Compagnie", recu.compagnie ?? "—"],
                  ["N° de contrat", recu.numeroContrat],
                  ["Date d'effet", fmtDate(recu.dateDebut)],
                  ["Échéance", fmtDate(recu.dateFin)],
                  ["Prime", `${recu.primeAnnuelle.toLocaleString("fr-FR")} FCFA`],
                  ["Statut", recu.statut],
                ] as [string, string][]).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-semibold text-right capitalize" style={{ color: MARINE }}>{v}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="text-[11px] text-gray-400 text-center mt-6">
            KARHON Assurances — Abidjan, Cocody / Angré · +225 07 87 10 39 39
          </p>
        </div>
      </div>
    </div>
  );
}
