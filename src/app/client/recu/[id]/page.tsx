"use client";
// Reçu de souscription — vue à l'écran + impression / téléchargement PDF
// (via l'impression du navigateur). Affiche le logo KARHON et, si disponible,
// le logo de la compagnie retenue.
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

const MARINE = "#1a2e5a";
const TEAL = "#2a8a8a";

// Correspondance nom de compagnie → fichier logo (dans /public/images/logo).
const LOGOS_COMPAGNIE: Record<string, string> = {
  "NSIA Assurances": "/images/logo/NSIA.png",
  "SUNU Assurances": "/images/logo/SUNU.png",
  "Sanlam Allianz": "/images/logo/SANLAM.png",
  "SIM Assurances": "/images/logo/SIM.png",
  "Activa Assurances": "/images/logo/ACTIVA.png",
  "AFG Assurances": "/images/logo/AFG.jpg",
  "WAFA Assurance": "/images/logo/WAFA.jpg",
  "Leadway Assurance": "/images/logo/leadway.webp",
  "GNA Assurances": "/images/logo/GNA.jpg",
  "Vitalis": "/images/logo/VITALIS.png",
};

type Contrat = {
  id: string;
  numeroContrat: string;
  dateDebut: string;
  dateFin: string;
  dureeMois: number;
  primeAnnuelle: number;
  compagnie?: string | null;
  segment?: string | null;
  statut: string;
  produit?: { nom?: string };
};
type Client = { nom?: string; prenom?: string; email?: string; telephone?: string };

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "long", year: "numeric" }) : "—";

export default function RecuPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contrat, setContrat] = useState<Contrat | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let annule = false;
    Promise.all([
      fetch("/api/contrats").then((r) => (r.ok ? r.json() : { contrats: [] })),
      fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([dC, dMe]) => {
        if (annule) return;
        const c = (dC.contrats as Contrat[] | undefined)?.find((x) => x.id === id) ?? null;
        setContrat(c);
        setClient(dMe?.utilisateur ?? null);
      })
      .finally(() => { if (!annule) setChargement(false); });
    return () => { annule = true; };
  }, [id]);

  if (chargement) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f4f8f8" }}>
        <Loader2 className="animate-spin" size={28} style={{ color: TEAL }} />
      </div>
    );
  }

  if (!contrat) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center" style={{ background: "#f4f8f8" }}>
        <p className="font-semibold" style={{ color: MARINE }}>Reçu introuvable.</p>
        <button onClick={() => router.push("/client/dashboard")} className="text-sm font-semibold" style={{ color: TEAL }}>Retour à mon espace</button>
      </div>
    );
  }

  const logoCompagnie = contrat.compagnie ? LOGOS_COMPAGNIE[contrat.compagnie] : undefined;
  const segment = contrat.segment === "professionnel" ? "Professionnel — flotte" : contrat.segment === "transport" ? "Transport professionnel" : "Particulier";

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: "#f4f8f8" }}>
      {/* Barre d'actions (masquée à l'impression) */}
      <div className="max-w-2xl mx-auto mb-5 flex items-center justify-between no-print">
        <button onClick={() => router.push("/client/dashboard")} className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: MARINE }}>
          <ArrowLeft size={16} /> Mon espace
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-lg" style={{ background: `linear-gradient(135deg, ${TEAL}, ${MARINE})` }}>
          <Printer size={16} /> Imprimer / Télécharger en PDF
        </button>
      </div>

      {/* Le reçu */}
      <div id="recu" className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
        <div className="px-8 py-6 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${MARINE}, ${TEAL})` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo/karhon-blanc.svg" alt="KARHON Assurances" className="h-10" />
          <div className="text-right text-white">
            <p className="text-xs uppercase tracking-widest text-white/70">Reçu de souscription</p>
            <p className="font-bold">N° {contrat.numeroContrat}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center gap-2 text-sm" style={{ color: "#166534" }}>
            <ShieldCheck size={18} /> <span className="font-semibold">Souscription confirmée</span>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Assuré(e)</p>
            <p className="font-semibold" style={{ color: MARINE }}>{client?.prenom} {client?.nom}</p>
            {client?.email && <p className="text-sm text-gray-500">{client.email}</p>}
            {client?.telephone && <p className="text-sm text-gray-500">{client.telephone}</p>}
          </div>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3 rounded-2xl p-5" style={{ background: "#f8fbfb", border: "1px solid #eef4f4" }}>
            {([
              ["Produit", contrat.produit?.nom ?? "—"],
              ["Catégorie", segment],
              ["Compagnie", contrat.compagnie || "—"],
              ["N° de contrat", contrat.numeroContrat],
              ["Date d'effet", fmtDate(contrat.dateDebut)],
              ["Échéance", fmtDate(contrat.dateFin)],
              ["Durée", `${contrat.dureeMois} mois`],
              ["Prime", `${contrat.primeAnnuelle.toLocaleString("fr-FR")} FCFA`],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-400">{k}</span>
                <span className="font-semibold text-right" style={{ color: MARINE }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Compagnie retenue + logo */}
          {contrat.compagnie && (
            <div className="flex items-center gap-3 rounded-2xl p-4" style={{ background: "#fbfdfd", border: "1px solid #e6f0f0" }}>
              {logoCompagnie ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoCompagnie} alt={contrat.compagnie} className="h-9 w-24 object-contain" />
              ) : (
                <span className="font-bold" style={{ color: MARINE }}>{contrat.compagnie}</span>
              )}
              <p className="text-xs text-gray-500">Contrat conclu avec {contrat.compagnie}, partenaire de KARHON Assurances.</p>
            </div>
          )}

          <p className="text-xs text-gray-400 leading-relaxed border-t pt-4" style={{ borderColor: "#eef4f4" }}>
            Ce reçu atteste de votre souscription auprès de KARHON Assurances, cabinet de courtage à Abidjan (Cocody / Angré).
            Il confirme l&apos;enregistrement de votre contrat et le règlement de votre prime. Conservez-le précieusement.
          </p>
          <p className="text-xs font-semibold" style={{ color: MARINE }}>KARHON Assurances — Abidjan · +225 07 87 10 39 39</p>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          #recu { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  );
}
