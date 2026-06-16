"use client";

// Page /client/contrats/[id]/imprimer
// Affiche le contrat sous forme de « reçu » imprimable. Le bouton Imprimer
// déclenche la boîte d'impression du navigateur (→ imprimer ou enregistrer en PDF).
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Printer, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";

type Contrat = {
  id: string;
  numeroContrat: string;
  dateDebut: string;
  dateFin: string;
  dureeMois: number;
  primeAnnuelle: number;
  compagnie?: string | null;
  statut: string;
  options?: string[];
  produit?: { nom?: string; type?: string; garanties?: string[] };
  user?: { nom?: string; prenom?: string; email?: string; telephone?: string; adresse?: string | null };
};

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { timeZone: "Africa/Abidjan", day: "2-digit", month: "long", year: "numeric" }) : "—";

export default function ImprimerContrat() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [contrat, setContrat] = useState<Contrat | null>(null);
  const [erreur, setErreur] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contrats/${id}`)
      .then(async (res) => {
        if (res.status === 401) { router.push("/client"); return null; }
        if (!res.ok) { setErreur("Contrat introuvable ou accès refusé."); return null; }
        return res.json();
      })
      .then((data) => { if (data?.contrat) setContrat(data.contrat); })
      .catch(() => setErreur("Erreur de chargement."))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f8fbfb" }}>
        <Loader2 className="animate-spin" size={36} style={{ color: "#2a8a8a" }} />
      </div>
    );
  }

  if (erreur || !contrat) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4" style={{ backgroundColor: "#f8fbfb" }}>
        <p className="text-gray-600">{erreur || "Contrat introuvable."}</p>
        <button onClick={() => router.push("/client/dashboard")} className="px-5 py-2.5 rounded-xl font-semibold text-sm text-white" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
          Retour à mon espace
        </button>
      </div>
    );
  }

  const lignes: [string, string][] = [
    ["N° de contrat", contrat.numeroContrat],
    ["Produit", contrat.produit?.nom ?? "—"],
    ["Compagnie", contrat.compagnie ?? "—"],
    ["Durée souscrite", `${contrat.dureeMois} mois`],
    ["Date de début", fmtDate(contrat.dateDebut)],
    ["Date d'échéance", fmtDate(contrat.dateFin)],
    ["Prime", `${contrat.primeAnnuelle.toLocaleString("fr-FR")} FCFA`],
  ];

  return (
    <div className="min-h-screen pt-28 pb-10 px-4 print:pt-0" style={{ backgroundColor: "#eef3f3" }}>
      {/* Barre d'actions (cachée à l'impression) */}
      <div className="max-w-2xl mx-auto mb-5 flex items-center justify-between print:hidden">
        <button onClick={() => router.push("/client/dashboard")} className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: "#1a2e5a" }}>
          <ArrowLeft size={17} /> Retour
        </button>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white shadow-lg transition-all hover:scale-105" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)" }}>
          <Printer size={17} /> Imprimer / Enregistrer en PDF
        </button>
      </div>

      {/* Le reçu */}
      <div id="recu" className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden print:shadow-none print:rounded-none">
        {/* En-tête */}
        <div className="px-8 py-7 text-white" style={{ background: "linear-gradient(135deg, #1a2e5a, #2a8a8a)", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo/karhon-blanc.svg" alt="KARHON Assurances" className="h-11 w-auto" />
              <div>
                <h1 className="text-xl font-bold leading-tight">KARHON Assurances</h1>
                <p className="text-xs text-white/70">Cabinet de courtage — Abidjan</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/70 uppercase tracking-wide">Reçu</p>
              <p className="font-bold">de souscription</p>
            </div>
          </div>
        </div>

        {/* Statut */}
        <div className="px-8 pt-6">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full" style={{ background: "#dcfce7", color: "#166534" }}>
            <CheckCircle2 size={13} /> Souscription active
          </span>
        </div>

        {/* Souscripteur */}
        <div className="px-8 pt-5">
          <p className="text-xs uppercase tracking-wide font-semibold mb-1" style={{ color: "#2a8a8a" }}>Souscripteur</p>
          <p className="font-semibold" style={{ color: "#1a2e5a" }}>{contrat.user?.prenom} {contrat.user?.nom}</p>
          <p className="text-sm text-gray-500">{contrat.user?.email}{contrat.user?.telephone ? ` · ${contrat.user.telephone}` : ""}</p>
          {contrat.user?.adresse && <p className="text-sm text-gray-500">{contrat.user.adresse}</p>}
        </div>

        {/* Détails */}
        <div className="px-8 py-6">
          <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: "#2a8a8a" }}>Détails de la souscription</p>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: "#e0ecec" }}>
            {lignes.map(([k, v], i) => (
              <div key={k} className="flex items-center justify-between px-4 py-3 text-sm" style={{ background: i % 2 ? "#f8fbfb" : "#fff" }}>
                <span className="text-gray-500">{k}</span>
                <span className="font-semibold text-right" style={{ color: "#1a2e5a" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Garanties */}
          {contrat.produit?.garanties && contrat.produit.garanties.length > 0 && (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-wide font-semibold mb-2" style={{ color: "#2a8a8a" }}>Garanties incluses</p>
              <div className="flex flex-wrap gap-2">
                {contrat.produit.garanties.map((g) => (
                  <span key={g} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#f0f7f7", color: "#1a2e5a" }}>{g}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Signature */}
        <div className="px-8 pb-6 flex items-end justify-between gap-6">
          <div className="text-xs text-gray-400 max-w-[60%]">
            <p>Document généré le {new Date().toLocaleDateString("fr-FR", { timeZone: "Africa/Abidjan" })}.</p>
            <p>
              Ce reçu atteste de votre souscription via KARHON Assurances, courtier.
              Le contrat est établi par la compagnie partenaire{contrat.compagnie ? ` ${contrat.compagnie}` : ""}.
            </p>
          </div>
          <div className="text-center">
            <div className="w-36 border-b border-gray-300 mb-1" />
            <p className="text-xs text-gray-400">Cachet et signature</p>
          </div>
        </div>

        {/* Pied de page */}
        <div className="px-8 py-4 text-center" style={{ background: "#f5fbfb" }}>
          <p className="text-xs text-gray-500">
            Abidjan, Cocody — Angré 8ème Tranche (BP V 236) · +225 07 87 10 39 39 · +225 05 76 36 72 72 · infos@karhonassurance.com
          </p>
        </div>
      </div>
    </div>
  );
}
