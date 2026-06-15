// Route GET /api/stats
//   Tableau de bord du back-office (réservé au personnel KARHON).
//   Calcule côté serveur : indicateurs clés + série trimestrielle pour le graphe.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { exigerStaff } from "@/lib/session";

// Étiquette de trimestre à partir d'une date : ex. "T2 2026".
function labelTrimestre(d: Date): string {
  return `T${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
}

// Construit les 6 derniers trimestres (du plus ancien au plus récent).
function derniersTrimestres(n: number): { label: string; cle: string }[] {
  const out: { label: string; cle: string }[] = [];
  const maintenant = new Date();
  let annee = maintenant.getFullYear();
  let trim = Math.floor(maintenant.getMonth() / 3); // 0..3
  for (let i = 0; i < n; i++) {
    out.unshift({ label: `T${trim + 1} ${annee}`, cle: `${annee}-${trim}` });
    trim -= 1;
    if (trim < 0) { trim = 3; annee -= 1; }
  }
  return out;
}

const cleDe = (iso: Date) => `${iso.getFullYear()}-${Math.floor(iso.getMonth() / 3)}`;

export async function GET() {
  const auth = await exigerStaff();
  if (auth instanceof NextResponse) return auth;

  try {
    // Données minimales nécessaires (sélection légère).
    const [clients, devis, contrats, sinistres] = await Promise.all([
      prisma.user.findMany({ where: { role: "client" }, select: { dateInscription: true } }),
      prisma.devis.findMany({ where: { supprime: false }, select: { statut: true, dateCreation: true } }),
      prisma.contrat.findMany({ where: { supprime: false }, select: { statut: true, dateDebut: true, dateFin: true } }),
      prisma.sinistre.findMany({ where: { supprime: false }, select: { statut: true, dateDeclaration: true } }),
    ]);

    // ── Indicateurs clés ──────────────────────────────────────
    const devisParStatut: Record<string, number> = {};
    for (const d of devis) devisParStatut[d.statut] = (devisParStatut[d.statut] ?? 0) + 1;

    const contratsActifs = contrats.filter((c) => c.statut === "actif").length;
    const echeancesProches = contrats.filter((c) => {
      if (c.statut !== "actif") return false;
      const jours = (new Date(c.dateFin).getTime() - Date.now()) / 86_400_000;
      return jours > 0 && jours <= 90;
    }).length;

    const sinistresEnCours = sinistres.filter((s) => s.statut === "declare" || s.statut === "en_cours").length;

    // Taux de conversion : souscriptions ÷ devis (en %).
    const tauxConversion = devis.length > 0 ? Math.round((contrats.length / devis.length) * 100) : 0;

    // ── Série trimestrielle (graphe d'évolution) ──────────────
    const trims = derniersTrimestres(6);
    const init = () => Object.fromEntries(trims.map((t) => [t.cle, 0])) as Record<string, number>;
    const sClients = init(), sDevis = init(), sContrats = init(), sSinistres = init();

    for (const u of clients) { const k = cleDe(new Date(u.dateInscription)); if (k in sClients) sClients[k]++; }
    for (const d of devis) { const k = cleDe(new Date(d.dateCreation)); if (k in sDevis) sDevis[k]++; }
    for (const c of contrats) { const k = cleDe(new Date(c.dateDebut)); if (k in sContrats) sContrats[k]++; }
    for (const s of sinistres) { const k = cleDe(new Date(s.dateDeclaration)); if (k in sSinistres) sSinistres[k]++; }

    const trimestres = trims.map((t) => ({
      label: t.label,
      clients: sClients[t.cle],
      devis: sDevis[t.cle],
      souscriptions: sContrats[t.cle],
      sinistres: sSinistres[t.cle],
    }));

    return NextResponse.json({
      clients: clients.length,
      devisTotal: devis.length,
      devisParStatut,
      contratsActifs,
      echeancesProches,
      sinistresTotal: sinistres.length,
      sinistresEnCours,
      tauxConversion,
      trimestres,
    });
  } catch (e) {
    console.error("[stats GET]", e);
    return NextResponse.json({ erreur: "Erreur serveur." }, { status: 500 });
  }
}
